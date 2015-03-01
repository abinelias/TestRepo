var viewModel = {}

$(function () {
    alert("hu");

    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    viewModel.loadOps = 0;

    initLookups(viewModel, ['RefCitizenship', 'RefCountry', 'RefTitle', 'RefSuffix', 'RefEthnicity']);
    initModelData(viewModel, ['UserInformation', 'Header'], [initUserInformation, null], ensureTemplates);
    initTemplates(viewModel, '/Templates/JobSeeker/', ["AccountDetail", "NotificationPreferences", "Demographic"], ensureTemplates);

    function initUserInformation() {
        //LookUp Names
        viewModel.UserInformation.CountryText = getLookUpText(viewModel.UserInformation.CountryId, viewModel.RefCountry);
        viewModel.UserInformation.CitizenshipText = getLookUpText(viewModel.UserInformation.CitizenshipId, viewModel.RefCitizenship);
        viewModel.UserInformation.EthnicityText = getLookUpText(viewModel.UserInformation.EthnicityId, viewModel.RefEthnicity);

        // validations
        viewModel.UserInformation.inSaveMode = ko.observable(false);
        viewModel.UserInformation.FirstName.extend({ required: true });
        viewModel.UserInformation.LastName.extend({ required: true });
        viewModel.UserInformation.AddressLine1.extend({ required: true });
        viewModel.UserInformation.City.extend({ required: true });
        viewModel.UserInformation.ZipCode.extend({ minLength: 5, required: true, pattern: { message: "Zip can only be number", params: '^([0-9]*)$' } });
        viewModel.UserInformation.Phone.extend({ required: true, pattern: { message: "Phone can only be number", params: '^([0-9]*)$' } });
        
        viewModel.UserInformation.errors = ko.validation.group(viewModel.UserInformation);

        viewModel.editingDetails = ko.observable(false);
        viewModel.editingNotifications = ko.observable(false);
        viewModel.editingDemographic = ko.observable(false);

        initStates(viewModel, 1);
        $('#cmbState').wijcombobox({ "data": viewModel.RefState });

        var cloneObj;
        viewModel.editAccountDetails = function (){
            viewModel.editingDetails(true);
            cloneObj = [];
            cloneObj = ko.mapping.toJS(viewModel.UserInformation);
        };
        viewModel.saveEditAccountDetails = function ()
        {
            viewModel.UserInformation.inSaveMode(true);
            var valid = viewModel.UserInformation.FirstName.isValid() && viewModel.UserInformation.LastName.isValid() && viewModel.UserInformation.AddressLine1.isValid() && viewModel.UserInformation.City.isValid() && viewModel.UserInformation.ZipCode.isValid() && viewModel.UserInformation.Phone.isValid() && viewModel.UserInformation.StateId() > 0 && viewModel.UserInformation.CountryId() > 0 && viewModel.UserInformation.CitizenshipId() > 0;
            if (!valid) {
                viewModel.UserInformation.errors.showAllMessages(true);
                return;
            }
            GetLocation(viewModel.UserInformation);
            setTimeout(function () {
               $.ajax({
                    url: GetWebAPIURL() + '/api/UserInformation/',
                    type: "PUT",
                    data: ko.mapping.toJSON(viewModel.UserInformation),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    headers: app.securityHeaders(),
                    success: function (data) {
                        if (viewModel.Header) {
                            viewModel.Header.FirstName(viewModel.UserInformation.FirstName());
                            viewModel.Header.LastName(viewModel.UserInformation.LastName());
                            viewModel.Header.Gender(viewModel.UserInformation.Gender());
                        }
                        viewModel.editingDetails(false);
                        viewModel.UserInformation.inSaveMode(false);
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
               });
            }, 1000);
        }
        viewModel.cancelEditAccountDetails = function () {
            viewModel.editingDetails(false);
            viewModel.UserInformation.inSaveMode(false);
            ko.mapping.fromJS(cloneObj, viewModel.UserInformation);
        }

        $.each(viewModel.UserInformation.Notification(), function (i, chk) {
            viewModel.UserInformation.Notification()[i] = ko.observable(chk);
        });
        var chkd = false;       
        for (var i = 0; i < viewModel.UserInformation.Notification().length; ++i) {
            chkd |= viewModel.UserInformation.Notification()[i]();
       }
       viewModel.noPreferences = ko.observable(!chkd);
       viewModel.editNotifications = function () {
           viewModel.editingNotifications(true);
           cloneObj = [];
           cloneObj = ko.mapping.toJS(viewModel.UserInformation);
        };
       viewModel.saveNotifications = function () {
            $.ajax({
                url: GetWebAPIURL() + '/api/UserInformation/',
                type: "PUT",
                data: ko.mapping.toJSON(viewModel.UserInformation),
                contentType: "application/json; charset=utf-8",
                async: false,
                headers: app.securityHeaders(),
                success: function (data) {
                    var chkd = false;
                    for (var i = 0; i < viewModel.UserInformation.Notification().length; ++i)
                        chkd |= viewModel.UserInformation.Notification()[i]();
                    viewModel.noPreferences(!chkd);
                    viewModel.editingNotifications(false);
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
       };
       viewModel.cancelNotifications = function () {
            viewModel.editingNotifications(false);
            for (var i = 0; i < cloneObj.Notification.length; ++i)
               viewModel.UserInformation.Notification()[i](cloneObj.Notification[i]);
       };

       if (viewModel.UserInformation.BirthDate) {
           viewModel.UserInformation.editBirthDate = ko.observable(new Date(viewModel.UserInformation.BirthDate()));
           viewModel.UserInformation.BirthDate = convert(viewModel.UserInformation.editBirthDate());
       }

       viewModel.editDemographic = function () {
           viewModel.editingDemographic(true);
           cloneObj = [];
           cloneObj = ko.mapping.toJS(viewModel.UserInformation);
       };
       viewModel.cancelDemographic = function () {
           viewModel.editingDemographic(false);
           viewModel.UserInformation.inSaveMode(false);
           viewModel.UserInformation.EthnicityId(cloneObj.EthnicityId);
           viewModel.UserInformation.Gender(cloneObj.Gender);
           viewModel.UserInformation.editBirthDate(new Date(cloneObj.BirthDate));
       };
       viewModel.saveDemographic = function () {
           viewModel.UserInformation.inSaveMode(true);
           if (viewModel.UserInformation.EthnicityId() == 0)
               return;
           viewModel.UserInformation.BirthDate = ko.observable(viewModel.UserInformation.editBirthDate());
           $.ajax({
               url: GetWebAPIURL() + '/api/UserInformation/',
               type: "PUT",
               data: ko.mapping.toJSON(viewModel.UserInformation),
               contentType: "application/json; charset=utf-8",
               async: false,
               headers: app.securityHeaders(),
               success: function (data) {                   
                   viewModel.UserInformation.BirthDate(convert(viewModel.UserInformation.editBirthDate()));
                   viewModel.editingDemographic(false);
                   viewModel.UserInformation.inSaveMode(false);
                   viewModel.Header.Gender(viewModel.UserInformation.Gender());
               },
               error: function (xhr, status, error) {
                   app.manageError(error);
               }
           });
       };
    };
});