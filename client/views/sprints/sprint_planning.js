Template.sprintPlanning.helpers({
    userStories: function() {
        return UserStories.find({productId: this._id, sprintId: {$exists: false}, priority: {$exists: false}}).map(function(userStory) {
            userStory.isDrag = true;
            return userStory;
        });
    },
    sprints: function() {
        return Sprints.find({productId: this._id});
    },
    sprintStartDateFormatted: function() {
        return moment(this.startDate).format('YYYY-MM-DD');
    },
    sprintEndDateFormatted: function() {
        return moment(this.endDate).format('YYYY-MM-DD');
    },
    userStoriesAssignedToSprint: function(priority) {
        return UserStories.find({priority: priority, sprintId: this._id}).map(function(userStory) {
            userStory.isDrag = true;
            return userStory;
        });
    },
    noSprints: function() {
        return Sprints.find({productId: this._id}).count() == 0;
    }
});

Template.sprintPlanning.events({
    'click .new-story-submit': function (e, t) {
        e.preventDefault();

        var newStoryTitleInput = t.find('[name=new-story-title-input]');
        var titleInputValue = $.trim(newStoryTitleInput.value);
        var newStoryDescInput = t.find('[name=new-story-description-input]');
        var descInputValue = $.trim(newStoryDescInput.value);

        if (titleInputValue.length > 0 && descInputValue.length > 0) {
            var newStory = {
                userId: Meteor.userId(), title: titleInputValue, description: descInputValue, productId: this._id,
                submitted: new Date(), author: Meteor.user().username,
                lastEdited: Meteor.user().username
            };
            createStory(newStory, newStoryTitleInput, newStoryDescInput);
            Meteor.call('createActElUserStory', newStory.productId, Meteor.user()._id, newStory.title, function(error) {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return null;
                }
            });
            Session.set("staleUserStoryOrSprint", true);
        } else {
            alert('Choose a title that reflect the feature to be implemented', 'Choose a title');
        }
    }
});

Template.sprintPlanning.rendered = function() {
    REDIPS.drag.init();
    // reference to the REDIPS.drag library
    var rd = REDIPS.drag;
    var productId = this.data._id;
    // define event.dropped handler
    rd.event.dropped = function() {
        var pos = rd.getPosition();
        var storyId = rd.obj.getAttribute('id');
        var curr = $(rd.td.current);
        var src = $(rd.td.source);
        if (rd.td.current != rd.td.previous) {
            if (curr.attr('class').indexOf("priority") >= 0) {
                var sprintId = rd.td.current.parentNode.getAttribute('id');
                var priority = 0;
                if (pos[2] == 0) { // Low priority assigned
                    priority = '1';
                } else if (pos[2] == 1) { // Medium priority assigned
                    priority = '2';
                } else if (pos[2] == 2) { // High priority assigned
                    priority = '3';
                }
                UserStories.update({_id: storyId}, {$set: {sprintId: sprintId, priority: priority}});
                var story = UserStories.findOne({_id: storyId});
                var sprint = Sprints.findOne({_id: sprintId});
                Meteor.call('createActElUserStoryPrioritized', productId, Meteor.user()._id, story.title, priority, sprint.goal, function(error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });
            } else {
                UserStories.update({_id: storyId}, {$unset: {sprintId: true, priority: true}});
            }
        }
    };
};