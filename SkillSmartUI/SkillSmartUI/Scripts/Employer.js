$(function () {
    $('#hph').load('../Common/header-employer.htm');
    $('#hph-anon').load('../Common/header-anon.htm');
    $('#fph').load('../Common/footer-jobseeker.htm');
    $('body').on('click', '#viewProfile', function () {
        app.navigateToManage();
    });
});