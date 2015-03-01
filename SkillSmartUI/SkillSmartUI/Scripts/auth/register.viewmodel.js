function RegisterViewModel(app, dataModel) {
    var self = this;

    // Data
    self.email = ko.observable("").extend({ required: true });
    self.firstName = ko.observable("");
    self.lastName = ko.observable("");
    self.userRole = ko.observable("Member");
    self.password = ko.observable("").extend({ required: true });
    self.confirmPassword = ko.observable("").extend({ required: true, equal: self.password });

    // Other UI state
    self.registering = ko.observable(false);
    self.errors = ko.observableArray();
    self.validationErrors = ko.validation.group([self.email, self.password, self.confirmPassword]);

    // Operations
    self.register = function () {
        self.errors.removeAll();
        if (self.validationErrors().length > 0) {
            self.validationErrors.showAllMessages();
            return;
        }
        self.registering(true);

        dataModel.register({
            email: self.email(),
            firstName: self.firstName(),
            lastName: self.lastName(),
            role: self.userRole(),
            password: self.password(),
            confirmPassword: self.confirmPassword()
        }).done(function (data) {
            dataModel.login({
                grant_type: "password",
                userName: self.email(),
                password: self.password()
            }).done(function (data) {
                self.registering(false);
                window.location.reload();
                if (data && data.access_token) {
                    app.navigateToLoggedIn(data, data.access_token, false /* persistent */);
                } else {
                    self.errors.push("An unknown error occurred.");
                }
            }).failJSON(function (data) {
                self.registering(false);

                if (data && data.error_description) {
                    self.errors.push(data.error_description);
                } else {
                    self.errors.push("An unknown error occurred.");
                }
            });
        }).failJSON(function (data) {
            var errors;

            self.registering(false);
            errors = dataModel.toErrorsArray(data);

            if (errors) {
                self.errors(errors);
            } else {
                self.errors.push("An unknown error occurred.");
            }
        });
    };

    self.login = function () {
        app.navigateToLogin();
    };
}

app.addViewModel({
    name: "Register",
    bindingMemberName: "register",
    factory: RegisterViewModel
});
