Template.productHistory.rendered = function() {
    var routerStartDate = moment(Router.current().params.startDate).toDate();
    var routerEndDate = moment(Router.current().params.endDate).toDate();
    if (routerStartDate && routerEndDate) {
        var selectedSprint = Sprints.findOne({startDate: routerStartDate, endDate: routerEndDate});
        if (selectedSprint) {
            $('#select-multiple-product-history option[value=' + selectedSprint._id + ']').addClass('disabled');
        }
    }
};

Template.productHistory.helpers({
    sprints: function() {
        return Sprints.find({productId: this._id});
    },
    startDateFormatted: function() {
        return moment(this.startDate).format('MMMM D, YYYY');
    },
    endDateFormatted: function() {
        return moment(this.endDate).format('MMMM D, YYYY');
    }
});

Template.productHistory.events({
    'click #activate-sprint': function(e) {
        e.preventDefault();
        var selectorForSelectedElement = $('option.select-multiple-sprint-element.selected');
        var len = selectorForSelectedElement.length;
        if (len == 1) {
            var sprintId = selectorForSelectedElement.val();
            var sprint = Sprints.findOne({_id: sprintId});
            if (sprint) {
                $('#activate-sprint').addClass('disabled');
                selectorForSelectedElement.removeClass('selected');
                $('#select-multiple-product-history option[value=' + sprintId + ']').addClass('disabled');
                Router.go('taskBoardPage', {slug: this.slug, startDate: moment(sprint.startDate).format('YYYY-MM-DD'), endDate: moment(sprint.endDate).format('YYYY-MM-DD')});
            }
        } else {
            throwAlert('error', 'Ops!', 'Something went wrong.');
        }
    },
    'click .select-multiple-sprint-element': function(e, t) {
        operateMultipleSelect($('#select-multiple-product-history option[value=' + e.currentTarget.value + ']'));
        var selector = $('option.select-multiple-sprint-element.selected');
        var len = selector.length;
        if (len == 0 || len > 1 || selector.hasClass('disabled')) {
            $('#activate-sprint').addClass('disabled');
        } else {
            $('#activate-sprint').removeClass('disabled');
        }
    }
});
