Users = Meteor.users;

EasySearch.createSearchIndex('users', {
    'field' : ['username'],
    'collection' : Users,
    'limit' : 20,
    'query' : function (searchString) {
        // Default query that will be used for searching
        var query = EasySearch.getSearcher(this.use).defaultQuery(this, searchString);
        // Your custom logic
        query.username = { $ne: Meteor.user().username };
        return query;
    }
});

Users.deny({
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

Meteor.methods({
    markAllNotificationsAsRead: function(userId) {
        if(serverVar) {
            var userNotifications = Users.findOne({_id: userId}).notifications;
            Users.update({_id: userId}, {$set: {notifications: []}}); // removing all references
            _.each(userNotifications, function(item) {
                if (Users.find({notifications: {$in: [item]}}).count() == 0) {
                    Notifications.remove({_id: item}); // no users with this notification -> delete main notification
                }
            });
        }
    },
    markSingleNotificationAsRead: function(userId, notificationId) {
        if(serverVar) {
            Users.update({_id: userId}, {$pull: {notifications: notificationId}}); // removing reference
            if (Users.find({notifications: {$in: [notificationId]}}).count() == 0) { // no users with this notification -> delete main notification
                Notifications.remove({_id: notificationId});
            }
        }
    },
    setDefaultAvatar: function(userId) {
        if(serverVar) {
            Users.update({_id: userId}, {$set: {profile: {image: ""}}});
        }
    },
    updateAvatar: function(base64) {
        if(serverVar) {
            var id = this.userId;
            if (!id) {
                throw new Meteor.Error(403, "You must be logged in.");
            }
            try {
                validateImgBase64(base64);
                return Meteor.users.update({_id: id},
                    {$set: {'profile.image': base64}}
                );
            }
            catch(e){
                throw new Meteor.Error(403, e.message);
            }
            return true;
        }
    },
    updatePersInfo: function(userId, info) {
        if(serverVar) {
            Users.update({_id: userId}, {$set: info});
        }
    },
    updateUserColor: function(userId, color) {
        if (serverVar) {
            Users.update({_id: userId}, {$set: {"profile.color": color}});
        }
    }
});

function validateImgBase64(src) {
    if(!/^data:image\/png;base64,/i.test(src)){
        throw new Error("Image decoding error.");
    }
    return true;
}