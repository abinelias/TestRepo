var viewModel = {};

$(function () {
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    viewModel.btnHR = ko.observable('+');
    viewModel.btnOperations = ko.observable('+');
    viewModel.btnMarketing = ko.observable('+');
    viewModel.btnIT = ko.observable('+');
    viewModel.addEmployerCheck = ko.observable(false);
    viewModel.loadOps = 0;
    initLookups(viewModel, ['RefEmployerPermission', 'RefEmployerDepartment']);
    viewModel["HeaderEmployer"] = ko.mapping.fromJS(getList("HeaderEmployer"));
    
    var dataEmployerList = getListById("Employer", viewModel.HeaderEmployer.CompanyId());
    companyUserList(dataEmployerList);

    viewModel.clickButtonAdduser = function () {
        var initializeObject = { "CompanyId": viewModel.HeaderEmployer.CompanyId(), "FirstName": "", "LastName": "", "Id": "", "Department": 0, "Permission": 0, "Location": "", "email": "", "password": "", "confirmPassword": "", "addCheck": "", "isEditEmployer": 0, "departmentCheck": 0, "inSaveMode": false };
        var data = ko.mapping.fromJS(initializeObject);
        viewModel.EmployerList.MemberData.splice(0, 0, data);
        viewModel.EmployerList.MemberData()[0].PermissionText = getLookUpText(viewModel.EmployerList.MemberData()[0].Permission, viewModel.RefEmployerPermission);
        viewModel.EmployerList.MemberData()[0].DepartmentText = getLookUpText(viewModel.EmployerList.MemberData()[0].Department, viewModel.RefEmployerDepartment);
        viewModel.EmployerList.MemberData()[0].FirstName.extend({ required: true });
        viewModel.EmployerList.MemberData()[0].LastName.extend({ required: true });
        viewModel.EmployerList.MemberData()[0].Location.extend({ required: true });
        viewModel.EmployerList.MemberData()[0].email.extend({ required: true, pattern: { message: "please enter proper email", params: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$' } });
        viewModel.EmployerList.MemberData()[0].password.extend({ required: true });
        viewModel.EmployerList.MemberData()[0].confirmPassword.
        extend({
            required: { message: "Confirm-Password is required or incorrect." },
            validation: {
                validator: function (val, params) {
                    return val == viewModel.EmployerList.MemberData()[0].password();
                },
                message: 'Passwords do not match.',
            }
        })
        viewModel.EmployerList.MemberData()[0].addCheck(1);
        viewModel.EmployerList.errors = ko.validation.group(viewModel.EmployerList.MemberData()[0]);
        viewModel.addEmployerCheck(true);
    }

    viewModel.addEmployer = function (employerObj) {
        employerObj.inSaveMode(true);
        var valid = employerObj.FirstName.isValid() && employerObj.LastName.isValid() && employerObj.Location.isValid() && employerObj.Department() > 0 && employerObj.Permission() > 0;
        if (!valid) {
            viewModel.EmployerList.errors.showAllMessages(true);
            return;
        }
        if (employerObj.Id()) {
            $.ajax({
                url: GetWebAPIURL() + '/api/Employer/',
                type: "PUT",
                data: ko.mapping.toJSON(employerObj),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    employerObj.departmentCheck(employerObj.Department());
                    employerObj.isEditEmployer('0');
                    employerObj.inSaveMode(false);
                    for (var i = 0; i < SelectedEmployer.length; i++) {
                        if (SelectedEmployer[i].Id == employerObj.Id()) {
                            SelectedEmployer.splice(i, 1);
                        }
                    }
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
        else {
            var validation = employerObj.email.isValid() && (employerObj.password() == employerObj.confirmPassword());
            if (!validation) {
                viewModel.EmployerList.errors.showAllMessages(true);
                return;
            }
            var dataobjAddEmployer;
            var jobseekerAddEmployerObj = {}
            jobseekerAddEmployerObj.email = employerObj.email();
            jobseekerAddEmployerObj.firstName = employerObj.FirstName();
            jobseekerAddEmployerObj.lastName = employerObj.LastName();
            jobseekerAddEmployerObj.role = viewModel.RefEmployerPermission[employerObj.Permission()].label;
            jobseekerAddEmployerObj.Permission = viewModel.RefEmployerPermission[employerObj.Permission()].value;
            jobseekerAddEmployerObj.Department = viewModel.RefEmployerDepartment[employerObj.Department()].value;
            jobseekerAddEmployerObj.Location = employerObj.Location();
            jobseekerAddEmployerObj.companyId = employerObj.CompanyId();
            jobseekerAddEmployerObj.password = employerObj.password();
            jobseekerAddEmployerObj.confirmPassword = employerObj.confirmPassword();
            dataobjAddEmployer = JSON.stringify(jobseekerAddEmployerObj);
            employerObj.departmentCheck(employerObj.Department());
            $.ajax({
                url: GetWebAPIURL() + '/api/Account/Register/',
                type: "POST",
                data: dataobjAddEmployer,
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    viewModel.addEmployerCheck(false);
                    employerObj.inSaveMode(false);
                    employerObj.addCheck(0);
                    companyUserList(getListById("Employer", viewModel.HeaderEmployer.CompanyId()));
                },
                error: function (xhr, error) {
                    app.manageError(error);
                }
            });
        }
    }

    viewModel.cancelEmployer = function (employerObj) {
        viewModel.addEmployerCheck(false);
        var indexId = viewModel.EmployerList.MemberData.indexOf(employerObj);
        employerObj.inSaveMode(false);
        if (employerObj.Id() == '') {
            viewModel.EmployerList.MemberData.remove(employerObj);
            employerObj.addCheck(0);
        }
        else {
            for (var j = 0; j < SelectedEmployer.length; j++) {
                if (employerObj.Id() == SelectedEmployer[j].Id) {
                    viewModel.EmployerList.MemberData.replace(viewModel.EmployerList.MemberData()[indexId], ko.mapping.fromJS(SelectedEmployer[j]));
                    viewModel.EmployerList.MemberData()[indexId].departmentCheck(viewModel.EmployerList.MemberData()[indexId].departmentCheck());
                    viewModel.EmployerList.MemberData()[indexId].isEditEmployer('0');
                    viewModel.EmployerList.MemberData()[indexId].PermissionText = getLookUpText(viewModel.EmployerList.MemberData()[indexId].Permission, viewModel.RefEmployerPermission);
                    viewModel.EmployerList.MemberData()[indexId].DepartmentText = getLookUpText(viewModel.EmployerList.MemberData()[indexId].Department, viewModel.RefEmployerDepartment);
                    SelectedEmployer.splice(j, 1);
                }
            }
        }
    }

    viewModel.deleteEmployer = function (employerObj) {
        var deleteEmployer = confirm("Do you want to delete!");
        if (deleteEmployer == true) {
            $.ajax({
                url: GetWebAPIURL() + '/api/Employer/?Id=' + employerObj.Id(),
                type: "DELETE",
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    viewModel.EmployerList.MemberData.remove(employerObj);
                    employerObj.isEditEmployer('0');
                },
                error: function (xhr, error) {
                    app.manageError(error);
                }
            });
        }
    }
    var SelectedEmployer = [];
    viewModel.editEmployer = function (employerObj) {
        var userObj = ko.mapping.fromJS(employerObj);
        userObj.FirstName.extend({ required: true });
        userObj.LastName.extend({ required: true });
        userObj.Location.extend({ required: true });
        employerObj.isEditEmployer('1');
        SelectedEmployer.push(ko.toJS(employerObj));
    }

    viewModel.expandHR = function () {
        toggle(viewModel.btnHR);
    }
    viewModel.expandOperations = function () {
        toggle(viewModel.btnOperations);
    }
    viewModel.expandMarketing = function () {
        toggle(viewModel.btnMarketing);
    }
    viewModel.expandIT = function () {
        toggle(viewModel.btnIT);
    }
});

function companyUserList(dataEmployerList) {
    var creditorData = {};
    creditorData.MemberData = dataEmployerList;
    viewModel['EmployerList'] = ko.mapping.fromJS(creditorData);

    for (var i = 0; i < viewModel.EmployerList.MemberData().length; i++) {       
        viewModel.EmployerList.MemberData()[i].isEditEmployer = ko.observable('0');
        viewModel.EmployerList.MemberData()[i].addCheck = ko.observable(0);
        viewModel.EmployerList.MemberData()[i].inSaveMode = ko.observable(false);
        viewModel.EmployerList.MemberData()[i].departmentCheck = ko.observable(viewModel.EmployerList.MemberData()[i].Department());
        viewModel.EmployerList.MemberData()[i].PermissionText = getLookUpText(viewModel.EmployerList.MemberData()[i].Permission, viewModel.RefEmployerPermission);
        viewModel.EmployerList.MemberData()[i].DepartmentText = getLookUpText(viewModel.EmployerList.MemberData()[i].Department, viewModel.RefEmployerDepartment);
    }
    initTemplates(viewModel, '/Templates/Employer/', ["ActivitySummary", "ListEmployer"], ensureTemplates);
}