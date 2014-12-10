Notifications = new Meteor.Collection('notifications');

Notifications.allow({
    insert: ownsDocument,
    update: function() {
        return false;
    },
    remove: function() {
        return true;
    }
});

var serverVar = false;
if(Meteor.isServer) {
    serverVar = true;
}