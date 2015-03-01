var viewModel = {};
viewModel.usersList = ko.observableArray();
viewModel.userListId = ko.observableArray();
var jobSeekerIdArray = [];

$(function () {
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    viewModel["HeaderEmployer"] = ko.mapping.fromJS(getList("HeaderEmployer"));
    var dataJobList = getListById("JobsList", viewModel.HeaderEmployer.CompanyId());
    var dataEmployerList = createListSkill("Employer", viewModel.HeaderEmployer.CompanyId());

    Trimtext();
    initMultiselectBindings();
    viewModel.loadOps = 0;
    viewModel.dataCompetency = ko.observable(createListSkill("Category", 1));
    initTemplates(viewModel, '/Templates/Employer/', ["CandidateSearchCriteria", "JobApplicant", "ActivitySummary"], ensureTemplates);

    viewModel.selectedCompetency = ko.observable(0);
    viewModel.dataSkill = ko.observable();
    viewModel.selectedSkill = ko.observable(0);
    viewModel.searchCheck = ko.observable(0);

    viewModel.selectedCompetency.subscribe(function (newValue) {
        viewModel.dataSkill(createListSkill("SkillMenu", viewModel.dataCompetency()[viewModel.selectedCompetency()].value));
    });
    viewModel.dataJobs = ko.observable(createListJobs());
    viewModel.selectedjob = ko.observable(0);
    viewModel.jobSeekerDetails = ko.observableArray();
    viewModel.searchByJobs = function () {
        viewModel.searchCheck(0);
        viewModel.jobSeekerDetails.removeAll();
        if (viewModel.selectedjob() > 0) {
            var dataSearchScore = getDetailsById("GetCalculatedScore", viewModel.dataJobs()[viewModel.selectedjob()].value, "", "search");
            getJobSeekerListForJob(dataSearchScore);
        }
        else {
            alert("Please select Job");
        }
    }

    viewModel.searchBySkills = function () {
        viewModel.searchCheck(0);
        viewModel.jobSeekerDetails.removeAll();
        if (viewModel.selectedSkill() > 0) {
            var dataSearchSkill = getListDetailsByIdType("MemberSkillById", viewModel.dataSkill()[viewModel.selectedSkill()].value, "skillId");
            getJobseekerListForSkill(dataSearchSkill);
        }
        else
            alert("Please select Competency and Skill");
    }

    function getJobseekerListForSkill(dataJobSeekerWithSkill) {
        var dataReviewObj = [];

        jobSeekerIdArray = [];
        for (da in dataJobSeekerWithSkill) {
            if (jobSeekerIdArray.indexOf(dataJobSeekerWithSkill[da].MemberId) == -1)
                jobSeekerIdArray.push(dataJobSeekerWithSkill[da].MemberId);
        }
        if (jobSeekerIdArray.length > 0) {
            jobSeekerListDetails(2, dataApplicantList, 0);
            viewModel.searchCheck(1);
            for (var i = 0; i < jobSeekerIdArray.length; i++) {
                var JobseekerListSkill = new JobSeekerDetails(jobSeekerIdArray[i], dataJobSeekerWithSkill, "", 2, dataReviewObj);                
                viewModel.jobSeekerDetails.push(JobseekerListSkill);
            }
        }
    }

    function getJobSeekerListForJob(dataJobSeekerWithSkill) {
        var dataReviewObj = [];

        var dataApplicantList = [];
        jobSeekerIdArray = [];
        for (da in dataJobSeekerWithSkill) {
            if (jobSeekerIdArray.indexOf(dataJobSeekerWithSkill[da].MemberId) == -1)
                jobSeekerIdArray.push(dataJobSeekerWithSkill[da].MemberId);
        }
        if (jobSeekerIdArray.length > 0) {
            jobSeekerListDetails(1, dataApplicantList, viewModel.dataJobs()[viewModel.selectedjob()].value);
            viewModel.searchCheck(1);
            for (var i = 0; i < jobSeekerIdArray.length; i++) {
                var JobseekerList = new JobSeekerDetails(jobSeekerIdArray[i], dataJobSeekerWithSkill, viewModel.dataJobs()[viewModel.selectedjob()].value, 1, dataReviewObj);
                viewModel.jobSeekerDetails.push(JobseekerList);
            }
        }
    }

    function createListJobs() {
        var list = [];
        list.push({ label: "Select", value: "" });
        for (da in dataJobList) {
            list.push({
                label: dataJobList[da].JobPosition,
                value: dataJobList[da].Id
            });
        }
        return list;
    }
});


