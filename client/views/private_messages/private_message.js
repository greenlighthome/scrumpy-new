Template.privateMessage.rendered = function() {
    activateWysihtml5('#message-input');
};


Template.privateMessage.events({
    'click .send-message-button': function(e) {
        e.preventDefault();
        var message = {'text': $('#message-input').val(), 'submitted': new Date(), 'author': Meteor.user().username};
        if (!message.text) {
            highlightErrorForField('#message-input');
        }
        Meteor.call('submitMessage', message, this._id, function(error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
            $('#message-input').data("wysihtml5").editor.clear();
        });
    }
});
