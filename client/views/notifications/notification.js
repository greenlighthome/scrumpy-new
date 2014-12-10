Template.notification.helpers({
    notificationType: function(type) {
        return type == this.type;
    },
    pm: function() {
        return PrivateMessages.findOne({_id: this.pmId});
    },
    product: function() {
        var product = Products.findOne({_id: this.productId});
        if (product) {
            return product;
        }
    },
    author: function() {
        var user = Users.findOne({_id: this.userId});
        if (user) {
            return user.username;
        }
    },
    user: function() {
        var user = Users.findOne({_id: this.userId});
        if (user) {
            return user;
        }
    },
    avatar: function() {
        if (_.has(this, 'profile') && this.profile.image != "") {
            return this.profile.image;
        }
        return DEFAULTAVATAR;
    },
    notification: function() {
        var notification = Notifications.findOne({_id: Template.parentData(1)._id});
        if (notification) {
            return notification;
        }
    }

});

Template.notification.events({
    'click .mark-notification-as-read': function() {
        Meteor.call('markSingleNotificationAsRead', Meteor.userId(), Template.currentData()._id, function(err) {
            if (err) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
        });
    }
});