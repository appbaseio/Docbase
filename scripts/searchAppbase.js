(function($) {
	$.fn.searchAppbase = function(searchIndexUrl, htmlMode) {
		
		//Create the search input element and insert it into html
		var $search = $('<input>').attr({
			'class':"search_field form-control dropdown-toggle",
			'type':'text',
			'placeholder':'search'
		});
		$(this).html($search);
		$search.addClass('appbase-search');

		function searchTag(data) {
			var singleId = data.singleId;
			var sectionId = singleId.substring(singleId.indexOf('"')+1, singleId.lastIndexOf('"'));
			var filesplit = data.link.split('/');
			var fileName = htmlMode ? filesplit[filesplit.length - 1].replace('.html','') : filesplit[filesplit.length - 2];
			var link_part =  data.link.split('/');
			data.version = link_part.length > 1 ? '<span class="result_record_version">'+link_part[1]+'</span>' : null;
			data.folder = link_part.length > 2 ? '<span class="result_record_folder">'+fileName+'</span>' : null;
			var	result_info = link_part.length > 1 ? $("<div>").addClass('result_record_info').append(data.folder).append(data.version) : null;	
			var result_a = $('<a>').addClass('result_record_a pointer').attr({'link':data.link, 'sectionId':sectionId, 'spaLink': data.spaLink}).text(data.title).append(result_info);
			var result_div = $('<div>').addClass('result_record').append(result_a);
			result_a.on('click',function(){
				gotoLink(this);
			});
			return result_div;
		}
		var fail = function(e) {
			console.error("Your search index wasn't loaded, please check the following error", e);
		};
		var success = function(searchData) {
			searchData.forEach(function(searchSingle) {
				var content = searchSingle.content;
				searchSingle.singleId = content.substring(content.indexOf('<'), content.indexOf('>'));
				searchSingle.content = content.replace(/<\/?[^>]+(>|$)/g, " ");
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

			// $search.bind('typeahead:select', function(ev, suggestion) {
			// 	window.location.href = suggestion.link;
			// });
			$search.bind('typeahead:open', function(ev, suggestion) {
				$search.parents('.search-form').addClass('open');
			});
			$search.bind('typeahead:close', function(ev, suggestion) {
				$search.parents('.search-form').removeClass('open');
			});
			$search.on('keyup', function() {
				var searchText = $(this).val();
				$('.content').removeHighlight().highlight(searchText);
			});
			setQueryText();
		};
		//goto page with query string
		var gotoLink = function(eve) {
			var linkMode = htmlMode ? $(eve).attr('link') : $(eve).attr('spaLink'); 
			var fullLink = linkMode+'?q='+$search.val()+'#'+$(eve).attr('sectionId');
			window.location.href = fullLink;
		};
		//set initial higlhight according to previous page query
		var setQueryText = function(){
			var winhref = window.location.href;
			if(winhref.indexOf('?q=') != -1){
				var queryText = winhref.substring(winhref.indexOf('?q=')+3,winhref.lastIndexOf('#')).replace(/%20/g,' ');
				$search.val(queryText);
				$search.trigger('keyup');
			}
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
				"https://twitter.github.io/typeahead.js/releases/latest/typeahead.bundle.js"
			],
			function() {
				intializeCall();
			});

	};
}(jQuery));

(function($) {
	$.fn.highlight = function(pat) {
		var successCount = 0;
		function innerHighlight(node, pat) {
			var skip = 0;
			if (node.nodeType == 3) {
				var pos = node.data.toUpperCase().indexOf(pat);
				if (pos >= 0) {
					successCount++;
					var spannode = document.createElement('span');
					spannode.className = 'highlight';
					var middlebit = node.splitText(pos);
					var endbit = middlebit.splitText(pat.length);
					var middleclone = middlebit.cloneNode(true);
					spannode.appendChild(middleclone);
					middlebit.parentNode.replaceChild(spannode, middlebit);
					skip = 1;
				}
			} else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
				for (var i = 0; i < node.childNodes.length; ++i) {
					if(successCount > 100) {
						break;
					}
					i += innerHighlight(node.childNodes[i], pat);
				}
			}
			return skip;
		}
		return this.length && pat && pat.length ? this.each(function() {
			innerHighlight(this, pat.toUpperCase());
		}) : this;
	};
}(jQuery));

(function($) {
	$.fn.removeHighlight = function() {
		return $(this).find('span.highlight').each(function(){
		   $(this).replaceWith($(this).text());     
		}).end().each(function() {
		    this.normalize();
		});
	};
}(jQuery));