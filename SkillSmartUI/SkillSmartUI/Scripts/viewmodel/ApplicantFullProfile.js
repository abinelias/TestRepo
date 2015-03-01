var viewModel = {};
var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
var jobSeekerId = hashes[1].substring(12);
$(function () {
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    viewModel["HeaderEmployer"] = ko.mapping.fromJS(getList("HeaderEmployer"));
    viewModel.loadOps = 0;
    initModelDataEmp(viewModel, ['MemberWorkHistories', 'MemberEducation', 'MemberCertification', 'MemberTrainingCourse', 'MemberAward', 'MemberActivities', 'MemberLanguage', 'MemberInformation'], jobSeekerId);
    var dataJobSeekerSkillListObj = getListDetailsByIdType("MemberSkillById", jobSeekerId, "list");
    var dataSupporting = getListById("MemberSupporting", jobSeekerId);
    var dataRelated = getListById("MemberRelatedExperience", jobSeekerId);
    var dataReference = getListById("MemberReference", jobSeekerId);
    viewModel.IndustryArray = ko.observableArray();
    viewModel.btnIndustry = ko.observable('+');
   
    var industryId;
    var competencyId;
    var currentIndustryObj;
    var currentCompetencyObj;
    for (da in dataJobSeekerSkillListObj) {
        if (dataJobSeekerSkillListObj[da].IndustryId != industryId) {
            competencyId = 0;
            var industryObj = new listIndustry(dataJobSeekerSkillListObj[da]);
            industryId = dataJobSeekerSkillListObj[da].IndustryId;
            competencyId = dataJobSeekerSkillListObj[da].CompetencyId;
            viewModel.IndustryArray.push(industryObj);
            currentIndustryObj = industryObj;
        }
        else
            if (dataJobSeekerSkillListObj[da].CompetencyId != competencyId) {
                var skillObj = new listCompetency(dataJobSeekerSkillListObj[da]);
                competencyId = dataJobSeekerSkillListObj[da].CompetencyId;
                currentCompetencyObj = skillObj;
                currentIndustryObj.competencyArray.push(skillObj);
            }
            else {
                var skillObj = new listSkil(dataJobSeekerSkillListObj[da]);
                currentCompetencyObj.skillArray.push(skillObj);
                industryId = dataJobSeekerSkillListObj[da].IndustryId;
            }
    }
    for (var j = 0; j < viewModel.MemberWorkHistories.MemberData().length; j++) {
        viewModel.MemberWorkHistories.MemberData()[j].btnWorkSkill = ko.observable('+');
        viewModel.MemberWorkHistories.MemberData()[j].skillAcquiredCheck = ko.observable(1);
    }
    for (var j = 0; j < viewModel.MemberEducation.MemberData().length; j++) {
        viewModel.MemberEducation.MemberData()[j].btnEducationSkill = ko.observable('+');
        viewModel.MemberEducation.MemberData()[j].skillAcquiredCheck = ko.observable(2);
    }
    for (var j = 0; j < viewModel.MemberCertification.MemberData().length; j++) {
        viewModel.MemberCertification.MemberData()[j].btnCertificationSkill = ko.observable('+');
        viewModel.MemberCertification.MemberData()[j].skillAcquiredCheck = ko.observable(3);
    }
    for (var j = 0; j < viewModel.MemberTrainingCourse.MemberData().length; j++) {
        viewModel.MemberTrainingCourse.MemberData()[j].btnTrainingSkill = ko.observable('+');
        viewModel.MemberTrainingCourse.MemberData()[j].skillAcquiredCheck = ko.observable(4);
    }

    initTemplates(viewModel, '/Templates/Employer/', ["CandidateFullProfile", "ActivitySummary"], ensureTemplates);

    function listIndustry(skillCollection) {
        var self = this;
        var competencyObj = new listCompetency(skillCollection);
        self.btnIndustryList = ko.observable('+');
        self.competencyArray = ko.observableArray();
        currentCompetencyObj = competencyObj;
        self.industryName = skillCollection.Industry;
        self.competencyArray.push(competencyObj);
    }

    function listCompetency(skillCollection) {
        var self = this;
        self.btnSpecialityList = ko.observable('+');
        var skillObj = new listSkil(skillCollection);
        self.btnSkill = ko.observable('+');
        self.skillArray = ko.observableArray();
        self.competencyName = skillCollection.Competency;
        self.skillArray.push(skillObj);
    }

    function listSkil(skillCollection) {
        var self = this;
        self.SkillId = ko.observable('');
        self.SkillAcquiredId = ko.observable('');
        self.SkillParentId = ko.observable('');
        self.val = ko.observable(skillCollection.SkillScore);
        self.min = 0;
        self.max = 10;
        self.btnSkillList = ko.observable('+');
        self.validationFactor = ko.observable();
        if (skillCollection) {
            self.skillName = skillCollection.Skill;
            self.SkillId(skillCollection.Id);
            self.SkillAcquiredId(skillCollection.AcquiredId);
            self.SkillParentId(skillCollection.SkillParentCollectionId);
        }

        self.relatedExperienceArray = ko.observableArray();
        if (dataRelated) {
            for (var i = 0; i < dataRelated.length; i++) {
                if (dataRelated[i].MemberSkillId == self.SkillId())
                    self.relatedExperienceArray.push(ko.mapping.fromJS(dataRelated[i]));
            }
        }

        self.supportingMaterialArray = ko.observableArray();
        if (dataSupporting) {
            for (var i = 0; i < dataSupporting.length; i++) {
                if (dataSupporting[i].MemberSkillId == self.SkillId()) {
                    self.supportingMaterialArray.push(ko.mapping.fromJS(dataSupporting[i]));
                }
            }
        }

        self.referenceArray = ko.observableArray();
        if (dataReference) {
            for (var i = 0; i < dataReference.length; i++) {
                if (dataReference[i].MemberSkillId == self.SkillId())
                    self.referenceArray.push(ko.mapping.fromJS(dataReference[i]));
            }
        }
    }


    viewModel.expandSpecialityDetails = function (objExpand) {
        toggle(objExpand.btnSpecialityList);       
    }

    viewModel.expandSkillDetails = function (objExpand) {
        if (objExpand.btnSkillList() == '+') {
            objExpand.btnSkillList('-');
            var factorScore = 0;
            if (objExpand.referenceArray().length != 0) {
                factorScore = factorScore + 1;
            }
            if (objExpand.supportingMaterialArray().length != 0) {
                factorScore = factorScore + 1;
            }
            if (objExpand.relatedExperienceArray().length != 0) {
                factorScore = factorScore + 1;
            }
            objExpand.validationFactor(factorScore);
        }
        else {
            objExpand.btnSkillList('+');
        }
    }
    viewModel.expandWorkSkill = function (workExperienceobj) {
        toggle(workExperienceobj.btnWorkSkill);       
    }
    viewModel.expandEducationSkill = function (educationObj) {
        toggle(educationObj.btnEducationSkill);        
    }
    viewModel.expandCertificationSkill = function (certificationobj) {
        toggle(certificationobj.btnCertificationSkill);
    }
    viewModel.expandTrainingSkill = function (trainingobj) {
        toggle(trainingobj.btnTrainingSkill);
    }

    viewModel.jobSeekerMarkFavourite = function () {
        var flag = 1;
        var dataMyFavouriteobj = getSkillList("FavouriteByMemberId", jobSeekerId)
        if (dataMyFavouriteobj.length > 0) {
            flag = 0;
            alert("This SkillSeeker is already marked as favorite");
        }

        if (flag == 1) {
            var dataobjmarkFavourite;
            var markFavouriteObj = {}
            markFavouriteObj.MemberId = jobSeekerId;
            dataobjmarkFavourite = JSON.stringify(markFavouriteObj);
            $.ajax({
                url: GetWebAPIURL() + '/api/Favourite/',
                type: "POST",
                headers: app.securityHeaders(),
                data: dataobjmarkFavourite,
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    alert("Marked the Candidate as favorite");
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
    }
    viewModel.messaging = function (objCandidate) {
        window.location = "EmployerMessage.html?&JobseekerId=" + jobSeekerId;
    }
    viewModel.expandIndustryDetails = function () {
        toggle(viewModel.btnIndustry);
    }

});

