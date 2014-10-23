var LastFm = {
	query: null,
	artist: null,
	title: null,
	api: '//ws.audioscrobbler.com/2.0/?api_key=7f0ae344d4754c175067118a5975ab15&format=json&',
	
	found: [],
	
	getArtists: function(q){
		$.getJSON(this.api+'method=artist.search&artist='+ q.enc() +'&callback=?', LastFm.onGetArtists);	
	},

	findArtists: function(q) {
        $('#artist-overview .artist-similar').empty();
        $.getJSON(this.api+'method=artist.search&artist='+ q.enc() +'&callback=?', LastFm.onFindArtists);    
    },  

    onFindArtists: function(e) {
        $('#artist-overview .artist-similar').empty();
        var result = '';
        $(e.results.artistmatches.artist).each(function(){
            if (defined(this.image) && !empty(this.image[4]['#text'])) {
                var img = this.image[4]['#text'];
            } else {
                var img = img2 = 'http://i.imgur.com/1jdKzpw.png';
            }
            result += '<div class="similar" data-mbid="'+ this.mbid +'" data-artist="'+ this.name +'" style="background-image: url('+ img +')"><div class="name">'+ this.name +'</div></div>';
        });
        $('#artist-overview .artist-similar').append(result);
        Artist_Overview.initSimilar(false);
    },

	
	onGetArtists: function(e) {
        if (!defined(e.results.artistmatches.artist) || empty(e.results.artistmatches.artist)) {
            setTimeout(function(){
                $('#home input').css({borderColor:'red'});
                goToView('artist-search','home');
            },1000);            
            return;
        }
		var i = 0;
		var result = '';
		$(e.results.artistmatches.artist).each(function(){
			if (++i > 12) return false;
            if (defined(this.image) && !empty(this.image[4]['#text'])) {
                var img = this.image[4]['#text'];
            } else {
                var img = img2 = 'http://i.imgur.com/1jdKzpw.png';
            }
			var name = this.name;
			var url = this.url;
			result += '<div class="artist" data-mbid="'+this.mbid+'" data-artist="'+name+'" data-img="'+img+'" style="background-image: url('+img+')"><div class="info">'+name+'</div></div>';
		});
			$('#artist-search').html(result);
			Artist_Search.init();
	},
	
	getTracks: function(mbid, artist) {  
        LastFm.artist = artist;
	    if (mbid == null) {
	        $.getJSON(this.api+'method=artist.gettoptracks&artist='+ artist.enc() +'&autocorrect=1&limit=50&callback=?', LastFm.onGetTracks);
	    } else {
	        $.getJSON(this.api+'method=artist.gettoptracks&mbid='+ mbid +'&limit=50&callback=?', LastFm.onGetTracks);    
	    }
         
    },
    
    onGetTracks: function(e) {
        LastFm.found = [];
        var result = ''; //'<div class="head">'+ e.toptracks['@attr'].artist +' Tracks</div>';
        $(e.toptracks.track).each(function(){
            var title = LastFm.cleanTrackName(this.name);
            if (!in_array(title, LastFm.found)) {
                result += "<div class='track' data-artist='"+ this.artist.name +"' data-title='"+ title +"'>"+ cap(title) +"<i>"+ this.playcount +"</i></div>";       
                LastFm.found.push(title);
            }           
        });
        if (LastFm.found.length === 0) {
            $.get('lf.php?q='+LastFm.artist.enc(), LastFm.onGetCharts);
        } else {
            $('#artist-overview .artist-tracks').html(result);
            Artist_Overview.initTracks();    
        }
        
    },

    onGetCharts: function(html) {
        LastFm.found = [];
        var result = '';
        var div = $(html).find('div.module-body.chart.current');
        div.find('table tr').each(function(k,v){
            var title = LastFm.cleanTrackName($(v).find('td.subjectCell a').text());
            if (!in_array(title, LastFm.found)) {
                result += "<div class='track' data-artist='"+ LastFm.artist +"' data-title='"+ title +"'>"+ cap(title) +"</div>";       
                LastFm.found.push(title);
            } 
        });
        if (LastFm.found.length > 0) {
            $('#artist-overview .artist-tracks').html(result);
        }
    },
    
    
    getSimilar: function(mbid, artist) {
        if (mbid == null) {
            $.getJSON(this.api+'method=artist.getsimilar&artist='+ artist.enc() +'&autocorrect=1&callback=?', LastFm.onGetSimilar);
        } else {
            $.getJSON(this.api+'method=artist.getsimilar&mbid='+ mbid +'&callback=?', LastFm.onGetSimilar);
        }
         
    },
    
    onGetSimilar: function(e) {
        var result = '';
         $('#artist-overview .artist-similar').empty();
        $(e.similarartists.artist).each(function(){
            if (typeof this.image != 'undefined') {
                var img = this.image[2]['#text'];
            } else {
                var img = '';
            }
            result += '<div class="similar" data-mbid="'+ this.mbid +'" data-artist="'+ this.name +'" style="background-image: url('+ img +')"><div class="name">'+ this.name +'</div></div>';
        });
        $('#artist-overview .artist-similar').append(result);
        Artist_Overview.initSimilar();   
    },
    
	cleanTrackName: function(str) {
        str = trimBrackets(str);
        str = str.replace(/(remix|mix|rmx|edit).*/gi,''); // remove (this), 1 word before and everything after
        str = str.replace(/( feat| ft\.| vocals by| vip).*/gi,''); // remove (this) and everything after
        str = str.replace(/(full version|remix|remi| mix|rmx| edit)/gi,''); //remove (this)
        str = str.replace(/(mp3|wav|flac|ogg)/gi,'');
        str = str.replace(/^(A1 |B1 |C1 |D1 |E1 |F1 |G1 |A2 |B2 |C2 |D2 |E2 |F2 )/gi,'');
        return cleanName(str);
	}
	

}
