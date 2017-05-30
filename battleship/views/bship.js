(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
let grid = require('./grid.js');
let player = require('./player.js');
let ship = require('./ships.js');
let config = require('./config.js');
let fleet = require('./fleet.js');

/* Register */
player.register('elsporko');

// Set up grid
//grid.clickableGrid();
document.body.appendChild(grid.clickableGrid);

/* Set random fleet */
ships.buildShips();
ships.placeShips();

let wholeFleet = fleet.getWholeFleet();
for (t in wholeFleet) {
	grid.displayShip(t);
}

/* Set confirm fleet */

/* Play game */
/*
while (1) {
	player.getTurn();
}
*/

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
let ships=require('./ships.js');

let nauticalMap = {}; // Hash lookup that tracks each ship's starting point and current orientation

let buildNauticalChart = function(){
	let chart = new Array;
	for(let i=0; i < 10; i++) {
		chart[i] = new Array;
		for (let j=0; j < 10; j++){
			chart[i][j] = new Array;
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
	let ret;
	for (t in nauticalChart) {
		ret[t] = getFleet(t);
	}
	return ret;
}

// TODO - setFleet: Remove previous ship from chart -- may be done...needs test
/*
 * setFleet - place ship on nautical chart
 */
let setFleet = function (orientation, type, size, start_coord){
    let pieces = start_coord.split('_');
    let index = (orientation == 'x') ? 0 : 1;

    delete nauticalMap[type];
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

/*
 * ghostShip - Before putting a ship on the chart it's potential location needs to be plotted so it can be
 * checked for validity. Given a ship this function will return the potential plotted coordinates. The function
 * may build coordinates for a known ship or for one moved around on the grid.
 */
let ghostShip = function(type, coordinate, orientation, size){
	let ship = ships.getShip(type);
	let thisShip = readMap(type);
	let ghostShip = [];
	coordinate = coordinate || thisShip.start_coord;
	orientation = orientation || thisShip.orientation;
	size = size || ship.size;

	let pieces = coordinate.split('_');
	let index = (orientation == 'x') ? 0: 1;
	for (let i=0; i < size; i++) {
		ghostShip.push(pieces[0] + '_' + pieces[1]);
		pieces[index] = parseInt(pieces[index], 10) +1;
	}
	return ghostShip;
}

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
			if (s == false) {return false};
			ret.push (s);
		}
		return ret;
	} else {
		return _setChart(coordinates);
	}
}

let _setChart = function(coordinate){
	let pieces = coordinate.split('_');
	if (nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] == undefined) {return false}

	return nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)];
}

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

	for (g in grid) {
		// Fail if the grid space contains neither the current ship value or NULL
		if (grid[g] != type && !grid[g]) {
			return false
		}
	}
    }
    return true;
}

module.exports = {
    getFleet: getFleet,
    setFleet: setFleet,
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
let clickableGrid = function ( rows, cols, isMyGrid){
    let grid = document.createElement('table');
    for (var r=0;r<rows;++r){
        var tr = grid.appendChild(document.createElement('tr'));
        for (var c=0;c<cols;++c){
            var cell = tr.appendChild(document.createElement('td'));
            // Each cell on the grid is of class 'cell'
            cell.className='cell';

            // Set the ID value of each cell to the row/column value formatted as r_c
            cell.id = r + '_' + c;
            // Set up drag and drop for each cell.
            cell.setAttribute('draggable','true');


            cell.addEventListener('dragstart',(
                function(ev){
                    ev.dataTransfer.effectAllowed='move';
		    let type = fleet.checkGrid(this.id);
		    let ship = ships.getShip(type);

                    // Calculate which square was clicked to guide placement
                    var start_coord = _find_start(this.id, ship.orientation, ship.size);
                    ev.dataTransfer.setData("text/plain", 
                        JSON.stringify({
                                        square :start_coord,
                                        index  :ship.size,
                                        type   :type,
                                        current_coord: fleet.ghostShip(type, start_coord)
                                       })
                        );
                })
            );

            // Add Drag/Drop capabilities
            cell.addEventListener('drop',(
                function(ev){
                    console.log('dropping');
                    var dropObj = JSON.parse(ev.dataTransfer.getData("text/plain"));
                    let ship=ships.getShip(dropObj.type);

                    if(ships.validateShip(dropObj.type, dropObj.current_coord)) {
			    // Remove initial image
			    _displayShip(type, current_coord, skip);

			    fleet.setFleet (fleet.readMap(DropObj.type), DropObj.type, ship.size, dropObj.current_coord); // (orientation, type, size, start_coord)

			    // Redraw image in new location
			    _displayShip(type, current_coord, skip);
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

            cell.addEventListener('click', (function(e){
		let type = fleet.checkGrid(this.id);
		let thisShip = fleet.checkGrid(type);
		let ship = ship.getShip(type);
		let orientation = (thisShip.orientation == 'x') ? 'y':'x';
		let ghost = fleet.ghostShip('type', _find_start(this.id, orientation, ship.size ));

                if (ships.validateShip(type, ghost)) {
		    // Remove initial image
		    _displayShip(type, current_coord, skip);

		    fleet.setFleet (fleet.readMap(DropObj.type), DropObj.type, ship.size, dropObj.current_coord);

		    // Redraw image in new location
		    _displayShip(type, current_coord, skip);
                }

                }));
        }
    }
    return grid;
}

/*
 * _find_start - Determine the starting coordinate of a ship given the square that was clicked. For example
 * it is possible that a battleship along the x-axis was clicked at location 3_3 but that was the second square
 * on the ship. This function will identify that the battleship starts at 2_3.
 */

function _find_start(start_pos, orientation, size){
    let type = fleet.checkGrid(this.id);
    let ship = ships.getShip(type);
    let index = (orientation == 'x') ? 0 : 1;

    let pieces=start_pos.split('_');

    for (let i=0; i < size; i++) {
	let g = fleet.checkGrid(pieces[0] + '_' + pieces[1]);
        if (g != undefined && g == type){
            pieces[index]++;
        } else {
            break;
        }
    }

    start = start_pos.split('_');
    start[index] = start[index] - (size - i);
    return start[0] + '_' + start[1];
}

function displayShip(type) {
    let coordinates = fleet.getFleet(type);

    for (coord in coordinates) {
        setSpace(coordinates[coord], shipsCfg[type].clickClass);
    }
}

function _setSpace(space, className) {
    var b = document.getElementById(space); 
    b.classList.toggle(className);
}

module.s=exports={
    clickableGrid: clickableGrid,
    displayShip: displayShip
}


},{"./fleet":3,"./ships":6}],5:[function(require,module,exports){
//let rabbit = require('./bs_RabbitMQ');
let fleet = require('./fleet.js');

let playerRoster = new Object; // Placeholder for all players in the game
let playerOrder = []; // Order of player turn

let me;
let orderIndex=0;

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
}

/*
 *  One consideration is for the registration service to provide a random number for order value so that player order is not
 *  necessarily FIFO. Also there is no guarantee that player order values will arrive in consecutive order so there needs to
 *  be a sort mechanism.
 */
let _populate_playerOrder = function(handle, order){
}

//Accept registration from other players
let acceptReg = function(handle, order){
	playerOrder[order] = handle;
	playerRoster = {
		[handle]: {grid: fleet.buildNauticalChart}
	}
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

let playerMove = function(){
}

module.exports = {
    register: register,
    acceptReg: acceptReg,
    myTurn: myTurn,
    currentPlayer: currentPlayer,
    nextPlayer: nextPlayer
}

},{"./fleet.js":3}],6:[function(require,module,exports){
let fleet = require ('./fleet.js');
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
        ships.s = _ship(ship_config[s].size, ship_config[s].id, ship_config[s].color, ship_config[s].clickClass, ship_config[s].label);
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
function _getStartCoordinate(){
    var start_x=Math.floor(Math.random()*11);
    var start_y=Math.floor(Math.random()*11);
    var start_orientation=Math.floor(Math.random()*10);
    return {coordinate: start_x + '_' + start_y, orientation: start_orienation > 5 ? 'x' : 'y'};
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
let placeShips = function placeShips(){
        /* Randomly place ships on the grid. In order do this each ship must:
	 *   * Pick an orientation
	 *   * Pick a starting coordinate
	 *   * Validate that the coordinate is valid (does not run OOB, does not cross any other ship, etc.)
	 *   * If valid:
	 *   	* Save start coord and orientation as part of ship object
	 *   	* Plot ship on master matrix
	 */
        for (var ship in getShip()) {
            
            while (true) {
                const start = _getStartCoordinate(); 
		ship.orientation = start.orientation;
		ship.start_coordinate = start.coordinate;
		//const ship_string = _shipString(ship);
		const ship_string = fleet.ghostShip(ship.type, undefined, start.orientation);
                
                if (fleet.validateShip(ship_string)){
                    fleet.setFleet(start.orientation,
                               ship.type,
                               ship.size,
                             ship.start_coordinate);
		       	break;
		}
            }
        }
};


module.exports = {
    buildShips: buildShips,
    buildShip: buildShip,
    getShip: getShip,
    setShip: setShip,
    placeShips: placeShips,
}

},{"./fleet.js":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJhdHRsZXNoaXAuanMiLCJjb25maWcuanMiLCJmbGVldC5qcyIsImdyaWQuanMiLCJwbGF5ZXIuanMiLCJzaGlwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IGdyaWQgPSByZXF1aXJlKCcuL2dyaWQuanMnKTtcclxubGV0IHBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyLmpzJyk7XHJcbmxldCBzaGlwID0gcmVxdWlyZSgnLi9zaGlwcy5qcycpO1xyXG5sZXQgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcuanMnKTtcclxubGV0IGZsZWV0ID0gcmVxdWlyZSgnLi9mbGVldC5qcycpO1xyXG5cclxuLyogUmVnaXN0ZXIgKi9cclxucGxheWVyLnJlZ2lzdGVyKCdlbHNwb3JrbycpO1xyXG5cclxuLy8gU2V0IHVwIGdyaWRcclxuLy9ncmlkLmNsaWNrYWJsZUdyaWQoKTtcclxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChncmlkLmNsaWNrYWJsZUdyaWQpO1xyXG5cclxuLyogU2V0IHJhbmRvbSBmbGVldCAqL1xyXG5zaGlwcy5idWlsZFNoaXBzKCk7XHJcbnNoaXBzLnBsYWNlU2hpcHMoKTtcclxuXHJcbmxldCB3aG9sZUZsZWV0ID0gZmxlZXQuZ2V0V2hvbGVGbGVldCgpO1xyXG5mb3IgKHQgaW4gd2hvbGVGbGVldCkge1xyXG5cdGdyaWQuZGlzcGxheVNoaXAodCk7XHJcbn1cclxuXHJcbi8qIFNldCBjb25maXJtIGZsZWV0ICovXHJcblxyXG4vKiBQbGF5IGdhbWUgKi9cclxuLypcclxud2hpbGUgKDEpIHtcclxuXHRwbGF5ZXIuZ2V0VHVybigpO1xyXG59XHJcbiovXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29uZmlnIChjb25maWcpe1xyXG4gICAgc2hpcHMgPSB7XHJcbiAgICAgICAgYWlyY3JhZnRDYXJyaWVyIDoge1xyXG4gICAgICAgICAgICBzaXplIDogNSxcclxuICAgICAgICAgICAgaWQgOiAnYWlyY3JhZnRDYXJyaWVyJyxcclxuICAgICAgICAgICAgY29sb3IgOiAnQ3JpbXNvbicsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnYWNjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnQWlyY3JhZnQgQ2FycmllcicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBiYXR0bGVzaGlwIDoge1xyXG4gICAgICAgICAgICBzaXplIDogNCxcclxuICAgICAgICAgICAgaWQgOiAnYmF0dGxlc2hpcCcsXHJcbiAgICAgICAgICAgIGNvbG9yOidEYXJrR3JlZW4nLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ2JzY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ0JhdHRsZXNoaXAnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzdHJveWVyIDoge1xyXG4gICAgICAgICAgICBzaXplIDogMyxcclxuICAgICAgICAgICAgaWQgOiAnZGVzdHJveWVyJyxcclxuICAgICAgICAgICAgY29sb3I6J0NhZGV0Qmx1ZScsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnZGVjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnRGVzdHJveWVyJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1hcmluZSAgOiB7XHJcbiAgICAgICAgICAgIHNpemUgOiAzLFxyXG4gICAgICAgICAgICBpZCA6ICdzdWJtYXJpbmUnLFxyXG4gICAgICAgICAgICBjb2xvcjonRGFya1JlZCcsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnc3VjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnU3VibWFyaW5lJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhdHJvbEJvYXQgOiB7XHJcbiAgICAgICAgICAgIHNpemUgOiAyLFxyXG4gICAgICAgICAgICBpZCA6ICdwYXRyb2xCb2F0JyxcclxuICAgICAgICAgICAgY29sb3I6J0dvbGQnLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ3BiY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ1BhdHJvbCBCb2F0JyxcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxufVxyXG4iLCJsZXQgc2hpcHM9cmVxdWlyZSgnLi9zaGlwcy5qcycpO1xuXG5sZXQgbmF1dGljYWxNYXAgPSB7fTsgLy8gSGFzaCBsb29rdXAgdGhhdCB0cmFja3MgZWFjaCBzaGlwJ3Mgc3RhcnRpbmcgcG9pbnQgYW5kIGN1cnJlbnQgb3JpZW50YXRpb25cblxubGV0IGJ1aWxkTmF1dGljYWxDaGFydCA9IGZ1bmN0aW9uKCl7XG5cdGxldCBjaGFydCA9IG5ldyBBcnJheTtcblx0Zm9yKGxldCBpPTA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0Y2hhcnRbaV0gPSBuZXcgQXJyYXk7XG5cdFx0Zm9yIChsZXQgaj0wOyBqIDwgMTA7IGorKyl7XG5cdFx0XHRjaGFydFtpXVtqXSA9IG5ldyBBcnJheTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGNoYXJ0O1xufVxuXG5sZXQgbmF1dGljYWxDaGFydCA9IGJ1aWxkTmF1dGljYWxDaGFydCgpOyAvLyBEZXRhaWxlZCBtYXRyaXggb2YgZXZlcnkgc2hpcCBpbiB0aGUgZmxlZXRcblxubGV0IGdldEZsZWV0ID0gZnVuY3Rpb24odHlwZSl7XG5cdGxldCBvcmllbnRhdGlvbiA9IG5hdXRpY2FsTWFwW3R5cGVdLm9yaWVudGF0aW9uID09ICd4JyA/IDAgOiAxO1xuXG5cdGxldCBwaWVjZXMgPSBuYXV0aWNhbE1hcFt0eXBlXS5zdGFydF9jb29yZC5zcGxpdCgnXycpO1xuXHRsZXQgcmV0ID0gbmV3IEFycmF5O1xuXG5cdHdoaWxlIChuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gPT0gdHlwZSkge1xuXHRcdHJldC5wdXNoIChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xuXHRcdHBpZWNlc1tvcmllbnRhdGlvbl0gPSBwYXJzZUludChwaWVjZXNbb3JpZW50YXRpb25dLCAxMCkgKyAxO1xuXHR9XG5cblx0cmV0dXJuIChyZXQpO1xufVxuXG5sZXQgZ2V0V2hvbGVGbGVldCA9IGZ1bmN0aW9uKCl7XG5cdGxldCByZXQ7XG5cdGZvciAodCBpbiBuYXV0aWNhbENoYXJ0KSB7XG5cdFx0cmV0W3RdID0gZ2V0RmxlZXQodCk7XG5cdH1cblx0cmV0dXJuIHJldDtcbn1cblxuLy8gVE9ETyAtIHNldEZsZWV0OiBSZW1vdmUgcHJldmlvdXMgc2hpcCBmcm9tIGNoYXJ0IC0tIG1heSBiZSBkb25lLi4ubmVlZHMgdGVzdFxuLypcbiAqIHNldEZsZWV0IC0gcGxhY2Ugc2hpcCBvbiBuYXV0aWNhbCBjaGFydFxuICovXG5sZXQgc2V0RmxlZXQgPSBmdW5jdGlvbiAob3JpZW50YXRpb24sIHR5cGUsIHNpemUsIHN0YXJ0X2Nvb3JkKXtcbiAgICBsZXQgcGllY2VzID0gc3RhcnRfY29vcmQuc3BsaXQoJ18nKTtcbiAgICBsZXQgaW5kZXggPSAob3JpZW50YXRpb24gPT0gJ3gnKSA/IDAgOiAxO1xuXG4gICAgZGVsZXRlIG5hdXRpY2FsTWFwW3R5cGVdO1xuICAgIC8vIHNldCB0aGUgbmF1dGljYWwgbWFwIHZhbHVlIGZvciB0aGlzIGJvYXRcbiAgICBuYXV0aWNhbE1hcFt0eXBlXT17XG5cdCAgICBvcmllbnRhdGlvbjogb3JpZW50YXRpb24sXG5cdCAgICBzdGFydF9jb29yZDogcGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdXG4gICAgfTtcblxuICAgIGZvciAodmFyIGk9MDsgaSA8IHNpemU7IGkrKykge1xuXHRuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gPSB0eXBlO1xuXHRwaWVjZXNbaW5kZXhdPSBwYXJzZUludChwaWVjZXNbaW5kZXhdLCAxMCkgKzE7XG4gICAgfVxufVxuXG4vKlxuICogZ2hvc3RTaGlwIC0gQmVmb3JlIHB1dHRpbmcgYSBzaGlwIG9uIHRoZSBjaGFydCBpdCdzIHBvdGVudGlhbCBsb2NhdGlvbiBuZWVkcyB0byBiZSBwbG90dGVkIHNvIGl0IGNhbiBiZVxuICogY2hlY2tlZCBmb3IgdmFsaWRpdHkuIEdpdmVuIGEgc2hpcCB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHRoZSBwb3RlbnRpYWwgcGxvdHRlZCBjb29yZGluYXRlcy4gVGhlIGZ1bmN0aW9uXG4gKiBtYXkgYnVpbGQgY29vcmRpbmF0ZXMgZm9yIGEga25vd24gc2hpcCBvciBmb3Igb25lIG1vdmVkIGFyb3VuZCBvbiB0aGUgZ3JpZC5cbiAqL1xubGV0IGdob3N0U2hpcCA9IGZ1bmN0aW9uKHR5cGUsIGNvb3JkaW5hdGUsIG9yaWVudGF0aW9uLCBzaXplKXtcblx0bGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xuXHRsZXQgdGhpc1NoaXAgPSByZWFkTWFwKHR5cGUpO1xuXHRsZXQgZ2hvc3RTaGlwID0gW107XG5cdGNvb3JkaW5hdGUgPSBjb29yZGluYXRlIHx8IHRoaXNTaGlwLnN0YXJ0X2Nvb3JkO1xuXHRvcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uIHx8IHRoaXNTaGlwLm9yaWVudGF0aW9uO1xuXHRzaXplID0gc2l6ZSB8fCBzaGlwLnNpemU7XG5cblx0bGV0IHBpZWNlcyA9IGNvb3JkaW5hdGUuc3BsaXQoJ18nKTtcblx0bGV0IGluZGV4ID0gKG9yaWVudGF0aW9uID09ICd4JykgPyAwOiAxO1xuXHRmb3IgKGxldCBpPTA7IGkgPCBzaXplOyBpKyspIHtcblx0XHRnaG9zdFNoaXAucHVzaChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xuXHRcdHBpZWNlc1tpbmRleF0gPSBwYXJzZUludChwaWVjZXNbaW5kZXhdLCAxMCkgKzE7XG5cdH1cblx0cmV0dXJuIGdob3N0U2hpcDtcbn1cblxubGV0IHJlYWRNYXAgPSBmdW5jdGlvbih0eXBlKXtcblx0cmV0dXJuIG5hdXRpY2FsTWFwW3R5cGVdO1xufVxuXG4vKlxuICogR2l2ZW4gYSBjb29yZGluYXRlIG9yIGFuIGFycmF5IG9mIGNvb3JkaW5hdGVzIHJldHVybiB0aGUgc2FtZSBzdHJ1Y3R1cmUgcmV2ZWFsaW5nIHRoZSBjb250ZW50cyBvZiB0aGUgZ3JpZC5cbiAqIFdpbGwgcmV0dXJuIGEgdmFsdWUgb2YgZmFsc2UgaWYgdGhlcmUgaXMgYSBwcm9ibGVtIGNoZWNraW5nIHRoZSBncmlkIChleC4gY29vcmRzIGFyZSBvdXQgb2YgcmFuZ2UpLlxuICovXG5sZXQgY2hlY2tHcmlkID0gZnVuY3Rpb24oY29vcmRpbmF0ZXMpe1xuXHRpZiAoY29vcmRpbmF0ZXMgaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0bGV0IHJldCA9IG5ldyBBcnJheTtcblx0XHRmb3IoYyBpbiBjb29yZGluYXRlcyl7XG5cdFx0XHRsZXQgcyA9IF9zZXRDaGFydChjb29yZGluYXRlc1tjXSk7XG5cdFx0XHRpZiAocyA9PSBmYWxzZSkge3JldHVybiBmYWxzZX07XG5cdFx0XHRyZXQucHVzaCAocyk7XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIF9zZXRDaGFydChjb29yZGluYXRlcyk7XG5cdH1cbn1cblxubGV0IF9zZXRDaGFydCA9IGZ1bmN0aW9uKGNvb3JkaW5hdGUpe1xuXHRsZXQgcGllY2VzID0gY29vcmRpbmF0ZS5zcGxpdCgnXycpO1xuXHRpZiAobmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldID09IHVuZGVmaW5lZCkge3JldHVybiBmYWxzZX1cblxuXHRyZXR1cm4gbmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldO1xufVxuXG4vKiBcbiAqIEdpdmVuIGEgbGlzdCBvZiBjb29yZGluYXRlcyBhbmQgYSBzaGlwIHR5cGUgdmFsaWRhdGUgdGhhdCB0aGUgY29vcmRpbmF0ZXMgZG8gbm90IHZpb2xhdGUgdGhlIHJ1bGVzIG9mOlxuICogXHQqIHNoaXAgbXVzdCBiZSBvbiB0aGUgZ3JpZFxuICogXHQqIHNoaXAgbXVzdCBub3Qgb2NjdXB5IHRoZSBzYW1lIHNxdWFyZSBhcyBhbnkgb3RoZXIgc2hpcFxuICovXG5sZXQgdmFsaWRhdGVTaGlwID0gZnVuY3Rpb24gKGNvb3JkaW5hdGVzLCB0eXBlKXtcblxuXG4gICAgLy8gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyBvdGhlciBib2F0cyBhbHJlYWR5IG9uIGFueSBhIHNwYWNlXG4gICAgZm9yICh2YXIgcD0wOyBwIDwgY29vcmRpbmF0ZXMubGVuZ3RoOyBwKyspIHtcblxuXHQvLyBJcyB0aGVyZSBhIGNvbGxpc2lvbj9cblx0bGV0IGdyaWQgPSBjaGVja0dyaWQoY29vcmRpbmF0ZXMpO1xuXHRcblx0aWYgKGdyaWQgPT0gZmFsc2UpIHtyZXR1cm4gZmFsc2V9OyAvLyBJZiBjaGVja0dyaWQgcmV0dXJucyBmYWxzZSBjb29yZGluYXRlcyBhcmUgb3V0IG9mIHJhbmdlXG5cblx0Zm9yIChnIGluIGdyaWQpIHtcblx0XHQvLyBGYWlsIGlmIHRoZSBncmlkIHNwYWNlIGNvbnRhaW5zIG5laXRoZXIgdGhlIGN1cnJlbnQgc2hpcCB2YWx1ZSBvciBOVUxMXG5cdFx0aWYgKGdyaWRbZ10gIT0gdHlwZSAmJiAhZ3JpZFtnXSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fVxuXHR9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZXRGbGVldDogZ2V0RmxlZXQsXG4gICAgc2V0RmxlZXQ6IHNldEZsZWV0LFxuICAgIHZhbGlkYXRlU2hpcDogdmFsaWRhdGVTaGlwLFxuICAgIGNoZWNrR3JpZDogY2hlY2tHcmlkLFxuICAgIGJ1aWxkTmF1dGljYWxDaGFydDogYnVpbGROYXV0aWNhbENoYXJ0LFxuICAgIGdob3N0U2hpcDogZ2hvc3RTaGlwXG59XG4iLCJsZXQgZmxlZXQgPSByZXF1aXJlKCcuL2ZsZWV0Jyk7XHJcbmxldCBzaGlwcyA9IHJlcXVpcmUoJy4vc2hpcHMnKTtcclxuXHJcbi8qXHJcbiAqIEJ1aWxkIHRoZSBncmlkIGFuZCBhdHRhY2ggaGFuZGxlcnMgZm9yIGRyYWcvZHJvcCBldmVudHNcclxuICovXHJcbmxldCBjbGlja2FibGVHcmlkID0gZnVuY3Rpb24gKCByb3dzLCBjb2xzLCBpc015R3JpZCl7XHJcbiAgICBsZXQgZ3JpZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICBmb3IgKHZhciByPTA7cjxyb3dzOysrcil7XHJcbiAgICAgICAgdmFyIHRyID0gZ3JpZC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpKTtcclxuICAgICAgICBmb3IgKHZhciBjPTA7Yzxjb2xzOysrYyl7XHJcbiAgICAgICAgICAgIHZhciBjZWxsID0gdHIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKSk7XHJcbiAgICAgICAgICAgIC8vIEVhY2ggY2VsbCBvbiB0aGUgZ3JpZCBpcyBvZiBjbGFzcyAnY2VsbCdcclxuICAgICAgICAgICAgY2VsbC5jbGFzc05hbWU9J2NlbGwnO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHRoZSBJRCB2YWx1ZSBvZiBlYWNoIGNlbGwgdG8gdGhlIHJvdy9jb2x1bW4gdmFsdWUgZm9ybWF0dGVkIGFzIHJfY1xyXG4gICAgICAgICAgICBjZWxsLmlkID0gciArICdfJyArIGM7XHJcbiAgICAgICAgICAgIC8vIFNldCB1cCBkcmFnIGFuZCBkcm9wIGZvciBlYWNoIGNlbGwuXHJcbiAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCd0cnVlJyk7XHJcblxyXG5cclxuICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLChcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGV2KXtcclxuICAgICAgICAgICAgICAgICAgICBldi5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZD0nbW92ZSc7XHJcblx0XHQgICAgbGV0IHR5cGUgPSBmbGVldC5jaGVja0dyaWQodGhpcy5pZCk7XHJcblx0XHQgICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgd2hpY2ggc3F1YXJlIHdhcyBjbGlja2VkIHRvIGd1aWRlIHBsYWNlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGFydF9jb29yZCA9IF9maW5kX3N0YXJ0KHRoaXMuaWQsIHNoaXAub3JpZW50YXRpb24sIHNoaXAuc2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXYuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcXVhcmUgOnN0YXJ0X2Nvb3JkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggIDpzaGlwLnNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlICAgOnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X2Nvb3JkOiBmbGVldC5naG9zdFNoaXAodHlwZSwgc3RhcnRfY29vcmQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIERyYWcvRHJvcCBjYXBhYmlsaXRpZXNcclxuICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywoXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihldil7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2Ryb3BwaW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRyb3BPYmogPSBKU09OLnBhcnNlKGV2LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9wbGFpblwiKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNoaXA9c2hpcHMuZ2V0U2hpcChkcm9wT2JqLnR5cGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihzaGlwcy52YWxpZGF0ZVNoaXAoZHJvcE9iai50eXBlLCBkcm9wT2JqLmN1cnJlbnRfY29vcmQpKSB7XHJcblx0XHRcdCAgICAvLyBSZW1vdmUgaW5pdGlhbCBpbWFnZVxyXG5cdFx0XHQgICAgX2Rpc3BsYXlTaGlwKHR5cGUsIGN1cnJlbnRfY29vcmQsIHNraXApO1xyXG5cclxuXHRcdFx0ICAgIGZsZWV0LnNldEZsZWV0IChmbGVldC5yZWFkTWFwKERyb3BPYmoudHlwZSksIERyb3BPYmoudHlwZSwgc2hpcC5zaXplLCBkcm9wT2JqLmN1cnJlbnRfY29vcmQpOyAvLyAob3JpZW50YXRpb24sIHR5cGUsIHNpemUsIHN0YXJ0X2Nvb3JkKVxyXG5cclxuXHRcdFx0ICAgIC8vIFJlZHJhdyBpbWFnZSBpbiBuZXcgbG9jYXRpb25cclxuXHRcdFx0ICAgIF9kaXNwbGF5U2hpcCh0eXBlLCBjdXJyZW50X2Nvb3JkLCBza2lwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLChcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGV2KXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZHJhZ292ZXInKTtcclxuICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0PSdtb3ZlJztcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKSk7XHJcblxyXG4gICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGZ1bmN0aW9uKGUpe1xyXG5cdFx0bGV0IHR5cGUgPSBmbGVldC5jaGVja0dyaWQodGhpcy5pZCk7XHJcblx0XHRsZXQgdGhpc1NoaXAgPSBmbGVldC5jaGVja0dyaWQodHlwZSk7XHJcblx0XHRsZXQgc2hpcCA9IHNoaXAuZ2V0U2hpcCh0eXBlKTtcclxuXHRcdGxldCBvcmllbnRhdGlvbiA9ICh0aGlzU2hpcC5vcmllbnRhdGlvbiA9PSAneCcpID8gJ3knOid4JztcclxuXHRcdGxldCBnaG9zdCA9IGZsZWV0Lmdob3N0U2hpcCgndHlwZScsIF9maW5kX3N0YXJ0KHRoaXMuaWQsIG9yaWVudGF0aW9uLCBzaGlwLnNpemUgKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNoaXBzLnZhbGlkYXRlU2hpcCh0eXBlLCBnaG9zdCkpIHtcclxuXHRcdCAgICAvLyBSZW1vdmUgaW5pdGlhbCBpbWFnZVxyXG5cdFx0ICAgIF9kaXNwbGF5U2hpcCh0eXBlLCBjdXJyZW50X2Nvb3JkLCBza2lwKTtcclxuXHJcblx0XHQgICAgZmxlZXQuc2V0RmxlZXQgKGZsZWV0LnJlYWRNYXAoRHJvcE9iai50eXBlKSwgRHJvcE9iai50eXBlLCBzaGlwLnNpemUsIGRyb3BPYmouY3VycmVudF9jb29yZCk7XHJcblxyXG5cdFx0ICAgIC8vIFJlZHJhdyBpbWFnZSBpbiBuZXcgbG9jYXRpb25cclxuXHRcdCAgICBfZGlzcGxheVNoaXAodHlwZSwgY3VycmVudF9jb29yZCwgc2tpcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBncmlkO1xyXG59XHJcblxyXG4vKlxyXG4gKiBfZmluZF9zdGFydCAtIERldGVybWluZSB0aGUgc3RhcnRpbmcgY29vcmRpbmF0ZSBvZiBhIHNoaXAgZ2l2ZW4gdGhlIHNxdWFyZSB0aGF0IHdhcyBjbGlja2VkLiBGb3IgZXhhbXBsZVxyXG4gKiBpdCBpcyBwb3NzaWJsZSB0aGF0IGEgYmF0dGxlc2hpcCBhbG9uZyB0aGUgeC1heGlzIHdhcyBjbGlja2VkIGF0IGxvY2F0aW9uIDNfMyBidXQgdGhhdCB3YXMgdGhlIHNlY29uZCBzcXVhcmVcclxuICogb24gdGhlIHNoaXAuIFRoaXMgZnVuY3Rpb24gd2lsbCBpZGVudGlmeSB0aGF0IHRoZSBiYXR0bGVzaGlwIHN0YXJ0cyBhdCAyXzMuXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gX2ZpbmRfc3RhcnQoc3RhcnRfcG9zLCBvcmllbnRhdGlvbiwgc2l6ZSl7XHJcbiAgICBsZXQgdHlwZSA9IGZsZWV0LmNoZWNrR3JpZCh0aGlzLmlkKTtcclxuICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuICAgIGxldCBpbmRleCA9IChvcmllbnRhdGlvbiA9PSAneCcpID8gMCA6IDE7XHJcblxyXG4gICAgbGV0IHBpZWNlcz1zdGFydF9wb3Muc3BsaXQoJ18nKTtcclxuXHJcbiAgICBmb3IgKGxldCBpPTA7IGkgPCBzaXplOyBpKyspIHtcclxuXHRsZXQgZyA9IGZsZWV0LmNoZWNrR3JpZChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xyXG4gICAgICAgIGlmIChnICE9IHVuZGVmaW5lZCAmJiBnID09IHR5cGUpe1xyXG4gICAgICAgICAgICBwaWVjZXNbaW5kZXhdKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0ID0gc3RhcnRfcG9zLnNwbGl0KCdfJyk7XHJcbiAgICBzdGFydFtpbmRleF0gPSBzdGFydFtpbmRleF0gLSAoc2l6ZSAtIGkpO1xyXG4gICAgcmV0dXJuIHN0YXJ0WzBdICsgJ18nICsgc3RhcnRbMV07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpc3BsYXlTaGlwKHR5cGUpIHtcclxuICAgIGxldCBjb29yZGluYXRlcyA9IGZsZWV0LmdldEZsZWV0KHR5cGUpO1xyXG5cclxuICAgIGZvciAoY29vcmQgaW4gY29vcmRpbmF0ZXMpIHtcclxuICAgICAgICBzZXRTcGFjZShjb29yZGluYXRlc1tjb29yZF0sIHNoaXBzQ2ZnW3R5cGVdLmNsaWNrQ2xhc3MpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBfc2V0U3BhY2Uoc3BhY2UsIGNsYXNzTmFtZSkge1xyXG4gICAgdmFyIGIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzcGFjZSk7IFxyXG4gICAgYi5jbGFzc0xpc3QudG9nZ2xlKGNsYXNzTmFtZSk7XHJcbn1cclxuXHJcbm1vZHVsZS5zPWV4cG9ydHM9e1xyXG4gICAgY2xpY2thYmxlR3JpZDogY2xpY2thYmxlR3JpZCxcclxuICAgIGRpc3BsYXlTaGlwOiBkaXNwbGF5U2hpcFxyXG59XHJcblxyXG4iLCIvL2xldCByYWJiaXQgPSByZXF1aXJlKCcuL2JzX1JhYmJpdE1RJyk7XG5sZXQgZmxlZXQgPSByZXF1aXJlKCcuL2ZsZWV0LmpzJyk7XG5cbmxldCBwbGF5ZXJSb3N0ZXIgPSBuZXcgT2JqZWN0OyAvLyBQbGFjZWhvbGRlciBmb3IgYWxsIHBsYXllcnMgaW4gdGhlIGdhbWVcbmxldCBwbGF5ZXJPcmRlciA9IFtdOyAvLyBPcmRlciBvZiBwbGF5ZXIgdHVyblxuXG5sZXQgbWU7XG5sZXQgb3JkZXJJbmRleD0wO1xuXG4vLyBSZWdpc3RlciBoYW5kbGVcbmxldCByZWdpc3RlciA9IGZ1bmN0aW9uKGhhbmRsZSl7XG5cdG1lID0gaGFuZGxlOyAvLyBTZWxmIGlkZW50aWZ5IHRoaW5lc2VsZlxuXHQvLyBUT0RPIC0gY2FsbCBvdXQgdG8gdGhlIHJlZ2lzdHJhdGlvbiBzZXJ2aWNlIGFuZCBnZXQgYmFjayBoYW5kbGUgYW5kIHR1cm4gb3JkZXIuIFRoaXNcblx0Ly8gc3RydWN0dXJlIHJlcHJlc2VudHMgdGhlIHJldHVybiBjYWxsIGZyb20gdGhlIHJlZ2lzdHJhdGlvbiBzZXJ2aWNlLlxuXHRjb25zdCByZWcgPSB7XG5cdFx0ICAgICAgaGFuZGxlOiAnZWxzcG9ya28nLFxuXHRcdCAgICAgIG9yZGVyOiAwXG5cdH07XG5cblx0Ly9fcG9wdWxhdGVfcGxheWVyT3JkZXIoJ2Vsc3BvcmtvJywgMCk7XG5cdHBsYXllck9yZGVyW3JlZy5vcmRlcl0gPSByZWcuaGFuZGxlO1xufVxuXG4vKlxuICogIE9uZSBjb25zaWRlcmF0aW9uIGlzIGZvciB0aGUgcmVnaXN0cmF0aW9uIHNlcnZpY2UgdG8gcHJvdmlkZSBhIHJhbmRvbSBudW1iZXIgZm9yIG9yZGVyIHZhbHVlIHNvIHRoYXQgcGxheWVyIG9yZGVyIGlzIG5vdFxuICogIG5lY2Vzc2FyaWx5IEZJRk8uIEFsc28gdGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgcGxheWVyIG9yZGVyIHZhbHVlcyB3aWxsIGFycml2ZSBpbiBjb25zZWN1dGl2ZSBvcmRlciBzbyB0aGVyZSBuZWVkcyB0b1xuICogIGJlIGEgc29ydCBtZWNoYW5pc20uXG4gKi9cbmxldCBfcG9wdWxhdGVfcGxheWVyT3JkZXIgPSBmdW5jdGlvbihoYW5kbGUsIG9yZGVyKXtcbn1cblxuLy9BY2NlcHQgcmVnaXN0cmF0aW9uIGZyb20gb3RoZXIgcGxheWVyc1xubGV0IGFjY2VwdFJlZyA9IGZ1bmN0aW9uKGhhbmRsZSwgb3JkZXIpe1xuXHRwbGF5ZXJPcmRlcltvcmRlcl0gPSBoYW5kbGU7XG5cdHBsYXllclJvc3RlciA9IHtcblx0XHRbaGFuZGxlXToge2dyaWQ6IGZsZWV0LmJ1aWxkTmF1dGljYWxDaGFydH1cblx0fVxufVxuXG5sZXQgbXlUdXJuID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiAoY3VycmVudFBsYXllcigpID09IG1lKSA/IDEgOiAwO1xufVxuXG5sZXQgbmV4dFBsYXllciA9IGZ1bmN0aW9uKCkge1xuXHRvcmRlckluZGV4ID0gKG9yZGVySW5kZXggPT0gcGxheWVyT3JkZXIubGVuZ3RoIC0gMSkgPyAgMCA6IG9yZGVySW5kZXgrMTtcblx0cmV0dXJuO1xufVxuXG5sZXQgY3VycmVudFBsYXllciA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBwbGF5ZXJPcmRlcltvcmRlckluZGV4XTtcbn1cblxubGV0IHBsYXllck1vdmUgPSBmdW5jdGlvbigpe1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZWdpc3RlcjogcmVnaXN0ZXIsXG4gICAgYWNjZXB0UmVnOiBhY2NlcHRSZWcsXG4gICAgbXlUdXJuOiBteVR1cm4sXG4gICAgY3VycmVudFBsYXllcjogY3VycmVudFBsYXllcixcbiAgICBuZXh0UGxheWVyOiBuZXh0UGxheWVyXG59XG4iLCJsZXQgZmxlZXQgPSByZXF1aXJlICgnLi9mbGVldC5qcycpO1xyXG4vLyBDb25maWcgc2V0dGluZ3MgXHJcbmxldCBzaGlwX2NvbmZpZyA9IHtcclxuICAgIGFpcmNyYWZ0Q2FycmllciA6IHtcclxuICAgICAgICBzaXplIDogNSxcclxuICAgICAgICBpZCA6ICdhaXJjcmFmdENhcnJpZXInLFxyXG4gICAgICAgIGNvbG9yIDogJ0NyaW1zb24nLFxyXG4gICAgICAgIGNsaWNrQ2xhc3MgOiAnYWNjbGlja2VkJyxcclxuICAgICAgICBsYWJlbCA6ICdBaXJjcmFmdCBDYXJyaWVyJyxcclxuICAgIH0sXHJcbiAgICBiYXR0bGVzaGlwIDoge1xyXG4gICAgICAgIHNpemUgOiA0LFxyXG4gICAgICAgIGlkIDogJ2JhdHRsZXNoaXAnLFxyXG4gICAgICAgIGNvbG9yOidEYXJrR3JlZW4nLFxyXG4gICAgICAgIGNsaWNrQ2xhc3MgOiAnYnNjbGlja2VkJyxcclxuICAgICAgICBsYWJlbCA6ICdCYXR0bGVzaGlwJyxcclxuICAgIH0sXHJcbiAgICBkZXN0cm95ZXIgOiB7XHJcbiAgICAgICAgc2l6ZSA6IDMsXHJcbiAgICAgICAgaWQgOiAnZGVzdHJveWVyJyxcclxuICAgICAgICBjb2xvcjonQ2FkZXRCbHVlJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ2RlY2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnRGVzdHJveWVyJyxcclxuICAgIH0sXHJcbiAgICBzdWJtYXJpbmUgIDoge1xyXG4gICAgICAgIHNpemUgOiAzLFxyXG4gICAgICAgIGlkIDogJ3N1Ym1hcmluZScsXHJcbiAgICAgICAgY29sb3I6J0RhcmtSZWQnLFxyXG4gICAgICAgIGNsaWNrQ2xhc3MgOiAnc3VjbGlja2VkJyxcclxuICAgICAgICBsYWJlbCA6ICdTdWJtYXJpbmUnLFxyXG4gICAgfSxcclxuICAgIHBhdHJvbEJvYXQgOiB7XHJcbiAgICAgICAgc2l6ZSA6IDIsXHJcbiAgICAgICAgaWQgOiAncGF0cm9sQm9hdCcsXHJcbiAgICAgICAgY29sb3I6J0dvbGQnLFxyXG4gICAgICAgIGNsaWNrQ2xhc3MgOiAncGJjbGlja2VkJyxcclxuICAgICAgICBsYWJlbCA6ICdQYXRyb2wgQm9hdCcsXHJcbiAgICB9LFxyXG59O1xyXG5cclxuLy8gU2hpcCBjb25zdHJ1Y3RvciAtIHNoaXB5YXJkPz8/XHJcbmZ1bmN0aW9uIF9zaGlwKHNpemUsIGlkLCBjb2xvciwgY2xpY2tDbGFzcywgbGFiZWwpIHtcclxuICAgICAgICB0aGlzLnNpemUgICAgICAgID0gc2l6ZTtcclxuICAgICAgICB0aGlzLmlkICAgICAgICAgID0gaWQ7XHJcbiAgICAgICAgdGhpcy5jb2xvciAgICAgICA9IGNvbG9yO1xyXG4gICAgICAgIHRoaXMuY2xpY2tDbGFzcyAgPSBjbGlja0NsYXNzO1xyXG4gICAgICAgIHRoaXMubGFiZWwgICAgICAgPSBsYWJlbDtcclxuXHJcbiAgICAgICAgcmV0dXJuICh0aGlzKTtcclxufVxyXG5cclxubGV0IHNoaXBzPXt9O1xyXG5cclxuLypcclxuICogVGhlIHNoaXAgb2JqZWN0IGhvbGRzIHRoZSBjdXJyZW50IG9yaWVudGF0aW9uIG9mIHRoZSBzaGlwIGFuZCB0aGUgc3RhcnQgY29vcmRpbmF0ZSAodG9wbW9zdC9sZWZ0bW9zdCkuIFdoZW5cclxuICogdGhlcmUgaXMgYSBjaGFuZ2UgdG8gdGhlIHNoaXAgdGhlIG1hc3RlciBtYXRyaXggbmVlZHMgdG8gYmUgdXBkYXRlZC4gQW4gZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB0aGVyZSBpc1xyXG4gKiBhIGNvb3JkaW5hdGUgY2hhbmdlLiBUaGlzIGxpc3RlbmVyIHdpbGwgdXBkYXRlIHRoZSBtYXN0ZXIgbWF0cml4LiBDYWxscyB0byBjaGVjayBsb2NhdGlvbiAobW92ZSB2YWxpZHRpb24sIFxyXG4gKiBjaGVjayBpZiBoaXQsIGV0Yy4pIHdpbGwgYmUgbWFkZSBhZ2FpbnN0IHRoZSBtYXN0ZXIgbWF0cml4LlxyXG4gKi9cclxuLypcclxubGV0IHNoaXBJaW50ID0gZnVuY3Rpb24oKXtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoJ3NoaXBNb3ZlJywoKSkgfVxyXG5cclxufVxyXG4qL1xyXG4vLyBQdWJsaWMgZnVuY3Rpb24gdG8gaW5pdGlhbGx5IGNyZWF0ZSBzaGlwcyBvYmplY3RcclxubGV0IGJ1aWxkU2hpcHMgPSBmdW5jdGlvbiAoKXtcclxuICAgIGZvciAobGV0IHMgaW4gc2hpcF9jb25maWcpe1xyXG4gICAgICAgIHNoaXBzLnMgPSBfc2hpcChzaGlwX2NvbmZpZ1tzXS5zaXplLCBzaGlwX2NvbmZpZ1tzXS5pZCwgc2hpcF9jb25maWdbc10uY29sb3IsIHNoaXBfY29uZmlnW3NdLmNsaWNrQ2xhc3MsIHNoaXBfY29uZmlnW3NdLmxhYmVsKTtcclxuICAgIH1cclxucmV0dXJuIHNoaXBzO1xyXG59XHJcblxyXG5sZXQgYnVpbGRTaGlwID0gZnVuY3Rpb24odHlwZSl7XHJcbiAgICAgICAgc2hpcHNbdHlwZV0gPSBfc2hpcChzaGlwX2NvbmZpZ1t0eXBlXS5zaXplLCBzaGlwX2NvbmZpZ1t0eXBlXS5pZCwgc2hpcF9jb25maWdbdHlwZV0uY29sb3IsIHNoaXBfY29uZmlnW3R5cGVdLmNsaWNrQ2xhc3MsIHNoaXBfY29uZmlnW3R5cGVdLmxhYmVsKTtcclxuXHRyZXR1cm4gc2hpcHM7XHJcbn1cclxuXHJcbi8vIFNldCB2YWx1ZSBpbiBzaGlwIG9iamVjdC4gXHJcbmxldCBzZXRTaGlwID0gZnVuY3Rpb24odHlwZSwga2V5LCB2YWx1ZSl7XHJcbiAgICAgICAgaWYgKHR5cGUgJiYgc2hpcHNbdHlwZV0gJiYga2V5KSB7IC8vIG9ubHkgYXR0ZW1wdCBhbiB1cGRhdGUgaWYgdGhlcmUgaXMgYSBsZWdpdCBzaGlwIHR5cGUgYW5kIGEga2V5XHJcbiAgICAgICAgICAgIHNoaXBzW3R5cGVdLmtleSA9IHZhbHVlO1xyXG4gICB9XHJcbn1cclxuXHJcbi8vIFJldHVybiBzaGlwIG9iamVjdCBpZiBubyB0eXBlIGdpdmVuIG90aGVyd2lzZSByZXR1cm4gb2JqZWN0IGNvbnRhaW5pbmcganVzdCByZXF1ZXN0ZWQgc2hpcFxyXG5sZXQgZ2V0U2hpcCA9IGZ1bmN0aW9uICh0eXBlKXtcclxuICAgIGlmKHR5cGUpe1xyXG4gICAgICAgIHJldHVybiBzaGlwc1t0eXBlXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHNoaXBzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyBQcml2YXRlIGZ1bmN0aW9uIHRvIHJhbmRvbWx5IGRldGVybWluZSBzaGlwJ3Mgb3JpZW50YXRpb24gYWxvbmcgdGhlIFgtYXhpcyBvciBZLWF4aXMuIE9ubHkgdXNlZCB3aGVuIHBsb3R0aW5nIHNoaXBzIGZvciB0aGUgZmlyc3QgdGltZS5cclxuZnVuY3Rpb24gX2dldFN0YXJ0Q29vcmRpbmF0ZSgpe1xyXG4gICAgdmFyIHN0YXJ0X3g9TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjExKTtcclxuICAgIHZhciBzdGFydF95PU1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxMSk7XHJcbiAgICB2YXIgc3RhcnRfb3JpZW50YXRpb249TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjEwKTtcclxuICAgIHJldHVybiB7Y29vcmRpbmF0ZTogc3RhcnRfeCArICdfJyArIHN0YXJ0X3ksIG9yaWVudGF0aW9uOiBzdGFydF9vcmllbmF0aW9uID4gNSA/ICd4JyA6ICd5J307XHJcbn1cclxuXHJcbi8vIEZJWE1FIERvZXMgZmxlZXQuZ2hvc3RTaGlwIGRvIHRoaXMgbm93P1xyXG4vLyBCdWlsZCBhbiBhcnJheSBvZiBjb29yZGluYXRlcyBmb3IgYSBzaGlwIGJhc2VkIG9uIGl0J3Mgb3JpZW50YXRpb24sIGludGVuZGVkIHN0YXJ0IHBvaW50IGFuZCBzaXplXHJcbmxldCBfc2hpcFN0cmluZyA9IGZ1bmN0aW9uKHMpIHtcclxuXHRjb25zdCBvID0gcy5vcmllbnRhdGlvbjtcclxuXHRjb25zdCBzdCA9IHMuc3RhcnRfY29vcmRpbmF0ZTtcclxuXHRsZXQgciA9IG5ldyBBcnJheTtcclxuICAgICAgICBsZXQgdF9waWVjZXMgPSBzdC5zcGxpdCgnXycpO1xyXG5cdGNvbnN0IGkgPSBvID09ICd4JyA/IDAgOiAxO1xyXG5cclxuXHRmb3IgKGxldCBqPTA7IGogPCBzLnNpemU7aisrKSB7XHJcblx0XHR0X3BpZWNlc1tpXSA9IHRfcGllY2VzW2ldKzE7XHJcblx0XHRyLnB1c2ggKHRfcGllY2VzWzBdICsgJ18nICsgdF9waWVjZXNbMV0pO1xyXG5cdH1cclxuXHRyZXR1cm4gcjtcclxufVxyXG5cclxuXHJcbi8qXHJcbiAqIHBsYWNlU2hpcHMgLSBJbml0aWFsIHBsYWNlbWVudCBvZiBzaGlwcyBvbiB0aGUgYm9hcmRcclxuICovXHJcbmxldCBwbGFjZVNoaXBzID0gZnVuY3Rpb24gcGxhY2VTaGlwcygpe1xyXG4gICAgICAgIC8qIFJhbmRvbWx5IHBsYWNlIHNoaXBzIG9uIHRoZSBncmlkLiBJbiBvcmRlciBkbyB0aGlzIGVhY2ggc2hpcCBtdXN0OlxyXG5cdCAqICAgKiBQaWNrIGFuIG9yaWVudGF0aW9uXHJcblx0ICogICAqIFBpY2sgYSBzdGFydGluZyBjb29yZGluYXRlXHJcblx0ICogICAqIFZhbGlkYXRlIHRoYXQgdGhlIGNvb3JkaW5hdGUgaXMgdmFsaWQgKGRvZXMgbm90IHJ1biBPT0IsIGRvZXMgbm90IGNyb3NzIGFueSBvdGhlciBzaGlwLCBldGMuKVxyXG5cdCAqICAgKiBJZiB2YWxpZDpcclxuXHQgKiAgIFx0KiBTYXZlIHN0YXJ0IGNvb3JkIGFuZCBvcmllbnRhdGlvbiBhcyBwYXJ0IG9mIHNoaXAgb2JqZWN0XHJcblx0ICogICBcdCogUGxvdCBzaGlwIG9uIG1hc3RlciBtYXRyaXhcclxuXHQgKi9cclxuICAgICAgICBmb3IgKHZhciBzaGlwIGluIGdldFNoaXAoKSkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gX2dldFN0YXJ0Q29vcmRpbmF0ZSgpOyBcclxuXHRcdHNoaXAub3JpZW50YXRpb24gPSBzdGFydC5vcmllbnRhdGlvbjtcclxuXHRcdHNoaXAuc3RhcnRfY29vcmRpbmF0ZSA9IHN0YXJ0LmNvb3JkaW5hdGU7XHJcblx0XHQvL2NvbnN0IHNoaXBfc3RyaW5nID0gX3NoaXBTdHJpbmcoc2hpcCk7XHJcblx0XHRjb25zdCBzaGlwX3N0cmluZyA9IGZsZWV0Lmdob3N0U2hpcChzaGlwLnR5cGUsIHVuZGVmaW5lZCwgc3RhcnQub3JpZW50YXRpb24pO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoZmxlZXQudmFsaWRhdGVTaGlwKHNoaXBfc3RyaW5nKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZmxlZXQuc2V0RmxlZXQoc3RhcnQub3JpZW50YXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGlwLnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGlwLnNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hpcC5zdGFydF9jb29yZGluYXRlKTtcclxuXHRcdCAgICAgICBcdGJyZWFrO1xyXG5cdFx0fVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgYnVpbGRTaGlwczogYnVpbGRTaGlwcyxcclxuICAgIGJ1aWxkU2hpcDogYnVpbGRTaGlwLFxyXG4gICAgZ2V0U2hpcDogZ2V0U2hpcCxcclxuICAgIHNldFNoaXA6IHNldFNoaXAsXHJcbiAgICBwbGFjZVNoaXBzOiBwbGFjZVNoaXBzLFxyXG59XHJcbiJdfQ==
