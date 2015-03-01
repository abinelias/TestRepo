var viewModel = {}
initMultiselectBindings();

$(document).ready(function () {
    viewModel.dataIndustry = ko.observable(createListSkill("Category", 0));
    viewModel.selectedIndexIndustry = ko.observable(0);
    viewModel.dataPrerequisiteType = ko.observable();
    viewModel.selectedIndexPrerequisiteType = ko.observable(0);
    viewModel.PrerequisiteName = ko.observable();

    viewModel.selectedIndexIndustry.subscribe(function (newValue) {
        var industryId = viewModel.selectedIndexIndustry();
        if (industryId != '') {
            viewModel.dataPrerequisiteType(createListSkill("PrerequisiteTypeList", industryId));
        }
    });

    viewModel.savePrerequisite = function () {
        var dataObjPrerequisite;
        var prerequisiteObj = {}
        prerequisiteObj.PrerequisiteName = viewModel.PrerequisiteName();
        prerequisiteObj.ParentId = viewModel.dataPrerequisiteType()[viewModel.selectedIndexPrerequisiteType()].value;

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

