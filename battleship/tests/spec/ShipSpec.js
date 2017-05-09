var ships = require('../../static/javascript/ships.js');

var fleet;
var config;

/*
 * Basic test of fleet creation and test of getting individual ships 
 */

describe("Suite to test create/get ship(s)", function(){
    beforeEach(function(){
        fleet = ships.buildShips();
	config = ships.ship_config;
        })
    it("tests creation of the fleet", function(){
        //var fleet = ships.buildShips();
        //console.log('fleet: ', fleet);
	expect(fleet).toEqual(jasmine.any(Object));
    });

    it("tests get all individual ships", function(){
        for (let s in config){
            var ship = ships.getShip(s);
            expect (ship.size).toEqual(config.s.size);
            expect (ship.id).toEqual(config.s.id);
            expect (ship.color).toEqual(config.s.color);
            expect (ship.clickClass).toEqual(config.s.clickClass);
            expect (ship.label).toEqual(config.s.label);
        }
    })

});


/*
 * Test initial fleet placement (??? and validation - spy on validation(?) ???)
 */
describe("Suite to test intial fleet placement and ship placement validation", function(){
});


/*
 * Test fleet movement (??? and validation ???)
 */
describe("Suite to test fleet movement", function(){
});


/*
 * Test battle action:
 *   * ship struck
 *   * ship encounters mine
 *   * ship sunk
 *   * fleet sunk
 */
describe("Suite to test battle action", function(){
});
