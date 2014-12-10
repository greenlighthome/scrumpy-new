Template.commentSubmit.events({
    'submit form': function(e, template) {
        e.preventDefault();
        var $body = $(e.target).find('[name=body]');
        var comment = {
            body: $body.val(),
            actElId: this._id
        };
        Meteor.call('createComment', comment, function(error) {
            if (error){
                throwAlert('error', error.reason, error.details);
            } else {
                $body.val('');
            }
        });
    }
});