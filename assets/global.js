var auth = false;

$(function(){

	setup_playlist();
	
	$('#home .button').click(function(){
		var q = $('#home input').val();
		if (q != '') {
			Artist_Search.find(q);
			goToView('home','artist-search');
		}
	});


	$('#home input, #home .button').hover(function(e){
		$('#home .button').animate({opacity: 0.9},600);
	}, function(){
		$('#home .button').css({opacity: 0.4});
	});

	player = new CirclePlayer("#jquery_jplayer_1", {
		mp3: "",
	}, {
		cssSelectorAncestor: "#cp_container_1",
		supplied: "mp3"
	});

	$(player.player).bind($.jPlayer.event.progress, function(event) { 
		if (event.jPlayer.status.seekPercent === 100) {
			$('.tracks-sources .source.selected').addClass('loaded').find('.dl').css({opacity:0.4}).fadeIn();
		}
	});

	$('#home input').keyup(function(event){
		if (event.keyCode == '13') {
				var q = $('#home input').val();
			if (q != '') {
				Artist_Search.find(q);
			}
		}
	});

	$('.artist-find input').keyup(function(event){
		if (event.keyCode == '13') {
			var q = $(this).val();
			if (q != '') {
				Artist_Search.findArtist(q);
			}
		}
	})
	
	
	VK.init({apiId:1902594, nameTransportPath: '/xd_receiver.html', status: true});
	VK.Observer.subscribe('auth.login', function(response) {
		auth = true;
		console.log("login to vk: OK");
		VK.Api.call('audio.search', {q: 'spor', sort: 0, count: 10, offset: 0, v: 3, test_mode: 1}, function(r){
			if (defined(r.error)) {
				console.log(r.error);
				auth = false;
			}
			$('#home').fadeIn("slow");
		});
	});    

	setTimeout(function(){
		$('#home').fadeIn("slow");
	}, 2500);

});

function setup_playlist() {
	List.load();
	List.import();

	$("#accordian").on('click','h3',function(){
		$('#accordian h3').removeClass('open');
		$("#accordian ul ul").slideUp();
		if(!$(this).next().is(":visible")) {
			$(this).next().slideDown();
			$(this).addClass('open');
		}
	});
	$("#accordian").on('contextmenu',"h3",function(e){
		e.preventDefault();
		$(this).prop('contenteditable','true');
		$(this).focus();
		return false;
	});
	$('#accordian').on('keydown','h3',function(e){
		if(e.keyCode == 13) {
			$(this).prop('contenteditable','false');
			List.export();
			e.preventDefault();
		}
	});
	$('.dc-tracks').on('contextmenu','.track',function(e){
		e.preventDefault();
		List.add($(this));
		return false;
	});
	
	$('.playlist').on('contextmenu', '.track', function(e){
		$(this).remove();
		List.export();
		return false;
	});
	$('.playlist').dblclick(function(e){
		var tot = $(this).find('li').size();
		if (tot < 1) {
			$(this).find('#accordian > ul').empty().append('<li><h3>New Playlist</h3><ul class="list list1"></ul></li>');
		} else {
			$(this).find('#accordian > ul').append('<li><h3>New Playlist</h3><ul class="list list'+ (tot+1) +'"></ul></li>');
		}
	});
}


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
		if (auth === false) {
			VK.Auth.login(null, VK.access.AUDIO);    
		}
		goToView('home','artist-search');
		LastFm.getArtists(q);
	},

	findArtist: function(q) {
		if (auth === false) {
			VK.Auth.login(null, VK.access.AUDIO);    
		}
		LastFm.findArtists(q);  
	}
	
	
}


var Artist_Overview = {
	artist: null,
	img: null,
	mbid: null,
	
	init: function(mbid, artist){
		this.artist = artist;
		this.mbid = mbid;
		$('.artist-tracks').addClass('load6');
		if (mbid == "") {
			LastFm.getTracks(null, artist);
			LastFm.getSimilar(null, artist);
		} else {
			LastFm.getTracks(mbid);
			LastFm.getSimilar(mbid);    
		}
		Discogs.findArtist(artist);
		this.getReleases();
		$('.track').live('click', function(){
			$('.track.selected').removeClass('selected');
			$(this).addClass('selected').addClass('played');
			VKA.getFiles($(this));
		});		
	},
	
	initSimilar: function(self){
		if (self === false) {
			$('#artist-overview .artist-similar .similar').click(function(){
				Artist_Overview.img = $(this).css('background-image');
				Artist_Overview.init($(this).attr('data-mbid'), $(this).attr('data-artist'));
			});
		}  else {
			$('#artist-overview .artist-similar').prepend('<div class="similar" data-mbid="'+ this.mbid +'" data-artist="'+ this.artist + '" style="background-image: '+ this.img +'"><div class="name">'+ this.artist +'</div></div>');    
			$('#artist-overview .artist-similar .similar').click(function(){
				$('#artist-overview .artist-tracks').addClass('load6').empty();
				Artist_Overview.artist = $(this).attr('data-artist');
				var mbid = $(this).attr('data-mbid');
				Artist_Overview.getReleases();
				if (mbid == "") {
					LastFm.getTracks(null, $(this).attr('data-artist'));
				} else {
					LastFm.getTracks(mbid);
				}
				Discogs.findArtist($(this).attr('data-artist'));
			});
		}
		$('#artist-overview .artist-similar .similar').hover(function(){
			$(this).find('div').animate({top:0});
		}, function(){
			$(this).find('div').animate({top:-40});
		});
		$('#artist-overview .artist-similar').removeClass('load3');
		
	},
	
   initTrackSources: function() {
		$('.tracks-sources').removeClass('load3');
		$('.tracks-sources .source').click(function(e){

			player.setMedia({'mp3':$(this).attr('data-url')});
			player.play();
			$('.tracks-sources .source.selected').removeClass('selected');
			$(this).addClass('selected');
			//VK.getBitrate($(this).attr('data-duration'));
		});
		$('.tracks-sources .source a').click(function(e){
			e.stopPropagation();
		});
		$('.tracks-sources .source').eq(0).click();
   
		$('.tracks-sources .source').hover(function(e){
			$(this).find('div.dl').css({opacity: 0.4},600);
		}, function(){
			$(this).find('div.dl').css({opacity: 0});
		});
		$('.tracks-sources div.dl').hover(function(e){
			$(this).css({opacity: 1});
			e.stopPropagation();
		}, function(){
			$(this).css({opacity: 0.4});
		});

	},
	

	
	initTracks: function(){
		$('#artist-overview .artist-tracks').removeClass('load6');
	},
	
	getReleases: function(){
		
	}
	
	
}
