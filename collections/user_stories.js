UserStories = new Meteor.Collection('userStories');

UserStories.allow({
    insert: scrumTeam,
    update: scrumTeam,
    remove: scrumTeam
});