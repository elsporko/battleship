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
	var ship = fleet.setFleet('x', 0, 'aircraftCarrier', 5, '0_0' );

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
	fleet.setFleet('y', 0, 'patrolBoat', 2, '3_3' );
	var ship = ['3_3','3_4'];
	var validate = fleet.validateShip(ship, 'patrolBoat');
	expect(validate).toBe(true);
    });

    it("tests if ship will end up off grid", function(){
    // Put a ship in an invalid location...off the map
	// Plotting Aircraft Carrier on the x axis starting at position 7,0 which would put the ship off the grid
	//fleet.setFleet('x', 0, 'aircraftCarrier', 5, '7_0' );
	var ship = ['7_0','8_0','9_0','10_0','11_0' ];
	var validate = fleet.validateShip(ship, 'aircraftCarrier');
	expect(validate).toBe(false);
    });

    it("tests for ship collision", function(){
    // Put a ship in an invalid location...off the map
	// Plotting Aircraft Carrier on the x axis starting at position 0,0 
	var ship = fleet.setFleet('x', 0, 'aircraftCarrier', 5, '0_0' );
	// Plotting Destroyer on the x axis starting at position 4,0 
	fleet.setFleet('x', 0, 'destroyer', 3, '4_0' );
	var ship2 = ['4_0','5_0','6_0','7_0'];
	var validate = fleet.validateShip(ship2, 'aircraftCarrier');
	expect(validate).toBe(false);


    });
});



