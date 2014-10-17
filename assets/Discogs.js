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
        //$.getJSON(this.api+'database/search?type=artist&q='+q+'&callback=?', Discogs.onFindArtist);    
        $.get('dc.php?q='+q, Discogs.onFindArtist);
    },

    onFindArtist: function(html) {
            //var id = $(html).find('div.card').eq(0).data('object-id');
        var id = null;
        $(html).find('div.card').each(function(k,v){
           var img = $(v).find('.card_image img').attr('src');
           var txt = $(v).find('.card_body h4 a').text();
           if (img !== "http://s.pixogs.com/images/default-artist.png") {
                if (txt.indexOf(Discogs.artist) > -1) {
                    id = $(v).data('object-id');
                    return false;
                }
           }
        })
        
        if (defined(id)) {
            $.getJSON(Discogs.api+'artists/'+id+'/releases?per_page=100&callback=?', Discogs.onGetReleases);
        } else {
            $('.dc-albums').removeClass('load4');
        }
    },


    
    onGetReleases: function(e) {
        var s = Discogs;
        var results = '';
		var data = e.data;
        s.found = [];
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
                if (this.title.length > 44) {
                   var str =  "<div class='album' data-title='"+this.title+
                    "' data-url='"+this.resource_url+"' data-id='"+this.id+
                    "' data-year='"+this.year+"'><marquee scrolldelay=200 direction=left behavior=alternate>"+
                    this.title+" ("+this.year+")</marquee></div>";                
                } else {
                    var str = "<div class='album' data-title='"+this.title+
                    "' data-url='"+this.resource_url+"' data-id='"+this.id+
                    "' data-year='"+this.year+"'>"+this.title+" ("+this.year+")</div>";                
                }
                results += str;
            }            
        });
        
        $('#artist-overview .dc-albums').append($(results).sort(Discogs.sortYear));
        $('#artist-overview .dc-albums .album').click(function(){
            $('.dc-albums .album.selected').removeClass('selected');
            $(this).addClass('selected');
            $('.col3 .head').eq(0).text($(this).data('title'));
            $('.dc-tracks').html('');
            var url = $(this).data('url');
            Discogs.getTracks(url);
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