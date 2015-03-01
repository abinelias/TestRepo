var viewModel = {}
$(function () {   
    initLookups(viewModel, ['RefCountry', 'RefEmployerDepartment']);
    initStates(viewModel, 1);
    $('#cmbState').wijcombobox({ "data": viewModel.RefState });
    var initializeObject = { "Id": "", "CompanyName": "", "CompanyBranch": "", "StreetAddress": "", "Address2": "", "City": "", "State": 0, "Country": 0, "Zip": "", "FirstName": "", "LastName": "", "Permission": 1, "Department": 0, "email": "", "password": "", "confirmPassword": "" };
    viewModel['EmployerRegistration'] = ko.mapping.fromJS(initializeObject);


    viewModel.submit = function () {
        $.ajax({
            url: GetWebAPIURL() + '/api/Company/',
            type: "POST",
            data: ko.mapping.toJSON(viewModel.EmployerRegistration),
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (data) {
                saveEmployerLoginDetails(data);
            },
            error: function (xhr, error) {
                alert('Error :' + error);
            }
        });
    }

    function saveEmployerLoginDetails(companyObj) {
        var jsonObjectRegistration = ko.toJS(viewModel.EmployerRegistration);
        var dataobjAddEmployer;
        var AddEmployerObj = {}
        AddEmployerObj.email = jsonObjectRegistration.email;
        AddEmployerObj.firstName = jsonObjectRegistration.FirstName;
        AddEmployerObj.lastName = jsonObjectRegistration.LastName;
        AddEmployerObj.role = "Master Admin";
        AddEmployerObj.companyId = companyObj;
        AddEmployerObj.Department = 1;
        AddEmployerObj.Permission = 1;
        AddEmployerObj.password = jsonObjectRegistration.password;
        AddEmployerObj.confirmPassword = jsonObjectRegistration.confirmPassword;
        dataobjAddEmployer = JSON.stringify(AddEmployerObj);
        alert(dataobjAddEmployer);
        $.ajax({
            url: GetWebAPIURL() + '/api/Account/Register/',
            type: "POST",
            data: dataobjAddEmployer,
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (data) {
                window.location = "/Views/JobSeeker/Account.html"
            },
            error: function (xhr, error) {
                alert('Error :' + error);
            }
        });
    }

    viewModel.reset = function () {

    }
    ko.applyBindings(viewModel, $('#content')[0]);
});





