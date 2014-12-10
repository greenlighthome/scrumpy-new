Sprints = new Meteor.Collection('sprints');

Sprints.allow({
    insert: isProductOwner,
    update: isProductOwner,
    remove: function() {
        return false;
    }
});