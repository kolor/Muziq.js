VKA = {
	api: "http://api.vkontakte.ru/api.php?",
	artist: null,
	title: null,
	sources: [],
	durs: [],
	
	getFiles: function(t) {
		this.artist = t.attr('data-artist');
		this.title = t.attr('data-title'); 
		var q = this.artist+' '+this.title;
        VK.Api.call('audio.search', {q: q, sort: 2, count: 200, offset: 0}, VKA.onGetFiles);
	},
    	
	onGetFiles: function(data) {
		if (typeof data.error != 'undefined') {
			VKALogin();
			return;
		}
		$('.tracks-sources').empty();
		var total = data.response[0];
		var sort = new Array();
		VKA.sources = [];
		for (key in data.response) {
			var d = data.response[key];
			if (typeof(d.duration) == 'undefined') continue;
			if (typeof(d.title) == 'undefined') continue
			if (d.duration < 100 || d.duration > 900) continue;
			if (sort[d.duration] == null) {
				sort[d.duration] = 1;
				VKA.sources[d.duration] = [];
			} else {
				sort[d.duration]++;
			} 
			VKA.sources[d.duration].push({
				url: d.url,
				title: d.title,
				dur: d.duration
			});
		}
		var keys = arsort(sort, 'SORT_NUMERIC');
		
		var result = '';
		for(var j=0; j<Math.min(20,keys.length); j++) {
			var d = keys[j];
			var count = sort[d];
		    result += '<div class="source" data-title="'+VKA.sources[d][0].title+'"\
		     data-duration="'+VKA.sources[d][0].dur+'" data-url="'+VKA.sources[d][0].url+'">\
		     <div class="title">'+ VKA.mkTitle(VKA.sources[d][0].title)+'</div>\
		     <div class="time"> '+mkTime(VKA.sources[d][0].dur)+'</div>\
		     <div class="dl rt"><a title=Download target=_blank class="dragout" draggable="true" data-downloadurl="audio/mpeg:'+VKA.mkTitle(VKA.sources[d][0].title)+
		     		'.mp3:'+VKA.sources[d][0].url+'" download href="'+VKA.sources[d][0].url+
		     		'"><img src="assets/img/download.png"/></a></div></div>';
		    
		}	
		
		$('.tracks-sources').html(result);
		$('.dragout').dragout();
		Artist_Overview.initTrackSources();
		
	},
	
	getBitrate: function(dur){
		var result = '';
		var i = 0;
	    $(this.sources[dur]).each(function(){
			if (++i > 25) return false;
			var duration = mkTime(this.dur);   	
			result += '<div class="bitrate" data-duration="'+this.dur+'" data-url="'+this.url+'">'+mkTime(this.dur)+' @ ?? Mb</div></div>';
	    });
	   
	   $('.tracks-bitrate').html(result);
	   Artist_Overview.initTrackBitrate();
	},
	
	getBitrateInfo: function(el) {
		var loader = new air.URLLoader();
		loader.addEventListener(air.ProgressEvent.PROGRESS, onGetBitrateProgress);
		loader.load(new air.URLRequest($(el).attr('data-url')));
		function onGetBitrateProgress(e) {
			var d = el.attr('data-duration');
			var s = e.bytesTotal;
			var b = 8*(s/1024)/d;
			el.attr('data-bitrate',b).html(mkTime(d) +' @ '+ (e.bytesTotal/1048576).toFixed(1) +' Mb = '+ b.toFixed(1) +' kbps');
			loader.close();
		}        
	},
	
	mkTitle: function(q) {
		var r = /\(.*\)/gi;
		var s = q.match(r);
		if (s !== null) {
			return s[0].replace(/\(|\)/g,'');
		} else {
			return q;
		}
	},
	
	cleanArgs: function(q) {	
		q = encodeURIComponent(q);
		return q;
	}
	
	
}

