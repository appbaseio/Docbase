(function($) {
	$.fn.searchAppbase = function(searchIndexUrl) {
		var $search = this;
		$search.addClass('appbase-search');

		function searchTag(data) {
			var result_a = $('<a>').addClass('result_record_a').attr('href', data.link).text(data.title);
			var result_div = $('<div>').addClass('result_record').append(result_a);
			return result_div;
		}
		var fail = function(e) {
			console.error("Your search index wasn't loaded, please check the following error", e);
		};
		var success = function(searchData) {
			searchData.forEach(function(searchSingle) {
				searchSingle.content = searchSingle.content.replace(/<\/?[^>]+(>|$)/g, " ");
			});

			var posts = new Bloodhound({
				datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title', 'content'),
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				local: searchData
			});

			$search.typeahead({
				minLength: 1
			}, {
				name: 'titles',
				displayKey: 'title',
				source: posts,
				templates: {
					pending: true,
					suggestion: function(data) {
						if (data) {
							var single_record = searchTag(data);
							return single_record;
						} else
							return;
					}
				}
			});

			$search.bind('typeahead:select', function(ev, suggestion) {
				window.location.href = suggestion.link;
			});
			$search.bind('typeahead:open', function(ev, suggestion) {
				$search.parents('.search-form').addClass('open');
			});
			$search.bind('typeahead:close', function(ev, suggestion) {
				$search.parents('.search-form').removeClass('open');
			});
		};

		//Fetch search index json data
		var intializeCall = function() {
			$.get(searchIndexUrl)
				.then(success)
				.fail(fail);
		};

		//Load typeahead.js
		var Loader = function() {};
		Loader.prototype = {
			require: function(scripts, callback) {
				this.loadCount = 0;
				this.totalRequired = scripts.length;
				this.callback = callback;

				for (var i = 0; i < scripts.length; i++) {
					var split_name = scripts[i].split('.');
					if (split_name[split_name.length - 1] == 'js')
						this.writeScript(scripts[i]);
					if (split_name[split_name.length - 1] == 'css')
						this.writeStylesheet(scripts[i]);
				}
			},
			loaded: function(evt) {
				this.loadCount++;

				if (this.loadCount == this.totalRequired && typeof this.callback == 'function') this.callback.call();
			},
			writeScript: function(src) {
				var self = this;
				var s = document.createElement('script');
				s.type = "text/javascript";
				s.async = true;
				s.src = src;
				s.addEventListener('load', function(e) {
					self.loaded(e);
				}, false);
				var head = document.getElementsByTagName('head')[0];
				head.appendChild(s);
			},
			writeStylesheet: function(src) {
				var self = this;
				var s = document.createElement('link');
				s.type = "text/css";
				s.rel = "stylesheet";
				s.href = src;
				s.addEventListener('load', function(e) {
					self.loaded(e);
				}, false);
				var head = document.getElementsByTagName('head')[0];
				head.appendChild(s);
			}
		};

		var jquery_js = new Loader();
		jquery_js.require([
				"http://twitter.github.io/typeahead.js/releases/latest/typeahead.bundle.js"
			],
			function() {
				intializeCall();
			});

	};
}(jQuery));