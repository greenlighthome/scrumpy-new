Template.sprint.rendered = function() {
    REDIPS.drag.init();
};

Template.sprint.helpers({
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
    }
});