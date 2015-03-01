$(function () {
    $('#hph').load('../Common/header-admin.htm');
    $('#fph').load('../Common/footer-jobseeker.htm');
    $('body').on('click', '#viewProfile', function () {
        app.navigateToManage();
    });
});