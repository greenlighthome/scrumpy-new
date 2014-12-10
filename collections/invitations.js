Invitations = new Meteor.Collection('invitations');

Invitations.allow({
    insert: function() {
        return true;
    },
    update: function() {
        return true;
    },
    remove: function() {
        return true;
    }
});

var serverVar = false;
if(Meteor.isServer) {
    serverVar = true;
}