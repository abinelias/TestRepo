viewModel.searchJobs = function () {
    employment = [];
    salary = [];
    industry = [];
    degree = [];
    carrierLevel = [];
    distance = [];

    viewModel.searchCriteria.removeAll();

    if (viewModel.employmentTypeId() != "") {
        var createSearch = new createsearchCriteria(0);
        viewModel.searchCriteria.push(createSearch);
    }

    if (viewModel.industryTypeId() != "") {
        var createSearch = new createsearchCriteria(1);
        viewModel.searchCriteria.push(createSearch);
    }

    if (viewModel.selectedIndexEducationLevel() > 0) {
        var createSearch = new createsearchCriteria(2);
        viewModel.searchCriteria.push(createSearch);
    }

    if (viewModel.selectedIndexDistance() > 0) {
        var createSearch = new createsearchCriteria(3);
        viewModel.searchCriteria.push(createSearch);
    }

    if (viewModel.salaryId() != "") {
        var createSearch = new createsearchCriteria(4);
        viewModel.searchCriteria.push(createSearch);
    }

    if (viewModel.selectedIndexCarrierLevel() > 0) {
        var createSearch = new createsearchCriteria(5);
        viewModel.searchCriteria.push(createSearch);
    }

    viewModel.jobCheck('1');
    if (employment.length != 0 || salary.length != 0 || industry.length != 0 || degree.length != 0 || carrierLevel.length != 0 || distance.length != 0) {
        getFilteredJobsList();
        viewModel.jobsList.sort(function (left, right) {
            return left.totalSkillScore == right.totalSkillScore ? 0 : (left.totalSkillScore < right.totalSkillScore ? 1 : -1)
        });
    }
}

function createsearchCriteria(i) {
    var self = this;
    self.lookUpName = ko.observable('');
    self.contentArray = ko.observableArray();
    if (i == 0) {
        if (viewModel.employmentTypeId() != "") {
            self.lookUpName('EmploymentType');
            for (var i = 0; i < viewModel.employmentTypeId().length; i++) {
                var addContent = new addContentForEmploymentType(i);
                self.contentArray.push(addContent);
            }
        }
    }
    else if (i == 1) {
        if (viewModel.industryTypeId() != "") {
            self.lookUpName('IndustryType');
            for (var i = 0; i < viewModel.industryTypeId().length; i++) {
                var addContentIndustry = new addContentForIndustry(i);
                self.contentArray.push(addContentIndustry);
            }
        }
    }
    else if (i == 2) {
        if (viewModel.selectedIndexEducationLevel() != -1) {
            self.lookUpName('DegreeType');
            var addContentDegreeType = new addContentForDegree(i);
            self.contentArray.push(addContentDegreeType);
        }
    }
    else if (i == 3) {
        if (viewModel.selectedIndexDistance() != -1) {
            self.lookUpName('Distance');
            var addContentDistance = new addContentForDistance();
            self.contentArray.push(addContentDistance);
        }
    }

    else if (i == 4) {
        if (viewModel.salaryId() != "") {
            self.lookUpName('Salary');
            for (var i = 0; i < viewModel.salaryId().length; i++) {
                var addContentSalary = new addContentForSalary(i);
                self.contentArray.push(addContentSalary);
            }
        }
    }
    else {
        if (viewModel.selectedIndexCarrierLevel()) {
            self.lookUpName('CareerLevel');
            var addContentCarrierLevel = new addContentForCarrierLevel();
            self.contentArray.push(addContentCarrierLevel);
        }
    }
}

var employment = [];
function addContentForEmploymentType(i) {
    var self = this;
    self.lookUpId = ko.observable(viewModel.employmentTypeId()[i]);
    self.Name = getFilterText(viewModel.employmentTypeId()[i], viewModel.RefWorkType);
    employment.push(viewModel.employmentTypeId()[i]);
}

var salary = [];
function addContentForSalary(i) {
    var self = this;
    self.lookUpId = ko.observable(viewModel.salaryId()[i]);
    self.Name = getFilterText(viewModel.salaryId()[i], viewModel.RefSalary);
    salary.push(viewModel.salaryId()[i]);
}

var industry = [];
function addContentForIndustry(i) {
    var self = this;
    self.lookUpId = ko.observable(viewModel.industryTypeId()[i]);
    self.Name = getFilterText(viewModel.industryTypeId()[i], viewModel.dataIndustry);
    industry.push(viewModel.industryTypeId()[i]);
}

var degree = [];
function addContentForDegree(i) {
    var self = this;
    self.lookUpId = ko.observable(viewModel.selectedIndexEducationLevel());
    self.Name = getFilterText(viewModel.selectedIndexEducationLevel(), viewModel.RefDegreeType);
    degree.push(viewModel.selectedIndexEducationLevel());
}

var carrierLevel = [];
function addContentForCarrierLevel() {
    var self = this;
    self.lookUpId = ko.observable(viewModel.selectedIndexCarrierLevel());
    self.Name = getFilterText(viewModel.selectedIndexCarrierLevel(), viewModel.RefCareerLevel);
    carrierLevel.push(viewModel.selectedIndexCarrierLevel());
}

var distance = [];
var distMi;
if (distance[0] == 1)
    distMi = 20;
else if (distance[0] == 1)
    distMi = 50;
else (distance[0] == 1)
distMi = 100;
function addContentForDistance() {
    var self = this;
    self.lookUpId = ko.observable(viewModel.selectedIndexDistance());
    self.Name = getFilterText(viewModel.selectedIndexDistance(), viewModel.RefDistance);
    distance.push(viewModel.selectedIndexDistance());
}

viewModel.deleteFullList = function (objWork) {
    viewModel.searchCriteria.remove(objWork);
    if (objWork.lookUpName() == 'EmploymentType') {
        viewModel.employmentTypeId([""]);
    }
    if (objWork.lookUpName() == 'IndustryType') {
        viewModel.industryTypeId([""]);
    }
    if (objWork.lookUpName() == 'DegreeType') {
        viewModel.selectedIndexEducationLevel(0);
    }
    if (objWork.lookUpName() == 'Distance') {
        viewModel.selectedIndexDistance(0);
    }
    if (objWork.lookUpName() == 'Salary') {
        viewModel.salaryId([""]);
    }
    if (objWork.lookUpName() == 'CareerLevel') {
        viewModel.selectedIndexCarrierLevel(0);
    }
}

viewModel.deleteSingleSelect = function (objsingleSelect) {
    var da = 0;
    var res = '';
    var temp = '';
    $.each(viewModel.searchCriteria(), function () {
        res = this.contentArray.remove(objsingleSelect);
        if (res.length > 0) {
            if (viewModel.searchCriteria()[da].lookUpName() == 'EmploymentType') {
                viewModel.employmentTypeId.remove(objsingleSelect.lookUpId());
                temp = viewModel.searchCriteria()[da];
                viewModel.searchCriteria.remove(temp);
                if (viewModel.employmentTypeId().length > 0) {
                    var createSearch = new createsearchCriteria(0);
                    viewModel.searchCriteria.splice(0, 0, createSearch);
                }
            }
            else if (viewModel.searchCriteria()[da].lookUpName() == 'IndustryType') {
                viewModel.industryTypeId.remove(objsingleSelect.lookUpId());
                temp = viewModel.searchCriteria()[da];
                viewModel.searchCriteria.remove(temp);
                if (viewModel.industryTypeId().length > 0) {
                    var createSearch = new createsearchCriteria(1);
                    viewModel.searchCriteria.splice(1, 0, createSearch);
                }
            }
            else if (viewModel.searchCriteria()[da].lookUpName() == 'Salary') {
                viewModel.salaryId.remove(objsingleSelect.lookUpId());
                temp = viewModel.searchCriteria()[da];
                viewModel.searchCriteria.remove(temp);
                if (viewModel.salaryId().length > 0) {
                    var createSearch = new createsearchCriteria(4);
                    viewModel.searchCriteria.splice(4, 0, createSearch);
                }
            }
            else if (viewModel.searchCriteria()[da].lookUpName() == 'DegreeType') {
                temp = viewModel.searchCriteria()[da];
                viewModel.searchCriteria.remove(temp);
                viewModel.selectedIndexEducationLevel(0);
            }

            else if (viewModel.searchCriteria()[da].lookUpName() == 'CareerLevel') {
                temp = viewModel.searchCriteria()[da];
                viewModel.searchCriteria.remove(temp);
                viewModel.selectedIndexCarrierLevel(0);
            }

            else if (viewModel.searchCriteria()[da].lookUpName() == 'Distance') {
                temp = viewModel.searchCriteria()[da];
                viewModel.searchCriteria.remove(temp);
                viewModel.selectedIndexDistance(0);
            }
        }
        da++
    });
}

function getDistance(lat1, lon1, lat2, lon2) {
    var R = 3958.7558657440545; // Radius of earth in Miles 
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c);
}

function toRad(Value) {
    return Value * Math.PI / 180;
}

function getFilteredJobsList() {
    viewModel.jobsList.removeAll();
    for (var i = 0; i < dataJobListObj.length; i++) {
        var flag = 0;
        var salaryId = [];
        for (var j = 0; j < dataJobListObj[i].JobSalary.length; j++) {
            salaryId.push(dataJobListObj[i].JobSalary[j]);
        }
        for (var j = 0; j < salaryId.length; j++) {
            if (salary.indexOf(salaryId[j]) > -1) {
                flag = 1;
                break;
            }
        }
        if (flag == 1) {
            if (degree.indexOf(dataJobListObj[i].DegreeId) > -1) {
                if (employment.indexOf(dataJobListObj[i].JobType) > -1) {
                    var industryId = 0;
                    for (var j = 0; j < dataAllCompany.length; j++) {
                        if (dataAllCompany[j].Id == dataJobListObj[i].CompanyId)
                            industryId = dataAllCompany[j].Industry;
                    }
                    if (industry.indexOf(industryId) > -1) {
                        var expId = 0;
                        if (dataJobListObj[i].YearsOfExperience >= 0 && dataJobListObj[i].YearsOfExperience <= 3)
                            expId = 1;
                        if (dataJobListObj[i].YearsOfExperience >= 4 && dataJobListObj[i].YearsOfExperience <= 6)
                            expId = 2;
                        if (dataJobListObj[i].YearsOfExperience >= 7 && dataJobListObj[i].YearsOfExperience <= 12)
                            expId = 3;
                        if (dataJobListObj[i].YearsOfExperience >= 13)
                            expId = 4;

                        if (carrierLevel.indexOf(expId) > -1) {                            
                            var dist;
                            for (var j = 0; j < dataAllCompany.length; j++) {
                                if (dataAllCompany[j].Id == dataJobListObj[i].CompanyId)
                                    dist = getDistance(dataAllCompany[j].Latitude, dataAllCompany[j].Longitude, viewModel.Header.Latitude(), viewModel.Header.Longitude());
                            }
                            if (distMi > dist) {                                
                                var listJob = new createJobSeekerJobList(dataJobListObj[i]);
                                viewModel.jobsList.push(listJob);
                            }
                        }
                    }
                }
            }
        }
    }
}
