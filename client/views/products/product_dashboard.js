Template.productDashboard.events({
    'click input[name=showBarChartForCurrentSprint]': function() {
        if (Session.equals('showBarChartForCurrentSprint', false)) {
            Session.set('showBarChartForCurrentSprint', true);
            Session.set('showBarChartForAllSprints', false);
        } else {
            Session.set('showBarChartForCurrentSprint', false);
            Session.set('showBarChartForAllSprints', true);
        }
    }
});

Template.productDashboard.rendered = function() {
    Session.set('showBarChartForCurrentSprint', true);
    Session.set('showBarChartForAllSprints', false);
};

Template.productDashboard.helpers({
    showBarChartForCurrentSprint: function() {
        return Session.equals('showBarChartForCurrentSprint', true);
    },
    barChartSwitch: function() {
        if (Session.equals('showBarChartForAllSprints', true)) {
            return "checked";
        } else {
            return "";
        }
    }
});