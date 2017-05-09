var fleet = require('../../static/javascript/fleet.js');
var ships = require('../../static/javascript/ships.js');
jasmine.getEnv().addReporter(new jasmine.ConsoleReporter(console.log));

var config;

/*
 * Basic test of fleet creation and test of getting individual ships 
 */

describe("Manipulate fleet", function(){
    it("tests fleet movement", function(){
	    var ac_plotted=['0_0', '1_0','2_0','3_0'];
	//var setFleet = function (orientation, square, type, size, target){}

	console.log('Setting Aircraft Carrier at 0,0');

	var ship = fleet.setFleet('x', 0, 'aircraftCarrier', 5, '0_0' );
	console.log('Carrier built');
	console.log('retrieving coordinates');

	var getShip = fleet.getFleet('aircraftCarrier');
	console.log('getShip looks like' + getShip);

	expect(getShip).toEqual(jasmine.arrayContaining('0_0','1_0','6_0'));
	expect(getShip).toEqual(ac_plotted);
    });

    it("tests fleet validation", function(){
    // Put a ship in an invalid location...off the map

    });


});

