Template.productItem.helpers({
    userIsAdmin: function() {
        return userIsInRole(this._id, Meteor.user().roles.administrator);
    },
    userIsInDevTeam: function() {
        return userIsInRole(this._id, Meteor.user().roles.developmentTeam);
    },
    userIsProductOwner: function() {
        return userIsInRole(this._id, Meteor.user().roles.productOwner);
    },
    userIsScrumMaster: function() {
        return userIsInRole(this._id, Meteor.user().roles.scrumMaster);
    },
    userIsAdminOrProductOwner: function() {
        return userIsInRole(this._id, Meteor.user().roles.administrator) || userIsInRole(this._id, Meteor.user().roles.productOwner);
    }
});

function userIsInRole(roleId, roleArr) {
    if ($.inArray(roleId, roleArr) != -1) {
        return true;
    } else {
        return false;
    }
}