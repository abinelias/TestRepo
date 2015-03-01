function UserInfoViewModel(app, user, dataModel) {
    var self = this;

    // Data
    var email = '';
    if (user.userName)
        email = user.userName;
    if (user.email)
        email = user.email;
    self.email = ko.observable(email);
    var nm = '';
    if (user.firstName)
        nm = user.firstName;
    if (user.lastName) {
        if (nm.length > 0)
            nm += ' ';
        nm += user.lastName;
    }
    if (nm.length <= 1)
        nm = email;
    self.name = ko.observable(nm);
    // Operations
    self.logOff = function () {
        dataModel.logout().done(function () {
            app.navigateToLoggedOff();
        }).fail(function () {
            app.errors.push("Log off failed.");
        });
    };

    self.manage = function () {
        app.navigateToManage();
    };
}
