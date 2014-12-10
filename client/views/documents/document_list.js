Template.documentList.helpers({
    documents: function() {
        return Documents.find({productId: this._id});
    }
});

Template.documentList.events = {
    "click button": function() {
        return Documents.insert({
            title: "untitled",
            productId: this._id
        }, function(err, id) {
            if (!id) {
                return;
            }
            return Session.set("document", id);
        });
    }
};