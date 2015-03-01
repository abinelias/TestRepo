$(function () {
    $.support.cors = true;
    $.when(app.initialize()).then(function () {
        ko.validation.init({ grouping: { observable: false } });
        ko.applyBindings(app);
    })
    //app.initialize();

    // Activate Knockout
    //ko.validation.init({ grouping: { observable: false } });
    //ko.applyBindings(app);
});
