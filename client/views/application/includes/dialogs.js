Template.dialogs.helpers({
    dialogs: function() {
        return Dialogs.find();
    },
    type: function(type) {
        return this.type === type;
    },
    message: function() {
        return this.message;
    },
    details: function() {
        return this.details;
    },
    actionButton: function() {
        return this.actionButton;
    },
    link: function() {
        return this.link;
    }
});

Template.dialogs.events({
   'click .close': function() {
       Dialogs.remove(this._id);
   },
    'click .delete-story-confirm': function() {
        Stickies.find({storyId: this.data}).forEach(function(sticky) {
            Stickies.remove(sticky._id);
        });

        /*
         Meteor.call('deleteStoryNotification', this._id, Meteor.user(), function(err) {
         if (err) {
         alert(err);
         }
         });

         Meteor.call('updateBurndown', UserStories.findOne(this._id).productId, function(err) {
         if (err) {
         alert(err);
         }
         });
         */

        UserStories.remove(this.data);

        //updateLastModified();

        Dialogs.remove(this._id);

        throwAlert('success', 'Yeah!', 'Story removed.');
    },
    'click .delete-product-confirm': function() {
        var dialogId = this._id;
        Meteor.call('deleteProduct', this.data, function(error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
            Dialogs.remove(dialogId);
            Router.go('dashboard');
        });
    }
});