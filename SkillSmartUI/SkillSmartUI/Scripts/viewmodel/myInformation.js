var viewModel = {}

$(function () {
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }

    initMultiselectBindings();
    Trimtext();
    viewModel.loadOps = 0;
    initLookups(viewModel, ['RefLanguage', 'RefProficiency', 'RefWorkType', 'RefIndustry', 'RefDegreeType', 'RefProgramType', 'RefCurrentStatus', 'RefSecurityClearance', 'RefWillingToRelocate']);
    initModelData(viewModel, ['Profile', 'TrainingCourse', 'Certification', 'Education', 'WorkHistory', 'Scholarship', 'ExtraCurricularActivity', 'Language', 'Header'], [initProfile, initTrainingCourse, initCertification, initEducation, initWorkHistory, initScholarship, initExtraCurricularAcitivies, initLanguage, null], ensureTemplates);
    initTemplates(viewModel, '/Templates/JobSeeker/', ["PersonalInformation", "Languages", "WorkExperience", "Education", "Scholarship", "Certification", "TrainingCourse", "ExtraCurricularAcitivies", "Categories", "Reference", "SupportingMaterial", "RelatedExperience"], ensureTemplates);
    viewModel.mySkillCheck = ko.observable();   
    function initEducation()
    {
        viewModel.educationButtonCheck = ko.observable(1);
        for (var j = 0; j < viewModel.Education.MemberData().length; j++) {
            viewModel.Education.MemberData()[j].DegreeText = getLookUpText(viewModel.Education.MemberData()[j].DegreeId, viewModel.RefDegreeType);
            viewModel.Education.MemberData()[j].isEdit = ko.observable('0');
            viewModel.Education.MemberData()[j].btnSkill = ko.observable('+');
            viewModel.Education.MemberData()[j].addJobSeekerSkillDirectCheck = ko.observable('0');
            viewModel.Education.MemberData()[j].skillAcquiredId = 2;
            if (viewModel.Education.MemberData()[j].StartDate) {
                viewModel.Education.MemberData()[j].editStartDate = ko.observable(new Date(viewModel.Education.MemberData()[j].StartDate()));
                viewModel.Education.MemberData()[j].StartDate = convert(viewModel.Education.MemberData()[j].editStartDate());
            }
            if (viewModel.Education.MemberData()[j].EndDate) {
                viewModel.Education.MemberData()[j].editEndDate = ko.observable(new Date(viewModel.Education.MemberData()[j].EndDate()));
                viewModel.Education.MemberData()[j].EndDate = convert(viewModel.Education.MemberData()[j].editEndDate());
            }
            viewModel.Education.MemberData()[j].inSaveMode = ko.observable(false);
        }
        initStates(viewModel, 1);
        $('#cmbState').wijcombobox({ "data": viewModel.RefState });
        viewModel.addEducation = function ()
        {
            viewModel.educationButtonCheck(0);
            var initializeObject = { "Id": "", "InstitutionName": "", "DegreeId": 0, "StartDate": "", "EndDate": "", "Focus": "", "CurrentlyEnrolled": 0, "City": "", "StateId": "", "Online": "", "isEdit": "", "editStartDate": new Date(), "editEndDate": new Date(), "inSaveMode": false };
            var data = ko.mapping.fromJS(initializeObject);
            viewModel.Education.MemberData.splice(0, 0, data);
            viewModel.Education.MemberData()[0].btnSkill = ko.observable('+');
            viewModel.Education.MemberData()[0].addJobSeekerSkillDirectCheck = ko.observable('0');
            viewModel.Education.MemberData()[0].skillAcquiredId = 2;
            viewModel.Education.MemberData()[0].DegreeText = getLookUpText(viewModel.Education.MemberData()[0].DegreeId, viewModel.RefDegreeType);
            viewModel.Education.MemberData()[0].InstitutionName.extend({ required: true });
            viewModel.Education.MemberData()[0].Focus.extend({ required: true });
            viewModel.Education.MemberData()[0].City.extend({ required: true });
            viewModel.Education.MemberData()[0].isEdit("1");
            viewModel.Education.errors = ko.validation.group(viewModel.Education.MemberData()[0]);
        }
        viewModel.saveEducation = function (objSave)
        {
            objSave.inSaveMode(true);
            var valid = objSave.InstitutionName.isValid() && objSave.Focus.isValid() && objSave.DegreeId() > 0;
            var validationOnline = (objSave.Online() == false && objSave.City.isValid() && objSave.StateId() > 0) || (objSave.Online() == true);
            var validation = validationOnline && valid;
            if (!validation) {
                viewModel.Education.errors.showAllMessages(true);
                return;
            }
            if (objSave.Id() == "") {
                viewModel.Education.MemberData()[0].StartDate(objSave.editStartDate());
                viewModel.Education.MemberData()[0].EndDate(objSave.editEndDate());
                $.ajax({
                    url: GetWebAPIURL() + '/api/Education/',
                    type: "POST",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.Id(data);
                        objSave.isEdit('0');
                        objSave.inSaveMode(false);
                        objSave.StartDate(convert(objSave.StartDate()));
                        objSave.EndDate(convert(objSave.EndDate()));
                        viewModel.educationButtonCheck(1);
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
            else {
                objSave.StartDate = ko.observable(objSave.editStartDate());
                objSave.EndDate = ko.observable(objSave.editEndDate());
                $.ajax({
                    url: GetWebAPIURL() + '/api/Education/',
                    type: "PUT",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.isEdit('0');
                        objSave.inSaveMode(false);
                        objSave.StartDate(convert(objSave.StartDate()));
                        objSave.EndDate(convert(objSave.EndDate()));
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
        viewModel.cancelEducation = function (objCancel)
        {
            var indexId = viewModel.Education.MemberData.indexOf(objCancel);
            objCancel.inSaveMode(false);
            if (objCancel.Id() == "") {
                viewModel.Education.MemberData.remove(objCancel);
                viewModel.educationButtonCheck(1);
            }
            else {
                for (var j = 0; j < selectedEducation.length; j++) {
                    if (objCancel.Id() == selectedEducation[j].Id) {
                        viewModel.Education.MemberData.replace(viewModel.Education.MemberData()[indexId], ko.mapping.fromJS(selectedEducation[j]));
                        viewModel.Education.MemberData()[indexId].isEdit('0');
                        viewModel.Education.MemberData()[indexId].DegreeText = getLookUpText(viewModel.Education.MemberData()[indexId].DegreeId, viewModel.RefDegreeType);
                        selectedEducation.splice(j, 1);
                    }
                }
            }
        }
        var selectedEducation = [];
        viewModel.editEducation = function (objEdit) {
            var educationObj = ko.mapping.fromJS(objEdit);
            educationObj.InstitutionName.extend({ required: true });
            educationObj.Focus.extend({ required: true });
            educationObj.City.extend({ required: true });
            objEdit.isEdit('1');
            selectedEducation.push(ko.toJS(objEdit));
        }
        viewModel.deleteEducation = function (objDelete) {
            var deleteEducation = confirm("Do you want to delete!");
            if (deleteEducation == true) {
                $.ajax({
                    url: GetWebAPIURL() + '/api/Education?id=' + objDelete.Id(),
                    type: "DELETE",
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        viewModel.Education.MemberData.remove(objDelete);
                        objDelete.isEdit('0');
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
        viewModel.expandEducationSkill = function (educationObj) {
            toggle(educationObj.btnSkill);
        }
    }

    function initWorkHistory() {
        initStates(viewModel, 1);
        $('#cmbState').wijcombobox({ "data": viewModel.RefState });
        viewModel.workButtonCheck = ko.observable(1);
        for (var j = 0; j < viewModel.WorkHistory.MemberData().length; j++) {
            viewModel.WorkHistory.MemberData()[j].StateText = getLookUpText(viewModel.WorkHistory.MemberData()[j].StateId, viewModel.RefState);
            viewModel.WorkHistory.MemberData()[j].IndustryText = getLookUpText(viewModel.WorkHistory.MemberData()[j].IndustryId, viewModel.RefIndustry);
            viewModel.WorkHistory.MemberData()[j].WorkText = getLookUpText(viewModel.WorkHistory.MemberData()[j].WorkTypeId, viewModel.RefWorkType);
            viewModel.WorkHistory.MemberData()[j].inSaveMode = ko.observable(false);    
            viewModel.WorkHistory.MemberData()[j].isEdit = ko.observable('0');
            viewModel.WorkHistory.MemberData()[j].btnSkill = ko.observable('+');
            viewModel.WorkHistory.MemberData()[j].addJobSeekerSkillDirectCheck = ko.observable('0');
            viewModel.WorkHistory.MemberData()[j].skillAcquiredId = 1;
            if (viewModel.WorkHistory.MemberData()[j].StartDate) {
                viewModel.WorkHistory.MemberData()[j].editStartDate = ko.observable(new Date(viewModel.WorkHistory.MemberData()[j].StartDate()));
                viewModel.WorkHistory.MemberData()[j].StartDate = convert(viewModel.WorkHistory.MemberData()[j].editStartDate());
            }
            if (viewModel.WorkHistory.MemberData()[j].EndDate) {
                viewModel.WorkHistory.MemberData()[j].editEndDate = ko.observable(new Date(viewModel.WorkHistory.MemberData()[j].EndDate()));
                viewModel.WorkHistory.MemberData()[j].EndDate = convert(viewModel.WorkHistory.MemberData()[j].editEndDate());
            }
        }
        viewModel.addWorkExperience = function () {
            viewModel.workButtonCheck(0);
            var initializeObject = { "Id": "", "CompanyName": "", "IndustryId": 0, "Position": "", "StartDate": "", "EndDate": "", "CurrentJob": "", "WorkTypeId": 0, "Salary": "", "JobDuties": "", "SalaryType": "", "StateId": 0, "OtherIndustry": "", "isEdit": "", "editStartDate": new Date(), "editEndDate": new Date(), "inSaveMode": false, "StateText": "", "IndustryText": "", "WorkText": "", "btnSkill": "", "addJobSeekerSkillDirectCheck": "", "skillAcquiredId": "" };
            var data = ko.mapping.fromJS(initializeObject);
            viewModel.WorkHistory.MemberData.splice(0, 0, data);
            viewModel.WorkHistory.MemberData()[0].btnSkill = ko.observable('+');
            viewModel.WorkHistory.MemberData()[0].addJobSeekerSkillDirectCheck = ko.observable('0');
            viewModel.WorkHistory.MemberData()[0].skillAcquiredId = 1;
            viewModel.WorkHistory.MemberData()[0].StateText = getLookUpText(viewModel.WorkHistory.MemberData()[0].StateId, viewModel.RefState);
            viewModel.WorkHistory.MemberData()[0].IndustryText = getLookUpText(viewModel.WorkHistory.MemberData()[j].IndustryId, viewModel.RefIndustry);
            viewModel.WorkHistory.MemberData()[0].WorkText = getLookUpText(viewModel.WorkHistory.MemberData()[0].WorkTypeId, viewModel.RefWorkType);
            viewModel.WorkHistory.MemberData()[0].Position.extend({ required: true });
            viewModel.WorkHistory.MemberData()[0].JobDuties.extend({ required: true });
            viewModel.WorkHistory.MemberData()[0].Salary.extend({ required: true });
            viewModel.WorkHistory.MemberData()[0].OtherIndustry.extend({ required: true });
            viewModel.WorkHistory.MemberData()[0].CompanyName.extend({ required: true });
            viewModel.WorkHistory.MemberData()[0].isEdit("1");
            viewModel.WorkHistory.errors = ko.validation.group(viewModel.WorkHistory.MemberData()[0]);            
        }
        var selectedobj = [];
        viewModel.editWorkHistory = function (objEdit) {
            selectedobj.push(ko.mapping.toJS(objEdit));
            var myObject = ko.mapping.fromJS(objEdit);
            myObject.CompanyName.extend({ required: true });
            myObject.Position.extend({ required: true });
            myObject.JobDuties.extend({ required: true });
            myObject.Salary.extend({ required: true });
            myObject.OtherIndustry.extend({ required: true });
            objEdit.isEdit('1');
        }
        viewModel.saveWorkExperience = function (objSave) {
            objSave.inSaveMode(true);
            var industry = viewModel.RefIndustry.length - 1;
            var valid = objSave.StateId() > 0 && objSave.IndustryId() > 0 && objSave.WorkTypeId() > 0 && objSave.CompanyName.isValid() && objSave.Position.isValid() && objSave.JobDuties.isValid();
            var otherValid = objSave.IndustryId() == industry && objSave.OtherIndustry.isValid() || objSave.IndustryId() != industry;
            var validation = valid && otherValid;
            if (!validation) {
                viewModel.WorkHistory.errors.showAllMessages();
                return;
            }
            if (objSave.Id() == "") {
                viewModel.WorkHistory.MemberData()[0].StartDate(objSave.editStartDate());
                viewModel.WorkHistory.MemberData()[0].EndDate(objSave.editEndDate());
                $.ajax({
                    url: GetWebAPIURL() + '/api/WorkHistory/',
                    type: "POST",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.Id(data);
                        objSave.isEdit('0');
                        objSave.inSaveMode(false);
                        objSave.StartDate(convert(objSave.StartDate()));
                        objSave.EndDate(convert(objSave.EndDate()));
                        viewModel.workButtonCheck(1);
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
            else {
                objSave.StartDate = ko.observable(objSave.editStartDate());
                objSave.EndDate = ko.observable(objSave.editEndDate());
                $.ajax({
                    url: GetWebAPIURL() + '/api/WorkHistory/',
                    type: "PUT",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.isEdit('0');
                        objSave.inSaveMode(false);
                        objSave.StartDate(convert(objSave.StartDate()));
                        objSave.EndDate(convert(objSave.EndDate()));
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
        viewModel.cancelWorkExperience = function (objCancel) {
            var indexId = viewModel.WorkHistory.MemberData.indexOf(objCancel);
            objCancel.inSaveMode(false);            
            if (objCancel.Id() == "") {
                viewModel.WorkHistory.MemberData.remove(objCancel);
                viewModel.workButtonCheck(1);
            }
            else {
                for (var j = 0; j < selectedobj.length; j++) {
                    if (objCancel.Id() == selectedobj[j].Id) {
                        viewModel.WorkHistory.MemberData.replace(viewModel.WorkHistory.MemberData()[indexId], ko.mapping.fromJS(selectedobj[j]));
                        viewModel.WorkHistory.MemberData()[indexId].isEdit('0');
                        viewModel.WorkHistory.MemberData()[indexId].StateText = getLookUpText(viewModel.WorkHistory.MemberData()[indexId].StateId, viewModel.RefState);
                        viewModel.WorkHistory.MemberData()[indexId].IndustryText = getLookUpText(viewModel.WorkHistory.MemberData()[indexId].IndustryId, viewModel.RefIndustry);
                        viewModel.WorkHistory.MemberData()[indexId].WorkText = getLookUpText(viewModel.WorkHistory.MemberData()[indexId].WorkTypeId, viewModel.RefWorkType);
                        selectedobj.splice(j, 1);
                    }
                }
            }
        }
        viewModel.deleteWorkExperience = function (objDelete) {
            var deleteWork = confirm("Do you want to delete!");
            if (deleteWork == true) {
                $.ajax({
                    url: GetWebAPIURL() + '/api/WorkHistory?id=' + objDelete.Id(),
                    type: "DELETE",
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        viewModel.WorkHistory.MemberData.remove(objDelete);
                        objDelete.isEdit('0');
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
        viewModel.expandWorkSkill = function (workExperienceobj) {
            toggle(workExperienceobj.btnSkill);
        }
    }

    function initLanguage() {
        for (var j = 0; j < viewModel.Language.MemberData().length; j++) {
            viewModel.Language.MemberData()[j].LanguageText = ko.observable(getLookUpText(viewModel.Language.MemberData()[j].LanguageId, viewModel.RefLanguage)());
            viewModel.Language.MemberData()[j].ProficiencyText = ko.observable(getLookUpText(viewModel.Language.MemberData()[j].ProficiencyId, viewModel.RefProficiency)());
            viewModel.Language.MemberData()[j].isEdit = ko.observable('0');
            viewModel.Language.MemberData()[j].inSaveMode = ko.observable(false);
        }       
        viewModel.Language.btnLanguage = ko.observable("Edit");          
        viewModel.Language.editingLanguage = ko.observable(false);
        
        viewModel.editLanguageDetails = function () {
            if (viewModel.Language.editingLanguage() == false) {
                viewModel.Language.btnLanguage("Add More");
                viewModel.Language.editingLanguage(true);
            }
            else {
                addMoreLanguages();
                viewModel.Language.btnLanguage("Edit");
            }
        }
        viewModel.Language.addFirstLanguage = function () {
            addMoreLanguages();
            viewModel.Language.editingLanguage(true);
        }
        
        viewModel.doneEditingLanguage = function () {
            var flag = 0;
            for (var i = 0; i < viewModel.Language.MemberData().length; i++) {
                if (viewModel.Language.MemberData()[i].Id() == '' || viewModel.Language.MemberData()[i].isEdit() == "1") {
                    flag = 1;
                }
            }
            if (flag == 1) {
                var LanguageClose = confirm("Close without saving?");
                if (LanguageClose == true) {
                    for (var i = 0; i < viewModel.Language.MemberData().length; i++) {
                        if (viewModel.Language.MemberData()[i].Id() == "") {
                            viewModel.Language.MemberData.remove(viewModel.Language.MemberData()[i]);
                        }
                        if (viewModel.Language.MemberData()[i].isEdit() == "1") {
                            for (var j = 0; j < SelectedLanguage.length; j++) {
                                if (SelectedLanguage[j].Id == viewModel.Language.MemberData()[i].Id()) {
                                    viewModel.Language.MemberData.replace(viewModel.Language.MemberData()[i], ko.mapping.fromJS(SelectedLanguage[j]));
                                }
                            }
                        }
                        viewModel.Language.MemberData()[i].isEdit('0');
                    }
                    SelectedLanguage = [];
                    viewModel.Language.editingLanguage(false);
                    viewModel.Language.btnLanguage("Edit");
                }
            }
            else {
                viewModel.Language.editingLanguage(false);
                viewModel.Language.btnLanguage("Edit");
            }
        }
        viewModel.saveLanguages = function (objSave) {
            var indexId = viewModel.Language.MemberData.indexOf(objSave);
            objSave.inSaveMode(true);
            var valid = objSave.LanguageId() > 0 && objSave.ProficiencyId() > 0;
            if (!valid)
                return;
            if (objSave.Id() == "") {
                $.ajax({
                    url: GetWebAPIURL() + '/api/Language',
                    type: "POST",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.Id(data);
                        objSave.inSaveMode(false);
                        viewModel.Language.MemberData()[indexId].LanguageText(getLookUpText(viewModel.Language.MemberData()[indexId].LanguageId, viewModel.RefLanguage)());
                        viewModel.Language.MemberData()[indexId].ProficiencyText(getLookUpText(viewModel.Language.MemberData()[indexId].ProficiencyId, viewModel.RefProficiency)());
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
            else {

                $.ajax({
                    url: GetWebAPIURL() + '/api/Language',
                    type: "PUT",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.inSaveMode(false);
                        viewModel.Language.MemberData()[indexId].LanguageText(getLookUpText(objSave.LanguageId, viewModel.RefLanguage)());
                        viewModel.Language.MemberData()[indexId].ProficiencyText(getLookUpText(objSave.ProficiencyId, viewModel.RefProficiency)());
                        for (var i = 0; i < SelectedLanguage.length; i++) {
                            if (SelectedLanguage[i].Id == objSave.Id()) {
                                SelectedLanguage.splice(i, 1);
                            }
                        }
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });

            }
            objSave.isEdit('0');
            viewModel.Language.btnLanguage("Add More");
        }
        viewModel.cancelLanguage = function (objCancel) {
            var indexId = viewModel.Language.MemberData.indexOf(objCancel);
            objCancel.inSaveMode(false);
            viewModel.Language.btnLanguage("Add More");
            if (objCancel.Id() == ""){
                viewModel.Language.MemberData.remove(objCancel);
                if (viewModel.Language.MemberData().length == 0){
                    viewModel.Language.editingLanguage(false);
                }
            }
            else {
                for (var j = 0; j < SelectedLanguage.length; j++) {
                    if (objCancel.Id() == SelectedLanguage[j].Id) {
                        viewModel.Language.MemberData.replace(viewModel.Language.MemberData()[indexId], ko.mapping.fromJS(SelectedLanguage[j]));
                        viewModel.Language.MemberData()[indexId].isEdit('0');
                        SelectedLanguage.splice(j, 1);
                        break;
                    }
                }               
            }
        }
        viewModel.deleteLanguage = function (objDelete) {

            var LanguageDelete = confirm("Do you want to delete!");
            if (LanguageDelete == true) {
                if (objDelete.Id() != "") {
                    //To delete data from Language Table

                    $.ajax({
                        url: GetWebAPIURL() + '/api/Language?id=' + objDelete.Id(),
                        type: "DELETE",
                        headers: app.securityHeaders(),
                        contentType: "application/json; charset=utf-8",
                        async: false,
                        success: function (data) {
                            viewModel.Language.MemberData.remove(objDelete);
                            viewModel.Language.MemberData.remove(objDelete);
                            if (viewModel.Language.MemberData().length == 0) {
                                viewModel.Language.editingLanguage(false);
                                viewModel.Language.editingLanguage(false);
                            }
                            objDelete.isEdit('0');
                        },
                        error: function (xhr, status, error) {
                            app.manageError(error);
                        }
                    });
                }
            }
         

        }
        var SelectedLanguage = [];
        viewModel.editLanguage = function (objEdit) {
            objEdit.isEdit('1');
            SelectedLanguage.push(ko.mapping.toJS(objEdit));
        }
    }

    function initScholarship()
    {
        for (var j = 0; j < viewModel.Scholarship.MemberData().length; j++) {
            viewModel.Scholarship.MemberData()[j].isEdit = ko.observable('0');           
        }
        viewModel.Scholarship.btnScholarship = ko.observable("Edit");
        viewModel.editingScholarship = ko.observable(false);

        viewModel.editScholarshipDetails = function ()
        {
            if (viewModel.editingScholarship() == false) {
                viewModel.Scholarship.btnScholarship("Add More");
            }
            else {
                addMoreScholarships();                
                viewModel.Scholarship.btnScholarship("Edit");
                viewModel.editingScholarship(false);
            }
            viewModel.editingScholarship(true);
        }
        viewModel.addFirstScholarship = function () {
            viewModel.editingScholarship(true);
            addMoreScholarships();
        }
       
        viewModel.saveScholarship = function (objSave)
        {
            var valid = objSave.ScholarshipTitle.isValid() && objSave.ScholarshipOrganization.isValid();
            if (!valid) {
                viewModel.Scholarship.errors.showAllMessages(true);
                return;
            }
            if (objSave.Id() == "") {
                $.ajax({
                    url: GetWebAPIURL() + '/api/Scholarship',
                    type: "POST",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.Id(data);
                        objSave.isEdit('0');
                        viewModel.Scholarship.btnScholarship("Add More");
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
            else {
                $.ajax({
                    url: GetWebAPIURL() + '/api/Scholarship',
                    type: "PUT",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.isEdit('0');
                        for (var i = 0; i < selectedScholarship.length; i++) {
                            if (selectedScholarship[i].Id == objSave.Id()) {
                                selectedScholarship.splice(i, 1);
                            }
                        }
                        viewModel.Scholarship.btnScholarship("Add More");
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
        viewModel.cancelScholarship = function (objCancel)
        {
            var indexId = viewModel.Scholarship.MemberData.indexOf(objCancel);
            viewModel.Scholarship.btnScholarship("Add More");
            if (objCancel.Id() == "") {
                viewModel.Scholarship.MemberData.remove(objCancel);
                if (viewModel.Scholarship.MemberData().length == 0) {
                    viewModel.editingScholarship(false);
                }
            }
            else {
                for (var j = 0; j < selectedScholarship.length; j++) {
                    if (objCancel.Id() == selectedScholarship[j].Id) {
                        viewModel.Scholarship.MemberData.replace(viewModel.Scholarship.MemberData()[indexId], ko.mapping.fromJS(selectedScholarship[j]));
                        viewModel.Scholarship.MemberData()[indexId].isEdit('0');
                        selectedScholarship.splice(j, 1);
                        break;
                    }
                }
            }
        }
        viewModel.deleteScholarship = function (objDelete)
        {
            var ScholarshipDelete = confirm("Do you want to delete!");
            if (ScholarshipDelete == true) {
                if (objDelete.Id() != "") {

                    $.ajax({
                        url: GetWebAPIURL() + '/api/Scholarship?id=' + objDelete.Id(),
                        type: "DELETE",
                        headers: app.securityHeaders(),
                        contentType: "application/json; charset=utf-8",
                        async: false,
                        success: function (data) {
                            viewModel.Scholarship.MemberData.remove(objDelete);
                            if (viewModel.Scholarship.MemberData().length == 0) {
                                viewModel.editingScholarship(false);
                            }
                            objDelete.isEdit('0');
                        },
                        error: function (xhr, status, error) {
                            app.manageError(error);
                        }
                    });
                }
            }

        }
        var selectedScholarship = [];
        viewModel.editScholarship = function (objEdit)
        {
            var scholarshipObj = ko.mapping.fromJS(objEdit);
            scholarshipObj.ScholarshipTitle.extend({ required: true });
            scholarshipObj.ScholarshipOrganization.extend({ required: true });
            objEdit.isEdit('1');
            selectedScholarship.push(ko.mapping.toJS(objEdit));           
        }
        viewModel.doneEditingScholarship = function () {
            var flag = 0;            
            for (var i = 0; i < viewModel.Scholarship.MemberData().length; i++) {
                if (viewModel.Scholarship.MemberData()[i].Id() == '' || viewModel.Scholarship.MemberData()[i].isEdit() == "1") {
                    flag = 1;
                }
            }
            if (flag == 1) {
                var ScholarshipClose = confirm("Close without saving?");
                if (ScholarshipClose == true) {
                    for (var i = 0; i < viewModel.Scholarship.MemberData().length; i++) {
                        if (viewModel.Scholarship.MemberData()[i].Id() == "") {
                            viewModel.Scholarship.MemberData.remove(viewModel.Scholarship.MemberData()[i]);
                        }
                        if (viewModel.Scholarship.MemberData()[i].isEdit() == "1") {
                            for (var j = 0; j < selectedScholarship.length; j++) {
                                if (selectedScholarship[j].Id == viewModel.Scholarship.MemberData()[i].Id()) {
                                    viewModel.Scholarship.MemberData.replace(viewModel.Scholarship.MemberData()[i], ko.mapping.fromJS(selectedScholarship[j]));
                                    break;
                                }
                            }
                        }
                        viewModel.Scholarship.MemberData()[i].isEdit('0');
                    }                    
                    selectedScholarship = [];
                    viewModel.editingScholarship(false);
                    viewModel.Scholarship.btnScholarship("Edit");
                }
            }
            else {
                viewModel.editingScholarship(false);
                viewModel.Scholarship.btnScholarship("Edit");                
            }           
        }
    }

    function initCertification()
    {
        viewModel.certificationButtonCheck = ko.observable(1);
        for (var j = 0; j < viewModel.Certification.MemberData().length; j++) {
            viewModel.Certification.MemberData()[j].isEdit = ko.observable('0');
            if (viewModel.Certification.MemberData()[j].CompletionDate) {
                viewModel.Certification.MemberData()[j].editCompletionDate = ko.observable(new Date(viewModel.Certification.MemberData()[j].CompletionDate()));
                viewModel.Certification.MemberData()[j].CompletionDate = convert(viewModel.Certification.MemberData()[j].editCompletionDate());
            }
            if (viewModel.Certification.MemberData()[j].ExpirationDate) {
                viewModel.Certification.MemberData()[j].editExpirationDate = ko.observable(new Date(viewModel.Certification.MemberData()[j].ExpirationDate()));
                viewModel.Certification.MemberData()[j].ExpirationDate = convert(viewModel.Certification.MemberData()[j].editExpirationDate());
            }
            viewModel.Certification.MemberData()[j].btnSkill = ko.observable('+');
            viewModel.Certification.MemberData()[j].addJobSeekerSkillDirectCheck = ko.observable('0');
            viewModel.Certification.MemberData()[j].skillAcquiredId = 3;
        }
        viewModel.addCertification = function ()
        {
            viewModel.certificationButtonCheck(0);
            var initializeObject = { "Id": "", "CertificationName": "", "InstitutionName": "", "CompletionDate": "", "ExpirationDate": "", "CurrentlyEnrolled": "", "CertificationDetails": "", "Website": "", "isEdit": "", "editCompletionDate": new Date(), "editExpirationDate": new Date() };
            var data = ko.mapping.fromJS(initializeObject);
            viewModel.Certification.MemberData.splice(0, 0, data);
            viewModel.Certification.MemberData()[0].btnSkill = ko.observable('+');
            viewModel.Certification.MemberData()[0].addJobSeekerSkillDirectCheck = ko.observable('0');
            viewModel.Certification.MemberData()[0].skillAcquiredId = 3;            
            viewModel.Certification.MemberData()[0].CertificationName.extend({ required: true });
            viewModel.Certification.MemberData()[0].InstitutionName.extend({ required: true });
            viewModel.Certification.MemberData()[0].isEdit("1");
            viewModel.Certification.errors = ko.validation.group(viewModel.Certification.MemberData()[0]);
        }
        viewModel.saveCertification = function (objSave)
        {
            var valid = objSave.CertificationName.isValid() && objSave.InstitutionName.isValid();
            if (!valid) {
                viewModel.Certification.errors.showAllMessages(true);
                return false;
            }
            if (objSave.Id() == "") {
                viewModel.Certification.MemberData()[0].CompletionDate(objSave.editCompletionDate());
                viewModel.Certification.MemberData()[0].ExpirationDate(objSave.editExpirationDate());

                $.ajax({
                    url: GetWebAPIURL() + '/api/Certification/',
                    type: "POST",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.Id(data);
                        objSave.isEdit('0');
                        objSave.CompletionDate(convert(objSave.CompletionDate()));
                        objSave.ExpirationDate(convert(objSave.ExpirationDate()));
                        viewModel.certificationButtonCheck(1);
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
            else {
                objSave.CompletionDate = ko.observable(objSave.editCompletionDate());
                objSave.ExpirationDate = ko.observable(objSave.editExpirationDate());
                $.ajax({
                    url: GetWebAPIURL() + '/api/Certification/',
                    type: "PUT",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.isEdit('0');
                        objSave.CompletionDate(convert(objSave.CompletionDate()));
                        objSave.ExpirationDate(convert(objSave.ExpirationDate()));
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
        viewModel.cancelCertification = function (objCancel)
        {
            var indexId = viewModel.Certification.MemberData.indexOf(objCancel);
            if (objCancel.Id() == "") {
                viewModel.Certification.MemberData.remove(objCancel);
                viewModel.certificationButtonCheck(1);
            }
            else {
                for (var j = 0; j < selectedobjCertification.length; j++) {
                    if (objCancel.Id() == selectedobjCertification[j].Id) {
                        viewModel.Certification.MemberData.replace(viewModel.Certification.MemberData()[indexId], ko.mapping.fromJS(selectedobjCertification[j]));
                        viewModel.Certification.MemberData()[indexId].isEdit('0');
                        selectedobjCertification.splice(j, 1);
                    }
                }
            }
        }
        var selectedobjCertification = [];
        viewModel.editCertificationDetails = function (objEdit)
        {
            var certificationObj = ko.mapping.fromJS(objEdit);
            certificationObj.CertificationName.extend({ required: true });
            certificationObj.InstitutionName.extend({ required: true });
            objEdit.isEdit('1');
            selectedobjCertification.push(ko.toJS(objEdit));
        }
        viewModel.deleteCertification = function (objDelete)
        {
            var deleteWork = confirm("Do you want to delete!");
            if (deleteWork == true) {
                $.ajax({
                    url: GetWebAPIURL() + '/api/Certification?id=' + objDelete.Id(),
                    type: "DELETE",
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        viewModel.Certification.MemberData.remove(objDelete);
                        objDelete.isEdit('0');
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
        viewModel.expandCertificationSkill = function (certificationObj) {
            toggle(certificationObj.btnSkill)
        }
    }

    function initTrainingCourse()
    {
        viewModel.trainingButtonCheck = ko.observable(1);
        for (var j = 0; j < viewModel.TrainingCourse.MemberData().length; j++) {
            viewModel.TrainingCourse.MemberData()[j].ProgramTypeText = getLookUpText(viewModel.TrainingCourse.MemberData()[j].ProgramTypeId, viewModel.RefProgramType);
            viewModel.TrainingCourse.MemberData()[j].isEdit = ko.observable('0');
            viewModel.TrainingCourse.MemberData()[j].inSaveMode = ko.observable(false);            
            if (viewModel.TrainingCourse.MemberData()[j].CompletionDate) {
                viewModel.TrainingCourse.MemberData()[j].editCompletionDate = ko.observable(new Date(viewModel.TrainingCourse.MemberData()[j].CompletionDate()));
                viewModel.TrainingCourse.MemberData()[j].CompletionDate = convert(viewModel.TrainingCourse.MemberData()[j].editCompletionDate());
            }
            viewModel.TrainingCourse.MemberData()[j].btnSkill = ko.observable('+');
            viewModel.TrainingCourse.MemberData()[j].addJobSeekerSkillDirectCheck = ko.observable('0');
            viewModel.TrainingCourse.MemberData()[j].skillAcquiredId = 4;
        }
        viewModel.addTrainingCourse = function ()
        {
            viewModel.trainingButtonCheck(0);
            var initializeObject = { "Id": "", "ProgramTypeId": 0, "InstitutionName": "", "CompletionDate": "", "Focus": "", "CurrentlyEnrolled": "", "TrainingDetails": "", "Website": "", "isEdit": "", "editCompletionDate": new Date(), "inSaveMode": false };
            var data = ko.mapping.fromJS(initializeObject);
            viewModel.TrainingCourse.MemberData.splice(0, 0, data);
            viewModel.TrainingCourse.MemberData()[0].btnSkill = ko.observable('+');
            viewModel.TrainingCourse.MemberData()[0].addJobSeekerSkillDirectCheck = ko.observable('0');
            viewModel.TrainingCourse.MemberData()[0].skillAcquiredId = 4;
            viewModel.TrainingCourse.MemberData()[0].ProgramTypeText = getLookUpText(viewModel.TrainingCourse.MemberData()[0].ProgramTypeId, viewModel.RefProgramType);
            viewModel.TrainingCourse.MemberData()[0].InstitutionName.extend({ required: true });
            viewModel.TrainingCourse.MemberData()[0].Focus.extend({ required: true });
            viewModel.TrainingCourse.MemberData()[0].isEdit("1");
            viewModel.TrainingCourse.errors = ko.validation.group(viewModel.TrainingCourse.MemberData()[0]);
        }
        viewModel.saveTrainingCourse = function (objSave)
        {
            objSave.inSaveMode(true);
            var valid = objSave.InstitutionName.isValid() && objSave.Focus.isValid() && objSave.ProgramTypeId() > 0;
            if (!valid)
            {
                viewModel.TrainingCourse.errors.showAllMessages(true);
                return false;
            }
            if (objSave.Id() == "") {
                viewModel.TrainingCourse.MemberData()[0].CompletionDate(objSave.editCompletionDate());
                $.ajax({
                    url: GetWebAPIURL() + '/api/TrainingCourse/',
                    type: "POST",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.Id(data);
                        objSave.isEdit('0');
                        objSave.inSaveMode(false);
                        objSave.CompletionDate(convert(objSave.CompletionDate()));
                        viewModel.trainingButtonCheck(1);
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
            else {
                objSave.CompletionDate = ko.observable(objSave.editCompletionDate());
                $.ajax({
                    url: GetWebAPIURL() + '/api/TrainingCourse/',
                    type: "PUT",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.isEdit('0');
                        objSave.inSaveMode(false);
                        objSave.CompletionDate(convert(objSave.CompletionDate()));
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
        viewModel.cancelTrainingCourse = function (objCancel)
        {
            var indexId = viewModel.TrainingCourse.MemberData.indexOf(objCancel);
            objCancel.inSaveMode(false);
            if (objCancel.Id() == "") {
                viewModel.TrainingCourse.MemberData.remove(objCancel);
                viewModel.trainingButtonCheck(1);
            }
            else {
                for (var j = 0; j < selectedTrainingObj.length; j++) {
                    if (objCancel.Id() == selectedTrainingObj[j].Id) {
                        viewModel.TrainingCourse.MemberData.replace(viewModel.TrainingCourse.MemberData()[indexId], ko.mapping.fromJS(selectedTrainingObj[j]));
                        viewModel.TrainingCourse.MemberData()[indexId].isEdit('0');
                        viewModel.TrainingCourse.MemberData()[indexId].ProgramTypeText = getLookUpText(viewModel.TrainingCourse.MemberData()[indexId].ProgramTypeId, viewModel.RefProgramType);
                        selectedTrainingObj.splice(j, 1);
                    }
                }
            }
        }
        viewModel.deleteTrainingCourse = function (objDelete)
        {
            var deleteWork = confirm("Do you want to delete!");
            if (deleteWork == true) {
                $.ajax({
                    url: GetWebAPIURL() + '/api/TrainingCourse?id=' + objDelete.Id(),
                    type: "DELETE",
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        viewModel.TrainingCourse.MemberData.remove(objDelete);
                        objDelete.isEdit('0');
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
        var selectedTrainingObj = [];
        viewModel.editTrainingCourseDetails = function (objEdit)
        {
            var trainingObj = ko.mapping.fromJS(objEdit);
            trainingObj.InstitutionName.extend({ required: true });
            trainingObj.Focus.extend({ required: true });
            objEdit.isEdit('1');
            selectedTrainingObj.push(ko.toJS(objEdit));
        }
        viewModel.expandTrainingSkill = function (trainingCourseObj) {
            toggle(trainingCourseObj.btnSkill)
        }
    }

    function initExtraCurricularAcitivies()
    {
        for (var j = 0; j < viewModel.ExtraCurricularActivity.MemberData().length; j++) {
            viewModel.ExtraCurricularActivity.MemberData()[j].isEdit = ko.observable('0');
            viewModel.ExtraCurricularActivity.MemberData()[j].btnSkill = ko.observable('+');
            viewModel.ExtraCurricularActivity.MemberData()[j].addJobSeekerSkillDirectCheck = ko.observable('0');
            viewModel.ExtraCurricularActivity.MemberData()[j].skillAcquiredId = 5;
            if (viewModel.ExtraCurricularActivity.MemberData()[j].StartDate) {
                viewModel.ExtraCurricularActivity.MemberData()[j].editStartDate = ko.observable(new Date(viewModel.ExtraCurricularActivity.MemberData()[j].StartDate()));
            }
            if (viewModel.ExtraCurricularActivity.MemberData()[j].EndDate) {
                viewModel.ExtraCurricularActivity.MemberData()[j].editEndDate = ko.observable(new Date(viewModel.ExtraCurricularActivity.MemberData()[j].EndDate()));
            }            
        }
        viewModel.ExtraCurricularActivity.btnActivity = ko.observable("Edit");
        viewModel.editingActivity = ko.observable(false);
        viewModel.editActivityDetails = function (){
            if (viewModel.editingActivity() == false) {
                viewModel.ExtraCurricularActivity.btnActivity("Add More");
            }
            else {
                addMoreActivities();
                viewModel.ExtraCurricularActivity.btnActivity("Edit");
                viewModel.editingActivity(false);
            }
            viewModel.editingActivity(true);
        }
        viewModel.addFirstActivity = function (){
            viewModel.editingActivity(true);
            addMoreActivities();
        }       

        viewModel.saveActivities = function (objSave)
        {
            var valid = objSave.Activity.isValid();
            if (!valid)
            {
                viewModel.ExtraCurricularActivity.errors.showAllMessages(true);
                return;
            }
            if (objSave.Id() == "") {
                viewModel.ExtraCurricularActivity.MemberData()[0].StartDate(objSave.editStartDate());
                viewModel.ExtraCurricularActivity.MemberData()[0].EndDate(objSave.editEndDate());
                $.ajax({
                    url: GetWebAPIURL() + '/api/ExtraCurricularActivity',
                    type: "POST",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.Id(data);
                        objSave.isEdit('0');
                        viewModel.ExtraCurricularActivity.btnActivity("Add More");
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
            else {
                objSave.StartDate(objSave.editStartDate());
                objSave.EndDate(objSave.editEndDate());
                $.ajax({
                    url: GetWebAPIURL() + '/api/ExtraCurricularActivity',
                    type: "PUT",
                    data: ko.mapping.toJSON(objSave),
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        objSave.isEdit('0');
                        for (var i = 0; i < selectedActivity.length; i++) {
                            if (selectedActivity[i].Id == objSave.Id()) {
                                selectedActivity.splice(i, 1);
                            }
                        }
                        viewModel.ExtraCurricularActivity.btnActivity("Add More");
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
        viewModel.cancelActivities = function (objCancel)
        {
            var indexId = viewModel.ExtraCurricularActivity.MemberData.indexOf(objCancel);
            viewModel.ExtraCurricularActivity.btnActivity("Add More");
            if (objCancel.Id() == "") {
                viewModel.ExtraCurricularActivity.MemberData.remove(objCancel);
                if (viewModel.ExtraCurricularActivity.MemberData().length == 0) {
                    viewModel.editingActivity(false);
                }
            }
            else {
                for (var j = 0; j < selectedActivity.length; j++) {
                    if (objCancel.Id() == selectedActivity[j].Id) {
                        viewModel.ExtraCurricularActivity.MemberData.replace(viewModel.ExtraCurricularActivity.MemberData()[indexId], ko.mapping.fromJS(selectedActivity[j]));
                        viewModel.ExtraCurricularActivity.MemberData()[indexId].isEdit('0');
                        selectedActivity.splice(j, 1);
                        break;
                    }
                }
            }
        }
        viewModel.deleteActivities = function (objDelete){
            var ActivityDelete = confirm("Do you want to delete!");
            if (ActivityDelete == true) {
                if (objDelete.Id() != "") {
                    $.ajax({
                        url: GetWebAPIURL() + '/api/ExtraCurricularActivity?id=' + objDelete.Id(),
                        type: "DELETE",
                        headers: app.securityHeaders(),
                        contentType: "application/json; charset=utf-8",
                        async: false,
                        success: function (data) {
                            viewModel.ExtraCurricularActivity.MemberData.remove(objDelete);
                            if (viewModel.ExtraCurricularActivity.MemberData().length == 0) {
                                viewModel.editingActivity(false);
                            }
                            objDelete.isEdit('0');
                        },
                        error: function (xhr, status, error) {
                            app.manageError(error);
                        }
                    });
                }
            }
        }
        var selectedActivity = [];
        viewModel.editActivities = function (objEdit)
        {
            var activityObj = ko.mapping.fromJS(objEdit);
            activityObj.Activity.extend({ required: true });
            objEdit.isEdit("1");
            selectedActivity.push(ko.mapping.toJS(objEdit));
        }
        viewModel.doneEditingActivities = function ()
        {
            var flag = 0;            
            for (var i = 0; i < viewModel.ExtraCurricularActivity.MemberData().length; i++) {
                if (viewModel.ExtraCurricularActivity.MemberData()[i].Id() == '' || viewModel.ExtraCurricularActivity.MemberData()[i].isEdit() == "1") {
                    flag = 1;
                }
            }
            if (flag == 1) {
                var ActivityClose = confirm("Close without saving?");
                if (ActivityClose == true) {
                    viewModel.editingActivity(false);
                    viewModel.ExtraCurricularActivity.btnActivity("Edit");
                    for (var i = 0; i < viewModel.ExtraCurricularActivity.MemberData().length; i++) {
                        if (viewModel.ExtraCurricularActivity.MemberData()[i].Id() == "") {
                            viewModel.ExtraCurricularActivity.MemberData.remove(viewModel.ExtraCurricularActivity.MemberData()[i]);
                        }
                        if (viewModel.ExtraCurricularActivity.MemberData()[i].isEdit() == "1") {
                            for (var j = 0; j < selectedActivity.length; j++) {
                                if (selectedActivity[j].Id == viewModel.ExtraCurricularActivity.MemberData()[i].Id()) {
                                    viewModel.ExtraCurricularActivity.MemberData.replace(viewModel.ExtraCurricularActivity.MemberData()[i], ko.mapping.fromJS(selectedActivity[j]));
                                    break;
                                }
                            }
                        }
                        viewModel.ExtraCurricularActivity.MemberData()[i].isEdit('0');
                    }
                    selectedActivity = [];
                    viewModel.editingActivity(false);
                    viewModel.ExtraCurricularActivity.btnActivity("Edit");
                }
            }
            else {
                viewModel.editingActivity(false);
                viewModel.ExtraCurricularActivity.btnActivity("Edit");               
            }
        }
        viewModel.expandActivitySkill = function (activityObj) {
            toggle(activityObj.btnSkill);
        }
        initjobSeekerSkills()
    }

    function initProfile()
    {
        viewModel.Profile.SecurityCleareanceText = getLookUpText(viewModel.Profile.SecurityClearanceId, viewModel.RefSecurityClearance);
        viewModel.Profile.WillingToRelocateText = getLookUpText(viewModel.Profile.WillingToRelocateId, viewModel.RefWillingToRelocate);
        viewModel.Profile.Summary.extend({ required: true });
        viewModel.Profile.inSaveMode = ko.observable(false);        
        viewModel.Profile.errors = ko.validation.group(viewModel.Profile);
        viewModel.Profile.StatusNames = ko.observable('');
        viewModel.Profile.StatusNames = ko.computed(function () {
            var currentStatusName = '';
            if (viewModel.RefCurrentStatus) {
                $.each(viewModel.RefCurrentStatus, function (i, st) {
                    $.each(viewModel.Profile.CurrentStatus(), function (j, cs) {
                        if (cs == st.value) {
                            if (currentStatusName.length > 0)
                                currentStatusName += ', ';
                            currentStatusName += st.label;
                        }
                    });
                });
            }
            return currentStatusName;
        });
       
        viewModel.editingPersonalInfo = ko.observable(false);
        var cloneObj;
        viewModel.addPersonalInformation = function ()
        {           
            viewModel.editingPersonalInfo(true);
            cloneObj = [];
            cloneObj = ko.mapping.toJS(viewModel.Profile);
        }
        viewModel.savePersonal = function ()
        {
            viewModel.Profile.inSaveMode(true);            
            var valid = viewModel.Profile.Summary.isValid() && viewModel.Profile.SecurityClearanceId() > 0 && viewModel.Profile.WillingToRelocateId() > 0 && viewModel.Profile.CurrentStatus().length > 0;
            if (!valid) {
                viewModel.Profile.errors.showAllMessages(true);
                return;
            }
            if (viewModel.Profile.Id() == "") {
                $.ajax({
                    url: GetWebAPIURL() + '/api/Profile/',
                    type: "POST",
                    data: ko.mapping.toJSON(viewModel.Profile),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    headers: app.securityHeaders(),
                    success: function (data) {
                        viewModel.Profile.Id(data);
                        viewModel.editingPersonalInfo(false);
                        viewModel.Profile.inSaveMode(false);
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
            else {
                $.ajax({
                    url: GetWebAPIURL() + '/api/Profile/',
                    type: "PUT",
                    data: ko.mapping.toJSON(viewModel.Profile),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    headers: app.securityHeaders(),
                    success: function (data) {
                        viewModel.editingPersonalInfo(false);
                        viewModel.Profile.inSaveMode(false);
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
        viewModel.cancelPersonal = function ()
        {
            if (cloneObj.Id != "") {
                ko.mapping.fromJS(cloneObj, viewModel.Profile);                
            }
            else {
                viewModel.Profile.Summary("");
                viewModel.Profile.SecurityClearanceId(0);
                viewModel.Profile.WillingToRelocateId(0);
                viewModel.Profile.CurrentStatus("");
            }
            viewModel.Profile.inSaveMode(false);
            viewModel.editingPersonalInfo(false);
            viewModel.Profile.errors.showAllMessages(false);
        }
    }
    
   
    viewModel.myInfo = function () {
        viewModel.mySkillCheck(0);
        viewModel.skillValidation = ko.pureComputed(function () {
            return viewModel.mySkillCheck() == 0 ? "ListActivity" : "ListReference";
        }, viewModel);
    }
    viewModel.mySkill = function () {
        viewModel.mySkillCheck(1);
        viewModel.skillValidation = ko.pureComputed(function () {
            return viewModel.mySkillCheck() == 0 ? "ListActivity" : "ListReference";
        }, viewModel);
    }

    function addMoreLanguages() {
        var initializeObject = { "LanguageId": 0, "ProficiencyId": 0, "Certification": "", "isEdit": "", "Id": "", "inSaveMode": false, "LanguageText": "", "ProficiencyText": "" };
        var data = ko.mapping.fromJS(initializeObject);
        viewModel.Language.MemberData.splice(0, 0, data);
        viewModel.Language.MemberData()[0].isEdit("1");
    }
    function addMoreScholarships() {
        var initializeObject = { "ScholarshipOrganization": "", "ScholarshipTitle": "", "ScholarshipDescription": "", "isEdit": "", "Id": "" };
        var data = ko.mapping.fromJS(initializeObject);
        viewModel.Scholarship.MemberData.splice(0, 0, data);
        viewModel.Scholarship.MemberData()[0].ScholarshipTitle.extend({ required: true });
        viewModel.Scholarship.MemberData()[0].ScholarshipOrganization.extend({ required: true });
        viewModel.Scholarship.MemberData()[0].isEdit("1");
        viewModel.Scholarship.errors = ko.validation.group(viewModel.Scholarship.MemberData()[0]);
    }
    function addMoreActivities() {
        var initializeObject = { "Activity": "", "StartDate": "", "EndDate": "", "CurrentActivity": "", "isEdit": "", "Id": "", "editStartDate": new Date(), "editEndDate": new Date() };
        var data = ko.mapping.fromJS(initializeObject);
        viewModel.ExtraCurricularActivity.MemberData.splice(0, 0, data);
        viewModel.ExtraCurricularActivity.MemberData()[0].btnSkill = ko.observable('+');
        viewModel.ExtraCurricularActivity.MemberData()[0].addJobSeekerSkillDirectCheck = ko.observable('0');
        viewModel.ExtraCurricularActivity.MemberData()[0].skillAcquiredId = 5;
        viewModel.ExtraCurricularActivity.MemberData()[0].Activity.extend({ required: true });
        viewModel.ExtraCurricularActivity.MemberData()[0].isEdit("1");
        viewModel.ExtraCurricularActivity.errors = ko.validation.group(viewModel.ExtraCurricularActivity.MemberData()[0]);
    }
    function createListIndustry(method, value) {
        var dataObj = getListById(method, value);
        var list = [];
        list.push({ label: "Select", value: "" });
        for (da in dataObj) {
            list.push({
                label: dataObj[da].Name,
                value: dataObj[da].Id
            });
            list.push({ label: "Other", value: 2 });
        }
        return list;
    }
});
