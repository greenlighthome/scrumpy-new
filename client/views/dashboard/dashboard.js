Template.dashboard.helpers({
    emptyProducts: function() {
        var roles = Meteor.user().roles;
        return (typeof roles == "undefined") || _.isEmpty(roles.administrator) && _.isEmpty(roles.productOwner) && _.isEmpty(roles.scrumMaster) && _.isEmpty(roles.developmentTeam);
    },
    totalProjects: function() {
        return DashboardStatistics.findOne().totalProjects;
    },
    totalUsers: function() {
        return DashboardStatistics.findOne().totalUsers;
    }
});

Template.dashboard.rendered = function() {
    this.autorun(function() {
        logInLogOutRegisterMessages();
    });
}


logInLogOutRegisterMessages = function() {
    if (Session.equals("loginSuccess", true)) {
        throwAlert('success', 'Howdy!', 'Welcome back to Scrumpy!');
        Session.set('loginSuccess', false);
    } else if (Session.equals("registerSuccess", true)) {
        throwAlert('success', 'Congratulations!', 'You\'re now a member of Scrumpy!');
        Session.set('registerSuccess', false);
    } else if (Session.equals("logoutSuccess", true)) {
        throwAlert('info', 'Bye ' + Session.get('username') + '!', 'Come back whenever you want!');
        Session.set('logoutSuccess', false);
        Session.set('username', false);
    } else if (Session.equals("changePasswordSuccess", true)) {
        throwAlert('success', 'Work done!', 'You changed your password successfully.');
        Session.set('changePasswordSuccess', false);
    }
}