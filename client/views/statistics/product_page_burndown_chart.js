var labels = new Array();
var idealEffort = new Array();
var actualEffort = new Array();

Template.productPageBurndownChart.rendered = function() {
    var productId = this.data._id;
    Tracker.autorun(function () {
        var sprint = Sprints.findOne({
            productId: productId,
            startDate: {$lte: new Date()},
            endDate: {$gte: new Date()}
        });
        if (sprint) {
            var startDate = sprint.startDate;
            var endDate = sprint.endDate;
            var storyIdsObj = UserStories.find({sprintId: sprint._id}, {fields: {_id: 1}}).fetch();
            var storyIds = new Array();
            _.each(storyIdsObj, function(item) {
                storyIds.push(item._id);
            });
            var numberOfStickiesInSprint = 0;
            if (storyIds) {
                numberOfStickiesInSprint = Stickies.find({storyId: {$in: storyIds}}).count();
            }
            var idealEffortCounter = numberOfStickiesInSprint;

            while(labels.length > 0) {
                labels.pop();
            }

            while(idealEffort.length > 0) {
                idealEffort.pop();
            }

            while(actualEffort.length > 0) {
                actualEffort.pop();
            }

            var burndownData = Burndown.findOne({sprintId: sprint._id});


            var daysDiff = moment(endDate).diff(moment(startDate), 'days');

            for (var i = 0; i < daysDiff; i++) { // TODO: refactor
                if (i != 0 && i != (daysDiff - 1)) {
                    idealEffortCounter -= (numberOfStickiesInSprint/(daysDiff - 1));
                    idealEffort.push(idealEffortCounter);
                }
                labels.push(moment(startDate).add(i, 'days').format('L'));
                if (i == 0) {
                    idealEffort.push(idealEffortCounter);
                }
            }

            idealEffort.push(0);

            if (burndownData && _.has(burndownData, 'data')) {
                var count = 0;
                for (var j = 0; j < burndownData.data.length; j++) {
                    if (moment(burndownData.data[j].date).format('L') == moment(labels[j]).format('L')) {
                        actualEffort.push(burndownData.data[j].numberOfStickiesInSprint);
                        count++;
                    } else {
                        while (moment(burndownData.data[j].date).format('L') != moment(labels[count]).format('L')) {
                            actualEffort.push(burndownData.data[j - 1].numberOfStickiesInSprint);
                            count++;
                        }
                        actualEffort.push(burndownData.data[j].numberOfStickiesInSprint);
                        count++;
                    }
                }
                $(document).ready(function () {
                    var burndownChart = document.getElementById("burndownChart");
                    if (burndownChart) {
                        //Get the context of the canvas element we want to select
                        var ctx = document.getElementById("burndownChart").getContext("2d");
                        var myBurndownChart = new Chart(ctx).Line(data, {
                            bezierCurve: false,
                            scaleOverride: true,
                            scaleStepWidth: 2,
                            scaleSteps: numberOfStickiesInSprint / 2
                        });
                    }
                });
            } else {
                // TODO: display err
            }
        }
    });
};

var data = {
    labels : labels,
    datasets : [
        {
            fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "rgba(220,220,220,1)",
            pointColor : "rgba(220,220,220,1)",
            pointStrokeColor : "#fff",
            data : idealEffort
        },
        {
            fillColor : "rgba(151,187,205,0.5)",
            strokeColor : "rgba(151,187,205,1)",
            pointColor : "rgba(151,187,205,1)",
            pointStrokeColor : "#fff",
            data : actualEffort
        }
    ]
};