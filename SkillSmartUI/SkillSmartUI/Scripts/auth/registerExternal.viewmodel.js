function RegisterExternalViewModel(app, dataModel) {
    // Private state
    var self = this;

    // Data
    self.loginProvider = ko.observable();
    self.email = ko.observable(null).extend({ required: true });
    self.firstName = ko.observable("");
    self.lastName = ko.observable("");

    // Other UI state
    self.registering = ko.observable(false);
    self.externalAccessToken = null;
    self.state = null;
    self.loginUrl = null;
    self.errors = ko.observableArray();
    self.validationErrors = ko.validation.group([self.email]);

    // data-bind click
    self.register = function () {
        self.errors.removeAll();

        if (self.validationErrors().length > 0) {
            self.validationErrors.showAllMessages();
            return;
        }

        self.registering(true);
        dataModel.registerExternal(self.externalAccessToken, {
            email: self.email(),
            firstName: self.firstName(),
            lastName: self.lastName()
        }).done(function (data) {
            sessionStorage["state"] = self.state;
            // IE doesn't reliably persist sessionStorage when navigating to another URL. Move sessionStorage
            // temporarily to localStorage to work around this problem.
            app.archiveSessionStorageToLocalStorage();
            window.location = self.loginUrl;
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
}

app.addViewModel({
    name: "RegisterExternal",
    bindingMemberName: "registerExternal",
    factory: RegisterExternalViewModel,
    navigatorFactory: function (app) {
        return function (user, loginProvider, externalAccessToken, loginUrl, state) {
            app.errors.removeAll();
            app.view(app.Views.RegisterExternal);
            if (user.indexOf('@') != -1)
                app.registerExternal().email(email);
            if (user.indexOf(' ') != -1) {
                var tokens = user.split(' ');
                if (tokens.length > 0)
                    app.registerExternal().firstName(tokens[0]);
                if (tokens.length > 1)
                    app.registerExternal().lastName(tokens[1]);
            }
            app.registerExternal().loginProvider(loginProvider);
            app.registerExternal().externalAccessToken = externalAccessToken;
            app.registerExternal().loginUrl = loginUrl;
            app.registerExternal().state = state;
        };
    }
});
