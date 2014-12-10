Stickies = new Meteor.Collection('stickies');

Stickies.allow({
    insert: scrumTeam,
    update: scrumTeam,
    remove: scrumTeam
});