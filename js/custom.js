$(document).ready(function() {
	new WOW().init();
	//Resize
	function resize() {
		var height = $(window).height();
		$('header').css('min-height',height);
		var videoWidth = $('iframe').width();
		$('iframe').attr('height', videoWidth); 
	}
	resize();
	$(window).resize(function() {
		resize();
	});
});