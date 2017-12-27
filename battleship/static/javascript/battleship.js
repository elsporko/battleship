'use strict';
var grid = require('./grid');
var fleet = require('./fleet');
var ships = require('./ships');
var player = require('./player');
//var config = require('./config.js');
var move = require('./move');

player.gameFlow();

/* Register */
// TODO - attach handler through pug; move handlers to another module
let r=document.getElementById('register');
r.addEventListener('click', 
    function(){
	    player.register();
	    //return;
    }, false);

let f=document.getElementById('setFleet');
f.addEventListener('click', 
    function(){
        document.getElementById('setFleet').style.display='none';
        document.getElementById('playerGrid').style.display='inline';
	grid.setMoveShip(); 
	    playGame();
	    //return;
    }, false);

// Set up link to resolve moves
let d=document.getElementById('doMoves');
d.addEventListener('click',
	function(){
		// Resolve orders
		move.resolveMoves();
		// Reset moves
		move.clearMoveList();
		// Turn moves over to the next player
		// FIXME - Simulating moves for now. Remove when ready for realsies

	}, false);
// Set up grid
document.getElementById('myGrid').appendChild(grid.clickableGrid(10, 10, ships, fleet, player));

// Set up drag/drop of moves
//document.getElementById('playOrder').setAttribute('draggable','true');
//player.playerOrderHandler();

/* Set random fleet */
ships.buildShips();
ships.placeShips();
let wholeFleet = fleet.getWholeFleet();
for (let t in wholeFleet) {
	grid.displayShip(ships, t);
}
/*
ships.buildShips();
ships.placeShips(fleet);
let wholeFleet = fleet.getWholeFleet(fleet);
for (let t in wholeFleet) {
	grid.displayShip(ships, t);
}
*/

/* 
 * Mock game will be removed 
 */
let m = document.getElementById('MeganReg');
m.addEventListener('click', 
    function(){
        player.acceptReg('Megan', 1);
        //m.style.display='none';
        document.getElementById('MeganReg').style.display='none';
	//document.getElementById(flow[currentFlow]).style.display='none';
        //m.appendChild(document.createElement('p'));
    }, false);

let ry = document.getElementById('RyanReg');
ry.addEventListener('click', 
    function(){
        player.acceptReg('Ryan', 2, grid, ships, fleet, player);
        document.getElementById('RyanReg').style.display='none';
        //let r=document.getElementById('Ryan').style.display='none';
        //r.appendChild(document.createElement('p'));
    }, false);

let tr = document.getElementById('TraceyReg');
tr.addEventListener('click', 
    function(){
        player.acceptReg('Tracey', 2, grid, ships, fleet, player);
        document.getElementById('TraceyReg').style.display='none';
    }, false);

/* Play game */
/*
while (1) {
	player.getTurn();
}
*/

function playGame(){
	if (player.myTurn(fleet)){
		//window.open('','attack', 'height=200,width=200,menubar=no,status=no,titlebar=no,toolbar=no', false );
	}
}



