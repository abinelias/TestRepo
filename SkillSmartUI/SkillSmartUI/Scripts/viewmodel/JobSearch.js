var viewModel = {}
viewModel.searchCriteria = ko.observableArray();
viewModel.jobCheck = ko.observable('0');
viewModel.saveSearchCheck = ko.observable('0');
viewModel.searchName = ko.observable();
viewModel.dataSavedSearch = ko.observable(createListSearch());
viewModel.selectedIndexSavedSearch = ko.observable();


viewModel.employmentTypeId = ko.observableArray();
viewModel.industryTypeId = ko.observableArray();
viewModel.salaryId = ko.observableArray();

viewModel.selectedIndexEducationLevel = ko.observable();
viewModel.selectedIndexDistance = ko.observable();
viewModel.selectedIndexCarrierLevel = ko.observable();
viewModel.dataIndustry = createList("Category", 0);
pagination();
$(function () {
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    initMultiselectBindings();
    Trimtext();
    viewModel.loadOps = 0;
    initLookups(viewModel, ['RefDegreeType', 'RefSalary', 'RefWorkType', 'RefDistance', 'RefCareerLevel']);
    initModelData(viewModel, ['Header'], [null], ensureTemplates);
    initTemplates(viewModel, '/Templates/JobSeeker/', ["JobsList", "JobFilter"], ensureTemplates);
});

viewModel.jobsList = ko.observableArray().extend({ paging: 5 });
var dataJobListObj = getSkillList("JobsList", "00000000-0000-0000-0000-000000000000");
var jobIdArray = "";
var dataobjJobPrerequisiteList = getSkillList("ListJobPrerequisite", jobIdArray);
var dataJobSkillList = getSkillList("SkillScoreCalculation", jobIdArray);
var dataAllCompany = getList("Company");
for (var i = 0; i < dataJobListObj.length; i++) {
    var listJob = new createJobSeekerJobList(dataJobListObj[i]);
    viewModel.jobsList.push(listJob);
}
viewModel.jobsList.sort(function (left, right) {
    return left.totalSkillScore == right.totalSkillScore ? 0 : (left.totalSkillScore < right.totalSkillScore ? 1 : -1)
});
function createJobSeekerJobList(objJobs) {
    var self = this;
    if (objJobs) {
        self.jobId = objJobs.Id;
        self.jobPosition = objJobs.JobPosition;
        self.expanded = ko.observable(false);
        for (var i = 0; i < dataAllCompany.length; i++) {
            if (objJobs.CompanyId == dataAllCompany[i].Id.toString()) {
                self.employerName = dataAllCompany[i].CompanyName;
                self.companyLocation = dataAllCompany[i].City;
            }
        }
        self.datePosted = convertDate(objJobs.PostingDate);
        self.salaryRange = objJobs.MinimumSalary + ' ' + objJobs.MaximumSalary;
        self.jobDescription = objJobs.JobDescription;
        self.jobViews = objJobs.JobViews;
        self.applicants = objJobs.ApplicantsNumber;
        self.applicantsSkillScore = objJobs.ApplicantAverage;
        self.prerequisites = ko.observableArray();
        for (var k = 0; k < dataobjJobPrerequisiteList.length; k++) {
            if (dataobjJobPrerequisiteList[k].JobId == objJobs.Id) {
                self.prerequisites.push({ designExperience: dataobjJobPrerequisiteList[k].PrerequisiteName });
            }
        }
        self.requiredSkills = ko.observableArray();
        var totalEmployerScore = 0;
        var totalJobseekerScore = 0;
        for (var k = 0; k < dataJobSkillList.length; k++) {
            if (dataJobSkillList[k].JobId == objJobs.Id) {
                totalEmployerScore = totalEmployerScore + dataJobSkillList[k].skillScoreEmployer;
                totalJobseekerScore = totalJobseekerScore + dataJobSkillList[k].skillScoreJobSeeker;
                var status = '';
                if (dataJobSkillList[k].skillScoreJobSeeker < 50)
                    status = 'low';
                else if (dataJobSkillList[k].skillScoreJobSeeker >= 50 && dataJobSkillList[k].skillScoreJobSeeker < 75)
                    status = 'medium';
                else
                    status = 'high';
                self.requiredSkills.push({ status: status, skillName: dataJobSkillList[k].SkillName, skillScore: dataJobSkillList[k].skillScoreJobSeeker });

            }
        }
        self.totalSkillScore = Math.round((totalJobseekerScore * 100) / totalEmployerScore);
    }
}

viewModel.applyJobs = function (objApplyJob) {
    var dataObjJobSeekerAppliedJobs = getSkillList("AppliedJobsJobId", objApplyJob.jobId);
    if (dataObjJobSeekerAppliedJobs.length > 0)
        alert("Job already applied");
    else
        window.location = "ApplyOpportunities.html?&jobId=" + objApplyJob.jobId;
}

viewModel.saveJobs = function (objSaveJob) {
    var dataObjJobSeekerAppliedJobs = getSkillList("SavedJobsJobId", objSaveJob.jobId);
    if (dataObjJobSeekerAppliedJobs.length > 0)
        alert("Job already saved");
    else {
        var jobSeekerSavedJobObj = {}
        jobSeekerSavedJobObj.DateApplied = new Date();
        jobSeekerSavedJobObj.JobId = objSaveJob.jobId;
        var dataObjJobSeekerSaveSearch = JSON.stringify(jobSeekerSavedJobObj);
        $.ajax({
            url: GetWebAPIURL() + '/api/JobSeekerSavedJobs/',
            type: "POST",
            data: dataObjJobSeekerSaveSearch,
            headers: app.securityHeaders(),
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (data) {
                alert("Job Successfully Saved");
            },
            error: function (xhr, status, error) {
                app.manageError(error);
            }
        });
    }
}

viewModel.saveSearch = function () {
    viewModel.saveSearchCheck('1');
    if (viewModel.searchName()) {
        var jobSeekerSaveSearchObj = {}
        jobSeekerSaveSearchObj.SearchName = viewModel.searchName();
        jobSeekerSaveSearchObj.EmployeementType = viewModel.employmentTypeId();
        jobSeekerSaveSearchObj.Industry = viewModel.industryTypeId();
        jobSeekerSaveSearchObj.carrierLevel = viewModel.selectedIndexCarrierLevel();
        jobSeekerSaveSearchObj.EducationLevel = viewModel.selectedIndexEducationLevel();
        jobSeekerSaveSearchObj.Distance = viewModel.selectedIndexDistance();
        jobSeekerSaveSearchObj.Salary = viewModel.salaryId();
        var dataObjJobSeekerSaveSearch = JSON.stringify(jobSeekerSaveSearchObj);
        $.ajax({
            url: GetWebAPIURL() + '/api/SavedJobSearch/',
            type: "POST",
            data: dataObjJobSeekerSaveSearch,
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
    else {
        alert("Enter Name to save search");
    }
}

viewModel.selectedIndexSavedSearch.subscribe(function (newValue) {
    var savedSearchId = viewModel.dataSavedSearch()[viewModel.selectedIndexSavedSearch()].value;
    var dataSaveSearchObj = getSkillList("SavedJobSearch", savedSearchId);
    viewModel.selectedIndexDistance(dataSaveSearchObj.Distance);
    viewModel.selectedIndexCarrierLevel(dataSaveSearchObj.carrierLevel);
    viewModel.selectedIndexEducationLevel(dataSaveSearchObj.EducationLevel);   
    if (dataSaveSearchObj.EmployeementType) {            
        for (var index = 0; index < dataSaveSearchObj.EmployeementType.length; index++) {
            viewModel.employmentTypeId.push(dataSaveSearchObj.EmployeementType[index]);
        }
    }
    if (dataSaveSearchObj.Industry) {           
        for (var index = 0; index < dataSaveSearchObj.Industry.length; index++) {
            viewModel.industryTypeId.push(dataSaveSearchObj.Industry[index]);
        }
    }
    if (dataSaveSearchObj.Salary) {            
        for (var index = 0; index < dataSaveSearchObj.Salary.length; index++) {
            viewModel.salaryId.push(dataSaveSearchObj.Salary[index]);                
        }
    }
});

viewModel.updateJobViews = function (jobObj) {
    if (jobObj.expanded() == false) {
        var dataObjJobSeekerViewJobs = getSkillList("JobViews", jobObj.jobId);
        if (dataObjJobSeekerViewJobs.length == 0) {
            var dataObjViewJobs;
            var jobSeekerViewJobsObj = {}
            jobSeekerViewJobsObj.JobId = jobObj.jobId;
            dataObjViewJobs = JSON.stringify(jobSeekerViewJobsObj);
            $.ajax({
                url: GetWebAPIURL() + '/api/JobViews/',
                type: "POST",
                data: dataObjViewJobs,
                headers: app.securityHeaders(),
                contentType: "application/json; charset=utf-8",
                async: true,
                success: function (data) {
                    updateApplicantAverage(jobObj.jobId, jobObj.totalSkillScore);
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
    }
}

function createListSearch() {
    var dataSavedJobSearchObj = getSavedJobSearch()
    var list = [];
    for (da in dataSavedJobSearchObj) {
        list.push({
            label: dataSavedJobSearchObj[da].SearchName,
            value: dataSavedJobSearchObj[da].Id
        });
    }
    return list;
}

function getSavedJobSearch() {
    var apiUrlgetSavedJobs = GetWebAPIURL() + '/api/SavedJobSearch/';
    var dataSavedJobSearchObj;
    $.ajax({
        url: apiUrlgetSavedJobs,
        type: 'GET',
        async: false,
        headers: app.securityHeaders(),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            dataSavedJobSearchObj = data;
        },
        error: function (xhr, status, error) {
            app.manageError(error);
        }
    });

    return dataSavedJobSearchObj;
}

function updateApplicantAverage(jobId, skillscore) {
    var jobDetails = getAppliedJobsList(jobId);
    jobDetails.JobViews = (parseInt(jobDetails.JobViews) + 1);
    var avgScore = ((parseInt(jobDetails.ApplicantAverage)) * (parseInt((jobDetails.JobViews) - 1)) + (parseInt(skillscore))) / (parseInt(jobDetails.JobViews));
    jobDetails.ApplicantAverage = (parseInt(avgScore));
    $.ajax({
        url: GetWebAPIURL() + '/api/JobsList?Id=' + jobId,
        type: "PUT",
        data: ko.mapping.toJSON(jobDetails),
        contentType: "application/json; charset=utf-8",
        async: true,
        success: function (data) {
        },
        error: function (xhr, status, error) {
            app.manageError(error);
        }
    });
    return dataobjJobs;
}