alert("hii happy");
function initjobSeekerSkills() {
    var dataJobSeekerSkillListObj = getList("ListJobSeekerSkill");
    var dataObjSkillReference = getList("SkillReference");
    var dataObjSkillSupportingMaterial = getList("SkillSupportingMaterial");
    var dataObjSkillRelatedExperience = getList("SkillRelatedExperience");
    viewModel.IndustryArray = ko.observableArray();
    viewModel.addIndustryCheck = ko.observable('0');
    viewModel.btnIndustry = ko.observable('+');
    var industryId;
    var competencyId;
    var currentIndustryObj;
    var currentCompetencyObj;
    for (da in dataJobSeekerSkillListObj) {
        if (dataJobSeekerSkillListObj[da].IndustryId != industryId) {
            competencyId = 0;
            var industryObj = new listIndustry(dataJobSeekerSkillListObj[da]);
            industryId = dataJobSeekerSkillListObj[da].IndustryId;
            competencyId = dataJobSeekerSkillListObj[da].CompetencyId;
            viewModel.IndustryArray.push(industryObj);
            currentIndustryObj = industryObj;
        }
        else
            if (dataJobSeekerSkillListObj[da].CompetencyId != competencyId) {
                var skillObj = new listCompetency(dataJobSeekerSkillListObj[da]);
                competencyId = dataJobSeekerSkillListObj[da].CompetencyId;
                currentCompetencyObj = skillObj;
                currentIndustryObj.competencyArray.push(skillObj);
            }
            else {
                var skillObj = new listSkil(dataJobSeekerSkillListObj[da]);
                currentCompetencyObj.skillArray.push(skillObj);
                industryId = dataJobSeekerSkillListObj[da].IndustryId;
            }
    }

    function listIndustry(skillCollection) {
        var self = this;
        var competencyObj = new listCompetency(skillCollection);
        currentCompetencyObj = competencyObj;
        self.industryName = skillCollection.Industry;
        self.industryId = skillCollection.IndustryId;
        self.btnIndustryList = ko.observable('+');
        self.competencyArray = ko.observableArray();
        self.addCompetencyCheck = ko.observable('0');
        self.competencyArray.push(competencyObj);
        self.addJobSeekerCompetency = function (categoryObj) {
            jsonObjIndustry = ko.toJS(categoryObj);
            self.dataCompetency = ko.observable(createList("Category", jsonObjIndustry.industryId));
            self.selectedIndexCompetency = ko.observable(0);
            categoryObj.addCompetencyCheck('1');
        }
        self.saveCompetency = function (objCompetency) {
            var flag = 0;
            for (var i = 0; i < viewModel.IndustryArray().length; i++) {
                for (var j = 0; j < self.competencyArray().length; j++) {
                    if (self.dataCompetency()[self.selectedIndexCompetency()].value == self.competencyArray()[j].competencyId) {
                        alert("Competency already entered");
                        flag = 1;
                        break;
                    }
                }
            }
            if (flag == 0) {
                var newCompetency = new createCompetency(self.dataCompetency(), self.selectedIndexCompetency());
                self.competencyArray.push(newCompetency);
                objCompetency.addCompetencyCheck('0');
            }
        }
    }

    function listCompetency(skillCollection) {
        var self = this;
        var objt = [];
        var skillObj = new listSkil(skillCollection);
        self.competencyName = skillCollection.Competency;
        self.competencyId = skillCollection.CompetencyId;
        self.btnSkill = ko.observable('+');
        self.skillArray = ko.observableArray();
        self.addSkillCheck = ko.observable('0');
        self.skillArray.push(skillObj);
        self.addJobSeekerSkill = function (competencyObj) {
            self.dataSkill = ko.observable(createList("SkillMenu", competencyObj.competencyId));
            self.selectedIndexSkill = ko.observable(0);
            competencyObj.addSkillCheck('1');
        }
        self.saveSkill = function (objSkill) {
            var skillflag = 0;
            for (var a = 0; a < viewModel.IndustryArray().length; a++) {
                for (var b = 0; b < viewModel.IndustryArray()[a].competencyArray().length; b++) {
                    for (var c = 0; c < self.skillArray().length; c++) {
                        if (self.dataSkill()[self.selectedIndexSkill()].value == self.skillArray()[c].SkillMapId()) {
                            skillflag = 1;
                            break;
                        }
                    }
                }
            }
            if (skillflag == 0) {
                var newSkill = new createSkill(self.dataSkill(), self.selectedIndexSkill(), objt);
                self.skillArray.push(newSkill);
                objSkill.addSkillCheck('0');
                for (var a = 0; a < viewModel.IndustryArray().length; a++) {
                    for (var b = 0; b < viewModel.IndustryArray()[a].competencyArray().length; b++) {
                        viewModel.IndustryArray()[a].competencyArray()[b].skillArray.sort(function (left, right) {
                            return left.skillName() == right.skillName() ? 0 : (left.skillName() < right.skillName() ? -1 : 1)
                        });
                    }
                }
            }
            else {
                alert("Skill already entered");
            }
        }
    }

    function listSkil(skillCollection) {
        var self = this;
        var score;
        self.skillName = ko.observable('');
        self.Id = ko.observable('');
        self.SkillAcquiredId = ko.observable('');
        self.SkillMapId = ko.observable('');
        self.SkillParentCollectionId = ko.observable('');
        if (skillCollection.SkillScore == null) 
            score = 0;
        else 
            score = skillCollection.SkillScore;
 
        self.ProficiencyId = ko.observable(score);
        self.min = ko.observable(0);
        self.max = ko.observable(10);
        self.btnSkillList = ko.observable('+');
        self.validationFactor = ko.observable();
        if (skillCollection) {
            if (skillCollection.SkillParentCollectionId)
                self.SkillParentCollectionId(skillCollection.SkillParentCollectionId);
            if (skillCollection.AcquiredId)
                self.SkillAcquiredId(skillCollection.AcquiredId);
            self.skillName(skillCollection.Skill);
            self.Id(skillCollection.Id);
            self.SkillMapId(skillCollection.SkillMapId);
        }
        self.referenceCheck = ko.observable('0');
        self.isEditableReference = ko.observable(false);
        self.btnReference = ko.observable("Edit");
        self.referenceArray = ko.observableArray();
        if (dataObjSkillReference) {
            for (var i = 0; i < dataObjSkillReference.length; i++) {
                if (dataObjSkillReference[i].MemberSkillId == self.Id()) {
                    self.referenceCheck('1');
                    var reference = ko.mapping.fromJS(dataObjSkillReference[i]);
                    reference.isEdit = ko.observable('0');
                    reference.deleteCheck = ko.observable('1');
                    self.referenceArray.push(reference);
                }
            }
        }

        self.supportingMaterialCheck = ko.observable('0');
        self.isEditableSupportingMaterial = ko.observable(false);
        self.btnSupportingMaterial = ko.observable("Edit");
        self.supportingMaterialArray = ko.observableArray();
        if (dataObjSkillSupportingMaterial) {
            for (var i = 0; i < dataObjSkillSupportingMaterial.length; i++) {
                if (dataObjSkillSupportingMaterial[i].MemberSkillId == self.Id()) {
                    self.supportingMaterialCheck('1');
                    var supportingMaterial = ko.mapping.fromJS(dataObjSkillSupportingMaterial[i]);
                    supportingMaterial.isEdit = ko.observable('0');
                    supportingMaterial.deleteCheck = ko.observable('1');                    
                    self.supportingMaterialArray.push(supportingMaterial);
                }
            }
        }

        self.relatedExperienceCheck = ko.observable('0');
        self.isEditableRelatedExperience = ko.observable(false);
        self.btnRelatedExperience = ko.observable("Edit");
        self.BtnCheck = ko.observable(1);
        self.relatedExperienceArray = ko.observableArray();

        if (dataObjSkillRelatedExperience) {
            for (var i = 0; i < dataObjSkillRelatedExperience.length; i++) {
                if (dataObjSkillRelatedExperience[i].MemberSkillId == self.Id()) {
                    self.relatedExperienceCheck('1');                    
                    var relatedExperience = ko.mapping.fromJS(dataObjSkillRelatedExperience[i]);
                    if (dataObjSkillRelatedExperience[i].StartDate) {
                        relatedExperience.editStartDate = ko.observable(new Date(relatedExperience.StartDate()));
                    }
                    if (dataObjSkillRelatedExperience[i].EndDate) {
                        relatedExperience.editEndDate = ko.observable(new Date(relatedExperience.EndDate()));
                    }
                    relatedExperience.isEdit = ko.observable('0');
                    relatedExperience.deleteCheck = ko.observable('1');                    
                    self.relatedExperienceArray.push(relatedExperience);
                }
            }
        }
        
    }

    function createIndustry(dataIndustry, selectedIndexIndustry) {
        var self = this;
        self.btnCategoryList = ko.observable('+');
        self.competencyArray = ko.observableArray();
        self.addCompetencyCheck = ko.observable('0');
        self.industryId = ko.computed(function () {
            return dataIndustry[selectedIndexIndustry].value;
        }, this);
        self.industryName = ko.computed(function () {
            return dataIndustry[selectedIndexIndustry].label;
        }, this);
        self.addJobSeekerCompetency = function (categoryObj) {
            jsonObjIndustry = ko.toJS(categoryObj);
            self.dataCompetency = ko.observable(createList("Category", jsonObjIndustry.industryId));
            self.selectedIndexCompetency = ko.observable(0);
            categoryObj.addCompetencyCheck('1');
        }
        self.saveCompetency = function (objCompetency) {
            var flag = 0;
            for (var i = 0; i < viewModel.IndustryArray().length; i++) {
                for (var j = 0; j < viewModel.IndustryArray()[i].competencyArray().length; j++) {
                    if (self.dataCompetency()[self.selectedIndexCompetency()].value == self.competencyArray()[j].competencyId) {
                        alert("Competency already entered");
                        flag = 1;
                        break;
                    }
                }
            }
            if (flag == 0) {
                var newCompetency = new createCompetency(self.dataCompetency(), self.selectedIndexCompetency());
                self.competencyArray.push(newCompetency);
                objCompetency.addCompetencyCheck('0');
            }
        }
    }

    function createCompetency(dataCompetency, selectedIndexCompetency) {
        var objt = [];
        var self = this;
        self.btnSkill = ko.observable('+');
        self.skillArray = ko.observableArray();
        self.addSkillCheck = ko.observable('0');
        self.competencyId = ko.computed(function () {
            return dataCompetency[selectedIndexCompetency].value;
        }, this);
        self.competencyName = ko.computed(function () {
            return dataCompetency[selectedIndexCompetency].label;
        }, this);
        self.addJobSeekerSkill = function (competencyObj) {
            self.dataSkill = ko.observable(createList("SkillMenu" ,competencyObj.competencyId()));
            self.selectedIndexSkill = ko.observable(0);
            competencyObj.addSkillCheck('1');
        }
        self.saveSkill = function (objSkill) {
            var skillflag = 0;
            for (var a = 0; a < viewModel.IndustryArray().length; a++) {
                for (var b = 0; b < viewModel.IndustryArray()[a].competencyArray().length; b++) {
                    for (var c = 0; c < self.skillArray().length; c++) {
                        if (self.dataSkill()[self.selectedIndexSkill()].value == self.skillArray()[c].SkillMapId()) {
                            skillflag = 1;
                            break;
                        }
                    }
                }
            }
            if (skillflag == 0) {
                var newSkill = new createSkill(self.dataSkill(), self.selectedIndexSkill(), objt);
                self.skillArray.push(newSkill);
                objSkill.addSkillCheck('0');
                for (var a = 0; a < viewModel.IndustryArray().length; a++) {
                    for (var b = 0; b < viewModel.IndustryArray()[a].competencyArray().length; b++) {
                        viewModel.IndustryArray()[a].competencyArray()[b].skillArray.sort(function (left, right) {
                            return left.skillName() == right.skillName() ? 0 : (left.skillName() < right.skillName() ? -1 : 1)
                        });
                    }
                }
            }
            else {
                alert("Skill already entered");
            }
        }
    }

    function createSkill(dataSkill, selectedIndexSkill, obt) {
        var self = this;
        self.ProficiencyId = ko.observable(0);
        self.min = ko.observable(0);
        self.max = ko.observable(10);
        self.Id = ko.observable('');
        self.SkillAcquiredId = ko.observable();
        self.SkillParentCollectionId = ko.observable();
        if (obt) {
            var jsonObjectVM = ko.toJS(obt);
            self.SkillAcquiredId(jsonObjectVM.skillAcquiredId);
            self.SkillParentCollectionId(jsonObjectVM.Id);
        }
        self.btnSkillList = ko.observable('+');
        self.validationFactor = ko.observable();
        self.SkillMapId = ko.computed(function () {
            return dataSkill[selectedIndexSkill].value;
        }, this);

        self.skillName = ko.computed(function () {
            return dataSkill[selectedIndexSkill].label;
        }, this);

        self.referenceCheck = ko.observable('0');
        self.isEditableReference = ko.observable(false);
        self.btnReference = ko.observable("Edit");
        self.referenceArray = ko.observableArray();

        self.supportingMaterialCheck = ko.observable('0');
        self.isEditableSupportingMaterial = ko.observable(false);
        self.btnSupportingMaterial = ko.observable("Edit");
        self.supportingMaterialArray = ko.observableArray();

        self.relatedExperienceCheck = ko.observable('0');
        self.isEditableRelatedExperience = ko.observable(false);
        self.btnRelatedExperience = ko.observable("Edit");
        self.relatedExperienceArray = ko.observableArray();
        var jobseekerAddSkillObj = {}
        jobseekerAddSkillObj.SkillMapId = self.SkillMapId();
        jobseekerAddSkillObj.SkillAcquiredId = self.SkillAcquiredId();
        jobseekerAddSkillObj.SkillParentCollectionId = self.SkillParentCollectionId();
        dataobjAddSkill = JSON.stringify(jobseekerAddSkillObj);
        var apiUrlAddSkill = GetWebAPIURL() + '/api/JobSeekerSkillList/';
        $.ajax({
            url: apiUrlAddSkill,
            type: "POST",
            data: dataobjAddSkill,
            headers: app.securityHeaders(),
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (data) {
                self.Id(data);
            },
            error: function (xhr, status, error) {
                app.manageError(error);
            }
        });
    }

    viewModel.expandCompetencyDetails = function (objExpand) {
        toggle(objExpand.btnSkill);
    }
    viewModel.expandIndustryDetails = function () {
        toggle(viewModel.btnIndustry);
    }
    viewModel.cancelCompetency = function (objCompetency) {
        objCompetency.addCompetencyCheck('0');
    }

    viewModel.expandSkillDetails = function (objExpand) {
        if (objExpand.btnSkillList() == '+') {
            objExpand.btnSkillList('-');
            var factorScore = 0;
            if (objExpand.referenceArray().length != 0) {
                factorScore = factorScore + 1;
            }
            if (objExpand.supportingMaterialArray().length != 0) {
                factorScore = factorScore + 1;
            }
            if (objExpand.relatedExperienceArray().length != 0) {
                factorScore = factorScore + 1;
            }
            objExpand.validationFactor(factorScore);
        }
        else {
            objExpand.btnSkillList('+');
        }
    }

    viewModel.changeProficiency = function (skillObj) {
        setTimeout(function () {
            var apiUrlSkill = GetWebAPIURL() + '/api/JobSeekerSkillList';
            $.ajax({
                url: apiUrlSkill,
                type: "PUT",
                data: ko.mapping.toJSON(skillObj),
                headers: app.securityHeaders(),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {

                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }, 100);
    }

    viewModel.deleteSkillDetails = function (skillObj) {
        var apiUrlJobSeekerSkill = GetWebAPIURL() + '/api/JobSeekerSkillList?Id=' + skillObj.Id();
        $.ajax({
            url: apiUrlJobSeekerSkill,
            type: "DELETE",
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (data) {
                $.each(viewModel.IndustryArray(), function () {
                    $.each(this.competencyArray(), function () {
                        this.skillArray.remove(skillObj);
                    });
                });
                skillObj.btnSkillList('+');
            },
            error: function (xhr, status, error) {
                app.manageError(error);
            }
        });
    }

    viewModel.cancelSkill = function (objSkill) {
        objSkill.addSkillCheck('0');
    }

    viewModel.courseLink = function (skillObj) {
        window.location = "EducationOptions.html";
    }

    viewModel.saveindustry = function () {
        if (viewModel.IndustryArray().length > 0) {
            for (var i = 0; i < viewModel.IndustryArray().length; i++) {
                if (viewModel.IndustryArray()[i].industryId == viewModel.dataIndustry()[viewModel.selectedIndexIndustry()].value) {
                    alert("Industry Already Added");
                }
                else {
                    var newIndustry = new createIndustry(viewModel.dataIndustry(), viewModel.selectedIndexIndustry());
                    viewModel.IndustryArray.push(newIndustry);
                    viewModel.addIndustryCheck('0');
                }
            }
        }
        else {
            var newIndustry = new createIndustry(viewModel.dataIndustry(), viewModel.selectedIndexIndustry());
            viewModel.IndustryArray.push(newIndustry);
            viewModel.addIndustryCheck('0');
        }
    }

    viewModel.addJobSeekerindustry = function () {
        viewModel.dataIndustry = ko.observable(createList("Category" , 0));
        viewModel.selectedIndexIndustry = ko.observable();
        viewModel.addIndustryCheck('1');
    }
    viewModel.cancelIndustry = function () {
        viewModel.addIndustryCheck('0');
    }
    viewModel.clickButtonSkillReference = function (referenceObj)
    {
        if (referenceObj.isEditableReference() == false) {
            referenceObj.btnReference("Add More");
        }
        else {
            addMoreReferences(referenceObj);
            referenceObj.btnReference("Edit");
            referenceObj.isEditableReference(false);
        }
        referenceObj.isEditableReference(true);

    }
    viewModel.addFirstReference = function (referenceObj){       
        referenceObj.btnReference("Add More");
        referenceObj.isEditableReference(true);                
        addMoreReferences(referenceObj);

    }    
   
    var currentReference = [];
    viewModel.editReferenceDetails = function (referenceObj) {
        var rferenceObj = ko.mapping.fromJS(referenceObj);
        rferenceObj.FirstName.extend({ required: true });
        rferenceObj.Position.extend({ required: true });
        referenceObj.isEdit('1');
        referenceObj.deleteCheck('1');
        currentReference.push(ko.toJS(referenceObj));
    }
    viewModel.deleteReference = function (referenceObj){
        var ReferenceDelete = confirm("Do you want to delete!");
        if (ReferenceDelete == true) {
            if (referenceObj.Id() != "") {
                $.ajax({
                    url: GetWebAPIURL() + '/api/SkillReference?Id=' + referenceObj.Id(),
                    type: "DELETE",
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        $.each(viewModel.IndustryArray(), function () {
                            $.each(this.competencyArray(), function () {
                                $.each(this.skillArray(), function () {
                                    this.referenceArray.remove(referenceObj);
                                    if (this.referenceArray().length == 0) {
                                        this.referenceCheck('0');
                                        this.isEditableReference(false);
                                    }
                                })
                            })
                        })
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
    }
    viewModel.saveReference = function (referenceObj) {
        var valid = referenceObj.FirstName.isValid() && referenceObj.Position.isValid();
        if (!valid) {
            referenceObj.errors.showAllMessages();
            return;
        }
        if (referenceObj.Id() == "") {
            $.ajax({
                url:  GetWebAPIURL() + '/api/SkillReference',
                type: "POST",
                data: ko.mapping.toJSON(referenceObj),
                headers: app.securityHeaders(),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    referenceObj.isEdit('0');
                    referenceObj.Id(data);
                    $.each(viewModel.IndustryArray(), function () {
                        $.each(this.competencyArray(), function () {
                            $.each(this.skillArray(), function () {                              
                                if (referenceObj.MemberSkillId() == this.Id()) {
                                    this.btnReference("Add More");
                                    this.isEditableReference(true);
                                }
                            });
                        });
                    });
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
        else {
            $.ajax({
                url: GetWebAPIURL() + '/api/SkillReference',
                type: "PUT",
                data: ko.mapping.toJSON(referenceObj),
                headers: app.securityHeaders(),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    referenceObj.isEdit('0');
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
    }
    viewModel.cancelReference = function (referenceObj) {              
        if (referenceObj.Id() == "") {
            $.each(viewModel.IndustryArray(), function () {
                $.each(this.competencyArray(), function () {
                    $.each(this.skillArray(), function () {
                        if (referenceObj.MemberSkillId() == this.Id()) {
                            this.btnReference("Add More");
                            this.isEditableReference(true);
                        }
                        this.referenceArray.remove(referenceObj);
                        if (this.referenceArray().length == 0) {
                            this.referenceCheck('0');
                            this.isEditableReference(false);
                        }
                    })
                })
            })
        }
        else {
            for (var i = 0; i < currentReference.length; i++) {
                if (referenceObj.Id() == currentReference[i].Id) {
                    referenceObj.isEdit('0');
                    referenceObj.FirstName(currentReference[i].FirstName);
                    referenceObj.LastName(currentReference[i].LastName);
                    referenceObj.Position(currentReference[i].Position);
                    referenceObj.Description(currentReference[i].Description);
                    referenceObj.ContactInformation(currentReference[i].ContactInformation);
                }
            }
        }
    }

    viewModel.clickButtonSkillSupportingMaterial = function (supportingObj) {
        if (supportingObj.isEditableSupportingMaterial() == false) {
            supportingObj.btnSupportingMaterial("Add More");
        }
        else {
            addMoreSuppotingMaterials(supportingObj);
            supportingObj.btnSupportingMaterial("Edit");
            supportingObj.isEditableSupportingMaterial(false);
        }
        supportingObj.isEditableSupportingMaterial(true);
    }
    viewModel.addFirstSupportingMaterial = function (supportingObj) {       
        supportingObj.btnSupportingMaterial("Add More");
        supportingObj.isEditableSupportingMaterial(true);
        addMoreSuppotingMaterials(supportingObj);        
    }   
    viewModel.deleteSupportingMaterial = function (supportingObj) {
        var SupportDelete = confirm("Do you want to delete!");
        if (SupportDelete == true) {
            if (supportingObj.Id() != "") {
                $.ajax({
                    url: GetWebAPIURL() + '/api/SkillSupportingMaterial?Id=' + supportingObj.Id(),
                    type: "DELETE",
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        $.each(viewModel.IndustryArray(), function () {
                            $.each(this.competencyArray(), function () {
                                $.each(this.skillArray(), function () {
                                    this.supportingMaterialArray.remove(supportingObj);
                                    if (this.supportingMaterialArray().length == 0) {
                                        this.supportingMaterialCheck('0');
                                        this.isEditableSupportingMaterial(false);
                                    }
                                })
                            })
                        })
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
    }
    viewModel.saveSupportingMaterial = function (supportingObj) {
        var valid = supportingObj.MaterialTitle.isValid();
        if (!valid) {
            supportingObj.errors.showAllMessages();
            return;
        }
        if (supportingObj.Id() == "") {
            $.ajax({
                url: GetWebAPIURL() + '/api/SkillSupportingMaterial',
                type: "POST",
                data: ko.mapping.toJSON(supportingObj),
                headers: app.securityHeaders(),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    supportingObj.isEdit('0');
                    supportingObj.Id(data);
                    $.each(viewModel.IndustryArray(), function () {
                        $.each(this.competencyArray(), function () {
                            $.each(this.skillArray(), function () {
                                if (supportingObj.MemberSkillId() == this.Id()) {
                                    this.isEditableSupportingMaterial(true);
                                    this.btnSupportingMaterial("Add More");
                                }
                            });
                        });
                    });
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
        else {
            $.ajax({
                url: GetWebAPIURL() + '/api/SkillSupportingMaterial',
                type: "PUT",
                data: ko.mapping.toJSON(supportingObj),
                headers: app.securityHeaders(),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    supportingObj.isEdit('0');
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
    }
    viewModel.cancelSupportingMaterial = function (supportingObj) {
        if (supportingObj.Id() == "") {
            $.each(viewModel.IndustryArray(), function () {
                $.each(this.competencyArray(), function () {
                    $.each(this.skillArray(), function () {
                        if (supportingObj.MemberSkillId() == this.Id()) {
                            this.isEditableSupportingMaterial(true);
                            this.btnSupportingMaterial("Add More");
                        }
                        this.supportingMaterialArray.remove(supportingObj);
                        if (this.supportingMaterialArray().length == 0) {
                            this.referenceCheck('0');
                            this.isEditableSupportingMaterial(false);
                        }
                    })
                })
            })
        }
        else {
            for (var i = 0; i < currentsupporting.length; i++) {
                if (supportingObj.Id() == currentsupporting[i].Id) {
                    supportingObj.isEdit('0');
                    supportingObj.MaterialTitle(currentsupporting[i].MaterialTitle);
                    supportingObj.WebsiteUrl(currentsupporting[i].WebsiteUrl);
                    supportingObj.Description(currentsupporting[i].Description);
                }
            }
        }
    }
    var currentsupporting = [];
    viewModel.editSupportingMaterialDetails = function (supportingObj) {
        var editObj = ko.mapping.fromJS(supportingObj);
        editObj.MaterialTitle.extend({ required: true });
        supportingObj.isEdit('1');
        supportingObj.deleteCheck('1');
        currentsupporting.push(ko.toJS(supportingObj));
    }

    viewModel.clickButtonSkillRelatedExperience = function (relatedExperienceObj)
    {
        if (relatedExperienceObj.isEditableRelatedExperience() == false) {
            relatedExperienceObj.btnRelatedExperience("Add More");
        }
        else {
            addMoreRelatedExperiences(relatedExperienceObj);
            relatedExperienceObj.btnRelatedExperience("Edit");
            relatedExperienceObj.isEditableRelatedExperience(false);
        }
        relatedExperienceObj.isEditableRelatedExperience(true);
    }    
    viewModel.addFirstRelatedExperience = function (relatedExperienceObj)
    {       
        relatedExperienceObj.btnRelatedExperience("Add More");
        relatedExperienceObj.isEditableRelatedExperience(true);
        addMoreRelatedExperiences(relatedExperienceObj);
    }
    viewModel.saveRelatedExperience = function (relatedExperienceObj)
    {
        var valid = relatedExperienceObj.CompanyName.isValid() && relatedExperienceObj.Position.isValid();
        if (!valid) {
            relatedExperienceObj.errors.showAllMessages();
            return;
        }
        if (relatedExperienceObj.Id() == "") {
            relatedExperienceObj.StartDate(relatedExperienceObj.editStartDate());
            relatedExperienceObj.EndDate(relatedExperienceObj.editEndDate());
            $.ajax({
                url: GetWebAPIURL() + '/api/SkillRelatedExperience',
                type: "POST",
                data: ko.mapping.toJSON(relatedExperienceObj),
                headers: app.securityHeaders(),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    relatedExperienceObj.isEdit('0');
                    relatedExperienceObj.Id(data);
                    $.each(viewModel.IndustryArray(), function () {
                        $.each(this.competencyArray(), function () {
                            $.each(this.skillArray(), function () {
                                if (relatedExperienceObj.MemberSkillId() == this.Id()) {
                                    this.btnRelatedExperience("Add More");
                                    this.isEditableRelatedExperience(true);
                                }
                            });
                        });
                    });
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
        else {
            relatedExperienceObj.StartDate(relatedExperienceObj.editStartDate());
            relatedExperienceObj.EndDate(relatedExperienceObj.editEndDate());
            $.ajax({
                url: GetWebAPIURL() + '/api/SkillRelatedExperience',
                type: "PUT",
                data: ko.mapping.toJSON(relatedExperienceObj),
                headers: app.securityHeaders(),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    relatedExperienceObj.isEdit('0');
                    relatedExperienceObj.Id(data);
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
    }
    viewModel.cancelRelatedExperience = function (relatedExperienceObj)
    {
        if (relatedExperienceObj.Id() == "") {
            $.each(viewModel.IndustryArray(), function () {
                $.each(this.competencyArray(), function () {
                    $.each(this.skillArray(), function () {
                        if (relatedExperienceObj.MemberSkillId() == this.Id()) {
                            this.btnRelatedExperience("Add More");
                            this.isEditableRelatedExperience(true);
                        }
                        this.relatedExperienceArray.remove(relatedExperienceObj);
                        if (this.relatedExperienceArray().length == 0) {
                            this.relatedExperienceCheck('0');
                            this.isEditableRelatedExperience(false);
                        }
                    })
                })
            })
        }
        else {
            for (var i = 0; i < currentrelatedExperience.length; i++) {
                if (relatedExperienceObj.Id() == currentrelatedExperience[i].Id) {
                    relatedExperienceObj.isEdit('0');
                    relatedExperienceObj.CompanyName(currentrelatedExperience[i].CompanyName);
                    relatedExperienceObj.Position(currentrelatedExperience[i].Position);
                    relatedExperienceObj.editStartDate(currentrelatedExperience[i].editStartDate);
                    relatedExperienceObj.editEndDate(currentrelatedExperience[i].editEndDate);
                }
            }
        }
    }
    viewModel.deleteRelatedExperience = function (relatedExperienceObj) {
        var RelatedExperienceDelete = confirm("Do you want to delete!");
        if (RelatedExperienceDelete == true) {
            if (relatedExperienceObj.Id() != "") {
                $.ajax({
                    url: GetWebAPIURL() + '/api/SkillRelatedExperience?Id=' + relatedExperienceObj.Id(),
                    type: "DELETE",
                    headers: app.securityHeaders(),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    success: function (data) {
                        $.each(viewModel.IndustryArray(), function () {
                            $.each(this.competencyArray(), function () {
                                $.each(this.skillArray(), function () {
                                    this.relatedExperienceArray.remove(relatedExperienceObj);
                                    if (this.relatedExperienceArray().length == 0) {
                                        this.relatedExperienceCheck('0');
                                        this.isEditableRelatedExperience(false);
                                    }
                                })
                            })
                        })
                    },
                    error: function (xhr, status, error) {
                        app.manageError(error);
                    }
                });
            }
        }
    }
    var currentrelatedExperience = [];
    viewModel.editRelatedExperienceDetails = function (relatedExperienceObj) {
        var editObj = ko.mapping.fromJS(relatedExperienceObj);
        editObj.CompanyName.extend({ required: true });
        editObj.Position.extend({ required: true });
        relatedExperienceObj.isEdit('1');
        relatedExperienceObj.deleteCheck('1');
        currentrelatedExperience.push(ko.toJS(relatedExperienceObj));
    }

    viewModel.addJobSeekerSkillDirect = function (obj) {
        viewModel.dataIndustry = ko.observable(createList("Category", 0));
        viewModel.selectedIndexIndustry = ko.observable(0);

        viewModel.dataCompetency = ko.observable();
        viewModel.selectedIndexCompetency = ko.observable(0);

        viewModel.selectedIndexSkill = ko.observable(0);
        viewModel.dataSkill = ko.observable();

        viewModel.selectedIndexIndustry.subscribe(function (newValue) {
            var industryId = viewModel.dataIndustry()[viewModel.selectedIndexIndustry()].value;
            if (industryId != '') {
                viewModel.dataCompetency(createList("Category", industryId));                
            }
        });
        viewModel.selectedIndexCompetency.subscribe(function (newValue) {
            var competencyId = viewModel.dataCompetency()[viewModel.selectedIndexCompetency()].value;
            if (competencyId != '') {
                viewModel.dataSkill(createList("SkillMenu", competencyId));
            }
        });
        
        obj.addJobSeekerSkillDirectCheck('1');
    }

    viewModel.saveSkillsDirect = function (obj) {
        var currentJobSeekerIndustryObj;
        var currentJobSeekerCompetencyObj;
        var skillFlag = 0;
        var competencyFlag = 0;
        var industryFlag = 0;
        for (var i = 0; i < viewModel.IndustryArray().length; i++) {
            if (viewModel.IndustryArray()[i].industryId == viewModel.dataIndustry()[viewModel.selectedIndexIndustry()].value) {
                industryFlag = 1;
                currentJobSeekerIndustryObj = viewModel.IndustryArray()[i];
                for (var j = 0; j < viewModel.IndustryArray()[i].competencyArray().length; j++) {
                    if (viewModel.IndustryArray()[i].competencyArray()[j].competencyId == viewModel.dataCompetency()[viewModel.selectedIndexCompetency()].value) {
                        competencyFlag = 1;
                        currentJobSeekerCompetencyObj = viewModel.IndustryArray()[i].competencyArray()[j];
                        for (var k = 0; k < viewModel.IndustryArray()[i].competencyArray()[j].skillArray().length; k++) {
                            if (viewModel.IndustryArray()[i].competencyArray()[j].skillArray()[k].SkillMapId() == viewModel.dataSkill()[viewModel.selectedIndexSkill()].value) {
                                alert("Skill already added in your Skill List");
                                skillFlag = 1;
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (industryFlag == 0) {
            var newIndustry = new createIndustry(viewModel.dataIndustry(), viewModel.selectedIndexIndustry());
            currentJobSeekerIndustryObj = newIndustry;
            viewModel.IndustryArray.push(newIndustry);
        }
        if (competencyFlag == 0) {
            var newCompetency = new createCompetency(viewModel.dataCompetency(), viewModel.selectedIndexCompetency());
            currentJobSeekerCompetencyObj = newCompetency;
            currentJobSeekerIndustryObj.competencyArray.push(newCompetency);

        }
        if (skillFlag == 0) {
            var newSkill = new createSkill(viewModel.dataSkill(), viewModel.selectedIndexSkill(), obj);
            currentJobSeekerCompetencyObj.skillArray.push(newSkill);
        }
        obj.addJobSeekerSkillDirectCheck('0');
    }
    viewModel.cancelSkillsDirect = function (obj) {
        obj.addJobSeekerSkillDirectCheck('0');
    }
    for (var a = 0; a < viewModel.IndustryArray().length; a++) {
        for (var b = 0; b < viewModel.IndustryArray()[a].competencyArray().length; b++) {
            viewModel.IndustryArray()[a].competencyArray()[b].skillArray.sort(function (left, right) {
                return left.skillName() == right.skillName() ? 0 : (left.skillName() < right.skillName() ? -1 : 1)
            });
        }
    }
}
function addMoreReferences(referenceObj) {
    var initializeObject = { "Id": "", "MemberSkillId": referenceObj.Id(), "FirstName": "", "LastName": "", "Position": "", "Description": "", "ContactInformation": "", "isEdit": "", "deleteCheck": "0" };
    var data = ko.mapping.fromJS(initializeObject);
    referenceObj.referenceArray.splice(0, 0, data);
    referenceObj.referenceArray()[0].FirstName.extend({ required: true });
    referenceObj.referenceArray()[0].Position.extend({ required: true });
    referenceObj.referenceArray()[0].isEdit("1");
    referenceObj.errors = ko.validation.group(referenceObj.referenceArray()[0]);
}
function addMoreSuppotingMaterials(supportingObj) {
    var initializeObject = { "Id": "", "MemberSkillId": supportingObj.Id(), "MaterialTitle": "", "WebsiteUrl": "", "Description": "", "isEdit": "", "deleteCheck": "0" };
    var data = ko.mapping.fromJS(initializeObject);
    supportingObj.supportingMaterialArray.splice(0, 0, data);
    supportingObj.supportingMaterialArray()[0].MaterialTitle.extend({ required: true });
    supportingObj.supportingMaterialArray()[0].isEdit("1");
    supportingObj.errors = ko.validation.group(supportingObj.supportingMaterialArray()[0]);
}
function addMoreRelatedExperiences(relatedExperienceObj) {
    var initializeObject = { "Id": "", "MemberSkillId": relatedExperienceObj.Id(), "CompanyName": "", "Position": "", "StartDate": "", "EndDate": "", "isEdit": "", "deleteCheck": "0", "editStartDate": Date(), "editEndDate": Date() };
    var data = ko.mapping.fromJS(initializeObject);
    relatedExperienceObj.relatedExperienceArray.splice(0, 0, data);
    relatedExperienceObj.relatedExperienceArray()[0].CompanyName.extend({ required: true });
    relatedExperienceObj.relatedExperienceArray()[0].Position.extend({ required: true });
    relatedExperienceObj.relatedExperienceArray()[0].isEdit("1");
    relatedExperienceObj.errors = ko.validation.group(relatedExperienceObj.relatedExperienceArray()[0]);
}