(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var grid = require('./grid.js');
var player = require('./player.js');
var ships = require('./ships.js');
var fleet = require('./fleet.js');
var config = require('./config.js');
var move = require('./move.js');


player.gameFlow();

/* Register */
// TODO - attach handler through pug; move handlers to another module
let r=document.getElementById('register');
r.addEventListener('click', 
    function(){
	    player.register();
	    return;
    }, false);

let f=document.getElementById('setFleet');
f.addEventListener('click', 
    function(){
        document.getElementById('setFleet').style.display='none';
        document.getElementById('playerGrid').style.display='inline';
	grid.setMoveShip(); 
	    playGame();
	    return;
    }, false);

// Set up link to resolve moves
let d=document.getElementById('doMoves');
d.addEventListener('click',
	function(){
		// Resolve orders
		move.resolveMoves(fleet, ships, grid);
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
ships.placeShips(fleet);
let wholeFleet = fleet.getWholeFleet(fleet);
for (t in wholeFleet) {
	grid.displayShip(ships, t);
}

/* 
 * Mock game will be removed 
 */
let m = document.getElementById('MeganReg');
m.addEventListener('click', 
    function(){
        player.acceptReg('Megan', 1, grid, ships, fleet, player);
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




},{"./config.js":2,"./fleet.js":3,"./grid.js":4,"./move.js":5,"./player.js":6,"./ships.js":7}],2:[function(require,module,exports){
module.exports = function config (config){
    ships = {
        aircraftCarrier : {
            size : 5,
            id : 'aircraftCarrier',
            color : 'Crimson',
            clickClass : 'acclicked',
            label : 'Aircraft Carrier',
        },
        battleship : {
            size : 4,
            id : 'battleship',
            color:'DarkGreen',
            clickClass : 'bsclicked',
            label : 'Battleship',
        },
        destroyer : {
            size : 3,
            id : 'destroyer',
            color:'CadetBlue',
            clickClass : 'declicked',
            label : 'Destroyer',
        },
        submarine  : {
            size : 3,
            id : 'submarine',
            color:'DarkRed',
            clickClass : 'suclicked',
            label : 'Submarine',
        },
        patrolBoat : {
            size : 2,
            id : 'patrolBoat',
            color:'Gold',
            clickClass : 'pbclicked',
            label : 'Patrol Boat',
        },
    };
}

},{}],3:[function(require,module,exports){
var ships=require('./ships.js');

let nauticalMap = {}; // Hash lookup that tracks each ship's starting point and current orientation

let buildNauticalChart = function(){
	let chart = new Array;
	for(let i=0; i < 10; i++) {
		chart[i] = new Array;
		for (let j=0; j < 10; j++){
			chart[i][j] = undefined;//new Array;
		}
	}
	return chart;
}

let nauticalChart = buildNauticalChart(); // Detailed matrix of every ship in the fleet

let getFleet = function(type){
	let orientation = nauticalMap[type].orientation == 'x' ? 0 : 1;

	let pieces = nauticalMap[type].start_coord.split('_');
	let ret = new Array;

	while (pieces[orientation] < nauticalChart[orientation].length && nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] == type) {
		ret.push (pieces[0] + '_' + pieces[1]);
		pieces[orientation] = parseInt(pieces[orientation], 10) + 1;
	}

	return (ret);
}

let getWholeFleet = function(){
	let ret={};
	for (t in nauticalMap) {
		ret[t] = getFleet(t);
	}
	return ret;
}

// TODO - setFleet: Remove previous ship from chart -- may be done...needs test
/*
 * setFleet - place ship on nautical chart
 */
let setFleet = function (orientation, type, size, start_coord, offset){
    let pieces = start_coord.split('_');
    let index = (orientation == 'x') ? 0 : 1;

    offset = offset || 0;

    // Adjust for drag/drop when player picks a ship piece other than the head.
    pieces[index] = parseInt(pieces[index], 10) - offset;

    /*
     * Remove old ship from nauticalChart/Map
     */
    _clearShip(type, size);

    // set the nautical map value for this boat
    nauticalMap[type]={
	    orientation: orientation,
	    start_coord: pieces[0] + '_' + pieces[1]
    };

    for (var i=0; i < size; i++) {
	nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] = type;
	pieces[index]= parseInt(pieces[index], 10) +1;
    }
}

function _clearShip(type, size){
    let map = nauticalMap[type];
    if (map === undefined){return false;}

    let pieces = map.start_coord.split('_');
    let index = (map.orientation == 'x') ? 0 : 1;

    for (i=0; i < size; i++) {
	    nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)]=undefined;
	    pieces[index]++;
    }

    delete nauticalMap[type];

}

/*
 * ghostShip - Before putting a ship on the chart it's potential location needs to be plotted so it can be
 * checked for validity. Given a ship this function will return the potential plotted coordinates. The function
 * may build coordinates for a known ship or for one moved around on the grid.
 */
let ghostShip = function(type, coordinate, orientation, size, offset){
	let ship = ships.getShip(type);
	let thisShip = readMap(type);
	let ghost = [];
	coordinate = coordinate || thisShip.start_coord;
	orientation = orientation || thisShip.orientation;
	size = size || ship.size;
	offset = offset || 0;

	let pieces = coordinate.split('_');
	let index = (orientation == 'x') ? 0: 1;
	pieces[index] = parseInt(pieces[index], 10) - offset;
	for (let i=0; i < size; i++) {
		ghost.push(pieces[0] + '_' + pieces[1]);
		pieces[index] = parseInt(pieces[index], 10) +1;
	}
	return ghost;
};

let readMap = function(type){
	return nauticalMap[type];
}

/*
 * Given a coordinate or an array of coordinates return the same structure revealing the contents of the grid.
 * Will return a value of false if there is a problem checking the grid (ex. coords are out of range).
 */
let checkGrid = function(coordinates){
	if (coordinates instanceof Array){
		let ret = new Array;
		for(c in coordinates){
			let s = _setChart(coordinates[c]);
			if (s === false) {return false};
			ret.push (s);
		}
		return ret;
	} else {
		return _setChart(coordinates);
	}
};

let _setChart = function(coordinate){
	let pieces = coordinate.split('_');
	if (parseInt(pieces[0], 10) >= nauticalChart.length ||
	    parseInt(pieces[1], 10)>= nauticalChart[parseInt(pieces[0], 10)].length) {
		return false;
	}

	return nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)];
};

/* 
 * Given a list of coordinates and a ship type validate that the coordinates do not violate the rules of:
 * 	* ship must be on the grid
 * 	* ship must not occupy the same square as any other ship
 */
let validateShip = function (coordinates, type){
    // Make sure there are no other boats already on any a space
    for (var p=0; p < coordinates.length; p++) {

	// Is there a collision?
	let grid = checkGrid(coordinates);
	
	if (grid == false) {return false}; // If checkGrid returns false coordinates are out of range

	for (c in coordinates) {
		let pieces = coordinates[c].split('_');
			if (nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] != type &&
			    nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] != undefined) {return false};
	}
    }
    return true;
};


module.exports = {
    getFleet: getFleet,
    setFleet: setFleet,
    getWholeFleet: getWholeFleet,
    validateShip: validateShip,
    checkGrid: checkGrid,
    buildNauticalChart: buildNauticalChart,
    ghostShip: ghostShip,
}

},{"./ships.js":7}],4:[function(require,module,exports){
let fleet = require('./fleet');
let ships = require('./ships');

let moveShip = function(ships, dropObj, ev, fleet, player){
    console.log('pre-set fleet move');
    let ship=ships.getShip(dropObj.type);
    // Remove initial image
    displayShip(ships, dropObj.type);

    fleet.setFleet (dropObj.orientation, dropObj.type, ship.size, ev.target.id, dropObj.offset); 

    // Redraw image in new location
    displayShip(ships, dropObj.type);
}

/*
 * Called after player sets initial fleet. Overwrite the moveShip function so it behaves different.
 */
let setMoveShip = function(){
	/* change value of moveShip function */
	moveShip = function(ships, dropObj, ev, fleet, player, dropShip, moveType){
	    console.log('In game move');
	    // Remove initial image
	    displayShip(ships, dropObj.type);

	    // draw image based on dropShip
	    displayShip(ships, dropObj.type, dropShip);

	    // Store ghostShip in move object
	    player.setMove({type: moveType, coordinate: ev.target.id, ghost: dropShip, orientation: dropObj.orientation, shipType: dropObj.type, ships: ships, grid: this});
	}
}

/*
 * Build the grid and attach handlers for drag/drop events
 */
let clickableGrid = function ( rows, cols, ships, fleet, player, phandle){
    let grid = document.createElement('table');
    grid.className='grid';
    for (var r=0;r<rows;++r){
        var tr = grid.appendChild(document.createElement('tr'));
        for (var c=0;c<cols;++c){
            var cell = tr.appendChild(document.createElement('td'));
            // Each cell on the grid is of class 'cell'
            cell.className='cell';

            // Set the ID value of each cell to the row/column value formatted as r_c
            cell.id = r + '_' + c;

            if (phandle == undefined){
                _setMyListeners(cell, ships, fleet, player)
	    } else {
               _setPlayerListeners(player, cell, phandle);
	    }
        }
    }
    return grid;
}

function _setMyListeners(cell, ships, fleet, player){
            // Set up drag and drop for each cell.
            cell.setAttribute('draggable','true');


            cell.addEventListener('dragstart',(
                function(ev){
                    ev.dataTransfer.effectAllowed='move';
		    let type = _getTypeByClass(ships, this.className);
		    let ship = ships.getShip(type);

                    // Calculate which square was clicked to guide placement
                    let start = _find_start(this.id, ship.orientation, ship.size, type);
                    ev.dataTransfer.setData("text/plain", 
                        JSON.stringify({
                                        offset:        start.offset,
				        start_coord:   start.start_coord,
                                        index:         ship.size,
                                        type:          type,
                                        current_coord: fleet.ghostShip(type, start.start_coord),
				        orientation:   ship.orientation
                                       })
                    );
                })
            );

            // Add Drag/Drop capabilities
            cell.addEventListener('drop',(
                function(ev){
                    console.log('dropping');
                    let dropObj = JSON.parse(ev.dataTransfer.getData("text/plain"));
		    console.log('current coord: ', dropObj.current_coord);
		    let ship=ships.getShip(dropObj.type);
		    let dropShip = fleet.ghostShip(dropObj.type, ev.target.id, dropObj.orientation, ship.size, dropObj.offset);

                    if(fleet.validateShip(dropShip, dropObj.type)) {
			    /* There are different behaviors for setting ships based on the initial loading of the ships
			     * versus moving a ship in game. When moving ships in game the display should change to reflect
			     * the potential move but the internal structures should not change until it has been validated
			     * when resolving moves.
			     *
			     * When setting up ships for the initial gam the structures should change along with the display,
			     * all at once.
			     *
			     * The function moveShip is a closure whose value is changed once the player sets the initial fleet.
			     */
			    if(player.canMove()) {moveShip(ships, dropObj, ev, fleet, player, dropShip, 'move')};
                    }

                    ev.stopPropagation();
                    ev.preventDefault();
                    return false;
                    }
                )
            );

            cell.addEventListener('dragover',(
                function(ev){
                    console.log('dragover');
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect='move';
                    return false;
                    }
                ));

            cell.addEventListener('click', (
		function(e){
		    let drop = {};
		    let type = _getTypeByClass(ships, this.className);
		    let ship = ships.getShip(type);
                    let start = _find_start(e.target.id, ship.orientation, ship.size, type);
		    let orientation = (ship.orientation == 'x') ? 'y':'x'; // flip the orientation
		    //let ghost = fleet.ghostShip(type, e.target.id, orientation, ship.size, start.offset);
		    let ghost = fleet.ghostShip(type, e.target.id, orientation, ship.size, start.offset);

		    drop.type = type;
		    drop.offset = start.offset;
		    drop.orientation = orientation;

                    if(fleet.validateShip(ghost, type)) {
			if(player.canMove()) {
		            ship.orientation = orientation;
			    moveShip(ships, drop, e, fleet, player, ghost, 'pivot')};
                    }
                }));
}

function _setPlayerListeners(player, cell, handle){
            // Set the ID value of each cell to the row/column value formatted as r_c
            cell.id = handle + '_' + cell.id;
            // Set up drag and drop for each cell.

            cell.addEventListener('click', (
		function(e){
		    if(player.canMove()) {
		        player.setMove({type: 'attack',
			                      coordinate: e.target.id});
		        console.log( e.target.id + ' is under attack');
                    }
		}
            ));
}

/*
 * _find_start - Determine the starting coordinate of a ship given the square that was clicked. For example
 * it is possible that a battleship along the x-axis was clicked at location 3_3 but that was the second square
 * on the ship. This function will identify that the battleship starts at 2_3.
 */

function _find_start(start_pos, orientation, size, type){
    let index = (orientation == 'x') ? 0 : 1;

    let pieces=start_pos.split('_');
    let offset = 0;

    for (i=0; i < size; i++) {
	if (pieces[index] == 0) {break;}
        pieces[index]--;
	let g = fleet.checkGrid(pieces[0] + '_' + pieces[1]);
        //if (g != undefined && g == type && g != false){
        if (g == type && g != false){
	    offset++;
            start_pos = pieces[0] + '_' + pieces[1];
        } else {
            break;
        }
    }

    return {start_pos: start_pos, offset: offset};
}

let displayShip = function (ships, type, c) {
    let coordinates = c || fleet.getFleet(type);
    let ship = ships.getShip(type);

    for (coord in coordinates) {
        _setSpace(coordinates[coord], ship.clickClass);
    }
}

function _setSpace(space, className) {
    var b = document.getElementById(space); 
    b.classList.toggle(className);
}

function _getTypeByClass(ships, className){
	let shipList = ships.getShip();
	for (s in shipList){
		if (className.match(shipList[s].clickClass)){
			return shipList[s].type;
		}
	}
}

module.exports={
    clickableGrid: clickableGrid,
    displayShip: displayShip,
    setMoveShip: setMoveShip
}


},{"./fleet":3,"./ships":7}],5:[function(require,module,exports){
// Module to manage moves on player's turn.

let fleet = require('./fleet.js');

let moveList = [];
let moveMap = {};

let deleteMove = function(){
}

let clearMoveList = function() {
	moveList = [];
}

/*
 * Create a block to visually represent a move. Generic HTML block for move objects:
 * <div id=<type>_<player>_<coords> class="move">
 *   <div class="moveDetail">
 *     attack: megan_0_0 (* Move text *)`
 *     <div class="delete">delete</div> <!-- element to delete move before submitted -->
 *   </div>
 * </div>
 * 
 */
let moveListBlock = function(move) {
	let moveStruct={};
	let mv = document.createElement('div');
	moveStruct.id = mv.id = move.type + '_' + move.coordinate;
	mv.className = 'move';

	move.undo = fleet.ghostShip(move.shipType);

        mv.setAttribute('draggable','true');
	moveOrderHandler(mv);

	let moveString = move.type + ': ' + move.coordinate;
	let mdtl = document.createElement('div');
	mdtl.innerHTML=moveString;

	let mdel = document.createElement('div');
	mdel.innerHTML='Delete';
	mdel.id = 'del_' + mv.id;
	_set_mvListeners(mv, move);


	mv.appendChild(mdtl);
	mv.appendChild(mdel);
	
	moveStruct.dom = mv;
	moveStruct.type = move.type;
	// store current ship coordinate string so that when a move is deleted it will be restored to it's prior location
	moveStruct.ghost = move.ghost;
	moveStruct.orientation = move.orientation;
	moveStruct.shipType = move.shipType;
	moveStruct.size = move.shipSize;

	return moveStruct;
}

// Add delete move function
function _set_mvListeners(mv, move){
	mv.addEventListener('click', (function() {
		// Check to see if another ship is in the path of the attempted restore
		if (fleet.validateShip(move.undo, move.shipType, move.grid, move.ships)) {
			// Remove the div
			// Need to know parent element which, for everything in the move list, is the element whose id is playOrder
			let p = document.getElementById('playOrder');
			let dmv = document.getElementById(mv.id);
			p.removeChild(dmv);

			// Delete the entry from the array
			//moveList.push(mv);
			for (l in moveList) {
				if(moveList[l].id == mv.id){
					moveList.splice(l,1);
					break;
				}
			}

			// Repaint the original ship
			move.grid.displayShip(move.ships, move.shipType);
			move.grid.displayShip(move.ships, move.shipType, move.undo);
		}
	}));
}

// Set up drag drop functionality for setting move order
let moveOrderHandler = function(po) {
    po.addEventListener('dragstart',(function(e){
	    e.dataTransfer.effectAllowed='move';
	    e.dataTransfer.setData("text/plain",
		JSON.stringify({
			changeMove: e.target.id
		})
	    );
    }));
    po.addEventListener('dragover',(function(e){
                    e.preventDefault();
                    e.dataTransfer.dropEffect='move';
                    return false;
    }));
    po.addEventListener('drop',(function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    let dropObj = JSON.parse(e.dataTransfer.getData("text/plain"));
	    	    alterMoveIndex(dropObj.changeMove, e.target.id);
                    return false;
    }));
}

function alterMoveIndex(startIndex, endIndex){
	startId = startIndex;
	startIndex = parseInt(moveMap[startIndex]);
	endIndex   = parseInt(moveMap[endIndex]);

	let begin = startIndex < endIndex ? parseInt(startIndex, 10) : parseInt(endIndex, 10);
	let end =   startIndex < endIndex ? parseInt(endIndex, 10) : parseInt(startIndex, 10);
	let hold = moveList[startIndex];

	while(begin < end){
		document.getElementById(moveList[begin].id).appendChild((moveList[begin+1]));
		moveList[begin] = moveList[begin+1];
		moveMap[startId] = begin+1;
		begin++;
	}
	document.getElementById(moveList[end].id).appendChild(document.getElementById[hold].id);
	moveList[end] = hold;
	moveMap[startId] = end;
}

let resolveMoves = function (fleet, ships, grid){
	let parent = document.getElementById('playOrder');
	console.log('Resolving moves');
	for(m in moveList) {
		let move = moveList[m];
		console.log('move: ', move);
		switch(move.type) {
			case 'attack': 
				attackPlayer(move.coordinate);
				break;
			case 'mine':
				setMine(move.coordinate);
				break;
			case 'move':
				moveShip(fleet, ships, grid, move);
				break;
			case 'pivot':
				break;
		}
	let child = document.getElementById(move.id);
	parent.removeChild(child);
	}
}

let moveShip = function(fleet, ships, grid, move){
	// Check for mines based on ghost - send message to mine service
	let blastAt = _check_for_mine(move.ghost);
	if (blastAt != false){
		// Reset ghost if mine found - If a mine has been encountered then the ship only moves to the point of the blast
		_resetGhost(fleet, blastAt, move);
		// find which square got hit
		let target;
		for(m in move.ghost){
			if (move.ghost[m] == blastAt)
			{
				target=move.ghost[m];
				break;
			}
		}
		ships.setHitCounter(move.shipType, m+1);
		document.getElementById(target).className +=' shipHit';
	}

	let fl = fleet.getFleet(move.shipType);
	let s = ships.getShip(move.shipType);

	if (fl[0] == move.ghost[0] && move.orientation == s.orientation) { // check starting points and orientation set and redisplay only if different
		// Validate move can be made
		if(fleet.validateShip(move.ghost, move.shipType)) {
			grid.displayShip(ships, move.shipType);
			// Set ghost to NauticalChart/Map
			fleet.setFleet (move.orientation, move.shipType, ships.getShip(move.shipType).size, move.ghost[0], 0); 
		}

		// Display new ship location based on NauticalChart/Map
		grid.displayShip(ships, move.shipType, move.ghost);
	}
}

function _resetGhost(fleet, blastAt, move){
	for (i in move.ghost){
		if (blastAt == move.ghost[i]) break;
	}

	return move.ghost = fleet.ghostShip(move.type, move.ghost[i], move.orientation, move.ghost.length, i);
}

// Stub for mine detection
function _check_for_mine(g){
	let mineAt = {'0_6': 1, '1_6': 1, '2_6': 1, '3_6': 1, '4_6': 1, '5_6': 1, '6_6': 1, '7_6': 1, '8_6': 1, '9_6': 1};
	for(i in g) {
		// return location where mine struck
		if(mineAt[g[i]] == 1) { 
			console.log('BOOM');
			return g[i]; 
		}
	}
	return false;
}
	

let attackPlayer = function(coordinate){
	// Send a message requesting hit/miss value on enemy's grid
	// Inform all of enemy's coordinate status
}

let setMine = function(coordinate){
	// Send a message requesting hit/miss value on enemy's grid
	// If not a hit register with service that mine placed on enemy grid
}

let setMove = function(move){
	//let moveString;
	if(moveMap[move.coordinate] == undefined) {
		moveMap[move.coordinate] = moveList.length;
		//moveString = move.type + ': ' + move.coordinate;
		//let b = moveListBlock(move.coordinate, moveString);
		let mv = moveListBlock(move);
		moveList.push(mv);
		document.getElementById('playOrder').appendChild(mv.dom);
	}
}

let getMoveSize = function(){
	return moveList.length;
}

module.exports = {
    clearMoveList: clearMoveList,
    setMove: setMove,
    deleteMove: deleteMove,
    moveOrderHandler: moveOrderHandler,
    resolveMoves: resolveMoves,
    getMoveSize: getMoveSize,
}

},{"./fleet.js":3}],6:[function(require,module,exports){
//let rabbit = require('./bs_RabbitMQ');
let fleet = require('./fleet.js');
let move = require('./move.js');

let playerRoster = new Object; // Placeholder for all players in the game
let playerOrder = []; // Order of player turn

let me;
let orderIndex=0;
let flow=['register','game'];
let currentFlow;

let canMove = function() {
	if (playerOrder.length > move.getMoveSize()) return true;

	return false;
}

// Register handle
let register = function(handle){
	me = handle; // Self identify thineself
	// TODO - call out to the registration service and get back handle and turn order. This
	// structure represents the return call from the registration service.
	const reg = {
		      handle: 'elsporko',
		      order: 0
	};

	//_populate_playerOrder('elsporko', 0);
	playerOrder[reg.order] = reg.handle;
	gameFlow();
	return;
}

//Accept registration from other players
let acceptReg = function(handle, order, grid, ships, fleet, player){
	playerOrder[order] = handle;
	playerRoster = {
		[handle]: {grid: fleet.buildNauticalChart}
	}
	let pg = document.getElementById('playerGrid').appendChild(document.createElement('div'));;
	
	//let pgd = pg.appendChild(document.createElement('div'));
	pg.id=handle;
	pg.innerHTML=handle;

	pg.appendChild(grid.clickableGrid(10, 10, ships, fleet, player, handle));
}

let myTurn = function() {
	return (currentPlayer() == me) ? 1 : 0;
}

let nextPlayer = function() {
	orderIndex = (orderIndex == playerOrder.length - 1) ?  0 : orderIndex+1;
	return;
}

let currentPlayer = function(){
	return playerOrder[orderIndex];
}

let gameFlow = function(){
	if (currentFlow != undefined){
		document.getElementById(flow[currentFlow]).style.display='none';
		currentFlow++;
	} else {
		currentFlow = 0;
	}
	document.getElementById(flow[currentFlow]).style.display='inline';
}

let setMove = function(m){
	return move.setMove(m);
}

module.exports = {
    register: register,
    acceptReg: acceptReg,
    myTurn: myTurn,
    currentPlayer: currentPlayer,
    nextPlayer: nextPlayer,
    gameFlow: gameFlow,
    canMove: canMove,
    setMove: setMove
    //displayMoveOrder: displayMoveOrder;
}

},{"./fleet.js":3,"./move.js":5}],7:[function(require,module,exports){
var fleet=require('./fleet.js');

// Config settings 
let ship_config = {
    aircraftCarrier : {
        size : 5,
        id : 'aircraftCarrier',
        color : 'Crimson',
        clickClass : 'acclicked',
        label : 'Aircraft Carrier',
	mask : 31,
    },
    battleship : {
        size : 4,
        id : 'battleship',
        color:'DarkGreen',
        clickClass : 'bsclicked',
        label : 'Battleship',
	mask: 15,
    },
    destroyer : {
        size : 3,
        id : 'destroyer',
        color:'CadetBlue',
        clickClass : 'declicked',
        label : 'Destroyer',
	mask: 7,
    },
    submarine  : {
        size : 3,
        id : 'submarine',
        color:'DarkRed',
        clickClass : 'suclicked',
        label : 'Submarine',
	mask : 7,
    },
    patrolBoat : {
        size : 2,
        id : 'patrolBoat',
        color:'Gold',
        clickClass : 'pbclicked',
        label : 'Patrol Boat',
	mask: 3,
    },
};

let hitCounter = {
    aircraftCarrier : 0,
    battleship : 0,
    destroyer : 0,
    submarine  : 0,
    patrolBoat : 0
};

let sunkCounter; // Tracks which boats have been sunk

// Values for determining bit values when a boat sinks
const airCraftCarrier = 1;
const battleship = 2;
const destroyer = 4;
const submarine = 8;
const patrolBoat = 16;

let setHitCounter = function (type, bit) {
	hitCounter[type] = ship_config[type].mask^(bit*bit);
	if (hitCounter[type] == ship_config[type].mask) { // I don't know if this is correct but the idea is check to see if the ship is sunk and flag it if need be
		setSunkCounter(type);
	}
}

let setSunkCounter = function (type) {
	sunkCounter = sunkCounter^type;
}

let getHitCounter = function (type){
	return hitCounter[type];
}

let getSunkCounter = function(){
	return sunkCounter;
}

// Ship constructor - shipyard???
function _ship(size, id, color, clickClass, label) {
        this.size        = size;
        this.id          = id;
        this.color       = color;
        this.clickClass  = clickClass;
        this.label       = label;

        return (this);
}

let ships={};

/*
 * The ship object holds the current orientation of the ship and the start coordinate (topmost/leftmost). When
 * there is a change to the ship the master matrix needs to be updated. An event will be triggered when there is
 * a coordinate change. This listener will update the master matrix. Calls to check location (move validtion, 
 * check if hit, etc.) will be made against the master matrix.
 */
/*
let shipIint = function(){
    addEventListener('shipMove',()) }

}
*/
// Public function to initially create ships object
let buildShips = function (){
    for (let s in ship_config){
        ships[s] = {size: ship_config[s].size, 
		    type: ship_config[s].id,
	            color: ship_config[s].color,
		    clickClass: ship_config[s].clickClass,
		    label: ship_config[s].label
	           };
    }
return ships;
}

let buildShip = function(type){
        ships[type] = _ship(ship_config[type].size, ship_config[type].id, ship_config[type].color, ship_config[type].clickClass, ship_config[type].label);
	return ships;
}

// Set value in ship object. 
let setShip = function(type, key, value){
        if (type && ships[type] && key) { // only attempt an update if there is a legit ship type and a key
            ships[type].key = value;
   }
}

// Return ship object if no type given otherwise return object containing just requested ship
let getShip = function (type){
    if(type){
        return ships[type];
    } else {
        return ships;
    }
}

// Private function to randomly determine ship's orientation along the X-axis or Y-axis. Only used when plotting ships for the first time.
function _getStartCoordinate(size){
    const start_orientation=Math.floor(Math.random()*10) > 5 ? 'x' : 'y';
    const start_x = start_orientation == 'x' ? _getRandomCoordinate(size) : _getRandomCoordinate(0);
    const start_y = start_orientation == 'y' ? _getRandomCoordinate(size) : _getRandomCoordinate(0);

    return {coordinate: start_x + '_' + start_y, orientation: start_orientation};
}

// Take ship size and orientation into account when determining the start range value. ex. don't
// let an aircraft carrier with an orientation of 'X' start at row 7 because it will max out over the
// grid size.
function _getRandomCoordinate(offset){
    const MAX_COORD = 10;
    return Math.floor(Math.random()*(MAX_COORD - offset));

}

// FIXME Does fleet.ghostShip do this now?
// Build an array of coordinates for a ship based on it's orientation, intended start point and size
let _shipString = function(s) {
	const o = s.orientation;
	const st = s.start_coordinate;
	let r = new Array;
        let t_pieces = st.split('_');
	const i = o == 'x' ? 0 : 1;

	for (let j=0; j < s.size;j++) {
		t_pieces[i] = t_pieces[i]+1;
		r.push (t_pieces[0] + '_' + t_pieces[1]);
	}
	return r;
}


/*
 * placeShips - Initial placement of ships on the board
 */
let placeShips = function placeShips(fleet){
        /* Randomly place ships on the grid. In order do this each ship must:
	 *   * Pick an orientation
	 *   * Pick a starting coordinate
	 *   * Validate that the coordinate is valid (does not run OOB, does not cross any other ship, etc.)
	 *   * If valid:
	 *   	* Save start coord and orientation as part of ship object
	 *   	* Plot ship on master matrix
	 */
	let shipList = getShip();
        for (var ship in shipList) {
            
            let start = _getStartCoordinate(shipList[ship].size); 
	    let ship_string = fleet.ghostShip(shipList[ship].type, start.coordinate, start.orientation);
	    shipList[ship].orientation = start.orientation;

            while (!fleet.validateShip(ship_string)) {
                start = _getStartCoordinate(shipList[ship].size); 
		shipList[ship].orientation = start.orientation;
		ship_string = fleet.ghostShip(shipList[ship].type, start.coordinate, start.orientation);
		}

            fleet.setFleet(start.orientation,
                       shipList[ship].type,
                       shipList[ship].size,
                       start.coordinate);
            }
};


module.exports = {
    buildShips: buildShips,
    buildShip: buildShip,
    getShip: getShip,
    setShip: setShip,
    placeShips: placeShips,
    setHitCounter: setHitCounter
}

},{"./fleet.js":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJhdHRsZXNoaXAuanMiLCJjb25maWcuanMiLCJmbGVldC5qcyIsImdyaWQuanMiLCJtb3ZlLmpzIiwicGxheWVyLmpzIiwic2hpcHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBncmlkID0gcmVxdWlyZSgnLi9ncmlkLmpzJyk7XHJcbnZhciBwbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllci5qcycpO1xyXG52YXIgc2hpcHMgPSByZXF1aXJlKCcuL3NoaXBzLmpzJyk7XHJcbnZhciBmbGVldCA9IHJlcXVpcmUoJy4vZmxlZXQuanMnKTtcclxudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnLmpzJyk7XHJcbnZhciBtb3ZlID0gcmVxdWlyZSgnLi9tb3ZlLmpzJyk7XHJcblxyXG5cclxucGxheWVyLmdhbWVGbG93KCk7XHJcblxyXG4vKiBSZWdpc3RlciAqL1xyXG4vLyBUT0RPIC0gYXR0YWNoIGhhbmRsZXIgdGhyb3VnaCBwdWc7IG1vdmUgaGFuZGxlcnMgdG8gYW5vdGhlciBtb2R1bGVcclxubGV0IHI9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyJyk7XHJcbnIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBcclxuICAgIGZ1bmN0aW9uKCl7XHJcblx0ICAgIHBsYXllci5yZWdpc3RlcigpO1xyXG5cdCAgICByZXR1cm47XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG5sZXQgZj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0RmxlZXQnKTtcclxuZi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0RmxlZXQnKS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWVyR3JpZCcpLnN0eWxlLmRpc3BsYXk9J2lubGluZSc7XHJcblx0Z3JpZC5zZXRNb3ZlU2hpcCgpOyBcclxuXHQgICAgcGxheUdhbWUoKTtcclxuXHQgICAgcmV0dXJuO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxuLy8gU2V0IHVwIGxpbmsgdG8gcmVzb2x2ZSBtb3Zlc1xyXG5sZXQgZD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZG9Nb3ZlcycpO1xyXG5kLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxcclxuXHRmdW5jdGlvbigpe1xyXG5cdFx0Ly8gUmVzb2x2ZSBvcmRlcnNcclxuXHRcdG1vdmUucmVzb2x2ZU1vdmVzKGZsZWV0LCBzaGlwcywgZ3JpZCk7XHJcblx0XHQvLyBSZXNldCBtb3Zlc1xyXG5cdFx0bW92ZS5jbGVhck1vdmVMaXN0KCk7XHJcblx0XHQvLyBUdXJuIG1vdmVzIG92ZXIgdG8gdGhlIG5leHQgcGxheWVyXHJcblx0XHQvLyBGSVhNRSAtIFNpbXVsYXRpbmcgbW92ZXMgZm9yIG5vdy4gUmVtb3ZlIHdoZW4gcmVhZHkgZm9yIHJlYWxzaWVzXHJcblxyXG5cdH0sIGZhbHNlKTtcclxuLy8gU2V0IHVwIGdyaWRcclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ215R3JpZCcpLmFwcGVuZENoaWxkKGdyaWQuY2xpY2thYmxlR3JpZCgxMCwgMTAsIHNoaXBzLCBmbGVldCwgcGxheWVyKSk7XHJcblxyXG4vLyBTZXQgdXAgZHJhZy9kcm9wIG9mIG1vdmVzXHJcbi8vZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXlPcmRlcicpLnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywndHJ1ZScpO1xyXG4vL3BsYXllci5wbGF5ZXJPcmRlckhhbmRsZXIoKTtcclxuXHJcbi8qIFNldCByYW5kb20gZmxlZXQgKi9cclxuc2hpcHMuYnVpbGRTaGlwcygpO1xyXG5zaGlwcy5wbGFjZVNoaXBzKGZsZWV0KTtcclxubGV0IHdob2xlRmxlZXQgPSBmbGVldC5nZXRXaG9sZUZsZWV0KGZsZWV0KTtcclxuZm9yICh0IGluIHdob2xlRmxlZXQpIHtcclxuXHRncmlkLmRpc3BsYXlTaGlwKHNoaXBzLCB0KTtcclxufVxyXG5cclxuLyogXHJcbiAqIE1vY2sgZ2FtZSB3aWxsIGJlIHJlbW92ZWQgXHJcbiAqL1xyXG5sZXQgbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdNZWdhblJlZycpO1xyXG5tLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXHJcbiAgICBmdW5jdGlvbigpe1xyXG4gICAgICAgIHBsYXllci5hY2NlcHRSZWcoJ01lZ2FuJywgMSwgZ3JpZCwgc2hpcHMsIGZsZWV0LCBwbGF5ZXIpO1xyXG4gICAgICAgIC8vbS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnTWVnYW5SZWcnKS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuXHQvL2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKGZsb3dbY3VycmVudEZsb3ddKS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuICAgICAgICAvL20uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpKTtcclxuICAgIH0sIGZhbHNlKTtcclxuXHJcbmxldCByeSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdSeWFuUmVnJyk7XHJcbnJ5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXHJcbiAgICBmdW5jdGlvbigpe1xyXG4gICAgICAgIHBsYXllci5hY2NlcHRSZWcoJ1J5YW4nLCAyLCBncmlkLCBzaGlwcywgZmxlZXQsIHBsYXllcik7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1J5YW5SZWcnKS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuICAgICAgICAvL2xldCByPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdSeWFuJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgLy9yLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKSk7XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG5sZXQgdHIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnVHJhY2V5UmVnJyk7XHJcbnRyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXHJcbiAgICBmdW5jdGlvbigpe1xyXG4gICAgICAgIHBsYXllci5hY2NlcHRSZWcoJ1RyYWNleScsIDIsIGdyaWQsIHNoaXBzLCBmbGVldCwgcGxheWVyKTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnVHJhY2V5UmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG4vKiBQbGF5IGdhbWUgKi9cclxuLypcclxud2hpbGUgKDEpIHtcclxuXHRwbGF5ZXIuZ2V0VHVybigpO1xyXG59XHJcbiovXHJcblxyXG5mdW5jdGlvbiBwbGF5R2FtZSgpe1xyXG5cdGlmIChwbGF5ZXIubXlUdXJuKGZsZWV0KSl7XHJcblx0XHQvL3dpbmRvdy5vcGVuKCcnLCdhdHRhY2snLCAnaGVpZ2h0PTIwMCx3aWR0aD0yMDAsbWVudWJhcj1ubyxzdGF0dXM9bm8sdGl0bGViYXI9bm8sdG9vbGJhcj1ubycsIGZhbHNlICk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29uZmlnIChjb25maWcpe1xyXG4gICAgc2hpcHMgPSB7XHJcbiAgICAgICAgYWlyY3JhZnRDYXJyaWVyIDoge1xyXG4gICAgICAgICAgICBzaXplIDogNSxcclxuICAgICAgICAgICAgaWQgOiAnYWlyY3JhZnRDYXJyaWVyJyxcclxuICAgICAgICAgICAgY29sb3IgOiAnQ3JpbXNvbicsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnYWNjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnQWlyY3JhZnQgQ2FycmllcicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBiYXR0bGVzaGlwIDoge1xyXG4gICAgICAgICAgICBzaXplIDogNCxcclxuICAgICAgICAgICAgaWQgOiAnYmF0dGxlc2hpcCcsXHJcbiAgICAgICAgICAgIGNvbG9yOidEYXJrR3JlZW4nLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ2JzY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ0JhdHRsZXNoaXAnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzdHJveWVyIDoge1xyXG4gICAgICAgICAgICBzaXplIDogMyxcclxuICAgICAgICAgICAgaWQgOiAnZGVzdHJveWVyJyxcclxuICAgICAgICAgICAgY29sb3I6J0NhZGV0Qmx1ZScsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnZGVjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnRGVzdHJveWVyJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1hcmluZSAgOiB7XHJcbiAgICAgICAgICAgIHNpemUgOiAzLFxyXG4gICAgICAgICAgICBpZCA6ICdzdWJtYXJpbmUnLFxyXG4gICAgICAgICAgICBjb2xvcjonRGFya1JlZCcsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnc3VjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnU3VibWFyaW5lJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhdHJvbEJvYXQgOiB7XHJcbiAgICAgICAgICAgIHNpemUgOiAyLFxyXG4gICAgICAgICAgICBpZCA6ICdwYXRyb2xCb2F0JyxcclxuICAgICAgICAgICAgY29sb3I6J0dvbGQnLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ3BiY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ1BhdHJvbCBCb2F0JyxcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxufVxyXG4iLCJ2YXIgc2hpcHM9cmVxdWlyZSgnLi9zaGlwcy5qcycpO1xuXG5sZXQgbmF1dGljYWxNYXAgPSB7fTsgLy8gSGFzaCBsb29rdXAgdGhhdCB0cmFja3MgZWFjaCBzaGlwJ3Mgc3RhcnRpbmcgcG9pbnQgYW5kIGN1cnJlbnQgb3JpZW50YXRpb25cblxubGV0IGJ1aWxkTmF1dGljYWxDaGFydCA9IGZ1bmN0aW9uKCl7XG5cdGxldCBjaGFydCA9IG5ldyBBcnJheTtcblx0Zm9yKGxldCBpPTA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0Y2hhcnRbaV0gPSBuZXcgQXJyYXk7XG5cdFx0Zm9yIChsZXQgaj0wOyBqIDwgMTA7IGorKyl7XG5cdFx0XHRjaGFydFtpXVtqXSA9IHVuZGVmaW5lZDsvL25ldyBBcnJheTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGNoYXJ0O1xufVxuXG5sZXQgbmF1dGljYWxDaGFydCA9IGJ1aWxkTmF1dGljYWxDaGFydCgpOyAvLyBEZXRhaWxlZCBtYXRyaXggb2YgZXZlcnkgc2hpcCBpbiB0aGUgZmxlZXRcblxubGV0IGdldEZsZWV0ID0gZnVuY3Rpb24odHlwZSl7XG5cdGxldCBvcmllbnRhdGlvbiA9IG5hdXRpY2FsTWFwW3R5cGVdLm9yaWVudGF0aW9uID09ICd4JyA/IDAgOiAxO1xuXG5cdGxldCBwaWVjZXMgPSBuYXV0aWNhbE1hcFt0eXBlXS5zdGFydF9jb29yZC5zcGxpdCgnXycpO1xuXHRsZXQgcmV0ID0gbmV3IEFycmF5O1xuXG5cdHdoaWxlIChwaWVjZXNbb3JpZW50YXRpb25dIDwgbmF1dGljYWxDaGFydFtvcmllbnRhdGlvbl0ubGVuZ3RoICYmIG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSA9PSB0eXBlKSB7XG5cdFx0cmV0LnB1c2ggKHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXSk7XG5cdFx0cGllY2VzW29yaWVudGF0aW9uXSA9IHBhcnNlSW50KHBpZWNlc1tvcmllbnRhdGlvbl0sIDEwKSArIDE7XG5cdH1cblxuXHRyZXR1cm4gKHJldCk7XG59XG5cbmxldCBnZXRXaG9sZUZsZWV0ID0gZnVuY3Rpb24oKXtcblx0bGV0IHJldD17fTtcblx0Zm9yICh0IGluIG5hdXRpY2FsTWFwKSB7XG5cdFx0cmV0W3RdID0gZ2V0RmxlZXQodCk7XG5cdH1cblx0cmV0dXJuIHJldDtcbn1cblxuLy8gVE9ETyAtIHNldEZsZWV0OiBSZW1vdmUgcHJldmlvdXMgc2hpcCBmcm9tIGNoYXJ0IC0tIG1heSBiZSBkb25lLi4ubmVlZHMgdGVzdFxuLypcbiAqIHNldEZsZWV0IC0gcGxhY2Ugc2hpcCBvbiBuYXV0aWNhbCBjaGFydFxuICovXG5sZXQgc2V0RmxlZXQgPSBmdW5jdGlvbiAob3JpZW50YXRpb24sIHR5cGUsIHNpemUsIHN0YXJ0X2Nvb3JkLCBvZmZzZXQpe1xuICAgIGxldCBwaWVjZXMgPSBzdGFydF9jb29yZC5zcGxpdCgnXycpO1xuICAgIGxldCBpbmRleCA9IChvcmllbnRhdGlvbiA9PSAneCcpID8gMCA6IDE7XG5cbiAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuICAgIC8vIEFkanVzdCBmb3IgZHJhZy9kcm9wIHdoZW4gcGxheWVyIHBpY2tzIGEgc2hpcCBwaWVjZSBvdGhlciB0aGFuIHRoZSBoZWFkLlxuICAgIHBpZWNlc1tpbmRleF0gPSBwYXJzZUludChwaWVjZXNbaW5kZXhdLCAxMCkgLSBvZmZzZXQ7XG5cbiAgICAvKlxuICAgICAqIFJlbW92ZSBvbGQgc2hpcCBmcm9tIG5hdXRpY2FsQ2hhcnQvTWFwXG4gICAgICovXG4gICAgX2NsZWFyU2hpcCh0eXBlLCBzaXplKTtcblxuICAgIC8vIHNldCB0aGUgbmF1dGljYWwgbWFwIHZhbHVlIGZvciB0aGlzIGJvYXRcbiAgICBuYXV0aWNhbE1hcFt0eXBlXT17XG5cdCAgICBvcmllbnRhdGlvbjogb3JpZW50YXRpb24sXG5cdCAgICBzdGFydF9jb29yZDogcGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdXG4gICAgfTtcblxuICAgIGZvciAodmFyIGk9MDsgaSA8IHNpemU7IGkrKykge1xuXHRuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gPSB0eXBlO1xuXHRwaWVjZXNbaW5kZXhdPSBwYXJzZUludChwaWVjZXNbaW5kZXhdLCAxMCkgKzE7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfY2xlYXJTaGlwKHR5cGUsIHNpemUpe1xuICAgIGxldCBtYXAgPSBuYXV0aWNhbE1hcFt0eXBlXTtcbiAgICBpZiAobWFwID09PSB1bmRlZmluZWQpe3JldHVybiBmYWxzZTt9XG5cbiAgICBsZXQgcGllY2VzID0gbWFwLnN0YXJ0X2Nvb3JkLnNwbGl0KCdfJyk7XG4gICAgbGV0IGluZGV4ID0gKG1hcC5vcmllbnRhdGlvbiA9PSAneCcpID8gMCA6IDE7XG5cbiAgICBmb3IgKGk9MDsgaSA8IHNpemU7IGkrKykge1xuXHQgICAgbmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldPXVuZGVmaW5lZDtcblx0ICAgIHBpZWNlc1tpbmRleF0rKztcbiAgICB9XG5cbiAgICBkZWxldGUgbmF1dGljYWxNYXBbdHlwZV07XG5cbn1cblxuLypcbiAqIGdob3N0U2hpcCAtIEJlZm9yZSBwdXR0aW5nIGEgc2hpcCBvbiB0aGUgY2hhcnQgaXQncyBwb3RlbnRpYWwgbG9jYXRpb24gbmVlZHMgdG8gYmUgcGxvdHRlZCBzbyBpdCBjYW4gYmVcbiAqIGNoZWNrZWQgZm9yIHZhbGlkaXR5LiBHaXZlbiBhIHNoaXAgdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiB0aGUgcG90ZW50aWFsIHBsb3R0ZWQgY29vcmRpbmF0ZXMuIFRoZSBmdW5jdGlvblxuICogbWF5IGJ1aWxkIGNvb3JkaW5hdGVzIGZvciBhIGtub3duIHNoaXAgb3IgZm9yIG9uZSBtb3ZlZCBhcm91bmQgb24gdGhlIGdyaWQuXG4gKi9cbmxldCBnaG9zdFNoaXAgPSBmdW5jdGlvbih0eXBlLCBjb29yZGluYXRlLCBvcmllbnRhdGlvbiwgc2l6ZSwgb2Zmc2V0KXtcblx0bGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xuXHRsZXQgdGhpc1NoaXAgPSByZWFkTWFwKHR5cGUpO1xuXHRsZXQgZ2hvc3QgPSBbXTtcblx0Y29vcmRpbmF0ZSA9IGNvb3JkaW5hdGUgfHwgdGhpc1NoaXAuc3RhcnRfY29vcmQ7XG5cdG9yaWVudGF0aW9uID0gb3JpZW50YXRpb24gfHwgdGhpc1NoaXAub3JpZW50YXRpb247XG5cdHNpemUgPSBzaXplIHx8IHNoaXAuc2l6ZTtcblx0b2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XG5cblx0bGV0IHBpZWNlcyA9IGNvb3JkaW5hdGUuc3BsaXQoJ18nKTtcblx0bGV0IGluZGV4ID0gKG9yaWVudGF0aW9uID09ICd4JykgPyAwOiAxO1xuXHRwaWVjZXNbaW5kZXhdID0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApIC0gb2Zmc2V0O1xuXHRmb3IgKGxldCBpPTA7IGkgPCBzaXplOyBpKyspIHtcblx0XHRnaG9zdC5wdXNoKHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXSk7XG5cdFx0cGllY2VzW2luZGV4XSA9IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSArMTtcblx0fVxuXHRyZXR1cm4gZ2hvc3Q7XG59O1xuXG5sZXQgcmVhZE1hcCA9IGZ1bmN0aW9uKHR5cGUpe1xuXHRyZXR1cm4gbmF1dGljYWxNYXBbdHlwZV07XG59XG5cbi8qXG4gKiBHaXZlbiBhIGNvb3JkaW5hdGUgb3IgYW4gYXJyYXkgb2YgY29vcmRpbmF0ZXMgcmV0dXJuIHRoZSBzYW1lIHN0cnVjdHVyZSByZXZlYWxpbmcgdGhlIGNvbnRlbnRzIG9mIHRoZSBncmlkLlxuICogV2lsbCByZXR1cm4gYSB2YWx1ZSBvZiBmYWxzZSBpZiB0aGVyZSBpcyBhIHByb2JsZW0gY2hlY2tpbmcgdGhlIGdyaWQgKGV4LiBjb29yZHMgYXJlIG91dCBvZiByYW5nZSkuXG4gKi9cbmxldCBjaGVja0dyaWQgPSBmdW5jdGlvbihjb29yZGluYXRlcyl7XG5cdGlmIChjb29yZGluYXRlcyBpbnN0YW5jZW9mIEFycmF5KXtcblx0XHRsZXQgcmV0ID0gbmV3IEFycmF5O1xuXHRcdGZvcihjIGluIGNvb3JkaW5hdGVzKXtcblx0XHRcdGxldCBzID0gX3NldENoYXJ0KGNvb3JkaW5hdGVzW2NdKTtcblx0XHRcdGlmIChzID09PSBmYWxzZSkge3JldHVybiBmYWxzZX07XG5cdFx0XHRyZXQucHVzaCAocyk7XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIF9zZXRDaGFydChjb29yZGluYXRlcyk7XG5cdH1cbn07XG5cbmxldCBfc2V0Q2hhcnQgPSBmdW5jdGlvbihjb29yZGluYXRlKXtcblx0bGV0IHBpZWNlcyA9IGNvb3JkaW5hdGUuc3BsaXQoJ18nKTtcblx0aWYgKHBhcnNlSW50KHBpZWNlc1swXSwgMTApID49IG5hdXRpY2FsQ2hhcnQubGVuZ3RoIHx8XG5cdCAgICBwYXJzZUludChwaWVjZXNbMV0sIDEwKT49IG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldLmxlbmd0aCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJldHVybiBuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV07XG59O1xuXG4vKiBcbiAqIEdpdmVuIGEgbGlzdCBvZiBjb29yZGluYXRlcyBhbmQgYSBzaGlwIHR5cGUgdmFsaWRhdGUgdGhhdCB0aGUgY29vcmRpbmF0ZXMgZG8gbm90IHZpb2xhdGUgdGhlIHJ1bGVzIG9mOlxuICogXHQqIHNoaXAgbXVzdCBiZSBvbiB0aGUgZ3JpZFxuICogXHQqIHNoaXAgbXVzdCBub3Qgb2NjdXB5IHRoZSBzYW1lIHNxdWFyZSBhcyBhbnkgb3RoZXIgc2hpcFxuICovXG5sZXQgdmFsaWRhdGVTaGlwID0gZnVuY3Rpb24gKGNvb3JkaW5hdGVzLCB0eXBlKXtcbiAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIG90aGVyIGJvYXRzIGFscmVhZHkgb24gYW55IGEgc3BhY2VcbiAgICBmb3IgKHZhciBwPTA7IHAgPCBjb29yZGluYXRlcy5sZW5ndGg7IHArKykge1xuXG5cdC8vIElzIHRoZXJlIGEgY29sbGlzaW9uP1xuXHRsZXQgZ3JpZCA9IGNoZWNrR3JpZChjb29yZGluYXRlcyk7XG5cdFxuXHRpZiAoZ3JpZCA9PSBmYWxzZSkge3JldHVybiBmYWxzZX07IC8vIElmIGNoZWNrR3JpZCByZXR1cm5zIGZhbHNlIGNvb3JkaW5hdGVzIGFyZSBvdXQgb2YgcmFuZ2VcblxuXHRmb3IgKGMgaW4gY29vcmRpbmF0ZXMpIHtcblx0XHRsZXQgcGllY2VzID0gY29vcmRpbmF0ZXNbY10uc3BsaXQoJ18nKTtcblx0XHRcdGlmIChuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gIT0gdHlwZSAmJlxuXHRcdFx0ICAgIG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSAhPSB1bmRlZmluZWQpIHtyZXR1cm4gZmFsc2V9O1xuXHR9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZXRGbGVldDogZ2V0RmxlZXQsXG4gICAgc2V0RmxlZXQ6IHNldEZsZWV0LFxuICAgIGdldFdob2xlRmxlZXQ6IGdldFdob2xlRmxlZXQsXG4gICAgdmFsaWRhdGVTaGlwOiB2YWxpZGF0ZVNoaXAsXG4gICAgY2hlY2tHcmlkOiBjaGVja0dyaWQsXG4gICAgYnVpbGROYXV0aWNhbENoYXJ0OiBidWlsZE5hdXRpY2FsQ2hhcnQsXG4gICAgZ2hvc3RTaGlwOiBnaG9zdFNoaXAsXG59XG4iLCJsZXQgZmxlZXQgPSByZXF1aXJlKCcuL2ZsZWV0Jyk7XHJcbmxldCBzaGlwcyA9IHJlcXVpcmUoJy4vc2hpcHMnKTtcclxuXHJcbmxldCBtb3ZlU2hpcCA9IGZ1bmN0aW9uKHNoaXBzLCBkcm9wT2JqLCBldiwgZmxlZXQsIHBsYXllcil7XHJcbiAgICBjb25zb2xlLmxvZygncHJlLXNldCBmbGVldCBtb3ZlJyk7XHJcbiAgICBsZXQgc2hpcD1zaGlwcy5nZXRTaGlwKGRyb3BPYmoudHlwZSk7XHJcbiAgICAvLyBSZW1vdmUgaW5pdGlhbCBpbWFnZVxyXG4gICAgZGlzcGxheVNoaXAoc2hpcHMsIGRyb3BPYmoudHlwZSk7XHJcblxyXG4gICAgZmxlZXQuc2V0RmxlZXQgKGRyb3BPYmoub3JpZW50YXRpb24sIGRyb3BPYmoudHlwZSwgc2hpcC5zaXplLCBldi50YXJnZXQuaWQsIGRyb3BPYmoub2Zmc2V0KTsgXHJcblxyXG4gICAgLy8gUmVkcmF3IGltYWdlIGluIG5ldyBsb2NhdGlvblxyXG4gICAgZGlzcGxheVNoaXAoc2hpcHMsIGRyb3BPYmoudHlwZSk7XHJcbn1cclxuXHJcbi8qXHJcbiAqIENhbGxlZCBhZnRlciBwbGF5ZXIgc2V0cyBpbml0aWFsIGZsZWV0LiBPdmVyd3JpdGUgdGhlIG1vdmVTaGlwIGZ1bmN0aW9uIHNvIGl0IGJlaGF2ZXMgZGlmZmVyZW50LlxyXG4gKi9cclxubGV0IHNldE1vdmVTaGlwID0gZnVuY3Rpb24oKXtcclxuXHQvKiBjaGFuZ2UgdmFsdWUgb2YgbW92ZVNoaXAgZnVuY3Rpb24gKi9cclxuXHRtb3ZlU2hpcCA9IGZ1bmN0aW9uKHNoaXBzLCBkcm9wT2JqLCBldiwgZmxlZXQsIHBsYXllciwgZHJvcFNoaXAsIG1vdmVUeXBlKXtcclxuXHQgICAgY29uc29sZS5sb2coJ0luIGdhbWUgbW92ZScpO1xyXG5cdCAgICAvLyBSZW1vdmUgaW5pdGlhbCBpbWFnZVxyXG5cdCAgICBkaXNwbGF5U2hpcChzaGlwcywgZHJvcE9iai50eXBlKTtcclxuXHJcblx0ICAgIC8vIGRyYXcgaW1hZ2UgYmFzZWQgb24gZHJvcFNoaXBcclxuXHQgICAgZGlzcGxheVNoaXAoc2hpcHMsIGRyb3BPYmoudHlwZSwgZHJvcFNoaXApO1xyXG5cclxuXHQgICAgLy8gU3RvcmUgZ2hvc3RTaGlwIGluIG1vdmUgb2JqZWN0XHJcblx0ICAgIHBsYXllci5zZXRNb3ZlKHt0eXBlOiBtb3ZlVHlwZSwgY29vcmRpbmF0ZTogZXYudGFyZ2V0LmlkLCBnaG9zdDogZHJvcFNoaXAsIG9yaWVudGF0aW9uOiBkcm9wT2JqLm9yaWVudGF0aW9uLCBzaGlwVHlwZTogZHJvcE9iai50eXBlLCBzaGlwczogc2hpcHMsIGdyaWQ6IHRoaXN9KTtcclxuXHR9XHJcbn1cclxuXHJcbi8qXHJcbiAqIEJ1aWxkIHRoZSBncmlkIGFuZCBhdHRhY2ggaGFuZGxlcnMgZm9yIGRyYWcvZHJvcCBldmVudHNcclxuICovXHJcbmxldCBjbGlja2FibGVHcmlkID0gZnVuY3Rpb24gKCByb3dzLCBjb2xzLCBzaGlwcywgZmxlZXQsIHBsYXllciwgcGhhbmRsZSl7XHJcbiAgICBsZXQgZ3JpZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICBncmlkLmNsYXNzTmFtZT0nZ3JpZCc7XHJcbiAgICBmb3IgKHZhciByPTA7cjxyb3dzOysrcil7XHJcbiAgICAgICAgdmFyIHRyID0gZ3JpZC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpKTtcclxuICAgICAgICBmb3IgKHZhciBjPTA7Yzxjb2xzOysrYyl7XHJcbiAgICAgICAgICAgIHZhciBjZWxsID0gdHIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKSk7XHJcbiAgICAgICAgICAgIC8vIEVhY2ggY2VsbCBvbiB0aGUgZ3JpZCBpcyBvZiBjbGFzcyAnY2VsbCdcclxuICAgICAgICAgICAgY2VsbC5jbGFzc05hbWU9J2NlbGwnO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHRoZSBJRCB2YWx1ZSBvZiBlYWNoIGNlbGwgdG8gdGhlIHJvdy9jb2x1bW4gdmFsdWUgZm9ybWF0dGVkIGFzIHJfY1xyXG4gICAgICAgICAgICBjZWxsLmlkID0gciArICdfJyArIGM7XHJcblxyXG4gICAgICAgICAgICBpZiAocGhhbmRsZSA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgX3NldE15TGlzdGVuZXJzKGNlbGwsIHNoaXBzLCBmbGVldCwgcGxheWVyKVxyXG5cdCAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICBfc2V0UGxheWVyTGlzdGVuZXJzKHBsYXllciwgY2VsbCwgcGhhbmRsZSk7XHJcblx0ICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZ3JpZDtcclxufVxyXG5cclxuZnVuY3Rpb24gX3NldE15TGlzdGVuZXJzKGNlbGwsIHNoaXBzLCBmbGVldCwgcGxheWVyKXtcclxuICAgICAgICAgICAgLy8gU2V0IHVwIGRyYWcgYW5kIGRyb3AgZm9yIGVhY2ggY2VsbC5cclxuICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsJ3RydWUnKTtcclxuXHJcblxyXG4gICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkPSdtb3ZlJztcclxuXHRcdCAgICBsZXQgdHlwZSA9IF9nZXRUeXBlQnlDbGFzcyhzaGlwcywgdGhpcy5jbGFzc05hbWUpO1xyXG5cdFx0ICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHdoaWNoIHNxdWFyZSB3YXMgY2xpY2tlZCB0byBndWlkZSBwbGFjZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3RhcnQgPSBfZmluZF9zdGFydCh0aGlzLmlkLCBzaGlwLm9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dC9wbGFpblwiLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiAgICAgICAgc3RhcnQub2Zmc2V0LFxyXG5cdFx0XHRcdCAgICAgICAgc3RhcnRfY29vcmQ6ICAgc3RhcnQuc3RhcnRfY29vcmQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogICAgICAgICBzaGlwLnNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAgICAgICAgICB0eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb29yZDogZmxlZXQuZ2hvc3RTaGlwKHR5cGUsIHN0YXJ0LnN0YXJ0X2Nvb3JkKSxcclxuXHRcdFx0XHQgICAgICAgIG9yaWVudGF0aW9uOiAgIHNoaXAub3JpZW50YXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBEcmFnL0Ryb3AgY2FwYWJpbGl0aWVzXHJcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkcm9wcGluZycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkcm9wT2JqID0gSlNPTi5wYXJzZShldi5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvcGxhaW5cIikpO1xyXG5cdFx0ICAgIGNvbnNvbGUubG9nKCdjdXJyZW50IGNvb3JkOiAnLCBkcm9wT2JqLmN1cnJlbnRfY29vcmQpO1xyXG5cdFx0ICAgIGxldCBzaGlwPXNoaXBzLmdldFNoaXAoZHJvcE9iai50eXBlKTtcclxuXHRcdCAgICBsZXQgZHJvcFNoaXAgPSBmbGVldC5naG9zdFNoaXAoZHJvcE9iai50eXBlLCBldi50YXJnZXQuaWQsIGRyb3BPYmoub3JpZW50YXRpb24sIHNoaXAuc2l6ZSwgZHJvcE9iai5vZmZzZXQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihmbGVldC52YWxpZGF0ZVNoaXAoZHJvcFNoaXAsIGRyb3BPYmoudHlwZSkpIHtcclxuXHRcdFx0ICAgIC8qIFRoZXJlIGFyZSBkaWZmZXJlbnQgYmVoYXZpb3JzIGZvciBzZXR0aW5nIHNoaXBzIGJhc2VkIG9uIHRoZSBpbml0aWFsIGxvYWRpbmcgb2YgdGhlIHNoaXBzXHJcblx0XHRcdCAgICAgKiB2ZXJzdXMgbW92aW5nIGEgc2hpcCBpbiBnYW1lLiBXaGVuIG1vdmluZyBzaGlwcyBpbiBnYW1lIHRoZSBkaXNwbGF5IHNob3VsZCBjaGFuZ2UgdG8gcmVmbGVjdFxyXG5cdFx0XHQgICAgICogdGhlIHBvdGVudGlhbCBtb3ZlIGJ1dCB0aGUgaW50ZXJuYWwgc3RydWN0dXJlcyBzaG91bGQgbm90IGNoYW5nZSB1bnRpbCBpdCBoYXMgYmVlbiB2YWxpZGF0ZWRcclxuXHRcdFx0ICAgICAqIHdoZW4gcmVzb2x2aW5nIG1vdmVzLlxyXG5cdFx0XHQgICAgICpcclxuXHRcdFx0ICAgICAqIFdoZW4gc2V0dGluZyB1cCBzaGlwcyBmb3IgdGhlIGluaXRpYWwgZ2FtIHRoZSBzdHJ1Y3R1cmVzIHNob3VsZCBjaGFuZ2UgYWxvbmcgd2l0aCB0aGUgZGlzcGxheSxcclxuXHRcdFx0ICAgICAqIGFsbCBhdCBvbmNlLlxyXG5cdFx0XHQgICAgICpcclxuXHRcdFx0ICAgICAqIFRoZSBmdW5jdGlvbiBtb3ZlU2hpcCBpcyBhIGNsb3N1cmUgd2hvc2UgdmFsdWUgaXMgY2hhbmdlZCBvbmNlIHRoZSBwbGF5ZXIgc2V0cyB0aGUgaW5pdGlhbCBmbGVldC5cclxuXHRcdFx0ICAgICAqL1xyXG5cdFx0XHQgICAgaWYocGxheWVyLmNhbk1vdmUoKSkge21vdmVTaGlwKHNoaXBzLCBkcm9wT2JqLCBldiwgZmxlZXQsIHBsYXllciwgZHJvcFNoaXAsICdtb3ZlJyl9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkcmFnb3ZlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXYuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3Q9J21vdmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApKTtcclxuXHJcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoXHJcblx0XHRmdW5jdGlvbihlKXtcclxuXHRcdCAgICBsZXQgZHJvcCA9IHt9O1xyXG5cdFx0ICAgIGxldCB0eXBlID0gX2dldFR5cGVCeUNsYXNzKHNoaXBzLCB0aGlzLmNsYXNzTmFtZSk7XHJcblx0XHQgICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdGFydCA9IF9maW5kX3N0YXJ0KGUudGFyZ2V0LmlkLCBzaGlwLm9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHR5cGUpO1xyXG5cdFx0ICAgIGxldCBvcmllbnRhdGlvbiA9IChzaGlwLm9yaWVudGF0aW9uID09ICd4JykgPyAneSc6J3gnOyAvLyBmbGlwIHRoZSBvcmllbnRhdGlvblxyXG5cdFx0ICAgIC8vbGV0IGdob3N0ID0gZmxlZXQuZ2hvc3RTaGlwKHR5cGUsIGUudGFyZ2V0LmlkLCBvcmllbnRhdGlvbiwgc2hpcC5zaXplLCBzdGFydC5vZmZzZXQpO1xyXG5cdFx0ICAgIGxldCBnaG9zdCA9IGZsZWV0Lmdob3N0U2hpcCh0eXBlLCBlLnRhcmdldC5pZCwgb3JpZW50YXRpb24sIHNoaXAuc2l6ZSwgc3RhcnQub2Zmc2V0KTtcclxuXHJcblx0XHQgICAgZHJvcC50eXBlID0gdHlwZTtcclxuXHRcdCAgICBkcm9wLm9mZnNldCA9IHN0YXJ0Lm9mZnNldDtcclxuXHRcdCAgICBkcm9wLm9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGZsZWV0LnZhbGlkYXRlU2hpcChnaG9zdCwgdHlwZSkpIHtcclxuXHRcdFx0aWYocGxheWVyLmNhbk1vdmUoKSkge1xyXG5cdFx0ICAgICAgICAgICAgc2hpcC5vcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xyXG5cdFx0XHQgICAgbW92ZVNoaXAoc2hpcHMsIGRyb3AsIGUsIGZsZWV0LCBwbGF5ZXIsIGdob3N0LCAncGl2b3QnKX07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBfc2V0UGxheWVyTGlzdGVuZXJzKHBsYXllciwgY2VsbCwgaGFuZGxlKXtcclxuICAgICAgICAgICAgLy8gU2V0IHRoZSBJRCB2YWx1ZSBvZiBlYWNoIGNlbGwgdG8gdGhlIHJvdy9jb2x1bW4gdmFsdWUgZm9ybWF0dGVkIGFzIHJfY1xyXG4gICAgICAgICAgICBjZWxsLmlkID0gaGFuZGxlICsgJ18nICsgY2VsbC5pZDtcclxuICAgICAgICAgICAgLy8gU2V0IHVwIGRyYWcgYW5kIGRyb3AgZm9yIGVhY2ggY2VsbC5cclxuXHJcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoXHJcblx0XHRmdW5jdGlvbihlKXtcclxuXHRcdCAgICBpZihwbGF5ZXIuY2FuTW92ZSgpKSB7XHJcblx0XHQgICAgICAgIHBsYXllci5zZXRNb3ZlKHt0eXBlOiAnYXR0YWNrJyxcclxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGU6IGUudGFyZ2V0LmlkfSk7XHJcblx0XHQgICAgICAgIGNvbnNvbGUubG9nKCBlLnRhcmdldC5pZCArICcgaXMgdW5kZXIgYXR0YWNrJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cdFx0fVxyXG4gICAgICAgICAgICApKTtcclxufVxyXG5cclxuLypcclxuICogX2ZpbmRfc3RhcnQgLSBEZXRlcm1pbmUgdGhlIHN0YXJ0aW5nIGNvb3JkaW5hdGUgb2YgYSBzaGlwIGdpdmVuIHRoZSBzcXVhcmUgdGhhdCB3YXMgY2xpY2tlZC4gRm9yIGV4YW1wbGVcclxuICogaXQgaXMgcG9zc2libGUgdGhhdCBhIGJhdHRsZXNoaXAgYWxvbmcgdGhlIHgtYXhpcyB3YXMgY2xpY2tlZCBhdCBsb2NhdGlvbiAzXzMgYnV0IHRoYXQgd2FzIHRoZSBzZWNvbmQgc3F1YXJlXHJcbiAqIG9uIHRoZSBzaGlwLiBUaGlzIGZ1bmN0aW9uIHdpbGwgaWRlbnRpZnkgdGhhdCB0aGUgYmF0dGxlc2hpcCBzdGFydHMgYXQgMl8zLlxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIF9maW5kX3N0YXJ0KHN0YXJ0X3Bvcywgb3JpZW50YXRpb24sIHNpemUsIHR5cGUpe1xyXG4gICAgbGV0IGluZGV4ID0gKG9yaWVudGF0aW9uID09ICd4JykgPyAwIDogMTtcclxuXHJcbiAgICBsZXQgcGllY2VzPXN0YXJ0X3Bvcy5zcGxpdCgnXycpO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcblxyXG4gICAgZm9yIChpPTA7IGkgPCBzaXplOyBpKyspIHtcclxuXHRpZiAocGllY2VzW2luZGV4XSA9PSAwKSB7YnJlYWs7fVxyXG4gICAgICAgIHBpZWNlc1tpbmRleF0tLTtcclxuXHRsZXQgZyA9IGZsZWV0LmNoZWNrR3JpZChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xyXG4gICAgICAgIC8vaWYgKGcgIT0gdW5kZWZpbmVkICYmIGcgPT0gdHlwZSAmJiBnICE9IGZhbHNlKXtcclxuICAgICAgICBpZiAoZyA9PSB0eXBlICYmIGcgIT0gZmFsc2Upe1xyXG5cdCAgICBvZmZzZXQrKztcclxuICAgICAgICAgICAgc3RhcnRfcG9zID0gcGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge3N0YXJ0X3Bvczogc3RhcnRfcG9zLCBvZmZzZXQ6IG9mZnNldH07XHJcbn1cclxuXHJcbmxldCBkaXNwbGF5U2hpcCA9IGZ1bmN0aW9uIChzaGlwcywgdHlwZSwgYykge1xyXG4gICAgbGV0IGNvb3JkaW5hdGVzID0gYyB8fCBmbGVldC5nZXRGbGVldCh0eXBlKTtcclxuICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuXHJcbiAgICBmb3IgKGNvb3JkIGluIGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgX3NldFNwYWNlKGNvb3JkaW5hdGVzW2Nvb3JkXSwgc2hpcC5jbGlja0NsYXNzKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gX3NldFNwYWNlKHNwYWNlLCBjbGFzc05hbWUpIHtcclxuICAgIHZhciBiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3BhY2UpOyBcclxuICAgIGIuY2xhc3NMaXN0LnRvZ2dsZShjbGFzc05hbWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBfZ2V0VHlwZUJ5Q2xhc3Moc2hpcHMsIGNsYXNzTmFtZSl7XHJcblx0bGV0IHNoaXBMaXN0ID0gc2hpcHMuZ2V0U2hpcCgpO1xyXG5cdGZvciAocyBpbiBzaGlwTGlzdCl7XHJcblx0XHRpZiAoY2xhc3NOYW1lLm1hdGNoKHNoaXBMaXN0W3NdLmNsaWNrQ2xhc3MpKXtcclxuXHRcdFx0cmV0dXJuIHNoaXBMaXN0W3NdLnR5cGU7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cz17XHJcbiAgICBjbGlja2FibGVHcmlkOiBjbGlja2FibGVHcmlkLFxyXG4gICAgZGlzcGxheVNoaXA6IGRpc3BsYXlTaGlwLFxyXG4gICAgc2V0TW92ZVNoaXA6IHNldE1vdmVTaGlwXHJcbn1cclxuXHJcbiIsIi8vIE1vZHVsZSB0byBtYW5hZ2UgbW92ZXMgb24gcGxheWVyJ3MgdHVybi5cblxubGV0IGZsZWV0ID0gcmVxdWlyZSgnLi9mbGVldC5qcycpO1xuXG5sZXQgbW92ZUxpc3QgPSBbXTtcbmxldCBtb3ZlTWFwID0ge307XG5cbmxldCBkZWxldGVNb3ZlID0gZnVuY3Rpb24oKXtcbn1cblxubGV0IGNsZWFyTW92ZUxpc3QgPSBmdW5jdGlvbigpIHtcblx0bW92ZUxpc3QgPSBbXTtcbn1cblxuLypcbiAqIENyZWF0ZSBhIGJsb2NrIHRvIHZpc3VhbGx5IHJlcHJlc2VudCBhIG1vdmUuIEdlbmVyaWMgSFRNTCBibG9jayBmb3IgbW92ZSBvYmplY3RzOlxuICogPGRpdiBpZD08dHlwZT5fPHBsYXllcj5fPGNvb3Jkcz4gY2xhc3M9XCJtb3ZlXCI+XG4gKiAgIDxkaXYgY2xhc3M9XCJtb3ZlRGV0YWlsXCI+XG4gKiAgICAgYXR0YWNrOiBtZWdhbl8wXzAgKCogTW92ZSB0ZXh0ICopYFxuICogICAgIDxkaXYgY2xhc3M9XCJkZWxldGVcIj5kZWxldGU8L2Rpdj4gPCEtLSBlbGVtZW50IHRvIGRlbGV0ZSBtb3ZlIGJlZm9yZSBzdWJtaXR0ZWQgLS0+XG4gKiAgIDwvZGl2PlxuICogPC9kaXY+XG4gKiBcbiAqL1xubGV0IG1vdmVMaXN0QmxvY2sgPSBmdW5jdGlvbihtb3ZlKSB7XG5cdGxldCBtb3ZlU3RydWN0PXt9O1xuXHRsZXQgbXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0bW92ZVN0cnVjdC5pZCA9IG12LmlkID0gbW92ZS50eXBlICsgJ18nICsgbW92ZS5jb29yZGluYXRlO1xuXHRtdi5jbGFzc05hbWUgPSAnbW92ZSc7XG5cblx0bW92ZS51bmRvID0gZmxlZXQuZ2hvc3RTaGlwKG1vdmUuc2hpcFR5cGUpO1xuXG4gICAgICAgIG12LnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywndHJ1ZScpO1xuXHRtb3ZlT3JkZXJIYW5kbGVyKG12KTtcblxuXHRsZXQgbW92ZVN0cmluZyA9IG1vdmUudHlwZSArICc6ICcgKyBtb3ZlLmNvb3JkaW5hdGU7XG5cdGxldCBtZHRsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdG1kdGwuaW5uZXJIVE1MPW1vdmVTdHJpbmc7XG5cblx0bGV0IG1kZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0bWRlbC5pbm5lckhUTUw9J0RlbGV0ZSc7XG5cdG1kZWwuaWQgPSAnZGVsXycgKyBtdi5pZDtcblx0X3NldF9tdkxpc3RlbmVycyhtdiwgbW92ZSk7XG5cblxuXHRtdi5hcHBlbmRDaGlsZChtZHRsKTtcblx0bXYuYXBwZW5kQ2hpbGQobWRlbCk7XG5cdFxuXHRtb3ZlU3RydWN0LmRvbSA9IG12O1xuXHRtb3ZlU3RydWN0LnR5cGUgPSBtb3ZlLnR5cGU7XG5cdC8vIHN0b3JlIGN1cnJlbnQgc2hpcCBjb29yZGluYXRlIHN0cmluZyBzbyB0aGF0IHdoZW4gYSBtb3ZlIGlzIGRlbGV0ZWQgaXQgd2lsbCBiZSByZXN0b3JlZCB0byBpdCdzIHByaW9yIGxvY2F0aW9uXG5cdG1vdmVTdHJ1Y3QuZ2hvc3QgPSBtb3ZlLmdob3N0O1xuXHRtb3ZlU3RydWN0Lm9yaWVudGF0aW9uID0gbW92ZS5vcmllbnRhdGlvbjtcblx0bW92ZVN0cnVjdC5zaGlwVHlwZSA9IG1vdmUuc2hpcFR5cGU7XG5cdG1vdmVTdHJ1Y3Quc2l6ZSA9IG1vdmUuc2hpcFNpemU7XG5cblx0cmV0dXJuIG1vdmVTdHJ1Y3Q7XG59XG5cbi8vIEFkZCBkZWxldGUgbW92ZSBmdW5jdGlvblxuZnVuY3Rpb24gX3NldF9tdkxpc3RlbmVycyhtdiwgbW92ZSl7XG5cdG12LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGZ1bmN0aW9uKCkge1xuXHRcdC8vIENoZWNrIHRvIHNlZSBpZiBhbm90aGVyIHNoaXAgaXMgaW4gdGhlIHBhdGggb2YgdGhlIGF0dGVtcHRlZCByZXN0b3JlXG5cdFx0aWYgKGZsZWV0LnZhbGlkYXRlU2hpcChtb3ZlLnVuZG8sIG1vdmUuc2hpcFR5cGUsIG1vdmUuZ3JpZCwgbW92ZS5zaGlwcykpIHtcblx0XHRcdC8vIFJlbW92ZSB0aGUgZGl2XG5cdFx0XHQvLyBOZWVkIHRvIGtub3cgcGFyZW50IGVsZW1lbnQgd2hpY2gsIGZvciBldmVyeXRoaW5nIGluIHRoZSBtb3ZlIGxpc3QsIGlzIHRoZSBlbGVtZW50IHdob3NlIGlkIGlzIHBsYXlPcmRlclxuXHRcdFx0bGV0IHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheU9yZGVyJyk7XG5cdFx0XHRsZXQgZG12ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobXYuaWQpO1xuXHRcdFx0cC5yZW1vdmVDaGlsZChkbXYpO1xuXG5cdFx0XHQvLyBEZWxldGUgdGhlIGVudHJ5IGZyb20gdGhlIGFycmF5XG5cdFx0XHQvL21vdmVMaXN0LnB1c2gobXYpO1xuXHRcdFx0Zm9yIChsIGluIG1vdmVMaXN0KSB7XG5cdFx0XHRcdGlmKG1vdmVMaXN0W2xdLmlkID09IG12LmlkKXtcblx0XHRcdFx0XHRtb3ZlTGlzdC5zcGxpY2UobCwxKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZXBhaW50IHRoZSBvcmlnaW5hbCBzaGlwXG5cdFx0XHRtb3ZlLmdyaWQuZGlzcGxheVNoaXAobW92ZS5zaGlwcywgbW92ZS5zaGlwVHlwZSk7XG5cdFx0XHRtb3ZlLmdyaWQuZGlzcGxheVNoaXAobW92ZS5zaGlwcywgbW92ZS5zaGlwVHlwZSwgbW92ZS51bmRvKTtcblx0XHR9XG5cdH0pKTtcbn1cblxuLy8gU2V0IHVwIGRyYWcgZHJvcCBmdW5jdGlvbmFsaXR5IGZvciBzZXR0aW5nIG1vdmUgb3JkZXJcbmxldCBtb3ZlT3JkZXJIYW5kbGVyID0gZnVuY3Rpb24ocG8pIHtcbiAgICBwby5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLChmdW5jdGlvbihlKXtcblx0ICAgIGUuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQ9J21vdmUnO1xuXHQgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YShcInRleHQvcGxhaW5cIixcblx0XHRKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRjaGFuZ2VNb3ZlOiBlLnRhcmdldC5pZFxuXHRcdH0pXG5cdCAgICApO1xuICAgIH0pKTtcbiAgICBwby5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3Q9J21vdmUnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSkpO1xuICAgIHBvLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZHJvcE9iaiA9IEpTT04ucGFyc2UoZS5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvcGxhaW5cIikpO1xuXHQgICAgXHQgICAgYWx0ZXJNb3ZlSW5kZXgoZHJvcE9iai5jaGFuZ2VNb3ZlLCBlLnRhcmdldC5pZCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KSk7XG59XG5cbmZ1bmN0aW9uIGFsdGVyTW92ZUluZGV4KHN0YXJ0SW5kZXgsIGVuZEluZGV4KXtcblx0c3RhcnRJZCA9IHN0YXJ0SW5kZXg7XG5cdHN0YXJ0SW5kZXggPSBwYXJzZUludChtb3ZlTWFwW3N0YXJ0SW5kZXhdKTtcblx0ZW5kSW5kZXggICA9IHBhcnNlSW50KG1vdmVNYXBbZW5kSW5kZXhdKTtcblxuXHRsZXQgYmVnaW4gPSBzdGFydEluZGV4IDwgZW5kSW5kZXggPyBwYXJzZUludChzdGFydEluZGV4LCAxMCkgOiBwYXJzZUludChlbmRJbmRleCwgMTApO1xuXHRsZXQgZW5kID0gICBzdGFydEluZGV4IDwgZW5kSW5kZXggPyBwYXJzZUludChlbmRJbmRleCwgMTApIDogcGFyc2VJbnQoc3RhcnRJbmRleCwgMTApO1xuXHRsZXQgaG9sZCA9IG1vdmVMaXN0W3N0YXJ0SW5kZXhdO1xuXG5cdHdoaWxlKGJlZ2luIDwgZW5kKXtcblx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChtb3ZlTGlzdFtiZWdpbl0uaWQpLmFwcGVuZENoaWxkKChtb3ZlTGlzdFtiZWdpbisxXSkpO1xuXHRcdG1vdmVMaXN0W2JlZ2luXSA9IG1vdmVMaXN0W2JlZ2luKzFdO1xuXHRcdG1vdmVNYXBbc3RhcnRJZF0gPSBiZWdpbisxO1xuXHRcdGJlZ2luKys7XG5cdH1cblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobW92ZUxpc3RbZW5kXS5pZCkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWRbaG9sZF0uaWQpO1xuXHRtb3ZlTGlzdFtlbmRdID0gaG9sZDtcblx0bW92ZU1hcFtzdGFydElkXSA9IGVuZDtcbn1cblxubGV0IHJlc29sdmVNb3ZlcyA9IGZ1bmN0aW9uIChmbGVldCwgc2hpcHMsIGdyaWQpe1xuXHRsZXQgcGFyZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXlPcmRlcicpO1xuXHRjb25zb2xlLmxvZygnUmVzb2x2aW5nIG1vdmVzJyk7XG5cdGZvcihtIGluIG1vdmVMaXN0KSB7XG5cdFx0bGV0IG1vdmUgPSBtb3ZlTGlzdFttXTtcblx0XHRjb25zb2xlLmxvZygnbW92ZTogJywgbW92ZSk7XG5cdFx0c3dpdGNoKG1vdmUudHlwZSkge1xuXHRcdFx0Y2FzZSAnYXR0YWNrJzogXG5cdFx0XHRcdGF0dGFja1BsYXllcihtb3ZlLmNvb3JkaW5hdGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ21pbmUnOlxuXHRcdFx0XHRzZXRNaW5lKG1vdmUuY29vcmRpbmF0ZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnbW92ZSc6XG5cdFx0XHRcdG1vdmVTaGlwKGZsZWV0LCBzaGlwcywgZ3JpZCwgbW92ZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAncGl2b3QnOlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdGxldCBjaGlsZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vdmUuaWQpO1xuXHRwYXJlbnQucmVtb3ZlQ2hpbGQoY2hpbGQpO1xuXHR9XG59XG5cbmxldCBtb3ZlU2hpcCA9IGZ1bmN0aW9uKGZsZWV0LCBzaGlwcywgZ3JpZCwgbW92ZSl7XG5cdC8vIENoZWNrIGZvciBtaW5lcyBiYXNlZCBvbiBnaG9zdCAtIHNlbmQgbWVzc2FnZSB0byBtaW5lIHNlcnZpY2Vcblx0bGV0IGJsYXN0QXQgPSBfY2hlY2tfZm9yX21pbmUobW92ZS5naG9zdCk7XG5cdGlmIChibGFzdEF0ICE9IGZhbHNlKXtcblx0XHQvLyBSZXNldCBnaG9zdCBpZiBtaW5lIGZvdW5kIC0gSWYgYSBtaW5lIGhhcyBiZWVuIGVuY291bnRlcmVkIHRoZW4gdGhlIHNoaXAgb25seSBtb3ZlcyB0byB0aGUgcG9pbnQgb2YgdGhlIGJsYXN0XG5cdFx0X3Jlc2V0R2hvc3QoZmxlZXQsIGJsYXN0QXQsIG1vdmUpO1xuXHRcdC8vIGZpbmQgd2hpY2ggc3F1YXJlIGdvdCBoaXRcblx0XHRsZXQgdGFyZ2V0O1xuXHRcdGZvcihtIGluIG1vdmUuZ2hvc3Qpe1xuXHRcdFx0aWYgKG1vdmUuZ2hvc3RbbV0gPT0gYmxhc3RBdClcblx0XHRcdHtcblx0XHRcdFx0dGFyZ2V0PW1vdmUuZ2hvc3RbbV07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRzaGlwcy5zZXRIaXRDb3VudGVyKG1vdmUuc2hpcFR5cGUsIG0rMSk7XG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0KS5jbGFzc05hbWUgKz0nIHNoaXBIaXQnO1xuXHR9XG5cblx0bGV0IGZsID0gZmxlZXQuZ2V0RmxlZXQobW92ZS5zaGlwVHlwZSk7XG5cdGxldCBzID0gc2hpcHMuZ2V0U2hpcChtb3ZlLnNoaXBUeXBlKTtcblxuXHRpZiAoZmxbMF0gPT0gbW92ZS5naG9zdFswXSAmJiBtb3ZlLm9yaWVudGF0aW9uID09IHMub3JpZW50YXRpb24pIHsgLy8gY2hlY2sgc3RhcnRpbmcgcG9pbnRzIGFuZCBvcmllbnRhdGlvbiBzZXQgYW5kIHJlZGlzcGxheSBvbmx5IGlmIGRpZmZlcmVudFxuXHRcdC8vIFZhbGlkYXRlIG1vdmUgY2FuIGJlIG1hZGVcblx0XHRpZihmbGVldC52YWxpZGF0ZVNoaXAobW92ZS5naG9zdCwgbW92ZS5zaGlwVHlwZSkpIHtcblx0XHRcdGdyaWQuZGlzcGxheVNoaXAoc2hpcHMsIG1vdmUuc2hpcFR5cGUpO1xuXHRcdFx0Ly8gU2V0IGdob3N0IHRvIE5hdXRpY2FsQ2hhcnQvTWFwXG5cdFx0XHRmbGVldC5zZXRGbGVldCAobW92ZS5vcmllbnRhdGlvbiwgbW92ZS5zaGlwVHlwZSwgc2hpcHMuZ2V0U2hpcChtb3ZlLnNoaXBUeXBlKS5zaXplLCBtb3ZlLmdob3N0WzBdLCAwKTsgXG5cdFx0fVxuXG5cdFx0Ly8gRGlzcGxheSBuZXcgc2hpcCBsb2NhdGlvbiBiYXNlZCBvbiBOYXV0aWNhbENoYXJ0L01hcFxuXHRcdGdyaWQuZGlzcGxheVNoaXAoc2hpcHMsIG1vdmUuc2hpcFR5cGUsIG1vdmUuZ2hvc3QpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIF9yZXNldEdob3N0KGZsZWV0LCBibGFzdEF0LCBtb3ZlKXtcblx0Zm9yIChpIGluIG1vdmUuZ2hvc3Qpe1xuXHRcdGlmIChibGFzdEF0ID09IG1vdmUuZ2hvc3RbaV0pIGJyZWFrO1xuXHR9XG5cblx0cmV0dXJuIG1vdmUuZ2hvc3QgPSBmbGVldC5naG9zdFNoaXAobW92ZS50eXBlLCBtb3ZlLmdob3N0W2ldLCBtb3ZlLm9yaWVudGF0aW9uLCBtb3ZlLmdob3N0Lmxlbmd0aCwgaSk7XG59XG5cbi8vIFN0dWIgZm9yIG1pbmUgZGV0ZWN0aW9uXG5mdW5jdGlvbiBfY2hlY2tfZm9yX21pbmUoZyl7XG5cdGxldCBtaW5lQXQgPSB7JzBfNic6IDEsICcxXzYnOiAxLCAnMl82JzogMSwgJzNfNic6IDEsICc0XzYnOiAxLCAnNV82JzogMSwgJzZfNic6IDEsICc3XzYnOiAxLCAnOF82JzogMSwgJzlfNic6IDF9O1xuXHRmb3IoaSBpbiBnKSB7XG5cdFx0Ly8gcmV0dXJuIGxvY2F0aW9uIHdoZXJlIG1pbmUgc3RydWNrXG5cdFx0aWYobWluZUF0W2dbaV1dID09IDEpIHsgXG5cdFx0XHRjb25zb2xlLmxvZygnQk9PTScpO1xuXHRcdFx0cmV0dXJuIGdbaV07IFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cdFxuXG5sZXQgYXR0YWNrUGxheWVyID0gZnVuY3Rpb24oY29vcmRpbmF0ZSl7XG5cdC8vIFNlbmQgYSBtZXNzYWdlIHJlcXVlc3RpbmcgaGl0L21pc3MgdmFsdWUgb24gZW5lbXkncyBncmlkXG5cdC8vIEluZm9ybSBhbGwgb2YgZW5lbXkncyBjb29yZGluYXRlIHN0YXR1c1xufVxuXG5sZXQgc2V0TWluZSA9IGZ1bmN0aW9uKGNvb3JkaW5hdGUpe1xuXHQvLyBTZW5kIGEgbWVzc2FnZSByZXF1ZXN0aW5nIGhpdC9taXNzIHZhbHVlIG9uIGVuZW15J3MgZ3JpZFxuXHQvLyBJZiBub3QgYSBoaXQgcmVnaXN0ZXIgd2l0aCBzZXJ2aWNlIHRoYXQgbWluZSBwbGFjZWQgb24gZW5lbXkgZ3JpZFxufVxuXG5sZXQgc2V0TW92ZSA9IGZ1bmN0aW9uKG1vdmUpe1xuXHQvL2xldCBtb3ZlU3RyaW5nO1xuXHRpZihtb3ZlTWFwW21vdmUuY29vcmRpbmF0ZV0gPT0gdW5kZWZpbmVkKSB7XG5cdFx0bW92ZU1hcFttb3ZlLmNvb3JkaW5hdGVdID0gbW92ZUxpc3QubGVuZ3RoO1xuXHRcdC8vbW92ZVN0cmluZyA9IG1vdmUudHlwZSArICc6ICcgKyBtb3ZlLmNvb3JkaW5hdGU7XG5cdFx0Ly9sZXQgYiA9IG1vdmVMaXN0QmxvY2sobW92ZS5jb29yZGluYXRlLCBtb3ZlU3RyaW5nKTtcblx0XHRsZXQgbXYgPSBtb3ZlTGlzdEJsb2NrKG1vdmUpO1xuXHRcdG1vdmVMaXN0LnB1c2gobXYpO1xuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKS5hcHBlbmRDaGlsZChtdi5kb20pO1xuXHR9XG59XG5cbmxldCBnZXRNb3ZlU2l6ZSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBtb3ZlTGlzdC5sZW5ndGg7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNsZWFyTW92ZUxpc3Q6IGNsZWFyTW92ZUxpc3QsXG4gICAgc2V0TW92ZTogc2V0TW92ZSxcbiAgICBkZWxldGVNb3ZlOiBkZWxldGVNb3ZlLFxuICAgIG1vdmVPcmRlckhhbmRsZXI6IG1vdmVPcmRlckhhbmRsZXIsXG4gICAgcmVzb2x2ZU1vdmVzOiByZXNvbHZlTW92ZXMsXG4gICAgZ2V0TW92ZVNpemU6IGdldE1vdmVTaXplLFxufVxuIiwiLy9sZXQgcmFiYml0ID0gcmVxdWlyZSgnLi9ic19SYWJiaXRNUScpO1xubGV0IGZsZWV0ID0gcmVxdWlyZSgnLi9mbGVldC5qcycpO1xubGV0IG1vdmUgPSByZXF1aXJlKCcuL21vdmUuanMnKTtcblxubGV0IHBsYXllclJvc3RlciA9IG5ldyBPYmplY3Q7IC8vIFBsYWNlaG9sZGVyIGZvciBhbGwgcGxheWVycyBpbiB0aGUgZ2FtZVxubGV0IHBsYXllck9yZGVyID0gW107IC8vIE9yZGVyIG9mIHBsYXllciB0dXJuXG5cbmxldCBtZTtcbmxldCBvcmRlckluZGV4PTA7XG5sZXQgZmxvdz1bJ3JlZ2lzdGVyJywnZ2FtZSddO1xubGV0IGN1cnJlbnRGbG93O1xuXG5sZXQgY2FuTW92ZSA9IGZ1bmN0aW9uKCkge1xuXHRpZiAocGxheWVyT3JkZXIubGVuZ3RoID4gbW92ZS5nZXRNb3ZlU2l6ZSgpKSByZXR1cm4gdHJ1ZTtcblxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbi8vIFJlZ2lzdGVyIGhhbmRsZVxubGV0IHJlZ2lzdGVyID0gZnVuY3Rpb24oaGFuZGxlKXtcblx0bWUgPSBoYW5kbGU7IC8vIFNlbGYgaWRlbnRpZnkgdGhpbmVzZWxmXG5cdC8vIFRPRE8gLSBjYWxsIG91dCB0byB0aGUgcmVnaXN0cmF0aW9uIHNlcnZpY2UgYW5kIGdldCBiYWNrIGhhbmRsZSBhbmQgdHVybiBvcmRlci4gVGhpc1xuXHQvLyBzdHJ1Y3R1cmUgcmVwcmVzZW50cyB0aGUgcmV0dXJuIGNhbGwgZnJvbSB0aGUgcmVnaXN0cmF0aW9uIHNlcnZpY2UuXG5cdGNvbnN0IHJlZyA9IHtcblx0XHQgICAgICBoYW5kbGU6ICdlbHNwb3JrbycsXG5cdFx0ICAgICAgb3JkZXI6IDBcblx0fTtcblxuXHQvL19wb3B1bGF0ZV9wbGF5ZXJPcmRlcignZWxzcG9ya28nLCAwKTtcblx0cGxheWVyT3JkZXJbcmVnLm9yZGVyXSA9IHJlZy5oYW5kbGU7XG5cdGdhbWVGbG93KCk7XG5cdHJldHVybjtcbn1cblxuLy9BY2NlcHQgcmVnaXN0cmF0aW9uIGZyb20gb3RoZXIgcGxheWVyc1xubGV0IGFjY2VwdFJlZyA9IGZ1bmN0aW9uKGhhbmRsZSwgb3JkZXIsIGdyaWQsIHNoaXBzLCBmbGVldCwgcGxheWVyKXtcblx0cGxheWVyT3JkZXJbb3JkZXJdID0gaGFuZGxlO1xuXHRwbGF5ZXJSb3N0ZXIgPSB7XG5cdFx0W2hhbmRsZV06IHtncmlkOiBmbGVldC5idWlsZE5hdXRpY2FsQ2hhcnR9XG5cdH1cblx0bGV0IHBnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllckdyaWQnKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSk7O1xuXHRcblx0Ly9sZXQgcGdkID0gcGcuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xuXHRwZy5pZD1oYW5kbGU7XG5cdHBnLmlubmVySFRNTD1oYW5kbGU7XG5cblx0cGcuYXBwZW5kQ2hpbGQoZ3JpZC5jbGlja2FibGVHcmlkKDEwLCAxMCwgc2hpcHMsIGZsZWV0LCBwbGF5ZXIsIGhhbmRsZSkpO1xufVxuXG5sZXQgbXlUdXJuID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiAoY3VycmVudFBsYXllcigpID09IG1lKSA/IDEgOiAwO1xufVxuXG5sZXQgbmV4dFBsYXllciA9IGZ1bmN0aW9uKCkge1xuXHRvcmRlckluZGV4ID0gKG9yZGVySW5kZXggPT0gcGxheWVyT3JkZXIubGVuZ3RoIC0gMSkgPyAgMCA6IG9yZGVySW5kZXgrMTtcblx0cmV0dXJuO1xufVxuXG5sZXQgY3VycmVudFBsYXllciA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBwbGF5ZXJPcmRlcltvcmRlckluZGV4XTtcbn1cblxubGV0IGdhbWVGbG93ID0gZnVuY3Rpb24oKXtcblx0aWYgKGN1cnJlbnRGbG93ICE9IHVuZGVmaW5lZCl7XG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZmxvd1tjdXJyZW50Rmxvd10pLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuXHRcdGN1cnJlbnRGbG93Kys7XG5cdH0gZWxzZSB7XG5cdFx0Y3VycmVudEZsb3cgPSAwO1xuXHR9XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGZsb3dbY3VycmVudEZsb3ddKS5zdHlsZS5kaXNwbGF5PSdpbmxpbmUnO1xufVxuXG5sZXQgc2V0TW92ZSA9IGZ1bmN0aW9uKG0pe1xuXHRyZXR1cm4gbW92ZS5zZXRNb3ZlKG0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZWdpc3RlcjogcmVnaXN0ZXIsXG4gICAgYWNjZXB0UmVnOiBhY2NlcHRSZWcsXG4gICAgbXlUdXJuOiBteVR1cm4sXG4gICAgY3VycmVudFBsYXllcjogY3VycmVudFBsYXllcixcbiAgICBuZXh0UGxheWVyOiBuZXh0UGxheWVyLFxuICAgIGdhbWVGbG93OiBnYW1lRmxvdyxcbiAgICBjYW5Nb3ZlOiBjYW5Nb3ZlLFxuICAgIHNldE1vdmU6IHNldE1vdmVcbiAgICAvL2Rpc3BsYXlNb3ZlT3JkZXI6IGRpc3BsYXlNb3ZlT3JkZXI7XG59XG4iLCJ2YXIgZmxlZXQ9cmVxdWlyZSgnLi9mbGVldC5qcycpO1xyXG5cclxuLy8gQ29uZmlnIHNldHRpbmdzIFxyXG5sZXQgc2hpcF9jb25maWcgPSB7XHJcbiAgICBhaXJjcmFmdENhcnJpZXIgOiB7XHJcbiAgICAgICAgc2l6ZSA6IDUsXHJcbiAgICAgICAgaWQgOiAnYWlyY3JhZnRDYXJyaWVyJyxcclxuICAgICAgICBjb2xvciA6ICdDcmltc29uJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ2FjY2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnQWlyY3JhZnQgQ2FycmllcicsXHJcblx0bWFzayA6IDMxLFxyXG4gICAgfSxcclxuICAgIGJhdHRsZXNoaXAgOiB7XHJcbiAgICAgICAgc2l6ZSA6IDQsXHJcbiAgICAgICAgaWQgOiAnYmF0dGxlc2hpcCcsXHJcbiAgICAgICAgY29sb3I6J0RhcmtHcmVlbicsXHJcbiAgICAgICAgY2xpY2tDbGFzcyA6ICdic2NsaWNrZWQnLFxyXG4gICAgICAgIGxhYmVsIDogJ0JhdHRsZXNoaXAnLFxyXG5cdG1hc2s6IDE1LFxyXG4gICAgfSxcclxuICAgIGRlc3Ryb3llciA6IHtcclxuICAgICAgICBzaXplIDogMyxcclxuICAgICAgICBpZCA6ICdkZXN0cm95ZXInLFxyXG4gICAgICAgIGNvbG9yOidDYWRldEJsdWUnLFxyXG4gICAgICAgIGNsaWNrQ2xhc3MgOiAnZGVjbGlja2VkJyxcclxuICAgICAgICBsYWJlbCA6ICdEZXN0cm95ZXInLFxyXG5cdG1hc2s6IDcsXHJcbiAgICB9LFxyXG4gICAgc3VibWFyaW5lICA6IHtcclxuICAgICAgICBzaXplIDogMyxcclxuICAgICAgICBpZCA6ICdzdWJtYXJpbmUnLFxyXG4gICAgICAgIGNvbG9yOidEYXJrUmVkJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ3N1Y2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnU3VibWFyaW5lJyxcclxuXHRtYXNrIDogNyxcclxuICAgIH0sXHJcbiAgICBwYXRyb2xCb2F0IDoge1xyXG4gICAgICAgIHNpemUgOiAyLFxyXG4gICAgICAgIGlkIDogJ3BhdHJvbEJvYXQnLFxyXG4gICAgICAgIGNvbG9yOidHb2xkJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ3BiY2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnUGF0cm9sIEJvYXQnLFxyXG5cdG1hc2s6IDMsXHJcbiAgICB9LFxyXG59O1xyXG5cclxubGV0IGhpdENvdW50ZXIgPSB7XHJcbiAgICBhaXJjcmFmdENhcnJpZXIgOiAwLFxyXG4gICAgYmF0dGxlc2hpcCA6IDAsXHJcbiAgICBkZXN0cm95ZXIgOiAwLFxyXG4gICAgc3VibWFyaW5lICA6IDAsXHJcbiAgICBwYXRyb2xCb2F0IDogMFxyXG59O1xyXG5cclxubGV0IHN1bmtDb3VudGVyOyAvLyBUcmFja3Mgd2hpY2ggYm9hdHMgaGF2ZSBiZWVuIHN1bmtcclxuXHJcbi8vIFZhbHVlcyBmb3IgZGV0ZXJtaW5pbmcgYml0IHZhbHVlcyB3aGVuIGEgYm9hdCBzaW5rc1xyXG5jb25zdCBhaXJDcmFmdENhcnJpZXIgPSAxO1xyXG5jb25zdCBiYXR0bGVzaGlwID0gMjtcclxuY29uc3QgZGVzdHJveWVyID0gNDtcclxuY29uc3Qgc3VibWFyaW5lID0gODtcclxuY29uc3QgcGF0cm9sQm9hdCA9IDE2O1xyXG5cclxubGV0IHNldEhpdENvdW50ZXIgPSBmdW5jdGlvbiAodHlwZSwgYml0KSB7XHJcblx0aGl0Q291bnRlclt0eXBlXSA9IHNoaXBfY29uZmlnW3R5cGVdLm1hc2teKGJpdCpiaXQpO1xyXG5cdGlmIChoaXRDb3VudGVyW3R5cGVdID09IHNoaXBfY29uZmlnW3R5cGVdLm1hc2spIHsgLy8gSSBkb24ndCBrbm93IGlmIHRoaXMgaXMgY29ycmVjdCBidXQgdGhlIGlkZWEgaXMgY2hlY2sgdG8gc2VlIGlmIHRoZSBzaGlwIGlzIHN1bmsgYW5kIGZsYWcgaXQgaWYgbmVlZCBiZVxyXG5cdFx0c2V0U3Vua0NvdW50ZXIodHlwZSk7XHJcblx0fVxyXG59XHJcblxyXG5sZXQgc2V0U3Vua0NvdW50ZXIgPSBmdW5jdGlvbiAodHlwZSkge1xyXG5cdHN1bmtDb3VudGVyID0gc3Vua0NvdW50ZXJedHlwZTtcclxufVxyXG5cclxubGV0IGdldEhpdENvdW50ZXIgPSBmdW5jdGlvbiAodHlwZSl7XHJcblx0cmV0dXJuIGhpdENvdW50ZXJbdHlwZV07XHJcbn1cclxuXHJcbmxldCBnZXRTdW5rQ291bnRlciA9IGZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIHN1bmtDb3VudGVyO1xyXG59XHJcblxyXG4vLyBTaGlwIGNvbnN0cnVjdG9yIC0gc2hpcHlhcmQ/Pz9cclxuZnVuY3Rpb24gX3NoaXAoc2l6ZSwgaWQsIGNvbG9yLCBjbGlja0NsYXNzLCBsYWJlbCkge1xyXG4gICAgICAgIHRoaXMuc2l6ZSAgICAgICAgPSBzaXplO1xyXG4gICAgICAgIHRoaXMuaWQgICAgICAgICAgPSBpZDtcclxuICAgICAgICB0aGlzLmNvbG9yICAgICAgID0gY29sb3I7XHJcbiAgICAgICAgdGhpcy5jbGlja0NsYXNzICA9IGNsaWNrQ2xhc3M7XHJcbiAgICAgICAgdGhpcy5sYWJlbCAgICAgICA9IGxhYmVsO1xyXG5cclxuICAgICAgICByZXR1cm4gKHRoaXMpO1xyXG59XHJcblxyXG5sZXQgc2hpcHM9e307XHJcblxyXG4vKlxyXG4gKiBUaGUgc2hpcCBvYmplY3QgaG9sZHMgdGhlIGN1cnJlbnQgb3JpZW50YXRpb24gb2YgdGhlIHNoaXAgYW5kIHRoZSBzdGFydCBjb29yZGluYXRlICh0b3Btb3N0L2xlZnRtb3N0KS4gV2hlblxyXG4gKiB0aGVyZSBpcyBhIGNoYW5nZSB0byB0aGUgc2hpcCB0aGUgbWFzdGVyIG1hdHJpeCBuZWVkcyB0byBiZSB1cGRhdGVkLiBBbiBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHRoZXJlIGlzXHJcbiAqIGEgY29vcmRpbmF0ZSBjaGFuZ2UuIFRoaXMgbGlzdGVuZXIgd2lsbCB1cGRhdGUgdGhlIG1hc3RlciBtYXRyaXguIENhbGxzIHRvIGNoZWNrIGxvY2F0aW9uIChtb3ZlIHZhbGlkdGlvbiwgXHJcbiAqIGNoZWNrIGlmIGhpdCwgZXRjLikgd2lsbCBiZSBtYWRlIGFnYWluc3QgdGhlIG1hc3RlciBtYXRyaXguXHJcbiAqL1xyXG4vKlxyXG5sZXQgc2hpcElpbnQgPSBmdW5jdGlvbigpe1xyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcignc2hpcE1vdmUnLCgpKSB9XHJcblxyXG59XHJcbiovXHJcbi8vIFB1YmxpYyBmdW5jdGlvbiB0byBpbml0aWFsbHkgY3JlYXRlIHNoaXBzIG9iamVjdFxyXG5sZXQgYnVpbGRTaGlwcyA9IGZ1bmN0aW9uICgpe1xyXG4gICAgZm9yIChsZXQgcyBpbiBzaGlwX2NvbmZpZyl7XHJcbiAgICAgICAgc2hpcHNbc10gPSB7c2l6ZTogc2hpcF9jb25maWdbc10uc2l6ZSwgXHJcblx0XHQgICAgdHlwZTogc2hpcF9jb25maWdbc10uaWQsXHJcblx0ICAgICAgICAgICAgY29sb3I6IHNoaXBfY29uZmlnW3NdLmNvbG9yLFxyXG5cdFx0ICAgIGNsaWNrQ2xhc3M6IHNoaXBfY29uZmlnW3NdLmNsaWNrQ2xhc3MsXHJcblx0XHQgICAgbGFiZWw6IHNoaXBfY29uZmlnW3NdLmxhYmVsXHJcblx0ICAgICAgICAgICB9O1xyXG4gICAgfVxyXG5yZXR1cm4gc2hpcHM7XHJcbn1cclxuXHJcbmxldCBidWlsZFNoaXAgPSBmdW5jdGlvbih0eXBlKXtcclxuICAgICAgICBzaGlwc1t0eXBlXSA9IF9zaGlwKHNoaXBfY29uZmlnW3R5cGVdLnNpemUsIHNoaXBfY29uZmlnW3R5cGVdLmlkLCBzaGlwX2NvbmZpZ1t0eXBlXS5jb2xvciwgc2hpcF9jb25maWdbdHlwZV0uY2xpY2tDbGFzcywgc2hpcF9jb25maWdbdHlwZV0ubGFiZWwpO1xyXG5cdHJldHVybiBzaGlwcztcclxufVxyXG5cclxuLy8gU2V0IHZhbHVlIGluIHNoaXAgb2JqZWN0LiBcclxubGV0IHNldFNoaXAgPSBmdW5jdGlvbih0eXBlLCBrZXksIHZhbHVlKXtcclxuICAgICAgICBpZiAodHlwZSAmJiBzaGlwc1t0eXBlXSAmJiBrZXkpIHsgLy8gb25seSBhdHRlbXB0IGFuIHVwZGF0ZSBpZiB0aGVyZSBpcyBhIGxlZ2l0IHNoaXAgdHlwZSBhbmQgYSBrZXlcclxuICAgICAgICAgICAgc2hpcHNbdHlwZV0ua2V5ID0gdmFsdWU7XHJcbiAgIH1cclxufVxyXG5cclxuLy8gUmV0dXJuIHNoaXAgb2JqZWN0IGlmIG5vIHR5cGUgZ2l2ZW4gb3RoZXJ3aXNlIHJldHVybiBvYmplY3QgY29udGFpbmluZyBqdXN0IHJlcXVlc3RlZCBzaGlwXHJcbmxldCBnZXRTaGlwID0gZnVuY3Rpb24gKHR5cGUpe1xyXG4gICAgaWYodHlwZSl7XHJcbiAgICAgICAgcmV0dXJuIHNoaXBzW3R5cGVdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gc2hpcHM7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIFByaXZhdGUgZnVuY3Rpb24gdG8gcmFuZG9tbHkgZGV0ZXJtaW5lIHNoaXAncyBvcmllbnRhdGlvbiBhbG9uZyB0aGUgWC1heGlzIG9yIFktYXhpcy4gT25seSB1c2VkIHdoZW4gcGxvdHRpbmcgc2hpcHMgZm9yIHRoZSBmaXJzdCB0aW1lLlxyXG5mdW5jdGlvbiBfZ2V0U3RhcnRDb29yZGluYXRlKHNpemUpe1xyXG4gICAgY29uc3Qgc3RhcnRfb3JpZW50YXRpb249TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjEwKSA+IDUgPyAneCcgOiAneSc7XHJcbiAgICBjb25zdCBzdGFydF94ID0gc3RhcnRfb3JpZW50YXRpb24gPT0gJ3gnID8gX2dldFJhbmRvbUNvb3JkaW5hdGUoc2l6ZSkgOiBfZ2V0UmFuZG9tQ29vcmRpbmF0ZSgwKTtcclxuICAgIGNvbnN0IHN0YXJ0X3kgPSBzdGFydF9vcmllbnRhdGlvbiA9PSAneScgPyBfZ2V0UmFuZG9tQ29vcmRpbmF0ZShzaXplKSA6IF9nZXRSYW5kb21Db29yZGluYXRlKDApO1xyXG5cclxuICAgIHJldHVybiB7Y29vcmRpbmF0ZTogc3RhcnRfeCArICdfJyArIHN0YXJ0X3ksIG9yaWVudGF0aW9uOiBzdGFydF9vcmllbnRhdGlvbn07XHJcbn1cclxuXHJcbi8vIFRha2Ugc2hpcCBzaXplIGFuZCBvcmllbnRhdGlvbiBpbnRvIGFjY291bnQgd2hlbiBkZXRlcm1pbmluZyB0aGUgc3RhcnQgcmFuZ2UgdmFsdWUuIGV4LiBkb24ndFxyXG4vLyBsZXQgYW4gYWlyY3JhZnQgY2FycmllciB3aXRoIGFuIG9yaWVudGF0aW9uIG9mICdYJyBzdGFydCBhdCByb3cgNyBiZWNhdXNlIGl0IHdpbGwgbWF4IG91dCBvdmVyIHRoZVxyXG4vLyBncmlkIHNpemUuXHJcbmZ1bmN0aW9uIF9nZXRSYW5kb21Db29yZGluYXRlKG9mZnNldCl7XHJcbiAgICBjb25zdCBNQVhfQ09PUkQgPSAxMDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqKE1BWF9DT09SRCAtIG9mZnNldCkpO1xyXG5cclxufVxyXG5cclxuLy8gRklYTUUgRG9lcyBmbGVldC5naG9zdFNoaXAgZG8gdGhpcyBub3c/XHJcbi8vIEJ1aWxkIGFuIGFycmF5IG9mIGNvb3JkaW5hdGVzIGZvciBhIHNoaXAgYmFzZWQgb24gaXQncyBvcmllbnRhdGlvbiwgaW50ZW5kZWQgc3RhcnQgcG9pbnQgYW5kIHNpemVcclxubGV0IF9zaGlwU3RyaW5nID0gZnVuY3Rpb24ocykge1xyXG5cdGNvbnN0IG8gPSBzLm9yaWVudGF0aW9uO1xyXG5cdGNvbnN0IHN0ID0gcy5zdGFydF9jb29yZGluYXRlO1xyXG5cdGxldCByID0gbmV3IEFycmF5O1xyXG4gICAgICAgIGxldCB0X3BpZWNlcyA9IHN0LnNwbGl0KCdfJyk7XHJcblx0Y29uc3QgaSA9IG8gPT0gJ3gnID8gMCA6IDE7XHJcblxyXG5cdGZvciAobGV0IGo9MDsgaiA8IHMuc2l6ZTtqKyspIHtcclxuXHRcdHRfcGllY2VzW2ldID0gdF9waWVjZXNbaV0rMTtcclxuXHRcdHIucHVzaCAodF9waWVjZXNbMF0gKyAnXycgKyB0X3BpZWNlc1sxXSk7XHJcblx0fVxyXG5cdHJldHVybiByO1xyXG59XHJcblxyXG5cclxuLypcclxuICogcGxhY2VTaGlwcyAtIEluaXRpYWwgcGxhY2VtZW50IG9mIHNoaXBzIG9uIHRoZSBib2FyZFxyXG4gKi9cclxubGV0IHBsYWNlU2hpcHMgPSBmdW5jdGlvbiBwbGFjZVNoaXBzKGZsZWV0KXtcclxuICAgICAgICAvKiBSYW5kb21seSBwbGFjZSBzaGlwcyBvbiB0aGUgZ3JpZC4gSW4gb3JkZXIgZG8gdGhpcyBlYWNoIHNoaXAgbXVzdDpcclxuXHQgKiAgICogUGljayBhbiBvcmllbnRhdGlvblxyXG5cdCAqICAgKiBQaWNrIGEgc3RhcnRpbmcgY29vcmRpbmF0ZVxyXG5cdCAqICAgKiBWYWxpZGF0ZSB0aGF0IHRoZSBjb29yZGluYXRlIGlzIHZhbGlkIChkb2VzIG5vdCBydW4gT09CLCBkb2VzIG5vdCBjcm9zcyBhbnkgb3RoZXIgc2hpcCwgZXRjLilcclxuXHQgKiAgICogSWYgdmFsaWQ6XHJcblx0ICogICBcdCogU2F2ZSBzdGFydCBjb29yZCBhbmQgb3JpZW50YXRpb24gYXMgcGFydCBvZiBzaGlwIG9iamVjdFxyXG5cdCAqICAgXHQqIFBsb3Qgc2hpcCBvbiBtYXN0ZXIgbWF0cml4XHJcblx0ICovXHJcblx0bGV0IHNoaXBMaXN0ID0gZ2V0U2hpcCgpO1xyXG4gICAgICAgIGZvciAodmFyIHNoaXAgaW4gc2hpcExpc3QpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBzdGFydCA9IF9nZXRTdGFydENvb3JkaW5hdGUoc2hpcExpc3Rbc2hpcF0uc2l6ZSk7IFxyXG5cdCAgICBsZXQgc2hpcF9zdHJpbmcgPSBmbGVldC5naG9zdFNoaXAoc2hpcExpc3Rbc2hpcF0udHlwZSwgc3RhcnQuY29vcmRpbmF0ZSwgc3RhcnQub3JpZW50YXRpb24pO1xyXG5cdCAgICBzaGlwTGlzdFtzaGlwXS5vcmllbnRhdGlvbiA9IHN0YXJ0Lm9yaWVudGF0aW9uO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKCFmbGVldC52YWxpZGF0ZVNoaXAoc2hpcF9zdHJpbmcpKSB7XHJcbiAgICAgICAgICAgICAgICBzdGFydCA9IF9nZXRTdGFydENvb3JkaW5hdGUoc2hpcExpc3Rbc2hpcF0uc2l6ZSk7IFxyXG5cdFx0c2hpcExpc3Rbc2hpcF0ub3JpZW50YXRpb24gPSBzdGFydC5vcmllbnRhdGlvbjtcclxuXHRcdHNoaXBfc3RyaW5nID0gZmxlZXQuZ2hvc3RTaGlwKHNoaXBMaXN0W3NoaXBdLnR5cGUsIHN0YXJ0LmNvb3JkaW5hdGUsIHN0YXJ0Lm9yaWVudGF0aW9uKTtcclxuXHRcdH1cclxuXHJcbiAgICAgICAgICAgIGZsZWV0LnNldEZsZWV0KHN0YXJ0Lm9yaWVudGF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHNoaXBMaXN0W3NoaXBdLnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgc2hpcExpc3Rbc2hpcF0uc2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICBzdGFydC5jb29yZGluYXRlKTtcclxuICAgICAgICAgICAgfVxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgYnVpbGRTaGlwczogYnVpbGRTaGlwcyxcclxuICAgIGJ1aWxkU2hpcDogYnVpbGRTaGlwLFxyXG4gICAgZ2V0U2hpcDogZ2V0U2hpcCxcclxuICAgIHNldFNoaXA6IHNldFNoaXAsXHJcbiAgICBwbGFjZVNoaXBzOiBwbGFjZVNoaXBzLFxyXG4gICAgc2V0SGl0Q291bnRlcjogc2V0SGl0Q291bnRlclxyXG59XHJcbiJdfQ==
