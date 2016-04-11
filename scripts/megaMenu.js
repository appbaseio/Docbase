(function($) {
	$.fn.megaMenu = function() {
		$('.folder-li li.dropdown').show(0);
		$('.category-li').hide();
		var width_array = [];
		var current_folder_width = $('.folder-li').width();
		$('.folder-li li.dropdown').each(function(key, val) {
			width_array.push($(val).outerWidth());
		});

		function menu_set() {
			var default_width = 150;
			var total_width = $(window).width();
			var logo_width = $('.navbar-header').width();
			var other_nav_width = $('#other-navs').width();
			var search_form_width = $('.search-form').width();
			var category_width = $('.category-li').width();
			var rest_width = total_width - (logo_width + other_nav_width + search_form_width);
			var folder_width = rest_width - category_width;
			var available_folder = 0;
			if (current_folder_width > folder_width) {
				var temp_folder_total = 0;
				var stopFlag = false;
				available_folder = 0;
				width_array.forEach(function(width, k) {
					if (!stopFlag) {
						temp_folder_total += width;
						if (temp_folder_total >= folder_width) {
							available_folder = k - 1;
							stopFlag = true;
						}
					}
				});
				//available_folder = Math.floor(folder_width/default_width);
				$('.folder-li li.dropdown').each(function(key, val) {
					if (key <= available_folder) {
						$(val).show();
					} else {
						$(val).hide();
					}
				});
				$('.category-li').show();
				$('.megamenu .megamenu-item').each(function(key, val) {
					if (key <= available_folder) {
						$(val).hide();
					} else {
						$(val).show();
					}
				});

			} else {
				$('.folder-li li.dropdown').show();
				$('.category-li').hide();
			}
			if(total_width < 768) {
				adjust_searchbar();
			}
			footer_at_bottom();
		}

		function adjust_searchbar() {
			var total_width = $(window).width();
			var search_width = 300;
			var right_margin = parseInt((total_width - search_width)/2);
			$('.search-form').css('right', right_margin+'px');
		}

		function footer_at_bottom() {
			var content_height = $(window).height() - $('.navbar').height() - $('.powered-by').height() - 30;
			$('.docbase-main').css({'min-height': content_height+'px'});
		}

		menu_set();
		$(window).resize(menu_set);
	};
}(jQuery));