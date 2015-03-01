var viewModel = {};
var jobIdArray = [];
var jobSeekerIdArray = [];
var dataJoblist = [];

$(function () {
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    viewModel["HeaderEmployer"] = ko.mapping.fromJS(getList("HeaderEmployer"));

    var dataCompany = getListById("Company", viewModel.HeaderEmployer.CompanyId());
    var dataReviewObj = getList("CandidateComments");
    for (var j = 0; j < dataReviewObj.length; j++) {
        jobIdArray.push(dataReviewObj[j].JobId);
        if (jobSeekerIdArray.indexOf(dataReviewObj[j].MemberId) == -1)
            jobSeekerIdArray.push(dataReviewObj[j].MemberId);
    }

    if (jobIdArray.length > 0) {
        dataJoblist = getListById("JobsByJobId", jobIdArray.toString());
    }

    Trimtext();
    viewModel.loadOps = 0;
    viewModel['companyData'] = ko.mapping.fromJS(dataCompany);
    var creditorData = {};
    creditorData.MemberData = dataJoblist;
    viewModel['JobsList'] = ko.mapping.fromJS(creditorData);
    if (jobIdArray.length > 0) {
        dataApplicantList = ["1"];
        var dataSkillObj = getListById("GetJobSkills", jobIdArray.toString());
        var dataJobPrerequisiteList = getListById("GetJobPrerequisites", jobIdArray.toString());
        var dataApplicantScore = getDetailsById("GetCalculatedScore", jobIdArray.toString(), jobSeekerIdArray.toString(), "applicant");
        jobSeekerListDetails(1, dataApplicantList, jobIdArray.toString());
    }
    var competencyId;
    var currentCompetencyObj;
    viewModel.importance = ko.observableArray();
    for (var i = 1; i <= 10; i++) {
        viewModel.importance.push({
            name: i,
            id: i
        });
    }
    for (var i = 0; i < viewModel.JobsList.MemberData().length; i++) {
        viewModel.JobsList.MemberData()[i].candidateComment = ko.observable('');
        viewModel.JobsList.MemberData()[i].btnJobDetails = ko.observable('+');
        viewModel.JobsList.MemberData()[i].btnApplicantDetails = ko.observable('+');
        if (viewModel.JobsList.MemberData()[i].PostingDate)
            viewModel.JobsList.MemberData()[i].postingdate = convertDate(viewModel.JobsList.MemberData()[i].PostingDate());
        viewModel.JobsList.MemberData()[i].CompetencyArray = ko.observableArray();
        viewModel.JobsList.MemberData()[i].prerequisiteArray = ko.observableArray();
        viewModel.JobsList.MemberData()[i].jobSeekerDetails = ko.observableArray();

        for (var j = 0; j < dataSkillObj.length; j++) {            
            if (dataSkillObj[j].JobId == viewModel.JobsList.MemberData()[i].Id()) {
                if (dataSkillObj[j].CompetencyId != competencyId) {
                    var jobCompetency = new createCompetency(dataSkillObj[j]);
                    viewModel.JobsList.MemberData()[i].CompetencyArray.push(jobCompetency);
                    competencyId = dataSkillObj[j].CompetencyId;
                    currentCompetencyObj = jobCompetency;
                }
                else {
                    var skillObj = new createSkill(dataSkillObj[j]);
                    currentCompetencyObj.SkillArray.push(skillObj);
                    competencyId = dataSkillObj[j].CompetencyId;
                }
            }
        }
        for (var j = 0; j < dataJobPrerequisiteList.length; j++) {
            if (dataJobPrerequisiteList[j].JobId == viewModel.JobsList.MemberData()[i].Id()) {
                var prerequisiteLists = new createPrerequisite(dataJobPrerequisiteList[j]);
                viewModel.JobsList.MemberData()[i].prerequisiteArray.push(prerequisiteLists);
            }
        }
        for (var j = 0; j < dataReviewObj.length; j++) {
            if (dataReviewObj[j].JobId == viewModel.JobsList.MemberData()[i].Id()) {
                var JobseekerList = new JobSeekerDetails(dataReviewObj[j].MemberId, dataApplicantScore, viewModel.JobsList.MemberData()[i].Id(), 1, dataReviewObj);
                JobseekerList.reviewCheck('1');
                viewModel.JobsList.MemberData()[i].jobSeekerDetails.push(JobseekerList);
            }
        }        
    }
    initTemplates(viewModel, '/Templates/Employer/', ["JobListReview", "JobApplicant", "ActivitySummary"], ensureTemplates);
    viewModel.expandJobDetails = function (objJobDetails) {
        toggle(objJobDetails.btnJobDetails);
    }
    viewModel.expandCompetencyDetails = function (objJobDetails) {
        toggle(objJobDetails.btnCompetencyList);
    }
    viewModel.expandJobSkillDetails = function (objExpand) {
        toggle(objExpand.btnSkillList);
    }
    viewModel.expandApplicantDetails = function (objExpand) {
        toggle(objExpand.btnApplicantDetails);
    }
    var commentText;
    viewModel.editComments = function (obj) {
        obj.viewComments('1');
        commentText = obj.candidateComments();
    }
    viewModel.saveComment = function (obj) {
        var dataobjSaveComments;
        var candidateCommentsObj = {}       
        candidateCommentsObj.Comments = obj.candidateComments();
        candidateCommentsObj.MemberId = obj.Id;
        candidateCommentsObj.JobId = obj.jobId;
        candidateCommentsObj.Id = obj.commentId();
        dataobjSaveComments = JSON.stringify(candidateCommentsObj);
        $.ajax({
            url: GetWebAPIURL() + '/api/CandidateComments/',
            type: "PUT",
            data: dataobjSaveComments,
            contentType: "application/json; charset=utf-8",
            async: false,
            headers: app.securityHeaders(),
            success: function (data) {
                obj.viewComments('0');
            },
            error: function (xhr, status, error) {
                app.manageError(error);
            }
        });
    }
    viewModel.cancelComment = function (obj) {
        obj.viewComments('0');
        obj.candidateComments(commentText);
    }
    function createCompetency(skillCollection) {
        var self = this;
        self.CompetencyName = ko.observable(skillCollection.CompetencyName);
        self.btnCompetencyList = ko.observable('+');
        self.SkillArray = ko.observableArray();
        var skillObj = new createSkill(skillCollection );
        self.SkillArray.push(skillObj);
    }
    function createSkill(objSkill) {
        var self = this;
        self.btnSkillList = ko.observable('+');
        self.Required = ko.observable(objSkill.Required);
        self.SkillImportance = ko.observable(objSkill.SkillImportance);
        self.SkillScore = ko.observable(objSkill.SkillScore);
        self.skillName = ko.observable(objSkill.SkillName);
    }
    function createPrerequisite(objPrerequisite) {
        var self = this;
        self.PrerequisiteName = ko.observable(objPrerequisite.PrerequisiteName);
        self.TypeName = ko.observable(objPrerequisite.TypeName);
    }
   
});
