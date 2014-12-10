Comments = new Meteor.Collection('comments');

var serverVar = false;
if(Meteor.isServer) {
    serverVar = true;
}

Meteor.methods({
    createComment: function(commentAttributes) {
        if(serverVar) {
            var user = Meteor.user();
            if (!user) {
                throw new Meteor.Error(401, "You need to login to make comments");
            }
            if (!commentAttributes.body) {
                throw new Meteor.Error(422, 'Please write some content');
            }
            var comment = _.extend(_.pick(commentAttributes, 'actElId', 'body'), {
                userId: user._id,
                submitted: new Date()
            });

            var commentId = Comments.insert(comment);

            var participantsIds = [];

            Comments.find({actElId: commentAttributes.actElId}).forEach(function (comment) {
                participantsIds.push(comment.userId);
            });
            var actEl = ActivityStreamElements.findOne({_id: comment.actElId});
            if (actEl) {
                participantsIds.push(actEl.userId);
            }
            if (participantsIds.length > 0) {
                var notificationId = Notifications.insert({
                    userId: user._id,
                    type: 2,
                    commentId: commentId,
                    submitted: new Date(),
                    productId: actEl.productId
                });
                Users.update({_id: {$in: _.without(participantsIds, user._id)}}, {$push: {notifications: notificationId}}, {multi: true});
            }
            return commentId;
        }
    }
});

Comments.allow({
    update: ownsDocumentOrAdmin,
    remove: ownsDocumentOrAdmin
});