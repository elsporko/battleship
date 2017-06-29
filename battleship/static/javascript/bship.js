(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

let f=document.getElementById('setFleet');
f.addEventListener('click', 
    function(){
        document.getElementById('setFleet').style.display='none';
        document.getElementById('playerGrid').style.display='inline';
	    playGame();
	    return;
    }, false);

// Set up grid
document.getElementById('myGrid').appendChild(grid.clickableGrid(10, 10, ships, fleet));

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
	if (player.myTurn()){

		//window.open('','attack', 'height=200,width=200,menubar=no,status=no,titlebar=no,toolbar=no', false );
	}
}




},{"./config.js":2,"./fleet.js":3,"./grid.js":4,"./player.js":5,"./ships.js":6}],2:[function(require,module,exports){
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

},{"./ships.js":6}],4:[function(require,module,exports){
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
                _setMyListeners(cell, ships, fleet)
	    } else {
               _setPlayerListeners(player, cell, phandle);
	    }
        }
    }
    return grid;
}

function _setMyListeners(cell, ships, fleet){
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
                    }
                }));
}

function _setPlayerListeners(player, cell, handle){
            // Set the ID value of each cell to the row/column value formatted as r_c
            cell.id = handle + '_' + cell.id;
            // Set up drag and drop for each cell.

            cell.addEventListener('click', (
		function(e){
		    if(player.playerCanMove()) {
		        player.setPlayerMove({type: 'attack',
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


},{"./fleet":3,"./ships":6}],5:[function(require,module,exports){
//let rabbit = require('./bs_RabbitMQ');
let fleet = require('./fleet.js');

let playerRoster = new Object; // Placeholder for all players in the game
let playerOrder = []; // Order of player turn
let playerMove = [];
let playerMoveMap = {};

let me;
let orderIndex=0;
let flow=['register','game'];
let currentFlow;

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

let setPlayerMove = function(move){
	let moveString;
	if(playerMoveMap[move.coordinate] == undefined) {
		playerMoveMap[move.coordinate] = playerMove.length;

		if (move.type == 'attack') {
			moveString = move.type + ': ' + move.coordinate;
		}

		let b = playerMoveBlock(move.coordinate, moveString);
		playerMove.push(b);
		document.getElementById('playOrder').appendChild(b);
	}
}

let deletePlayerMove = function(){
}

let playerCanMove = function() {
	if (playerOrder.length > playerMove.length) return true;

	return false;
}

let playerClearMove = function() {
	player = [];
}

// Create a block to visually represent a move so it can be reordered if wanted
let playerMoveBlock = function(handle, moveText) {
	let b = document.createElement('div');
	b.id = handle;
	b.width = 100;
	b.height = 21;

	b.innerHTML=moveText;

        b.setAttribute('draggable','true');
	playerOrderHandler(b);
	return b;
}

// Set up drag drop functionality for setting move order
let playerOrderHandler = function(po) {
    //document.getElementById('playOrder').setAttribute('draggable','true');
    //player.playerOrderHandlers();
    //let po = document.getElementById('playOrder');
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
	startIndex = parseInt(playerMoveMap[startIndex]);
	endIndex   = parseInt(playerMoveMap[endIndex]);

	let begin = startIndex < endIndex ? parseInt(startIndex, 10) : parseInt(endIndex, 10);
	let end =   startIndex < endIndex ? parseInt(endIndex, 10) : parseInt(startIndex, 10);
	let hold = playerMove[startIndex];

	while(begin < end){
		document.getElementById(playerMove[begin].id).appendChild((playerMove[begin+1]));
		playerMove[begin] = playerMove[begin+1];
		playerMoveMap[startId] = begin+1;
		begin++;
	}
	document.getElementById(playerMove[end].id).appendChild(document.getElementById[hold].id);
	playerMove[end] = hold;
	playerMoveMap[startId] = end;
}

function displayMoveOrder(){
}

module.exports = {
    register: register,
    acceptReg: acceptReg,
    myTurn: myTurn,
    currentPlayer: currentPlayer,
    nextPlayer: nextPlayer,
    gameFlow: gameFlow,
    playerCanMove: playerCanMove,
    playerClearMove: playerClearMove,
    setPlayerMove: setPlayerMove,
    deletePlayerMove: deletePlayerMove,
    playerOrderHandler: playerOrderHandler
    //displayMoveOrder: displayMoveOrder;
}

},{"./fleet.js":3}],6:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJhdHRsZXNoaXAuanMiLCJjb25maWcuanMiLCJmbGVldC5qcyIsImdyaWQuanMiLCJwbGF5ZXIuanMiLCJzaGlwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGdyaWQgPSByZXF1aXJlKCcuL2dyaWQuanMnKTtcclxudmFyIHBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyLmpzJyk7XHJcbnZhciBzaGlwcyA9IHJlcXVpcmUoJy4vc2hpcHMuanMnKTtcclxudmFyIGZsZWV0ID0gcmVxdWlyZSgnLi9mbGVldC5qcycpO1xyXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcuanMnKTtcclxuXHJcblxyXG5wbGF5ZXIuZ2FtZUZsb3coKTtcclxuXHJcbi8qIFJlZ2lzdGVyICovXHJcbi8vIFRPRE8gLSBhdHRhY2ggaGFuZGxlciB0aHJvdWdoIHB1ZzsgbW92ZSBoYW5kbGVycyB0byBhbm90aGVyIG1vZHVsZVxyXG5sZXQgcj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXInKTtcclxuci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuXHQgICAgcGxheWVyLnJlZ2lzdGVyKCk7XHJcblx0ICAgIHJldHVybjtcclxuICAgIH0sIGZhbHNlKTtcclxuXHJcbmxldCBmPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXRGbGVldCcpO1xyXG5mLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXHJcbiAgICBmdW5jdGlvbigpe1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXRGbGVldCcpLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXJHcmlkJykuc3R5bGUuZGlzcGxheT0naW5saW5lJztcclxuXHQgICAgcGxheUdhbWUoKTtcclxuXHQgICAgcmV0dXJuO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxuLy8gU2V0IHVwIGdyaWRcclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ215R3JpZCcpLmFwcGVuZENoaWxkKGdyaWQuY2xpY2thYmxlR3JpZCgxMCwgMTAsIHNoaXBzLCBmbGVldCkpO1xyXG5cclxuLy8gU2V0IHVwIGRyYWcvZHJvcCBvZiBtb3Zlc1xyXG4vL2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKS5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsJ3RydWUnKTtcclxuLy9wbGF5ZXIucGxheWVyT3JkZXJIYW5kbGVyKCk7XHJcblxyXG4vKiBTZXQgcmFuZG9tIGZsZWV0ICovXHJcbnNoaXBzLmJ1aWxkU2hpcHMoKTtcclxuc2hpcHMucGxhY2VTaGlwcyhmbGVldCk7XHJcbmxldCB3aG9sZUZsZWV0ID0gZmxlZXQuZ2V0V2hvbGVGbGVldChmbGVldCk7XHJcbmZvciAodCBpbiB3aG9sZUZsZWV0KSB7XHJcblx0Z3JpZC5kaXNwbGF5U2hpcChzaGlwcywgdCk7XHJcbn1cclxuXHJcbi8qIFxyXG4gKiBNb2NrIGdhbWUgd2lsbCBiZSByZW1vdmVkIFxyXG4gKi9cclxubGV0IG0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnTWVnYW5SZWcnKTtcclxubS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdNZWdhbicsIDEsIGdyaWQsIHNoaXBzLCBmbGVldCwgcGxheWVyKTtcclxuICAgICAgICAvL20uc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ01lZ2FuUmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcblx0Ly9kb2N1bWVudC5nZXRFbGVtZW50QnlJZChmbG93W2N1cnJlbnRGbG93XSkuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgLy9tLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKSk7XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG5sZXQgcnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnUnlhblJlZycpO1xyXG5yeS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdSeWFuJywgMiwgZ3JpZCwgc2hpcHMsIGZsZWV0LCBwbGF5ZXIpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdSeWFuUmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgLy9sZXQgcj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnUnlhbicpLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xyXG4gICAgICAgIC8vci5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJykpO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxubGV0IHRyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1RyYWNleVJlZycpO1xyXG50ci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdUcmFjZXknLCAyLCBncmlkLCBzaGlwcywgZmxlZXQsIHBsYXllcik7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1RyYWNleVJlZycpLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxuLyogUGxheSBnYW1lICovXHJcbi8qXHJcbndoaWxlICgxKSB7XHJcblx0cGxheWVyLmdldFR1cm4oKTtcclxufVxyXG4qL1xyXG5cclxuXHJcbmZ1bmN0aW9uIHBsYXlHYW1lKCl7XHJcblx0aWYgKHBsYXllci5teVR1cm4oKSl7XHJcblxyXG5cdFx0Ly93aW5kb3cub3BlbignJywnYXR0YWNrJywgJ2hlaWdodD0yMDAsd2lkdGg9MjAwLG1lbnViYXI9bm8sc3RhdHVzPW5vLHRpdGxlYmFyPW5vLHRvb2xiYXI9bm8nLCBmYWxzZSApO1xyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbmZpZyAoY29uZmlnKXtcclxuICAgIHNoaXBzID0ge1xyXG4gICAgICAgIGFpcmNyYWZ0Q2FycmllciA6IHtcclxuICAgICAgICAgICAgc2l6ZSA6IDUsXHJcbiAgICAgICAgICAgIGlkIDogJ2FpcmNyYWZ0Q2FycmllcicsXHJcbiAgICAgICAgICAgIGNvbG9yIDogJ0NyaW1zb24nLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ2FjY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ0FpcmNyYWZ0IENhcnJpZXInLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYmF0dGxlc2hpcCA6IHtcclxuICAgICAgICAgICAgc2l6ZSA6IDQsXHJcbiAgICAgICAgICAgIGlkIDogJ2JhdHRsZXNoaXAnLFxyXG4gICAgICAgICAgICBjb2xvcjonRGFya0dyZWVuJyxcclxuICAgICAgICAgICAgY2xpY2tDbGFzcyA6ICdic2NsaWNrZWQnLFxyXG4gICAgICAgICAgICBsYWJlbCA6ICdCYXR0bGVzaGlwJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlc3Ryb3llciA6IHtcclxuICAgICAgICAgICAgc2l6ZSA6IDMsXHJcbiAgICAgICAgICAgIGlkIDogJ2Rlc3Ryb3llcicsXHJcbiAgICAgICAgICAgIGNvbG9yOidDYWRldEJsdWUnLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ2RlY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ0Rlc3Ryb3llcicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtYXJpbmUgIDoge1xyXG4gICAgICAgICAgICBzaXplIDogMyxcclxuICAgICAgICAgICAgaWQgOiAnc3VibWFyaW5lJyxcclxuICAgICAgICAgICAgY29sb3I6J0RhcmtSZWQnLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ3N1Y2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ1N1Ym1hcmluZScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwYXRyb2xCb2F0IDoge1xyXG4gICAgICAgICAgICBzaXplIDogMixcclxuICAgICAgICAgICAgaWQgOiAncGF0cm9sQm9hdCcsXHJcbiAgICAgICAgICAgIGNvbG9yOidHb2xkJyxcclxuICAgICAgICAgICAgY2xpY2tDbGFzcyA6ICdwYmNsaWNrZWQnLFxyXG4gICAgICAgICAgICBsYWJlbCA6ICdQYXRyb2wgQm9hdCcsXHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcbn1cclxuIiwidmFyIHNoaXBzPXJlcXVpcmUoJy4vc2hpcHMuanMnKTtcblxubGV0IG5hdXRpY2FsTWFwID0ge307IC8vIEhhc2ggbG9va3VwIHRoYXQgdHJhY2tzIGVhY2ggc2hpcCdzIHN0YXJ0aW5nIHBvaW50IGFuZCBjdXJyZW50IG9yaWVudGF0aW9uXG5cbmxldCBidWlsZE5hdXRpY2FsQ2hhcnQgPSBmdW5jdGlvbigpe1xuXHRsZXQgY2hhcnQgPSBuZXcgQXJyYXk7XG5cdGZvcihsZXQgaT0wOyBpIDwgMTA7IGkrKykge1xuXHRcdGNoYXJ0W2ldID0gbmV3IEFycmF5O1xuXHRcdGZvciAobGV0IGo9MDsgaiA8IDEwOyBqKyspe1xuXHRcdFx0Y2hhcnRbaV1bal0gPSB1bmRlZmluZWQ7Ly9uZXcgQXJyYXk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBjaGFydDtcbn1cblxubGV0IG5hdXRpY2FsQ2hhcnQgPSBidWlsZE5hdXRpY2FsQ2hhcnQoKTsgLy8gRGV0YWlsZWQgbWF0cml4IG9mIGV2ZXJ5IHNoaXAgaW4gdGhlIGZsZWV0XG5cbmxldCBnZXRGbGVldCA9IGZ1bmN0aW9uKHR5cGUpe1xuXHRsZXQgb3JpZW50YXRpb24gPSBuYXV0aWNhbE1hcFt0eXBlXS5vcmllbnRhdGlvbiA9PSAneCcgPyAwIDogMTtcblxuXHRsZXQgcGllY2VzID0gbmF1dGljYWxNYXBbdHlwZV0uc3RhcnRfY29vcmQuc3BsaXQoJ18nKTtcblx0bGV0IHJldCA9IG5ldyBBcnJheTtcblxuXHR3aGlsZSAobmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldID09IHR5cGUpIHtcblx0XHRyZXQucHVzaCAocGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdKTtcblx0XHRwaWVjZXNbb3JpZW50YXRpb25dID0gcGFyc2VJbnQocGllY2VzW29yaWVudGF0aW9uXSwgMTApICsgMTtcblx0fVxuXG5cdHJldHVybiAocmV0KTtcbn1cblxubGV0IGdldFdob2xlRmxlZXQgPSBmdW5jdGlvbigpe1xuXHRsZXQgcmV0PXt9O1xuXHRmb3IgKHQgaW4gbmF1dGljYWxNYXApIHtcblx0XHRyZXRbdF0gPSBnZXRGbGVldCh0KTtcblx0fVxuXHRyZXR1cm4gcmV0O1xufVxuXG4vLyBUT0RPIC0gc2V0RmxlZXQ6IFJlbW92ZSBwcmV2aW91cyBzaGlwIGZyb20gY2hhcnQgLS0gbWF5IGJlIGRvbmUuLi5uZWVkcyB0ZXN0XG4vKlxuICogc2V0RmxlZXQgLSBwbGFjZSBzaGlwIG9uIG5hdXRpY2FsIGNoYXJ0XG4gKi9cbmxldCBzZXRGbGVldCA9IGZ1bmN0aW9uIChvcmllbnRhdGlvbiwgdHlwZSwgc2l6ZSwgc3RhcnRfY29vcmQsIG9mZnNldCl7XG4gICAgbGV0IHBpZWNlcyA9IHN0YXJ0X2Nvb3JkLnNwbGl0KCdfJyk7XG4gICAgbGV0IGluZGV4ID0gKG9yaWVudGF0aW9uID09ICd4JykgPyAwIDogMTtcblxuICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuXG4gICAgLy8gQWRqdXN0IGZvciBkcmFnL2Ryb3Agd2hlbiBwbGF5ZXIgcGlja3MgYSBzaGlwIHBpZWNlIG90aGVyIHRoYW4gdGhlIGhlYWQuXG4gICAgcGllY2VzW2luZGV4XSA9IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSAtIG9mZnNldDtcblxuICAgIC8qXG4gICAgICogUmVtb3ZlIG9sZCBzaGlwIGZyb20gbmF1dGljYWxDaGFydC9NYXBcbiAgICAgKi9cbiAgICBfY2xlYXJTaGlwKHR5cGUsIHNpemUpO1xuXG4gICAgLy8gc2V0IHRoZSBuYXV0aWNhbCBtYXAgdmFsdWUgZm9yIHRoaXMgYm9hdFxuICAgIG5hdXRpY2FsTWFwW3R5cGVdPXtcblx0ICAgIG9yaWVudGF0aW9uOiBvcmllbnRhdGlvbixcblx0ICAgIHN0YXJ0X2Nvb3JkOiBwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV1cbiAgICB9O1xuXG4gICAgZm9yICh2YXIgaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XG5cdG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSA9IHR5cGU7XG5cdHBpZWNlc1tpbmRleF09IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSArMTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9jbGVhclNoaXAodHlwZSwgc2l6ZSl7XG4gICAgbGV0IG1hcCA9IG5hdXRpY2FsTWFwW3R5cGVdO1xuICAgIGlmIChtYXAgPT09IHVuZGVmaW5lZCl7cmV0dXJuIGZhbHNlO31cblxuICAgIGxldCBwaWVjZXMgPSBtYXAuc3RhcnRfY29vcmQuc3BsaXQoJ18nKTtcbiAgICBsZXQgaW5kZXggPSAobWFwLm9yaWVudGF0aW9uID09ICd4JykgPyAwIDogMTtcblxuICAgIGZvciAoaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XG5cdCAgICBuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV09dW5kZWZpbmVkO1xuXHQgICAgcGllY2VzW2luZGV4XSsrO1xuICAgIH1cblxuICAgIGRlbGV0ZSBuYXV0aWNhbE1hcFt0eXBlXTtcblxufVxuXG4vKlxuICogZ2hvc3RTaGlwIC0gQmVmb3JlIHB1dHRpbmcgYSBzaGlwIG9uIHRoZSBjaGFydCBpdCdzIHBvdGVudGlhbCBsb2NhdGlvbiBuZWVkcyB0byBiZSBwbG90dGVkIHNvIGl0IGNhbiBiZVxuICogY2hlY2tlZCBmb3IgdmFsaWRpdHkuIEdpdmVuIGEgc2hpcCB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHRoZSBwb3RlbnRpYWwgcGxvdHRlZCBjb29yZGluYXRlcy4gVGhlIGZ1bmN0aW9uXG4gKiBtYXkgYnVpbGQgY29vcmRpbmF0ZXMgZm9yIGEga25vd24gc2hpcCBvciBmb3Igb25lIG1vdmVkIGFyb3VuZCBvbiB0aGUgZ3JpZC5cbiAqL1xubGV0IGdob3N0U2hpcCA9IGZ1bmN0aW9uKHR5cGUsIGNvb3JkaW5hdGUsIG9yaWVudGF0aW9uLCBzaXplLCBvZmZzZXQpe1xuXHRsZXQgc2hpcCA9IHNoaXBzLmdldFNoaXAodHlwZSk7XG5cdGxldCB0aGlzU2hpcCA9IHJlYWRNYXAodHlwZSk7XG5cdGxldCBnaG9zdCA9IFtdO1xuXHRjb29yZGluYXRlID0gY29vcmRpbmF0ZSB8fCB0aGlzU2hpcC5zdGFydF9jb29yZDtcblx0b3JpZW50YXRpb24gPSBvcmllbnRhdGlvbiB8fCB0aGlzU2hpcC5vcmllbnRhdGlvbjtcblx0c2l6ZSA9IHNpemUgfHwgc2hpcC5zaXplO1xuXHRvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuXHRsZXQgcGllY2VzID0gY29vcmRpbmF0ZS5zcGxpdCgnXycpO1xuXHRsZXQgaW5kZXggPSAob3JpZW50YXRpb24gPT0gJ3gnKSA/IDA6IDE7XG5cdHBpZWNlc1tpbmRleF0gPSBwYXJzZUludChwaWVjZXNbaW5kZXhdLCAxMCkgLSBvZmZzZXQ7XG5cdGZvciAobGV0IGk9MDsgaSA8IHNpemU7IGkrKykge1xuXHRcdGdob3N0LnB1c2gocGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdKTtcblx0XHRwaWVjZXNbaW5kZXhdID0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApICsxO1xuXHR9XG5cdHJldHVybiBnaG9zdDtcbn07XG5cbmxldCByZWFkTWFwID0gZnVuY3Rpb24odHlwZSl7XG5cdHJldHVybiBuYXV0aWNhbE1hcFt0eXBlXTtcbn1cblxuLypcbiAqIEdpdmVuIGEgY29vcmRpbmF0ZSBvciBhbiBhcnJheSBvZiBjb29yZGluYXRlcyByZXR1cm4gdGhlIHNhbWUgc3RydWN0dXJlIHJldmVhbGluZyB0aGUgY29udGVudHMgb2YgdGhlIGdyaWQuXG4gKiBXaWxsIHJldHVybiBhIHZhbHVlIG9mIGZhbHNlIGlmIHRoZXJlIGlzIGEgcHJvYmxlbSBjaGVja2luZyB0aGUgZ3JpZCAoZXguIGNvb3JkcyBhcmUgb3V0IG9mIHJhbmdlKS5cbiAqL1xubGV0IGNoZWNrR3JpZCA9IGZ1bmN0aW9uKGNvb3JkaW5hdGVzKXtcblx0aWYgKGNvb3JkaW5hdGVzIGluc3RhbmNlb2YgQXJyYXkpe1xuXHRcdGxldCByZXQgPSBuZXcgQXJyYXk7XG5cdFx0Zm9yKGMgaW4gY29vcmRpbmF0ZXMpe1xuXHRcdFx0bGV0IHMgPSBfc2V0Q2hhcnQoY29vcmRpbmF0ZXNbY10pO1xuXHRcdFx0aWYgKHMgPT09IGZhbHNlKSB7cmV0dXJuIGZhbHNlfTtcblx0XHRcdHJldC5wdXNoIChzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJldDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gX3NldENoYXJ0KGNvb3JkaW5hdGVzKTtcblx0fVxufTtcblxubGV0IF9zZXRDaGFydCA9IGZ1bmN0aW9uKGNvb3JkaW5hdGUpe1xuXHRsZXQgcGllY2VzID0gY29vcmRpbmF0ZS5zcGxpdCgnXycpO1xuXHRpZiAocGFyc2VJbnQocGllY2VzWzBdLCAxMCkgPj0gbmF1dGljYWxDaGFydC5sZW5ndGggfHxcblx0ICAgIHBhcnNlSW50KHBpZWNlc1sxXSwgMTApPj0gbmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV0ubGVuZ3RoKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXTtcbn07XG5cbi8qIFxuICogR2l2ZW4gYSBsaXN0IG9mIGNvb3JkaW5hdGVzIGFuZCBhIHNoaXAgdHlwZSB2YWxpZGF0ZSB0aGF0IHRoZSBjb29yZGluYXRlcyBkbyBub3QgdmlvbGF0ZSB0aGUgcnVsZXMgb2Y6XG4gKiBcdCogc2hpcCBtdXN0IGJlIG9uIHRoZSBncmlkXG4gKiBcdCogc2hpcCBtdXN0IG5vdCBvY2N1cHkgdGhlIHNhbWUgc3F1YXJlIGFzIGFueSBvdGhlciBzaGlwXG4gKi9cbmxldCB2YWxpZGF0ZVNoaXAgPSBmdW5jdGlvbiAoY29vcmRpbmF0ZXMsIHR5cGUpe1xuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gb3RoZXIgYm9hdHMgYWxyZWFkeSBvbiBhbnkgYSBzcGFjZVxuICAgIGZvciAodmFyIHA9MDsgcCA8IGNvb3JkaW5hdGVzLmxlbmd0aDsgcCsrKSB7XG5cblx0Ly8gSXMgdGhlcmUgYSBjb2xsaXNpb24/XG5cdGxldCBncmlkID0gY2hlY2tHcmlkKGNvb3JkaW5hdGVzKTtcblx0XG5cdGlmIChncmlkID09IGZhbHNlKSB7cmV0dXJuIGZhbHNlfTsgLy8gSWYgY2hlY2tHcmlkIHJldHVybnMgZmFsc2UgY29vcmRpbmF0ZXMgYXJlIG91dCBvZiByYW5nZVxuXG5cdGZvciAoYyBpbiBjb29yZGluYXRlcykge1xuXHRcdGxldCBwaWVjZXMgPSBjb29yZGluYXRlc1tjXS5zcGxpdCgnXycpO1xuXHRcdGlmIChuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gIT0gdHlwZSAmJlxuXHRcdCAgICBuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gIT0gdW5kZWZpbmVkKSB7cmV0dXJuIGZhbHNlfTtcblx0fVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGdldEZsZWV0OiBnZXRGbGVldCxcbiAgICBzZXRGbGVldDogc2V0RmxlZXQsXG4gICAgZ2V0V2hvbGVGbGVldDogZ2V0V2hvbGVGbGVldCxcbiAgICB2YWxpZGF0ZVNoaXA6IHZhbGlkYXRlU2hpcCxcbiAgICBjaGVja0dyaWQ6IGNoZWNrR3JpZCxcbiAgICBidWlsZE5hdXRpY2FsQ2hhcnQ6IGJ1aWxkTmF1dGljYWxDaGFydCxcbiAgICBnaG9zdFNoaXA6IGdob3N0U2hpcFxufVxuIiwibGV0IGZsZWV0ID0gcmVxdWlyZSgnLi9mbGVldCcpO1xyXG5sZXQgc2hpcHMgPSByZXF1aXJlKCcuL3NoaXBzJyk7XHJcblxyXG4vKlxyXG4gKiBCdWlsZCB0aGUgZ3JpZCBhbmQgYXR0YWNoIGhhbmRsZXJzIGZvciBkcmFnL2Ryb3AgZXZlbnRzXHJcbiAqL1xyXG5sZXQgY2xpY2thYmxlR3JpZCA9IGZ1bmN0aW9uICggcm93cywgY29scywgc2hpcHMsIGZsZWV0LCBwbGF5ZXIsIHBoYW5kbGUpe1xyXG4gICAgbGV0IGdyaWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xyXG4gICAgZ3JpZC5jbGFzc05hbWU9J2dyaWQnO1xyXG4gICAgZm9yICh2YXIgcj0wO3I8cm93czsrK3Ipe1xyXG4gICAgICAgIHZhciB0ciA9IGdyaWQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKSk7XHJcbiAgICAgICAgZm9yICh2YXIgYz0wO2M8Y29sczsrK2Mpe1xyXG4gICAgICAgICAgICB2YXIgY2VsbCA9IHRyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJykpO1xyXG4gICAgICAgICAgICAvLyBFYWNoIGNlbGwgb24gdGhlIGdyaWQgaXMgb2YgY2xhc3MgJ2NlbGwnXHJcbiAgICAgICAgICAgIGNlbGwuY2xhc3NOYW1lPSdjZWxsJztcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCB0aGUgSUQgdmFsdWUgb2YgZWFjaCBjZWxsIHRvIHRoZSByb3cvY29sdW1uIHZhbHVlIGZvcm1hdHRlZCBhcyByX2NcclxuICAgICAgICAgICAgY2VsbC5pZCA9IHIgKyAnXycgKyBjO1xyXG5cclxuICAgICAgICAgICAgaWYgKHBoYW5kbGUgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIF9zZXRNeUxpc3RlbmVycyhjZWxsLCBzaGlwcywgZmxlZXQpXHJcblx0ICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgIF9zZXRQbGF5ZXJMaXN0ZW5lcnMocGxheWVyLCBjZWxsLCBwaGFuZGxlKTtcclxuXHQgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBncmlkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBfc2V0TXlMaXN0ZW5lcnMoY2VsbCwgc2hpcHMsIGZsZWV0KXtcclxuICAgICAgICAgICAgLy8gU2V0IHVwIGRyYWcgYW5kIGRyb3AgZm9yIGVhY2ggY2VsbC5cclxuICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsJ3RydWUnKTtcclxuXHJcblxyXG4gICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkPSdtb3ZlJztcclxuXHRcdCAgICBsZXQgdHlwZSA9IF9nZXRUeXBlQnlDbGFzcyhzaGlwcywgdGhpcy5jbGFzc05hbWUpO1xyXG5cdFx0ICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHdoaWNoIHNxdWFyZSB3YXMgY2xpY2tlZCB0byBndWlkZSBwbGFjZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3RhcnQgPSBfZmluZF9zdGFydCh0aGlzLmlkLCBzaGlwLm9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dC9wbGFpblwiLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiAgICAgICAgc3RhcnQub2Zmc2V0LFxyXG5cdFx0XHRcdCAgICAgICAgc3RhcnRfY29vcmQ6ICAgc3RhcnQuc3RhcnRfY29vcmQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogICAgICAgICBzaGlwLnNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAgICAgICAgICB0eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb29yZDogZmxlZXQuZ2hvc3RTaGlwKHR5cGUsIHN0YXJ0LnN0YXJ0X2Nvb3JkKSxcclxuXHRcdFx0XHQgICAgICAgIG9yaWVudGF0aW9uOiAgIHNoaXAub3JpZW50YXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBEcmFnL0Ryb3AgY2FwYWJpbGl0aWVzXHJcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkcm9wcGluZycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkcm9wT2JqID0gSlNPTi5wYXJzZShldi5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvcGxhaW5cIikpO1xyXG5cdFx0ICAgIGNvbnNvbGUubG9nKCdjdXJyZW50IGNvb3JkOiAnLCBkcm9wT2JqLmN1cnJlbnRfY29vcmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzaGlwPXNoaXBzLmdldFNoaXAoZHJvcE9iai50eXBlKTtcclxuXHJcblx0XHQgICAgbGV0IGRyb3BTaGlwID0gZmxlZXQuZ2hvc3RTaGlwKGRyb3BPYmoudHlwZSwgZXYudGFyZ2V0LmlkLCBkcm9wT2JqLm9yaWVudGF0aW9uLCBzaGlwLnNpemUsIGRyb3BPYmoub2Zmc2V0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZmxlZXQudmFsaWRhdGVTaGlwKGRyb3BTaGlwLCBkcm9wT2JqLnR5cGUpKSB7XHJcblx0XHRcdCAgICAvLyBSZW1vdmUgaW5pdGlhbCBpbWFnZVxyXG5cdFx0XHQgICAgZGlzcGxheVNoaXAoc2hpcHMsIGRyb3BPYmoudHlwZSk7XHJcblxyXG5cdFx0XHQgICAgZmxlZXQuc2V0RmxlZXQgKGRyb3BPYmoub3JpZW50YXRpb24sIGRyb3BPYmoudHlwZSwgc2hpcC5zaXplLCBldi50YXJnZXQuaWQsIGRyb3BPYmoub2Zmc2V0KTsgXHJcblxyXG5cdFx0XHQgICAgLy8gUmVkcmF3IGltYWdlIGluIG5ldyBsb2NhdGlvblxyXG5cdFx0XHQgICAgZGlzcGxheVNoaXAoc2hpcHMsIGRyb3BPYmoudHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywoXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihldil7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2RyYWdvdmVyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBldi5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdD0nbW92ZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICkpO1xyXG5cclxuICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChcclxuXHRcdGZ1bmN0aW9uKGUpe1xyXG5cdFx0ICAgIGxldCB0eXBlID0gX2dldFR5cGVCeUNsYXNzKHNoaXBzLCB0aGlzLmNsYXNzTmFtZSk7XHJcblx0XHQgICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG5cdFx0ICAgIGxldCBvcmllbnRhdGlvbiA9IChzaGlwLm9yaWVudGF0aW9uID09ICd4JykgPyAneSc6J3gnOyAvLyBmbGlwIHRoZSBvcmllbnRhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdGFydCA9IF9maW5kX3N0YXJ0KGUudGFyZ2V0LmlkLCBvcmllbnRhdGlvbiwgc2hpcC5zaXplLCB0eXBlKTtcclxuXHRcdCAgICBsZXQgZ2hvc3QgPSBmbGVldC5naG9zdFNoaXAodHlwZSwgZS50YXJnZXQuaWQsIG9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHN0YXJ0Lm9mZnNldCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGZsZWV0LnZhbGlkYXRlU2hpcChnaG9zdCwgdHlwZSkpIHtcclxuXHRcdCAgICAgICAgLy8gUmVtb3ZlIGluaXRpYWwgaW1hZ2VcclxuXHRcdCAgICAgICAgZGlzcGxheVNoaXAoc2hpcHMsIHR5cGUpO1xyXG4gICAgXHJcblx0XHQgICAgICAgIGZsZWV0LnNldEZsZWV0IChvcmllbnRhdGlvbiwgdHlwZSwgc2hpcC5zaXplLCBlLnRhcmdldC5pZCk7IFxyXG4gICAgXHJcblx0XHQgICAgICAgIC8vIFJlZHJhdyBpbWFnZSBpbiBuZXcgbG9jYXRpb25cclxuXHRcdCAgICAgICAgZGlzcGxheVNoaXAoc2hpcHMsIHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX3NldFBsYXllckxpc3RlbmVycyhwbGF5ZXIsIGNlbGwsIGhhbmRsZSl7XHJcbiAgICAgICAgICAgIC8vIFNldCB0aGUgSUQgdmFsdWUgb2YgZWFjaCBjZWxsIHRvIHRoZSByb3cvY29sdW1uIHZhbHVlIGZvcm1hdHRlZCBhcyByX2NcclxuICAgICAgICAgICAgY2VsbC5pZCA9IGhhbmRsZSArICdfJyArIGNlbGwuaWQ7XHJcbiAgICAgICAgICAgIC8vIFNldCB1cCBkcmFnIGFuZCBkcm9wIGZvciBlYWNoIGNlbGwuXHJcblxyXG4gICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKFxyXG5cdFx0ZnVuY3Rpb24oZSl7XHJcblx0XHQgICAgaWYocGxheWVyLnBsYXllckNhbk1vdmUoKSkge1xyXG5cdFx0ICAgICAgICBwbGF5ZXIuc2V0UGxheWVyTW92ZSh7dHlwZTogJ2F0dGFjaycsXHJcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlOiBlLnRhcmdldC5pZH0pO1xyXG5cdFx0ICAgICAgICBjb25zb2xlLmxvZyggZS50YXJnZXQuaWQgKyAnIGlzIHVuZGVyIGF0dGFjaycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHRcdH1cclxuICAgICAgICAgICAgKSk7XHJcbn1cclxuXHJcbi8qXHJcbiAqIF9maW5kX3N0YXJ0IC0gRGV0ZXJtaW5lIHRoZSBzdGFydGluZyBjb29yZGluYXRlIG9mIGEgc2hpcCBnaXZlbiB0aGUgc3F1YXJlIHRoYXQgd2FzIGNsaWNrZWQuIEZvciBleGFtcGxlXHJcbiAqIGl0IGlzIHBvc3NpYmxlIHRoYXQgYSBiYXR0bGVzaGlwIGFsb25nIHRoZSB4LWF4aXMgd2FzIGNsaWNrZWQgYXQgbG9jYXRpb24gM18zIGJ1dCB0aGF0IHdhcyB0aGUgc2Vjb25kIHNxdWFyZVxyXG4gKiBvbiB0aGUgc2hpcC4gVGhpcyBmdW5jdGlvbiB3aWxsIGlkZW50aWZ5IHRoYXQgdGhlIGJhdHRsZXNoaXAgc3RhcnRzIGF0IDJfMy5cclxuICovXHJcblxyXG5mdW5jdGlvbiBfZmluZF9zdGFydChzdGFydF9wb3MsIG9yaWVudGF0aW9uLCBzaXplLCB0eXBlKXtcclxuICAgIGxldCBpbmRleCA9IChvcmllbnRhdGlvbiA9PSAneCcpID8gMCA6IDE7XHJcblxyXG4gICAgbGV0IHBpZWNlcz1zdGFydF9wb3Muc3BsaXQoJ18nKTtcclxuICAgIGxldCBvZmZzZXQgPSAwO1xyXG5cclxuICAgIGZvciAoaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XHJcblx0aWYgKHBpZWNlc1tpbmRleF0gPT0gMCkge2JyZWFrO31cclxuICAgICAgICBwaWVjZXNbaW5kZXhdLS07XHJcblx0bGV0IGcgPSBmbGVldC5jaGVja0dyaWQocGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdKTtcclxuICAgICAgICBpZiAoZyAhPSB1bmRlZmluZWQgJiYgZyA9PSB0eXBlICYmIGcgIT0gZmFsc2Upe1xyXG5cdCAgICBvZmZzZXQrKztcclxuICAgICAgICAgICAgc3RhcnRfcG9zID0gcGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge3N0YXJ0X3Bvczogc3RhcnRfcG9zLCBvZmZzZXQ6IG9mZnNldH07XHJcbn1cclxuXHJcbmxldCBkaXNwbGF5U2hpcCA9IGZ1bmN0aW9uIChzaGlwcywgdHlwZSkge1xyXG4gICAgbGV0IGNvb3JkaW5hdGVzID0gZmxlZXQuZ2V0RmxlZXQodHlwZSk7XHJcbiAgICBsZXQgc2hpcCA9IHNoaXBzLmdldFNoaXAodHlwZSk7XHJcblxyXG4gICAgZm9yIChjb29yZCBpbiBjb29yZGluYXRlcykge1xyXG4gICAgICAgIF9zZXRTcGFjZShjb29yZGluYXRlc1tjb29yZF0sIHNoaXAuY2xpY2tDbGFzcyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9zZXRTcGFjZShzcGFjZSwgY2xhc3NOYW1lKSB7XHJcbiAgICB2YXIgYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNwYWNlKTsgXHJcbiAgICBiLmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lKTtcclxufVxyXG5cclxuZnVuY3Rpb24gX2dldFR5cGVCeUNsYXNzKHNoaXBzLCBjbGFzc05hbWUpe1xyXG5cdGxldCBzaGlwTGlzdCA9IHNoaXBzLmdldFNoaXAoKTtcclxuXHRmb3IgKHMgaW4gc2hpcExpc3Qpe1xyXG5cdFx0aWYgKGNsYXNzTmFtZS5tYXRjaChzaGlwTGlzdFtzXS5jbGlja0NsYXNzKSl7XHJcblx0XHRcdHJldHVybiBzaGlwTGlzdFtzXS50eXBlO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgY2xpY2thYmxlR3JpZDogY2xpY2thYmxlR3JpZCxcclxuICAgIGRpc3BsYXlTaGlwOiBkaXNwbGF5U2hpcFxyXG59XHJcblxyXG4iLCIvL2xldCByYWJiaXQgPSByZXF1aXJlKCcuL2JzX1JhYmJpdE1RJyk7XG5sZXQgZmxlZXQgPSByZXF1aXJlKCcuL2ZsZWV0LmpzJyk7XG5cbmxldCBwbGF5ZXJSb3N0ZXIgPSBuZXcgT2JqZWN0OyAvLyBQbGFjZWhvbGRlciBmb3IgYWxsIHBsYXllcnMgaW4gdGhlIGdhbWVcbmxldCBwbGF5ZXJPcmRlciA9IFtdOyAvLyBPcmRlciBvZiBwbGF5ZXIgdHVyblxubGV0IHBsYXllck1vdmUgPSBbXTtcbmxldCBwbGF5ZXJNb3ZlTWFwID0ge307XG5cbmxldCBtZTtcbmxldCBvcmRlckluZGV4PTA7XG5sZXQgZmxvdz1bJ3JlZ2lzdGVyJywnZ2FtZSddO1xubGV0IGN1cnJlbnRGbG93O1xuXG4vLyBSZWdpc3RlciBoYW5kbGVcbmxldCByZWdpc3RlciA9IGZ1bmN0aW9uKGhhbmRsZSl7XG5cdG1lID0gaGFuZGxlOyAvLyBTZWxmIGlkZW50aWZ5IHRoaW5lc2VsZlxuXHQvLyBUT0RPIC0gY2FsbCBvdXQgdG8gdGhlIHJlZ2lzdHJhdGlvbiBzZXJ2aWNlIGFuZCBnZXQgYmFjayBoYW5kbGUgYW5kIHR1cm4gb3JkZXIuIFRoaXNcblx0Ly8gc3RydWN0dXJlIHJlcHJlc2VudHMgdGhlIHJldHVybiBjYWxsIGZyb20gdGhlIHJlZ2lzdHJhdGlvbiBzZXJ2aWNlLlxuXHRjb25zdCByZWcgPSB7XG5cdFx0ICAgICAgaGFuZGxlOiAnZWxzcG9ya28nLFxuXHRcdCAgICAgIG9yZGVyOiAwXG5cdH07XG5cblx0Ly9fcG9wdWxhdGVfcGxheWVyT3JkZXIoJ2Vsc3BvcmtvJywgMCk7XG5cdHBsYXllck9yZGVyW3JlZy5vcmRlcl0gPSByZWcuaGFuZGxlO1xuXHRnYW1lRmxvdygpO1xuXHRyZXR1cm47XG59XG5cbi8vQWNjZXB0IHJlZ2lzdHJhdGlvbiBmcm9tIG90aGVyIHBsYXllcnNcbmxldCBhY2NlcHRSZWcgPSBmdW5jdGlvbihoYW5kbGUsIG9yZGVyLCBncmlkLCBzaGlwcywgZmxlZXQsIHBsYXllcil7XG5cdHBsYXllck9yZGVyW29yZGVyXSA9IGhhbmRsZTtcblx0cGxheWVyUm9zdGVyID0ge1xuXHRcdFtoYW5kbGVdOiB7Z3JpZDogZmxlZXQuYnVpbGROYXV0aWNhbENoYXJ0fVxuXHR9XG5cdGxldCBwZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXJHcmlkJykuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpOztcblx0XG5cdC8vbGV0IHBnZCA9IHBnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcblx0cGcuaWQ9aGFuZGxlO1xuXHRwZy5pbm5lckhUTUw9aGFuZGxlO1xuXG5cdHBnLmFwcGVuZENoaWxkKGdyaWQuY2xpY2thYmxlR3JpZCgxMCwgMTAsIHNoaXBzLCBmbGVldCwgcGxheWVyLCBoYW5kbGUpKTtcbn1cblxubGV0IG15VHVybiA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gKGN1cnJlbnRQbGF5ZXIoKSA9PSBtZSkgPyAxIDogMDtcbn1cblxubGV0IG5leHRQbGF5ZXIgPSBmdW5jdGlvbigpIHtcblx0b3JkZXJJbmRleCA9IChvcmRlckluZGV4ID09IHBsYXllck9yZGVyLmxlbmd0aCAtIDEpID8gIDAgOiBvcmRlckluZGV4KzE7XG5cdHJldHVybjtcbn1cblxubGV0IGN1cnJlbnRQbGF5ZXIgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gcGxheWVyT3JkZXJbb3JkZXJJbmRleF07XG59XG5cbmxldCBnYW1lRmxvdyA9IGZ1bmN0aW9uKCl7XG5cdGlmIChjdXJyZW50RmxvdyAhPSB1bmRlZmluZWQpe1xuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGZsb3dbY3VycmVudEZsb3ddKS5zdHlsZS5kaXNwbGF5PSdub25lJztcblx0XHRjdXJyZW50RmxvdysrO1xuXHR9IGVsc2Uge1xuXHRcdGN1cnJlbnRGbG93ID0gMDtcblx0fVxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmbG93W2N1cnJlbnRGbG93XSkuc3R5bGUuZGlzcGxheT0naW5saW5lJztcbn1cblxubGV0IHNldFBsYXllck1vdmUgPSBmdW5jdGlvbihtb3ZlKXtcblx0bGV0IG1vdmVTdHJpbmc7XG5cdGlmKHBsYXllck1vdmVNYXBbbW92ZS5jb29yZGluYXRlXSA9PSB1bmRlZmluZWQpIHtcblx0XHRwbGF5ZXJNb3ZlTWFwW21vdmUuY29vcmRpbmF0ZV0gPSBwbGF5ZXJNb3ZlLmxlbmd0aDtcblxuXHRcdGlmIChtb3ZlLnR5cGUgPT0gJ2F0dGFjaycpIHtcblx0XHRcdG1vdmVTdHJpbmcgPSBtb3ZlLnR5cGUgKyAnOiAnICsgbW92ZS5jb29yZGluYXRlO1xuXHRcdH1cblxuXHRcdGxldCBiID0gcGxheWVyTW92ZUJsb2NrKG1vdmUuY29vcmRpbmF0ZSwgbW92ZVN0cmluZyk7XG5cdFx0cGxheWVyTW92ZS5wdXNoKGIpO1xuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKS5hcHBlbmRDaGlsZChiKTtcblx0fVxufVxuXG5sZXQgZGVsZXRlUGxheWVyTW92ZSA9IGZ1bmN0aW9uKCl7XG59XG5cbmxldCBwbGF5ZXJDYW5Nb3ZlID0gZnVuY3Rpb24oKSB7XG5cdGlmIChwbGF5ZXJPcmRlci5sZW5ndGggPiBwbGF5ZXJNb3ZlLmxlbmd0aCkgcmV0dXJuIHRydWU7XG5cblx0cmV0dXJuIGZhbHNlO1xufVxuXG5sZXQgcGxheWVyQ2xlYXJNb3ZlID0gZnVuY3Rpb24oKSB7XG5cdHBsYXllciA9IFtdO1xufVxuXG4vLyBDcmVhdGUgYSBibG9jayB0byB2aXN1YWxseSByZXByZXNlbnQgYSBtb3ZlIHNvIGl0IGNhbiBiZSByZW9yZGVyZWQgaWYgd2FudGVkXG5sZXQgcGxheWVyTW92ZUJsb2NrID0gZnVuY3Rpb24oaGFuZGxlLCBtb3ZlVGV4dCkge1xuXHRsZXQgYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRiLmlkID0gaGFuZGxlO1xuXHRiLndpZHRoID0gMTAwO1xuXHRiLmhlaWdodCA9IDIxO1xuXG5cdGIuaW5uZXJIVE1MPW1vdmVUZXh0O1xuXG4gICAgICAgIGIuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCd0cnVlJyk7XG5cdHBsYXllck9yZGVySGFuZGxlcihiKTtcblx0cmV0dXJuIGI7XG59XG5cbi8vIFNldCB1cCBkcmFnIGRyb3AgZnVuY3Rpb25hbGl0eSBmb3Igc2V0dGluZyBtb3ZlIG9yZGVyXG5sZXQgcGxheWVyT3JkZXJIYW5kbGVyID0gZnVuY3Rpb24ocG8pIHtcbiAgICAvL2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKS5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsJ3RydWUnKTtcbiAgICAvL3BsYXllci5wbGF5ZXJPcmRlckhhbmRsZXJzKCk7XG4gICAgLy9sZXQgcG8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheU9yZGVyJyk7XG4gICAgcG8uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywoZnVuY3Rpb24oZSl7XG5cdCAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkPSdtb3ZlJztcblx0ICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsXG5cdFx0SlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0Y2hhbmdlTW92ZTogZS50YXJnZXQuaWRcblx0XHR9KVxuXHQgICAgKTtcbiAgICB9KSk7XG4gICAgcG8uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0PSdtb3ZlJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pKTtcbiAgICBwby5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywoZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRyb3BPYmogPSBKU09OLnBhcnNlKGUuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJ0ZXh0L3BsYWluXCIpKTtcblx0ICAgIFx0ICAgIGFsdGVyTW92ZUluZGV4KGRyb3BPYmouY2hhbmdlTW92ZSwgZS50YXJnZXQuaWQpO1xuXHQgICAgXHQgICAgZGlzcGxheU1vdmVPcmRlcigpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSkpO1xufVxuXG5mdW5jdGlvbiBhbHRlck1vdmVJbmRleChzdGFydEluZGV4LCBlbmRJbmRleCl7XG5cdHN0YXJ0SWQgPSBzdGFydEluZGV4O1xuXHRzdGFydEluZGV4ID0gcGFyc2VJbnQocGxheWVyTW92ZU1hcFtzdGFydEluZGV4XSk7XG5cdGVuZEluZGV4ICAgPSBwYXJzZUludChwbGF5ZXJNb3ZlTWFwW2VuZEluZGV4XSk7XG5cblx0bGV0IGJlZ2luID0gc3RhcnRJbmRleCA8IGVuZEluZGV4ID8gcGFyc2VJbnQoc3RhcnRJbmRleCwgMTApIDogcGFyc2VJbnQoZW5kSW5kZXgsIDEwKTtcblx0bGV0IGVuZCA9ICAgc3RhcnRJbmRleCA8IGVuZEluZGV4ID8gcGFyc2VJbnQoZW5kSW5kZXgsIDEwKSA6IHBhcnNlSW50KHN0YXJ0SW5kZXgsIDEwKTtcblx0bGV0IGhvbGQgPSBwbGF5ZXJNb3ZlW3N0YXJ0SW5kZXhdO1xuXG5cdHdoaWxlKGJlZ2luIDwgZW5kKXtcblx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwbGF5ZXJNb3ZlW2JlZ2luXS5pZCkuYXBwZW5kQ2hpbGQoKHBsYXllck1vdmVbYmVnaW4rMV0pKTtcblx0XHRwbGF5ZXJNb3ZlW2JlZ2luXSA9IHBsYXllck1vdmVbYmVnaW4rMV07XG5cdFx0cGxheWVyTW92ZU1hcFtzdGFydElkXSA9IGJlZ2luKzE7XG5cdFx0YmVnaW4rKztcblx0fVxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwbGF5ZXJNb3ZlW2VuZF0uaWQpLmFwcGVuZENoaWxkKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkW2hvbGRdLmlkKTtcblx0cGxheWVyTW92ZVtlbmRdID0gaG9sZDtcblx0cGxheWVyTW92ZU1hcFtzdGFydElkXSA9IGVuZDtcbn1cblxuZnVuY3Rpb24gZGlzcGxheU1vdmVPcmRlcigpe1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZWdpc3RlcjogcmVnaXN0ZXIsXG4gICAgYWNjZXB0UmVnOiBhY2NlcHRSZWcsXG4gICAgbXlUdXJuOiBteVR1cm4sXG4gICAgY3VycmVudFBsYXllcjogY3VycmVudFBsYXllcixcbiAgICBuZXh0UGxheWVyOiBuZXh0UGxheWVyLFxuICAgIGdhbWVGbG93OiBnYW1lRmxvdyxcbiAgICBwbGF5ZXJDYW5Nb3ZlOiBwbGF5ZXJDYW5Nb3ZlLFxuICAgIHBsYXllckNsZWFyTW92ZTogcGxheWVyQ2xlYXJNb3ZlLFxuICAgIHNldFBsYXllck1vdmU6IHNldFBsYXllck1vdmUsXG4gICAgZGVsZXRlUGxheWVyTW92ZTogZGVsZXRlUGxheWVyTW92ZSxcbiAgICBwbGF5ZXJPcmRlckhhbmRsZXI6IHBsYXllck9yZGVySGFuZGxlclxuICAgIC8vZGlzcGxheU1vdmVPcmRlcjogZGlzcGxheU1vdmVPcmRlcjtcbn1cbiIsInZhciBmbGVldD1yZXF1aXJlKCcuL2ZsZWV0LmpzJyk7XHJcblxyXG4vLyBDb25maWcgc2V0dGluZ3MgXHJcbmxldCBzaGlwX2NvbmZpZyA9IHtcclxuICAgIGFpcmNyYWZ0Q2FycmllciA6IHtcclxuICAgICAgICBzaXplIDogNSxcclxuICAgICAgICBpZCA6ICdhaXJjcmFmdENhcnJpZXInLFxyXG4gICAgICAgIGNvbG9yIDogJ0NyaW1zb24nLFxyXG4gICAgICAgIGNsaWNrQ2xhc3MgOiAnYWNjbGlja2VkJyxcclxuICAgICAgICBsYWJlbCA6ICdBaXJjcmFmdCBDYXJyaWVyJyxcclxuICAgIH0sXHJcbiAgICBiYXR0bGVzaGlwIDoge1xyXG4gICAgICAgIHNpemUgOiA0LFxyXG4gICAgICAgIGlkIDogJ2JhdHRsZXNoaXAnLFxyXG4gICAgICAgIGNvbG9yOidEYXJrR3JlZW4nLFxyXG4gICAgICAgIGNsaWNrQ2xhc3MgOiAnYnNjbGlja2VkJyxcclxuICAgICAgICBsYWJlbCA6ICdCYXR0bGVzaGlwJyxcclxuICAgIH0sXHJcbiAgICBkZXN0cm95ZXIgOiB7XHJcbiAgICAgICAgc2l6ZSA6IDMsXHJcbiAgICAgICAgaWQgOiAnZGVzdHJveWVyJyxcclxuICAgICAgICBjb2xvcjonQ2FkZXRCbHVlJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ2RlY2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnRGVzdHJveWVyJyxcclxuICAgIH0sXHJcbiAgICBzdWJtYXJpbmUgIDoge1xyXG4gICAgICAgIHNpemUgOiAzLFxyXG4gICAgICAgIGlkIDogJ3N1Ym1hcmluZScsXHJcbiAgICAgICAgY29sb3I6J0RhcmtSZWQnLFxyXG4gICAgICAgIGNsaWNrQ2xhc3MgOiAnc3VjbGlja2VkJyxcclxuICAgICAgICBsYWJlbCA6ICdTdWJtYXJpbmUnLFxyXG4gICAgfSxcclxuICAgIHBhdHJvbEJvYXQgOiB7XHJcbiAgICAgICAgc2l6ZSA6IDIsXHJcbiAgICAgICAgaWQgOiAncGF0cm9sQm9hdCcsXHJcbiAgICAgICAgY29sb3I6J0dvbGQnLFxyXG4gICAgICAgIGNsaWNrQ2xhc3MgOiAncGJjbGlja2VkJyxcclxuICAgICAgICBsYWJlbCA6ICdQYXRyb2wgQm9hdCcsXHJcbiAgICB9LFxyXG59O1xyXG5cclxuLy8gU2hpcCBjb25zdHJ1Y3RvciAtIHNoaXB5YXJkPz8/XHJcbmZ1bmN0aW9uIF9zaGlwKHNpemUsIGlkLCBjb2xvciwgY2xpY2tDbGFzcywgbGFiZWwpIHtcclxuICAgICAgICB0aGlzLnNpemUgICAgICAgID0gc2l6ZTtcclxuICAgICAgICB0aGlzLmlkICAgICAgICAgID0gaWQ7XHJcbiAgICAgICAgdGhpcy5jb2xvciAgICAgICA9IGNvbG9yO1xyXG4gICAgICAgIHRoaXMuY2xpY2tDbGFzcyAgPSBjbGlja0NsYXNzO1xyXG4gICAgICAgIHRoaXMubGFiZWwgICAgICAgPSBsYWJlbDtcclxuXHJcbiAgICAgICAgcmV0dXJuICh0aGlzKTtcclxufVxyXG5cclxubGV0IHNoaXBzPXt9O1xyXG5cclxuLypcclxuICogVGhlIHNoaXAgb2JqZWN0IGhvbGRzIHRoZSBjdXJyZW50IG9yaWVudGF0aW9uIG9mIHRoZSBzaGlwIGFuZCB0aGUgc3RhcnQgY29vcmRpbmF0ZSAodG9wbW9zdC9sZWZ0bW9zdCkuIFdoZW5cclxuICogdGhlcmUgaXMgYSBjaGFuZ2UgdG8gdGhlIHNoaXAgdGhlIG1hc3RlciBtYXRyaXggbmVlZHMgdG8gYmUgdXBkYXRlZC4gQW4gZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB0aGVyZSBpc1xyXG4gKiBhIGNvb3JkaW5hdGUgY2hhbmdlLiBUaGlzIGxpc3RlbmVyIHdpbGwgdXBkYXRlIHRoZSBtYXN0ZXIgbWF0cml4LiBDYWxscyB0byBjaGVjayBsb2NhdGlvbiAobW92ZSB2YWxpZHRpb24sIFxyXG4gKiBjaGVjayBpZiBoaXQsIGV0Yy4pIHdpbGwgYmUgbWFkZSBhZ2FpbnN0IHRoZSBtYXN0ZXIgbWF0cml4LlxyXG4gKi9cclxuLypcclxubGV0IHNoaXBJaW50ID0gZnVuY3Rpb24oKXtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoJ3NoaXBNb3ZlJywoKSkgfVxyXG5cclxufVxyXG4qL1xyXG4vLyBQdWJsaWMgZnVuY3Rpb24gdG8gaW5pdGlhbGx5IGNyZWF0ZSBzaGlwcyBvYmplY3RcclxubGV0IGJ1aWxkU2hpcHMgPSBmdW5jdGlvbiAoKXtcclxuICAgIGZvciAobGV0IHMgaW4gc2hpcF9jb25maWcpe1xyXG4gICAgICAgIHNoaXBzW3NdID0ge3NpemU6IHNoaXBfY29uZmlnW3NdLnNpemUsIFxyXG5cdFx0ICAgIHR5cGU6IHNoaXBfY29uZmlnW3NdLmlkLFxyXG5cdCAgICAgICAgICAgIGNvbG9yOiBzaGlwX2NvbmZpZ1tzXS5jb2xvcixcclxuXHRcdCAgICBjbGlja0NsYXNzOiBzaGlwX2NvbmZpZ1tzXS5jbGlja0NsYXNzLFxyXG5cdFx0ICAgIGxhYmVsOiBzaGlwX2NvbmZpZ1tzXS5sYWJlbFxyXG5cdCAgICAgICAgICAgfTtcclxuICAgIH1cclxucmV0dXJuIHNoaXBzO1xyXG59XHJcblxyXG5sZXQgYnVpbGRTaGlwID0gZnVuY3Rpb24odHlwZSl7XHJcbiAgICAgICAgc2hpcHNbdHlwZV0gPSBfc2hpcChzaGlwX2NvbmZpZ1t0eXBlXS5zaXplLCBzaGlwX2NvbmZpZ1t0eXBlXS5pZCwgc2hpcF9jb25maWdbdHlwZV0uY29sb3IsIHNoaXBfY29uZmlnW3R5cGVdLmNsaWNrQ2xhc3MsIHNoaXBfY29uZmlnW3R5cGVdLmxhYmVsKTtcclxuXHRyZXR1cm4gc2hpcHM7XHJcbn1cclxuXHJcbi8vIFNldCB2YWx1ZSBpbiBzaGlwIG9iamVjdC4gXHJcbmxldCBzZXRTaGlwID0gZnVuY3Rpb24odHlwZSwga2V5LCB2YWx1ZSl7XHJcbiAgICAgICAgaWYgKHR5cGUgJiYgc2hpcHNbdHlwZV0gJiYga2V5KSB7IC8vIG9ubHkgYXR0ZW1wdCBhbiB1cGRhdGUgaWYgdGhlcmUgaXMgYSBsZWdpdCBzaGlwIHR5cGUgYW5kIGEga2V5XHJcbiAgICAgICAgICAgIHNoaXBzW3R5cGVdLmtleSA9IHZhbHVlO1xyXG4gICB9XHJcbn1cclxuXHJcbi8vIFJldHVybiBzaGlwIG9iamVjdCBpZiBubyB0eXBlIGdpdmVuIG90aGVyd2lzZSByZXR1cm4gb2JqZWN0IGNvbnRhaW5pbmcganVzdCByZXF1ZXN0ZWQgc2hpcFxyXG5sZXQgZ2V0U2hpcCA9IGZ1bmN0aW9uICh0eXBlKXtcclxuICAgIGlmKHR5cGUpe1xyXG4gICAgICAgIHJldHVybiBzaGlwc1t0eXBlXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHNoaXBzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyBQcml2YXRlIGZ1bmN0aW9uIHRvIHJhbmRvbWx5IGRldGVybWluZSBzaGlwJ3Mgb3JpZW50YXRpb24gYWxvbmcgdGhlIFgtYXhpcyBvciBZLWF4aXMuIE9ubHkgdXNlZCB3aGVuIHBsb3R0aW5nIHNoaXBzIGZvciB0aGUgZmlyc3QgdGltZS5cclxuZnVuY3Rpb24gX2dldFN0YXJ0Q29vcmRpbmF0ZShzaXplKXtcclxuICAgIGNvbnN0IHN0YXJ0X29yaWVudGF0aW9uPU1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxMCkgPiA1ID8gJ3gnIDogJ3knO1xyXG4gICAgY29uc3Qgc3RhcnRfeCA9IHN0YXJ0X29yaWVudGF0aW9uID09ICd4JyA/IF9nZXRSYW5kb21Db29yZGluYXRlKHNpemUpIDogX2dldFJhbmRvbUNvb3JkaW5hdGUoMCk7XHJcbiAgICBjb25zdCBzdGFydF95ID0gc3RhcnRfb3JpZW50YXRpb24gPT0gJ3knID8gX2dldFJhbmRvbUNvb3JkaW5hdGUoc2l6ZSkgOiBfZ2V0UmFuZG9tQ29vcmRpbmF0ZSgwKTtcclxuXHJcbiAgICByZXR1cm4ge2Nvb3JkaW5hdGU6IHN0YXJ0X3ggKyAnXycgKyBzdGFydF95LCBvcmllbnRhdGlvbjogc3RhcnRfb3JpZW50YXRpb259O1xyXG59XHJcblxyXG4vLyBUYWtlIHNoaXAgc2l6ZSBhbmQgb3JpZW50YXRpb24gaW50byBhY2NvdW50IHdoZW4gZGV0ZXJtaW5pbmcgdGhlIHN0YXJ0IHJhbmdlIHZhbHVlLiBleC4gZG9uJ3RcclxuLy8gbGV0IGFuIGFpcmNyYWZ0IGNhcnJpZXIgd2l0aCBhbiBvcmllbnRhdGlvbiBvZiAnWCcgc3RhcnQgYXQgcm93IDcgYmVjYXVzZSBpdCB3aWxsIG1heCBvdXQgb3ZlciB0aGVcclxuLy8gZ3JpZCBzaXplLlxyXG5mdW5jdGlvbiBfZ2V0UmFuZG9tQ29vcmRpbmF0ZShvZmZzZXQpe1xyXG4gICAgY29uc3QgTUFYX0NPT1JEID0gMTA7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKihNQVhfQ09PUkQgLSBvZmZzZXQpKTtcclxuXHJcbn1cclxuXHJcbi8vIEZJWE1FIERvZXMgZmxlZXQuZ2hvc3RTaGlwIGRvIHRoaXMgbm93P1xyXG4vLyBCdWlsZCBhbiBhcnJheSBvZiBjb29yZGluYXRlcyBmb3IgYSBzaGlwIGJhc2VkIG9uIGl0J3Mgb3JpZW50YXRpb24sIGludGVuZGVkIHN0YXJ0IHBvaW50IGFuZCBzaXplXHJcbmxldCBfc2hpcFN0cmluZyA9IGZ1bmN0aW9uKHMpIHtcclxuXHRjb25zdCBvID0gcy5vcmllbnRhdGlvbjtcclxuXHRjb25zdCBzdCA9IHMuc3RhcnRfY29vcmRpbmF0ZTtcclxuXHRsZXQgciA9IG5ldyBBcnJheTtcclxuICAgICAgICBsZXQgdF9waWVjZXMgPSBzdC5zcGxpdCgnXycpO1xyXG5cdGNvbnN0IGkgPSBvID09ICd4JyA/IDAgOiAxO1xyXG5cclxuXHRmb3IgKGxldCBqPTA7IGogPCBzLnNpemU7aisrKSB7XHJcblx0XHR0X3BpZWNlc1tpXSA9IHRfcGllY2VzW2ldKzE7XHJcblx0XHRyLnB1c2ggKHRfcGllY2VzWzBdICsgJ18nICsgdF9waWVjZXNbMV0pO1xyXG5cdH1cclxuXHRyZXR1cm4gcjtcclxufVxyXG5cclxuXHJcbi8qXHJcbiAqIHBsYWNlU2hpcHMgLSBJbml0aWFsIHBsYWNlbWVudCBvZiBzaGlwcyBvbiB0aGUgYm9hcmRcclxuICovXHJcbmxldCBwbGFjZVNoaXBzID0gZnVuY3Rpb24gcGxhY2VTaGlwcyhmbGVldCl7XHJcbiAgICAgICAgLyogUmFuZG9tbHkgcGxhY2Ugc2hpcHMgb24gdGhlIGdyaWQuIEluIG9yZGVyIGRvIHRoaXMgZWFjaCBzaGlwIG11c3Q6XHJcblx0ICogICAqIFBpY2sgYW4gb3JpZW50YXRpb25cclxuXHQgKiAgICogUGljayBhIHN0YXJ0aW5nIGNvb3JkaW5hdGVcclxuXHQgKiAgICogVmFsaWRhdGUgdGhhdCB0aGUgY29vcmRpbmF0ZSBpcyB2YWxpZCAoZG9lcyBub3QgcnVuIE9PQiwgZG9lcyBub3QgY3Jvc3MgYW55IG90aGVyIHNoaXAsIGV0Yy4pXHJcblx0ICogICAqIElmIHZhbGlkOlxyXG5cdCAqICAgXHQqIFNhdmUgc3RhcnQgY29vcmQgYW5kIG9yaWVudGF0aW9uIGFzIHBhcnQgb2Ygc2hpcCBvYmplY3RcclxuXHQgKiAgIFx0KiBQbG90IHNoaXAgb24gbWFzdGVyIG1hdHJpeFxyXG5cdCAqL1xyXG5cdGxldCBzaGlwTGlzdCA9IGdldFNoaXAoKTtcclxuICAgICAgICBmb3IgKHZhciBzaGlwIGluIHNoaXBMaXN0KSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgc3RhcnQgPSBfZ2V0U3RhcnRDb29yZGluYXRlKHNoaXBMaXN0W3NoaXBdLnNpemUpOyBcclxuXHQgICAgbGV0IHNoaXBfc3RyaW5nID0gZmxlZXQuZ2hvc3RTaGlwKHNoaXBMaXN0W3NoaXBdLnR5cGUsIHN0YXJ0LmNvb3JkaW5hdGUsIHN0YXJ0Lm9yaWVudGF0aW9uKTtcclxuXHQgICAgc2hpcExpc3Rbc2hpcF0ub3JpZW50YXRpb24gPSBzdGFydC5vcmllbnRhdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlICghZmxlZXQudmFsaWRhdGVTaGlwKHNoaXBfc3RyaW5nKSkge1xyXG4gICAgICAgICAgICAgICAgc3RhcnQgPSBfZ2V0U3RhcnRDb29yZGluYXRlKHNoaXBMaXN0W3NoaXBdLnNpemUpOyBcclxuXHRcdHNoaXBMaXN0W3NoaXBdLm9yaWVudGF0aW9uID0gc3RhcnQub3JpZW50YXRpb247XHJcblx0XHRzaGlwX3N0cmluZyA9IGZsZWV0Lmdob3N0U2hpcChzaGlwTGlzdFtzaGlwXS50eXBlLCBzdGFydC5jb29yZGluYXRlLCBzdGFydC5vcmllbnRhdGlvbik7XHJcblx0XHR9XHJcblxyXG4gICAgICAgICAgICBmbGVldC5zZXRGbGVldChzdGFydC5vcmllbnRhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICBzaGlwTGlzdFtzaGlwXS50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHNoaXBMaXN0W3NoaXBdLnNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQuY29vcmRpbmF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGJ1aWxkU2hpcHM6IGJ1aWxkU2hpcHMsXHJcbiAgICBidWlsZFNoaXA6IGJ1aWxkU2hpcCxcclxuICAgIGdldFNoaXA6IGdldFNoaXAsXHJcbiAgICBzZXRTaGlwOiBzZXRTaGlwLFxyXG4gICAgcGxhY2VTaGlwczogcGxhY2VTaGlwc1xyXG59XHJcbiJdfQ==
