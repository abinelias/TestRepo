var viewModel = {};
viewModel.usersList = ko.observableArray();
viewModel.userListId = ko.observableArray();
var jobIdArray = [];
var jobSeekerIdArray = [];
var dataReviewObj = [];

$(function () {   
    if (!app.loggedIn()) {
        window.location = '/Views/Seeker/Account.html';
        return;
    }    
    viewModel["HeaderEmployer"] = ko.mapping.fromJS(getList("HeaderEmployer"));
    pagination();
    var dataEmployerList = createListSkill("Employer", viewModel.HeaderEmployer.CompanyId());
    var dataCompany = getListById("Company", viewModel.HeaderEmployer.CompanyId());
    var dataJobObj = getListById("JobsList", viewModel.HeaderEmployer.CompanyId());
    for (var j = 0; j < dataJobObj.length; j++)
        jobIdArray.push(dataJobObj[j].Id);

    viewModel.btnOpenJobs = ko.observable('+');
    viewModel.btnJobsProgress = ko.observable('+');
    viewModel.createjobCheck = ko.observable(1);
    initMultiselectBindings();
    Trimtext();
    viewModel.loadOps = 0;
    initLookups(viewModel, ['RefWorkType', 'RefCountry', 'RefSector', 'RefEmployerSize', 'RefSalary', 'RefDegreeType']);
    viewModel['companyData'] = ko.mapping.fromJS(dataCompany);
    var creditorData = {};
    creditorData.MemberData = dataJobObj;
    viewModel['JobsList'] = ko.mapping.fromJS(creditorData);
    dataApplicantList = getListById("MembersForJob", jobIdArray.toString());
    for (var i = 0; i < dataApplicantList.length; i++) {
        if (jobSeekerIdArray.indexOf(dataApplicantList[i].MemberId) == -1)
            jobSeekerIdArray.push(dataApplicantList[i].MemberId);
    }
    var dataSkillObj = getListById("GetJobSkills", jobIdArray.toString());
    var dataJobPrerequisiteList = getListById("GetJobPrerequisites", jobIdArray.toString());
    var dataPrerequisiteAll = getListById("Prerequisite", '');
    if (jobSeekerIdArray.length > 0) {
        var dataApplicantScore = getDetailsById("GetCalculatedScore", jobIdArray.toString(), jobSeekerIdArray.toString(), "applicant");
        jobSeekerListDetails(1, dataApplicantList, jobIdArray.toString());
    }
    initStates(viewModel, 1);
    $('#cmbState').wijcombobox({ "data": viewModel.RefState });

    var competencyId;
    var currentCompetencyObj;
    var selectedCompetency = '';
    var jobid = '';
    var dataskill = '';
    var selctdskill = '';
    viewModel.importance = ko.observableArray();
    for (var i = 1; i <= 10; i++) {
        viewModel.importance.push({
            name: i,
            id: i
        });
    }
    viewModel.dataCompetency = ko.observable(createListSkill("Category", dataCompany.Industry));
    viewModel.selectedIndexCompetency = ko.observable(0);
    viewModel.dataIndustry = ko.observable(createListSkill("Category", 0));

    
    viewModel.JobsList.MemberData.extend({ paging: 5 });

    for (var i = 0; i < viewModel.JobsList.MemberData().length; i++) {
        viewModel.JobsList.MemberData()[i].editJobsCheck = ko.observable('0');
        viewModel.JobsList.MemberData()[i].jobCheck = ko.observable(0);
        viewModel.JobsList.MemberData()[i].inSaveMode = ko.observable(false);
        viewModel.JobsList.MemberData()[i].btnJobDetails = ko.observable('+');
        if (viewModel.JobsList.MemberData()[i].StartDate)
            viewModel.JobsList.MemberData()[i].editStartDate = ko.observable(new Date(viewModel.JobsList.MemberData()[i].StartDate()));
        if (viewModel.JobsList.MemberData()[i].EndDate)
            viewModel.JobsList.MemberData()[i].editEndDate = ko.observable(new Date(viewModel.JobsList.MemberData()[i].EndDate()));
        if (viewModel.JobsList.MemberData()[i].PostingDate)
            viewModel.JobsList.MemberData()[i].postingdate = convertDate(viewModel.JobsList.MemberData()[i].PostingDate());

        viewModel.JobsList.MemberData()[i].skillCheck = ko.observable(0);
        viewModel.JobsList.MemberData()[i].addCompetencyCheck = ko.observable(0);
        viewModel.JobsList.MemberData()[i].CompetencyArray = ko.observableArray();
        viewModel.JobsList.MemberData()[i].prerequisiteArray = ko.observableArray();
        viewModel.JobsList.MemberData()[i].editingPrerequisite = ko.observable(false);
        viewModel.JobsList.MemberData()[i].prerequisiteCheck = ko.observable('0');
        viewModel.JobsList.MemberData()[i].btnPrerequisite = ko.observable("Edit");
        viewModel.JobsList.MemberData()[i].addMorePrerequisite = ko.observable(0);
        viewModel.JobsList.MemberData()[i].jobSeekerDetails = ko.observableArray();
        viewModel.JobsList.MemberData()[i].btnApplicantDetails = ko.observable('+');
        for (var j = 0; j < dataSkillObj.length; j++) {
            if (dataSkillObj[j].JobId == viewModel.JobsList.MemberData()[i].Id()) {
                if (dataSkillObj[j].CompetencyId != competencyId) {
                    var jobCompetency = new createCompetency(dataSkillObj[j], selectedCompetency, viewModel.JobsList.MemberData()[i].Id());
                    viewModel.JobsList.MemberData()[i].CompetencyArray.push(jobCompetency);
                    competencyId = dataSkillObj[j].CompetencyId;
                    currentCompetencyObj = jobCompetency;
                }
                else {
                    var skillObj = new createSkill(dataskill, selctdskill, dataSkillObj[j], jobid);
                    currentCompetencyObj.SkillArray.push(skillObj);
                    competencyId = dataSkillObj[j].CompetencyId;
                }
                viewModel.JobsList.MemberData()[i].skillCheck('1');
            }
        }

        for (var j = 0; j < dataJobPrerequisiteList.length; j++) {
            if (dataJobPrerequisiteList[j].JobId == viewModel.JobsList.MemberData()[i].Id()) {
                viewModel.JobsList.MemberData()[i].prerequisiteArray.push(ko.mapping.fromJS(dataJobPrerequisiteList[j]));
            }
        }
        for (var j = 0; j < viewModel.JobsList.MemberData()[i].prerequisiteArray().length; j++) {
            viewModel.JobsList.MemberData()[i].prerequisiteArray()[j].isEdit = ko.observable(0);
        }

        for (var j = 0; j < dataApplicantList.length; j++) {
            if (dataApplicantList[j].JobId == viewModel.JobsList.MemberData()[i].Id()) {
                var JobseekerList = new JobSeekerDetails(dataApplicantList[j].MemberId, dataApplicantScore, viewModel.JobsList.MemberData()[i].Id(), 1, dataReviewObj);
                viewModel.JobsList.MemberData()[i].jobSeekerDetails.push(JobseekerList);
            }
        }
    }
    initTemplates(viewModel, '/Templates/Employer/', ["JobsOpen", "JobPrerequisites", "JobSkills", "JobApplicant", "ActivitySummary"], ensureTemplates);

    viewModel.expandJobsProgress = function () {
        toggle(viewModel.btnJobsProgress);
    }
    viewModel.expandOpenJobs = function () {
        toggle(viewModel.btnOpenJobs);
    }
    var selectedJobObj = [];
    viewModel.editJobs = function (objJobDetails) {
        selectedJobObj.push(ko.mapping.toJS(objJobDetails));
        var jobObj = ko.mapping.fromJS(objJobDetails);
        jobObj.JobPosition.extend({ required: true });
        jobObj.JobDescription.extend({ required: true });
        jobObj.MinimumSalary.extend({ required: true });
        jobObj.MaximumSalary.extend({ required: true });
        jobObj.NoOfOpenings.extend({ required: true });
        objJobDetails.editJobsCheck('1');
    }

    viewModel.cancelJobDetails = function (objJobDetails) {
        objJobDetails.inSaveMode(false);
        var indexId = viewModel.JobsList.MemberData.indexOf(objJobDetails);
        for (var j = 0; j < selectedJobObj.length; j++) {
            if (objJobDetails.Id() == selectedJobObj[j].Id) {
                viewModel.JobsList.MemberData.replace(viewModel.JobsList.MemberData()[indexId], ko.mapping.fromJS(selectedJobObj[j]));
                viewModel.JobsList.MemberData()[indexId].editJobsCheck('0');
                selectedJobObj.splice(j, 1);
            }
        }
        objJobDetails.editJobsCheck('0');
    }
    viewModel.expandJobDetails = function (objJobDetails) {
        toggle(objJobDetails.btnJobDetails);
    }
    viewModel.saveJob = function (objSave) {
        jobSave(objSave, 1);
    }
    viewModel.publishJob = function (objSave) {
        objSave.PublishId(1);
        jobSave(objSave, 1);
    }
    viewModel.cancelJob = function (jobLists) {
        jobLists.inSaveMode(false);
        viewModel.createjobCheck(1);
        jobLists.jobCheck(0);
        if (jobLists.Id() == '') {
            viewModel.JobsList.MemberData.remove(jobLists);
        }
        else {
            for (var i = 0; i < viewModel.JobsList.MemberData()[0].prerequisiteArray().length; i++) {
                if (viewModel.JobsList.MemberData()[0].prerequisiteArray()[i].Id()) {
                    $.ajax({
                        url: GetWebAPIURL() + '/api/JobPrerequisite?Id=' + viewModel.JobsList.MemberData()[0].prerequisiteArray()[i].Id(),
                        type: "DELETE",
                        contentType: "application/json; charset=utf-8",
                        async: false,
                        success: function (data) {

                        },
                        error: function (xhr, status, error) {
                            app.manageError(error);
                        }
                    });
                }
            }
            for (var i = 0; i < viewModel.JobsList.MemberData()[0].CompetencyArray().length; i++) {
                for (var j = 0; j < viewModel.JobsList.MemberData()[0].CompetencyArray()[i].SkillArray().length; j++) {
                    if (viewModel.JobsList.MemberData()[0].CompetencyArray()[i].SkillArray()[j].Id()) {
                        $.ajax({
                            url: GetWebAPIURL() + '/api/JobSkills?Id=' + viewModel.JobsList.MemberData()[0].CompetencyArray()[i].SkillArray()[j].Id(),
                            type: "DELETE",
                            contentType: "application/json; charset=utf-8",
                            async: false,
                            success: function (data) {
                            },
                            error: function (xhr, status, error) {
                                app.manageError(error);
                            }
                        });
                    }
                }
            }
            $.ajax({
                url: GetWebAPIURL() + '/api/JobsList?id=' + jobLists.Id(),
                type: "DELETE",
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {

                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
    }
    var selectedSkill = [];
    viewModel.expandJobSkillDetails = function (objExpand) {
        toggle(objExpand.btnSkillList);
        selectedSkill.push(ko.toJS(objExpand));
    }
    viewModel.expandCompetencyDetails = function (objJobDetails) {
        toggle(objJobDetails.btnCompetencyList);
    }
    viewModel.deleteJobSkillDetails = function (objSkillDetails) {
        var deleteSkill = confirm("Delete this Skill?");
        if (deleteSkill == true) {
            var flag = 0;
            $.ajax({
                url: GetWebAPIURL() + '/api/JobSkills?Id=' + objSkillDetails.Id(),
                type: "DELETE",
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    $.each(viewModel.JobsList.MemberData(), function () {
                        $.each(this.CompetencyArray(), function () {
                            this.SkillArray.remove(objSkillDetails);
                            if (this.SkillArray().length == 0) {
                                flag = 1;
                            }
                        });
                        if (flag == 1)
                            this.CompetencyArray.pop();
                        if (this.CompetencyArray().length == 0)
                            this.skillCheck('0');
                    });
                    objSkillDetails.addSkillCheck('0');
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
    }
    viewModel.saveSkillDetails = function (skillObj) {
        if (skillObj.Required() == true) 
            skillObj.Required(1);
        
        else
            skillObj.Required(0);

        $.ajax({
            url: GetWebAPIURL() + '/api/JobSkills',
            type: "PUT",
            data: ko.mapping.toJSON(skillObj),
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (data) {
                skillObj.btnSkillList('+');
            },
            error: function (xhr, status, error) {
                app.manageError(error);
            }
        });
    }
    viewModel.cancelSkillDetails = function (skillObj) {
        skillObj.btnSkillList('+');
        for (var i = 0; i < selectedSkill.length; i++) {
            if (skillObj.Id() == selectedSkill[i].Id) {
                skillObj.Required(selectedSkill[i].Required);
                skillObj.SkillImportance(selectedSkill[i].SkillImportance);
            }
        }
    }
    viewModel.addFirstSkill = function (objSave) {
        if (objSave.Id() == "") {
            jobSave(objSave, 0);
        }
        if (objSave.Id() != "") {
            objSave.addCompetencyCheck('1');
            objSave.skillCheck('1');
        }
    }
    viewModel.addCompetency = function (objSkill) {
        objSkill.addCompetencyCheck('1');
    }
    viewModel.saveCompetency = function (objSkill) {
        var flag = 0;
        if (viewModel.selectedIndexCompetency() == 0)
            alert("select competency");
        else {
            for (var i = 0; i < objSkill.CompetencyArray().length; i++) {
                if (objSkill.CompetencyArray()[i].competencyId() == viewModel.dataCompetency()[viewModel.selectedIndexCompetency()].value)
                    flag = 1;
            }
            if (flag == 0) {
                var dataskilobj = '';
                objSkill.addCompetencyCheck('0');
                var specility = new createCompetency(dataskilobj, viewModel.selectedIndexCompetency(), objSkill.Id());
                objSkill.CompetencyArray.push(specility);
            }
        }
    }
    viewModel.CancelCompetency = function (objSkill) {
        objSkill.addCompetencyCheck('0');
        if (objSkill.CompetencyArray().length == 0)
            objSkill.skillCheck('0');
    }
    viewModel.cancelSkills = function (skillObj) {
        skillObj.addSkillCheck('0');
    }
    var prerequisiteFlag = 0;
    viewModel.clickButtonPrerequisites = function (objPrerequisite) {
        var objprereqst = '';
        if (objPrerequisite.btnPrerequisite() == "Add More") {
            objPrerequisite.selectedIndexThirdLevelPrerequisiteTest = ko.observableArray();
            objPrerequisite.editingPrerequisite(true);
            createPrerequisite(objPrerequisite, 2);
            objPrerequisite.addMorePrerequisite(1);
        }
        else {
            objPrerequisite.btnPrerequisite("Add More");
        }
    }
    var SelectedPrerequisiteList = [];
    viewModel.editJobPrerequisiteDetails = function (objPrerequisites) {
        objPrerequisites.selectedIndexThirdLevelPrerequisite = ko.observable(0);
        createPrerequisite(objPrerequisites, 1);
        objPrerequisites.isEdit(1);
        SelectedPrerequisiteList.push(ko.toJS(objPrerequisites));
    }
    viewModel.cancelPrerequisitesList = function (objPrerequisites) {
        if (objPrerequisites.Id()) {
            objPrerequisites.isEdit(0);
            for (var i = 0; i < SelectedPrerequisiteList.length; i++) {
                if (SelectedPrerequisiteList[i].Id == objPrerequisites.Id()) {
                    objPrerequisites.selectedIndexPrerequisite(SelectedPrerequisiteList[i].selectedIndexPrerequisite);
                    objPrerequisites.selectedIndexSecondLevelPrerequisitess(SelectedPrerequisiteList[i].selectedIndexSecondLevelPrerequisitess);
                    objPrerequisites.selectedIndexThirdLevelPrerequisite(SelectedPrerequisiteList[i].selectedIndexThirdLevelPrerequisite);
                }
            }
        }          
    }
    viewModel.cancelPrerequisites = function (objPrerequisites) {
        if (objPrerequisites.prerequisiteArray().length == 0) {
            objPrerequisites.prerequisiteCheck('0');
            objPrerequisites.btnPrerequisite("Edit");
            
        }
        else {
            objPrerequisites.editingPrerequisite(false);
            objPrerequisites.addMorePrerequisite(0);
        }
    }
    viewModel.savePrerequisites = function (objPrerequisites) {
        if (objPrerequisites.selectedIndexThirdLevelPrerequisiteTest().length == 0) {
            alert("select atleast one Prerequisite");
        }
        else {
            for (var j = 0; j < objPrerequisites.selectedIndexThirdLevelPrerequisiteTest().length; j++) {
                var flag = 0;
                for (var k = 0; k < objPrerequisites.prerequisiteArray().length; k++) {
                    if (objPrerequisites.prerequisiteArray()[k].PrerequisiteId() == objPrerequisites.selectedIndexThirdLevelPrerequisiteTest()[j]) {
                        flag = 1;
                    }
                }
                if (flag == 0) {
                    var dataobjPrerequisite;
                    var prerequisiteObj = {}
                    prerequisiteObj.JobId = objPrerequisites.Id();
                    prerequisiteObj.PrerequisiteTypeId = objPrerequisites.selectedIndexThirdLevelPrerequisiteTest()[j];
                    dataobjPrerequisite = JSON.stringify(prerequisiteObj);
                    var initializeObject = { "Id": "", "JobId": objPrerequisites.Id(), "PrerequisiteId": objPrerequisites.selectedIndexThirdLevelPrerequisiteTest()[j], "PrerequisiteName": getFilterText(objPrerequisites.selectedIndexThirdLevelPrerequisiteTest()[j], objPrerequisites.dataThirdLevelPrerequisite()), "TypeId": objPrerequisites.dataSecondLevelPrerequisite()[objPrerequisites.selectedIndexSecondLevelPrerequisitess()].value, "TypeName": objPrerequisites.dataSecondLevelPrerequisite()[objPrerequisites.selectedIndexSecondLevelPrerequisitess()].label, "PrerequisiteIndustryId": dataCompany.Industry, "isEdit": 0 };
                    var data = ko.mapping.fromJS(initializeObject);
                    objPrerequisites.prerequisiteArray.splice(0, 0, data)
                    $.ajax({
                        url: GetWebAPIURL() + '/api/JobPrerequisite',
                        type: "POST",
                        data: dataobjPrerequisite,
                        contentType: "application/json; charset=utf-8",
                        async: false,
                        success: function (data) {
                            objPrerequisites.prerequisiteArray()[0].Id(data);
                        },
                        error: function (xhr, status, error) {
                            app.manageError(error);
                        }
                    });
                }
            }
            objPrerequisites.addMorePrerequisite(0);
            objPrerequisites.editingPrerequisite(false);
        }
    }
     
    viewModel.savePrerequisitesList = function (objPrerequisites) {
        var dataobjPrerequisite;
        var prerequisiteObj = {}
        objPrerequisites.PrerequisiteId(objPrerequisites.dataThirdLevelPrerequisite()[objPrerequisites.selectedIndexThirdLevelPrerequisite()].value);
        objPrerequisites.TypeId(objPrerequisites.dataSecondLevelPrerequisite()[objPrerequisites.selectedIndexSecondLevelPrerequisitess()].value);
        if (objPrerequisites.Id()) {
            prerequisiteObj.Id = objPrerequisites.Id();            
            prerequisiteObj.PrerequisiteTypeId = objPrerequisites.dataThirdLevelPrerequisite()[objPrerequisites.selectedIndexThirdLevelPrerequisite()].value;
            prerequisiteObj.JobId = objPrerequisites.JobId();
            dataobjPrerequisite = JSON.stringify(prerequisiteObj);
            $.ajax({
                url: GetWebAPIURL() + '/api/JobPrerequisite',
                type: "PUT",
                data: dataobjPrerequisite,
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    objPrerequisites.isEdit(0);
                    objPrerequisites.PrerequisiteName(objPrerequisites.dataThirdLevelPrerequisite()[objPrerequisites.selectedIndexThirdLevelPrerequisite()].label);
                    objPrerequisites.TypeName(objPrerequisites.dataSecondLevelPrerequisite()[objPrerequisites.selectedIndexSecondLevelPrerequisitess()].label);
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
        
    }
    viewModel.deletePrerequisitesList = function (objPrerequisites) {
        $.ajax({
            url: GetWebAPIURL() + '/api/JobPrerequisite?Id=' + objPrerequisites.Id(),
            type: "DELETE",
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (data) {
                $.each(viewModel.JobsList.MemberData(), function () {
                    this.prerequisiteArray.remove(objPrerequisites);
                    if (this.prerequisiteArray().length == 0) {
                        this.prerequisiteCheck('0');
                        this.btnPrerequisite("Edit");
                    }
                });
            },
            error: function (xhr, status, error) {
                app.manageError(error);
            }
        });
    }
    viewModel.addFirstPrerequisite = function (objSave) {
        objSave.inSaveMode(true);
        if (objSave.Id() == "") {
            jobSave(objSave, 0);
        }
        if (objSave.Id() != "") {
            objSave.btnPrerequisite("Add More");
            objSave.selectedIndexThirdLevelPrerequisiteTest = ko.observableArray();
            createPrerequisite(objSave, 2);
            objSave.addMorePrerequisite(1);
            objSave.editingPrerequisite(true);
        }
    }
    viewModel.expandApplicantDetails = function (objExpand) {
        toggle(objExpand.btnApplicantDetails);
    }
    viewModel.expandDetails = function (objExpand) {
        toggle(objExpand.btnExpandDetails);
    }
    viewModel.changeProficiency = function (skillObj) {
        setTimeout(function () {
            var apiUrlSkill = GetWebAPIURL() + '/api/JobSkills';
            $.ajax({
                url: apiUrlSkill,
                type: "PUT",
                data: ko.mapping.toJSON(skillObj),
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
    viewModel.createNewJob = function () {
        var initializeObject = { "CompanyName": viewModel.companyData.CompanyName, "CompanyId": viewModel.HeaderEmployer.CompanyId(), "Id": "", "JobViews": 0, "PublishId": 0, "JobPosition": "", "JobDescription": "", "MinimumSalary": "", "MaximumSalary": "", "NoOfOpenings": 0, "YearsOfExperience": 0, "JobType": 0, "DegreeId": 0, "EndDate": "", "StartDate": "", "editStartDate": new Date(), "editEndDate": new Date(), "PostingDate": new Date(), "JobSalary": [], "prerequisiteCheck": "", "btnPrerequisite": "Edit", "prerequisiteArray": [], "CompetencyArray": [], "skillCheck": "", "addCompetencyCheck": "", "editJobsCheck": "0", "inSaveMode": false, "btnJobDetails": "+", "postingdate": "", "jobSeekerDetails": [], "btnApplicantDetails": "+", "jobCheck": "" };
        var data = ko.mapping.fromJS(initializeObject);
        viewModel.JobsList.MemberData.splice(0, 0, data);
        viewModel.JobsList.MemberData()[0].JobPosition.extend({ required: true });
        viewModel.JobsList.MemberData()[0].JobDescription.extend({ required: true });
        viewModel.JobsList.MemberData()[0].MinimumSalary.extend({ required: true });
        viewModel.JobsList.MemberData()[0].MaximumSalary.extend({ required: true });
        viewModel.JobsList.MemberData()[0].prerequisiteCheck("0");
        viewModel.JobsList.MemberData()[0].skillCheck("0");
        viewModel.createjobCheck(0);
        viewModel.JobsList.MemberData()[0].jobCheck(1);
        viewModel.JobsList.errors = ko.validation.group(viewModel.JobsList.MemberData()[0]);
    }

    function getSalaryArray(minSalary, maxSalary, jobLists) {
        jobLists.JobSalary.removeAll();
        if (minSalary > 0 && minSalary < 20000) {
            jobLists.JobSalary.push(1);
        }
        if (minSalary > 20000 && minSalary <= 40000)
            jobLists.JobSalary.push(2);
        if (minSalary > 40000 && minSalary <= 60000)
            jobLists.JobSalary.push(3);
        if (minSalary > 60000 && minSalary <= 80000)
            jobLists.JobSalary.push(4);
        if (minSalary > 80000 && minSalary <= 100000)
            jobLists.JobSalary.push(5);
        if (minSalary > 100000 && minSalary <= 120000)
            jobLists.JobSalary.push(6);
        if (minSalary > 120000 && minSalary <= 150000)
            jobLists.JobSalary.push(7);
        if (minSalary > 150000)
            jobLists.JobSalary.push(8);

        if (maxSalary > 0 && maxSalary < 20000) {
            if (jobLists.JobSalary.indexOf(1) == -1)
                jobLists.JobSalary.push(1);
        }
        if (maxSalary > 20000 && maxSalary <= 40000) {
            if (jobLists.JobSalary.indexOf(2) == -1)
                jobLists.JobSalary.push(2);
        }
        if (maxSalary > 40000 && maxSalary <= 60000) {
            if (jobLists.JobSalary.indexOf(3) == -1)
                jobLists.JobSalary.push(3);
        }
        if (maxSalary > 60000 && maxSalary <= 80000) {
            if (jobLists.JobSalary.indexOf(4) == -1)
                jobLists.JobSalary.push(4);
        }
        if (maxSalary > 80000 && maxSalary <= 100000) {
            if (jobLists.JobSalary.indexOf(5) == -1)
                jobLists.JobSalary.push(5);
        }
        if (maxSalary > 100000 && maxSalary <= 120000) {
            if (jobLists.JobSalary.indexOf(6) == -1)
                jobLists.JobSalary.push(6);
        }
        if (maxSalary > 120000 && maxSalary <= 150000) {
            if (jobLists.JobSalary.indexOf(7) == -1)
                jobLists.JobSalary.push(7);
        }
        if (maxSalary > 150000) {
            if (jobLists.JobSalary.indexOf(8) == -1)
                jobLists.JobSalary.push(8);
        }
        for (var i = (parseInt(jobLists.JobSalary()[0]) + 1) ; i < parseInt(jobLists.JobSalary()[1]) ; i++)
            jobLists.JobSalary.push(i);
    }
    function createCompetency(skillCollection, selectedCompetency, jobid) {
        var jobsid = '';
        var dataskil = '';
        var selctdskill = '';
        var self = this;
        self.jobId = ko.observable();
        if (jobid != '')
            self.jobId(jobid);

        self.addSkillCheck = ko.observable('0');
        self.CompetencyName = ko.observable('');
        self.competencyId = ko.observable();
        self.btnCompetencyList = ko.observable('+');
        self.SkillArray = ko.observableArray();
        var skillObj = new createSkill(dataskil, selctdskill, skillCollection, jobsid);
        if (skillCollection != '') {
            self.competencyId(skillCollection.CompetencyId);
            self.CompetencyName(skillCollection.CompetencyName);
            self.SkillArray.push(skillObj);
        }
        if (selectedCompetency != '') {
            self.CompetencyName = ko.computed(function () {
                return viewModel.dataCompetency()[selectedCompetency].label;
            }, this);

            self.competencyId = ko.computed(function () {
                return viewModel.dataCompetency()[selectedCompetency].value;
            }, this);
        }
        self.addSkill = function (objCompetency) {
            var objSpeciality = ko.toJS(objCompetency);
            self.dataSkill = ko.observable(createListSkill("SkillMenu", objSpeciality.competencyId));
            self.selectedIndexSkill = ko.observableArray();
            objCompetency.addSkillCheck('1');
        }
        var objSkil = '';
        self.saveSkill = function (objSkill) {
            if (self.selectedIndexSkill().length == 0) {
                alert("select atleast one skill");
            }
            for (var i = 0; i < self.selectedIndexSkill().length; i++) {
                var flag = 0;
                for (var j = 0; j < self.SkillArray().length; j++) {
                    if (self.SkillArray()[j].SkillMapId == self.selectedIndexSkill()[i]) {
                        flag = 1;
                        objSkill.addSkillCheck('0');
                    }
                }
                if (flag == 0) {
                    var newSkill = new createSkill(self.dataSkill(), self.selectedIndexSkill()[i], objSkil, self.jobId());
                    self.SkillArray.push(newSkill);
                    objSkill.addSkillCheck('0');
                }
            }
        }
    }
    function createSkill(dataSkill, selectedIndexSkill, objSkill, jobid) {
        var self = this;
        self.btnSkillList = ko.observable('+');
        self.Id = ko.observable();
        self.Required = ko.observable();
        self.JobId = ko.observable();
        self.SkillImportance = ko.observable();
        self.SkillScore = ko.observable();
        self.skillName = ko.observable();
        if (objSkill != '') {
            self.SkillScore(objSkill.SkillScore);
            self.SkillImportance(objSkill.SkillImportance);
            self.skillName = objSkill.SkillName;
            self.competencyName = objSkill.CompetencyName;
            self.Required(objSkill.Required);
            self.JobId = objSkill.JobId;
            self.SkillMapId = objSkill.SkillMapId;
            self.Id(objSkill.Id);
        }
        if (selectedIndexSkill != '') {
            self.SkillMapId = selectedIndexSkill;
            self.skillName = getFilterText(selectedIndexSkill, dataSkill);
        }
        if (jobid != '') {
            self.JobId = jobid;
            var dataobjSkill;
            var jobSkillObj = {}
            jobSkillObj.JobId = jobid;
            jobSkillObj.SkillMapId = self.SkillMapId;
            jobSkillObj.SkillScore = 0;
            jobSkillObj.SkillImportance = 1;
            jobSkillObj.Required = 1;
            dataobjSkill = JSON.stringify(jobSkillObj);
            $.ajax({
                url: GetWebAPIURL() + '/api/JobSkills/',
                type: "POST",
                data: dataobjSkill,
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
    }
    function createPrerequisite(objPrerequisites, type) {
        objPrerequisites.selectedIndexSecondLevelPrerequisitess = ko.observable(0);
        objPrerequisites.dataThirdLevelPrerequisite = ko.observable();
        var prerequisiteTypeList = [];
        var prerequisiteList = [];
        for (da in dataPrerequisiteAll) {
            if (dataPrerequisiteAll[da].ParentId == dataCompany.Industry) {
                prerequisiteTypeList.push(dataPrerequisiteAll[da]);
            }
        }
        objPrerequisites.dataSecondLevelPrerequisite = ko.observable(createListPrerequisite(prerequisiteTypeList));
        objPrerequisites.selectedIndexSecondLevelPrerequisitess.subscribe(function (newValue) {
            var PrerequisiteId = objPrerequisites.dataSecondLevelPrerequisite()[objPrerequisites.selectedIndexSecondLevelPrerequisitess()].value;
            if (PrerequisiteId != "") {
                var prerequisiteList = [];
                for (da in dataPrerequisiteAll) {
                    if (dataPrerequisiteAll[da].ParentId == PrerequisiteId) {
                        prerequisiteList.push(dataPrerequisiteAll[da]);
                    }
                }
                objPrerequisites.dataThirdLevelPrerequisite(createListPrerequisite(prerequisiteList));

                for (da in prerequisiteList) {
                    if (objPrerequisites.PrerequisiteId() == prerequisiteList[da].Id) {
                        objPrerequisites.selectedIndexThirdLevelPrerequisite(parseInt(da) + 1);
                    }
                }
            }
        });

        if (type == 1) {
            for (da in prerequisiteTypeList) {
                if (objPrerequisites.TypeId() == prerequisiteTypeList[da].Id) {
                    objPrerequisites.selectedIndexSecondLevelPrerequisitess(parseInt(da) + 1);
                    break;
                }
            }
        }
    }
    function saveJobPosting(objSave) {
        if (objSave.Id()) {
            objSave.StartDate = ko.observable(objSave.editStartDate());
            objSave.EndDate = ko.observable(objSave.editEndDate());
            $.ajax({
                url: GetWebAPIURL() + '/api/JobsList/',
                type: "PUT",
                data: ko.mapping.toJSON(objSave),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
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
                url: GetWebAPIURL() + '/api/JobsList/',
                type: "POST",
                data: ko.mapping.toJSON(objSave),
                contentType: "application/json; charset=utf-8",
                async: false,
                success: function (data) {
                    objSave.Id(data);
                },
                error: function (xhr, status, error) {
                    app.manageError(error);
                }
            });
        }
    }
    function jobSave(objSave, type) {
        objSave.inSaveMode(true);
        var valid = objSave.JobType() > 0 && objSave.JobPosition.isValid() && objSave.JobDescription.isValid() && objSave.MaximumSalary.isValid() && objSave.MinimumSalary.isValid();
        if (!valid) {
            viewModel.JobsList.errors.showAllMessages(true);
            return;
        }
        if (parseInt(objSave.MinimumSalary()) < parseInt(objSave.MaximumSalary())) {
            getSalaryArray(objSave.MinimumSalary(), objSave.MaximumSalary(), objSave);
            saveJobPosting(objSave);
            if (objSave.jobCheck() == 1 && type == 1) {
                objSave.postingdate(convertDate(objSave.PostingDate()));
                viewModel.createjobCheck(1);
                objSave.jobCheck(0);
            }

            objSave.editJobsCheck('0');
            objSave.inSaveMode(false);
        }
        else {
            alert("Minimum salary should be less than maximum salary");
        }
    }
});


