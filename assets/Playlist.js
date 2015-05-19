List = {

	data: {},

	add: function(tr) {
		var ul = $('.playlist .list:visible');
		var i = ul.find('.track').size() + 1;
		ul.append('<div class="track track'+i+'">'+$(tr).data('title')+'</div>');
		var t = ul.find('.track'+i);
		t.data('artist',$(tr).data('artist'));
		t.data('title',$(tr).data('title'));
		List.export();
	},

	export: function(){
		$('.playlist li').each(function(k,li){
			var title = $(li).find('h3').text();
			List.data[title] = [];
			$(li).find('.track').each(function(k,tr){
				List.data[title].push({
					artist: $(tr).data('artist'),
					title: $(tr).data('title')
				});
			});
		});
		List.save();
	},

	import: function(){
		if (!defined(List.data)||empty(List.data)||Object.keys(List.data).length===0) return;
		$('.playlist #accordian').html('<ul/>');
		var ul = $('.playlist ul');
		var i = 0;
		$.each(List.data, function(k,l){
			var j = 0;
			i++;
			ul.append('<li><h3>'+k+'</h3><ul class="list list'+i+'"></ul></li>');
			$.each(List.data[k], function(m,tr){
				j++;
				ul.find('ul.list'+i).append('<div class="track track'+j+'">'+tr.title+'</div>');
				var t = ul.find('ul.list'+i).find('.track'+j);
				t.data('artist',tr.artist);
				t.data('title',tr.title);
			});
		});
	},


	save: function(){
		localStorage.setItem('muziq.lists', JSON.stringify(List.data));
	},

	load: function(){
		List.data = JSON.parse(localStorage.getItem('muziq.lists')) || {};
	}


}