var viewModel = {}
$(function () {
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    pagination();
    viewModel.loadOps = 0;
    initModelData(viewModel, ['ListJobSeekerMessage', 'Header'], [initListJobSeekerMessage, null], ensureTemplates);
    initTemplates(viewModel, '/Templates/JobSeeker/', ["MessageCenter"], ensureTemplates);

    function initListJobSeekerMessage() {
        viewModel.ListJobSeekerMessage.MemberData.extend({ paging: 5 });
        viewModel.editorMode = ko.observable('wysiwyg');
        viewModel.showPathSelector = ko.observable(true);
        viewModel.mode = ko.observable('ribbon');
        viewModel.showFooter = ko.observable(true);
        viewModel.text = ko.observable("");
        for (var j = 0; j < viewModel.ListJobSeekerMessage.MemberData().length; j++) {
            viewModel.ListJobSeekerMessage.MemberData()[j].btnrespondMessage = ko.observable('+');
            viewModel.ListJobSeekerMessage.MemberData()[j].btnPreviousMessage = ko.observable('+');
            if (viewModel.ListJobSeekerMessage.MemberData()[j].MessageSentDate) {
                viewModel.ListJobSeekerMessage.MemberData()[j].messageSendDate = convertDate(viewModel.ListJobSeekerMessage.MemberData()[j].MessageSentDate());
            }
            if (viewModel.ListJobSeekerMessage.MemberData()[j].JobPostedDate) {
                viewModel.ListJobSeekerMessage.MemberData()[j].datePosted = convertDate(viewModel.ListJobSeekerMessage.MemberData()[j].JobPostedDate());
            }
        }
        viewModel.saveSentMessage = function (objMessage) {
            var jsonObjectMessage = ko.toJS(objMessage);
            var jobSeekerMessageObj = {}
            jobSeekerMessageObj.CompanyId = jsonObjectMessage.CompanyId;
            jobSeekerMessageObj.EmployerId = jsonObjectMessage.EmployerId;
            jobSeekerMessageObj.JobId = jsonObjectMessage.JobId;
            jobSeekerMessageObj.SkillScore = jsonObjectMessage.SkillScore;
            jobSeekerMessageObj.Subject = jsonObjectMessage.MessageSubject;
            jobSeekerMessageObj.Message = $(".wijeditor").val();
            jobSeekerMessageObj.Date = new Date();
            jobSeekerMessageObj.ReplayMessage = jsonObjectMessage.MessageDetails;
            dataObjMessage = JSON.stringify(jobSeekerMessageObj);
            $.ajax({
                url: GetWebAPIURL() + '/api/EmployerMessage',
                type: "Post",
                data: dataObjMessage,
                headers: app.securityHeaders(),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    objMessage.btnrespondMessage('+');
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
        viewModel.cancelSentMessage = function (objMessage) {
            objMessage.btnrespondMessage('+');
            viewModel.text("");
        }
        viewModel.applyjob = function (objApplyJob) {
            var dataObjJobSeekerAppliedJobs = getSkillList("AppliedJobsJobId", objApplyJob.JobId());
            if (dataObjJobSeekerAppliedJobs.length > 0)
                alert("Job already applied");
            else
                window.location = "ApplyOpportunities.html?&jobId=" + objApplyJob.JobId();
        }
        viewModel.acceptOffer = function (objAccept) {
            var dataobjAcceptOffer;
            var jsonObjectAcceptOffer = ko.toJS(objAccept);
            var AcceptOfferObj = {}

            AcceptOfferObj.JobId = jsonObjectAcceptOffer.JobId;
            AcceptOfferObj.MemberId = jsonObjectAcceptOffer.MemberId;
            AcceptOfferObj.EmployerId = jsonObjectAcceptOffer.EmployerId;
            AcceptOfferObj.CompanyId = jsonObjectAcceptOffer.CompanyId;
            AcceptOfferObj.OfferStatus = 1;

            dataobjAcceptOffer = JSON.stringify(AcceptOfferObj);
            $.ajax({
                url: GetWebAPIURL() + '/api/OfferResponse',
                type: "Post",
                data: dataobjAcceptOffer,
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {

                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
        viewModel.rejectOffer = function (objReject) {
            var dataobjAcceptOffer;
            var jsonObjectAcceptOffer = ko.toJS(objReject);
            var AcceptOfferObj = {}

            AcceptOfferObj.JobId = jsonObjectAcceptOffer.JobId;
            AcceptOfferObj.EmployerId = jsonObjectAcceptOffer.EmployerId;
            AcceptOfferObj.CompanyId = jsonObjectAcceptOffer.CompanyId;
            AcceptOfferObj.OfferStatus = 2;

            dataobjAcceptOffer = JSON.stringify(AcceptOfferObj);
            $.ajax({
                url: GetWebAPIURL() + '/api/OfferResponse',
                type: "Post",
                data: dataobjAcceptOffer,
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {

                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });

            var jsonObjectDecline = ko.toJS(objReject);
            var dataobjDecline;
            var declineJobObj = {}
            declineJobObj.JobId = jsonObjectDecline.JobId;
            declineJobObj.MemberId = jsonObjectDecline.MemberId;
            dataobjDecline = JSON.stringify(declineJobObj);
            $.ajax({
                url: GetWebAPIURL() + '/api/DismissedCandidate',
                type: "Post",
                data: dataobjDecline,
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {

                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });

            var dataObjJobSeekerAppliedJobs = getSkillList("AppliedJobsJobId", jsonObjectDecline.JobId);
            if (dataObjJobSeekerAppliedJobs.length > 0) {
                var datarejectOffer;
                var rejectOffer = {}
                rejectOffer.JobId = dataObjJobSeekerAppliedJobs[0].JobId;
                rejectOffer.Id = dataObjJobSeekerAppliedJobs[0].Id;
                rejectOffer.DateApplied = dataObjJobSeekerAppliedJobs[0].DateApplied;
                rejectOffer.CoverLetter = dataObjJobSeekerAppliedJobs[0].CoverLetter;
                rejectOffer.Status = 3;
                datarejectOffer = JSON.stringify(rejectOffer);
                $.ajax({
                    url: GetWebAPIURL() + '/api/JobSeekerAppliedJobs/',
                    type: "PUT",
                    data: datarejectOffer,
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {

                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
        viewModel.declineJob = function (objDecline) {
            var jsonObjectDecline = ko.toJS(objDecline);
            var dataobjDecline;
            var declineJobObj = {}
            declineJobObj.JobId = jsonObjectDecline.JobId;
            declineJobObj.MemberId = jsonObjectDecline.MemberId;
            dataobjDecline = JSON.stringify(declineJobObj);
            $.ajax({
                url: GetWebAPIURL() + '/api/DismissedCandidate',
                type: "Post",
                data: dataobjDecline,
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {

                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
        viewModel.respondMessage = function (objMessage) {
            toggle(objMessage.btnrespondMessage);           
        }
        viewModel.previousMessage = function (objMessage) {
            toggle(objMessage.btnPreviousMessage);                      
        }
    }
});