var viewModel = {};
$(function () {
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    viewModel.loadOps = 0;
    viewModel["HeaderEmployer"] = ko.mapping.fromJS(getList("HeaderEmployer"));
    
    if (viewModel.HeaderEmployer.Role() == 1) {
        initLookups(viewModel, ['RefCountry']);
        var dataCompany = getListById("Company", viewModel.HeaderEmployer.CompanyId());
        viewModel['companyData'] = ko.mapping.fromJS(dataCompany);
        initStates(viewModel, 1);
        $('#cmbState').wijcombobox({ "data": viewModel.RefState });

        viewModel.companyData.inSaveMode = ko.observable(false);
        viewModel.companyData.CompanyName.extend({ required: true });
        viewModel.companyData.CompanyBranch.extend({ required: true });
        viewModel.companyData.StreetAddress.extend({ required: true });
        viewModel.companyData.Address2.extend({ required: true });
        viewModel.companyData.City.extend({ required: true });
        viewModel.companyData.Zip.extend({ minLength: 5, required: true, pattern: { message: "Zip can only be number", params: '^([0-9]*)$' } });
        viewModel.companyData.errors = ko.validation.group(viewModel.companyData);
    }
    

    initModelData(viewModel, ['Employer'], [initEmployerInformation], ensureTemplates);
    initTemplates(viewModel, '/Templates/Employer/', ["ActivitySummary", "EmployerAccount"], ensureTemplates);

    function initEmployerInformation() {
        viewModel.Employer.FirstName.extend({ required: true });
        viewModel.Employer.LastName.extend({ required: true });
        viewModel.Employer.AddressLine1.extend({ required: true });
        viewModel.Employer.City.extend({ required: true });
        viewModel.Employer.errors = ko.validation.group(viewModel.Employer);

        if (viewModel.Employer.BirthDate()) 
            viewModel.Employer.editBirthDate = ko.observable(new Date(viewModel.Employer.BirthDate()));
        else
            viewModel.Employer.editBirthDate = ko.observable(new Date());

        viewModel.saveAccountDetails = function () {
            var valid = viewModel.Employer.FirstName.isValid() && viewModel.Employer.LastName.isValid() && viewModel.Employer.AddressLine1.isValid() && viewModel.Employer.City.isValid();
            if (!valid) {
                viewModel.Employer.errors.showAllMessages(true);
                return;
            }
            viewModel.Employer.BirthDate = ko.observable(viewModel.Employer.editBirthDate());
            

            if (viewModel.HeaderEmployer.Role() == 1) {
                viewModel.companyData.inSaveMode(true);
                var valid = viewModel.companyData.CompanyName.isValid() && viewModel.companyData.CompanyBranch.isValid() && viewModel.companyData.StreetAddress.isValid() && viewModel.companyData.Address2.isValid() && viewModel.companyData.Zip.isValid() && viewModel.companyData.City.isValid() && viewModel.companyData.State() > 0 && viewModel.companyData.Country() > 0;
                if (!valid) {
                    viewModel.companyData.errors.showAllMessages(true);
                    return;
                }
               
                GetLocation(viewModel.companyData);
                setTimeout(function () {
                    $.ajax({
                        url: GetWebAPIURL() + '/api/Company/',
                        type: "PUT",
                        data: ko.mapping.toJSON(viewModel.companyData),
                        contentType: "application/json; charset=utf-8",
                        async: false,
                        headers: app.securityHeaders(),
                        success: function (data) {

                        },
                        error: function (xhr, status, error) {
                            app.manageError(error);
                        }
                    });
                }, 1000);
            }
            $.ajax({
                url: GetWebAPIURL() + '/api/Employer/',
                type: "PUT",
                data: ko.mapping.toJSON(viewModel.Employer),
                contentType: "application/json; charset=utf-8",
                async: false,
                headers: app.securityHeaders(),
                success: function (data) {
                    if (viewModel.HeaderEmployer) {
                        viewModel.HeaderEmployer.FirstName(viewModel.Employer.FirstName());
                        viewModel.HeaderEmployer.LastName(viewModel.Employer.LastName());
                    }                    
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }        
    }
    
});