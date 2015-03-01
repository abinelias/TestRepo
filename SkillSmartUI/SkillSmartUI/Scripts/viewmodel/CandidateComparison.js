var viewModel = {}
var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
var jobseekerList = hashes[1].substring(10);
var jobSeekerId = jobseekerList.split(",");
var jobId = hashes[2].substring(6);

$(function () {
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    viewModel["HeaderEmployer"] = ko.mapping.fromJS(getList("HeaderEmployer"));
    var candidateDetails = getListDetailsByIdType("CandidateComparison", jobSeekerId.toString(), jobId);
    viewModel.loadOps = 0;
    initTemplates(viewModel, '/Templates/Employer/', ["CandidateGrid", "ActivitySummary"], ensureTemplates);

    var creditorData = {};
    creditorData.MemberData = candidateDetails;
    viewModel['CandidateComparison'] = ko.mapping.fromJS(creditorData);
    viewModel.deleteCandidate = function (objCandidate) {
        viewModel.CandidateComparison.MemberData.remove(objCandidate);
    }

    viewModel.markFavorite = function (objCandidate) {

    }
    viewModel.watchApplicantProfile = function (objCandidate) {
        window.location = "ApplicantFullProfile.html?&JobseekerId=" + objCandidate.MemberId();
    }
});