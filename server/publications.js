Meteor.publish('products', function(options, productIds) {
    if (!productIds) {
        return null;
    }
    return Products.find({_id: {$in: productIds}}, options);
});

Meteor.publish('singleProduct', function(slug) {
    var product = Products.find({slug: slug});
    if (product) {
        return product;
    } else {
        return this.ready();
    }
});

Meteor.publish(null, function() { // TODO: refactor
        return ActivityStreamElements.find();
});

Meteor.publish('sprints', function(slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return Sprints.find({productId: product._id});
    } else {
        return null;
    }
});

Meteor.publish('usernamesRoles', function() {
    return Users.find({}, {
        fields: { 'username': 1, 'roles': 1 }
    });
});

Meteor.publish(null, function() { // TODO: refactor
    return Meteor.roles.find();
});

Meteor.publish(null, function() { // TODO: refactor
    return Invitations.find();
});

Meteor.publish('dashboardStatistics', function() {
    return DashboardStatistics.find();
});

Meteor.publish('ownUser', function(id) {
    return Users.find({_id: id});
});

Meteor.publish('comments', function(slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        var actElArr = [];
        ActivityStreamElements.find({productId: product._id}, {
            fields: {'_id': 1}
        }).forEach(function (actEl) {
            actElArr.push(actEl._id);
        });
        return Comments.find({actElId: {$in: actElArr}});
    } else {
        return null;
    }
});

Meteor.publish('stickiesBasic', function(slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return Stickies.find({productId: product._id});
    } else {
            return this.ready();
    }
});

Meteor.publish('stickiesAdvanced', function(storyIds) {
    return Stickies.find({storyId: {$in: storyIds}});
});

Meteor.publish('userStoriesBasic', function(slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return UserStories.find({productId: product._id});
    } else {
        return this.ready();
    }
});

Meteor.publish('userStoriesAdvanced', function(slug, startDate, endDate) {
    var product = Products.findOne({slug: slug});
    if (product) {
        if (!product.advancedMode) {
            return this.ready();
        }
        var sprint = Sprints.findOne({startDate: startDate, endDate: endDate, productId: product._id});
        if (sprint) {
            return UserStories.find({sprintId: sprint._id});
        }
    }
});

Meteor.publish('notifications', function(id) {
    return Notifications.find({_id: {$in: id}});
});

Meteor.publish(null, function() {
    return Users.find({_id: this.userId}, {fields: {notifications: 1, 'settingsNotifications': 1, 'privateMessages': 1}});
});

Meteor.publish('burndown', function(slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return Burndown.find({productId: product._id});
    } else {
        return null;
    }
});

Meteor.publish('userProfile', function(username) {
    return Users.find({username: username}, {fields: {'profile': 1, 'username': 1}});
});

Meteor.publish('privateMessages', function(userId) {
    var user = Users.findOne({_id: userId});
    if (user) {
        return PrivateMessages.find({_id: {$in: user.privateMessages}});
    }
    return null;
});

Meteor.publish('privateMessageForProduct', function(slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return PrivateMessages.find({productId: product._id});
    } else {
        return null;
    }
});

Meteor.publish('usernames', function() {
    return Users.find({}, {
        fields: { 'username': 1 }
    });
});

Meteor.publish('privateMessage', function(slug) {
    return PrivateMessages.find({slug: slug});
});

Meteor.publish('documents', function(slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return Documents.find({productId: product._id});
    } else {
        return null;
    }
});

Meteor.publish('privateMessageParticipants', function(slug) {
    return PrivateMessages.find({slug: slug}, {fields: {'participants': 1}});
});

Meteor.publish('participantsAvatars', function(slug) {
    var pm = PrivateMessages.findOne({slug: slug});
    return Users.find({_id: {$in: pm.participants}}, {fields: {'profile.image': 1, 'username': 1, 'profile.online': 1, 'profile.color': 1}});
});

Meteor.publish('allParticipantsAvatarsInvolved', function(userId) {
    var user = Users.findOne({_id: userId});
    if (user) {
        var participantsArr = new Array();
        PrivateMessages.find({_id: {$in: user.privateMessages}}).forEach(function (message) {
            participantsArr = _.union(participantsArr, message.participants);
        });
        return Users.find({_id: {$in: participantsArr}}, {fields: {'profile.image': 1, 'username': 1, 'profile.online': 1, 'profile.color': 1}});
    }
    return null;
});

Meteor.publish('usersInProductRole', function(slug) {
    var product = Products.findOne({slug: slug});
    return Users.find(
        { $or:
            [
                {'roles.administrator': { $in: [product._id]}},
                {'roles.developmentTeam': { $in: [product._id]}},
                {'roles.scrumMaster': { $in: [product._id]}},
                {'roles.productOwner': { $in: [product._id]}}
            ]
        },  {fields: {'profile.image': 1, 'username': 1, 'roles': 1, 'profile.online': 1, 'profile.color': 1}});
});