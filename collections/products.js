Products = new Meteor.Collection('products');

Products.allow({
    update: ownsDocumentOrAdmin,
    remove: ownsDocument
});

var serverVar = false;
if(Meteor.isServer) {
    serverVar = true;
}

Meteor.methods({
    createProduct: function(productAttributes) {
        if (serverVar) {
            var user = Meteor.user();

            // ensure the user is logged in
            if (!user) {
                throw new Meteor.Error(401, "You need to login to create a new product", "Please log in");
            }
            // ensure the product has a title
            if (!productAttributes.title) {
                throw new Meteor.Error(422, "Please fill in a title", "Title is empty");
            }

            // check if collection is empty
            var counterDoc = Counter.findOne();
            var firstInsert = false;
            if (!counterDoc) {
                var cId = Counter.insert({'productCounterForUniqueURLs': 0});
                firstInsert = true;
                counterDoc = Counter.findOne({_id: cId});
            }
            if (!firstInsert && counterDoc) {
                Counter.update({_id: counterDoc._id}, {$inc: {'productCounterForUniqueURLs': 1}});
            }
            var counterVar = Counter.findOne().productCounterForUniqueURLs;

            // pick out the whitelisted keys
            var product = _.extend(_.pick(productAttributes, 'title', 'description', 'advancedMode'), {
                userId: user._id,
                author: user.username,
                submitted: new Date(),
                lastModified: new Date(),
                slug: counterVar + '-' + slugify(productAttributes.title) // TODO: Testen
            });

            var productId = Products.insert(product);
            
            return Products.findOne({_id: productId});
        }
    },
    updateProduct: function(productAttributes, productId) {
        if (serverVar) {
            var user = Meteor.user();

            // ensure the user is logged in
            if (!user) {
                throw new Meteor.Error(401, "You need to login to create a new product", "Please log in");
            }
            // ensure the product has a title
            if (!productAttributes.title) {
                throw new Meteor.Error(422, "Please fill in a title", "Title is empty");
            }

            Products.update(productId, {$set: productAttributes});

            return Products.findOne({_id: productId});
        }
    },
    deleteProduct: function(productId) {
        if (serverVar) {
            var mode = Products.findOne({_id: productId}).advancedMode;
            Products.remove(productId);

            var usernames = new Array();

            if (mode) {
                Roles.getUsersInRole([productId], 'productOwner').forEach(function (user) {
                    Roles.removeUsersFromRoles(user, [productId], 'productOwner');
                    usernames.push(user.username);
                });
                Roles.getUsersInRole([productId], 'scrumMaster').forEach(function (user) {
                    Roles.removeUsersFromRoles(user, [productId], 'scrumMaster');
                    usernames.push(user.username);
                });
            } else {
                Roles.getUsersInRole([productId], 'administrator').forEach(function (user) {
                    Roles.removeUsersFromRoles(user, [productId], 'administrator');
                    usernames.push(user.username);
                });
            }
            Roles.getUsersInRole([productId], 'developmentTeam').forEach(function (user) {
                Roles.removeUsersFromRoles(user, [productId], 'developmentTeam');
                usernames.push(user.username);
            });
            if (Roles.getUsersInRole([productId]).count() == 0) {
                Roles.deleteRole(productId);
            }

            Burndown.remove({productId: productId});
            var pm = PrivateMessages.findOne({productId: productId});
            _.each(pm.messages, function(m) {
                _.each(m.invitation.members.developmentTeam, function(u) {
                        usernames.push(u.username);
                });
                if (_.has(m.invitation.members, 'scrumMaster')) {
                    usernames.push(m.invitation.members.scrumMaster.username);
                }
            });
            Users.update({username: {$in: usernames}}, {$pull: {privateMessages: pm._id}}, {multi : true});
            PrivateMessages.remove({productId: productId});
        }
    }
});

slugify = function(title) {
    return title.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
};