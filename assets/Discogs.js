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
        $.getJSON(this.api+'database/search?type=artist&q='+q+'&callback=?', Discogs.onFindArtist);    
    },

    onFindArtist: function(e) {

        var data = e.data;
        $(data.results).each(function(){
            if (lc(this.title).indexOf(lc(Discogs.artist))>-1  &&   this.thumb !== "") {
                Discogs.artistUrl = this.resource_url;
                return false;
            }
        });
        if (Discogs.artistUrl !== null) {
            $.getJSON(Discogs.artistUrl+'/releases?per_page=100&callback=?', Discogs.onGetReleases);    
        } else {
            $.getJSON(data.results[0].resource_url+'/releases?per_page=100&callback=?', Discogs.onGetReleases);    
        }
    },


    
    onGetReleases: function(e) {
        var results = '';
		var data = e.data;
        data.releases.reverse();
        $(data.releases).each(function(){
            if (this.role === "Main") {
                if (typeof this.year === undefined) {
                    this.year = "";
                }
                results += "<div class='album' data-title='"+this.title+"' data-url='"+this.resource_url+"' data-id='"+this.id+"' data-year='"+this.year+"'>"+this.title+" ("+this.year+")</div>";                
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
    
    sortAlpha: function(a,b) {  
        return $(a).data('year') > $(b).data('year') ? 1 : -1;  
    }  
   
}