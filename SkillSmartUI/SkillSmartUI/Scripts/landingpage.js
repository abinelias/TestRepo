/*	CarouFredSel: a circular, responsive jQuery carousel.
	Configuration created by the "Configuration Robot"
	at caroufredsel.dev7studios.com
*/
var divs;
$(function () {
divs = $('.fade');
fade();
/*
	$("#slideshow").carouFredSel({
		width: "100%",
		height: 420,
		items: {
			start: 0,
			visible: 1,
			minimum: 1,
			width: "variable",
			height: "variable"
		},
		auto: {
			duration: 1000,
			pauseOnHover: true,
			fx: "fade"//,
			//timeoutDuration: 6000
		},
		pagination: "#slideNav"
	});*/

});
function fade() {
    var current = $('.current');
    var currentIndex = divs.index(current),
        nextIndex = currentIndex + 1;
    
    if (nextIndex >= divs.length) {
        nextIndex = 0;
    }
    
    var next = divs.eq(nextIndex);
    
    next.stop().fadeIn(1000, function() {
        $(this).addClass('current');
    });
    
    current.stop().fadeOut(1000, function() {
        $(this).removeClass('current');
        setTimeout(fade, 5000);
    });
}