var Discogs = {
	api: "http://api.discogs.com/",
	found: [],
	artist: null,
	artistUrl: null,
	
	findArtist: function(q) {
		this.found = [];
		this.artist = q;
		this.artistUrl = null;
		q = encodeURIComponent(q);
		$('.dc-albums').empty().addClass('load4');
		$.get('dc.php?q='+q, Discogs.onFindArtist);
	},

	onFindArtist: function(html) {
		var cards = $(html).find('div.card');
		if (empty(cards)) {
			$('.dc-albums').removeClass('load4');
			return;
		}
		var id = null;
		var next = null;
		var first = $(html).find('div.card').eq(0).data('object-id');
		cards.each(function(k,v){
			var img = $(v).find('.card_image img').attr('src');
			var txt = $(v).find('.card_body h4 a').text();
			if (txt.lc().indexOf(Discogs.artist.lc()) > -1) {
				if (img !== "http://s.pixogs.com/images/default-artist.png") {
					id = $(v).data('object-id');
					return false;     
				} else {
					next = $(v).data('object-id');
				}
			}
		});
		
		if (!defined(id)) {
			var id = defined(next) ? next : first;    
		}

		$.getJSON(Discogs.api+'artists/'+id+'/releases?per_page=100&callback=?', Discogs.onGetReleases);
		
	},


	
	onGetReleases: function(e) {
		var s = Discogs;
		s.found = [];
		var results = "<div class='album' data-title='Top Tracks' data-id='0'>Top Tracks</div>";
		var data = e.data;

		data.releases.reverse();
		$(data.releases).each(function(){
			if (this.role === "Main") {
				if (s.found.indexOf(this.title) > -1) {
					return true;
				}
				s.found.push(this.title);
				if (typeof this.year === undefined) {
					this.year = "";
				}
				var str = "<div class='album' data-title='"+this.title+
						"' data-url='"+this.resource_url+"' data-id='"+this.id+
						"' data-year='"+this.year+"'>"+this.title+" ("+this.year+")</div>";                
				results += str;
			}            
		});
		
		$('#artist-overview .dc-albums').append($(results).sort(Discogs.sortYear));
		$('#artist-overview .dc-albums .album').click(function(){
			$('.dc-albums .album.selected').removeClass('selected');
			$(this).addClass('selected');
			$('.col2 .head.alb').eq(0).text($(this).data('title'));
			$('.dc-tracks').html('');
			if ($(this).data('id')=='0') {
				if (Artist_Overview.mbid == "") {
				    LastFm.getTracks(null, Artist_Overview.artist);
				} else {
				    LastFm.getTracks(Artist_Overview.mbid);
				}
			} else {
				var url = $(this).data('url');
				Discogs.getTracks(url);	
			}
			
		});
		$('.dc-albums').removeClass('load4');
	},

	getTracks: function(url){
		$.getJSON(url+'?callback=?', Discogs.onGetTracks);    
	},

	onGetTracks: function(e) {
		var results = '';
		var data = e.data;
		$(data.tracklist).each(function(){
			results += '<div class="track" data-artist="'+ Discogs.artist +'" data-title="'+ cap(this.title) +'">'+ cap(this.title)+"<i>"+ this.duration +"</i></div>";
		});
		$('.dc-tracks').append(results);
		Artist_Overview.initTracks();
	},
	
	sortYear: function(a,b) {  
		return $(a).data('year') < $(b).data('year') ? 1 : -1;  
	}  
   
}