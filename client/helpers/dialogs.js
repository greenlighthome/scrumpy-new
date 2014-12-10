// Local (client-only) collection, Dialogs collection will only exist in the browser and will make no attempt to
// synchronize with the server.
Dialogs = new Meteor.Collection(null);

throwDialog = function(type, message, details, actionButton, link, actionClass, data) {
    var duplDialog = Dialogs.find({details: details}).count();
    if (duplDialog == 0) {
        Dialogs.insert({type: type, message: message, details: details, actionButton: actionButton, link: link, actionClass: actionClass, data: data});
    } else {
        // highlight current error message
        var elId = '#' + Dialogs.findOne({details: details})._id;
        $(elId).effect('highlight');
    }
};

clearDialogs = function() {
    Dialogs.remove({}); // remove all alerts in collection
};