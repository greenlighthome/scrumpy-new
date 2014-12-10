ActivityStreamElements = new Meteor.Collection('activityStreamElements');

ActivityStreamElements.deny({
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
    createActElProductCreate: function(productId, userId) { // TODO: check only advanced products
        if(serverVar) {
            var base = getBaseActEl(1, productId, userId);
            var product = Products.findOne({_id: productId});
            if (product) {
                var el = _.extend(base, {
                    productTitle: product.title
                });
                ActivityStreamElements.insert(el);
            }
        }
    },
    createActElProductTitleEdit: function(productId, userId, oldProductTitle) {
        if(serverVar) {
            var base = getBaseActEl(2, productId, userId);
            var product = Products.findOne({_id: productId});
            if (product) {
                var el = _.extend(base, {
                    newProductTitle: product.title,
                    oldProductTitle: oldProductTitle
                });
                ActivityStreamElements.insert(el);
            }
        }
    },
    createActElUserInvitationAccepted: function(productId, userId, role, status) {
        if(serverVar) {
            var base = getBaseActEl(3, productId, userId);
            var el = _.extend(base, {
                role: role,
                status: status
            });
            ActivityStreamElements.insert(el);
        }
    },
    createActElUserInvitationDeclined: function(productId, userId, status) {
        if(serverVar) {
            var base = getBaseActEl(4, productId, userId);
            var el = _.extend(base, {
                status: status
            });
            ActivityStreamElements.insert(el);
        }
    },
    createActElSprintCreate: function(productId, userId, sprintGoal, sprintStartDate, sprintEndDate) {
        if(serverVar) {
            var base = getBaseActEl(5, productId, userId);
            var el = _.extend(base, {
                sprintGoal: sprintGoal,
                sprintStartDate: sprintStartDate,
                sprintEndDate: sprintEndDate
            });
            ActivityStreamElements.insert(el);
        }
    },
    createActElUserStory: function(productId, userId, userStoryTitle) {
        if(serverVar) {
            var base = getBaseActEl(6, productId, userId);
            var el = _.extend(base, {
                userStoryTitle: userStoryTitle
            });
            ActivityStreamElements.insert(el);
        }
    },
    createActElUserStoryPrioritized: function(productId, userId, userStoryTitle, priority, sprintGoal) {
        if(serverVar) {
            var base = getBaseActEl(7, productId, userId);
            var el = _.extend(base, {
                userStoryTitle: userStoryTitle,
                priority: priority,
                sprintGoal: sprintGoal
            });
            ActivityStreamElements.insert(el);
        }
    },
    createActElStickyCreate: function(productId, userId, stickyTitle, userStoryTitle, sprintGoal) {
        if(serverVar) {
            var base = getBaseActEl(8, productId, userId);
            var el = _.extend(base, {
                userStoryTitle: userStoryTitle,
                stickyTitle: stickyTitle,
                sprintGoal: sprintGoal
            });
            ActivityStreamElements.insert(el);
        }
    },
    createActElStickyMoved: function(productId, userId, stickyTitle, oldStickyStatus, newStickyStatus) {
        var base = getBaseActEl(9, productId, userId);
        var el = _.extend(base, {
            stickyTitle: stickyTitle,
            oldStickyStatus: oldStickyStatus,
            newStickyStatus: newStickyStatus
        });
        ActivityStreamElements.insert(el);
    },
    createActElStickyEditTitle: function(productId, userId, oldStickyTitle, newStickyTitle) {
        if(serverVar) {
            var base = getBaseActEl(10, productId, userId);
            var el = _.extend(base, {
                oldStickyTitle: oldStickyTitle,
                newStickyTitle: newStickyTitle
            });
            ActivityStreamElements.insert(el);
        }
    },
    createActElStickyEditDescription: function(productId, userId, oldStickyDescription, newStickyDescription) {
        if(serverVar) {
            var base = getBaseActEl(11, productId, userId);
            var el = _.extend(base, {
                oldStickyDescription: oldStickyDescription,
                newStickyDescription: newStickyDescription
            });
            ActivityStreamElements.insert(el);
        }
    },
    createActElUserStoryEditTitle: function(productId, userId, oldUserStoryTitle, newUserStoryTitle) {
        if(serverVar) {
            var base = getBaseActEl(12, productId, userId);
            var el = _.extend(base, {
                oldUserStoryTitle: oldUserStoryTitle,
                newUserStoryTitle: newUserStoryTitle
            });
            ActivityStreamElements.insert(el);
        }
    },
    createActElUserStoryEditDescription: function(productId, userId, oldUserStoryDescription, newUserStoryDescription) {
        if(serverVar) {
            var base = getBaseActEl(13, productId, userId);
            var el = _.extend(base, {
                oldUserStoryDescription: oldUserStoryDescription,
                newUserStoryDescription: newUserStoryDescription
            });
            ActivityStreamElements.insert(el);
        }
    }
});

function getBaseActEl(type, productId, userId) {
    return {
        type: type,
        submitted: new Date(),
        userId: userId,
        productId: productId
    };
}