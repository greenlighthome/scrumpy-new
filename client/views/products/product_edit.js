var advancedMode;

Template.productEdit.events({

    'submit form': function(e) {
        e.preventDefault();

        var oldProduct = Products.findOne({_id: this._id});
        var oldProductTitle = oldProduct.title;

        var productProperties = {
            title: $(e.target).find('[name=title]').val(),
            description: $(e.target).find('[name=description]').val(),
            advancedMode: $(e.target).find('[name=advancedMode]').is(':checked'),
            lastModified: new Date(),
            slug: this.slug.substring(0, (this.slug.indexOf('-')) + 1) + slugify($(e.target).find('[name=title]').val())
        };

        if (!productProperties.title) {
            highlightErrorForField('#title');
        }

        Meteor.call('updateProduct', productProperties, this._id, function(error, createdProduct) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }

            var product = Products.findOne({_id: createdProduct._id});

            var developmentTeam = DevelopmentTeam.find().map(function(document){
                return document.username;
            });

            var invMessage = {'submitted': new Date(), 'author': Meteor.user().username};
            var newParticipants = new Array();
            if (developmentTeam.length > 0) {
                var currDevMembersInRole = _.map(Roles.getUsersInRole([createdProduct._id], 'developmentTeam').fetch(), function(user) { return user.username; });
                var devMembersInv = _.difference(developmentTeam, currDevMembersInRole);
                newParticipants = devMembersInv;
                var invDev = new Array();
                for (var i = 0; i < devMembersInv.length; i++) {
                    invDev.push({username: devMembersInv[i], status: 0});
                }
                if (invDev.length > 0) {
                    invMessage.invitations = {};
                    var invDevTeamIds = [];
                    _.each(invDev, function(inv) {
                        var invId = Invitations.insert(inv);
                        invDevTeamIds.push(invId);
                    });
                    invMessage.invitations.developmentTeam = invDevTeamIds;
                }
            }

            if (productProperties.advancedMode) {
                var scrumMasterArr = ScrumMaster.find().map(function(document) {
                    return document.username;
                });
                var scrumMaster = scrumMasterArr[0];
                if (scrumMaster) {
                    var currScrumMasterInRole = _.map(Roles.getUsersInRole([createdProduct._id], 'scrumMaster').fetch(), function(user) { return user.username; });
                    if (scrumMaster != currScrumMasterInRole[0]) {
                        if (developmentTeam.length == 0) {
                            invMessage.invitations = {};
                        }
                        var invScrumMasterId = Invitations.insert({ 'username': scrumMaster, 'status': 0 });
                        invMessage.invitations.scrumMaster = invScrumMasterId;
                        newParticipants.push(scrumMaster);
                    }
                }
            }

            var participantsToRemove = new Array();
            var devTeamUsersToRemoveFromInv = new Array();
            var scrumMasterToRemoveFromInv = null;
            var pm = PrivateMessages.findOne({productId: createdProduct._id});
            _.each(pm.messages, function(m) {
                if (_.has(m, "invitations")) {
                    if (_.has(m.invitations, "developmentTeam")) {
                        Invitations.find({_id: {$in: m.invitations.developmentTeam}}).forEach(function(u) {
                            if ($.inArray(u.username, developmentTeam) == -1) {
                                devTeamUsersToRemoveFromInv.push(u.username);
                            }
                        });
                    }
                    if (_.has(m.invitations, 'scrumMaster')) {
                        var invScrumMaster = Invitations.findOne({_id: m.invitations.scrumMaster});
                        if (invScrumMaster.username != scrumMaster) {
                            scrumMasterToRemoveFromInv = invScrumMaster.username;
                        }
                    }
                }
            });

            participantsToRemove = devTeamUsersToRemoveFromInv;
            if (scrumMasterToRemoveFromInv) {
                participantsToRemove.push(scrumMasterToRemoveFromInv);
            }

            Meteor.call('updatePrivateMessageStatus', createdProduct._id, participantsToRemove, function(error) {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return null;
                }
            });

            Meteor.call('updateRoleInvitation', invMessage, createdProduct._id, newParticipants, participantsToRemove, function(error) {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return null;
                }
            });

            if (productProperties.advancedMode) {
                Meteor.call('createActElProductTitleEdit', createdProduct._id, Meteor.user()._id, oldProductTitle, function(error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });
            }
            Router.go('productPage', {slug: createdProduct.slug});
        });
    },
    'click #add-to-development-team': function() {
        addToDevelopmentTeam();
    },
    'click .delete-member-from-development-team': function(e) {
        Session.set('scrumTeamStaleState', true);
        deleteMemberFromDevelopmentTeam(e);
    },
    'click #assign-as-scrum-master': function() {
        assignAsScrumMaster();
    },
    'click .dissociate-scrum-master': function(e) {
        Session.set('scrumTeamStaleState', true);
        dissociateScrumMaster(e);
    },
    'click .delete': function(e) {
        e.preventDefault();
        throwDialog('warning', 'Wait!', 'Are you sure you want delete the product ' + this.title + '?', 'Sure, delete it', 'No, do not delete', 'delete-product-confirm', this._id);
    }
});

Template.productEdit.rendered = function() {
    Session.set('advancedMode', this.data.advancedMode);
    activateWysihtml5('#description-input');
    generatePopovers();
    Session.set('scrumTeamStaleState', false);
};

Template.productEdit.destroyed = function() {
    Session.set('scrumTeamStaleState', false);
};

Template.productEdit.helpers({
    advancedModeChecked: function() {
        if (this.advancedMode) {
            return "checked";
        } else {
            return "";
        }
    }
});