var viewModel = {}

$(function () {
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    Trimtext();
    viewModel.loadOps = 0;
    initModelData(viewModel, ['Header'], [null], ensureTemplates);
    initTemplates(viewModel, '/Templates/JobSeeker/', ["JobsApplied", "JobsSaved"], ensureTemplates);
    viewModel.noOfJobs = ko.observable();
    viewModel.noOfSavedJobs = ko.observable();
    viewModel.savedJobs = ko.observableArray();
    viewModel.appliedJobs = ko.observableArray();
    var dataAppliedJobsList = getList("JobSeekerAppliedJobs");
    var dataSavedJobsList = getList("JobSeekerSavedJobs");
    var dataAllCompany = getList("Company");
    var jobIdArray =[];
    var appliedJobIdArray = [];
    var savedJobIdArray = [];
    
    viewModel.noOfJobs(dataAppliedJobsList.length);
    viewModel.noOfSavedJobs(dataSavedJobsList.length);
    for (var i = 0; i < dataAppliedJobsList.length; i++) {
        appliedJobIdArray.push(dataAppliedJobsList[i].JobId);
        if (jobIdArray.indexOf(dataAppliedJobsList[i].JobId) == -1)
            jobIdArray.push(dataAppliedJobsList[i].JobId);
    }
    for (var i = 0; i < dataSavedJobsList.length; i++) {
        savedJobIdArray.push(dataSavedJobsList[i].JobId);
        if (jobIdArray.indexOf(dataSavedJobsList[i].JobId) == -1)
            jobIdArray.push(dataSavedJobsList[i].JobId);
    }
    
    if (jobIdArray.length > 0) {
        var dataObjJobsList = getSkillList("JobsByJobId", jobIdArray.toString());
        var dataobjJobPrerequisiteList = getSkillList("ListJobPrerequisite", jobIdArray.toString());
        var dataJobSkillList = getSkillList("SkillScoreCalculation", jobIdArray.toString());

        for (var i = 0; i < dataObjJobsList.length; i++) {
            if (appliedJobIdArray.indexOf(dataObjJobsList[i].Id) == -1) {
                var listJob = new createJobSeekerJobList(dataObjJobsList[i], 1);
                viewModel.savedJobs.push(listJob);
            }
            else {
                var listJob = new createJobSeekerJobList(dataObjJobsList[i], 0);
                viewModel.appliedJobs.push(listJob);
            }
        }
    }
    function createJobSeekerJobList(objJobs, applyCheck) {
        var self = this;        
        if (objJobs) {
            self.jobId = objJobs.Id;
            self.jobPosition = objJobs.JobPosition;
            for (var i = 0; i < dataAllCompany.length; i++) {
                if (objJobs.CompanyId == dataAllCompany[i].Id.toString()) {
                    self.employerName = dataAllCompany[i].CompanyName;
                    self.companyLocation = dataAllCompany[i].City;
                }
            }
            if (applyCheck == 0) {
                for (var i = 0; i < dataAppliedJobsList.length; i++) {
                    if (objJobs.Id == dataAppliedJobsList[i].JobId) {
                        self.dateApplied = convertDate(dataAppliedJobsList[i].DateApplied);
                    }
                }
            }
            else {
                for (var i = 0; i < dataSavedJobsList.length; i++) {
                    if (objJobs.Id == dataSavedJobsList[i].JobId) {
                        self.dateApplied = convertDate(dataSavedJobsList[i].DateApplied);
                    }
                }
            }
            self.datePosted = convertDate(objJobs.PostingDate);
            self.salaryRange = objJobs.MinimumSalary + ' ' + objJobs.MaximumSalary;
            self.jobDescription = objJobs.JobDescription;
            self.jobViews = objJobs.JobViews;
            self.applicants = objJobs.ApplicantsNumber;
            self.applicantsSkillScore = objJobs.ApplicantAverage;
            self.jobStatus = 'Filled';
            self.applyCheck = applyCheck;
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
});