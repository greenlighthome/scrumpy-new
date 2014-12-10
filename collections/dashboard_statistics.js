DashboardStatistics = new Meteor.Collection('dashboardStatistics');

if (Meteor.isServer) {
    Meteor.startup(function () {
        if (DashboardStatistics.find().count() === 0) {
            DashboardStatistics.insert({totalProjects: 10000, totalUsers: 99999});
        }
    });
}