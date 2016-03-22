$(document).ready(function() {
	hljs.initHighlightingOnLoad();
	new WOW().init();
	//Resize
	function resize() {
		var height = $(window).height();
		$('header').css('min-height',height);
		var videoWidth = $('iframe').width();
		$('iframe').attr('height', videoWidth); 
		$('.codeContainer').css('min-height', videoWidth);
	}
	resize();
	$(window).resize(function() {
		resize();
	});
});