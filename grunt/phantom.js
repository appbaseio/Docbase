var pages = [];
var fs = require('fs');
var crowPage = function(url, fildPages) {
	pages.push(url);
	var page = require('webpage').create();
	page.open(url, function() {
		setTimeout(function() {
			if (fildPages) {
				var links = page.evaluate(function() {
					var data = $('[ng-href]:not(.dropdown-toggle)');
					return data.toArray().map(function(a) {
						return $(a).attr('href');
					});
				});
				page.close();
				//console.log("Nine", links);
				links.map(function(link) {
					crowPage(url + link, false);
				});
				var documentContent = page.evaluate(function() {
					return $("html").html();
				});
				var urlParts = url.split("#");
				var pageName = urlParts[1] ? urlParts[1] : "index";
				var path = pageName + '.html';
				documentContent = documentContent.replace(new RegExp("#/", 'g'), "");
				fs.write("html/" + path, documentContent, 'w');
			};
			pages.shift();
			if (pages.length === 0) {
				setTimeout(phantom.exit, 300);
			}
		}, 300);
	});
};
crowPage('http://localhost:8080/', true);