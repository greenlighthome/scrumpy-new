Template.login.events({
    'submit #login-form': function(e, t) {
        e.preventDefault();
        clearAlerts();
        resetAlertsForFields();

        var loginForm = $(e.currentTarget),
            username = loginForm.find('.username').val(),
            password = loginForm.find('.password').val();

        var noEmptyFields = isNotEmpty('#login-username', username) & isNotEmpty('#login-password', password);

        if (!noEmptyFields) {
            throwAlert('warning', 'Error', 'Please fill in all required fields.');
        }

        if (noEmptyFields && isValidPassword(password)) {
            Meteor.loginWithPassword(username, password, function(err) {
                if (err) {
                    throwAlert('error', 'Oh snap!', 'Sorry but these credentials are not valid.');
                    highlightErrorForField('#login-username');
                    highlightErrorForField('#login-password');
                } else {
                    Session.set('loginSuccess', true);
                    Router.go('dashboard');
                }
            });
        }
        return false;
    }//,
    //'click #show-forgot-password': function(e, t) {
   //     Session.set('showForgotPassword', true);
   //     Router.go('forgotPassword');
   //     return false;
  //  }
});