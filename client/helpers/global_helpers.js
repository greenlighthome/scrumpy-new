UI.registerHelper('titleShort', function (type) {
    var short = this.title;
    if (short) {
        if (type == "product") {
            if (short.length > 20) {
                short = short.substring(0,20) + '...';
            }
        } else if (type == "sticky" || type == "story") {
            if (short.length > 50) {
                short = short.substring(0,50) + '...';
            }
        }
    }
    return short;
});

UI.registerHelper('representative', function() {
    if (typeof Products !== 'undefined' && Products != null)
        var product = Products.findOne({_id: this._id});
    if (product != null && product.mode)
        return 'Product Owner';
    return 'Administrator';
});

UI.registerHelper('currentUserUsername', function() {
    return Meteor.user().username;
});

UI.registerHelper('defaultAvatar', function() {
    return DEFAULTAVATAR;
});

UI.registerHelper('noAvatar', function(type) {
    if (type == "assignee") {
        var user = Users.findOne({_id: this.assigneeId});
        if (user) {
            return user.profile.image.length == 0;
        }
    } else  if (type == "currentUser") {
        return Meteor.user().profile.image.length == 0;
    } else if (type == "profile") {
        return this.profile.image.length == 0;
    }
});

UI.registerHelper('navTabIsActive', function(navTab) {
    return Session.equals('activeNavTab', navTab);
});

UI.registerHelper('advancedMode', function() {
    if (_.has(this, "advancedMode")) {
        return this.advancedMode;
    }
    return Session.equals('advancedMode', true);
});

UI.registerHelper('totalDevTeamMember', function() {
    return DevelopmentTeam.find().count();
});

UI.registerHelper('totalScrumMaster', function() {
    return ScrumMaster.find().count();
});

UI.registerHelper('roleScrumMasterCursorWithIndex', function() {
    if (Session.equals('scrumTeamStaleState', false)) {
        Roles.getUsersInRole(this._id, 'scrumMaster').forEach(function (item) {
            if (ScrumMaster.find({username: item.username}).count() == 0) {
                ScrumMaster.insert({username: item.username, isAlreadyInRole: true});
            }
        });
        var pm = PrivateMessages.findOne({productId: this._id});
        var scrumMasterInv = [];
        _.each(pm.messages, function (m) {
            if (_.has(m, 'invitations') && _.has(m.invitations, 'scrumMaster')) {
                Invitations.find({_id: m.invitations.scrumMaster}).forEach(function (inv) {
                    scrumMasterInv.push(inv);
                });
            }
        });
        if (scrumMasterInv.length > 0) {
            _.each(scrumMasterInv, function (u) {
                if (u.status == 0 && ScrumMaster.find({username: u.username}).count() == 0) {
                    ScrumMaster.insert({
                        username: u.username,
                        isAlreadyInRole: false
                    });
                }
            });
        }
    }
    var roleScrumMasterCursorWithIndex = ScrumMaster.find().map(function(document, index) {
        document.index = index + 1;
        return document;
    });
    return roleScrumMasterCursorWithIndex;
});

UI.registerHelper('roleDevTeamCursorWithIndex', function() {
    if (Session.equals('scrumTeamStaleState', false)) {
        Roles.getUsersInRole(this._id, 'developmentTeam').forEach(function(item) {
            if (DevelopmentTeam.find({username: item.username}).count() == 0) {
                DevelopmentTeam.insert({username: item.username, isAlreadyInRole: true});
            }
        });
        var pm = PrivateMessages.findOne({productId: this._id});
        var devTeamInv = [];
        _.each(pm.messages, function(m) {
            if (_.has(m, 'invitations') && _.has(m.invitations, 'developmentTeam')) {
                Invitations.find({_id: {$in: m.invitations.developmentTeam}}).forEach(function (inv) {
                    devTeamInv.push(inv);
                });
            }
        });
        if (devTeamInv.length > 0) {
            _.each(devTeamInv, function (u) {
                if (u.status == 0 && DevelopmentTeam.find({username: u.username}).count() == 0) {
                    DevelopmentTeam.insert({
                        username: u.username,
                        isAlreadyInRole: false
                    });
                }
            });
        }
    }
    var roleDevTeamCursorWithIndex = DevelopmentTeam.find().map(function(document, index) {
        document.index = index + 1;
        return document;
    });
    return roleDevTeamCursorWithIndex;
});

UI.registerHelper('isOnline', function() {
    if (_.has(this, 'profile') && _.has(this.profile, 'online')) {
        return this.profile.online;
    } else {
        var user = Users.findOne({username: this.username});
        if (user && _.has(user, 'profile') && _.has(user.profile, 'online')) {
            return user.profile.online;
        }
    }
});

checkMemberDuplicates = function(compareString, table) {
    var dupl = false;
    $(table).each(function() {
        if ($(this).text() == compareString) {
            dupl = true;
        }
    });
    return dupl;
};

highlightCounterOnPanel = function(type) {
    if (type == 'DevelopmentTeam') {
        $('div#panel-development-team.panel.panel-warning div.panel-heading h3.panel-title span.badge.badge-default.pull-right').effect('highlight');
    } else if (type == 'ScrumMaster') {
        $('div#panel-scrum-master.panel.panel-info div.panel-heading h3.panel-title span.badge.badge-default.pull-right').effect('highlight');
    } else if (type == 'Recipients') {
        $('div#panel-recipients.panel.panel-success div.panel-heading h3.panel-title span.badge.badge-default.pull-right').effect('highlight');
    }
};

// TODO: refactor. Local collection needed!
getRecipientsPanelDomLocationAsString = function() {
    return 'div#panel-recipients.panel.panel-success table.table tbody';
};

// TODO: refactor. Local collection needed!
getScrumMasterFromPanel = function() {
    return $(getSMPanelDomLocationAsString() + ' tr td:nth-child(2)').text();
};

// TODO: refactor. Local collection needed!
getDevPanelDomLocationAsString = function() {
    return 'div#panel-development-team.panel.panel-warning table.table tbody';
};

// TODO: refactor. Local collection needed!
getSMPanelDomLocationAsString = function() {
    return 'div#panel-scrum-master.panel.panel-info table.table tbody';
};

dissociateScrumMaster = function(e) {
    e.preventDefault();
    ScrumMaster.remove({_id: $(e.target).attr('name')});
    highlightCounterOnPanel("ScrumMaster");
    $('#assign-as-scrum-master').removeClass('disabled');
};

assignAsScrumMaster = function() {
    $('option.select-multiple-user-element.selected').each(function() {
        if (ScrumMaster.find().count() == 0) {
            if (DevelopmentTeam.find({username: $(this).text()}).count() == 0) {
                ScrumMaster.insert({username: $(this).text(), isAlreadyInRole: false});
                $('#assign-as-scrum-master').addClass('disabled');
                highlightCounterOnPanel("ScrumMaster");
            } else {
                throwAlert('error', 'Sorry!', "You can't have the same person as Scrum Master and part of the Development Team.");
            }
        } else {
            throwAlert('error', 'Sorry!', 'You can assign only one person as scrum master.');
        }
    });
};

deleteMemberFromDevelopmentTeam = function(e) {
    e.preventDefault();
    DevelopmentTeam.remove({_id: $(e.target).attr('name')});
    highlightCounterOnPanel("DevelopmentTeam");
};

addToDevelopmentTeam = function() {
    $('option.select-multiple-user-element.selected').each(function() {
        if (DevelopmentTeam.find({username: $(this).text()}).count() == 0) {
            if (ScrumMaster.find({username: $(this).text()}).count() == 0) {
                DevelopmentTeam.insert({username: $(this).text(), isAlreadyInRole: false});
                highlightCounterOnPanel("DevelopmentTeam");
            } else {
                throwAlert('error', 'Sorry!', "You can't have the same person as Scrum Master and part of the Development Team.");
            }
        } else {
            throwAlert('error', 'Sorry!', "You can't add the same person twice.");
        }
    });
};

addToRecipientsList = function() {
    $('option.select-multiple-user-element.selected').each(function() {
        if (Recipients.find({username: $(this).text()}).count() == 0) {
            Recipients.insert({username: $(this).text()});
            highlightCounterOnPanel("Recipients");
        } else {
            throwAlert('error', 'Sorry!', "You can't add the same person twice.");
        }
    });
};

removeRecipient = function(e) {
    e.preventDefault();
    Recipients.remove({_id: $(e.target).attr('name')});
    highlightCounterOnPanel("Recipients");
};

activateWysihtml5 = function(selector) {
    $(selector).wysihtml5();
};

generatePopovers = function() {
    $("#administrator").popover({ title: 'What is an Administrator?', content: 'This is a job role description.' });
    $("#product_owner").popover({ title: 'What is a Product Owner?', content: 'This is a job role description.' });
};

operateDatepicker = function(datepickerStatus, selector) {
    if (!datepickerStatus) {
        $(selector).datepicker("show");
        datepickerStatus = true;
    } else {
        $(selector).datepicker("hide");
        datepickerStatus = false;
    }
    return datepickerStatus;
};

isNotEmpty = function(selector, value) {
    if (value && value !== ''){
        return true;
    } else {
        highlightWarningForField(selector);
        return false;
    }
};

highlightWarningForField = function(selector) {
    $(selector).parent().addClass('has-warning has-feedback');
    if ($(selector).parent().children().length == 1) {
        $(selector).parent().append($('<span/>', {'class': 'glyphicon glyphicon-warning-sign form-control-feedback'}));
    }
};

highlightErrorForField = function(selector) {
    $(selector).parent().addClass('has-error has-feedback');
    if ($(selector).parent().children().length == 1) {
        $(selector).parent().append($('<span/>', {'class': 'glyphicon glyphicon-remove form-control-feedback'}));
    }
};

resetAlertsForFields = function() {
    $('.form-control').each(function() {
        $(this).parent().removeClass('has-warning').removeClass('has-error');
        $(this).parent().find('span').remove();
    });
};

isValidPassword = function(password) {
    if (password.length < 6) {
        highlightWarningForRegisterPasswordFields();
        throwAlert('warning', 'Error', 'Your password should be 6 characters or longer.');
        return false;
    }
    return true;
};

areValidPasswords = function(password, confirm) {
    if (!isValidPassword(password)) {
        return false;
    }
    if (password !== confirm) {
        highlightWarningForRegisterPasswordFields();
        throwAlert('warning', 'Error', 'Your two passwords are not equivalent.');
        return false;
    }
    return true;
};

operateMultipleSelect = function(selector) {
    if (!selector.hasClass('selected')) {
        selector.addClass('selected');
    } else {
        selector.removeClass('selected');
    }
};

createStory = function (story, titleInput, descInput) {
    var storyId = UserStories.insert(story);
    titleInput.value = "";
    descInput.value = "";

   // updateLastModified();

    /*
     Meteor.call('createStoryNotification', storyId, function(err) {
     if (err) {
     alert(err);
     }
     });
     */

    throwAlert('success', 'Yeah!', 'The story creation was successful.');
    $('#' + storyId + ' .story').effect('highlight');
};

function highlightWarningForRegisterPasswordFields() {
    highlightWarningForField('#register-password');
    highlightWarningForField('#register-password-confirm');
}