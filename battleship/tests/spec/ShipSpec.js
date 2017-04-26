require('../../static/javascript/ships.js');

//var ships;

describe("A suite", function(){
    /*
    beforeEach(function(){
        ships = new ships;
        })
    */
    it("tests creation of a ship", function(){
        var ships = getShips();
        expect(ships)toBe(true);
    });
});
