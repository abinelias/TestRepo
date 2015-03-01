function GetWebAPIURL() {
    return "http://localhost:2043/";
}
function getBaseURL() {
    return location.protocol + "//" + location.hostname + (location.port && ":" + location.port) + "/";
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function ensureTemplates() {
    if (viewModel.loadOps > 0) return;

    ko.validation.configure({
        registerExtenders: true,
        messagesOnModified: true,
        insertMessages: true
    });
    ko.applyBindings(viewModel, $('#content')[0]);
    if (viewModel.Header) {
        ko.applyBindings(viewModel.Header, $('#welcome')[0]);
    }
    if (viewModel.HeaderEmployer) {
        ko.applyBindings(viewModel.HeaderEmployer, $('#welcome')[0]);
    }
}

function getHeaderDetails() {
    //To get User details
    var apiUrlJobSeeker = GetWebAPIURL() + 'api/JobSeeker/';  //+ userId;
    var dataObjJobSeeker;

    $.ajax({
        url: apiUrlJobSeeker,
        type: 'GET',
        async: false,
        headers: app.securityHeaders(),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            dataObjJobSeeker = data;
        },
        error: function (xhr, status, error) {
            windows.location = "Account.html";
            // alert('Error :' + status);
        }
    });
    return dataObjJobSeeker;
}


function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function initMultiselectBindings() {
    ko.bindingHandlers.multiSelectCheck = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
            var multiselectOptions = ko.utils.unwrapObservable(allBindingsAccessor().multiselectOptions) || {};

            // pass the original optionsCaption to the similar widget option
            if (ko.utils.unwrapObservable(allBindingsAccessor().optionsCaption)) {
                multiselectOptions.noneSelectedText = ko.utils.unwrapObservable(allBindingsAccessor().optionsCaption);
            }

            // remove this and use the widget's
            allBindingsAccessor().optionsCaption = '';
            $(element).multiselect(multiselectOptions);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).multiselect("destroy");
            });

        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            // This will be called once when the binding is first applied to an element,
            // and again whenever the associated observable changes value.
            // Update the DOM element based on the supplied values here.
            var selectOptions = ko.utils.unwrapObservable(allBindingsAccessor().multiSelectCheck);
            // remove this and use the widget's
            allBindingsAccessor().optionsCaption = '';

            ko.bindingHandlers.options.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

            setTimeout(function () {
                $(element).multiselect("refresh");
            }, 0);

        }
    };
}

// Load models and perform callbacks to init each viewmodel
function initModelData(vm, models, modelCallbacks, callback) {
    vm.loadOps += models.length;
    $.each(models, function (i, method) {
        $.ajax({
            url: GetWebAPIURL() + 'api/' + method,
            type: 'GET',
            headers: app.securityHeaders(),
            contentType: "application/json; charset=utf-8",
            async: true,
            success: function (data) {
                if (data == null) {
                    var initializeObject = { "Summary": "", "CurrentStatus": "", "SecurityClearanceId": 0, "WillingToRelocateId": 0, "Id": "" };
                    vm[method] = ko.mapping.fromJS(initializeObject);
                }
                else if (method == "Profile" || method == "Header" || method == "UserInformation" || method == "Employer") {
                    vm[method] = ko.mapping.fromJS(data);
                }
                else {
                    var creditorData = {};
                    creditorData.MemberData = data;
                    vm[method] = ko.mapping.fromJS(creditorData);
                }
                if (i < modelCallbacks.length && modelCallbacks[i])
                    modelCallbacks[i]();
                vm.loadOps--;
                callback();

            },
            error: function (xhr, status, error) {
                app.manageError(error);
            }
        });
    });
}

function initLookups(vm, lookups) {
    $.ajax({
        url: GetWebAPIURL() + '/api/Lookups',
        data: { lookups: lookups.toString() },
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        async: false,
        success: function (data) {
            for (var k in data) {
                if (k == "$id") continue;
                vm[k] = [];
                vm[k].push({ label: 'Select', value: 0 });
                for (var i = 0; i < data[k].length; ++i) {
                    vm[k].push({ label: data[k][i].Name, value: data[k][i].Id });
                };                
                if (k == "RefIndustry") {
                    vm[k].push({ label: 'Other', value: data[k].length + 1 });
                }
            };
        }
    });
}

function initTemplates(vm, root, templates, callback) {
    vm.loadOps += templates.length;
    $.each(templates, function (i, name) {
        $.get(root + name + '.html', function (template) {
            $("body").append('<script id="' + name + '" type="text/html">' + template + '<\script>');
            vm.loadOps--;
            callback();
        });
    });
}


function initStates(vm, countryId) {
    $.ajax({
        url: GetWebAPIURL() + '/api/States?countryId=' + countryId,
        async: false,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            vm.RefState = [];
            vm.RefState.push({ label: 'Select', value: '' });
            $.each(data, function (i, st) {
                vm.RefState.push({ label: st.Abbreviation + ' - ' + st.Name, value: st.Id });
            });
        }
    });
}
function getLookUpText(id, lookUpName) {
    var Name = ko.computed(function () {
        for (var i = 0; i < lookUpName.length; ++i) {
            if (lookUpName[i].value == id())
                return lookUpName[i].label;
        }
        return '';
    });
    return Name;
}

function getFilterText(id, lookUpName) {
    var Name = ko.computed(function () {
        for (var i = 0; i < lookUpName.length; ++i) {
            if (lookUpName[i].value == id)
                return lookUpName[i].label;
        }
        return '';
    });
    return Name;
}

function convert(str) {
    var date = new Date(str),
    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
    day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear()].join("/");
}
function convertDate(str) {
    var date = new Date(str);
    var monthtext = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthtext[date.getMonth()] + ' ' + date.getDate() + ',' + ' ' + date.getFullYear();
}
function getSkillList(method, value) {
    var dataObj;
    $.ajax({
        url: GetWebAPIURL() + '/api/' + method + '/?parentId=' + value,
        type: 'GET',
        headers: app.securityHeaders(),
        contentType: "application/json; charset=utf-8",
        async: false,
        success: function (data) {
            dataObj = data;
        },
        error: function (xhr, status, error) {
            app.manageError(error);
        }
    });
    return dataObj;
}

function createList(method, value) {
    var dataObj = getSkillList(method, value);
    var list = [];
    list.push({ label: "Select", value: "" });
    for (da in dataObj) {
        if (method == "SkillMenu") {
            list.push({
                label: dataObj[da].SkillName,
                value: dataObj[da].SkillMapId
            });
        }
        else {
            list.push({
                label: dataObj[da].Name,
                value: dataObj[da].Id
            });
        }
    }
    return list;
}

function getAppliedJobsList(jobId) {
    var dataobjJobList;
    $.ajax({
        url: GetWebAPIURL() + '/api/JobsList/' + jobId,
        type: 'GET',
        async: false,
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            dataobjJobList = data;
        },
        error: function (xhr, status, error) {
            alert('Erooororlang :' + status);
        }
    });
    return dataobjJobList;
}

function getList(method) {
    var dataObj;
    $.ajax({
        url: GetWebAPIURL() + '/api/' + method,
        type: 'GET',
        async: false,
        headers: app.securityHeaders(),
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

function toggle(button) {
    if (button() == '+') {
        button('-');
    }
    else {
        button('+');
    }
}

function pagination() {
    ko.extenders.paging = function (target, pageSize) {
        var _pageSize = ko.observable(pageSize || 10), // default pageSize to 10
            _currentPage = ko.observable(1); // default current page to 1

        target.pageSize = ko.computed({
            read: _pageSize,
            write: function (newValue) {
                if (newValue > 0) {
                    _pageSize(newValue);
                }
                else {
                    _pageSize(10);
                }
            }
        });

        target.currentPage = ko.computed({
            read: _currentPage,
            write: function (newValue) {
                if (newValue > target.pageCount()) {
                    _currentPage(target.pageCount());
                }
                else if (newValue <= 0) {
                    _currentPage(1);
                }
                else {
                    _currentPage(newValue);
                }
            }
        });

        target.pageCount = ko.computed(function () {
            return Math.ceil(target().length / target.pageSize()) || 1;
        });

        target.currentPageData = ko.computed(function () {
            var pageSize = _pageSize(),
                pageIndex = _currentPage(),
                startIndex = pageSize * (pageIndex - 1),
                endIndex = pageSize * pageIndex;

            return target().slice(startIndex, endIndex);
        });

        target.moveFirst = function () {
            target.currentPage(1);
        };
        target.movePrevious = function () {
            target.currentPage(target.currentPage() - 1);
        };
        target.moveNext = function () {
            target.currentPage(target.currentPage() + 1);
        };
        target.second = function () {
            target.currentPage(2);
        };
        target.third = function () {
            target.currentPage(3);
        };
        target.fourth = function () {
            target.currentPage(4);
        };
        target.moveLast = function () {
            target.currentPage(target.pageCount());
        };

        return target;
    };
}
function Trimtext() {
    ko.bindingHandlers.trimText = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var trimmedText = ko.computed(function () {
                var untrimmedText = ko.utils.unwrapObservable(valueAccessor());
                var defaultMaxLength = 20;
                var minLength = 5;
                var maxLength = ko.utils.unwrapObservable(allBindingsAccessor().trimTextLength) || defaultMaxLength;
                if (maxLength < minLength) maxLength = minLength;
                var text = untrimmedText.length > maxLength ? untrimmedText.substring(0, maxLength - 1) + '...' : untrimmedText;
                return text;
            });
            ko.applyBindingsToNode(element, {
                text: trimmedText
            }, viewModel);

            return {
                controlsDescendantBindings: true
            };
        }
    };
}

function getListDetailsById(method, value, type) {
    var dataObj;
    $.ajax({
        url: GetWebAPIURL() + '/api/' + method + '/?jobId=' + value + '&Type=' + type,
        type: 'GET',
        async: false,
        headers: app.securityHeaders(),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            dataObj = data;
        },
        error: function (xhr, status, error) {
            alert('Error :' + status);
        }
    });
    return dataObj;
}
function GetLocation(obj) {
    var geocoder = new google.maps.Geocoder();
    var address = document.getElementById("zip").value;
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            obj.Latitude(results[0].geometry.location.lat());
            obj.Longitude(results[0].geometry.location.lng());
        } else {
            alert("Request failed.")
        }
    });
};
//for Employer side
function getListById(method, value) {
    var dataObj;
    $.ajax({
        url: GetWebAPIURL() + '/api/' + method + '/?parentId=' + value,
        type: 'GET',
        async: false,
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            dataObj = data;
        },
        error: function (xhr, status, error) {
            alert('Error :' + status);
        }
    });
    return dataObj;
}
function getDetailsById(method, value, list, type) {
    var dataObj;
    $.ajax({
        url: GetWebAPIURL() + '/api/' + method + '/?jobId=' + value + '&memberId=' + list + '&Type=' + type,
        type: 'GET',
        async: false,
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            dataObj = data;
        },
        error: function (xhr, status, error) {
            alert('Error :' + status);
        }
    });
    return dataObj;
}

function getListDetailsByIdType(method, value, type) {
    var dataObj;
    $.ajax({
        url: GetWebAPIURL() + '/api/' + method + '/?MemberId=' + value + '&Type=' + type,
        type: 'GET',
        async: false,
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            dataObj = data;
        },
        error: function (xhr, status, error) {
            alert('Error :' + status);
        }
    });
    return dataObj;
}




function initModelDataEmp(vm, models, parentId) {
    $.each(models, function (i, method) {
        $.ajax({
            url: GetWebAPIURL() + 'api/' + method + '/?parentId=' + parentId,
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (data) {
                var creditorData = {};
                creditorData.MemberData = data;
                vm[method] = ko.mapping.fromJS(creditorData);
            },
            error: function (xhr, status, error) {
                app.manageError(error);
            }
        });
    });
}

function createListSkill(method, value) {
    var dataObj = getListById(method, value);
    var list = [];
    list.push({ label: "Select", value: "" });
    for (da in dataObj) {
        if (method == "SkillMenu") {
            list.push({
                label: dataObj[da].SkillName,
                value: dataObj[da].SkillMapId
            });
        }
        else if (method == "Employer") {            
            viewModel.usersList.push({
                name: dataObj[da].FirstName,
                id: dataObj[da].CompanyUserId
            });
        }
        else if (method == "PrerequisiteTypeList") {
            list.push({
                label: dataObj[da].PrerequisiteName,
                value: dataObj[da].Id
            });
        }
        else {
            list.push({
                label: dataObj[da].Name,
                value: dataObj[da].Id
            });
        }
    }
    return list;
}
function createListPrerequisite(dataObj) {
    var list = [];
    list.push({ label: "Select", value: "" });
    for (da in dataObj) {
        list.push({
            label: dataObj[da].PrerequisiteName,
            value: dataObj[da].Id
        });
    }
    return list;
}

var dataApplicantList;
var dataWorkHistory;
var dataEducation;
var dataCertification;
var dataTraining;
var dataUserInformation;
var dataSupporting;
var dataRelated;
var dataReference;
function jobSeekerListDetails(type, data, job) {
    if (type == 1) {
        dataSupporting = "";
        dataRelated = "";
        dataReference = "";
        if (data.length <= 0) {
            dataApplicantList = getListById("MembersForJob", job);
        }
    }
    if (type == 2) {
        dataSupporting = getListById("MemberSupporting", jobSeekerIdArray.toString());
        dataRelated = getListById("MemberRelatedExperience", jobSeekerIdArray.toString());
        dataReference = getListById("MemberReference", jobSeekerIdArray.toString());
    }
    dataWorkHistory = getListById("MemberWorkHistories", jobSeekerIdArray.toString());
    dataEducation = getListById("MemberEducation", jobSeekerIdArray.toString());
    dataCertification = getListById("MemberCertification", jobSeekerIdArray.toString());
    dataTraining = getListById("MemberTrainingCourse", jobSeekerIdArray.toString());
    dataUserInformation = getListById("MemberInformation", jobSeekerIdArray.toString());
}
