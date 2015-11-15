
Meteor.startup(function(){
    Buildings.remove({});
    if(Buildings.find().count() == 0) {
        Buildings.insert({
            "floor": [{
                "level": 1,
                "room": []
            }]
        });
        for (var i = 1; i < 20; i++) {
            var switch_id = Switches.insert({
                "number": i,
                "lights": [{
                    "type": "incandescent",
                    "wattage": 100
                }],
                "actions": []

            });
            console.log(switch_id);

            Buildings.update({}, {$push: {
                "floor.0.room":{
                    "switch_ids": [switch_id],
                    "number": Math.round((Math.random() * 100))
                }
            }})
        }
    }


});




Meteor.publish('buildings', function(){
    return Buildings.find();
});