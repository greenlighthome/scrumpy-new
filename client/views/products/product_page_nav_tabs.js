Template.productPageNavTabs.events({
    'click .productDashboardNavTab': function() { setSessionForActiveNavTab('productDashboard'); },
    'click .sprintPlanningNavTab': function() { setSessionForActiveNavTab('sprintPlanning'); },
    'click .impedimentBacklogNavTab': function() { setSessionForActiveNavTab('impedimentBacklog'); },
    'click .documentsNavTab': function() { setSessionForActiveNavTab('documents'); }
});

Template.productPageNavTabs.helpers({
    userIsProductOwner: function() { // TODO: dupl code
        return Roles.userIsInRole(Meteor.user(), [this._id], 'productOwner');
    }
});

function setSessionForActiveNavTab(name) {
    Session.set('activeNavTab', name);
}