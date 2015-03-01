var viewModel = {};
var jobSeekerIdArray = [];

$(function () {    
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }
    var dataFavouriteList = getList("Favourite");    
    viewModel["HeaderEmployer"] = ko.mapping.fromJS(getList("HeaderEmployer"));

    viewModel.loadOps = 0;
    initTemplates(viewModel, '/Templates/Employer/', ["JobApplicant", "ActivitySummary"], ensureTemplates);
    viewModel.jobSeekerDetails = ko.observableArray();
    for (da in dataFavouriteList) {
        if (jobSeekerIdArray.indexOf(dataFavouriteList[da].MemberId) == -1)
            jobSeekerIdArray.push(dataFavouriteList[da].MemberId);
    }
    if (jobSeekerIdArray.length > 0) {
        var dataJobSeekerSkillListObj = getListDetailsByIdType("MemberSkillById", jobSeekerIdArray.toString(), "list");
        jobSeekerListDetails(2, dataApplicantList, 0);
        for (var i = 0; i < jobSeekerIdArray.length; i++) {
            var JobseekerListSkill = new JobSeekerDetails(jobSeekerIdArray[i], dataJobSeekerSkillListObj, "", 2);
            JobseekerListSkill.appliedCheck(1)
            for (da in dataFavouriteList) {
                if (JobseekerListSkill.Id == dataFavouriteList[da].MemberId) {
                    JobseekerListSkill.collId = dataFavouriteList[da].Id;
                    break;
                }
            }
            viewModel.jobSeekerDetails.push(JobseekerListSkill);
        }
    }
});