Template.newSticky.rendered = function() {
    var parentDataContext = Template.parentData(1);
    var storyId = this.data._id;
    $('.new-sticky').editable({
        title: 'Please fill out all details',
        display: false,
        success: function(response, newValue) {
            if (newValue) {
                var user = Meteor.user();
                var newSticky = {
                    userId: user._id, title: newValue.title, description: newValue.description, productId: parentDataContext._id, storyId: storyId,
                    status: "1", submitted: new Date(), author: user.username,
                    lastMoved: user.username, lastEdited: user.username, assigneeId: ""
                };
                var stickyId = Stickies.insert(newSticky);

                //updateLastModified();

                var story = UserStories.findOne({_id: storyId});
                var product = Products.findOne({_id: parentDataContext._id});

                if (product.advancedMode) {
                    var sprint = Sprints.findOne({_id: story.sprintId});
                    Meteor.call('updateBurndown', sprint._id, function (err) {
                        if (err) {
                            alert(err);
                        }
                    });
                    Meteor.call('createActElStickyCreate', newSticky.productId, Meteor.user()._id, newSticky.title, story.title, sprint.goal, function(error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                            return null;
                        }
                    });
                }
            } else {
                throwAlert("error", "Title missing!", "Please name your new Sticky.");
            }
        }
    });
};

// TODO: refactor

(function ($) {
    "use strict";

    var Sticky = function (options) {
        this.init('sticky', options, Sticky.defaults);
    };

    //inherit from Abstract input
    $.fn.editableutils.inherit(Sticky, $.fn.editabletypes.abstractinput);

    $.extend(Sticky.prototype, {
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

    Sticky.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="editable-sticky"><label><span>Title: </span><input type="text" name="title" class="input-small"></label></div>'+
        '<div class="editable-sticky"><label><span>Description: </span><input type="text" name="description" class="input-small"></label></div>',

        inputclass: ''
    });

    $.fn.editabletypes.sticky = Sticky;

}(window.jQuery));