Template.sticky.rendered = function() {
    var productId = Template.parentData(1)._id; // TODO: refactor -> not productId
    var story = UserStories.findOne({_id: Template.parentData(1)._id});
    REDIPS.drag.init();
    // reference to the REDIPS.drag library
    var rd = REDIPS.drag;

    // define event.dropped handler
    rd.event.dropped = function () {
        var pos = rd.getPosition();
        var stickyId = rd.obj.getAttribute('id');
        var storyId = rd.td.current.parentNode.getAttribute('id');
        var stickyOldStatus = Stickies.findOne({_id: stickyId}).status;
        if (pos[2] == 2) {
            updateStickyPosition(stickyId, "1");
            checkMovementBackFromDone(rd, productId);
        } else if (pos[2] == 3) {
            updateStickyPosition(stickyId, "2");
            checkMovementBackFromDone(rd, productId);
        } else if (pos[2] == 4) {
            updateStickyPosition(stickyId, "3");
            checkMovementBackFromDone(rd, productId);
        } else if (pos[2] == 5) {
            updateStickyPosition(stickyId, "4");
            var sprint = UserStories.findOne({_id: storyId});
            Meteor.call('updateBurndown', sprint._id, function(err) { // TODO: check & refactor
                if (err) {
                    alert(err);
                }
            });
        }
        Stickies.update({_id: stickyId}, {$set:{storyId: storyId, lastMoved: Meteor.user().username}});
        var sticky = Stickies.findOne({_id: stickyId});
        Meteor.call('createActElStickyMoved', story.productId, Meteor.user()._id, sticky.title, stickyOldStatus, sticky.status, function(error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
        });
        if (rd.td.current != rd.td.previous && (pos[1] != pos[4] || pos[2] != pos[5])) {

            // updateLastModified();
            // create element in activity stream
        }
    };

    var stickyId = this.data._id;

    $('.editable-sticky-title').editable({
        display: false,
        title: "Update sticky title",
        success: function(response, newValue) {
            if (newValue) {
                var oldStickyTitle = Stickies.findOne({_id: stickyId}).title;
                Stickies.update({_id: stickyId}, {$set: {title: newValue}});
                throwAlert('success', 'Yes!', 'Sticky title edited.');
                Meteor.call('createActElStickyEditTitle', story.productId, Meteor.user()._id, oldStickyTitle, newValue, function(error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });
            }
        }
    });
    $('.editable-sticky-description').editable({
        display: false,
        title: "Update sticky description",
        success: function(response, newValue) {
            if (newValue) {
                var oldStickyDescription = Stickies.findOne({_id: stickyId}).description;
                Stickies.update({_id: stickyId}, {$set: {description: newValue}});
                throwAlert('success', 'Yes!', 'Sticky title edited.');
                Meteor.call('createActElStickyEditDescription', story.productId, Meteor.user()._id, oldStickyDescription, newValue, function(error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });
            }
        }
    });
    var sourceUsers = [];
    Users.find().forEach(function(user) {
       sourceUsers.push({value: user._id, text: user.username});
    });
    $('.assign-sticky-to').editable({
        emptytext: "Empty",
        title: "Assign sticky to",
        source: sourceUsers,
        success: function(response, result) {
            if (result) {
                Stickies.update({_id: stickyId}, {$set: {assigneeId: result}});
            }
        }
    });
};

Template.sticky.helpers({
    avatar: function() {
        return this.profile.image;
    },
    user: function() {
        if (this.assigneeId == Meteor.user()._id) {
            return Meteor.user();
        } else {
            var user = Users.findOne({_id: this.assigneeId});
            if (user) {
               return user;
            }
        }
    },
    assigneeColor: function() {
        var user = Users.findOne({_id: this.assigneeId});
        if (user) {
            return user.profile.color;
        }
    }
});

function updateStickyPosition(stickyId, location) {
    Stickies.update({_id: stickyId}, {$set:{status: location, lastMoved: Meteor.user().username}});
}

function checkMovementBackFromDone(rd, sprintId) {
    if (rd.td.source.className == "done") {
        Meteor.call('updateBurndown', sprintId, function(err) {
            if (err) {
                alert(err);
            }
        });
    }
}