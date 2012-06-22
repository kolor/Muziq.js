var Discogs = {
    api: "http://api.discogs.com/",
    found: [],
    
    getArtistReleases: function(q) {
        this.found = [];
        q = encodeURIComponent(q);
        $.getJSON(this.api+'database/search?per_page=100&callback=?', {type:'release', artist:q}, Discogs.onGetArtistReleases);
    },
    
    onGetArtistReleases: function(e) {
        var results = '';
        $(e.data.results).each(function(){
            if (!in_array(this.catno, Discogs.found)) {
                results += '<div class="release">'+ this.catno.toUpperCase() + '</div>';
                Discogs.found.push(this.catno);    
            }
            
        });
        
        $('#artist-overview .artist-releases').append($(results).sort(Discogs.sortAlpha));
    },
    
    sortAlpha: function(a,b) {  
        return $(a).text() > $(b).text() ? 1 : -1;  
    }  
   
}