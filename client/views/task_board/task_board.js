var storyId, stickyId, productId, routerStartDate, routerEndDate;

Template.taskBoard.helpers({
    userStories: function() {
        if (this.advancedMode && Router.current().params.startDate && Router.current().params.endDate) {
            return UserStories.find({productId: this._id, sprintId: getSprintId(this._id)}, {$sort: {priority: -1}});
        }
        return UserStories.find({productId: this._id});
    },
    stickyType: function(type) {
        return Stickies.find({storyId: this._id, status: type});
    }
});

function getSprintId(productId) {
    var sprint = Sprints.findOne({productId: productId, startDate: routerStartDate, endDate: routerEndDate});
    if (sprint) {
        return sprint._id;
    }
    return null;
}

Template.taskBoard.events({
    'click .new-story-submit': function(e, t) {
        e.preventDefault();

        var newStoryInput = t.find('[name=new-story-input]');
        var inputValue = $.trim(newStoryInput.value);

        if (inputValue.length > 0) {
            if (this.advancedMode) {
                if (routerStartDate && routerEndDate) {
                    var newStory = {userId: Meteor.userId(), title: newStoryInput.value, productId: this._id,
                        submitted: new Date(), author: Meteor.user().username,
                        lastEdited: Meteor.user().username, sprintId: getSprintId(this._id)};
                    createStory(newStory, newStoryInput);

                } else {
                    throwAlert('error', 'Sorry!', 'Please choose a sprint first.');
                    highlightErrorForField('[name=new-story-input]');
                }
            } else {
                var newStory = {userId: Meteor.userId(), title: newStoryInput.value, productId: this._id,
                    submitted: new Date(), author: Meteor.user().username,
                    lastEdited: Meteor.user().username};
                createStory(newStory, newStoryInput);
            }
        } else {
            alert('Choose a title that reflect the feature to be implemented', 'Choose a title');
        }
    },
    'click .deleteSticky': function(e) {
        e.preventDefault();
        // create element in activity stream

        var productId = Stickies.findOne(this._id).productId;


        Stickies.remove(this._id);

        Meteor.call('updateBurndown', productId , function(err) {
            if (err) {
                alert(err);
            }
        });

        updateLastModified();


    },

    'click .editSticky': function(e) {
        e.preventDefault();


        document.getElementById("stickyName").value = this.title;
        stickyId = this._id;
    },

    'click .editStickySubmit': function(e) {
        e.preventDefault();

        var stickyName = document.getElementById("stickyName").value;

        document.getElementById("stickyName").value = "";

        if (stickyName.length > 0) {
            var stickyOldTitle = Stickies.findOne({_id: stickyId}).title;

            Stickies.update({_id: stickyId}, {$set:{title: stickyName, lastEdited: Meteor.user().username}});

            $('#stickyEditModal').modal('hide');

            if (stickyName != stickyOldTitle) {
                updateLastModified();

                // create element in activity stream
            }
        } else {
            alert("Please name your Sticky.", "Title missing!")
        }
    }
});

Template.taskBoard.created = function() {
    // TODO: unused?
    //productId = Router.current().params['_id'];
    if (Router.current().params.startDate && Router.current().params.endDate) {
        routerStartDate = moment(Router.current().params.startDate).toDate();
        routerEndDate = moment(Router.current().params.endDate).toDate();
    }

};

Template.taskBoard.destroyed = function() {
    Session.set('sprintNotAvailableError', false);
};

function updateLastModified() {
    Products.update({_id: productId}, {$set:{lastModified: new Date()}});
}

Template.taskBoard.rendered = function() {
    var productId = this.data._id;
    $('#new-user-story-editable').editable({
        title: 'Please fill out all details',
        display: false,
        value: "",
        success: function(response, newValue) {
            if (newValue) {
                var newStory = {userId: Meteor.userId(), title: newValue.title, description: newValue.description, productId: productId,
                    submitted: new Date(), author: Meteor.user().username,
                    lastEdited: Meteor.user().username};
                UserStories.insert(newStory);
                //if (stickyName != stickyOldTitle) {
                //    updateLastModified();

                // create element in activity stream
                throwAlert('success', 'Yes!', 'Story added.');
                // }
            }
        }
    });

    if (Session.equals('sprintNotAvailableError', true)) {
        throwAlert('error', 'Ooops!', 'This sprint is not available! We redirected you to the current sprint.');
    }

    if (Session.equals('sprintNotAvailableError', true)) {
        throwAlert('error', 'Ooops!', 'This sprint is not available! We redirected you to the current sprint.');
    }

};


// TODO: refactor

(function ($) {
    "use strict";

    var UserStory = function (options) {
        this.init('userStory', options, UserStory.defaults);
    };

    //inherit from Abstract input
    $.fn.editableutils.inherit(UserStory, $.fn.editabletypes.abstractinput);

    $.extend(UserStory.prototype, {
        /**
         Renders input from tpl

         @method render()
         **/
        render: function() {
            this.$input = this.$tpl.find('input');
        },

        /**
         Default method to show value in element. Can be overwritten by display option.

         @method value2html(value, element)
         **/
        value2html: function(value, element) {
            if(!value) {
                $(element).empty();
                return;
            }
            var html = $('<div>').text(value.title).html() + ', ' + $('<div>').text(value.description).html();
            $(element).html(html);
        },

        /**
         Gets value from element's html

         @method html2value(html)
         **/
        html2value: function(html) {
            /*
             you may write parsing method to get value by element's html
             e.g. "Moscow, st. Lenina, bld. 15" => {city: "Moscow", street: "Lenina", building: "15"}
             but for complex structures it's not recommended.
             Better set value directly via javascript, e.g.
             editable({
             value: {
             city: "Moscow",
             street: "Lenina",
             building: "15"
             }
             });
             */
            return null;
        },

        /**
         Converts value to string.
         It is used in internal comparing (not for sending to server).

         @method value2str(value)
         **/
        value2str: function(value) {
            var str = '';
            if(value) {
                for(var k in value) {
                    str = str + k + ':' + value[k] + ';';
                }
            }
            return str;
        },


        /**
         Sets value of input.

         @method value2input(value)
         @param {mixed} value
         **/
        value2input: function(value) {
            if(!value) {
                return;
            }
            this.$input.filter('[name="title"]').val(value.title);
            this.$input.filter('[name="description"]').val(value.description);
        },

        /**
         Returns value of input.

         @method input2value()
         **/
        input2value: function() {
            return {
                title: this.$input.filter('[name="title"]').val(),
                description: this.$input.filter('[name="description"]').val()
            };
        },

        /**
         Activates input: sets focus on the first field.

         @method activate()
         **/
        activate: function() {
            this.$input.filter('[name="title"]').focus();
        },

        /**
         Attaches handler to submit form in case of 'showbuttons=false' mode

         @method autosubmit()
         **/
        autosubmit: function() {
            this.$input.keydown(function (e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
            });
        }
    });

    UserStory.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="editable-user-story"><label><span>Title: </span><input type="text" name="title" class="input-small"></label></div>'+
        '<div class="editable-user-story"><label><span>Description: </span><input type="text" name="description" class="input-small"></label></div>',

        inputclass: ''
    });

    $.fn.editabletypes.userStory = UserStory;

}(window.jQuery));