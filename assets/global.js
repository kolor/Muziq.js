$(function(){
    $('#home .button').click(function(){
        var q = $('#home input').val();
        if (q != '') {
            Artist_Search.find(q);
            goToView('home','artist-search');
        }
    });
    player = new CirclePlayer("#jquery_jplayer_1", {
        mp3: "http://airy.me/test.mp3",
    }, {
        cssSelectorAncestor: "#cp_container_1",
        supplied: "mp3"
    });
    $('#home input').keydown(function(event){
        if (event.keyCode == '13') {
                var q = $('#home input').val();
            if (q != '') {
                Artist_Search.find(q);
                goToView('home','artist-search');
            }
        }
    });
    
    VK.init({apiId:1902594, nameTransportPath: '/xd_receiver.html', status: true});
    VK.Observer.subscribe('auth.login', function(response) {
        auth = true;
        VK.Api.call('audio.search', {q: 'spor', sort: 0, count: 10, offset: 0, v: 3, test_mode: 1}, function(r){
            if (typeof r.error != 'undefined' && r.error.error_code == 7)   {

            }
        });
    });
        
    
});


var Artist_Search = {
	init: function(){
		$('#artist-search .artist').hover(function(){
			$(this).find('.info').animate({bottom:0});
		}, function(){
			$(this).find('.info').animate({bottom:-65});
		});	
		
		$('#artist-search .artist').click(function(){
		    Artist_Overview.img = $(this).css('background-image');
		    Artist_Overview.init($(this).attr('data-mbid'), $(this).attr('data-artist'));
		    goToView('artist-search','artist-overview');
		});
	},
	
	find: function(q) {
	    VK.Auth.login(null, VK.access.AUDIO);
	    LastFm.getArtists(q);
	}
	
	
}


var Artist_Overview = {
    artist: null,
    img: null,
    mbid: null,
    
    init: function(mbid, artist){
        this.artist = artist;
        this.mbid = mbid;
        $('.artist-similar').addClass('load4');
        $('.artist-tracks').addClass('load4');
        if (mbid == "") {
            LastFm.getTracks(null, artist);
            LastFm.getSimilar(null, artist);
        } else {
            LastFm.getTracks(mbid);
            LastFm.getSimilar(mbid);    
        }
        this.getReleases();
        $('.artist-tracks .track').live('click', function(){
            $('.artist-tracks .track.selected').removeClass('selected');
            $(this).addClass('selected');
            VKA.getFiles($(this));
        });

        
    },
    
    initSimilar: function(){
        $('#artist-overview .artist-similar').prepend('<div class="similar" data-mbid="'+ this.mbid +'" data-artist="'+ this.artist + '" style="background-image: '+ this.img +'"><div class="name">'+ this.artist +'</div></div>');
        $('#artist-overview .artist-similar .similar').hover(function(){
            $(this).find('div').animate({top:0});
        }, function(){
            $(this).find('div').animate({top:-40});
        });
        $('#artist-overview .artist-similar .similar').click(function(){
            $('#artist-overview .artist-tracks').addClass('load4').empty();
            Artist_Overview.artist = $(this).attr('data-artist');
            var mbid = $(this).attr('data-mbid');
            Artist_Overview.getReleases();
            if (mbid == "") {
                LastFm.getTracks(null, $(this).attr('data-artist'));
            } else {
                LastFm.getTracks(mbid);
                LastFm.getTags(mbid);
            }
        });
        $('#artist-overview .artist-similar').removeClass('load4');
        
    },
    
   initTrackSources: function() {
        $('.tracks-sources').removeClass('load3');
        $('.tracks-sources .source').click(function(){
            player.setMedia({'mp3':$(this).attr('data-url')});
            player.play();
            $('.tracks-sources .source.selected').removeClass('selected');
            $(this).addClass('selected');
            VK.getBitrate($(this).attr('data-duration'));
        });
        $('.tracks-sources .source').eq(0).click();
    },
    

    
    initTracks: function(){
        $('#artist-overview .artist-tracks').removeClass('load4');
    },
    
    getReleases: function(){
        
    }
    
    
}
