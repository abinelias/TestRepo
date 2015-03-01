var viewModel = {}
$(document).ready(function () {
    viewModel.LookUpName = ko.observable();
    viewModel.AbbrevationName = ko.observable();
    viewModel.saveLookUp = function () {
        var dataObjSkill;
        var skillObj = {}
        skillObj.Name = viewModel.LookUpName();
        skillObj.Abbreviation = viewModel.AbbrevationName();
        skillObj.CountryId = 1;
        dataObjSkill = JSON.stringify(skillObj);
        $.ajax({
            url: GetWebAPIURL() + '/api/Lookup?name=' + "RefState",
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