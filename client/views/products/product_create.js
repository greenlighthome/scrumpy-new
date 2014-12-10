var advancedMode;

Template.productCreate.events({
    'submit form': function(e) {
        e.preventDefault();

        var product = {
            title: $(e.target).find('[name=title]').val(),
            description: $(e.target).find('[name=description]').val(),
            advancedMode: $(e.target).find('[name=advancedMode]').is(':checked')
        };

        if (!product.title) {
            highlightErrorForField('#title');
        }

        Meteor.call('createProduct', product, function(error, createdProduct) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }

            var developmentTeam = DevelopmentTeam.find().map(function(document){
                return document.username;
            });

            if (!createdProduct.advancedMode) { // advanced mode off, create product-id role and groups: administrator & development team
                var administrator = Meteor.user().username;
                Meteor.call('createRole', createdProduct._id, administrator, function(error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });

                var participants = _.union([Meteor.user().username], developmentTeam);
                var invDev = [];
                for (var i = 0; i < developmentTeam.length; i++) {
                    invDev.push({username: developmentTeam[i], status: 0});
                }
                var firstMessage = {'submitted': new Date(), 'author': Meteor.user().username };

                if (invDev.length > 0) {
                    firstMessage.invitations = {};
                    var invDevId = [];
                    _.each(invDev, function(user) {
                        var invId = Invitations.insert(user);
                        invDevId.push(invId);
                    });
                    firstMessage.invitations.developmentTeam = invDevId;
                }

                var privateMessageAttributes = {
                    subject: createdProduct.title,
                    participants: participants,
                    messages: [firstMessage],
                    productId: createdProduct._id
                };

                Meteor.call('createPrivateMessage', privateMessageAttributes, function(error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });
            } else { // advanced mode an, create product-id role and groups: product owner, scrum master & development team
                var productOwner =  Meteor.user().username;
                var scrumMasterArr = ScrumMaster.find().map(function(document) {
                   return document.username;
                });
                var scrumMaster = scrumMasterArr[0];
                Meteor.call('createRoleAdvanced', createdProduct._id, productOwner, function(error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });

                var participants = _.union([Meteor.user().username], developmentTeam, scrumMaster);
                var invDev = [];
                for (var i = 0; i < developmentTeam.length; i++) {
                    invDev.push({username: developmentTeam[i], status: 0});
                }

                var firstMessage = {'submitted': new Date(), 'author': Meteor.user().username};

                if (invDev.length > 0 || scrumMaster) {
                    firstMessage.invitations = {};
                }

                if (invDev.length > 0) {
                    var invDevId = [];
                    _.each(invDev, function(user) {
                        var invId = Invitations.insert(user);
                        invDevId.push(invId);
                    });
                    firstMessage.invitations.developmentTeam = invDevId;
                }

                if (scrumMaster) {
                    var scrumMasterObj = { username: scrumMaster, status: 0 };
                    var invSId = Invitations.insert(scrumMasterObj);
                    firstMessage.invitations.scrumMaster = invSId;
                }

                var privateMessageAttributes = {
                    subject: createdProduct.title,
                    participants: participants,
                    messages: [firstMessage],
                    productId: createdProduct._id
                };

                Meteor.call('createPrivateMessage', privateMessageAttributes, function(error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });

                Meteor.call('createActElProductCreate', createdProduct._id, Meteor.user()._id, function(error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });

            }
            Router.go('productPage', {slug: createdProduct.slug});
        });
    },
    'click input[name=advancedMode]': function() {
        if (Session.equals('advancedMode', false)) {
            Session.set('advancedMode', true);
        } else {
            Session.set('advancedMode', false);
            // Move Scrum Master to development team
            var scrumMaster = ScrumMaster.find().fetch();
            DevelopmentTeam.insert(scrumMaster[0]);
            highlightCounterOnPanel("DevelopmentTeam");
        }
    },
    'click #add-to-development-team': function() {
        addToDevelopmentTeam();
    },
    'click .delete-member-from-development-team': function(e) {
        deleteMemberFromDevelopmentTeam(e);
    },
    'click #assign-as-scrum-master': function() {
        assignAsScrumMaster();
    },
    'click .dissociate-scrum-master': function(e) {
        dissociateScrumMaster(e);
    }
});

Template.productCreate.helpers({
    devTeamMember: function() {
        var roleDevTeamCursorWithIndex = DevelopmentTeam.find().map(function(document, index) {
            document.index = index + 1;
            return document;
        });
        return roleDevTeamCursorWithIndex;
    },
    scrumMaster: function() {
        var roleScrumMasterCursorWithIndex = ScrumMaster.find().map(function(document, index) {
            document.index = index + 1;
            return document;
        });
        return roleScrumMasterCursorWithIndex;
    }
});

Template.productCreate.rendered = function() {
    Session.set('advancedMode', false);
    activateWysihtml5('#description-input');
    generatePopovers();
};