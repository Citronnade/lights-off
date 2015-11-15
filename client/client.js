Template.switch_form.helpers({
    //TODO: Go by each building individually
    buildings: function(){
        //console.log(Meteor.subscribe("buildings"));
        //console.log(Buildings.find());
        return Buildings.find({});
    },
    switch: function(switch_id){
        //console.log(switch_id);
        //console.log(Switches.findOne({"_id": switch_id}));
        return Switches.findOne({"_id": switch_id});
    },
    wattage_saved: function(){
        return Template.instance().wattage_saved.get();
    },
    percent_off: function(building){

        return calculate_percent_off(building).toFixed(2);
    },
    hack_percent_off: function(){
        return calculate_percent_off(Buildings.findOne()).toFixed(2);
    }
});

Template.switch_form.events({
    "click #submit": function(event){
        var cur_saved = 0;
        var switches = $('input[name*="status_"]:checked');
        //console.log("switches[]:", switches);
        //console.log(switches[0].name);
        $.each(switches, function(index, light_switch){
            //console.log(light_switch.id);
            var switch_id = light_switch.id.replace(/.*_/, "");
            console.log("switch_id ", switch_id);
            var switch_obj = Switches.findOne({_id: switch_id});
            //console.log("switch_obj ", switch_obj);

            var action = create_action(switch_obj, light_switch.value);
            console.log("action", action);
            Switches.update({_id: switch_id}, {$push: {
                actions: action
            }});

            //console.log("new actions", Switches.find({_id: switch_id}).fetch());
            //calculate wattage saved

            if(action.status =="off") {
                cur_saved += calculate_wattage(switch_obj);
            }

        });
        Template.instance().wattage_saved.set(cur_saved);
        //console.log(Template.instance().wattage_saved.get());


    }
});
//TODO: move to separate template
Template.switch_form.created =  function(){
    this.wattage_saved = new ReactiveVar();
    this.percent_off = new ReactiveVar();
};
//TODO: ADD PEOPLE
var create_action = function(switch_obj, status){
    return {
        "switch_id": switch_obj._id,
        "status": status
    }
};

var calculate_wattage = function(switch_obj){
    var sum = 0;
    return _.reduce(switch_obj.lights, function(memo, light){
        return memo + light.wattage;
    }, 0)
};

var calculate_percent_off = function(building){
    console.log("building:", building);
    var cur = 0;
    var sum = 0;
    _.each(building.floor, function(f){
        _.each(f.room, function(r){
            _.each(r.switch_ids, function(id){
                var switch_obj;
                switch_obj = Switches.findOne({"_id": id});
                _.each(switch_obj.actions, function(element){
                    console.log("current element:", element);
                    console.log("current status:", element.status);
                    if(element.status == "off"){
                        cur++
                    }
                    sum++;
                });
            });
        })
    });




    if(sum != 0){
        return cur / sum * 100;
    }
    else{
        return 0;
    }
};