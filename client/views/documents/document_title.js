Session.setDefault("editorType", "ace");

Template.documentTitle.helpers({
    title: function() {
        var _ref;
        return (_ref = Documents.findOne(this + "")) != null ? _ref.title : void 0;
    },
    editorType: function(type) {
        return Session.equals("editorType", type);
    }
});