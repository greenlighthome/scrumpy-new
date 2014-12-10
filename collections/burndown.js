Burndown = new Meteor.Collection('burndown');

Burndown.allow({
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
    updateBurndown: function(sprintId) {
        if(serverVar) {
            var burndownData = Burndown.findOne({sprintId: sprintId});
            if (burndownData) {
                var storyIdsObj = UserStories.find({sprintId: sprintId}, {fields: {_id: 1}}).fetch();
                var storyIds = new Array();
                _.each(storyIdsObj, function(item) {
                    storyIds.push(item._id);
                });
                var numberOfStickiesInSprint = 0;
                if (storyIds) {
                    numberOfStickiesInSprint = Stickies.find({storyId: {$in: storyIds}, status: { $in: ["1", "2", "3"]}}).count();
                }
                var date = new Date();
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);

                if (!burndownData.data || !arrayContainsDateElement(burndownData.data, date)) {
                    Burndown.update({sprintId: sprintId}, { $push: { data: {date: date, numberOfStickiesInSprint: numberOfStickiesInSprint}}});
                } else {
                    Burndown.update({sprintId: sprintId, "data.date": date}, { $set: { "data.$.numberOfStickiesInSprint": numberOfStickiesInSprint}});
                }
            }
        }
    }
});

function arrayContainsDateElement(arr, el) {
    var i = arr.length;
    while (i--) {
        if (arr[i].date.valueOf() === el.valueOf()) {
            return true;
        }
    }
    return false;
}