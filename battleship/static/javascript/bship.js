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
	grid.setMoveShip(); // Change value of moveShip so that behavior is different after fleet has been set
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

	while (nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] == type) {
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
	    player.setMove({type: moveType, coordinate: ev.target.id, ghost: dropShip, orientation: dropObj.orientation, shipType: dropObj.type});
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
		    let orientation = (ship.orientation == 'x') ? 'y':'x'; // flip the orientation
                    let start = _find_start(e.target.id, orientation, ship.size, type);
		    let ghost = fleet.ghostShip(type, e.target.id, orientation, ship.size, start.offset);

		    drop.type = type;

                    if(fleet.validateShip(ghost, type)) {
			if(player.canMove()) {moveShip(ships, drop, e, fleet, player, ghost, 'pivot')};
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
        if (g != undefined && g == type && g != false){
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

        mv.setAttribute('draggable','true');
	moveOrderHandler(mv);

	let moveString = move.type + ': ' + move.coordinate;
	let mdtl = document.createElement('div');
	mdtl.innerHTML=moveString;

	let mdel = document.createElement('div');
	mdel.innerHTML='Delete';

	mv.appendChild(mdtl);
	mv.appendChild(mdel);
	
	moveStruct.dom = mv;
	moveStruct.type = move.type;
	moveStruct.ghost = move.ghost;
	moveStruct.orientation = move.orientation;
	moveStruct.shipType = move.shipType;
	moveStruct.size = move.shipSize;

	return moveStruct;
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
		// TODO set ship as hit
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
		if(mineAt[g[i]] == 1) { console.log('BOOM');
			return g[i]; }
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
    placeShips: placeShips
}

},{"./fleet.js":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJhdHRsZXNoaXAuanMiLCJjb25maWcuanMiLCJmbGVldC5qcyIsImdyaWQuanMiLCJtb3ZlLmpzIiwicGxheWVyLmpzIiwic2hpcHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBncmlkID0gcmVxdWlyZSgnLi9ncmlkLmpzJyk7XHJcbnZhciBwbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllci5qcycpO1xyXG52YXIgc2hpcHMgPSByZXF1aXJlKCcuL3NoaXBzLmpzJyk7XHJcbnZhciBmbGVldCA9IHJlcXVpcmUoJy4vZmxlZXQuanMnKTtcclxudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnLmpzJyk7XHJcbnZhciBtb3ZlID0gcmVxdWlyZSgnLi9tb3ZlLmpzJyk7XHJcblxyXG5cclxucGxheWVyLmdhbWVGbG93KCk7XHJcblxyXG4vKiBSZWdpc3RlciAqL1xyXG4vLyBUT0RPIC0gYXR0YWNoIGhhbmRsZXIgdGhyb3VnaCBwdWc7IG1vdmUgaGFuZGxlcnMgdG8gYW5vdGhlciBtb2R1bGVcclxubGV0IHI9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyJyk7XHJcbnIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBcclxuICAgIGZ1bmN0aW9uKCl7XHJcblx0ICAgIHBsYXllci5yZWdpc3RlcigpO1xyXG5cdCAgICByZXR1cm47XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG5sZXQgZj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0RmxlZXQnKTtcclxuZi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0RmxlZXQnKS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWVyR3JpZCcpLnN0eWxlLmRpc3BsYXk9J2lubGluZSc7XHJcblx0Z3JpZC5zZXRNb3ZlU2hpcCgpOyAvLyBDaGFuZ2UgdmFsdWUgb2YgbW92ZVNoaXAgc28gdGhhdCBiZWhhdmlvciBpcyBkaWZmZXJlbnQgYWZ0ZXIgZmxlZXQgaGFzIGJlZW4gc2V0XHJcblx0ICAgIHBsYXlHYW1lKCk7XHJcblx0ICAgIHJldHVybjtcclxuICAgIH0sIGZhbHNlKTtcclxuXHJcbi8vIFNldCB1cCBsaW5rIHRvIHJlc29sdmUgbW92ZXNcclxubGV0IGQ9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RvTW92ZXMnKTtcclxuZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsXHJcblx0ZnVuY3Rpb24oKXtcclxuXHRcdC8vIFJlc29sdmUgb3JkZXJzXHJcblx0XHRtb3ZlLnJlc29sdmVNb3ZlcyhmbGVldCwgc2hpcHMsIGdyaWQpO1xyXG5cdFx0Ly8gUmVzZXQgbW92ZXNcclxuXHRcdG1vdmUuY2xlYXJNb3ZlTGlzdCgpO1xyXG5cdFx0Ly8gVHVybiBtb3ZlcyBvdmVyIHRvIHRoZSBuZXh0IHBsYXllclxyXG5cdFx0Ly8gRklYTUUgLSBTaW11bGF0aW5nIG1vdmVzIGZvciBub3cuIFJlbW92ZSB3aGVuIHJlYWR5IGZvciByZWFsc2llc1xyXG5cclxuXHR9LCBmYWxzZSk7XHJcbi8vIFNldCB1cCBncmlkXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdteUdyaWQnKS5hcHBlbmRDaGlsZChncmlkLmNsaWNrYWJsZUdyaWQoMTAsIDEwLCBzaGlwcywgZmxlZXQsIHBsYXllcikpO1xyXG5cclxuLy8gU2V0IHVwIGRyYWcvZHJvcCBvZiBtb3Zlc1xyXG4vL2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKS5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsJ3RydWUnKTtcclxuLy9wbGF5ZXIucGxheWVyT3JkZXJIYW5kbGVyKCk7XHJcblxyXG4vKiBTZXQgcmFuZG9tIGZsZWV0ICovXHJcbnNoaXBzLmJ1aWxkU2hpcHMoKTtcclxuc2hpcHMucGxhY2VTaGlwcyhmbGVldCk7XHJcbmxldCB3aG9sZUZsZWV0ID0gZmxlZXQuZ2V0V2hvbGVGbGVldChmbGVldCk7XHJcbmZvciAodCBpbiB3aG9sZUZsZWV0KSB7XHJcblx0Z3JpZC5kaXNwbGF5U2hpcChzaGlwcywgdCk7XHJcbn1cclxuXHJcbi8qIFxyXG4gKiBNb2NrIGdhbWUgd2lsbCBiZSByZW1vdmVkIFxyXG4gKi9cclxubGV0IG0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnTWVnYW5SZWcnKTtcclxubS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdNZWdhbicsIDEsIGdyaWQsIHNoaXBzLCBmbGVldCwgcGxheWVyKTtcclxuICAgICAgICAvL20uc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ01lZ2FuUmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcblx0Ly9kb2N1bWVudC5nZXRFbGVtZW50QnlJZChmbG93W2N1cnJlbnRGbG93XSkuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgLy9tLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKSk7XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG5sZXQgcnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnUnlhblJlZycpO1xyXG5yeS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdSeWFuJywgMiwgZ3JpZCwgc2hpcHMsIGZsZWV0LCBwbGF5ZXIpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdSeWFuUmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgLy9sZXQgcj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnUnlhbicpLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xyXG4gICAgICAgIC8vci5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJykpO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxubGV0IHRyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1RyYWNleVJlZycpO1xyXG50ci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdUcmFjZXknLCAyLCBncmlkLCBzaGlwcywgZmxlZXQsIHBsYXllcik7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1RyYWNleVJlZycpLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxuLyogUGxheSBnYW1lICovXHJcbi8qXHJcbndoaWxlICgxKSB7XHJcblx0cGxheWVyLmdldFR1cm4oKTtcclxufVxyXG4qL1xyXG5cclxuZnVuY3Rpb24gcGxheUdhbWUoKXtcclxuXHRpZiAocGxheWVyLm15VHVybihmbGVldCkpe1xyXG5cdFx0Ly93aW5kb3cub3BlbignJywnYXR0YWNrJywgJ2hlaWdodD0yMDAsd2lkdGg9MjAwLG1lbnViYXI9bm8sc3RhdHVzPW5vLHRpdGxlYmFyPW5vLHRvb2xiYXI9bm8nLCBmYWxzZSApO1xyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbmZpZyAoY29uZmlnKXtcclxuICAgIHNoaXBzID0ge1xyXG4gICAgICAgIGFpcmNyYWZ0Q2FycmllciA6IHtcclxuICAgICAgICAgICAgc2l6ZSA6IDUsXHJcbiAgICAgICAgICAgIGlkIDogJ2FpcmNyYWZ0Q2FycmllcicsXHJcbiAgICAgICAgICAgIGNvbG9yIDogJ0NyaW1zb24nLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ2FjY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ0FpcmNyYWZ0IENhcnJpZXInLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYmF0dGxlc2hpcCA6IHtcclxuICAgICAgICAgICAgc2l6ZSA6IDQsXHJcbiAgICAgICAgICAgIGlkIDogJ2JhdHRsZXNoaXAnLFxyXG4gICAgICAgICAgICBjb2xvcjonRGFya0dyZWVuJyxcclxuICAgICAgICAgICAgY2xpY2tDbGFzcyA6ICdic2NsaWNrZWQnLFxyXG4gICAgICAgICAgICBsYWJlbCA6ICdCYXR0bGVzaGlwJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlc3Ryb3llciA6IHtcclxuICAgICAgICAgICAgc2l6ZSA6IDMsXHJcbiAgICAgICAgICAgIGlkIDogJ2Rlc3Ryb3llcicsXHJcbiAgICAgICAgICAgIGNvbG9yOidDYWRldEJsdWUnLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ2RlY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ0Rlc3Ryb3llcicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtYXJpbmUgIDoge1xyXG4gICAgICAgICAgICBzaXplIDogMyxcclxuICAgICAgICAgICAgaWQgOiAnc3VibWFyaW5lJyxcclxuICAgICAgICAgICAgY29sb3I6J0RhcmtSZWQnLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ3N1Y2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ1N1Ym1hcmluZScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwYXRyb2xCb2F0IDoge1xyXG4gICAgICAgICAgICBzaXplIDogMixcclxuICAgICAgICAgICAgaWQgOiAncGF0cm9sQm9hdCcsXHJcbiAgICAgICAgICAgIGNvbG9yOidHb2xkJyxcclxuICAgICAgICAgICAgY2xpY2tDbGFzcyA6ICdwYmNsaWNrZWQnLFxyXG4gICAgICAgICAgICBsYWJlbCA6ICdQYXRyb2wgQm9hdCcsXHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcbn1cclxuIiwidmFyIHNoaXBzPXJlcXVpcmUoJy4vc2hpcHMuanMnKTtcblxubGV0IG5hdXRpY2FsTWFwID0ge307IC8vIEhhc2ggbG9va3VwIHRoYXQgdHJhY2tzIGVhY2ggc2hpcCdzIHN0YXJ0aW5nIHBvaW50IGFuZCBjdXJyZW50IG9yaWVudGF0aW9uXG5cbmxldCBidWlsZE5hdXRpY2FsQ2hhcnQgPSBmdW5jdGlvbigpe1xuXHRsZXQgY2hhcnQgPSBuZXcgQXJyYXk7XG5cdGZvcihsZXQgaT0wOyBpIDwgMTA7IGkrKykge1xuXHRcdGNoYXJ0W2ldID0gbmV3IEFycmF5O1xuXHRcdGZvciAobGV0IGo9MDsgaiA8IDEwOyBqKyspe1xuXHRcdFx0Y2hhcnRbaV1bal0gPSB1bmRlZmluZWQ7Ly9uZXcgQXJyYXk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBjaGFydDtcbn1cblxubGV0IG5hdXRpY2FsQ2hhcnQgPSBidWlsZE5hdXRpY2FsQ2hhcnQoKTsgLy8gRGV0YWlsZWQgbWF0cml4IG9mIGV2ZXJ5IHNoaXAgaW4gdGhlIGZsZWV0XG5cbmxldCBnZXRGbGVldCA9IGZ1bmN0aW9uKHR5cGUpe1xuXHRsZXQgb3JpZW50YXRpb24gPSBuYXV0aWNhbE1hcFt0eXBlXS5vcmllbnRhdGlvbiA9PSAneCcgPyAwIDogMTtcblxuXHRsZXQgcGllY2VzID0gbmF1dGljYWxNYXBbdHlwZV0uc3RhcnRfY29vcmQuc3BsaXQoJ18nKTtcblx0bGV0IHJldCA9IG5ldyBBcnJheTtcblxuXHR3aGlsZSAobmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldID09IHR5cGUpIHtcblx0XHRyZXQucHVzaCAocGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdKTtcblx0XHRwaWVjZXNbb3JpZW50YXRpb25dID0gcGFyc2VJbnQocGllY2VzW29yaWVudGF0aW9uXSwgMTApICsgMTtcblx0fVxuXG5cdHJldHVybiAocmV0KTtcbn1cblxubGV0IGdldFdob2xlRmxlZXQgPSBmdW5jdGlvbigpe1xuXHRsZXQgcmV0PXt9O1xuXHRmb3IgKHQgaW4gbmF1dGljYWxNYXApIHtcblx0XHRyZXRbdF0gPSBnZXRGbGVldCh0KTtcblx0fVxuXHRyZXR1cm4gcmV0O1xufVxuXG4vLyBUT0RPIC0gc2V0RmxlZXQ6IFJlbW92ZSBwcmV2aW91cyBzaGlwIGZyb20gY2hhcnQgLS0gbWF5IGJlIGRvbmUuLi5uZWVkcyB0ZXN0XG4vKlxuICogc2V0RmxlZXQgLSBwbGFjZSBzaGlwIG9uIG5hdXRpY2FsIGNoYXJ0XG4gKi9cbmxldCBzZXRGbGVldCA9IGZ1bmN0aW9uIChvcmllbnRhdGlvbiwgdHlwZSwgc2l6ZSwgc3RhcnRfY29vcmQsIG9mZnNldCl7XG4gICAgbGV0IHBpZWNlcyA9IHN0YXJ0X2Nvb3JkLnNwbGl0KCdfJyk7XG4gICAgbGV0IGluZGV4ID0gKG9yaWVudGF0aW9uID09ICd4JykgPyAwIDogMTtcblxuICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuXG4gICAgLy8gQWRqdXN0IGZvciBkcmFnL2Ryb3Agd2hlbiBwbGF5ZXIgcGlja3MgYSBzaGlwIHBpZWNlIG90aGVyIHRoYW4gdGhlIGhlYWQuXG4gICAgcGllY2VzW2luZGV4XSA9IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSAtIG9mZnNldDtcblxuICAgIC8qXG4gICAgICogUmVtb3ZlIG9sZCBzaGlwIGZyb20gbmF1dGljYWxDaGFydC9NYXBcbiAgICAgKi9cbiAgICBfY2xlYXJTaGlwKHR5cGUsIHNpemUpO1xuXG4gICAgLy8gc2V0IHRoZSBuYXV0aWNhbCBtYXAgdmFsdWUgZm9yIHRoaXMgYm9hdFxuICAgIG5hdXRpY2FsTWFwW3R5cGVdPXtcblx0ICAgIG9yaWVudGF0aW9uOiBvcmllbnRhdGlvbixcblx0ICAgIHN0YXJ0X2Nvb3JkOiBwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV1cbiAgICB9O1xuXG4gICAgZm9yICh2YXIgaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XG5cdG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSA9IHR5cGU7XG5cdHBpZWNlc1tpbmRleF09IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSArMTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9jbGVhclNoaXAodHlwZSwgc2l6ZSl7XG4gICAgbGV0IG1hcCA9IG5hdXRpY2FsTWFwW3R5cGVdO1xuICAgIGlmIChtYXAgPT09IHVuZGVmaW5lZCl7cmV0dXJuIGZhbHNlO31cblxuICAgIGxldCBwaWVjZXMgPSBtYXAuc3RhcnRfY29vcmQuc3BsaXQoJ18nKTtcbiAgICBsZXQgaW5kZXggPSAobWFwLm9yaWVudGF0aW9uID09ICd4JykgPyAwIDogMTtcblxuICAgIGZvciAoaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XG5cdCAgICBuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV09dW5kZWZpbmVkO1xuXHQgICAgcGllY2VzW2luZGV4XSsrO1xuICAgIH1cblxuICAgIGRlbGV0ZSBuYXV0aWNhbE1hcFt0eXBlXTtcblxufVxuXG4vKlxuICogZ2hvc3RTaGlwIC0gQmVmb3JlIHB1dHRpbmcgYSBzaGlwIG9uIHRoZSBjaGFydCBpdCdzIHBvdGVudGlhbCBsb2NhdGlvbiBuZWVkcyB0byBiZSBwbG90dGVkIHNvIGl0IGNhbiBiZVxuICogY2hlY2tlZCBmb3IgdmFsaWRpdHkuIEdpdmVuIGEgc2hpcCB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHRoZSBwb3RlbnRpYWwgcGxvdHRlZCBjb29yZGluYXRlcy4gVGhlIGZ1bmN0aW9uXG4gKiBtYXkgYnVpbGQgY29vcmRpbmF0ZXMgZm9yIGEga25vd24gc2hpcCBvciBmb3Igb25lIG1vdmVkIGFyb3VuZCBvbiB0aGUgZ3JpZC5cbiAqL1xubGV0IGdob3N0U2hpcCA9IGZ1bmN0aW9uKHR5cGUsIGNvb3JkaW5hdGUsIG9yaWVudGF0aW9uLCBzaXplLCBvZmZzZXQpe1xuXHRsZXQgc2hpcCA9IHNoaXBzLmdldFNoaXAodHlwZSk7XG5cdGxldCB0aGlzU2hpcCA9IHJlYWRNYXAodHlwZSk7XG5cdGxldCBnaG9zdCA9IFtdO1xuXHRjb29yZGluYXRlID0gY29vcmRpbmF0ZSB8fCB0aGlzU2hpcC5zdGFydF9jb29yZDtcblx0b3JpZW50YXRpb24gPSBvcmllbnRhdGlvbiB8fCB0aGlzU2hpcC5vcmllbnRhdGlvbjtcblx0c2l6ZSA9IHNpemUgfHwgc2hpcC5zaXplO1xuXHRvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuXHRsZXQgcGllY2VzID0gY29vcmRpbmF0ZS5zcGxpdCgnXycpO1xuXHRsZXQgaW5kZXggPSAob3JpZW50YXRpb24gPT0gJ3gnKSA/IDA6IDE7XG5cdHBpZWNlc1tpbmRleF0gPSBwYXJzZUludChwaWVjZXNbaW5kZXhdLCAxMCkgLSBvZmZzZXQ7XG5cdGZvciAobGV0IGk9MDsgaSA8IHNpemU7IGkrKykge1xuXHRcdGdob3N0LnB1c2gocGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdKTtcblx0XHRwaWVjZXNbaW5kZXhdID0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApICsxO1xuXHR9XG5cdHJldHVybiBnaG9zdDtcbn07XG5cbmxldCByZWFkTWFwID0gZnVuY3Rpb24odHlwZSl7XG5cdHJldHVybiBuYXV0aWNhbE1hcFt0eXBlXTtcbn1cblxuLypcbiAqIEdpdmVuIGEgY29vcmRpbmF0ZSBvciBhbiBhcnJheSBvZiBjb29yZGluYXRlcyByZXR1cm4gdGhlIHNhbWUgc3RydWN0dXJlIHJldmVhbGluZyB0aGUgY29udGVudHMgb2YgdGhlIGdyaWQuXG4gKiBXaWxsIHJldHVybiBhIHZhbHVlIG9mIGZhbHNlIGlmIHRoZXJlIGlzIGEgcHJvYmxlbSBjaGVja2luZyB0aGUgZ3JpZCAoZXguIGNvb3JkcyBhcmUgb3V0IG9mIHJhbmdlKS5cbiAqL1xubGV0IGNoZWNrR3JpZCA9IGZ1bmN0aW9uKGNvb3JkaW5hdGVzKXtcblx0aWYgKGNvb3JkaW5hdGVzIGluc3RhbmNlb2YgQXJyYXkpe1xuXHRcdGxldCByZXQgPSBuZXcgQXJyYXk7XG5cdFx0Zm9yKGMgaW4gY29vcmRpbmF0ZXMpe1xuXHRcdFx0bGV0IHMgPSBfc2V0Q2hhcnQoY29vcmRpbmF0ZXNbY10pO1xuXHRcdFx0aWYgKHMgPT09IGZhbHNlKSB7cmV0dXJuIGZhbHNlfTtcblx0XHRcdHJldC5wdXNoIChzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJldDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gX3NldENoYXJ0KGNvb3JkaW5hdGVzKTtcblx0fVxufTtcblxubGV0IF9zZXRDaGFydCA9IGZ1bmN0aW9uKGNvb3JkaW5hdGUpe1xuXHRsZXQgcGllY2VzID0gY29vcmRpbmF0ZS5zcGxpdCgnXycpO1xuXHRpZiAocGFyc2VJbnQocGllY2VzWzBdLCAxMCkgPj0gbmF1dGljYWxDaGFydC5sZW5ndGggfHxcblx0ICAgIHBhcnNlSW50KHBpZWNlc1sxXSwgMTApPj0gbmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV0ubGVuZ3RoKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXTtcbn07XG5cbi8qIFxuICogR2l2ZW4gYSBsaXN0IG9mIGNvb3JkaW5hdGVzIGFuZCBhIHNoaXAgdHlwZSB2YWxpZGF0ZSB0aGF0IHRoZSBjb29yZGluYXRlcyBkbyBub3QgdmlvbGF0ZSB0aGUgcnVsZXMgb2Y6XG4gKiBcdCogc2hpcCBtdXN0IGJlIG9uIHRoZSBncmlkXG4gKiBcdCogc2hpcCBtdXN0IG5vdCBvY2N1cHkgdGhlIHNhbWUgc3F1YXJlIGFzIGFueSBvdGhlciBzaGlwXG4gKi9cbmxldCB2YWxpZGF0ZVNoaXAgPSBmdW5jdGlvbiAoY29vcmRpbmF0ZXMsIHR5cGUpe1xuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gb3RoZXIgYm9hdHMgYWxyZWFkeSBvbiBhbnkgYSBzcGFjZVxuICAgIGZvciAodmFyIHA9MDsgcCA8IGNvb3JkaW5hdGVzLmxlbmd0aDsgcCsrKSB7XG5cblx0Ly8gSXMgdGhlcmUgYSBjb2xsaXNpb24/XG5cdGxldCBncmlkID0gY2hlY2tHcmlkKGNvb3JkaW5hdGVzKTtcblx0XG5cdGlmIChncmlkID09IGZhbHNlKSB7cmV0dXJuIGZhbHNlfTsgLy8gSWYgY2hlY2tHcmlkIHJldHVybnMgZmFsc2UgY29vcmRpbmF0ZXMgYXJlIG91dCBvZiByYW5nZVxuXG5cdGZvciAoYyBpbiBjb29yZGluYXRlcykge1xuXHRcdGxldCBwaWVjZXMgPSBjb29yZGluYXRlc1tjXS5zcGxpdCgnXycpO1xuXHRcdFx0aWYgKG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSAhPSB0eXBlICYmXG5cdFx0XHQgICAgbmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldICE9IHVuZGVmaW5lZCkge3JldHVybiBmYWxzZX07XG5cdH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGdldEZsZWV0OiBnZXRGbGVldCxcbiAgICBzZXRGbGVldDogc2V0RmxlZXQsXG4gICAgZ2V0V2hvbGVGbGVldDogZ2V0V2hvbGVGbGVldCxcbiAgICB2YWxpZGF0ZVNoaXA6IHZhbGlkYXRlU2hpcCxcbiAgICBjaGVja0dyaWQ6IGNoZWNrR3JpZCxcbiAgICBidWlsZE5hdXRpY2FsQ2hhcnQ6IGJ1aWxkTmF1dGljYWxDaGFydCxcbiAgICBnaG9zdFNoaXA6IGdob3N0U2hpcCxcbn1cbiIsImxldCBmbGVldCA9IHJlcXVpcmUoJy4vZmxlZXQnKTtcclxubGV0IHNoaXBzID0gcmVxdWlyZSgnLi9zaGlwcycpO1xyXG5cclxubGV0IG1vdmVTaGlwID0gZnVuY3Rpb24oc2hpcHMsIGRyb3BPYmosIGV2LCBmbGVldCwgcGxheWVyKXtcclxuICAgIGNvbnNvbGUubG9nKCdwcmUtc2V0IGZsZWV0IG1vdmUnKTtcclxuICAgIGxldCBzaGlwPXNoaXBzLmdldFNoaXAoZHJvcE9iai50eXBlKTtcclxuICAgIC8vIFJlbW92ZSBpbml0aWFsIGltYWdlXHJcbiAgICBkaXNwbGF5U2hpcChzaGlwcywgZHJvcE9iai50eXBlKTtcclxuXHJcbiAgICBmbGVldC5zZXRGbGVldCAoZHJvcE9iai5vcmllbnRhdGlvbiwgZHJvcE9iai50eXBlLCBzaGlwLnNpemUsIGV2LnRhcmdldC5pZCwgZHJvcE9iai5vZmZzZXQpOyBcclxuXHJcbiAgICAvLyBSZWRyYXcgaW1hZ2UgaW4gbmV3IGxvY2F0aW9uXHJcbiAgICBkaXNwbGF5U2hpcChzaGlwcywgZHJvcE9iai50eXBlKTtcclxufVxyXG5cclxuLypcclxuICogQ2FsbGVkIGFmdGVyIHBsYXllciBzZXRzIGluaXRpYWwgZmxlZXQuIE92ZXJ3cml0ZSB0aGUgbW92ZVNoaXAgZnVuY3Rpb24gc28gaXQgYmVoYXZlcyBkaWZmZXJlbnQuXHJcbiAqL1xyXG5sZXQgc2V0TW92ZVNoaXAgPSBmdW5jdGlvbigpe1xyXG5cdC8qIGNoYW5nZSB2YWx1ZSBvZiBtb3ZlU2hpcCBmdW5jdGlvbiAqL1xyXG5cdG1vdmVTaGlwID0gZnVuY3Rpb24oc2hpcHMsIGRyb3BPYmosIGV2LCBmbGVldCwgcGxheWVyLCBkcm9wU2hpcCwgbW92ZVR5cGUpe1xyXG5cdCAgICBjb25zb2xlLmxvZygnSW4gZ2FtZSBtb3ZlJyk7XHJcblx0ICAgIC8vIFJlbW92ZSBpbml0aWFsIGltYWdlXHJcblx0ICAgIGRpc3BsYXlTaGlwKHNoaXBzLCBkcm9wT2JqLnR5cGUpO1xyXG5cclxuXHQgICAgLy8gZHJhdyBpbWFnZSBiYXNlZCBvbiBkcm9wU2hpcFxyXG5cdCAgICBkaXNwbGF5U2hpcChzaGlwcywgZHJvcE9iai50eXBlLCBkcm9wU2hpcCk7XHJcblxyXG5cdCAgICAvLyBTdG9yZSBnaG9zdFNoaXAgaW4gbW92ZSBvYmplY3RcclxuXHQgICAgcGxheWVyLnNldE1vdmUoe3R5cGU6IG1vdmVUeXBlLCBjb29yZGluYXRlOiBldi50YXJnZXQuaWQsIGdob3N0OiBkcm9wU2hpcCwgb3JpZW50YXRpb246IGRyb3BPYmoub3JpZW50YXRpb24sIHNoaXBUeXBlOiBkcm9wT2JqLnR5cGV9KTtcclxuXHR9XHJcbn1cclxuXHJcbi8qXHJcbiAqIEJ1aWxkIHRoZSBncmlkIGFuZCBhdHRhY2ggaGFuZGxlcnMgZm9yIGRyYWcvZHJvcCBldmVudHNcclxuICovXHJcbmxldCBjbGlja2FibGVHcmlkID0gZnVuY3Rpb24gKCByb3dzLCBjb2xzLCBzaGlwcywgZmxlZXQsIHBsYXllciwgcGhhbmRsZSl7XHJcbiAgICBsZXQgZ3JpZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICBncmlkLmNsYXNzTmFtZT0nZ3JpZCc7XHJcbiAgICBmb3IgKHZhciByPTA7cjxyb3dzOysrcil7XHJcbiAgICAgICAgdmFyIHRyID0gZ3JpZC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpKTtcclxuICAgICAgICBmb3IgKHZhciBjPTA7Yzxjb2xzOysrYyl7XHJcbiAgICAgICAgICAgIHZhciBjZWxsID0gdHIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKSk7XHJcbiAgICAgICAgICAgIC8vIEVhY2ggY2VsbCBvbiB0aGUgZ3JpZCBpcyBvZiBjbGFzcyAnY2VsbCdcclxuICAgICAgICAgICAgY2VsbC5jbGFzc05hbWU9J2NlbGwnO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHRoZSBJRCB2YWx1ZSBvZiBlYWNoIGNlbGwgdG8gdGhlIHJvdy9jb2x1bW4gdmFsdWUgZm9ybWF0dGVkIGFzIHJfY1xyXG4gICAgICAgICAgICBjZWxsLmlkID0gciArICdfJyArIGM7XHJcblxyXG4gICAgICAgICAgICBpZiAocGhhbmRsZSA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgX3NldE15TGlzdGVuZXJzKGNlbGwsIHNoaXBzLCBmbGVldCwgcGxheWVyKVxyXG5cdCAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICBfc2V0UGxheWVyTGlzdGVuZXJzKHBsYXllciwgY2VsbCwgcGhhbmRsZSk7XHJcblx0ICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZ3JpZDtcclxufVxyXG5cclxuZnVuY3Rpb24gX3NldE15TGlzdGVuZXJzKGNlbGwsIHNoaXBzLCBmbGVldCwgcGxheWVyKXtcclxuICAgICAgICAgICAgLy8gU2V0IHVwIGRyYWcgYW5kIGRyb3AgZm9yIGVhY2ggY2VsbC5cclxuICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsJ3RydWUnKTtcclxuXHJcblxyXG4gICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkPSdtb3ZlJztcclxuXHRcdCAgICBsZXQgdHlwZSA9IF9nZXRUeXBlQnlDbGFzcyhzaGlwcywgdGhpcy5jbGFzc05hbWUpO1xyXG5cdFx0ICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHdoaWNoIHNxdWFyZSB3YXMgY2xpY2tlZCB0byBndWlkZSBwbGFjZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3RhcnQgPSBfZmluZF9zdGFydCh0aGlzLmlkLCBzaGlwLm9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dC9wbGFpblwiLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiAgICAgICAgc3RhcnQub2Zmc2V0LFxyXG5cdFx0XHRcdCAgICAgICAgc3RhcnRfY29vcmQ6ICAgc3RhcnQuc3RhcnRfY29vcmQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogICAgICAgICBzaGlwLnNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAgICAgICAgICB0eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb29yZDogZmxlZXQuZ2hvc3RTaGlwKHR5cGUsIHN0YXJ0LnN0YXJ0X2Nvb3JkKSxcclxuXHRcdFx0XHQgICAgICAgIG9yaWVudGF0aW9uOiAgIHNoaXAub3JpZW50YXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBEcmFnL0Ryb3AgY2FwYWJpbGl0aWVzXHJcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkcm9wcGluZycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkcm9wT2JqID0gSlNPTi5wYXJzZShldi5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvcGxhaW5cIikpO1xyXG5cdFx0ICAgIGNvbnNvbGUubG9nKCdjdXJyZW50IGNvb3JkOiAnLCBkcm9wT2JqLmN1cnJlbnRfY29vcmQpO1xyXG5cdFx0ICAgIGxldCBzaGlwPXNoaXBzLmdldFNoaXAoZHJvcE9iai50eXBlKTtcclxuXHRcdCAgICBsZXQgZHJvcFNoaXAgPSBmbGVldC5naG9zdFNoaXAoZHJvcE9iai50eXBlLCBldi50YXJnZXQuaWQsIGRyb3BPYmoub3JpZW50YXRpb24sIHNoaXAuc2l6ZSwgZHJvcE9iai5vZmZzZXQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihmbGVldC52YWxpZGF0ZVNoaXAoZHJvcFNoaXAsIGRyb3BPYmoudHlwZSkpIHtcclxuXHRcdFx0ICAgIC8qIFRoZXJlIGFyZSBkaWZmZXJlbnQgYmVoYXZpb3JzIGZvciBzZXR0aW5nIHNoaXBzIGJhc2VkIG9uIHRoZSBpbml0aWFsIGxvYWRpbmcgb2YgdGhlIHNoaXBzXHJcblx0XHRcdCAgICAgKiB2ZXJzdXMgbW92aW5nIGEgc2hpcCBpbiBnYW1lLiBXaGVuIG1vdmluZyBzaGlwcyBpbiBnYW1lIHRoZSBkaXNwbGF5IHNob3VsZCBjaGFuZ2UgdG8gcmVmbGVjdFxyXG5cdFx0XHQgICAgICogdGhlIHBvdGVudGlhbCBtb3ZlIGJ1dCB0aGUgaW50ZXJuYWwgc3RydWN0dXJlcyBzaG91bGQgbm90IGNoYW5nZSB1bnRpbCBpdCBoYXMgYmVlbiB2YWxpZGF0ZWRcclxuXHRcdFx0ICAgICAqIHdoZW4gcmVzb2x2aW5nIG1vdmVzLlxyXG5cdFx0XHQgICAgICpcclxuXHRcdFx0ICAgICAqIFdoZW4gc2V0dGluZyB1cCBzaGlwcyBmb3IgdGhlIGluaXRpYWwgZ2FtIHRoZSBzdHJ1Y3R1cmVzIHNob3VsZCBjaGFuZ2UgYWxvbmcgd2l0aCB0aGUgZGlzcGxheSxcclxuXHRcdFx0ICAgICAqIGFsbCBhdCBvbmNlLlxyXG5cdFx0XHQgICAgICpcclxuXHRcdFx0ICAgICAqIFRoZSBmdW5jdGlvbiBtb3ZlU2hpcCBpcyBhIGNsb3N1cmUgd2hvc2UgdmFsdWUgaXMgY2hhbmdlZCBvbmNlIHRoZSBwbGF5ZXIgc2V0cyB0aGUgaW5pdGlhbCBmbGVldC5cclxuXHRcdFx0ICAgICAqL1xyXG5cdFx0XHQgICAgaWYocGxheWVyLmNhbk1vdmUoKSkge21vdmVTaGlwKHNoaXBzLCBkcm9wT2JqLCBldiwgZmxlZXQsIHBsYXllciwgZHJvcFNoaXAsICdtb3ZlJyl9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkcmFnb3ZlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXYuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3Q9J21vdmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApKTtcclxuXHJcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoXHJcblx0XHRmdW5jdGlvbihlKXtcclxuXHRcdCAgICBsZXQgZHJvcCA9IHt9O1xyXG5cdFx0ICAgIGxldCB0eXBlID0gX2dldFR5cGVCeUNsYXNzKHNoaXBzLCB0aGlzLmNsYXNzTmFtZSk7XHJcblx0XHQgICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG5cdFx0ICAgIGxldCBvcmllbnRhdGlvbiA9IChzaGlwLm9yaWVudGF0aW9uID09ICd4JykgPyAneSc6J3gnOyAvLyBmbGlwIHRoZSBvcmllbnRhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdGFydCA9IF9maW5kX3N0YXJ0KGUudGFyZ2V0LmlkLCBvcmllbnRhdGlvbiwgc2hpcC5zaXplLCB0eXBlKTtcclxuXHRcdCAgICBsZXQgZ2hvc3QgPSBmbGVldC5naG9zdFNoaXAodHlwZSwgZS50YXJnZXQuaWQsIG9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHN0YXJ0Lm9mZnNldCk7XHJcblxyXG5cdFx0ICAgIGRyb3AudHlwZSA9IHR5cGU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGZsZWV0LnZhbGlkYXRlU2hpcChnaG9zdCwgdHlwZSkpIHtcclxuXHRcdFx0aWYocGxheWVyLmNhbk1vdmUoKSkge21vdmVTaGlwKHNoaXBzLCBkcm9wLCBlLCBmbGVldCwgcGxheWVyLCBnaG9zdCwgJ3Bpdm90Jyl9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX3NldFBsYXllckxpc3RlbmVycyhwbGF5ZXIsIGNlbGwsIGhhbmRsZSl7XHJcbiAgICAgICAgICAgIC8vIFNldCB0aGUgSUQgdmFsdWUgb2YgZWFjaCBjZWxsIHRvIHRoZSByb3cvY29sdW1uIHZhbHVlIGZvcm1hdHRlZCBhcyByX2NcclxuICAgICAgICAgICAgY2VsbC5pZCA9IGhhbmRsZSArICdfJyArIGNlbGwuaWQ7XHJcbiAgICAgICAgICAgIC8vIFNldCB1cCBkcmFnIGFuZCBkcm9wIGZvciBlYWNoIGNlbGwuXHJcblxyXG4gICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKFxyXG5cdFx0ZnVuY3Rpb24oZSl7XHJcblx0XHQgICAgaWYocGxheWVyLmNhbk1vdmUoKSkge1xyXG5cdFx0ICAgICAgICBwbGF5ZXIuc2V0TW92ZSh7dHlwZTogJ2F0dGFjaycsXHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlOiBlLnRhcmdldC5pZH0pO1xyXG5cdFx0ICAgICAgICBjb25zb2xlLmxvZyggZS50YXJnZXQuaWQgKyAnIGlzIHVuZGVyIGF0dGFjaycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHRcdH1cclxuICAgICAgICAgICAgKSk7XHJcbn1cclxuXHJcbi8qXHJcbiAqIF9maW5kX3N0YXJ0IC0gRGV0ZXJtaW5lIHRoZSBzdGFydGluZyBjb29yZGluYXRlIG9mIGEgc2hpcCBnaXZlbiB0aGUgc3F1YXJlIHRoYXQgd2FzIGNsaWNrZWQuIEZvciBleGFtcGxlXHJcbiAqIGl0IGlzIHBvc3NpYmxlIHRoYXQgYSBiYXR0bGVzaGlwIGFsb25nIHRoZSB4LWF4aXMgd2FzIGNsaWNrZWQgYXQgbG9jYXRpb24gM18zIGJ1dCB0aGF0IHdhcyB0aGUgc2Vjb25kIHNxdWFyZVxyXG4gKiBvbiB0aGUgc2hpcC4gVGhpcyBmdW5jdGlvbiB3aWxsIGlkZW50aWZ5IHRoYXQgdGhlIGJhdHRsZXNoaXAgc3RhcnRzIGF0IDJfMy5cclxuICovXHJcblxyXG5mdW5jdGlvbiBfZmluZF9zdGFydChzdGFydF9wb3MsIG9yaWVudGF0aW9uLCBzaXplLCB0eXBlKXtcclxuICAgIGxldCBpbmRleCA9IChvcmllbnRhdGlvbiA9PSAneCcpID8gMCA6IDE7XHJcblxyXG4gICAgbGV0IHBpZWNlcz1zdGFydF9wb3Muc3BsaXQoJ18nKTtcclxuICAgIGxldCBvZmZzZXQgPSAwO1xyXG5cclxuICAgIGZvciAoaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XHJcblx0aWYgKHBpZWNlc1tpbmRleF0gPT0gMCkge2JyZWFrO31cclxuICAgICAgICBwaWVjZXNbaW5kZXhdLS07XHJcblx0bGV0IGcgPSBmbGVldC5jaGVja0dyaWQocGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdKTtcclxuICAgICAgICBpZiAoZyAhPSB1bmRlZmluZWQgJiYgZyA9PSB0eXBlICYmIGcgIT0gZmFsc2Upe1xyXG5cdCAgICBvZmZzZXQrKztcclxuICAgICAgICAgICAgc3RhcnRfcG9zID0gcGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge3N0YXJ0X3Bvczogc3RhcnRfcG9zLCBvZmZzZXQ6IG9mZnNldH07XHJcbn1cclxuXHJcbmxldCBkaXNwbGF5U2hpcCA9IGZ1bmN0aW9uIChzaGlwcywgdHlwZSwgYykge1xyXG4gICAgbGV0IGNvb3JkaW5hdGVzID0gYyB8fCBmbGVldC5nZXRGbGVldCh0eXBlKTtcclxuICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuXHJcbiAgICBmb3IgKGNvb3JkIGluIGNvb3JkaW5hdGVzKSB7XHJcbiAgICAgICAgX3NldFNwYWNlKGNvb3JkaW5hdGVzW2Nvb3JkXSwgc2hpcC5jbGlja0NsYXNzKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gX3NldFNwYWNlKHNwYWNlLCBjbGFzc05hbWUpIHtcclxuICAgIHZhciBiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3BhY2UpOyBcclxuICAgIGIuY2xhc3NMaXN0LnRvZ2dsZShjbGFzc05hbWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBfZ2V0VHlwZUJ5Q2xhc3Moc2hpcHMsIGNsYXNzTmFtZSl7XHJcblx0bGV0IHNoaXBMaXN0ID0gc2hpcHMuZ2V0U2hpcCgpO1xyXG5cdGZvciAocyBpbiBzaGlwTGlzdCl7XHJcblx0XHRpZiAoY2xhc3NOYW1lLm1hdGNoKHNoaXBMaXN0W3NdLmNsaWNrQ2xhc3MpKXtcclxuXHRcdFx0cmV0dXJuIHNoaXBMaXN0W3NdLnR5cGU7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cz17XHJcbiAgICBjbGlja2FibGVHcmlkOiBjbGlja2FibGVHcmlkLFxyXG4gICAgZGlzcGxheVNoaXA6IGRpc3BsYXlTaGlwLFxyXG4gICAgc2V0TW92ZVNoaXA6IHNldE1vdmVTaGlwXHJcbn1cclxuXHJcbiIsIi8vIE1vZHVsZSB0byBtYW5hZ2UgbW92ZXMgb24gcGxheWVyJ3MgdHVybi5cblxubGV0IGZsZWV0ID0gcmVxdWlyZSgnLi9mbGVldC5qcycpO1xuXG5sZXQgbW92ZUxpc3QgPSBbXTtcbmxldCBtb3ZlTWFwID0ge307XG5cbmxldCBkZWxldGVNb3ZlID0gZnVuY3Rpb24oKXtcbn1cblxubGV0IGNsZWFyTW92ZUxpc3QgPSBmdW5jdGlvbigpIHtcblx0bW92ZUxpc3QgPSBbXTtcbn1cblxuLypcbiAqIENyZWF0ZSBhIGJsb2NrIHRvIHZpc3VhbGx5IHJlcHJlc2VudCBhIG1vdmUuIEdlbmVyaWMgSFRNTCBibG9jayBmb3IgbW92ZSBvYmplY3RzOlxuICogPGRpdiBpZD08dHlwZT5fPHBsYXllcj5fPGNvb3Jkcz4gY2xhc3M9XCJtb3ZlXCI+XG4gKiAgIDxkaXYgY2xhc3M9XCJtb3ZlRGV0YWlsXCI+XG4gKiAgICAgYXR0YWNrOiBtZWdhbl8wXzAgKCogTW92ZSB0ZXh0ICopYFxuICogICAgIDxkaXYgY2xhc3M9XCJkZWxldGVcIj5kZWxldGU8L2Rpdj4gPCEtLSBlbGVtZW50IHRvIGRlbGV0ZSBtb3ZlIGJlZm9yZSBzdWJtaXR0ZWQgLS0+XG4gKiAgIDwvZGl2PlxuICogPC9kaXY+XG4gKiBcbiAqL1xubGV0IG1vdmVMaXN0QmxvY2sgPSBmdW5jdGlvbihtb3ZlKSB7XG5cdGxldCBtb3ZlU3RydWN0PXt9O1xuXHRsZXQgbXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0bW92ZVN0cnVjdC5pZCA9IG12LmlkID0gbW92ZS50eXBlICsgJ18nICsgbW92ZS5jb29yZGluYXRlO1xuXHRtdi5jbGFzc05hbWUgPSAnbW92ZSc7XG5cbiAgICAgICAgbXYuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCd0cnVlJyk7XG5cdG1vdmVPcmRlckhhbmRsZXIobXYpO1xuXG5cdGxldCBtb3ZlU3RyaW5nID0gbW92ZS50eXBlICsgJzogJyArIG1vdmUuY29vcmRpbmF0ZTtcblx0bGV0IG1kdGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0bWR0bC5pbm5lckhUTUw9bW92ZVN0cmluZztcblxuXHRsZXQgbWRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRtZGVsLmlubmVySFRNTD0nRGVsZXRlJztcblxuXHRtdi5hcHBlbmRDaGlsZChtZHRsKTtcblx0bXYuYXBwZW5kQ2hpbGQobWRlbCk7XG5cdFxuXHRtb3ZlU3RydWN0LmRvbSA9IG12O1xuXHRtb3ZlU3RydWN0LnR5cGUgPSBtb3ZlLnR5cGU7XG5cdG1vdmVTdHJ1Y3QuZ2hvc3QgPSBtb3ZlLmdob3N0O1xuXHRtb3ZlU3RydWN0Lm9yaWVudGF0aW9uID0gbW92ZS5vcmllbnRhdGlvbjtcblx0bW92ZVN0cnVjdC5zaGlwVHlwZSA9IG1vdmUuc2hpcFR5cGU7XG5cdG1vdmVTdHJ1Y3Quc2l6ZSA9IG1vdmUuc2hpcFNpemU7XG5cblx0cmV0dXJuIG1vdmVTdHJ1Y3Q7XG59XG5cbi8vIFNldCB1cCBkcmFnIGRyb3AgZnVuY3Rpb25hbGl0eSBmb3Igc2V0dGluZyBtb3ZlIG9yZGVyXG5sZXQgbW92ZU9yZGVySGFuZGxlciA9IGZ1bmN0aW9uKHBvKSB7XG4gICAgcG8uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywoZnVuY3Rpb24oZSl7XG5cdCAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkPSdtb3ZlJztcblx0ICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsXG5cdFx0SlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0Y2hhbmdlTW92ZTogZS50YXJnZXQuaWRcblx0XHR9KVxuXHQgICAgKTtcbiAgICB9KSk7XG4gICAgcG8uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0PSdtb3ZlJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pKTtcbiAgICBwby5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywoZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRyb3BPYmogPSBKU09OLnBhcnNlKGUuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJ0ZXh0L3BsYWluXCIpKTtcblx0ICAgIFx0ICAgIGFsdGVyTW92ZUluZGV4KGRyb3BPYmouY2hhbmdlTW92ZSwgZS50YXJnZXQuaWQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSkpO1xufVxuXG5mdW5jdGlvbiBhbHRlck1vdmVJbmRleChzdGFydEluZGV4LCBlbmRJbmRleCl7XG5cdHN0YXJ0SWQgPSBzdGFydEluZGV4O1xuXHRzdGFydEluZGV4ID0gcGFyc2VJbnQobW92ZU1hcFtzdGFydEluZGV4XSk7XG5cdGVuZEluZGV4ICAgPSBwYXJzZUludChtb3ZlTWFwW2VuZEluZGV4XSk7XG5cblx0bGV0IGJlZ2luID0gc3RhcnRJbmRleCA8IGVuZEluZGV4ID8gcGFyc2VJbnQoc3RhcnRJbmRleCwgMTApIDogcGFyc2VJbnQoZW5kSW5kZXgsIDEwKTtcblx0bGV0IGVuZCA9ICAgc3RhcnRJbmRleCA8IGVuZEluZGV4ID8gcGFyc2VJbnQoZW5kSW5kZXgsIDEwKSA6IHBhcnNlSW50KHN0YXJ0SW5kZXgsIDEwKTtcblx0bGV0IGhvbGQgPSBtb3ZlTGlzdFtzdGFydEluZGV4XTtcblxuXHR3aGlsZShiZWdpbiA8IGVuZCl7XG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobW92ZUxpc3RbYmVnaW5dLmlkKS5hcHBlbmRDaGlsZCgobW92ZUxpc3RbYmVnaW4rMV0pKTtcblx0XHRtb3ZlTGlzdFtiZWdpbl0gPSBtb3ZlTGlzdFtiZWdpbisxXTtcblx0XHRtb3ZlTWFwW3N0YXJ0SWRdID0gYmVnaW4rMTtcblx0XHRiZWdpbisrO1xuXHR9XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vdmVMaXN0W2VuZF0uaWQpLmFwcGVuZENoaWxkKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkW2hvbGRdLmlkKTtcblx0bW92ZUxpc3RbZW5kXSA9IGhvbGQ7XG5cdG1vdmVNYXBbc3RhcnRJZF0gPSBlbmQ7XG59XG5cbmxldCByZXNvbHZlTW92ZXMgPSBmdW5jdGlvbiAoZmxlZXQsIHNoaXBzLCBncmlkKXtcblx0bGV0IHBhcmVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKTtcblx0Y29uc29sZS5sb2coJ1Jlc29sdmluZyBtb3ZlcycpO1xuXHRmb3IobSBpbiBtb3ZlTGlzdCkge1xuXHRcdGxldCBtb3ZlID0gbW92ZUxpc3RbbV07XG5cdFx0Y29uc29sZS5sb2coJ21vdmU6ICcsIG1vdmUpO1xuXHRcdHN3aXRjaChtb3ZlLnR5cGUpIHtcblx0XHRcdGNhc2UgJ2F0dGFjayc6IFxuXHRcdFx0XHRhdHRhY2tQbGF5ZXIobW92ZS5jb29yZGluYXRlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdtaW5lJzpcblx0XHRcdFx0c2V0TWluZShtb3ZlLmNvb3JkaW5hdGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ21vdmUnOlxuXHRcdFx0XHRtb3ZlU2hpcChmbGVldCwgc2hpcHMsIGdyaWQsIG1vdmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3Bpdm90Jzpcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRsZXQgY2hpbGQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChtb3ZlLmlkKTtcblx0cGFyZW50LnJlbW92ZUNoaWxkKGNoaWxkKTtcblx0fVxufVxuXG5sZXQgbW92ZVNoaXAgPSBmdW5jdGlvbihmbGVldCwgc2hpcHMsIGdyaWQsIG1vdmUpe1xuXHQvLyBDaGVjayBmb3IgbWluZXMgYmFzZWQgb24gZ2hvc3QgLSBzZW5kIG1lc3NhZ2UgdG8gbWluZSBzZXJ2aWNlXG5cdGxldCBibGFzdEF0ID0gX2NoZWNrX2Zvcl9taW5lKG1vdmUuZ2hvc3QpO1xuXHRpZiAoYmxhc3RBdCAhPSBmYWxzZSl7XG5cdFx0Ly8gUmVzZXQgZ2hvc3QgaWYgbWluZSBmb3VuZCAtIElmIGEgbWluZSBoYXMgYmVlbiBlbmNvdW50ZXJlZCB0aGVuIHRoZSBzaGlwIG9ubHkgbW92ZXMgdG8gdGhlIHBvaW50IG9mIHRoZSBibGFzdFxuXHRcdF9yZXNldEdob3N0KGZsZWV0LCBibGFzdEF0LCBtb3ZlKTtcblx0XHQvLyBUT0RPIHNldCBzaGlwIGFzIGhpdFxuXHR9XG5cblx0bGV0IGZsID0gZmxlZXQuZ2V0RmxlZXQobW92ZS5zaGlwVHlwZSk7XG5cdGxldCBzID0gc2hpcHMuZ2V0U2hpcChtb3ZlLnNoaXBUeXBlKTtcblxuXHRpZiAoZmxbMF0gPT0gbW92ZS5naG9zdFswXSAmJiBtb3ZlLm9yaWVudGF0aW9uID09IHMub3JpZW50YXRpb24pIHsgLy8gY2hlY2sgc3RhcnRpbmcgcG9pbnRzIGFuZCBvcmllbnRhdGlvbiBzZXQgYW5kIHJlZGlzcGxheSBvbmx5IGlmIGRpZmZlcmVudFxuXHRcdC8vIFZhbGlkYXRlIG1vdmUgY2FuIGJlIG1hZGVcblx0XHRpZihmbGVldC52YWxpZGF0ZVNoaXAobW92ZS5naG9zdCwgbW92ZS5zaGlwVHlwZSkpIHtcblx0XHRcdGdyaWQuZGlzcGxheVNoaXAoc2hpcHMsIG1vdmUuc2hpcFR5cGUpO1xuXHRcdFx0Ly8gU2V0IGdob3N0IHRvIE5hdXRpY2FsQ2hhcnQvTWFwXG5cdFx0XHRmbGVldC5zZXRGbGVldCAobW92ZS5vcmllbnRhdGlvbiwgbW92ZS5zaGlwVHlwZSwgc2hpcHMuZ2V0U2hpcChtb3ZlLnNoaXBUeXBlKS5zaXplLCBtb3ZlLmdob3N0WzBdLCAwKTsgXG5cdFx0fVxuXG5cdFx0Ly8gRGlzcGxheSBuZXcgc2hpcCBsb2NhdGlvbiBiYXNlZCBvbiBOYXV0aWNhbENoYXJ0L01hcFxuXHRcdGdyaWQuZGlzcGxheVNoaXAoc2hpcHMsIG1vdmUuc2hpcFR5cGUsIG1vdmUuZ2hvc3QpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIF9yZXNldEdob3N0KGZsZWV0LCBibGFzdEF0LCBtb3ZlKXtcblx0Zm9yIChpIGluIG1vdmUuZ2hvc3Qpe1xuXHRcdGlmIChibGFzdEF0ID09IG1vdmUuZ2hvc3RbaV0pIGJyZWFrO1xuXHR9XG5cblx0cmV0dXJuIG1vdmUuZ2hvc3QgPSBmbGVldC5naG9zdFNoaXAobW92ZS50eXBlLCBtb3ZlLmdob3N0W2ldLCBtb3ZlLm9yaWVudGF0aW9uLCBtb3ZlLmdob3N0Lmxlbmd0aCwgaSk7XG59XG5cbi8vIFN0dWIgZm9yIG1pbmUgZGV0ZWN0aW9uXG5mdW5jdGlvbiBfY2hlY2tfZm9yX21pbmUoZyl7XG5cdGxldCBtaW5lQXQgPSB7JzBfNic6IDEsICcxXzYnOiAxLCAnMl82JzogMSwgJzNfNic6IDEsICc0XzYnOiAxLCAnNV82JzogMSwgJzZfNic6IDEsICc3XzYnOiAxLCAnOF82JzogMSwgJzlfNic6IDF9O1xuXHRmb3IoaSBpbiBnKSB7XG5cdFx0Ly8gcmV0dXJuIGxvY2F0aW9uIHdoZXJlIG1pbmUgc3RydWNrXG5cdFx0aWYobWluZUF0W2dbaV1dID09IDEpIHsgY29uc29sZS5sb2coJ0JPT00nKTtcblx0XHRcdHJldHVybiBnW2ldOyB9XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXHRcblxubGV0IGF0dGFja1BsYXllciA9IGZ1bmN0aW9uKGNvb3JkaW5hdGUpe1xuXHQvLyBTZW5kIGEgbWVzc2FnZSByZXF1ZXN0aW5nIGhpdC9taXNzIHZhbHVlIG9uIGVuZW15J3MgZ3JpZFxuXHQvLyBJbmZvcm0gYWxsIG9mIGVuZW15J3MgY29vcmRpbmF0ZSBzdGF0dXNcbn1cblxubGV0IHNldE1pbmUgPSBmdW5jdGlvbihjb29yZGluYXRlKXtcblx0Ly8gU2VuZCBhIG1lc3NhZ2UgcmVxdWVzdGluZyBoaXQvbWlzcyB2YWx1ZSBvbiBlbmVteSdzIGdyaWRcblx0Ly8gSWYgbm90IGEgaGl0IHJlZ2lzdGVyIHdpdGggc2VydmljZSB0aGF0IG1pbmUgcGxhY2VkIG9uIGVuZW15IGdyaWRcbn1cblxubGV0IHNldE1vdmUgPSBmdW5jdGlvbihtb3ZlKXtcblx0Ly9sZXQgbW92ZVN0cmluZztcblx0aWYobW92ZU1hcFttb3ZlLmNvb3JkaW5hdGVdID09IHVuZGVmaW5lZCkge1xuXHRcdG1vdmVNYXBbbW92ZS5jb29yZGluYXRlXSA9IG1vdmVMaXN0Lmxlbmd0aDtcblx0XHQvL21vdmVTdHJpbmcgPSBtb3ZlLnR5cGUgKyAnOiAnICsgbW92ZS5jb29yZGluYXRlO1xuXHRcdC8vbGV0IGIgPSBtb3ZlTGlzdEJsb2NrKG1vdmUuY29vcmRpbmF0ZSwgbW92ZVN0cmluZyk7XG5cdFx0bGV0IG12ID0gbW92ZUxpc3RCbG9jayhtb3ZlKTtcblx0XHRtb3ZlTGlzdC5wdXNoKG12KTtcblx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheU9yZGVyJykuYXBwZW5kQ2hpbGQobXYuZG9tKTtcblx0fVxufVxuXG5sZXQgZ2V0TW92ZVNpemUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gbW92ZUxpc3QubGVuZ3RoO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjbGVhck1vdmVMaXN0OiBjbGVhck1vdmVMaXN0LFxuICAgIHNldE1vdmU6IHNldE1vdmUsXG4gICAgZGVsZXRlTW92ZTogZGVsZXRlTW92ZSxcbiAgICBtb3ZlT3JkZXJIYW5kbGVyOiBtb3ZlT3JkZXJIYW5kbGVyLFxuICAgIHJlc29sdmVNb3ZlczogcmVzb2x2ZU1vdmVzLFxuICAgIGdldE1vdmVTaXplOiBnZXRNb3ZlU2l6ZSxcbn1cbiIsIi8vbGV0IHJhYmJpdCA9IHJlcXVpcmUoJy4vYnNfUmFiYml0TVEnKTtcbmxldCBmbGVldCA9IHJlcXVpcmUoJy4vZmxlZXQuanMnKTtcbmxldCBtb3ZlID0gcmVxdWlyZSgnLi9tb3ZlLmpzJyk7XG5cbmxldCBwbGF5ZXJSb3N0ZXIgPSBuZXcgT2JqZWN0OyAvLyBQbGFjZWhvbGRlciBmb3IgYWxsIHBsYXllcnMgaW4gdGhlIGdhbWVcbmxldCBwbGF5ZXJPcmRlciA9IFtdOyAvLyBPcmRlciBvZiBwbGF5ZXIgdHVyblxuXG5sZXQgbWU7XG5sZXQgb3JkZXJJbmRleD0wO1xubGV0IGZsb3c9WydyZWdpc3RlcicsJ2dhbWUnXTtcbmxldCBjdXJyZW50RmxvdztcblxubGV0IGNhbk1vdmUgPSBmdW5jdGlvbigpIHtcblx0aWYgKHBsYXllck9yZGVyLmxlbmd0aCA+IG1vdmUuZ2V0TW92ZVNpemUoKSkgcmV0dXJuIHRydWU7XG5cblx0cmV0dXJuIGZhbHNlO1xufVxuXG4vLyBSZWdpc3RlciBoYW5kbGVcbmxldCByZWdpc3RlciA9IGZ1bmN0aW9uKGhhbmRsZSl7XG5cdG1lID0gaGFuZGxlOyAvLyBTZWxmIGlkZW50aWZ5IHRoaW5lc2VsZlxuXHQvLyBUT0RPIC0gY2FsbCBvdXQgdG8gdGhlIHJlZ2lzdHJhdGlvbiBzZXJ2aWNlIGFuZCBnZXQgYmFjayBoYW5kbGUgYW5kIHR1cm4gb3JkZXIuIFRoaXNcblx0Ly8gc3RydWN0dXJlIHJlcHJlc2VudHMgdGhlIHJldHVybiBjYWxsIGZyb20gdGhlIHJlZ2lzdHJhdGlvbiBzZXJ2aWNlLlxuXHRjb25zdCByZWcgPSB7XG5cdFx0ICAgICAgaGFuZGxlOiAnZWxzcG9ya28nLFxuXHRcdCAgICAgIG9yZGVyOiAwXG5cdH07XG5cblx0Ly9fcG9wdWxhdGVfcGxheWVyT3JkZXIoJ2Vsc3BvcmtvJywgMCk7XG5cdHBsYXllck9yZGVyW3JlZy5vcmRlcl0gPSByZWcuaGFuZGxlO1xuXHRnYW1lRmxvdygpO1xuXHRyZXR1cm47XG59XG5cbi8vQWNjZXB0IHJlZ2lzdHJhdGlvbiBmcm9tIG90aGVyIHBsYXllcnNcbmxldCBhY2NlcHRSZWcgPSBmdW5jdGlvbihoYW5kbGUsIG9yZGVyLCBncmlkLCBzaGlwcywgZmxlZXQsIHBsYXllcil7XG5cdHBsYXllck9yZGVyW29yZGVyXSA9IGhhbmRsZTtcblx0cGxheWVyUm9zdGVyID0ge1xuXHRcdFtoYW5kbGVdOiB7Z3JpZDogZmxlZXQuYnVpbGROYXV0aWNhbENoYXJ0fVxuXHR9XG5cdGxldCBwZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXJHcmlkJykuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpOztcblx0XG5cdC8vbGV0IHBnZCA9IHBnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcblx0cGcuaWQ9aGFuZGxlO1xuXHRwZy5pbm5lckhUTUw9aGFuZGxlO1xuXG5cdHBnLmFwcGVuZENoaWxkKGdyaWQuY2xpY2thYmxlR3JpZCgxMCwgMTAsIHNoaXBzLCBmbGVldCwgcGxheWVyLCBoYW5kbGUpKTtcbn1cblxubGV0IG15VHVybiA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gKGN1cnJlbnRQbGF5ZXIoKSA9PSBtZSkgPyAxIDogMDtcbn1cblxubGV0IG5leHRQbGF5ZXIgPSBmdW5jdGlvbigpIHtcblx0b3JkZXJJbmRleCA9IChvcmRlckluZGV4ID09IHBsYXllck9yZGVyLmxlbmd0aCAtIDEpID8gIDAgOiBvcmRlckluZGV4KzE7XG5cdHJldHVybjtcbn1cblxubGV0IGN1cnJlbnRQbGF5ZXIgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gcGxheWVyT3JkZXJbb3JkZXJJbmRleF07XG59XG5cbmxldCBnYW1lRmxvdyA9IGZ1bmN0aW9uKCl7XG5cdGlmIChjdXJyZW50RmxvdyAhPSB1bmRlZmluZWQpe1xuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGZsb3dbY3VycmVudEZsb3ddKS5zdHlsZS5kaXNwbGF5PSdub25lJztcblx0XHRjdXJyZW50RmxvdysrO1xuXHR9IGVsc2Uge1xuXHRcdGN1cnJlbnRGbG93ID0gMDtcblx0fVxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmbG93W2N1cnJlbnRGbG93XSkuc3R5bGUuZGlzcGxheT0naW5saW5lJztcbn1cblxubGV0IHNldE1vdmUgPSBmdW5jdGlvbihtKXtcblx0cmV0dXJuIG1vdmUuc2V0TW92ZShtKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmVnaXN0ZXI6IHJlZ2lzdGVyLFxuICAgIGFjY2VwdFJlZzogYWNjZXB0UmVnLFxuICAgIG15VHVybjogbXlUdXJuLFxuICAgIGN1cnJlbnRQbGF5ZXI6IGN1cnJlbnRQbGF5ZXIsXG4gICAgbmV4dFBsYXllcjogbmV4dFBsYXllcixcbiAgICBnYW1lRmxvdzogZ2FtZUZsb3csXG4gICAgY2FuTW92ZTogY2FuTW92ZSxcbiAgICBzZXRNb3ZlOiBzZXRNb3ZlXG4gICAgLy9kaXNwbGF5TW92ZU9yZGVyOiBkaXNwbGF5TW92ZU9yZGVyO1xufVxuIiwidmFyIGZsZWV0PXJlcXVpcmUoJy4vZmxlZXQuanMnKTtcclxuXHJcbi8vIENvbmZpZyBzZXR0aW5ncyBcclxubGV0IHNoaXBfY29uZmlnID0ge1xyXG4gICAgYWlyY3JhZnRDYXJyaWVyIDoge1xyXG4gICAgICAgIHNpemUgOiA1LFxyXG4gICAgICAgIGlkIDogJ2FpcmNyYWZ0Q2FycmllcicsXHJcbiAgICAgICAgY29sb3IgOiAnQ3JpbXNvbicsXHJcbiAgICAgICAgY2xpY2tDbGFzcyA6ICdhY2NsaWNrZWQnLFxyXG4gICAgICAgIGxhYmVsIDogJ0FpcmNyYWZ0IENhcnJpZXInLFxyXG4gICAgfSxcclxuICAgIGJhdHRsZXNoaXAgOiB7XHJcbiAgICAgICAgc2l6ZSA6IDQsXHJcbiAgICAgICAgaWQgOiAnYmF0dGxlc2hpcCcsXHJcbiAgICAgICAgY29sb3I6J0RhcmtHcmVlbicsXHJcbiAgICAgICAgY2xpY2tDbGFzcyA6ICdic2NsaWNrZWQnLFxyXG4gICAgICAgIGxhYmVsIDogJ0JhdHRsZXNoaXAnLFxyXG4gICAgfSxcclxuICAgIGRlc3Ryb3llciA6IHtcclxuICAgICAgICBzaXplIDogMyxcclxuICAgICAgICBpZCA6ICdkZXN0cm95ZXInLFxyXG4gICAgICAgIGNvbG9yOidDYWRldEJsdWUnLFxyXG4gICAgICAgIGNsaWNrQ2xhc3MgOiAnZGVjbGlja2VkJyxcclxuICAgICAgICBsYWJlbCA6ICdEZXN0cm95ZXInLFxyXG4gICAgfSxcclxuICAgIHN1Ym1hcmluZSAgOiB7XHJcbiAgICAgICAgc2l6ZSA6IDMsXHJcbiAgICAgICAgaWQgOiAnc3VibWFyaW5lJyxcclxuICAgICAgICBjb2xvcjonRGFya1JlZCcsXHJcbiAgICAgICAgY2xpY2tDbGFzcyA6ICdzdWNsaWNrZWQnLFxyXG4gICAgICAgIGxhYmVsIDogJ1N1Ym1hcmluZScsXHJcbiAgICB9LFxyXG4gICAgcGF0cm9sQm9hdCA6IHtcclxuICAgICAgICBzaXplIDogMixcclxuICAgICAgICBpZCA6ICdwYXRyb2xCb2F0JyxcclxuICAgICAgICBjb2xvcjonR29sZCcsXHJcbiAgICAgICAgY2xpY2tDbGFzcyA6ICdwYmNsaWNrZWQnLFxyXG4gICAgICAgIGxhYmVsIDogJ1BhdHJvbCBCb2F0JyxcclxuICAgIH0sXHJcbn07XHJcblxyXG4vLyBTaGlwIGNvbnN0cnVjdG9yIC0gc2hpcHlhcmQ/Pz9cclxuZnVuY3Rpb24gX3NoaXAoc2l6ZSwgaWQsIGNvbG9yLCBjbGlja0NsYXNzLCBsYWJlbCkge1xyXG4gICAgICAgIHRoaXMuc2l6ZSAgICAgICAgPSBzaXplO1xyXG4gICAgICAgIHRoaXMuaWQgICAgICAgICAgPSBpZDtcclxuICAgICAgICB0aGlzLmNvbG9yICAgICAgID0gY29sb3I7XHJcbiAgICAgICAgdGhpcy5jbGlja0NsYXNzICA9IGNsaWNrQ2xhc3M7XHJcbiAgICAgICAgdGhpcy5sYWJlbCAgICAgICA9IGxhYmVsO1xyXG5cclxuICAgICAgICByZXR1cm4gKHRoaXMpO1xyXG59XHJcblxyXG5sZXQgc2hpcHM9e307XHJcblxyXG4vKlxyXG4gKiBUaGUgc2hpcCBvYmplY3QgaG9sZHMgdGhlIGN1cnJlbnQgb3JpZW50YXRpb24gb2YgdGhlIHNoaXAgYW5kIHRoZSBzdGFydCBjb29yZGluYXRlICh0b3Btb3N0L2xlZnRtb3N0KS4gV2hlblxyXG4gKiB0aGVyZSBpcyBhIGNoYW5nZSB0byB0aGUgc2hpcCB0aGUgbWFzdGVyIG1hdHJpeCBuZWVkcyB0byBiZSB1cGRhdGVkLiBBbiBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHRoZXJlIGlzXHJcbiAqIGEgY29vcmRpbmF0ZSBjaGFuZ2UuIFRoaXMgbGlzdGVuZXIgd2lsbCB1cGRhdGUgdGhlIG1hc3RlciBtYXRyaXguIENhbGxzIHRvIGNoZWNrIGxvY2F0aW9uIChtb3ZlIHZhbGlkdGlvbiwgXHJcbiAqIGNoZWNrIGlmIGhpdCwgZXRjLikgd2lsbCBiZSBtYWRlIGFnYWluc3QgdGhlIG1hc3RlciBtYXRyaXguXHJcbiAqL1xyXG4vKlxyXG5sZXQgc2hpcElpbnQgPSBmdW5jdGlvbigpe1xyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcignc2hpcE1vdmUnLCgpKSB9XHJcblxyXG59XHJcbiovXHJcbi8vIFB1YmxpYyBmdW5jdGlvbiB0byBpbml0aWFsbHkgY3JlYXRlIHNoaXBzIG9iamVjdFxyXG5sZXQgYnVpbGRTaGlwcyA9IGZ1bmN0aW9uICgpe1xyXG4gICAgZm9yIChsZXQgcyBpbiBzaGlwX2NvbmZpZyl7XHJcbiAgICAgICAgc2hpcHNbc10gPSB7c2l6ZTogc2hpcF9jb25maWdbc10uc2l6ZSwgXHJcblx0XHQgICAgdHlwZTogc2hpcF9jb25maWdbc10uaWQsXHJcblx0ICAgICAgICAgICAgY29sb3I6IHNoaXBfY29uZmlnW3NdLmNvbG9yLFxyXG5cdFx0ICAgIGNsaWNrQ2xhc3M6IHNoaXBfY29uZmlnW3NdLmNsaWNrQ2xhc3MsXHJcblx0XHQgICAgbGFiZWw6IHNoaXBfY29uZmlnW3NdLmxhYmVsXHJcblx0ICAgICAgICAgICB9O1xyXG4gICAgfVxyXG5yZXR1cm4gc2hpcHM7XHJcbn1cclxuXHJcbmxldCBidWlsZFNoaXAgPSBmdW5jdGlvbih0eXBlKXtcclxuICAgICAgICBzaGlwc1t0eXBlXSA9IF9zaGlwKHNoaXBfY29uZmlnW3R5cGVdLnNpemUsIHNoaXBfY29uZmlnW3R5cGVdLmlkLCBzaGlwX2NvbmZpZ1t0eXBlXS5jb2xvciwgc2hpcF9jb25maWdbdHlwZV0uY2xpY2tDbGFzcywgc2hpcF9jb25maWdbdHlwZV0ubGFiZWwpO1xyXG5cdHJldHVybiBzaGlwcztcclxufVxyXG5cclxuLy8gU2V0IHZhbHVlIGluIHNoaXAgb2JqZWN0LiBcclxubGV0IHNldFNoaXAgPSBmdW5jdGlvbih0eXBlLCBrZXksIHZhbHVlKXtcclxuICAgICAgICBpZiAodHlwZSAmJiBzaGlwc1t0eXBlXSAmJiBrZXkpIHsgLy8gb25seSBhdHRlbXB0IGFuIHVwZGF0ZSBpZiB0aGVyZSBpcyBhIGxlZ2l0IHNoaXAgdHlwZSBhbmQgYSBrZXlcclxuICAgICAgICAgICAgc2hpcHNbdHlwZV0ua2V5ID0gdmFsdWU7XHJcbiAgIH1cclxufVxyXG5cclxuLy8gUmV0dXJuIHNoaXAgb2JqZWN0IGlmIG5vIHR5cGUgZ2l2ZW4gb3RoZXJ3aXNlIHJldHVybiBvYmplY3QgY29udGFpbmluZyBqdXN0IHJlcXVlc3RlZCBzaGlwXHJcbmxldCBnZXRTaGlwID0gZnVuY3Rpb24gKHR5cGUpe1xyXG4gICAgaWYodHlwZSl7XHJcbiAgICAgICAgcmV0dXJuIHNoaXBzW3R5cGVdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gc2hpcHM7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIFByaXZhdGUgZnVuY3Rpb24gdG8gcmFuZG9tbHkgZGV0ZXJtaW5lIHNoaXAncyBvcmllbnRhdGlvbiBhbG9uZyB0aGUgWC1heGlzIG9yIFktYXhpcy4gT25seSB1c2VkIHdoZW4gcGxvdHRpbmcgc2hpcHMgZm9yIHRoZSBmaXJzdCB0aW1lLlxyXG5mdW5jdGlvbiBfZ2V0U3RhcnRDb29yZGluYXRlKHNpemUpe1xyXG4gICAgY29uc3Qgc3RhcnRfb3JpZW50YXRpb249TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjEwKSA+IDUgPyAneCcgOiAneSc7XHJcbiAgICBjb25zdCBzdGFydF94ID0gc3RhcnRfb3JpZW50YXRpb24gPT0gJ3gnID8gX2dldFJhbmRvbUNvb3JkaW5hdGUoc2l6ZSkgOiBfZ2V0UmFuZG9tQ29vcmRpbmF0ZSgwKTtcclxuICAgIGNvbnN0IHN0YXJ0X3kgPSBzdGFydF9vcmllbnRhdGlvbiA9PSAneScgPyBfZ2V0UmFuZG9tQ29vcmRpbmF0ZShzaXplKSA6IF9nZXRSYW5kb21Db29yZGluYXRlKDApO1xyXG5cclxuICAgIHJldHVybiB7Y29vcmRpbmF0ZTogc3RhcnRfeCArICdfJyArIHN0YXJ0X3ksIG9yaWVudGF0aW9uOiBzdGFydF9vcmllbnRhdGlvbn07XHJcbn1cclxuXHJcbi8vIFRha2Ugc2hpcCBzaXplIGFuZCBvcmllbnRhdGlvbiBpbnRvIGFjY291bnQgd2hlbiBkZXRlcm1pbmluZyB0aGUgc3RhcnQgcmFuZ2UgdmFsdWUuIGV4LiBkb24ndFxyXG4vLyBsZXQgYW4gYWlyY3JhZnQgY2FycmllciB3aXRoIGFuIG9yaWVudGF0aW9uIG9mICdYJyBzdGFydCBhdCByb3cgNyBiZWNhdXNlIGl0IHdpbGwgbWF4IG91dCBvdmVyIHRoZVxyXG4vLyBncmlkIHNpemUuXHJcbmZ1bmN0aW9uIF9nZXRSYW5kb21Db29yZGluYXRlKG9mZnNldCl7XHJcbiAgICBjb25zdCBNQVhfQ09PUkQgPSAxMDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqKE1BWF9DT09SRCAtIG9mZnNldCkpO1xyXG5cclxufVxyXG5cclxuLy8gRklYTUUgRG9lcyBmbGVldC5naG9zdFNoaXAgZG8gdGhpcyBub3c/XHJcbi8vIEJ1aWxkIGFuIGFycmF5IG9mIGNvb3JkaW5hdGVzIGZvciBhIHNoaXAgYmFzZWQgb24gaXQncyBvcmllbnRhdGlvbiwgaW50ZW5kZWQgc3RhcnQgcG9pbnQgYW5kIHNpemVcclxubGV0IF9zaGlwU3RyaW5nID0gZnVuY3Rpb24ocykge1xyXG5cdGNvbnN0IG8gPSBzLm9yaWVudGF0aW9uO1xyXG5cdGNvbnN0IHN0ID0gcy5zdGFydF9jb29yZGluYXRlO1xyXG5cdGxldCByID0gbmV3IEFycmF5O1xyXG4gICAgICAgIGxldCB0X3BpZWNlcyA9IHN0LnNwbGl0KCdfJyk7XHJcblx0Y29uc3QgaSA9IG8gPT0gJ3gnID8gMCA6IDE7XHJcblxyXG5cdGZvciAobGV0IGo9MDsgaiA8IHMuc2l6ZTtqKyspIHtcclxuXHRcdHRfcGllY2VzW2ldID0gdF9waWVjZXNbaV0rMTtcclxuXHRcdHIucHVzaCAodF9waWVjZXNbMF0gKyAnXycgKyB0X3BpZWNlc1sxXSk7XHJcblx0fVxyXG5cdHJldHVybiByO1xyXG59XHJcblxyXG5cclxuLypcclxuICogcGxhY2VTaGlwcyAtIEluaXRpYWwgcGxhY2VtZW50IG9mIHNoaXBzIG9uIHRoZSBib2FyZFxyXG4gKi9cclxubGV0IHBsYWNlU2hpcHMgPSBmdW5jdGlvbiBwbGFjZVNoaXBzKGZsZWV0KXtcclxuICAgICAgICAvKiBSYW5kb21seSBwbGFjZSBzaGlwcyBvbiB0aGUgZ3JpZC4gSW4gb3JkZXIgZG8gdGhpcyBlYWNoIHNoaXAgbXVzdDpcclxuXHQgKiAgICogUGljayBhbiBvcmllbnRhdGlvblxyXG5cdCAqICAgKiBQaWNrIGEgc3RhcnRpbmcgY29vcmRpbmF0ZVxyXG5cdCAqICAgKiBWYWxpZGF0ZSB0aGF0IHRoZSBjb29yZGluYXRlIGlzIHZhbGlkIChkb2VzIG5vdCBydW4gT09CLCBkb2VzIG5vdCBjcm9zcyBhbnkgb3RoZXIgc2hpcCwgZXRjLilcclxuXHQgKiAgICogSWYgdmFsaWQ6XHJcblx0ICogICBcdCogU2F2ZSBzdGFydCBjb29yZCBhbmQgb3JpZW50YXRpb24gYXMgcGFydCBvZiBzaGlwIG9iamVjdFxyXG5cdCAqICAgXHQqIFBsb3Qgc2hpcCBvbiBtYXN0ZXIgbWF0cml4XHJcblx0ICovXHJcblx0bGV0IHNoaXBMaXN0ID0gZ2V0U2hpcCgpO1xyXG4gICAgICAgIGZvciAodmFyIHNoaXAgaW4gc2hpcExpc3QpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBzdGFydCA9IF9nZXRTdGFydENvb3JkaW5hdGUoc2hpcExpc3Rbc2hpcF0uc2l6ZSk7IFxyXG5cdCAgICBsZXQgc2hpcF9zdHJpbmcgPSBmbGVldC5naG9zdFNoaXAoc2hpcExpc3Rbc2hpcF0udHlwZSwgc3RhcnQuY29vcmRpbmF0ZSwgc3RhcnQub3JpZW50YXRpb24pO1xyXG5cdCAgICBzaGlwTGlzdFtzaGlwXS5vcmllbnRhdGlvbiA9IHN0YXJ0Lm9yaWVudGF0aW9uO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKCFmbGVldC52YWxpZGF0ZVNoaXAoc2hpcF9zdHJpbmcpKSB7XHJcbiAgICAgICAgICAgICAgICBzdGFydCA9IF9nZXRTdGFydENvb3JkaW5hdGUoc2hpcExpc3Rbc2hpcF0uc2l6ZSk7IFxyXG5cdFx0c2hpcExpc3Rbc2hpcF0ub3JpZW50YXRpb24gPSBzdGFydC5vcmllbnRhdGlvbjtcclxuXHRcdHNoaXBfc3RyaW5nID0gZmxlZXQuZ2hvc3RTaGlwKHNoaXBMaXN0W3NoaXBdLnR5cGUsIHN0YXJ0LmNvb3JkaW5hdGUsIHN0YXJ0Lm9yaWVudGF0aW9uKTtcclxuXHRcdH1cclxuXHJcbiAgICAgICAgICAgIGZsZWV0LnNldEZsZWV0KHN0YXJ0Lm9yaWVudGF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHNoaXBMaXN0W3NoaXBdLnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgc2hpcExpc3Rbc2hpcF0uc2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICBzdGFydC5jb29yZGluYXRlKTtcclxuICAgICAgICAgICAgfVxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgYnVpbGRTaGlwczogYnVpbGRTaGlwcyxcclxuICAgIGJ1aWxkU2hpcDogYnVpbGRTaGlwLFxyXG4gICAgZ2V0U2hpcDogZ2V0U2hpcCxcclxuICAgIHNldFNoaXA6IHNldFNoaXAsXHJcbiAgICBwbGFjZVNoaXBzOiBwbGFjZVNoaXBzXHJcbn1cclxuIl19
