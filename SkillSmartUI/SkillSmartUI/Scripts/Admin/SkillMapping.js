var viewModel = {}
initMultiselectBindings();

$(document).ready(function () {
    var dataObj = getListSkillDetails();
    viewModel.dataIndustry = ko.observable(createListSkill("Category", 0));
    viewModel.selectedIndexIndustry = ko.observable(0);
    viewModel.dataCompetency = ko.observable();
    viewModel.selectedIndexCompetency = ko.observable(0);
    viewModel.CompetencyName = ko.observable();
    viewModel.CompetencyId = ko.observable();
    viewModel.selectedIndexSkill = ko.observableArray();
    viewModel.dataSkill = ko.observable(createListSkillDetails(dataObj));

    viewModel.selectedIndexIndustry.subscribe(function (newValue) {
        var industryId = viewModel.selectedIndexIndustry();
        if (industryId != '') {
            viewModel.dataCompetency(createListSkill("Category", industryId));
        }
    });

    viewModel.saveSkillMap = function () {
        var dataObjSkillMapping;
        var SkillMapObj = {}
        for (var i = 0; i < viewModel.selectedIndexSkill().length; i++) {
            SkillMapObj.SkillId = viewModel.selectedIndexSkill()[i];
            SkillMapObj.CompetencyId = viewModel.dataCompetency()[viewModel.selectedIndexCompetency()].value;
            dataObjSkillMapping = JSON.stringify(SkillMapObj);
            $.ajax({
                url: GetWebAPIURL() + '/api/SkillMap/',
                type: "POST",
                data: dataObjSkillMapping,
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {

                },
                error: function (xhr, error) {
                    alert('Error :' + error);
                }
            });
        }
       
    }
    function getListSkillDetails() {
        var dataObj;
        $.ajax({
            url: GetWebAPIURL() + '/api/Skill/',
            type: 'GET',
            async: false,
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                dataObj = data;
            },
            error: function (xhr, status, error) {
                app.manageError(error);
            }
        });
        return dataObj;
    }
    function createListSkillDetails(dataObj) {
        var list = [];
        list.push({ label: "Select", value: "" });
        for (da in dataObj) {
            list.push({
                label: dataObj[da].Name,
                value: dataObj[da].Id
            });
        }
        return list;
    }
    ko.applyBindings(viewModel, $('#content')[0]);
});

