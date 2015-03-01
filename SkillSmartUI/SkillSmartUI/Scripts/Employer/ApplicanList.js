function JobSeekerDetails(id, dataApplicantScore, jobId, type, dataReviewObj) {
    var self = this;
    self.workExperienceDetails = ko.observableArray();
    self.educationDetails = ko.observableArray();
    self.certification = ko.observableArray();
    self.trainingCourse = ko.observableArray();
    self.userInformation = ko.observableArray();

    self.btnExpandDetails = ko.observable('+');
    self.reviewCheck = ko.observable('0');
    self.btnFlagforReview = ko.observable('+');
    self.viewComments = ko.observable('0');

    self.candidateComments = ko.observable();
    self.commentId = ko.observable();
    self.skillType = ko.observable(type);
    self.appliedCheck = ko.observable(0);
    self.compare = ko.observable(false);
    self.applicantName = ko.observable();
    self.Id = id;
    self.jobId = jobId;
    self.collId = "";

    self.companyNames = ko.observable();
    self.currentPositions = ko.observable();
    self.startDate = ko.observable();
    self.companyLocations = ko.observable();
    self.totalSkillScore = 0;

    if (type == 1) {
        self.requiredSkills = ko.observableArray();
        var totalEmployerScore = 0;
        var totalJobseekerScore = 0;
        for (da in dataApplicantScore) {
            if ((dataApplicantScore[da].MemberId == id) && (dataApplicantScore[da].JobId == jobId)) {
                totalEmployerScore = totalEmployerScore + dataApplicantScore[da].skillScoreEmployer;
                totalJobseekerScore = totalJobseekerScore + dataApplicantScore[da].skillScoreJobSeeker;
                var status = '';
                if (dataApplicantScore[da].skillScoreJobSeeker < 50)
                    status = 'low';
                else if (dataApplicantScore[da].skillScoreJobSeeker >= 50 && dataApplicantScore[da].skillScoreJobSeeker < 75)
                    status = 'medium';
                else
                    status = 'high';
                self.requiredSkills.push({ status: status, skillName: dataApplicantScore[da].SkillName, skillScore: dataApplicantScore[da].skillScoreJobSeeker });
            }
        }
        self.totalSkillScore = Math.round((totalJobseekerScore * 100) / totalEmployerScore);

        if (dataApplicantList.length > 0) {
            for (i = 0; i < dataApplicantList.length; i++) {
                if (dataApplicantList[i].JobId == jobId && dataApplicantList[i].MemberId == id)
                    self.appliedCheck(1);
            }
        }
        if (dataReviewObj.length > 0) {            
            for (da in dataReviewObj) {
                if (dataReviewObj[da].MemberId == id) {
                    self.candidateComments(dataReviewObj[da].Comments);
                    self.commentId(dataReviewObj[da].Id);
                }
            }
        }
    }

    else {
        self.IndustryArray = ko.observableArray();
        var industryId;
        var competencyId;
        var currentIndustryObj;
        var currentCompetencyObj;
        for (da in dataApplicantScore) {
            if (dataApplicantScore[da].MemberId == id) {
                if (dataApplicantScore[da].IndustryId != industryId) {
                    competencyId = 0;
                    var industryObj = new listIndustry(dataApplicantScore[da], dataSupporting, dataRelated, dataReference);
                    industryId = dataApplicantScore[da].IndustryId;
                    competencyId = dataApplicantScore[da].CompetencyId;
                    self.IndustryArray.push(industryObj);
                    currentIndustryObj = industryObj;
                }
                else
                    if (dataApplicantScore[da].CompetencyId != competencyId) {
                        var skillObj = new listCompetency(dataApplicantScore[da], dataSupporting, dataRelated, dataReference);
                        competencyId = dataApplicantScore[da].CompetencyId;
                        currentCompetencyObj = skillObj;
                        currentIndustryObj.competencyArray.push(skillObj);
                    }
                    else {
                        var skillObj = new listSkil(dataApplicantScore[da], dataSupporting, dataRelated, dataReference);
                        currentCompetencyObj.skillArray.push(skillObj);
                        industryId = dataApplicantScore[da].IndustryId;
                    }
            }
        }
    }

    for (da in dataWorkHistory) {
        if (dataWorkHistory[da].MemberId == id) {
            self.workExperienceDetails.push(ko.mapping.fromJS(dataWorkHistory[da]));
            self.companyNames(dataWorkHistory[da].CompanyName);
            self.currentPositions(dataWorkHistory[da].Position);
            self.startDate(dataWorkHistory[da].Date);
            self.companyLocations(dataWorkHistory[da].State);
        }
    }
    for (da in dataEducation) {
        if (dataEducation[da].MemberId == id)
            self.educationDetails.push(ko.mapping.fromJS(dataEducation[da]));
    }
    for (da in dataCertification) {
        if (dataCertification[da].MemberId == id)
            self.certification.push(ko.mapping.fromJS(dataCertification[da]));
    }
    for (da in dataTraining) {
        if (dataTraining[da].MemberId == id)
            self.trainingCourse.push(ko.mapping.fromJS(dataTraining[da]));
    }

    for (da in dataUserInformation) {
        if (dataUserInformation[da].MemberId == id) {
            self.applicantName(dataUserInformation[da].ApplicantName);
            self.userInformation.push(ko.mapping.fromJS(dataUserInformation[da]));
        }
    }
    self.skillScoreStatus = ko.pureComputed(function () {
        return self.skillType() == 2 ? "common_Skill_ListStyle" : "common_ApplicantLink";
    }, self);

    function listIndustry(skillCollection, dataSupporting, dataRelated, dataReference) {
        var self = this;
        var competencyObj = new listCompetency(skillCollection, dataSupporting, dataRelated, dataReference);
        self.competencyArray = ko.observableArray();
        currentCompetencyObj = competencyObj;
        self.industryName = skillCollection.Industry;
        self.competencyArray.push(competencyObj);
    }

    function listCompetency(skillCollection, dataSupporting, dataRelated, dataReference) {
        var self = this;
        var skillObj = new listSkil(skillCollection, dataSupporting, dataRelated, dataReference);
        self.btnSpecialityList = ko.observable('+');
        self.skillArray = ko.observableArray();
        self.competencyName = skillCollection.Competency;
        self.skillArray.push(skillObj);
    }

    function listSkil(skillCollection, dataSupporting, dataRelated, dataReference) {
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
                if (dataSupporting[i].MemberSkillId == self.SkillId())
                    self.supportingMaterialArray.push(ko.mapping.fromJS(dataSupporting[i]));
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
}
viewModel.btnIndustry = ko.observable('+');
viewModel.expandIndustryDetails = function () {
    toggle(viewModel.btnIndustry);
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
viewModel.expandSpecialityDetails = function (objExpand) {
    toggle(objExpand.btnSpecialityList);
}
viewModel.jobSeekerMarkFavourite = function (objJobSeeker) {
    var flag = 1;
    var dataMyFavouriteobj = getSkillList("FavouriteByMemberId", objJobSeeker.Id)
    if (dataMyFavouriteobj.length > 0) {
        flag = 0;
        alert("This SkillSeeker is already marked as favorite");
    }

    if (flag == 1) {
        var dataobjmarkFavourite;
        var markFavouriteObj = {}
        markFavouriteObj.MemberId = objJobSeeker.Id;
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
viewModel.jobSeekerWatch = function (objJobSeeker) {
    window.location = "ApplicantFullProfile.html?&JobseekerId=" + objJobSeeker.Id;
}
viewModel.jobSeekerViewFullProfile = function (objJobSeeker) {
    window.location = "ApplicantFullProfile.html?&JobseekerId=" + objJobSeeker.Id;
}
viewModel.jobSeekerMessages = function (objCandidate) {
    window.location = "EmployerMessage.html?&JobseekerId=" + objCandidate.Id;
}
viewModel.JobSeekerSendMessage = function (objCandidate) {
    var key = 1;
    window.location = "EmployerMessage.html?&JobseekerId=" + objCandidate.Id + "&sendMessageCheck=" + key + "&jobId=" + objCandidate.jobId + "&Score=" + objCandidate.totalSkillScore;
}


viewModel.extendOffer = function (objCandidate) {
    var jsonObjInvite = ko.toJS(objCandidate);
    var extendOfferObj = {}
    extendOfferObj.MemberId = jsonObjInvite.Id;
    extendOfferObj.CompanyId = viewModel.HeaderEmployer.CompanyId();
    extendOfferObj.JobId = jsonObjInvite.jobId;
    extendOfferObj.Subject = "Invitation to apply";
    extendOfferObj.Message = "Apply the job";
    extendOfferObj.Date = new Date();
    extendOfferObj.MessageType = 2;
    extendOfferObj.SkillScore = jsonObjInvite.totalSkillScore;
    dataobjInvite = JSON.stringify(extendOfferObj);

    var apiUrlMessage = GetWebAPIURL() + '/api/JobSeekerMessage';
    $.ajax({
        url: apiUrlMessage,
        type: "Post",
        data: dataobjInvite,
        contentType: "application/json; charset=utf-8",
        async: false,
        headers: app.securityHeaders(),
        success: function (data) {

        },
        error: function (xhr, status, error) {
            app.manageError(error);
        }
    });
}

viewModel.unfavorite = function (objJobSeeker) {
    $.ajax({
        url: GetWebAPIURL() + '/api/Favourite?Id=' + objJobSeeker.collId,
        type: "DELETE",
        contentType: "application/json; charset=utf-8",
        async: false,
        success: function (data) {
            alert("Successfully Deleted the candidate from your favourite list");
            viewModel.jobSeekerDetails.remove(objJobSeeker);
        },
        error: function (xhr, status, error) {
            app.manageError(error);
        }
    });
}

viewModel.flagforReview = function (objExpand) {
    toggle(objExpand.btnFlagforReview);
}
viewModel.inviteToApply = function (objCandidate) {
    var jsonObjInvite = ko.toJS(objCandidate);
    var inviteMessageObj = {}
    inviteMessageObj.MemberId = jsonObjInvite.Id;
    inviteMessageObj.CompanyId = viewModel.HeaderEmployer.CompanyId();
    inviteMessageObj.JobId = jsonObjInvite.jobId;
    inviteMessageObj.Subject = "Invitation to apply";
    inviteMessageObj.Message = "Apply the job";
    inviteMessageObj.Date = new Date();
    inviteMessageObj.MessageType = 3;
    inviteMessageObj.SkillScore = jsonObjInvite.totalSkillScore;
    dataobjInvite = JSON.stringify(inviteMessageObj);
    var apiUrlMessage = GetWebAPIURL() + '/api/JobSeekerMessage';
    $.ajax({
        url: apiUrlMessage,
        type: "Post",
        data: dataobjInvite,
        contentType: "application/json; charset=utf-8",
        async: false,
        headers: app.securityHeaders(),
        success: function (data) {

        },
        error: function (xhr, status, error) {
            app.manageError(error);
        }
    });
}
viewModel.compareCandidate = function (obj) {
    var compareFlag = 0;
    var jobseekerCompareList = [];
    var jobid = '';
    if (!viewModel.jobSeekerDetails) {
        for (i = 0; i < obj.jobSeekerDetails().length; i++) {
            if (obj.jobSeekerDetails()[i].compare() == true) {
                jobseekerCompareList.push(obj.jobSeekerDetails()[i].Id);
                jobid = obj.jobSeekerDetails()[i].jobId;
                compareFlag = 1;
            }
        }
    }
    else {
        for (i = 0; i < viewModel.jobSeekerDetails().length; i++) {
            if (viewModel.jobSeekerDetails()[i].compare() == true) {
                jobseekerCompareList.push(viewModel.jobSeekerDetails()[i].Id);
                jobid = viewModel.jobSeekerDetails()[i].jobId;
                compareFlag = 1;
            }
        }
    }
    if (compareFlag == 1)
        window.location = "CompareCandidate.html?&Jobseeker=" + jobseekerCompareList + "&JobId=" + jobid;
    else
        alert("select Candidates to compare");
}
viewModel.expandDetails = function (objExpand) {
    toggle(objExpand.btnExpandDetails);
}
viewModel.saveReview = function (obj) {
    for (var i = 0; i < viewModel.userListId().length; i++) {
        var dataobjSaveComments;
        var candidateCommentsObj = {}
        candidateCommentsObj.Comments = "";
        candidateCommentsObj.MemberId = obj.Id;
        candidateCommentsObj.JobId = obj.jobId;
        candidateCommentsObj.EmployerId = viewModel.userListId()[i];
        dataobjSaveComments = JSON.stringify(candidateCommentsObj);
        $.ajax({
            url: GetWebAPIURL() + '/api/CandidateComments/',
            type: "POST",
            data: dataobjSaveComments,
            contentType: "application/json; charset=utf-8",
            async: false,
            headers: app.securityHeaders(),
            success: function (data) {
                obj.btnFlagforReview('+');
            },
            error: function (xhr, status, error) {
                app.manageError(error);
            }
        });
        var dataobjSentMessage;
        var employerSentMessage = {}

        employerSentMessage.MemberId = obj.Id;
        employerSentMessage.CompanyId = viewModel.HeaderEmployer.CompanyId();
        employerSentMessage.EmployerId = viewModel.userListId()[i];
        employerSentMessage.JobId = obj.jobId;
        employerSentMessage.Subject = "Review Candidate";
        employerSentMessage.Message = "Review Candidate Message";
        employerSentMessage.Date = new Date();
        employerSentMessage.SkillScore = obj.totalSkillScore;
        dataobjSentMessage = JSON.stringify(employerSentMessage);
        $.ajax({
            url: GetWebAPIURL() + '/api/EmployerMessage',
            type: "POST",
            data: dataobjSentMessage,
            contentType: "application/json; charset=utf-8",
            async: false,
            headers: app.securityHeaders(),
            success: function (data) {
            },
            error: function (xhr, status, error) {
                app.manageError(error);
            }
        });
    }

}
viewModel.cancelReview = function (obj) {
    obj.btnFlagforReview('+');
}
