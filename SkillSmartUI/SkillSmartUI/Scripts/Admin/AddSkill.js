var viewModel = {}
$(document).ready(function () {
    viewModel.SkillName = ko.observable();
    viewModel.SkillDescription = ko.observable();
    viewModel.saveSkill = function () {
        var dataObjSkill;
        var skillObj = {}
        skillObj.Name = viewModel.SkillName();
        skillObj.Description = viewModel.SkillDescription();
        dataObjSkill = JSON.stringify(skillObj);
        alert(dataObjSkill);
        $.ajax({
            url: GetWebAPIURL() + '/api/Skill/',
            type: "POST",
            data: dataObjSkill,
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

