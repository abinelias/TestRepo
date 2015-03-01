function AppViewModel(dataModel) {
    // Private state
    var self = this;

    // Private operations
    function cleanUpLocation() {
        window.location.hash = "";

        if (typeof (history.pushState) !== "undefined") {
            history.pushState("", document.title, location.pathname);
        }
    }

    function getFragment() {
        if (window.location.hash.indexOf("#") === 0) {
            return parseQueryString(window.location.hash.substr(1));
        } else {
            return {};
        }
    }

    function parseQueryString(queryString) {
        var data = {},
            pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

        if (queryString === null) {
            return data;
        }

        pairs = queryString.split("&");

        for (var i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            separatorIndex = pair.indexOf("=");

            if (separatorIndex === -1) {
                escapedKey = pair;
                escapedValue = null;
            } else {
                escapedKey = pair.substr(0, separatorIndex);
                escapedValue = pair.substr(separatorIndex + 1);
            }

            key = decodeURIComponent(escapedKey);
            value = decodeURIComponent(escapedValue);

            data[key] = value;
        }

        return data;
    }

    function verifyStateMatch(fragment) {
        var state;

        if (typeof (fragment.access_token) !== "undefined") {
            state = sessionStorage["state"];
            sessionStorage.removeItem("state");

            if (state === null || fragment.state !== state) {
                fragment.error = "invalid_state";
            }
        }
    }

    // Data
    self.Views = {
        Loading: {} // Other views are added dynamically by app.addViewModel(...).
    };

    self.securityHeaders = function () {
        return dataModel.securityHeaders();
    };

    self.logOff = function () {
        return self.user().logOff();
        //eraseCookie('user');
        //return dataModel.logout();
    };

    // UI state
    self.errors = ko.observableArray();
    self.user = ko.observable(null);
    self.view = ko.observable(self.Views.Loading);

    self.loading = ko.computed(function () {
        return self.view() === self.Views.Loading;
    });

    self.loggedIn = ko.computed(function () {
        return self.user() !== null;
    });

    // UI operations
    self.archiveSessionStorageToLocalStorage = function () {
        var backup = {};

        for (var i = 0; i < sessionStorage.length; i++) {
            backup[sessionStorage.key(i)] = sessionStorage[sessionStorage.key(i)];
        }

        localStorage["sessionStorageBackup"] = JSON.stringify(backup);
        sessionStorage.clear();
    };

    self.restoreSessionStorageFromLocalStorage = function () {
        var backupText = localStorage["sessionStorageBackup"],
            backup;

        if (backupText) {
            backup = JSON.parse(backupText);

            for (var key in backup) {
                sessionStorage[key] = backup[key];
            }

            localStorage.removeItem("sessionStorageBackup");
        }
    };

    self.navigateToLoggedIn = function (user, accessToken, persistent) {
        self.errors.removeAll();

        if (accessToken) {
            dataModel.setAccessToken(accessToken, persistent)
        }
        var um = new UserInfoViewModel(self, user, dataModel);
        self.user(um);
        eraseCookie('user');
        createCookie('user', JSON.stringify(user), 1);
        self.navigateToHome();
    };

    self.setUser = function () {
        var usrStr = readCookie('user');
        if (usrStr) {
            var usr = $.parseJSON(JSON.stringify(usrStr));
            try {
                var um = new UserInfoViewModel(self, usr, dataModel);
                self.user(um);
            }
            catch (e) {
            }
        }
    };
    self.navigateToLoggedOff = function () {
        self.errors.removeAll();
        dataModel.clearAccessToken();
        self.navigateToLogin();
    };

    // Other navigateToX functions are added dynamically by app.addViewModel(...).

    // Other operations
    self.addViewModel = function (options) {
        var viewItem = {},
            navigator;

        // Add view to AppViewModel.Views enum (for example, app.Views.Home).
        self.Views[options.name] = viewItem;

        // Add binding member to AppViewModel (for example, app.home);
        self[options.bindingMemberName] = ko.computed(function () {
            if (self.view() !== viewItem) {
                return null;
            }

            return new options.factory(self, dataModel);
        });

        if (typeof (options.navigatorFactory) !== "undefined") {
            navigator = options.navigatorFactory(self, dataModel);
        } else {
            navigator = function () {
                self.errors.removeAll();
                self.view(viewItem);
            };
        }

        // Add navigation member to AppViewModel (for example, app.NavigateToHome());
        self["navigateTo" + options.name] = navigator;
    };

    self.manageError = function (error) {
        if (error == 'Unauthorized') {
            self.logOff();
            eraseCookie('user');
            window.location.replace('Account.html');
            return;
        }
        alert('Error: ' + error);
    };

    self.initialize = function () {
        var fragment = getFragment(),
            externalAccessToken, externalError, loginUrl;

        self.restoreSessionStorageFromLocalStorage();
        verifyStateMatch(fragment);

        if (sessionStorage["associatingExternalLogin"]) {
            sessionStorage.removeItem("associatingExternalLogin");

            if (typeof (fragment.error) !== "undefined") {
                externalAccessToken = null;
                externalError = fragment.error;
                cleanUpLocation();
            } else if (typeof (fragment.access_token) !== "undefined") {
                externalAccessToken = fragment.access_token;
                externalError = null;
                cleanUpLocation();
            } else {
                externalAccessToken = null;
                externalError = null;
                cleanUpLocation();
            }

            dataModel.getUserInfo()
                .done(function (data) {
                    if (data) {
                        self.navigateToLoggedIn(data);
                        self.navigateToManage(externalAccessToken, externalError);
                    } else {
                        if (location.search == '?register')
                            self.navigateToRegister();
                        else
                            self.navigateToLogin();
                    }
                })
                .fail(function () {
                    if (location.search == '?register')
                        self.navigateToRegister();
                    else
                        self.navigateToLogin();
                });
        } else if (typeof (fragment.error) !== "undefined") {
            cleanUpLocation();
            self.navigateToLogin();
            self.errors.push("External login failed.");
        } else if (typeof (fragment.access_token) !== "undefined") {
            cleanUpLocation();

            dataModel.getUserInfo(fragment.access_token)
                .done(function (data) {
                    if (typeof (data.email) !== "undefined" && typeof (data.hasRegistered) !== "undefined"
                        && typeof (data.loginProvider) !== "undefined") {
                        if (data.hasRegistered) {
                            self.navigateToLoggedIn(data, fragment.access_token, false);

                            window.location.replace("AccountInformation.html");
                        }
                        else if (typeof (sessionStorage["loginUrl"]) !== "undefined") {
                            loginUrl = sessionStorage["loginUrl"];
                            sessionStorage.removeItem("loginUrl");
                            self.navigateToRegisterExternal(data.email, data.loginProvider, fragment.access_token,
                                loginUrl, fragment.state);
                        }
                        else {
                            self.navigateToLogin();
                        }
                    } else {
                        self.navigateToLogin();
                    }
                })
                .fail(function () {
                    self.navigateToLogin();
                });
        } else {
            dataModel.getUserInfo()
                .done(function (data) {
                    if (location.search == '?logout') {
                        self.logOff();
                        eraseCookie('user');
                        return window.location.replace("Account.html");
                    }
                    if (data.email) {
                        if (data.userRole == 'Member') {
                            window.location.replace("AccountInformation.html");
                        }
                        else {
                            window.location.replace("/Views/Employer/EmployerManage.html");
                        }
                    } else {
                        if (location.search == '?register')
                            self.navigateToRegister();
                        else
                            self.navigateToLogin();
                    }
                })
                .fail(function () {
                    if (location.search == '?register')
                        self.navigateToRegister();
                    else
                        self.navigateToLogin();
                });
        }
    }
}

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
            eraseCookie('user');
            window.location.replace('/Views/Seeker/Account.html');
            app.navigateToLoggedOff();
        }).fail(function () {
            app.errors.push("Log off failed.");
        });
    };

    self.manage = function () {
        app.navigateToManage();
    };
}
var app = new AppViewModel(new AppDataModel());
app.setUser();
