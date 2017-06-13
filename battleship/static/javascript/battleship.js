var grid = require('./grid.js');
var player = require('./player.js');
var ships = require('./ships.js');
var fleet = require('./fleet.js');
var config = require('./config.js');


player.gameFlow();

/* Register */
// TODO - attach handler through pug; move handlers to another module
let r=document.getElementById('register');
r.addEventListener('click', 
    function(){
	    player.register();
	    return;
    }, false);

// Set up grid
let g = document.getElementById('myGrid');
g.appendChild(grid.clickableGrid(10, 10, ships, fleet));


/* Set random fleet */
ships.buildShips();
ships.placeShips(fleet);
let wholeFleet = fleet.getWholeFleet(fleet);
for (t in wholeFleet) {
	grid.displayShip(ships, t);
}

/* 
 * Mock game will be removed 
 */
let m = document.getElementById('Megan');
m.addEventListener('click', 
    function(){
        player.acceptReg('Megan', 1, grid, ships, fleet, player);
        document.getElementById('Megan').style.display='none';
    }, false);

let ry = document.getElementById('Ryan');
ry.addEventListener('click', 
    function(){
        player.acceptReg('Ryan', 1, grid, ships, fleet, player);
        document.getElementById('Ryan').style.display='none';
    }, false);

//player.acceptReg('Megan', 1, grid, ships, fleet, player);
//player.acceptReg('Ryan', 2, grid, ships, fleet, player);

/* Set confirm fleet */

/* Play game */
/*
while (1) {
	player.getTurn();
}
*/
