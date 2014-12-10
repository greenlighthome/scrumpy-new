// Local (client-only) collection, Alerts collection will only exist in the browser and will make no attempt to
// synchronize with the server.
Alerts = new Meteor.Collection(null);

throwAlert = function(type, message, details) {
    var duplAlert = Alerts.find({details: details}).count();
    if (duplAlert == 0) {
        Alerts.insert({type: type, message: message, details: details});
    } else {
        // highlight current error message
        var elId = '#' + Alerts.findOne({details: details})._id;
        $(elId).effect('highlight');
    }
};

clearAlerts = function() {
    Alerts.remove({}); // remove all alerts in collection
};