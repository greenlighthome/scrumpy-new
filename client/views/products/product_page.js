Template.productPage.helpers({
    noSprints: function() {
        return Sprints.find({productId: this._id}).count() == 0;
    },
    userIsProductOwner: function() {
        return Roles.userIsInRole(Meteor.user(), [this._id], 'productOwner');
    }
});

Template.productPage.rendered = function() {
    Session.set('activeNavTab', 'productDashboard');
    if (Session.equals('noSprintsError', true)) {
        throwAlert('error', 'Ooops!', 'You cannot access the task board, because there are no sprints!');
    }
};

Template.productPage.destroyed = function() {
    Session.set('noSprintsError', false);
};

Template.productPage.events({
    'click .goToCurrentSprint': function() {
        var sprint = Sprints.findOne({productId: this._id, startDate: { $lte: new Date(new Date().toISOString()) }, endDate: { $gte: new Date(new Date().toISOString()) }});
        Router.go('taskBoardPage', {slug: this.slug, startDate: moment(sprint.startDate).format('YYYY-MM-DD'), endDate: moment(sprint.endDate).format('YYYY-MM-DD')});
    }
});