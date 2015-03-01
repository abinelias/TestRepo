var viewModel = {}
$(document).ready(function () {
    viewModel.dataIndustry = ko.observable(createListSkill("Category", 0));
    viewModel.selectedIndexIndustry = ko.observable(0);
    viewModel.PrerequisiteTypeName = ko.observable();

    viewModel.savePrerequisiteType = function () {
        var dataObjPrerequisite;
        var prerequisiteObj = {}
        prerequisiteObj.PrerequisiteName = viewModel.PrerequisiteTypeName();
        prerequisiteObj.ParentId = viewModel.selectedIndexIndustry();
        dataObjPrerequisite = JSON.stringify(prerequisiteObj);
        alert(dataObjPrerequisite);
        $.ajax({
            url: GetWebAPIURL() + '/api/Prerequisite/',
            type: "POST",
            data: dataObjPrerequisite,
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (data) {

            },
            error: function (xhr, error) {
                alert('Error :' + error);
            }
        });
    }
    ko.applyBindings(viewModel, $('#content')[0]);
});

