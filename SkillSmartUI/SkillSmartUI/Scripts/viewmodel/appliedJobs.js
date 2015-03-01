var viewModel = {}
var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
var jobId = hashes[1].substring(6);
$(function () {
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    var dataobjJobList = getAppliedJobsList(jobId);
    var dataObjCompanyDetails = getSkillList("Company", dataobjJobList.CompanyId)
    viewModel.loadOps = 0;
    initLookups(viewModel, ['RefCitizenship', 'RefCountry', 'RefTitle', 'RefSuffix', 'RefEthnicity']);
    initModelData(viewModel, ['UserInformation', 'Header'], [initUserInformation, null], ensureTemplates);
    initTemplates(viewModel, '/Templates/JobSeeker/', ["ViewJob"], ensureTemplates);

    viewModel.jobPosition = dataobjJobList.JobPosition;
    viewModel.companyLocation = dataObjCompanyDetails.City;
    viewModel.employerName = dataObjCompanyDetails.CompanyName;
    viewModel.btnCoverValue = ko.observable('0');
    viewModel.editorMode = ko.observable('wysiwyg');
    viewModel.showPathSelector = ko.observable(true);
    viewModel.mode = ko.observable('ribbon');
    viewModel.showFooter = ko.observable(true);
    viewModel.text = ko.observable("");
    function initUserInformation() {
        initStates(viewModel, 1);
        $('#cmbState').wijcombobox({ "data": viewModel.RefState });
        viewModel.UserInformation.FirstName.extend({ required: true });
        viewModel.UserInformation.LastName.extend({ required: true });
        viewModel.UserInformation.AddressLine1.extend({ required: true });
        viewModel.UserInformation.City.extend({ required: true });
        viewModel.UserInformation.ZipCode.extend({ minLength: 5, required: true, pattern: { message: "Zip can only be number", params: '^([0-9]*)$' } });
        viewModel.UserInformation.Phone.extend({ required: true, pattern: { message: "Phone can only be number", params: '^([0-9]*)$' } });
        viewModel.UserInformation.inSaveMode = ko.observable(false);
        viewModel.UserInformation.errors = ko.validation.group(viewModel.UserInformation);

        viewModel.submitApplication = function () {
            viewModel.UserInformation.inSaveMode(true);
            var valid = viewModel.UserInformation.FirstName.isValid() && viewModel.UserInformation.LastName.isValid() && viewModel.UserInformation.AddressLine1.isValid() && viewModel.UserInformation.City.isValid() && viewModel.UserInformation.ZipCode.isValid() && viewModel.UserInformation.Phone.isValid() && viewModel.UserInformation.StateId() > 0 && viewModel.UserInformation.CountryId() > 0 && viewModel.UserInformation.CitizenshipId() > 0;
            if (!valid) {
                viewModel.UserInformation.errors.showAllMessages(true);
                return;
            }
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
                    viewModel.UserInformation.inSaveMode(false);
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
            dataobjJobList.ApplicantsNumber = dataobjJobList.ApplicantsNumber + 1;
            $.ajax({
                url: GetWebAPIURL() + '/api/JobsList/',
                type: "PUT",
                data: ko.mapping.toJSON(dataobjJobList),
                headers: app.securityHeaders(),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });

            var dataObjJobSeekerAppliedJobs = getSkillList("SavedJobsJobId", jobId);
            if (dataObjJobSeekerAppliedJobs.length > 0) {
                $.ajax({
                    url: GetWebAPIURL() + '/api/JobSeekerSavedJobs?id=' + dataObjJobSeekerAppliedJobs[0].Id,
                    type: "DELETE",
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        
            var dataObjAppliedJobs;
            var jobSeekerAppliedJobsObj = {}
            jobSeekerAppliedJobsObj.JobId = jobId;
            jobSeekerAppliedJobsObj.DateApplied = new Date();
            jobSeekerAppliedJobsObj.CoverLetter = $("#wijeditor").val();
            jobSeekerAppliedJobsObj.Status = 1;
            dataObjAppliedJobs = JSON.stringify(jobSeekerAppliedJobsObj);

            $.ajax({
                url: GetWebAPIURL() + '/api/JobSeekerAppliedJobs/',
                type: "POST",
                data: dataObjAppliedJobs,
                headers: app.securityHeaders(),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    window.location = "MyOpportunitiesApplied.html";
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
    }

    viewModel.typeCoverLetter = function () {
        viewModel.btnCoverValue('1');
    }
});




