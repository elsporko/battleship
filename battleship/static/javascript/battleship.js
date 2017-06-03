var grid = require('./grid.js');
var player = require('./player.js');
var ships = require('./ships.js');
var fleet = require('./fleet.js');
var config = require('./config.js');

/* Register */
player.register('elsporko');

// Set up grid
//let g = document.getElementById('myGrid');
//g.appendChild(grid.clickableGrid(10, 10));
document.body.appendChild(grid.clickableGrid(10, 10, ships, fleet));


/* Set random fleet */
ships.buildShips();
ships.placeShips(fleet);
let wholeFleet = fleet.getWholeFleet(fleet);
for (t in wholeFleet) {
	grid.displayShip(ships, t);
}

/* Set confirm fleet */

/* Play game */
/*
while (1) {
	player.getTurn();
}
*/
