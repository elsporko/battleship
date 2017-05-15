var fleet = require('../../static/javascript/fleet.js');
var ships = require('../../static/javascript/ships.js');
//jasmine.getEnv().addReporter(new jasmine.ConsoleReporter(console.log));

var config;

/*
 * Basic test of fleet creation and test of getting individual ships 
 */

describe("Manipulate fleet", function(){
    it("tests fleet movement", function(){
	// Plotting Aircraft Carrier on the x axis starting at position 0,0
	var ship = fleet.setFleet('x', 'aircraftCarrier', 5, '0_0' );

        // Expected result of where the aircraft carrier is plotted on the board
	var ac_plotted=['0_0', '1_0','2_0','3_0','4_0'];

	// retrieve the coordinates of the aircraft carrier
	var getShip = fleet.getFleet('aircraftCarrier');

	expect(getShip).toEqual(ac_plotted);
    });

});

describe("Check fleet validation", function(){
    it("tests valid ship placement", function(){
    // Put a ship in an invalid location...off the map
	// Plotting Patrol Boat on the y axis starting at position 3,3 which is a legitimate placement
	fleet.setFleet('y', 'patrolBoat', 2, '3_3' );
	var ship = ['3_3','3_4'];
	var validate = fleet.validateShip(ship, 'patrolBoat');
	expect(validate).toBe(true);
    });

    it("tests if ship will end up off grid", function(){
    // Put a ship in an invalid location...off the map
	var ship = ['7_0','8_0','9_0','10_0','11_0' ];
	var validate = fleet.validateShip(ship, 'aircraftCarrier');
	expect(validate).toBe(false);
    });

    it("tests for ship collision", function(){
    // Put a ship in an invalid location...off the map
	// Plotting Aircraft Carrier on the x axis starting at position 0,0 
	var ship = fleet.setFleet('x', 'aircraftCarrier', 5, '0_0' );
	// Plotting Destroyer on the x axis starting at position 4,0 
	fleet.setFleet('x', 'destroyer', 3, '4_0' );
	var ship2 = ['4_0','5_0','6_0','7_0'];
	var validate = fleet.validateShip(ship2, 'aircraftCarrier');
	expect(validate).toBe(false);


    });
});


describe("Check ghost ship is properly built", function(){
    it("Checks ghost ship is built with minimal arguments (type, start_coord)", function(){
	ships.buildShip('destroyer');
	var plotted = ['4_4','5_4','6_4'];
	var ship = fleet.ghostShip('destroyer', '4_4');
	expect(ship).toEqual(plotted);
    });

    it("Checks ghost ship is built with all arguments", function(){
	var plotted = ['4_4','4_5','4_6','4_7','4_8','4_9'];
	var ship = fleet.ghostShip('destroyer', '4_4', 'y', 6); // Note building destroyer which is size 3 but telling function it is size 6
	expect(ship).toEqual(plotted);
    });
});


