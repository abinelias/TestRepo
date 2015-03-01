var viewModel = {}
viewModel.usersList = ko.observableArray();
viewModel.userListId = ko.observableArray();
var memberId = "00000000-0000-0000-0000-000000000000";
var flag = 0;
var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
if (hashes[1]) {
    memberId = hashes[1].substring(12);
}
if (hashes[2]) {
    var flag = 1;
    var jobid = hashes[3].substring(6);
    var score = hashes[4].substring(6);
}

$(function () {
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    var dataEmployerSentMessage = getList("CompanyUserSentMessage");

    viewModel["HeaderEmployer"] = ko.mapping.fromJS(getList("HeaderEmployer"));
    var messageData = getSkillList("CompanyUserMessage", memberId);
    var dataEmployerList = createListSkill("Employer", viewModel.HeaderEmployer.CompanyId());

    initMultiselectBindings();
    Trimtext();
    viewModel.loadOps = 0;
    viewModel.sentMessageCheck = ko.observable('0');
    viewModel.editorMode = ko.observable('wysiwyg');
    viewModel.showPathSelector = ko.observable(true);
    viewModel.mode = ko.observable('ribbon');
    viewModel.showFooter = ko.observable(true);
    viewModel.text = ko.observable("");
    viewModel.MessageCheck = ko.observable('0');
    viewModel.subject = ko.observable();
    if (flag == 1) {
        viewModel.MessageCheck('1');
    }
    var creditorData = {};
    creditorData.MemberData = dataEmployerSentMessage;
    viewModel['EmployerSentMessage'] = ko.mapping.fromJS(creditorData);
    for (var i = 0; i < viewModel.EmployerSentMessage.MemberData().length; i++) {
        viewModel.EmployerSentMessage.MemberData()[i].btnExpandMessage = ko.observable('+');
        if (viewModel.EmployerSentMessage.MemberData()[i].JobPostedDate)
            viewModel.EmployerSentMessage.MemberData()[i].datePosted = convert(viewModel.EmployerSentMessage.MemberData()[i].JobPostedDate());
        if (viewModel.EmployerSentMessage.MemberData()[i].MessageSentDate)
            viewModel.EmployerSentMessage.MemberData()[i].messageSentDate = convert(viewModel.EmployerSentMessage.MemberData()[i].MessageSentDate());
    }
    var creditorData = {};
    creditorData.MemberData = messageData;
    viewModel['employerMessage'] = ko.mapping.fromJS(creditorData);
    for (var i = 0; i < viewModel.employerMessage.MemberData().length; i++) {
        viewModel.employerMessage.MemberData()[i].btnExpandMessage = ko.observable('+');
        viewModel.employerMessage.MemberData()[i].btnrespondMessage = ko.observable('+');
        viewModel.employerMessage.MemberData()[i].btnPreviousMessage = ko.observable('+');
        if (viewModel.employerMessage.MemberData()[i].JobPostedDate)
            viewModel.employerMessage.MemberData()[i].datePosted = convert(viewModel.employerMessage.MemberData()[i].JobPostedDate());
        if (viewModel.employerMessage.MemberData()[i].MessageSentDate)
            viewModel.employerMessage.MemberData()[i].messageSentDate = convert(viewModel.employerMessage.MemberData()[i].MessageSentDate());
    }
    initTemplates(viewModel, '/Templates/Employer/', ["ActivitySummary", "MessageDetails", "SentMessages"], ensureTemplates);
    viewModel.sentMessages = function () {
        viewModel.sentMessageCheck('1');
    }
    viewModel.inbox = function () {
        viewModel.sentMessageCheck('0');
    }
    viewModel.expandMessageDetails = function (objMessage) {
        toggle(objMessage.btnExpandMessage);
    }
    viewModel.sendMessage = function (objMessage) {
        var dataobjSentMessage;
        var employerSentMessage = {}
        if (objMessage.MemberId != null) {           
            employerSentMessage.MemberId = objMessage.MemberId();
            employerSentMessage.CompanyId = viewModel.HeaderEmployer.CompanyId();
            employerSentMessage.EmployerId = objMessage.EmployerId();
            employerSentMessage.JobId = objMessage.JobId();
            employerSentMessage.SkillScore = objMessage.SkillScore();
            employerSentMessage.Subject = objMessage.MessageSubject();
            employerSentMessage.Date = new Date();
            employerSentMessage.ReplayMessage = objMessage.MessageDetails();
            employerSentMessage.Message = $(".wijeditor").val();
            employerSentMessage.MessageType = 1;
            dataobjSentMessage = JSON.stringify(employerSentMessage);
        }
        else {
            employerSentMessage.MemberId = memberId;
            employerSentMessage.CompanyId = viewModel.HeaderEmployer.CompanyId();
            employerSentMessage.JobId = jobid;
            employerSentMessage.SkillScore = score;
            employerSentMessage.Subject = viewModel.subject();
            employerSentMessage.Date = new Date();           
            employerSentMessage.Message = $(".wijeditor").val();
            employerSentMessage.MessageType = 1;
            dataobjSentMessage = JSON.stringify(employerSentMessage);
        }
        $.ajax({
            url: GetWebAPIURL() + '/api/JobSeekerMessage',
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

        for (var i = 0; i < viewModel.userListId().length; i++) {
            var dataobjEmpSentMessage;
            var employerMessage = {}
            if (objMessage.MemberId != null) {
                employerMessage.MemberId = objMessage.MemberId();
                employerMessage.CompanyId = viewModel.HeaderEmployer.CompanyId();
                employerMessage.EmployerId = viewModel.userListId()[i];
                employerMessage.JobId = objMessage.JobId();

                employerMessage.Subject = objMessage.MessageSubject();
                employerMessage.Message = $(".wijeditor").val();
                employerMessage.Date = new Date();
                employerMessage.SkillScore = objMessage.SkillScore();
                employerMessage.ReplayMessage = objMessage.MessageDetails();
                dataobjEmpSentMessage = JSON.stringify(employerMessage);
            }
            else {
                employerMessage.MemberId = memberId;
                employerMessage.CompanyId = viewModel.HeaderEmployer.CompanyId();
                employerMessage.EmployerId = userId;
                employerMessage.JobId = jobid;
                employerMessage.SkillScore = score;
                employerMessage.Message = $(".wijeditor").val();
                employerMessage.Subject = viewModel.subject();
                employerMessage.Date = new Date();               
                dataobjEmpSentMessage = JSON.stringify(employerMessage);
            }
            $.ajax({
                url: GetWebAPIURL() + '/api/EmployerMessage',
                type: "POST",
                data: dataobjEmpSentMessage,
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
        if (objMessage.MemberId != null) {
            objMessage.btnrespondMessage('+');
        }
        else {
            viewModel.MessageCheck('0');
        }
    }
    viewModel.cancelMessage = function (objMessage) {
        if (objMessage.MemberId!=null) {
            objMessage.btnrespondMessage('+');
        }
        else {
            viewModel.MessageCheck('0');
        }
       
    }
    viewModel.reply = function (objMessage) {
        objMessage.btnrespondMessage('-');
    }
    viewModel.viewApplicantProfile = function (objMessage) {
         window.location = "ApplicantFullProfile.html?&JobseekerId=" + objMessage.MemberId();
    }
       
    viewModel.previousMessage = function (objMessage) {
        toggle(objMessage.btnPreviousMessage);       
    }
});


