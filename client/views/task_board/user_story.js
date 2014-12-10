Template.userStory.events({
    'click .delete-story': function(e) {
        e.preventDefault();
        throwDialog('warning', 'Wait!', 'Are you sure you want delete the story ' + this.title + '?', 'Sure, delete it', 'No, do not delete', 'delete-story-confirm', this._id);
    }
});

Template.userStory.rendered = function() {
    var product = Products.findOne({_id: this.data.productId});
    if (Roles.userIsInRole(Meteor.user(), [this.data.productId], 'productOwner') || !product.advancedMode) {
        var storyId = this.data._id;
        $('.editable-user-story-title').editable({
            display: false,
            title: "Update user story title",
            success: function (response, newValue) {
                if (newValue) {
                    var oldUserStoryTitle = UserStories.findOne({_id: storyId}).title;
                    UserStories.update({_id: storyId}, {$set: {title: newValue}});
                    throwAlert('success', 'Yes!', 'Story title edited.');
                    Meteor.call('createActElUserStoryEditTitle', product._id, Meteor.user()._id, oldUserStoryTitle, newValue, function(error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                            return null;
                        }
                    });
                }
            }
        });
        $('.editable-user-story-description').editable({
            display: false,
            title: "Update user story description",
            success: function (response, newValue) {
                if (newValue) {
                    var oldUserStoryDescription = UserStories.findOne({_id: storyId}).title;
                    UserStories.update({_id: storyId}, {$set: {description: newValue}});
                    throwAlert('success', 'Yes!', 'Story description edited.');
                    Meteor.call('createActElUserStoryEditDescription', product._id, Meteor.user()._id, oldUserStoryDescription, newValue, function(error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                            return null;
                        }
                    });
                }
            }
        });
    }
    var data = Template.instance().data;
    if (data && data.isDrag) {
        REDIPS.drag.init();
    }
};

Template.userStory.helpers({
    dragClass: function() {
        var data = Template.instance().data;
        if (data && data.isDrag)
            return 'drag';
    },
    prLevel: function() {
        if (this.priority == 3) {
            return "danger";
        } else if (this.priority == 2) {
            return "warning";
        } else {
            return "info";
        }
    },
    userIsProductOwnerOrAdvancedModeOff: function() {
        var product = Products.findOne({_id: this.productId});
        return Roles.userIsInRole(Meteor.user(), [this.productId], 'productOwner') || !product.advancedMode;
    }
});