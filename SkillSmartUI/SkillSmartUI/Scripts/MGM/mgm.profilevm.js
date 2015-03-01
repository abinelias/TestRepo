function MGMProfile() {
  var self = this;
  self.email = ko.observable('');
  self.firstName = ko.observable('');
  self.lastName = ko.observable('');
  self.minAge = ko.observable('');
  self.address = ko.observable('');
  self.city = ko.observable('');
  self.state = ko.observable('');
  self.zip = ko.observable();
  self.phone = ko.observable('');
  self.positions = ko.observableArray([]);
  self.interests = [];

  self.updateInterest = function (d) {
    alert('called');
  };
  self.submit = function () {
    $('#profileform').validate();
    if ($('#profileform').valid() === false)
      return;
    self.interests.length = 0;
    $.each(self.positions(), function (i, p) {
      if (p.interestLevel > 0)
        self.interests.push({ positionId: p.positionId, interest: p.interestLevel });
    })
    $.ajax({
      url: SVC_ROOT + '/api/MGMProfile',
      type: "POST",
      data: ko.toJSON(self),
      contentType: "application/json; charset=utf-8",
      success: function (data) {
        var msg = data.d ? data.d : data;
        if (msg.length == 0)
          alert('Thank you for submitting a profile.');
        else
          alert(msg);
        self.address('');
        self.city('');
        self.state('MD');
        self.zip('');
        self.phone('');
        self.email('');
        self.firstName('');
        self.lastName('');
        self.minAge(-1);
        $.each(self.positions(), function (i, p) {
          p.interestLevel = 0;
        });
        $('.position').val(0);
      },
      error: function (xhr, error) {
        alert('Error :' + error);
      }
    });
  }
};