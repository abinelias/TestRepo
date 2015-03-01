var viewModel = {}
$(document).ready(function () {
    viewModel.dataIndustry = ko.observable(createListSkill("Category", 0));
    viewModel.selectedIndexIndustry = ko.observable(0);

    viewModel.CompetencyName = ko.observable();
    viewModel.CompetencyId = ko.observable();
    viewModel.savePrerequisiteType = function () {
        var dataObjCompetency;
        var competencyObj = {}
        competencyObj.Id = viewModel.CompetencyId();
        competencyObj.Name = viewModel.CompetencyName();
        competencyObj.ParentId = viewModel.selectedIndexIndustry();
        dataObjCompetency = JSON.stringify(competencyObj);
        $.ajax({
            url: GetWebAPIURL() + '/api/Category/',
            type: "POST",
            data: dataObjCompetency,
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

