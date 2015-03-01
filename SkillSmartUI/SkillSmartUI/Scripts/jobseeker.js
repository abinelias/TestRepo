$(function () {
    $('#hph').load('../Common/header-jobseeker.htm');
    $('#hph-anon').load('../Common/header-anon.htm');
    $('#fph').load('../Common/footer-jobseeker.htm');
    $('#fph-anon').load('../Common/footer-anon.htm');
    $('body').on('click', '#viewProfile', function () {
        app.navigateToManage();
    });
});

$(window).scroll(function () {
    if ($(this).scrollTop() > 200) {
        $('#backTop').fadeIn(200);
    }
    else {
        $('#backTop').fadeOut(200);
    }
});