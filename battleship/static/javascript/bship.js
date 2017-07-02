(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var grid = require('./grid.js');
var player = require('./player.js');
var ships = require('./ships.js');
var fleet = require('./fleet.js');
var config = require('./config.js');
let gameOn = false;


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
	    playGame();
	    return;
    }, false);

// Set up link to resolve orders
let d=document.getElementById('doMoves');
d.addEventListener('click',
	function(){
		// Resolve orders
		player.resolveOrders();
		// Reset moves
		player.playerClearMove();
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
	player.setGameOn();
	if (player.myTurn()){
		//window.open('','attack', 'height=200,width=200,menubar=no,status=no,titlebar=no,toolbar=no', false );
	}
}




},{"./config.js":2,"./fleet.js":3,"./grid.js":4,"./player.js":6,"./ships.js":7}],2:[function(require,module,exports){
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
    ghostShip: ghostShip
}

},{"./ships.js":7}],4:[function(require,module,exports){
let fleet = require('./fleet');
let ships = require('./ships');

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
			    // Remove initial image
			    displayShip(ships, dropObj.type);

			    fleet.setFleet (dropObj.orientation, dropObj.type, ship.size, ev.target.id, dropObj.offset); 

			    // Redraw image in new location
			    displayShip(ships, dropObj.type);

		 	    player.setMove({type: 'move', coordinate: ev.target.id});
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
		    let type = _getTypeByClass(ships, this.className);
		    let ship = ships.getShip(type);
		    let orientation = (ship.orientation == 'x') ? 'y':'x'; // flip the orientation
                    let start = _find_start(e.target.id, orientation, ship.size, type);
		    let ghost = fleet.ghostShip(type, e.target.id, orientation, ship.size, start.offset);

                    if(fleet.validateShip(ghost, type)) {
		        // Remove initial image
		        displayShip(ships, type);
    
		        fleet.setFleet (orientation, type, ship.size, e.target.id); 
    
		        // Redraw image in new location
		        displayShip(ships, type);
		 	player.setMove({type: 'pivot', coordinate: e.target.id});
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

let displayShip = function (ships, type) {
    let coordinates = fleet.getFleet(type);
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
    displayShip: displayShip
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

// Create a block to visually represent a move so it can be reordered if wanted
let moveListBlock = function(handle, moveText) {
	let b = document.createElement('div');
	b.id = handle;
	b.width = 100;
	b.height = 21;

	b.innerHTML=moveText;

        b.setAttribute('draggable','true');
	moveOrderHandler(b);
	return b;
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
	    	    displayMoveOrder();
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

function displayMoveOrder(){
}

let resolveMoves = function (){
	let parent = document.getElementById(gameDialog);
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
				break;
			case 'pivot':
				break;
		}
	let child = document.getElementById(move.coordinate);
	parent.removeChild(child);
	}
}

let attackPlayer = function(coordinate){
}

let setMine = function(coordinate){
}

let setMove = function(move){
	let moveString;
	if(moveMap[move.coordinate] == undefined) {
		moveMap[move.coordinate] = moveList.length;

		//if (move.type == 'attack') {
			moveString = move.type + ': ' + move.coordinate;
		//}

		let b = moveListBlock(move.coordinate, moveString);
		moveList.push(b);
		document.getElementById('playOrder').appendChild(b);
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
    getMoveSize: getMoveSize
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
let gameOn=false;
let setGameOn = function(){
	gameOn = true;
}

let getGameOn = function(){
	return gameOn;
}

let canMove = function() {
	//if (playerOrder.length > playerMove.length) return true;
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
    setGameOn: setGameOn,
    canMove: canMove,
    getGameOn: getGameOn,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJhdHRsZXNoaXAuanMiLCJjb25maWcuanMiLCJmbGVldC5qcyIsImdyaWQuanMiLCJtb3ZlLmpzIiwicGxheWVyLmpzIiwic2hpcHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGdyaWQgPSByZXF1aXJlKCcuL2dyaWQuanMnKTtcclxudmFyIHBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyLmpzJyk7XHJcbnZhciBzaGlwcyA9IHJlcXVpcmUoJy4vc2hpcHMuanMnKTtcclxudmFyIGZsZWV0ID0gcmVxdWlyZSgnLi9mbGVldC5qcycpO1xyXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcuanMnKTtcclxubGV0IGdhbWVPbiA9IGZhbHNlO1xyXG5cclxuXHJcbnBsYXllci5nYW1lRmxvdygpO1xyXG5cclxuLyogUmVnaXN0ZXIgKi9cclxuLy8gVE9ETyAtIGF0dGFjaCBoYW5kbGVyIHRocm91Z2ggcHVnOyBtb3ZlIGhhbmRsZXJzIHRvIGFub3RoZXIgbW9kdWxlXHJcbmxldCByPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3RlcicpO1xyXG5yLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXHJcbiAgICBmdW5jdGlvbigpe1xyXG5cdCAgICBwbGF5ZXIucmVnaXN0ZXIoKTtcclxuXHQgICAgcmV0dXJuO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxubGV0IGY9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldEZsZWV0Jyk7XHJcbmYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBcclxuICAgIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldEZsZWV0Jykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllckdyaWQnKS5zdHlsZS5kaXNwbGF5PSdpbmxpbmUnO1xyXG5cdCAgICBwbGF5R2FtZSgpO1xyXG5cdCAgICByZXR1cm47XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG4vLyBTZXQgdXAgbGluayB0byByZXNvbHZlIG9yZGVyc1xyXG5sZXQgZD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZG9Nb3ZlcycpO1xyXG5kLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxcclxuXHRmdW5jdGlvbigpe1xyXG5cdFx0Ly8gUmVzb2x2ZSBvcmRlcnNcclxuXHRcdHBsYXllci5yZXNvbHZlT3JkZXJzKCk7XHJcblx0XHQvLyBSZXNldCBtb3Zlc1xyXG5cdFx0cGxheWVyLnBsYXllckNsZWFyTW92ZSgpO1xyXG5cdFx0Ly8gVHVybiBtb3ZlcyBvdmVyIHRvIHRoZSBuZXh0IHBsYXllclxyXG5cdFx0Ly8gRklYTUUgLSBTaW11bGF0aW5nIG1vdmVzIGZvciBub3cuIFJlbW92ZSB3aGVuIHJlYWR5IGZvciByZWFsc2llc1xyXG5cclxuXHR9LCBmYWxzZSk7XHJcbi8vIFNldCB1cCBncmlkXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdteUdyaWQnKS5hcHBlbmRDaGlsZChncmlkLmNsaWNrYWJsZUdyaWQoMTAsIDEwLCBzaGlwcywgZmxlZXQsIHBsYXllcikpO1xyXG5cclxuLy8gU2V0IHVwIGRyYWcvZHJvcCBvZiBtb3Zlc1xyXG4vL2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKS5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsJ3RydWUnKTtcclxuLy9wbGF5ZXIucGxheWVyT3JkZXJIYW5kbGVyKCk7XHJcblxyXG4vKiBTZXQgcmFuZG9tIGZsZWV0ICovXHJcbnNoaXBzLmJ1aWxkU2hpcHMoKTtcclxuc2hpcHMucGxhY2VTaGlwcyhmbGVldCk7XHJcbmxldCB3aG9sZUZsZWV0ID0gZmxlZXQuZ2V0V2hvbGVGbGVldChmbGVldCk7XHJcbmZvciAodCBpbiB3aG9sZUZsZWV0KSB7XHJcblx0Z3JpZC5kaXNwbGF5U2hpcChzaGlwcywgdCk7XHJcbn1cclxuXHJcbi8qIFxyXG4gKiBNb2NrIGdhbWUgd2lsbCBiZSByZW1vdmVkIFxyXG4gKi9cclxubGV0IG0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnTWVnYW5SZWcnKTtcclxubS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdNZWdhbicsIDEsIGdyaWQsIHNoaXBzLCBmbGVldCwgcGxheWVyKTtcclxuICAgICAgICAvL20uc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ01lZ2FuUmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcblx0Ly9kb2N1bWVudC5nZXRFbGVtZW50QnlJZChmbG93W2N1cnJlbnRGbG93XSkuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgLy9tLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKSk7XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG5sZXQgcnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnUnlhblJlZycpO1xyXG5yeS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdSeWFuJywgMiwgZ3JpZCwgc2hpcHMsIGZsZWV0LCBwbGF5ZXIpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdSeWFuUmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgLy9sZXQgcj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnUnlhbicpLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xyXG4gICAgICAgIC8vci5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJykpO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxubGV0IHRyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1RyYWNleVJlZycpO1xyXG50ci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdUcmFjZXknLCAyLCBncmlkLCBzaGlwcywgZmxlZXQsIHBsYXllcik7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1RyYWNleVJlZycpLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxuLyogUGxheSBnYW1lICovXHJcbi8qXHJcbndoaWxlICgxKSB7XHJcblx0cGxheWVyLmdldFR1cm4oKTtcclxufVxyXG4qL1xyXG5cclxuZnVuY3Rpb24gcGxheUdhbWUoKXtcclxuXHRwbGF5ZXIuc2V0R2FtZU9uKCk7XHJcblx0aWYgKHBsYXllci5teVR1cm4oKSl7XHJcblx0XHQvL3dpbmRvdy5vcGVuKCcnLCdhdHRhY2snLCAnaGVpZ2h0PTIwMCx3aWR0aD0yMDAsbWVudWJhcj1ubyxzdGF0dXM9bm8sdGl0bGViYXI9bm8sdG9vbGJhcj1ubycsIGZhbHNlICk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29uZmlnIChjb25maWcpe1xyXG4gICAgc2hpcHMgPSB7XHJcbiAgICAgICAgYWlyY3JhZnRDYXJyaWVyIDoge1xyXG4gICAgICAgICAgICBzaXplIDogNSxcclxuICAgICAgICAgICAgaWQgOiAnYWlyY3JhZnRDYXJyaWVyJyxcclxuICAgICAgICAgICAgY29sb3IgOiAnQ3JpbXNvbicsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnYWNjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnQWlyY3JhZnQgQ2FycmllcicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBiYXR0bGVzaGlwIDoge1xyXG4gICAgICAgICAgICBzaXplIDogNCxcclxuICAgICAgICAgICAgaWQgOiAnYmF0dGxlc2hpcCcsXHJcbiAgICAgICAgICAgIGNvbG9yOidEYXJrR3JlZW4nLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ2JzY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ0JhdHRsZXNoaXAnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzdHJveWVyIDoge1xyXG4gICAgICAgICAgICBzaXplIDogMyxcclxuICAgICAgICAgICAgaWQgOiAnZGVzdHJveWVyJyxcclxuICAgICAgICAgICAgY29sb3I6J0NhZGV0Qmx1ZScsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnZGVjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnRGVzdHJveWVyJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1hcmluZSAgOiB7XHJcbiAgICAgICAgICAgIHNpemUgOiAzLFxyXG4gICAgICAgICAgICBpZCA6ICdzdWJtYXJpbmUnLFxyXG4gICAgICAgICAgICBjb2xvcjonRGFya1JlZCcsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnc3VjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnU3VibWFyaW5lJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhdHJvbEJvYXQgOiB7XHJcbiAgICAgICAgICAgIHNpemUgOiAyLFxyXG4gICAgICAgICAgICBpZCA6ICdwYXRyb2xCb2F0JyxcclxuICAgICAgICAgICAgY29sb3I6J0dvbGQnLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ3BiY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ1BhdHJvbCBCb2F0JyxcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxufVxyXG4iLCJ2YXIgc2hpcHM9cmVxdWlyZSgnLi9zaGlwcy5qcycpO1xuXG5sZXQgbmF1dGljYWxNYXAgPSB7fTsgLy8gSGFzaCBsb29rdXAgdGhhdCB0cmFja3MgZWFjaCBzaGlwJ3Mgc3RhcnRpbmcgcG9pbnQgYW5kIGN1cnJlbnQgb3JpZW50YXRpb25cblxubGV0IGJ1aWxkTmF1dGljYWxDaGFydCA9IGZ1bmN0aW9uKCl7XG5cdGxldCBjaGFydCA9IG5ldyBBcnJheTtcblx0Zm9yKGxldCBpPTA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0Y2hhcnRbaV0gPSBuZXcgQXJyYXk7XG5cdFx0Zm9yIChsZXQgaj0wOyBqIDwgMTA7IGorKyl7XG5cdFx0XHRjaGFydFtpXVtqXSA9IHVuZGVmaW5lZDsvL25ldyBBcnJheTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGNoYXJ0O1xufVxuXG5sZXQgbmF1dGljYWxDaGFydCA9IGJ1aWxkTmF1dGljYWxDaGFydCgpOyAvLyBEZXRhaWxlZCBtYXRyaXggb2YgZXZlcnkgc2hpcCBpbiB0aGUgZmxlZXRcblxubGV0IGdldEZsZWV0ID0gZnVuY3Rpb24odHlwZSl7XG5cdGxldCBvcmllbnRhdGlvbiA9IG5hdXRpY2FsTWFwW3R5cGVdLm9yaWVudGF0aW9uID09ICd4JyA/IDAgOiAxO1xuXG5cdGxldCBwaWVjZXMgPSBuYXV0aWNhbE1hcFt0eXBlXS5zdGFydF9jb29yZC5zcGxpdCgnXycpO1xuXHRsZXQgcmV0ID0gbmV3IEFycmF5O1xuXG5cdHdoaWxlIChuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gPT0gdHlwZSkge1xuXHRcdHJldC5wdXNoIChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xuXHRcdHBpZWNlc1tvcmllbnRhdGlvbl0gPSBwYXJzZUludChwaWVjZXNbb3JpZW50YXRpb25dLCAxMCkgKyAxO1xuXHR9XG5cblx0cmV0dXJuIChyZXQpO1xufVxuXG5sZXQgZ2V0V2hvbGVGbGVldCA9IGZ1bmN0aW9uKCl7XG5cdGxldCByZXQ9e307XG5cdGZvciAodCBpbiBuYXV0aWNhbE1hcCkge1xuXHRcdHJldFt0XSA9IGdldEZsZWV0KHQpO1xuXHR9XG5cdHJldHVybiByZXQ7XG59XG5cbi8vIFRPRE8gLSBzZXRGbGVldDogUmVtb3ZlIHByZXZpb3VzIHNoaXAgZnJvbSBjaGFydCAtLSBtYXkgYmUgZG9uZS4uLm5lZWRzIHRlc3Rcbi8qXG4gKiBzZXRGbGVldCAtIHBsYWNlIHNoaXAgb24gbmF1dGljYWwgY2hhcnRcbiAqL1xubGV0IHNldEZsZWV0ID0gZnVuY3Rpb24gKG9yaWVudGF0aW9uLCB0eXBlLCBzaXplLCBzdGFydF9jb29yZCwgb2Zmc2V0KXtcbiAgICBsZXQgcGllY2VzID0gc3RhcnRfY29vcmQuc3BsaXQoJ18nKTtcbiAgICBsZXQgaW5kZXggPSAob3JpZW50YXRpb24gPT0gJ3gnKSA/IDAgOiAxO1xuXG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XG5cbiAgICAvLyBBZGp1c3QgZm9yIGRyYWcvZHJvcCB3aGVuIHBsYXllciBwaWNrcyBhIHNoaXAgcGllY2Ugb3RoZXIgdGhhbiB0aGUgaGVhZC5cbiAgICBwaWVjZXNbaW5kZXhdID0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApIC0gb2Zmc2V0O1xuXG4gICAgLypcbiAgICAgKiBSZW1vdmUgb2xkIHNoaXAgZnJvbSBuYXV0aWNhbENoYXJ0L01hcFxuICAgICAqL1xuICAgIF9jbGVhclNoaXAodHlwZSwgc2l6ZSk7XG5cbiAgICAvLyBzZXQgdGhlIG5hdXRpY2FsIG1hcCB2YWx1ZSBmb3IgdGhpcyBib2F0XG4gICAgbmF1dGljYWxNYXBbdHlwZV09e1xuXHQgICAgb3JpZW50YXRpb246IG9yaWVudGF0aW9uLFxuXHQgICAgc3RhcnRfY29vcmQ6IHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXVxuICAgIH07XG5cbiAgICBmb3IgKHZhciBpPTA7IGkgPCBzaXplOyBpKyspIHtcblx0bmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldID0gdHlwZTtcblx0cGllY2VzW2luZGV4XT0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApICsxO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX2NsZWFyU2hpcCh0eXBlLCBzaXplKXtcbiAgICBsZXQgbWFwID0gbmF1dGljYWxNYXBbdHlwZV07XG4gICAgaWYgKG1hcCA9PT0gdW5kZWZpbmVkKXtyZXR1cm4gZmFsc2U7fVxuXG4gICAgbGV0IHBpZWNlcyA9IG1hcC5zdGFydF9jb29yZC5zcGxpdCgnXycpO1xuICAgIGxldCBpbmRleCA9IChtYXAub3JpZW50YXRpb24gPT0gJ3gnKSA/IDAgOiAxO1xuXG4gICAgZm9yIChpPTA7IGkgPCBzaXplOyBpKyspIHtcblx0ICAgIG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXT11bmRlZmluZWQ7XG5cdCAgICBwaWVjZXNbaW5kZXhdKys7XG4gICAgfVxuXG4gICAgZGVsZXRlIG5hdXRpY2FsTWFwW3R5cGVdO1xuXG59XG5cbi8qXG4gKiBnaG9zdFNoaXAgLSBCZWZvcmUgcHV0dGluZyBhIHNoaXAgb24gdGhlIGNoYXJ0IGl0J3MgcG90ZW50aWFsIGxvY2F0aW9uIG5lZWRzIHRvIGJlIHBsb3R0ZWQgc28gaXQgY2FuIGJlXG4gKiBjaGVja2VkIGZvciB2YWxpZGl0eS4gR2l2ZW4gYSBzaGlwIHRoaXMgZnVuY3Rpb24gd2lsbCByZXR1cm4gdGhlIHBvdGVudGlhbCBwbG90dGVkIGNvb3JkaW5hdGVzLiBUaGUgZnVuY3Rpb25cbiAqIG1heSBidWlsZCBjb29yZGluYXRlcyBmb3IgYSBrbm93biBzaGlwIG9yIGZvciBvbmUgbW92ZWQgYXJvdW5kIG9uIHRoZSBncmlkLlxuICovXG5sZXQgZ2hvc3RTaGlwID0gZnVuY3Rpb24odHlwZSwgY29vcmRpbmF0ZSwgb3JpZW50YXRpb24sIHNpemUsIG9mZnNldCl7XG5cdGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcblx0bGV0IHRoaXNTaGlwID0gcmVhZE1hcCh0eXBlKTtcblx0bGV0IGdob3N0ID0gW107XG5cdGNvb3JkaW5hdGUgPSBjb29yZGluYXRlIHx8IHRoaXNTaGlwLnN0YXJ0X2Nvb3JkO1xuXHRvcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uIHx8IHRoaXNTaGlwLm9yaWVudGF0aW9uO1xuXHRzaXplID0gc2l6ZSB8fCBzaGlwLnNpemU7XG5cdG9mZnNldCA9IG9mZnNldCB8fCAwO1xuXG5cdGxldCBwaWVjZXMgPSBjb29yZGluYXRlLnNwbGl0KCdfJyk7XG5cdGxldCBpbmRleCA9IChvcmllbnRhdGlvbiA9PSAneCcpID8gMDogMTtcblx0cGllY2VzW2luZGV4XSA9IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSAtIG9mZnNldDtcblx0Zm9yIChsZXQgaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XG5cdFx0Z2hvc3QucHVzaChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xuXHRcdHBpZWNlc1tpbmRleF0gPSBwYXJzZUludChwaWVjZXNbaW5kZXhdLCAxMCkgKzE7XG5cdH1cblx0cmV0dXJuIGdob3N0O1xufTtcblxubGV0IHJlYWRNYXAgPSBmdW5jdGlvbih0eXBlKXtcblx0cmV0dXJuIG5hdXRpY2FsTWFwW3R5cGVdO1xufVxuXG4vKlxuICogR2l2ZW4gYSBjb29yZGluYXRlIG9yIGFuIGFycmF5IG9mIGNvb3JkaW5hdGVzIHJldHVybiB0aGUgc2FtZSBzdHJ1Y3R1cmUgcmV2ZWFsaW5nIHRoZSBjb250ZW50cyBvZiB0aGUgZ3JpZC5cbiAqIFdpbGwgcmV0dXJuIGEgdmFsdWUgb2YgZmFsc2UgaWYgdGhlcmUgaXMgYSBwcm9ibGVtIGNoZWNraW5nIHRoZSBncmlkIChleC4gY29vcmRzIGFyZSBvdXQgb2YgcmFuZ2UpLlxuICovXG5sZXQgY2hlY2tHcmlkID0gZnVuY3Rpb24oY29vcmRpbmF0ZXMpe1xuXHRpZiAoY29vcmRpbmF0ZXMgaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0bGV0IHJldCA9IG5ldyBBcnJheTtcblx0XHRmb3IoYyBpbiBjb29yZGluYXRlcyl7XG5cdFx0XHRsZXQgcyA9IF9zZXRDaGFydChjb29yZGluYXRlc1tjXSk7XG5cdFx0XHRpZiAocyA9PT0gZmFsc2UpIHtyZXR1cm4gZmFsc2V9O1xuXHRcdFx0cmV0LnB1c2ggKHMpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmV0O1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBfc2V0Q2hhcnQoY29vcmRpbmF0ZXMpO1xuXHR9XG59O1xuXG5sZXQgX3NldENoYXJ0ID0gZnVuY3Rpb24oY29vcmRpbmF0ZSl7XG5cdGxldCBwaWVjZXMgPSBjb29yZGluYXRlLnNwbGl0KCdfJyk7XG5cdGlmIChwYXJzZUludChwaWVjZXNbMF0sIDEwKSA+PSBuYXV0aWNhbENoYXJ0Lmxlbmd0aCB8fFxuXHQgICAgcGFyc2VJbnQocGllY2VzWzFdLCAxMCk+PSBuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXS5sZW5ndGgpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4gbmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldO1xufTtcblxuLyogXG4gKiBHaXZlbiBhIGxpc3Qgb2YgY29vcmRpbmF0ZXMgYW5kIGEgc2hpcCB0eXBlIHZhbGlkYXRlIHRoYXQgdGhlIGNvb3JkaW5hdGVzIGRvIG5vdCB2aW9sYXRlIHRoZSBydWxlcyBvZjpcbiAqIFx0KiBzaGlwIG11c3QgYmUgb24gdGhlIGdyaWRcbiAqIFx0KiBzaGlwIG11c3Qgbm90IG9jY3VweSB0aGUgc2FtZSBzcXVhcmUgYXMgYW55IG90aGVyIHNoaXBcbiAqL1xubGV0IHZhbGlkYXRlU2hpcCA9IGZ1bmN0aW9uIChjb29yZGluYXRlcywgdHlwZSl7XG4gICAgLy8gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyBvdGhlciBib2F0cyBhbHJlYWR5IG9uIGFueSBhIHNwYWNlXG4gICAgZm9yICh2YXIgcD0wOyBwIDwgY29vcmRpbmF0ZXMubGVuZ3RoOyBwKyspIHtcblxuXHQvLyBJcyB0aGVyZSBhIGNvbGxpc2lvbj9cblx0bGV0IGdyaWQgPSBjaGVja0dyaWQoY29vcmRpbmF0ZXMpO1xuXHRcblx0aWYgKGdyaWQgPT0gZmFsc2UpIHtyZXR1cm4gZmFsc2V9OyAvLyBJZiBjaGVja0dyaWQgcmV0dXJucyBmYWxzZSBjb29yZGluYXRlcyBhcmUgb3V0IG9mIHJhbmdlXG5cblx0Zm9yIChjIGluIGNvb3JkaW5hdGVzKSB7XG5cdFx0bGV0IHBpZWNlcyA9IGNvb3JkaW5hdGVzW2NdLnNwbGl0KCdfJyk7XG5cdFx0aWYgKG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSAhPSB0eXBlICYmXG5cdFx0ICAgIG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSAhPSB1bmRlZmluZWQpIHtyZXR1cm4gZmFsc2V9O1xuXHR9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0RmxlZXQ6IGdldEZsZWV0LFxuICAgIHNldEZsZWV0OiBzZXRGbGVldCxcbiAgICBnZXRXaG9sZUZsZWV0OiBnZXRXaG9sZUZsZWV0LFxuICAgIHZhbGlkYXRlU2hpcDogdmFsaWRhdGVTaGlwLFxuICAgIGNoZWNrR3JpZDogY2hlY2tHcmlkLFxuICAgIGJ1aWxkTmF1dGljYWxDaGFydDogYnVpbGROYXV0aWNhbENoYXJ0LFxuICAgIGdob3N0U2hpcDogZ2hvc3RTaGlwXG59XG4iLCJsZXQgZmxlZXQgPSByZXF1aXJlKCcuL2ZsZWV0Jyk7XHJcbmxldCBzaGlwcyA9IHJlcXVpcmUoJy4vc2hpcHMnKTtcclxuXHJcbi8qXHJcbiAqIEJ1aWxkIHRoZSBncmlkIGFuZCBhdHRhY2ggaGFuZGxlcnMgZm9yIGRyYWcvZHJvcCBldmVudHNcclxuICovXHJcbmxldCBjbGlja2FibGVHcmlkID0gZnVuY3Rpb24gKCByb3dzLCBjb2xzLCBzaGlwcywgZmxlZXQsIHBsYXllciwgcGhhbmRsZSl7XHJcbiAgICBsZXQgZ3JpZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICBncmlkLmNsYXNzTmFtZT0nZ3JpZCc7XHJcbiAgICBmb3IgKHZhciByPTA7cjxyb3dzOysrcil7XHJcbiAgICAgICAgdmFyIHRyID0gZ3JpZC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpKTtcclxuICAgICAgICBmb3IgKHZhciBjPTA7Yzxjb2xzOysrYyl7XHJcbiAgICAgICAgICAgIHZhciBjZWxsID0gdHIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKSk7XHJcbiAgICAgICAgICAgIC8vIEVhY2ggY2VsbCBvbiB0aGUgZ3JpZCBpcyBvZiBjbGFzcyAnY2VsbCdcclxuICAgICAgICAgICAgY2VsbC5jbGFzc05hbWU9J2NlbGwnO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHRoZSBJRCB2YWx1ZSBvZiBlYWNoIGNlbGwgdG8gdGhlIHJvdy9jb2x1bW4gdmFsdWUgZm9ybWF0dGVkIGFzIHJfY1xyXG4gICAgICAgICAgICBjZWxsLmlkID0gciArICdfJyArIGM7XHJcblxyXG4gICAgICAgICAgICBpZiAocGhhbmRsZSA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgX3NldE15TGlzdGVuZXJzKGNlbGwsIHNoaXBzLCBmbGVldCwgcGxheWVyKVxyXG5cdCAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICBfc2V0UGxheWVyTGlzdGVuZXJzKHBsYXllciwgY2VsbCwgcGhhbmRsZSk7XHJcblx0ICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZ3JpZDtcclxufVxyXG5cclxuZnVuY3Rpb24gX3NldE15TGlzdGVuZXJzKGNlbGwsIHNoaXBzLCBmbGVldCwgcGxheWVyKXtcclxuICAgICAgICAgICAgLy8gU2V0IHVwIGRyYWcgYW5kIGRyb3AgZm9yIGVhY2ggY2VsbC5cclxuICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsJ3RydWUnKTtcclxuXHJcblxyXG4gICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkPSdtb3ZlJztcclxuXHRcdCAgICBsZXQgdHlwZSA9IF9nZXRUeXBlQnlDbGFzcyhzaGlwcywgdGhpcy5jbGFzc05hbWUpO1xyXG5cdFx0ICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHdoaWNoIHNxdWFyZSB3YXMgY2xpY2tlZCB0byBndWlkZSBwbGFjZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3RhcnQgPSBfZmluZF9zdGFydCh0aGlzLmlkLCBzaGlwLm9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dC9wbGFpblwiLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiAgICAgICAgc3RhcnQub2Zmc2V0LFxyXG5cdFx0XHRcdCAgICAgICAgc3RhcnRfY29vcmQ6ICAgc3RhcnQuc3RhcnRfY29vcmQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogICAgICAgICBzaGlwLnNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAgICAgICAgICB0eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb29yZDogZmxlZXQuZ2hvc3RTaGlwKHR5cGUsIHN0YXJ0LnN0YXJ0X2Nvb3JkKSxcclxuXHRcdFx0XHQgICAgICAgIG9yaWVudGF0aW9uOiAgIHNoaXAub3JpZW50YXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBEcmFnL0Ryb3AgY2FwYWJpbGl0aWVzXHJcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkcm9wcGluZycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkcm9wT2JqID0gSlNPTi5wYXJzZShldi5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvcGxhaW5cIikpO1xyXG5cdFx0ICAgIGNvbnNvbGUubG9nKCdjdXJyZW50IGNvb3JkOiAnLCBkcm9wT2JqLmN1cnJlbnRfY29vcmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzaGlwPXNoaXBzLmdldFNoaXAoZHJvcE9iai50eXBlKTtcclxuXHJcblx0XHQgICAgbGV0IGRyb3BTaGlwID0gZmxlZXQuZ2hvc3RTaGlwKGRyb3BPYmoudHlwZSwgZXYudGFyZ2V0LmlkLCBkcm9wT2JqLm9yaWVudGF0aW9uLCBzaGlwLnNpemUsIGRyb3BPYmoub2Zmc2V0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZmxlZXQudmFsaWRhdGVTaGlwKGRyb3BTaGlwLCBkcm9wT2JqLnR5cGUpKSB7XHJcblx0XHRcdCAgICAvLyBSZW1vdmUgaW5pdGlhbCBpbWFnZVxyXG5cdFx0XHQgICAgZGlzcGxheVNoaXAoc2hpcHMsIGRyb3BPYmoudHlwZSk7XHJcblxyXG5cdFx0XHQgICAgZmxlZXQuc2V0RmxlZXQgKGRyb3BPYmoub3JpZW50YXRpb24sIGRyb3BPYmoudHlwZSwgc2hpcC5zaXplLCBldi50YXJnZXQuaWQsIGRyb3BPYmoub2Zmc2V0KTsgXHJcblxyXG5cdFx0XHQgICAgLy8gUmVkcmF3IGltYWdlIGluIG5ldyBsb2NhdGlvblxyXG5cdFx0XHQgICAgZGlzcGxheVNoaXAoc2hpcHMsIGRyb3BPYmoudHlwZSk7XHJcblxyXG5cdFx0IFx0ICAgIHBsYXllci5zZXRNb3ZlKHt0eXBlOiAnbW92ZScsIGNvb3JkaW5hdGU6IGV2LnRhcmdldC5pZH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkcmFnb3ZlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXYuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3Q9J21vdmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApKTtcclxuXHJcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoXHJcblx0XHRmdW5jdGlvbihlKXtcclxuXHRcdCAgICBsZXQgdHlwZSA9IF9nZXRUeXBlQnlDbGFzcyhzaGlwcywgdGhpcy5jbGFzc05hbWUpO1xyXG5cdFx0ICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuXHRcdCAgICBsZXQgb3JpZW50YXRpb24gPSAoc2hpcC5vcmllbnRhdGlvbiA9PSAneCcpID8gJ3knOid4JzsgLy8gZmxpcCB0aGUgb3JpZW50YXRpb25cclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3RhcnQgPSBfZmluZF9zdGFydChlLnRhcmdldC5pZCwgb3JpZW50YXRpb24sIHNoaXAuc2l6ZSwgdHlwZSk7XHJcblx0XHQgICAgbGV0IGdob3N0ID0gZmxlZXQuZ2hvc3RTaGlwKHR5cGUsIGUudGFyZ2V0LmlkLCBvcmllbnRhdGlvbiwgc2hpcC5zaXplLCBzdGFydC5vZmZzZXQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihmbGVldC52YWxpZGF0ZVNoaXAoZ2hvc3QsIHR5cGUpKSB7XHJcblx0XHQgICAgICAgIC8vIFJlbW92ZSBpbml0aWFsIGltYWdlXHJcblx0XHQgICAgICAgIGRpc3BsYXlTaGlwKHNoaXBzLCB0eXBlKTtcclxuICAgIFxyXG5cdFx0ICAgICAgICBmbGVldC5zZXRGbGVldCAob3JpZW50YXRpb24sIHR5cGUsIHNoaXAuc2l6ZSwgZS50YXJnZXQuaWQpOyBcclxuICAgIFxyXG5cdFx0ICAgICAgICAvLyBSZWRyYXcgaW1hZ2UgaW4gbmV3IGxvY2F0aW9uXHJcblx0XHQgICAgICAgIGRpc3BsYXlTaGlwKHNoaXBzLCB0eXBlKTtcclxuXHRcdCBcdHBsYXllci5zZXRNb3ZlKHt0eXBlOiAncGl2b3QnLCBjb29yZGluYXRlOiBlLnRhcmdldC5pZH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX3NldFBsYXllckxpc3RlbmVycyhwbGF5ZXIsIGNlbGwsIGhhbmRsZSl7XHJcbiAgICAgICAgICAgIC8vIFNldCB0aGUgSUQgdmFsdWUgb2YgZWFjaCBjZWxsIHRvIHRoZSByb3cvY29sdW1uIHZhbHVlIGZvcm1hdHRlZCBhcyByX2NcclxuICAgICAgICAgICAgY2VsbC5pZCA9IGhhbmRsZSArICdfJyArIGNlbGwuaWQ7XHJcbiAgICAgICAgICAgIC8vIFNldCB1cCBkcmFnIGFuZCBkcm9wIGZvciBlYWNoIGNlbGwuXHJcblxyXG4gICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKFxyXG5cdFx0ZnVuY3Rpb24oZSl7XHJcblx0XHQgICAgaWYocGxheWVyLmNhbk1vdmUoKSkge1xyXG5cdFx0ICAgICAgICBwbGF5ZXIuc2V0TW92ZSh7dHlwZTogJ2F0dGFjaycsXHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlOiBlLnRhcmdldC5pZH0pO1xyXG5cdFx0ICAgICAgICBjb25zb2xlLmxvZyggZS50YXJnZXQuaWQgKyAnIGlzIHVuZGVyIGF0dGFjaycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHRcdH1cclxuICAgICAgICAgICAgKSk7XHJcbn1cclxuXHJcbi8qXHJcbiAqIF9maW5kX3N0YXJ0IC0gRGV0ZXJtaW5lIHRoZSBzdGFydGluZyBjb29yZGluYXRlIG9mIGEgc2hpcCBnaXZlbiB0aGUgc3F1YXJlIHRoYXQgd2FzIGNsaWNrZWQuIEZvciBleGFtcGxlXHJcbiAqIGl0IGlzIHBvc3NpYmxlIHRoYXQgYSBiYXR0bGVzaGlwIGFsb25nIHRoZSB4LWF4aXMgd2FzIGNsaWNrZWQgYXQgbG9jYXRpb24gM18zIGJ1dCB0aGF0IHdhcyB0aGUgc2Vjb25kIHNxdWFyZVxyXG4gKiBvbiB0aGUgc2hpcC4gVGhpcyBmdW5jdGlvbiB3aWxsIGlkZW50aWZ5IHRoYXQgdGhlIGJhdHRsZXNoaXAgc3RhcnRzIGF0IDJfMy5cclxuICovXHJcblxyXG5mdW5jdGlvbiBfZmluZF9zdGFydChzdGFydF9wb3MsIG9yaWVudGF0aW9uLCBzaXplLCB0eXBlKXtcclxuICAgIGxldCBpbmRleCA9IChvcmllbnRhdGlvbiA9PSAneCcpID8gMCA6IDE7XHJcblxyXG4gICAgbGV0IHBpZWNlcz1zdGFydF9wb3Muc3BsaXQoJ18nKTtcclxuICAgIGxldCBvZmZzZXQgPSAwO1xyXG5cclxuICAgIGZvciAoaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XHJcblx0aWYgKHBpZWNlc1tpbmRleF0gPT0gMCkge2JyZWFrO31cclxuICAgICAgICBwaWVjZXNbaW5kZXhdLS07XHJcblx0bGV0IGcgPSBmbGVldC5jaGVja0dyaWQocGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdKTtcclxuICAgICAgICBpZiAoZyAhPSB1bmRlZmluZWQgJiYgZyA9PSB0eXBlICYmIGcgIT0gZmFsc2Upe1xyXG5cdCAgICBvZmZzZXQrKztcclxuICAgICAgICAgICAgc3RhcnRfcG9zID0gcGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge3N0YXJ0X3Bvczogc3RhcnRfcG9zLCBvZmZzZXQ6IG9mZnNldH07XHJcbn1cclxuXHJcbmxldCBkaXNwbGF5U2hpcCA9IGZ1bmN0aW9uIChzaGlwcywgdHlwZSkge1xyXG4gICAgbGV0IGNvb3JkaW5hdGVzID0gZmxlZXQuZ2V0RmxlZXQodHlwZSk7XHJcbiAgICBsZXQgc2hpcCA9IHNoaXBzLmdldFNoaXAodHlwZSk7XHJcblxyXG4gICAgZm9yIChjb29yZCBpbiBjb29yZGluYXRlcykge1xyXG4gICAgICAgIF9zZXRTcGFjZShjb29yZGluYXRlc1tjb29yZF0sIHNoaXAuY2xpY2tDbGFzcyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9zZXRTcGFjZShzcGFjZSwgY2xhc3NOYW1lKSB7XHJcbiAgICB2YXIgYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNwYWNlKTsgXHJcbiAgICBiLmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX2dldFR5cGVCeUNsYXNzKHNoaXBzLCBjbGFzc05hbWUpe1xyXG5cdGxldCBzaGlwTGlzdCA9IHNoaXBzLmdldFNoaXAoKTtcclxuXHRmb3IgKHMgaW4gc2hpcExpc3Qpe1xyXG5cdFx0aWYgKGNsYXNzTmFtZS5tYXRjaChzaGlwTGlzdFtzXS5jbGlja0NsYXNzKSl7XHJcblx0XHRcdHJldHVybiBzaGlwTGlzdFtzXS50eXBlO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgY2xpY2thYmxlR3JpZDogY2xpY2thYmxlR3JpZCxcclxuICAgIGRpc3BsYXlTaGlwOiBkaXNwbGF5U2hpcFxyXG59XHJcblxyXG4iLCIvLyBNb2R1bGUgdG8gbWFuYWdlIG1vdmVzIG9uIHBsYXllcidzIHR1cm4uXG5cbmxldCBmbGVldCA9IHJlcXVpcmUoJy4vZmxlZXQuanMnKTtcblxubGV0IG1vdmVMaXN0ID0gW107XG5sZXQgbW92ZU1hcCA9IHt9O1xuXG5sZXQgZGVsZXRlTW92ZSA9IGZ1bmN0aW9uKCl7XG59XG5cbmxldCBjbGVhck1vdmVMaXN0ID0gZnVuY3Rpb24oKSB7XG5cdG1vdmVMaXN0ID0gW107XG59XG5cbi8vIENyZWF0ZSBhIGJsb2NrIHRvIHZpc3VhbGx5IHJlcHJlc2VudCBhIG1vdmUgc28gaXQgY2FuIGJlIHJlb3JkZXJlZCBpZiB3YW50ZWRcbmxldCBtb3ZlTGlzdEJsb2NrID0gZnVuY3Rpb24oaGFuZGxlLCBtb3ZlVGV4dCkge1xuXHRsZXQgYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRiLmlkID0gaGFuZGxlO1xuXHRiLndpZHRoID0gMTAwO1xuXHRiLmhlaWdodCA9IDIxO1xuXG5cdGIuaW5uZXJIVE1MPW1vdmVUZXh0O1xuXG4gICAgICAgIGIuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCd0cnVlJyk7XG5cdG1vdmVPcmRlckhhbmRsZXIoYik7XG5cdHJldHVybiBiO1xufVxuXG4vLyBTZXQgdXAgZHJhZyBkcm9wIGZ1bmN0aW9uYWxpdHkgZm9yIHNldHRpbmcgbW92ZSBvcmRlclxubGV0IG1vdmVPcmRlckhhbmRsZXIgPSBmdW5jdGlvbihwbykge1xuICAgIHBvLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsKGZ1bmN0aW9uKGUpe1xuXHQgICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZD0nbW92ZSc7XG5cdCAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dC9wbGFpblwiLFxuXHRcdEpTT04uc3RyaW5naWZ5KHtcblx0XHRcdGNoYW5nZU1vdmU6IGUudGFyZ2V0LmlkXG5cdFx0fSlcblx0ICAgICk7XG4gICAgfSkpO1xuICAgIHBvLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywoZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdD0nbW92ZSc7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KSk7XG4gICAgcG8uYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkcm9wT2JqID0gSlNPTi5wYXJzZShlLmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9wbGFpblwiKSk7XG5cdCAgICBcdCAgICBhbHRlck1vdmVJbmRleChkcm9wT2JqLmNoYW5nZU1vdmUsIGUudGFyZ2V0LmlkKTtcblx0ICAgIFx0ICAgIGRpc3BsYXlNb3ZlT3JkZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pKTtcbn1cblxuZnVuY3Rpb24gYWx0ZXJNb3ZlSW5kZXgoc3RhcnRJbmRleCwgZW5kSW5kZXgpe1xuXHRzdGFydElkID0gc3RhcnRJbmRleDtcblx0c3RhcnRJbmRleCA9IHBhcnNlSW50KG1vdmVNYXBbc3RhcnRJbmRleF0pO1xuXHRlbmRJbmRleCAgID0gcGFyc2VJbnQobW92ZU1hcFtlbmRJbmRleF0pO1xuXG5cdGxldCBiZWdpbiA9IHN0YXJ0SW5kZXggPCBlbmRJbmRleCA/IHBhcnNlSW50KHN0YXJ0SW5kZXgsIDEwKSA6IHBhcnNlSW50KGVuZEluZGV4LCAxMCk7XG5cdGxldCBlbmQgPSAgIHN0YXJ0SW5kZXggPCBlbmRJbmRleCA/IHBhcnNlSW50KGVuZEluZGV4LCAxMCkgOiBwYXJzZUludChzdGFydEluZGV4LCAxMCk7XG5cdGxldCBob2xkID0gbW92ZUxpc3Rbc3RhcnRJbmRleF07XG5cblx0d2hpbGUoYmVnaW4gPCBlbmQpe1xuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vdmVMaXN0W2JlZ2luXS5pZCkuYXBwZW5kQ2hpbGQoKG1vdmVMaXN0W2JlZ2luKzFdKSk7XG5cdFx0bW92ZUxpc3RbYmVnaW5dID0gbW92ZUxpc3RbYmVnaW4rMV07XG5cdFx0bW92ZU1hcFtzdGFydElkXSA9IGJlZ2luKzE7XG5cdFx0YmVnaW4rKztcblx0fVxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChtb3ZlTGlzdFtlbmRdLmlkKS5hcHBlbmRDaGlsZChkb2N1bWVudC5nZXRFbGVtZW50QnlJZFtob2xkXS5pZCk7XG5cdG1vdmVMaXN0W2VuZF0gPSBob2xkO1xuXHRtb3ZlTWFwW3N0YXJ0SWRdID0gZW5kO1xufVxuXG5mdW5jdGlvbiBkaXNwbGF5TW92ZU9yZGVyKCl7XG59XG5cbmxldCByZXNvbHZlTW92ZXMgPSBmdW5jdGlvbiAoKXtcblx0bGV0IHBhcmVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGdhbWVEaWFsb2cpO1xuXHRjb25zb2xlLmxvZygnUmVzb2x2aW5nIG1vdmVzJyk7XG5cdGZvcihtIGluIG1vdmVMaXN0KSB7XG5cdFx0bGV0IG1vdmUgPSBtb3ZlTGlzdFttXTtcblx0XHRjb25zb2xlLmxvZygnbW92ZTogJywgbW92ZSk7XG5cdFx0c3dpdGNoKG1vdmUudHlwZSkge1xuXHRcdFx0Y2FzZSAnYXR0YWNrJzogXG5cdFx0XHRcdGF0dGFja1BsYXllcihtb3ZlLmNvb3JkaW5hdGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ21pbmUnOlxuXHRcdFx0XHRzZXRNaW5lKG1vdmUuY29vcmRpbmF0ZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnbW92ZSc6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAncGl2b3QnOlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdGxldCBjaGlsZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vdmUuY29vcmRpbmF0ZSk7XG5cdHBhcmVudC5yZW1vdmVDaGlsZChjaGlsZCk7XG5cdH1cbn1cblxubGV0IGF0dGFja1BsYXllciA9IGZ1bmN0aW9uKGNvb3JkaW5hdGUpe1xufVxuXG5sZXQgc2V0TWluZSA9IGZ1bmN0aW9uKGNvb3JkaW5hdGUpe1xufVxuXG5sZXQgc2V0TW92ZSA9IGZ1bmN0aW9uKG1vdmUpe1xuXHRsZXQgbW92ZVN0cmluZztcblx0aWYobW92ZU1hcFttb3ZlLmNvb3JkaW5hdGVdID09IHVuZGVmaW5lZCkge1xuXHRcdG1vdmVNYXBbbW92ZS5jb29yZGluYXRlXSA9IG1vdmVMaXN0Lmxlbmd0aDtcblxuXHRcdC8vaWYgKG1vdmUudHlwZSA9PSAnYXR0YWNrJykge1xuXHRcdFx0bW92ZVN0cmluZyA9IG1vdmUudHlwZSArICc6ICcgKyBtb3ZlLmNvb3JkaW5hdGU7XG5cdFx0Ly99XG5cblx0XHRsZXQgYiA9IG1vdmVMaXN0QmxvY2sobW92ZS5jb29yZGluYXRlLCBtb3ZlU3RyaW5nKTtcblx0XHRtb3ZlTGlzdC5wdXNoKGIpO1xuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKS5hcHBlbmRDaGlsZChiKTtcblx0fVxufVxuXG5sZXQgZ2V0TW92ZVNpemUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gbW92ZUxpc3QubGVuZ3RoO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjbGVhck1vdmVMaXN0OiBjbGVhck1vdmVMaXN0LFxuICAgIHNldE1vdmU6IHNldE1vdmUsXG4gICAgZGVsZXRlTW92ZTogZGVsZXRlTW92ZSxcbiAgICBtb3ZlT3JkZXJIYW5kbGVyOiBtb3ZlT3JkZXJIYW5kbGVyLFxuICAgIHJlc29sdmVNb3ZlczogcmVzb2x2ZU1vdmVzLFxuICAgIGdldE1vdmVTaXplOiBnZXRNb3ZlU2l6ZVxufVxuIiwiLy9sZXQgcmFiYml0ID0gcmVxdWlyZSgnLi9ic19SYWJiaXRNUScpO1xubGV0IGZsZWV0ID0gcmVxdWlyZSgnLi9mbGVldC5qcycpO1xubGV0IG1vdmUgPSByZXF1aXJlKCcuL21vdmUuanMnKTtcblxubGV0IHBsYXllclJvc3RlciA9IG5ldyBPYmplY3Q7IC8vIFBsYWNlaG9sZGVyIGZvciBhbGwgcGxheWVycyBpbiB0aGUgZ2FtZVxubGV0IHBsYXllck9yZGVyID0gW107IC8vIE9yZGVyIG9mIHBsYXllciB0dXJuXG5cbmxldCBtZTtcbmxldCBvcmRlckluZGV4PTA7XG5sZXQgZmxvdz1bJ3JlZ2lzdGVyJywnZ2FtZSddO1xubGV0IGN1cnJlbnRGbG93O1xubGV0IGdhbWVPbj1mYWxzZTtcbmxldCBzZXRHYW1lT24gPSBmdW5jdGlvbigpe1xuXHRnYW1lT24gPSB0cnVlO1xufVxuXG5sZXQgZ2V0R2FtZU9uID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIGdhbWVPbjtcbn1cblxubGV0IGNhbk1vdmUgPSBmdW5jdGlvbigpIHtcblx0Ly9pZiAocGxheWVyT3JkZXIubGVuZ3RoID4gcGxheWVyTW92ZS5sZW5ndGgpIHJldHVybiB0cnVlO1xuXHRpZiAocGxheWVyT3JkZXIubGVuZ3RoID4gbW92ZS5nZXRNb3ZlU2l6ZSgpKSByZXR1cm4gdHJ1ZTtcblxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbi8vIFJlZ2lzdGVyIGhhbmRsZVxubGV0IHJlZ2lzdGVyID0gZnVuY3Rpb24oaGFuZGxlKXtcblx0bWUgPSBoYW5kbGU7IC8vIFNlbGYgaWRlbnRpZnkgdGhpbmVzZWxmXG5cdC8vIFRPRE8gLSBjYWxsIG91dCB0byB0aGUgcmVnaXN0cmF0aW9uIHNlcnZpY2UgYW5kIGdldCBiYWNrIGhhbmRsZSBhbmQgdHVybiBvcmRlci4gVGhpc1xuXHQvLyBzdHJ1Y3R1cmUgcmVwcmVzZW50cyB0aGUgcmV0dXJuIGNhbGwgZnJvbSB0aGUgcmVnaXN0cmF0aW9uIHNlcnZpY2UuXG5cdGNvbnN0IHJlZyA9IHtcblx0XHQgICAgICBoYW5kbGU6ICdlbHNwb3JrbycsXG5cdFx0ICAgICAgb3JkZXI6IDBcblx0fTtcblxuXHQvL19wb3B1bGF0ZV9wbGF5ZXJPcmRlcignZWxzcG9ya28nLCAwKTtcblx0cGxheWVyT3JkZXJbcmVnLm9yZGVyXSA9IHJlZy5oYW5kbGU7XG5cdGdhbWVGbG93KCk7XG5cdHJldHVybjtcbn1cblxuLy9BY2NlcHQgcmVnaXN0cmF0aW9uIGZyb20gb3RoZXIgcGxheWVyc1xubGV0IGFjY2VwdFJlZyA9IGZ1bmN0aW9uKGhhbmRsZSwgb3JkZXIsIGdyaWQsIHNoaXBzLCBmbGVldCwgcGxheWVyKXtcblx0cGxheWVyT3JkZXJbb3JkZXJdID0gaGFuZGxlO1xuXHRwbGF5ZXJSb3N0ZXIgPSB7XG5cdFx0W2hhbmRsZV06IHtncmlkOiBmbGVldC5idWlsZE5hdXRpY2FsQ2hhcnR9XG5cdH1cblx0bGV0IHBnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllckdyaWQnKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSk7O1xuXHRcblx0Ly9sZXQgcGdkID0gcGcuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xuXHRwZy5pZD1oYW5kbGU7XG5cdHBnLmlubmVySFRNTD1oYW5kbGU7XG5cblx0cGcuYXBwZW5kQ2hpbGQoZ3JpZC5jbGlja2FibGVHcmlkKDEwLCAxMCwgc2hpcHMsIGZsZWV0LCBwbGF5ZXIsIGhhbmRsZSkpO1xufVxuXG5sZXQgbXlUdXJuID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiAoY3VycmVudFBsYXllcigpID09IG1lKSA/IDEgOiAwO1xufVxuXG5sZXQgbmV4dFBsYXllciA9IGZ1bmN0aW9uKCkge1xuXHRvcmRlckluZGV4ID0gKG9yZGVySW5kZXggPT0gcGxheWVyT3JkZXIubGVuZ3RoIC0gMSkgPyAgMCA6IG9yZGVySW5kZXgrMTtcblx0cmV0dXJuO1xufVxuXG5sZXQgY3VycmVudFBsYXllciA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBwbGF5ZXJPcmRlcltvcmRlckluZGV4XTtcbn1cblxubGV0IGdhbWVGbG93ID0gZnVuY3Rpb24oKXtcblx0aWYgKGN1cnJlbnRGbG93ICE9IHVuZGVmaW5lZCl7XG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZmxvd1tjdXJyZW50Rmxvd10pLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuXHRcdGN1cnJlbnRGbG93Kys7XG5cdH0gZWxzZSB7XG5cdFx0Y3VycmVudEZsb3cgPSAwO1xuXHR9XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGZsb3dbY3VycmVudEZsb3ddKS5zdHlsZS5kaXNwbGF5PSdpbmxpbmUnO1xufVxuXG5sZXQgc2V0TW92ZSA9IGZ1bmN0aW9uKG0pe1xuXHRyZXR1cm4gbW92ZS5zZXRNb3ZlKG0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZWdpc3RlcjogcmVnaXN0ZXIsXG4gICAgYWNjZXB0UmVnOiBhY2NlcHRSZWcsXG4gICAgbXlUdXJuOiBteVR1cm4sXG4gICAgY3VycmVudFBsYXllcjogY3VycmVudFBsYXllcixcbiAgICBuZXh0UGxheWVyOiBuZXh0UGxheWVyLFxuICAgIGdhbWVGbG93OiBnYW1lRmxvdyxcbiAgICBzZXRHYW1lT246IHNldEdhbWVPbixcbiAgICBjYW5Nb3ZlOiBjYW5Nb3ZlLFxuICAgIGdldEdhbWVPbjogZ2V0R2FtZU9uLFxuICAgIHNldE1vdmU6IHNldE1vdmVcbiAgICAvL2Rpc3BsYXlNb3ZlT3JkZXI6IGRpc3BsYXlNb3ZlT3JkZXI7XG59XG4iLCJ2YXIgZmxlZXQ9cmVxdWlyZSgnLi9mbGVldC5qcycpO1xyXG5cclxuLy8gQ29uZmlnIHNldHRpbmdzIFxyXG5sZXQgc2hpcF9jb25maWcgPSB7XHJcbiAgICBhaXJjcmFmdENhcnJpZXIgOiB7XHJcbiAgICAgICAgc2l6ZSA6IDUsXHJcbiAgICAgICAgaWQgOiAnYWlyY3JhZnRDYXJyaWVyJyxcclxuICAgICAgICBjb2xvciA6ICdDcmltc29uJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ2FjY2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnQWlyY3JhZnQgQ2FycmllcicsXHJcbiAgICB9LFxyXG4gICAgYmF0dGxlc2hpcCA6IHtcclxuICAgICAgICBzaXplIDogNCxcclxuICAgICAgICBpZCA6ICdiYXR0bGVzaGlwJyxcclxuICAgICAgICBjb2xvcjonRGFya0dyZWVuJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ2JzY2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnQmF0dGxlc2hpcCcsXHJcbiAgICB9LFxyXG4gICAgZGVzdHJveWVyIDoge1xyXG4gICAgICAgIHNpemUgOiAzLFxyXG4gICAgICAgIGlkIDogJ2Rlc3Ryb3llcicsXHJcbiAgICAgICAgY29sb3I6J0NhZGV0Qmx1ZScsXHJcbiAgICAgICAgY2xpY2tDbGFzcyA6ICdkZWNsaWNrZWQnLFxyXG4gICAgICAgIGxhYmVsIDogJ0Rlc3Ryb3llcicsXHJcbiAgICB9LFxyXG4gICAgc3VibWFyaW5lICA6IHtcclxuICAgICAgICBzaXplIDogMyxcclxuICAgICAgICBpZCA6ICdzdWJtYXJpbmUnLFxyXG4gICAgICAgIGNvbG9yOidEYXJrUmVkJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ3N1Y2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnU3VibWFyaW5lJyxcclxuICAgIH0sXHJcbiAgICBwYXRyb2xCb2F0IDoge1xyXG4gICAgICAgIHNpemUgOiAyLFxyXG4gICAgICAgIGlkIDogJ3BhdHJvbEJvYXQnLFxyXG4gICAgICAgIGNvbG9yOidHb2xkJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ3BiY2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnUGF0cm9sIEJvYXQnLFxyXG4gICAgfSxcclxufTtcclxuXHJcbi8vIFNoaXAgY29uc3RydWN0b3IgLSBzaGlweWFyZD8/P1xyXG5mdW5jdGlvbiBfc2hpcChzaXplLCBpZCwgY29sb3IsIGNsaWNrQ2xhc3MsIGxhYmVsKSB7XHJcbiAgICAgICAgdGhpcy5zaXplICAgICAgICA9IHNpemU7XHJcbiAgICAgICAgdGhpcy5pZCAgICAgICAgICA9IGlkO1xyXG4gICAgICAgIHRoaXMuY29sb3IgICAgICAgPSBjb2xvcjtcclxuICAgICAgICB0aGlzLmNsaWNrQ2xhc3MgID0gY2xpY2tDbGFzcztcclxuICAgICAgICB0aGlzLmxhYmVsICAgICAgID0gbGFiZWw7XHJcblxyXG4gICAgICAgIHJldHVybiAodGhpcyk7XHJcbn1cclxuXHJcbmxldCBzaGlwcz17fTtcclxuXHJcbi8qXHJcbiAqIFRoZSBzaGlwIG9iamVjdCBob2xkcyB0aGUgY3VycmVudCBvcmllbnRhdGlvbiBvZiB0aGUgc2hpcCBhbmQgdGhlIHN0YXJ0IGNvb3JkaW5hdGUgKHRvcG1vc3QvbGVmdG1vc3QpLiBXaGVuXHJcbiAqIHRoZXJlIGlzIGEgY2hhbmdlIHRvIHRoZSBzaGlwIHRoZSBtYXN0ZXIgbWF0cml4IG5lZWRzIHRvIGJlIHVwZGF0ZWQuIEFuIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdoZW4gdGhlcmUgaXNcclxuICogYSBjb29yZGluYXRlIGNoYW5nZS4gVGhpcyBsaXN0ZW5lciB3aWxsIHVwZGF0ZSB0aGUgbWFzdGVyIG1hdHJpeC4gQ2FsbHMgdG8gY2hlY2sgbG9jYXRpb24gKG1vdmUgdmFsaWR0aW9uLCBcclxuICogY2hlY2sgaWYgaGl0LCBldGMuKSB3aWxsIGJlIG1hZGUgYWdhaW5zdCB0aGUgbWFzdGVyIG1hdHJpeC5cclxuICovXHJcbi8qXHJcbmxldCBzaGlwSWludCA9IGZ1bmN0aW9uKCl7XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKCdzaGlwTW92ZScsKCkpIH1cclxuXHJcbn1cclxuKi9cclxuLy8gUHVibGljIGZ1bmN0aW9uIHRvIGluaXRpYWxseSBjcmVhdGUgc2hpcHMgb2JqZWN0XHJcbmxldCBidWlsZFNoaXBzID0gZnVuY3Rpb24gKCl7XHJcbiAgICBmb3IgKGxldCBzIGluIHNoaXBfY29uZmlnKXtcclxuICAgICAgICBzaGlwc1tzXSA9IHtzaXplOiBzaGlwX2NvbmZpZ1tzXS5zaXplLCBcclxuXHRcdCAgICB0eXBlOiBzaGlwX2NvbmZpZ1tzXS5pZCxcclxuXHQgICAgICAgICAgICBjb2xvcjogc2hpcF9jb25maWdbc10uY29sb3IsXHJcblx0XHQgICAgY2xpY2tDbGFzczogc2hpcF9jb25maWdbc10uY2xpY2tDbGFzcyxcclxuXHRcdCAgICBsYWJlbDogc2hpcF9jb25maWdbc10ubGFiZWxcclxuXHQgICAgICAgICAgIH07XHJcbiAgICB9XHJcbnJldHVybiBzaGlwcztcclxufVxyXG5cclxubGV0IGJ1aWxkU2hpcCA9IGZ1bmN0aW9uKHR5cGUpe1xyXG4gICAgICAgIHNoaXBzW3R5cGVdID0gX3NoaXAoc2hpcF9jb25maWdbdHlwZV0uc2l6ZSwgc2hpcF9jb25maWdbdHlwZV0uaWQsIHNoaXBfY29uZmlnW3R5cGVdLmNvbG9yLCBzaGlwX2NvbmZpZ1t0eXBlXS5jbGlja0NsYXNzLCBzaGlwX2NvbmZpZ1t0eXBlXS5sYWJlbCk7XHJcblx0cmV0dXJuIHNoaXBzO1xyXG59XHJcblxyXG4vLyBTZXQgdmFsdWUgaW4gc2hpcCBvYmplY3QuIFxyXG5sZXQgc2V0U2hpcCA9IGZ1bmN0aW9uKHR5cGUsIGtleSwgdmFsdWUpe1xyXG4gICAgICAgIGlmICh0eXBlICYmIHNoaXBzW3R5cGVdICYmIGtleSkgeyAvLyBvbmx5IGF0dGVtcHQgYW4gdXBkYXRlIGlmIHRoZXJlIGlzIGEgbGVnaXQgc2hpcCB0eXBlIGFuZCBhIGtleVxyXG4gICAgICAgICAgICBzaGlwc1t0eXBlXS5rZXkgPSB2YWx1ZTtcclxuICAgfVxyXG59XHJcblxyXG4vLyBSZXR1cm4gc2hpcCBvYmplY3QgaWYgbm8gdHlwZSBnaXZlbiBvdGhlcndpc2UgcmV0dXJuIG9iamVjdCBjb250YWluaW5nIGp1c3QgcmVxdWVzdGVkIHNoaXBcclxubGV0IGdldFNoaXAgPSBmdW5jdGlvbiAodHlwZSl7XHJcbiAgICBpZih0eXBlKXtcclxuICAgICAgICByZXR1cm4gc2hpcHNbdHlwZV07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBzaGlwcztcclxuICAgIH1cclxufVxyXG5cclxuLy8gUHJpdmF0ZSBmdW5jdGlvbiB0byByYW5kb21seSBkZXRlcm1pbmUgc2hpcCdzIG9yaWVudGF0aW9uIGFsb25nIHRoZSBYLWF4aXMgb3IgWS1heGlzLiBPbmx5IHVzZWQgd2hlbiBwbG90dGluZyBzaGlwcyBmb3IgdGhlIGZpcnN0IHRpbWUuXHJcbmZ1bmN0aW9uIF9nZXRTdGFydENvb3JkaW5hdGUoc2l6ZSl7XHJcbiAgICBjb25zdCBzdGFydF9vcmllbnRhdGlvbj1NYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTApID4gNSA/ICd4JyA6ICd5JztcclxuICAgIGNvbnN0IHN0YXJ0X3ggPSBzdGFydF9vcmllbnRhdGlvbiA9PSAneCcgPyBfZ2V0UmFuZG9tQ29vcmRpbmF0ZShzaXplKSA6IF9nZXRSYW5kb21Db29yZGluYXRlKDApO1xyXG4gICAgY29uc3Qgc3RhcnRfeSA9IHN0YXJ0X29yaWVudGF0aW9uID09ICd5JyA/IF9nZXRSYW5kb21Db29yZGluYXRlKHNpemUpIDogX2dldFJhbmRvbUNvb3JkaW5hdGUoMCk7XHJcblxyXG4gICAgcmV0dXJuIHtjb29yZGluYXRlOiBzdGFydF94ICsgJ18nICsgc3RhcnRfeSwgb3JpZW50YXRpb246IHN0YXJ0X29yaWVudGF0aW9ufTtcclxufVxyXG5cclxuLy8gVGFrZSBzaGlwIHNpemUgYW5kIG9yaWVudGF0aW9uIGludG8gYWNjb3VudCB3aGVuIGRldGVybWluaW5nIHRoZSBzdGFydCByYW5nZSB2YWx1ZS4gZXguIGRvbid0XHJcbi8vIGxldCBhbiBhaXJjcmFmdCBjYXJyaWVyIHdpdGggYW4gb3JpZW50YXRpb24gb2YgJ1gnIHN0YXJ0IGF0IHJvdyA3IGJlY2F1c2UgaXQgd2lsbCBtYXggb3V0IG92ZXIgdGhlXHJcbi8vIGdyaWQgc2l6ZS5cclxuZnVuY3Rpb24gX2dldFJhbmRvbUNvb3JkaW5hdGUob2Zmc2V0KXtcclxuICAgIGNvbnN0IE1BWF9DT09SRCA9IDEwO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSooTUFYX0NPT1JEIC0gb2Zmc2V0KSk7XHJcblxyXG59XHJcblxyXG4vLyBGSVhNRSBEb2VzIGZsZWV0Lmdob3N0U2hpcCBkbyB0aGlzIG5vdz9cclxuLy8gQnVpbGQgYW4gYXJyYXkgb2YgY29vcmRpbmF0ZXMgZm9yIGEgc2hpcCBiYXNlZCBvbiBpdCdzIG9yaWVudGF0aW9uLCBpbnRlbmRlZCBzdGFydCBwb2ludCBhbmQgc2l6ZVxyXG5sZXQgX3NoaXBTdHJpbmcgPSBmdW5jdGlvbihzKSB7XHJcblx0Y29uc3QgbyA9IHMub3JpZW50YXRpb247XHJcblx0Y29uc3Qgc3QgPSBzLnN0YXJ0X2Nvb3JkaW5hdGU7XHJcblx0bGV0IHIgPSBuZXcgQXJyYXk7XHJcbiAgICAgICAgbGV0IHRfcGllY2VzID0gc3Quc3BsaXQoJ18nKTtcclxuXHRjb25zdCBpID0gbyA9PSAneCcgPyAwIDogMTtcclxuXHJcblx0Zm9yIChsZXQgaj0wOyBqIDwgcy5zaXplO2orKykge1xyXG5cdFx0dF9waWVjZXNbaV0gPSB0X3BpZWNlc1tpXSsxO1xyXG5cdFx0ci5wdXNoICh0X3BpZWNlc1swXSArICdfJyArIHRfcGllY2VzWzFdKTtcclxuXHR9XHJcblx0cmV0dXJuIHI7XHJcbn1cclxuXHJcblxyXG4vKlxyXG4gKiBwbGFjZVNoaXBzIC0gSW5pdGlhbCBwbGFjZW1lbnQgb2Ygc2hpcHMgb24gdGhlIGJvYXJkXHJcbiAqL1xyXG5sZXQgcGxhY2VTaGlwcyA9IGZ1bmN0aW9uIHBsYWNlU2hpcHMoZmxlZXQpe1xyXG4gICAgICAgIC8qIFJhbmRvbWx5IHBsYWNlIHNoaXBzIG9uIHRoZSBncmlkLiBJbiBvcmRlciBkbyB0aGlzIGVhY2ggc2hpcCBtdXN0OlxyXG5cdCAqICAgKiBQaWNrIGFuIG9yaWVudGF0aW9uXHJcblx0ICogICAqIFBpY2sgYSBzdGFydGluZyBjb29yZGluYXRlXHJcblx0ICogICAqIFZhbGlkYXRlIHRoYXQgdGhlIGNvb3JkaW5hdGUgaXMgdmFsaWQgKGRvZXMgbm90IHJ1biBPT0IsIGRvZXMgbm90IGNyb3NzIGFueSBvdGhlciBzaGlwLCBldGMuKVxyXG5cdCAqICAgKiBJZiB2YWxpZDpcclxuXHQgKiAgIFx0KiBTYXZlIHN0YXJ0IGNvb3JkIGFuZCBvcmllbnRhdGlvbiBhcyBwYXJ0IG9mIHNoaXAgb2JqZWN0XHJcblx0ICogICBcdCogUGxvdCBzaGlwIG9uIG1hc3RlciBtYXRyaXhcclxuXHQgKi9cclxuXHRsZXQgc2hpcExpc3QgPSBnZXRTaGlwKCk7XHJcbiAgICAgICAgZm9yICh2YXIgc2hpcCBpbiBzaGlwTGlzdCkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gX2dldFN0YXJ0Q29vcmRpbmF0ZShzaGlwTGlzdFtzaGlwXS5zaXplKTsgXHJcblx0ICAgIGxldCBzaGlwX3N0cmluZyA9IGZsZWV0Lmdob3N0U2hpcChzaGlwTGlzdFtzaGlwXS50eXBlLCBzdGFydC5jb29yZGluYXRlLCBzdGFydC5vcmllbnRhdGlvbik7XHJcblx0ICAgIHNoaXBMaXN0W3NoaXBdLm9yaWVudGF0aW9uID0gc3RhcnQub3JpZW50YXRpb247XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoIWZsZWV0LnZhbGlkYXRlU2hpcChzaGlwX3N0cmluZykpIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0ID0gX2dldFN0YXJ0Q29vcmRpbmF0ZShzaGlwTGlzdFtzaGlwXS5zaXplKTsgXHJcblx0XHRzaGlwTGlzdFtzaGlwXS5vcmllbnRhdGlvbiA9IHN0YXJ0Lm9yaWVudGF0aW9uO1xyXG5cdFx0c2hpcF9zdHJpbmcgPSBmbGVldC5naG9zdFNoaXAoc2hpcExpc3Rbc2hpcF0udHlwZSwgc3RhcnQuY29vcmRpbmF0ZSwgc3RhcnQub3JpZW50YXRpb24pO1xyXG5cdFx0fVxyXG5cclxuICAgICAgICAgICAgZmxlZXQuc2V0RmxlZXQoc3RhcnQub3JpZW50YXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgc2hpcExpc3Rbc2hpcF0udHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICBzaGlwTGlzdFtzaGlwXS5zaXplLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0LmNvb3JkaW5hdGUpO1xyXG4gICAgICAgICAgICB9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBidWlsZFNoaXBzOiBidWlsZFNoaXBzLFxyXG4gICAgYnVpbGRTaGlwOiBidWlsZFNoaXAsXHJcbiAgICBnZXRTaGlwOiBnZXRTaGlwLFxyXG4gICAgc2V0U2hpcDogc2V0U2hpcCxcclxuICAgIHBsYWNlU2hpcHM6IHBsYWNlU2hpcHNcclxufVxyXG4iXX0=
