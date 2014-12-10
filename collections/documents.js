Documents = new Meteor.Collection('documents');

Documents.allow({
    insert: scrumTeam,
    update: scrumTeam,
    remove: scrumTeam
});


var serverVar = false;
if(Meteor.isServer) {
    serverVar = true;
}

Meteor.methods({
    deleteDocument: function(id) {
        if (serverVar) {
            Documents.remove(id);
            if (!this.isSimulation) {
                return ShareJS.model["delete"](id);
            }
        }
    }
});