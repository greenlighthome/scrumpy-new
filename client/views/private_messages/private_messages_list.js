Template.privateMessagesList.helpers({
    noPrivateMessages: function() {
        return Meteor.user().privateMessages.length == 0;
    },
    privateMessages: function() {
        return PrivateMessages.find({_id: {$in: Meteor.user().privateMessages}});
    }
});