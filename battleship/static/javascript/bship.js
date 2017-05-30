(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
document.body.appendChild(grid.clickableGrid(10, 10));


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
	let ghost = [];
	coordinate = coordinate || thisShip.start_coord;
	orientation = orientation || thisShip.orientation;
	size = size || ship.size;

	let pieces = coordinate.split('_');
	let index = (orientation == 'x') ? 0: 1;
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

	for (g in grid) {
		// Fail if the grid space contains neither the current ship value or NULL
		if (grid[g] != type && !grid[g]) {
			return false
		}
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

let displayShip = function (ships, type) {
    let coordinates = fleet.getFleet(type);
    let ship = ships.getShip(type);

    for (coord in coordinates) {
        _setSpace(coordinates[coord], ship.clickClass);
    }
}

function _setSpace(space, className) {
    var b = document.getElementById(space); 
    //b.toggle(className);
    b.classList.toggle(className);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJhdHRsZXNoaXAuanMiLCJjb25maWcuanMiLCJmbGVldC5qcyIsImdyaWQuanMiLCJwbGF5ZXIuanMiLCJzaGlwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBncmlkID0gcmVxdWlyZSgnLi9ncmlkLmpzJyk7XHJcbnZhciBwbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllci5qcycpO1xyXG52YXIgc2hpcHMgPSByZXF1aXJlKCcuL3NoaXBzLmpzJyk7XHJcbnZhciBmbGVldCA9IHJlcXVpcmUoJy4vZmxlZXQuanMnKTtcclxudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnLmpzJyk7XHJcblxyXG4vKiBSZWdpc3RlciAqL1xyXG5wbGF5ZXIucmVnaXN0ZXIoJ2Vsc3BvcmtvJyk7XHJcblxyXG4vLyBTZXQgdXAgZ3JpZFxyXG4vL2xldCBnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ215R3JpZCcpO1xyXG4vL2cuYXBwZW5kQ2hpbGQoZ3JpZC5jbGlja2FibGVHcmlkKDEwLCAxMCkpO1xyXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGdyaWQuY2xpY2thYmxlR3JpZCgxMCwgMTApKTtcclxuXHJcblxyXG4vKiBTZXQgcmFuZG9tIGZsZWV0ICovXHJcbnNoaXBzLmJ1aWxkU2hpcHMoKTtcclxuc2hpcHMucGxhY2VTaGlwcyhmbGVldCk7XHJcbmxldCB3aG9sZUZsZWV0ID0gZmxlZXQuZ2V0V2hvbGVGbGVldChmbGVldCk7XHJcbmZvciAodCBpbiB3aG9sZUZsZWV0KSB7XHJcblx0Z3JpZC5kaXNwbGF5U2hpcChzaGlwcywgdCk7XHJcbn1cclxuXHJcbi8qIFNldCBjb25maXJtIGZsZWV0ICovXHJcblxyXG4vKiBQbGF5IGdhbWUgKi9cclxuLypcclxud2hpbGUgKDEpIHtcclxuXHRwbGF5ZXIuZ2V0VHVybigpO1xyXG59XHJcbiovXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29uZmlnIChjb25maWcpe1xyXG4gICAgc2hpcHMgPSB7XHJcbiAgICAgICAgYWlyY3JhZnRDYXJyaWVyIDoge1xyXG4gICAgICAgICAgICBzaXplIDogNSxcclxuICAgICAgICAgICAgaWQgOiAnYWlyY3JhZnRDYXJyaWVyJyxcclxuICAgICAgICAgICAgY29sb3IgOiAnQ3JpbXNvbicsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnYWNjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnQWlyY3JhZnQgQ2FycmllcicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBiYXR0bGVzaGlwIDoge1xyXG4gICAgICAgICAgICBzaXplIDogNCxcclxuICAgICAgICAgICAgaWQgOiAnYmF0dGxlc2hpcCcsXHJcbiAgICAgICAgICAgIGNvbG9yOidEYXJrR3JlZW4nLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ2JzY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ0JhdHRsZXNoaXAnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzdHJveWVyIDoge1xyXG4gICAgICAgICAgICBzaXplIDogMyxcclxuICAgICAgICAgICAgaWQgOiAnZGVzdHJveWVyJyxcclxuICAgICAgICAgICAgY29sb3I6J0NhZGV0Qmx1ZScsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnZGVjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnRGVzdHJveWVyJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1hcmluZSAgOiB7XHJcbiAgICAgICAgICAgIHNpemUgOiAzLFxyXG4gICAgICAgICAgICBpZCA6ICdzdWJtYXJpbmUnLFxyXG4gICAgICAgICAgICBjb2xvcjonRGFya1JlZCcsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnc3VjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnU3VibWFyaW5lJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhdHJvbEJvYXQgOiB7XHJcbiAgICAgICAgICAgIHNpemUgOiAyLFxyXG4gICAgICAgICAgICBpZCA6ICdwYXRyb2xCb2F0JyxcclxuICAgICAgICAgICAgY29sb3I6J0dvbGQnLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ3BiY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ1BhdHJvbCBCb2F0JyxcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxufVxyXG4iLCJ2YXIgc2hpcHM9cmVxdWlyZSgnLi9zaGlwcy5qcycpO1xuXG5sZXQgbmF1dGljYWxNYXAgPSB7fTsgLy8gSGFzaCBsb29rdXAgdGhhdCB0cmFja3MgZWFjaCBzaGlwJ3Mgc3RhcnRpbmcgcG9pbnQgYW5kIGN1cnJlbnQgb3JpZW50YXRpb25cblxubGV0IGJ1aWxkTmF1dGljYWxDaGFydCA9IGZ1bmN0aW9uKCl7XG5cdGxldCBjaGFydCA9IG5ldyBBcnJheTtcblx0Zm9yKGxldCBpPTA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0Y2hhcnRbaV0gPSBuZXcgQXJyYXk7XG5cdFx0Zm9yIChsZXQgaj0wOyBqIDwgMTA7IGorKyl7XG5cdFx0XHRjaGFydFtpXVtqXSA9IHVuZGVmaW5lZDsvL25ldyBBcnJheTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGNoYXJ0O1xufVxuXG5sZXQgbmF1dGljYWxDaGFydCA9IGJ1aWxkTmF1dGljYWxDaGFydCgpOyAvLyBEZXRhaWxlZCBtYXRyaXggb2YgZXZlcnkgc2hpcCBpbiB0aGUgZmxlZXRcblxubGV0IGdldEZsZWV0ID0gZnVuY3Rpb24odHlwZSl7XG5cdGxldCBvcmllbnRhdGlvbiA9IG5hdXRpY2FsTWFwW3R5cGVdLm9yaWVudGF0aW9uID09ICd4JyA/IDAgOiAxO1xuXG5cdGxldCBwaWVjZXMgPSBuYXV0aWNhbE1hcFt0eXBlXS5zdGFydF9jb29yZC5zcGxpdCgnXycpO1xuXHRsZXQgcmV0ID0gbmV3IEFycmF5O1xuXG5cdHdoaWxlIChuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gPT0gdHlwZSkge1xuXHRcdHJldC5wdXNoIChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xuXHRcdHBpZWNlc1tvcmllbnRhdGlvbl0gPSBwYXJzZUludChwaWVjZXNbb3JpZW50YXRpb25dLCAxMCkgKyAxO1xuXHR9XG5cblx0cmV0dXJuIChyZXQpO1xufVxuXG5sZXQgZ2V0V2hvbGVGbGVldCA9IGZ1bmN0aW9uKCl7XG5cdGxldCByZXQ9e307XG5cdGZvciAodCBpbiBuYXV0aWNhbE1hcCkge1xuXHRcdHJldFt0XSA9IGdldEZsZWV0KHQpO1xuXHR9XG5cdHJldHVybiByZXQ7XG59XG5cbi8vIFRPRE8gLSBzZXRGbGVldDogUmVtb3ZlIHByZXZpb3VzIHNoaXAgZnJvbSBjaGFydCAtLSBtYXkgYmUgZG9uZS4uLm5lZWRzIHRlc3Rcbi8qXG4gKiBzZXRGbGVldCAtIHBsYWNlIHNoaXAgb24gbmF1dGljYWwgY2hhcnRcbiAqL1xubGV0IHNldEZsZWV0ID0gZnVuY3Rpb24gKG9yaWVudGF0aW9uLCB0eXBlLCBzaXplLCBzdGFydF9jb29yZCl7XG4gICAgbGV0IHBpZWNlcyA9IHN0YXJ0X2Nvb3JkLnNwbGl0KCdfJyk7XG4gICAgbGV0IGluZGV4ID0gKG9yaWVudGF0aW9uID09ICd4JykgPyAwIDogMTtcblxuICAgIGRlbGV0ZSBuYXV0aWNhbE1hcFt0eXBlXTtcbiAgICAvLyBzZXQgdGhlIG5hdXRpY2FsIG1hcCB2YWx1ZSBmb3IgdGhpcyBib2F0XG4gICAgbmF1dGljYWxNYXBbdHlwZV09e1xuXHQgICAgb3JpZW50YXRpb246IG9yaWVudGF0aW9uLFxuXHQgICAgc3RhcnRfY29vcmQ6IHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXVxuICAgIH07XG5cbiAgICBmb3IgKHZhciBpPTA7IGkgPCBzaXplOyBpKyspIHtcblx0bmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldID0gdHlwZTtcblx0cGllY2VzW2luZGV4XT0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApICsxO1xuICAgIH1cbn1cblxuLypcbiAqIGdob3N0U2hpcCAtIEJlZm9yZSBwdXR0aW5nIGEgc2hpcCBvbiB0aGUgY2hhcnQgaXQncyBwb3RlbnRpYWwgbG9jYXRpb24gbmVlZHMgdG8gYmUgcGxvdHRlZCBzbyBpdCBjYW4gYmVcbiAqIGNoZWNrZWQgZm9yIHZhbGlkaXR5LiBHaXZlbiBhIHNoaXAgdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiB0aGUgcG90ZW50aWFsIHBsb3R0ZWQgY29vcmRpbmF0ZXMuIFRoZSBmdW5jdGlvblxuICogbWF5IGJ1aWxkIGNvb3JkaW5hdGVzIGZvciBhIGtub3duIHNoaXAgb3IgZm9yIG9uZSBtb3ZlZCBhcm91bmQgb24gdGhlIGdyaWQuXG4gKi9cbmxldCBnaG9zdFNoaXAgPSBmdW5jdGlvbih0eXBlLCBjb29yZGluYXRlLCBvcmllbnRhdGlvbiwgc2l6ZSl7XG5cdGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcblx0bGV0IHRoaXNTaGlwID0gcmVhZE1hcCh0eXBlKTtcblx0bGV0IGdob3N0ID0gW107XG5cdGNvb3JkaW5hdGUgPSBjb29yZGluYXRlIHx8IHRoaXNTaGlwLnN0YXJ0X2Nvb3JkO1xuXHRvcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uIHx8IHRoaXNTaGlwLm9yaWVudGF0aW9uO1xuXHRzaXplID0gc2l6ZSB8fCBzaGlwLnNpemU7XG5cblx0bGV0IHBpZWNlcyA9IGNvb3JkaW5hdGUuc3BsaXQoJ18nKTtcblx0bGV0IGluZGV4ID0gKG9yaWVudGF0aW9uID09ICd4JykgPyAwOiAxO1xuXHRmb3IgKGxldCBpPTA7IGkgPCBzaXplOyBpKyspIHtcblx0XHRnaG9zdC5wdXNoKHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXSk7XG5cdFx0cGllY2VzW2luZGV4XSA9IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSArMTtcblx0fVxuXHRyZXR1cm4gZ2hvc3Q7XG59O1xuXG5sZXQgcmVhZE1hcCA9IGZ1bmN0aW9uKHR5cGUpe1xuXHRyZXR1cm4gbmF1dGljYWxNYXBbdHlwZV07XG59XG5cbi8qXG4gKiBHaXZlbiBhIGNvb3JkaW5hdGUgb3IgYW4gYXJyYXkgb2YgY29vcmRpbmF0ZXMgcmV0dXJuIHRoZSBzYW1lIHN0cnVjdHVyZSByZXZlYWxpbmcgdGhlIGNvbnRlbnRzIG9mIHRoZSBncmlkLlxuICogV2lsbCByZXR1cm4gYSB2YWx1ZSBvZiBmYWxzZSBpZiB0aGVyZSBpcyBhIHByb2JsZW0gY2hlY2tpbmcgdGhlIGdyaWQgKGV4LiBjb29yZHMgYXJlIG91dCBvZiByYW5nZSkuXG4gKi9cbmxldCBjaGVja0dyaWQgPSBmdW5jdGlvbihjb29yZGluYXRlcyl7XG5cdGlmIChjb29yZGluYXRlcyBpbnN0YW5jZW9mIEFycmF5KXtcblx0XHRsZXQgcmV0ID0gbmV3IEFycmF5O1xuXHRcdGZvcihjIGluIGNvb3JkaW5hdGVzKXtcblx0XHRcdGxldCBzID0gX3NldENoYXJ0KGNvb3JkaW5hdGVzW2NdKTtcblx0XHRcdGlmIChzID09PSBmYWxzZSkge3JldHVybiBmYWxzZX07XG5cdFx0XHRyZXQucHVzaCAocyk7XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIF9zZXRDaGFydChjb29yZGluYXRlcyk7XG5cdH1cbn07XG5cbmxldCBfc2V0Q2hhcnQgPSBmdW5jdGlvbihjb29yZGluYXRlKXtcblx0bGV0IHBpZWNlcyA9IGNvb3JkaW5hdGUuc3BsaXQoJ18nKTtcblx0aWYgKHBhcnNlSW50KHBpZWNlc1swXSwgMTApID49IG5hdXRpY2FsQ2hhcnQubGVuZ3RoIHx8XG5cdCAgICBwYXJzZUludChwaWVjZXNbMV0sIDEwKT49IG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldLmxlbmd0aCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJldHVybiBuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV07XG59O1xuXG4vKiBcbiAqIEdpdmVuIGEgbGlzdCBvZiBjb29yZGluYXRlcyBhbmQgYSBzaGlwIHR5cGUgdmFsaWRhdGUgdGhhdCB0aGUgY29vcmRpbmF0ZXMgZG8gbm90IHZpb2xhdGUgdGhlIHJ1bGVzIG9mOlxuICogXHQqIHNoaXAgbXVzdCBiZSBvbiB0aGUgZ3JpZFxuICogXHQqIHNoaXAgbXVzdCBub3Qgb2NjdXB5IHRoZSBzYW1lIHNxdWFyZSBhcyBhbnkgb3RoZXIgc2hpcFxuICovXG5sZXQgdmFsaWRhdGVTaGlwID0gZnVuY3Rpb24gKGNvb3JkaW5hdGVzLCB0eXBlKXtcblxuXG4gICAgLy8gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyBvdGhlciBib2F0cyBhbHJlYWR5IG9uIGFueSBhIHNwYWNlXG4gICAgZm9yICh2YXIgcD0wOyBwIDwgY29vcmRpbmF0ZXMubGVuZ3RoOyBwKyspIHtcblxuXHQvLyBJcyB0aGVyZSBhIGNvbGxpc2lvbj9cblx0bGV0IGdyaWQgPSBjaGVja0dyaWQoY29vcmRpbmF0ZXMpO1xuXHRcblx0aWYgKGdyaWQgPT0gZmFsc2UpIHtyZXR1cm4gZmFsc2V9OyAvLyBJZiBjaGVja0dyaWQgcmV0dXJucyBmYWxzZSBjb29yZGluYXRlcyBhcmUgb3V0IG9mIHJhbmdlXG5cblx0Zm9yIChnIGluIGdyaWQpIHtcblx0XHQvLyBGYWlsIGlmIHRoZSBncmlkIHNwYWNlIGNvbnRhaW5zIG5laXRoZXIgdGhlIGN1cnJlbnQgc2hpcCB2YWx1ZSBvciBOVUxMXG5cdFx0aWYgKGdyaWRbZ10gIT0gdHlwZSAmJiAhZ3JpZFtnXSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fVxuXHR9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0RmxlZXQ6IGdldEZsZWV0LFxuICAgIHNldEZsZWV0OiBzZXRGbGVldCxcbiAgICBnZXRXaG9sZUZsZWV0OiBnZXRXaG9sZUZsZWV0LFxuICAgIHZhbGlkYXRlU2hpcDogdmFsaWRhdGVTaGlwLFxuICAgIGNoZWNrR3JpZDogY2hlY2tHcmlkLFxuICAgIGJ1aWxkTmF1dGljYWxDaGFydDogYnVpbGROYXV0aWNhbENoYXJ0LFxuICAgIGdob3N0U2hpcDogZ2hvc3RTaGlwXG59XG4iLCJsZXQgZmxlZXQgPSByZXF1aXJlKCcuL2ZsZWV0Jyk7XHJcbmxldCBzaGlwcyA9IHJlcXVpcmUoJy4vc2hpcHMnKTtcclxuXHJcbi8qXHJcbiAqIEJ1aWxkIHRoZSBncmlkIGFuZCBhdHRhY2ggaGFuZGxlcnMgZm9yIGRyYWcvZHJvcCBldmVudHNcclxuICovXHJcbmxldCBjbGlja2FibGVHcmlkID0gZnVuY3Rpb24gKCByb3dzLCBjb2xzLCBpc015R3JpZCl7XHJcbiAgICBsZXQgZ3JpZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICBmb3IgKHZhciByPTA7cjxyb3dzOysrcil7XHJcbiAgICAgICAgdmFyIHRyID0gZ3JpZC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpKTtcclxuICAgICAgICBmb3IgKHZhciBjPTA7Yzxjb2xzOysrYyl7XHJcbiAgICAgICAgICAgIHZhciBjZWxsID0gdHIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKSk7XHJcbiAgICAgICAgICAgIC8vIEVhY2ggY2VsbCBvbiB0aGUgZ3JpZCBpcyBvZiBjbGFzcyAnY2VsbCdcclxuICAgICAgICAgICAgY2VsbC5jbGFzc05hbWU9J2NlbGwnO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHRoZSBJRCB2YWx1ZSBvZiBlYWNoIGNlbGwgdG8gdGhlIHJvdy9jb2x1bW4gdmFsdWUgZm9ybWF0dGVkIGFzIHJfY1xyXG4gICAgICAgICAgICBjZWxsLmlkID0gciArICdfJyArIGM7XHJcbiAgICAgICAgICAgIC8vIFNldCB1cCBkcmFnIGFuZCBkcm9wIGZvciBlYWNoIGNlbGwuXHJcbiAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCd0cnVlJyk7XHJcblxyXG5cclxuICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLChcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGV2KXtcclxuICAgICAgICAgICAgICAgICAgICBldi5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZD0nbW92ZSc7XHJcblx0XHQgICAgbGV0IHR5cGUgPSBmbGVldC5jaGVja0dyaWQodGhpcy5pZCk7XHJcblx0XHQgICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgd2hpY2ggc3F1YXJlIHdhcyBjbGlja2VkIHRvIGd1aWRlIHBsYWNlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGFydF9jb29yZCA9IF9maW5kX3N0YXJ0KHRoaXMuaWQsIHNoaXAub3JpZW50YXRpb24sIHNoaXAuc2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXYuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcXVhcmUgOnN0YXJ0X2Nvb3JkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggIDpzaGlwLnNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlICAgOnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X2Nvb3JkOiBmbGVldC5naG9zdFNoaXAodHlwZSwgc3RhcnRfY29vcmQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIERyYWcvRHJvcCBjYXBhYmlsaXRpZXNcclxuICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywoXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihldil7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2Ryb3BwaW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRyb3BPYmogPSBKU09OLnBhcnNlKGV2LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9wbGFpblwiKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNoaXA9c2hpcHMuZ2V0U2hpcChkcm9wT2JqLnR5cGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihzaGlwcy52YWxpZGF0ZVNoaXAoZHJvcE9iai50eXBlLCBkcm9wT2JqLmN1cnJlbnRfY29vcmQpKSB7XHJcblx0XHRcdCAgICAvLyBSZW1vdmUgaW5pdGlhbCBpbWFnZVxyXG5cdFx0XHQgICAgX2Rpc3BsYXlTaGlwKHR5cGUsIGN1cnJlbnRfY29vcmQsIHNraXApO1xyXG5cclxuXHRcdFx0ICAgIGZsZWV0LnNldEZsZWV0IChmbGVldC5yZWFkTWFwKERyb3BPYmoudHlwZSksIERyb3BPYmoudHlwZSwgc2hpcC5zaXplLCBkcm9wT2JqLmN1cnJlbnRfY29vcmQpOyAvLyAob3JpZW50YXRpb24sIHR5cGUsIHNpemUsIHN0YXJ0X2Nvb3JkKVxyXG5cclxuXHRcdFx0ICAgIC8vIFJlZHJhdyBpbWFnZSBpbiBuZXcgbG9jYXRpb25cclxuXHRcdFx0ICAgIF9kaXNwbGF5U2hpcCh0eXBlLCBjdXJyZW50X2Nvb3JkLCBza2lwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLChcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGV2KXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZHJhZ292ZXInKTtcclxuICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0PSdtb3ZlJztcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKSk7XHJcblxyXG4gICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGZ1bmN0aW9uKGUpe1xyXG5cdFx0bGV0IHR5cGUgPSBmbGVldC5jaGVja0dyaWQodGhpcy5pZCk7XHJcblx0XHRsZXQgdGhpc1NoaXAgPSBmbGVldC5jaGVja0dyaWQodHlwZSk7XHJcblx0XHRsZXQgc2hpcCA9IHNoaXAuZ2V0U2hpcCh0eXBlKTtcclxuXHRcdGxldCBvcmllbnRhdGlvbiA9ICh0aGlzU2hpcC5vcmllbnRhdGlvbiA9PSAneCcpID8gJ3knOid4JztcclxuXHRcdGxldCBnaG9zdCA9IGZsZWV0Lmdob3N0U2hpcCgndHlwZScsIF9maW5kX3N0YXJ0KHRoaXMuaWQsIG9yaWVudGF0aW9uLCBzaGlwLnNpemUgKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNoaXBzLnZhbGlkYXRlU2hpcCh0eXBlLCBnaG9zdCkpIHtcclxuXHRcdCAgICAvLyBSZW1vdmUgaW5pdGlhbCBpbWFnZVxyXG5cdFx0ICAgIF9kaXNwbGF5U2hpcCh0eXBlLCBjdXJyZW50X2Nvb3JkLCBza2lwKTtcclxuXHJcblx0XHQgICAgZmxlZXQuc2V0RmxlZXQgKGZsZWV0LnJlYWRNYXAoRHJvcE9iai50eXBlKSwgRHJvcE9iai50eXBlLCBzaGlwLnNpemUsIGRyb3BPYmouY3VycmVudF9jb29yZCk7XHJcblxyXG5cdFx0ICAgIC8vIFJlZHJhdyBpbWFnZSBpbiBuZXcgbG9jYXRpb25cclxuXHRcdCAgICBfZGlzcGxheVNoaXAodHlwZSwgY3VycmVudF9jb29yZCwgc2tpcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBncmlkO1xyXG59XHJcblxyXG4vKlxyXG4gKiBfZmluZF9zdGFydCAtIERldGVybWluZSB0aGUgc3RhcnRpbmcgY29vcmRpbmF0ZSBvZiBhIHNoaXAgZ2l2ZW4gdGhlIHNxdWFyZSB0aGF0IHdhcyBjbGlja2VkLiBGb3IgZXhhbXBsZVxyXG4gKiBpdCBpcyBwb3NzaWJsZSB0aGF0IGEgYmF0dGxlc2hpcCBhbG9uZyB0aGUgeC1heGlzIHdhcyBjbGlja2VkIGF0IGxvY2F0aW9uIDNfMyBidXQgdGhhdCB3YXMgdGhlIHNlY29uZCBzcXVhcmVcclxuICogb24gdGhlIHNoaXAuIFRoaXMgZnVuY3Rpb24gd2lsbCBpZGVudGlmeSB0aGF0IHRoZSBiYXR0bGVzaGlwIHN0YXJ0cyBhdCAyXzMuXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gX2ZpbmRfc3RhcnQoc3RhcnRfcG9zLCBvcmllbnRhdGlvbiwgc2l6ZSl7XHJcbiAgICBsZXQgdHlwZSA9IGZsZWV0LmNoZWNrR3JpZCh0aGlzLmlkKTtcclxuICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuICAgIGxldCBpbmRleCA9IChvcmllbnRhdGlvbiA9PSAneCcpID8gMCA6IDE7XHJcblxyXG4gICAgbGV0IHBpZWNlcz1zdGFydF9wb3Muc3BsaXQoJ18nKTtcclxuXHJcbiAgICBmb3IgKGxldCBpPTA7IGkgPCBzaXplOyBpKyspIHtcclxuXHRsZXQgZyA9IGZsZWV0LmNoZWNrR3JpZChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xyXG4gICAgICAgIGlmIChnICE9IHVuZGVmaW5lZCAmJiBnID09IHR5cGUpe1xyXG4gICAgICAgICAgICBwaWVjZXNbaW5kZXhdKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0ID0gc3RhcnRfcG9zLnNwbGl0KCdfJyk7XHJcbiAgICBzdGFydFtpbmRleF0gPSBzdGFydFtpbmRleF0gLSAoc2l6ZSAtIGkpO1xyXG4gICAgcmV0dXJuIHN0YXJ0WzBdICsgJ18nICsgc3RhcnRbMV07XHJcbn1cclxuXHJcbmxldCBkaXNwbGF5U2hpcCA9IGZ1bmN0aW9uIChzaGlwcywgdHlwZSkge1xyXG4gICAgbGV0IGNvb3JkaW5hdGVzID0gZmxlZXQuZ2V0RmxlZXQodHlwZSk7XHJcbiAgICBsZXQgc2hpcCA9IHNoaXBzLmdldFNoaXAodHlwZSk7XHJcblxyXG4gICAgZm9yIChjb29yZCBpbiBjb29yZGluYXRlcykge1xyXG4gICAgICAgIF9zZXRTcGFjZShjb29yZGluYXRlc1tjb29yZF0sIHNoaXAuY2xpY2tDbGFzcyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9zZXRTcGFjZShzcGFjZSwgY2xhc3NOYW1lKSB7XHJcbiAgICB2YXIgYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNwYWNlKTsgXHJcbiAgICAvL2IudG9nZ2xlKGNsYXNzTmFtZSk7XHJcbiAgICBiLmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgY2xpY2thYmxlR3JpZDogY2xpY2thYmxlR3JpZCxcclxuICAgIGRpc3BsYXlTaGlwOiBkaXNwbGF5U2hpcFxyXG59XHJcblxyXG4iLCIvL2xldCByYWJiaXQgPSByZXF1aXJlKCcuL2JzX1JhYmJpdE1RJyk7XG5sZXQgZmxlZXQgPSByZXF1aXJlKCcuL2ZsZWV0LmpzJyk7XG5cbmxldCBwbGF5ZXJSb3N0ZXIgPSBuZXcgT2JqZWN0OyAvLyBQbGFjZWhvbGRlciBmb3IgYWxsIHBsYXllcnMgaW4gdGhlIGdhbWVcbmxldCBwbGF5ZXJPcmRlciA9IFtdOyAvLyBPcmRlciBvZiBwbGF5ZXIgdHVyblxuXG5sZXQgbWU7XG5sZXQgb3JkZXJJbmRleD0wO1xuXG4vLyBSZWdpc3RlciBoYW5kbGVcbmxldCByZWdpc3RlciA9IGZ1bmN0aW9uKGhhbmRsZSl7XG5cdG1lID0gaGFuZGxlOyAvLyBTZWxmIGlkZW50aWZ5IHRoaW5lc2VsZlxuXHQvLyBUT0RPIC0gY2FsbCBvdXQgdG8gdGhlIHJlZ2lzdHJhdGlvbiBzZXJ2aWNlIGFuZCBnZXQgYmFjayBoYW5kbGUgYW5kIHR1cm4gb3JkZXIuIFRoaXNcblx0Ly8gc3RydWN0dXJlIHJlcHJlc2VudHMgdGhlIHJldHVybiBjYWxsIGZyb20gdGhlIHJlZ2lzdHJhdGlvbiBzZXJ2aWNlLlxuXHRjb25zdCByZWcgPSB7XG5cdFx0ICAgICAgaGFuZGxlOiAnZWxzcG9ya28nLFxuXHRcdCAgICAgIG9yZGVyOiAwXG5cdH07XG5cblx0Ly9fcG9wdWxhdGVfcGxheWVyT3JkZXIoJ2Vsc3BvcmtvJywgMCk7XG5cdHBsYXllck9yZGVyW3JlZy5vcmRlcl0gPSByZWcuaGFuZGxlO1xufVxuXG4vKlxuICogIE9uZSBjb25zaWRlcmF0aW9uIGlzIGZvciB0aGUgcmVnaXN0cmF0aW9uIHNlcnZpY2UgdG8gcHJvdmlkZSBhIHJhbmRvbSBudW1iZXIgZm9yIG9yZGVyIHZhbHVlIHNvIHRoYXQgcGxheWVyIG9yZGVyIGlzIG5vdFxuICogIG5lY2Vzc2FyaWx5IEZJRk8uIEFsc28gdGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgcGxheWVyIG9yZGVyIHZhbHVlcyB3aWxsIGFycml2ZSBpbiBjb25zZWN1dGl2ZSBvcmRlciBzbyB0aGVyZSBuZWVkcyB0b1xuICogIGJlIGEgc29ydCBtZWNoYW5pc20uXG4gKi9cbmxldCBfcG9wdWxhdGVfcGxheWVyT3JkZXIgPSBmdW5jdGlvbihoYW5kbGUsIG9yZGVyKXtcbn1cblxuLy9BY2NlcHQgcmVnaXN0cmF0aW9uIGZyb20gb3RoZXIgcGxheWVyc1xubGV0IGFjY2VwdFJlZyA9IGZ1bmN0aW9uKGhhbmRsZSwgb3JkZXIpe1xuXHRwbGF5ZXJPcmRlcltvcmRlcl0gPSBoYW5kbGU7XG5cdHBsYXllclJvc3RlciA9IHtcblx0XHRbaGFuZGxlXToge2dyaWQ6IGZsZWV0LmJ1aWxkTmF1dGljYWxDaGFydH1cblx0fVxufVxuXG5sZXQgbXlUdXJuID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiAoY3VycmVudFBsYXllcigpID09IG1lKSA/IDEgOiAwO1xufVxuXG5sZXQgbmV4dFBsYXllciA9IGZ1bmN0aW9uKCkge1xuXHRvcmRlckluZGV4ID0gKG9yZGVySW5kZXggPT0gcGxheWVyT3JkZXIubGVuZ3RoIC0gMSkgPyAgMCA6IG9yZGVySW5kZXgrMTtcblx0cmV0dXJuO1xufVxuXG5sZXQgY3VycmVudFBsYXllciA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBwbGF5ZXJPcmRlcltvcmRlckluZGV4XTtcbn1cblxubGV0IHBsYXllck1vdmUgPSBmdW5jdGlvbigpe1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZWdpc3RlcjogcmVnaXN0ZXIsXG4gICAgYWNjZXB0UmVnOiBhY2NlcHRSZWcsXG4gICAgbXlUdXJuOiBteVR1cm4sXG4gICAgY3VycmVudFBsYXllcjogY3VycmVudFBsYXllcixcbiAgICBuZXh0UGxheWVyOiBuZXh0UGxheWVyXG59XG4iLCJ2YXIgZmxlZXQ9cmVxdWlyZSgnLi9mbGVldC5qcycpO1xyXG5cclxuLy8gQ29uZmlnIHNldHRpbmdzIFxyXG5sZXQgc2hpcF9jb25maWcgPSB7XHJcbiAgICBhaXJjcmFmdENhcnJpZXIgOiB7XHJcbiAgICAgICAgc2l6ZSA6IDUsXHJcbiAgICAgICAgaWQgOiAnYWlyY3JhZnRDYXJyaWVyJyxcclxuICAgICAgICBjb2xvciA6ICdDcmltc29uJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ2FjY2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnQWlyY3JhZnQgQ2FycmllcicsXHJcbiAgICB9LFxyXG4gICAgYmF0dGxlc2hpcCA6IHtcclxuICAgICAgICBzaXplIDogNCxcclxuICAgICAgICBpZCA6ICdiYXR0bGVzaGlwJyxcclxuICAgICAgICBjb2xvcjonRGFya0dyZWVuJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ2JzY2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnQmF0dGxlc2hpcCcsXHJcbiAgICB9LFxyXG4gICAgZGVzdHJveWVyIDoge1xyXG4gICAgICAgIHNpemUgOiAzLFxyXG4gICAgICAgIGlkIDogJ2Rlc3Ryb3llcicsXHJcbiAgICAgICAgY29sb3I6J0NhZGV0Qmx1ZScsXHJcbiAgICAgICAgY2xpY2tDbGFzcyA6ICdkZWNsaWNrZWQnLFxyXG4gICAgICAgIGxhYmVsIDogJ0Rlc3Ryb3llcicsXHJcbiAgICB9LFxyXG4gICAgc3VibWFyaW5lICA6IHtcclxuICAgICAgICBzaXplIDogMyxcclxuICAgICAgICBpZCA6ICdzdWJtYXJpbmUnLFxyXG4gICAgICAgIGNvbG9yOidEYXJrUmVkJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ3N1Y2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnU3VibWFyaW5lJyxcclxuICAgIH0sXHJcbiAgICBwYXRyb2xCb2F0IDoge1xyXG4gICAgICAgIHNpemUgOiAyLFxyXG4gICAgICAgIGlkIDogJ3BhdHJvbEJvYXQnLFxyXG4gICAgICAgIGNvbG9yOidHb2xkJyxcclxuICAgICAgICBjbGlja0NsYXNzIDogJ3BiY2xpY2tlZCcsXHJcbiAgICAgICAgbGFiZWwgOiAnUGF0cm9sIEJvYXQnLFxyXG4gICAgfSxcclxufTtcclxuXHJcbi8vIFNoaXAgY29uc3RydWN0b3IgLSBzaGlweWFyZD8/P1xyXG5mdW5jdGlvbiBfc2hpcChzaXplLCBpZCwgY29sb3IsIGNsaWNrQ2xhc3MsIGxhYmVsKSB7XHJcbiAgICAgICAgdGhpcy5zaXplICAgICAgICA9IHNpemU7XHJcbiAgICAgICAgdGhpcy5pZCAgICAgICAgICA9IGlkO1xyXG4gICAgICAgIHRoaXMuY29sb3IgICAgICAgPSBjb2xvcjtcclxuICAgICAgICB0aGlzLmNsaWNrQ2xhc3MgID0gY2xpY2tDbGFzcztcclxuICAgICAgICB0aGlzLmxhYmVsICAgICAgID0gbGFiZWw7XHJcblxyXG4gICAgICAgIHJldHVybiAodGhpcyk7XHJcbn1cclxuXHJcbmxldCBzaGlwcz17fTtcclxuXHJcbi8qXHJcbiAqIFRoZSBzaGlwIG9iamVjdCBob2xkcyB0aGUgY3VycmVudCBvcmllbnRhdGlvbiBvZiB0aGUgc2hpcCBhbmQgdGhlIHN0YXJ0IGNvb3JkaW5hdGUgKHRvcG1vc3QvbGVmdG1vc3QpLiBXaGVuXHJcbiAqIHRoZXJlIGlzIGEgY2hhbmdlIHRvIHRoZSBzaGlwIHRoZSBtYXN0ZXIgbWF0cml4IG5lZWRzIHRvIGJlIHVwZGF0ZWQuIEFuIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdoZW4gdGhlcmUgaXNcclxuICogYSBjb29yZGluYXRlIGNoYW5nZS4gVGhpcyBsaXN0ZW5lciB3aWxsIHVwZGF0ZSB0aGUgbWFzdGVyIG1hdHJpeC4gQ2FsbHMgdG8gY2hlY2sgbG9jYXRpb24gKG1vdmUgdmFsaWR0aW9uLCBcclxuICogY2hlY2sgaWYgaGl0LCBldGMuKSB3aWxsIGJlIG1hZGUgYWdhaW5zdCB0aGUgbWFzdGVyIG1hdHJpeC5cclxuICovXHJcbi8qXHJcbmxldCBzaGlwSWludCA9IGZ1bmN0aW9uKCl7XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKCdzaGlwTW92ZScsKCkpIH1cclxuXHJcbn1cclxuKi9cclxuLy8gUHVibGljIGZ1bmN0aW9uIHRvIGluaXRpYWxseSBjcmVhdGUgc2hpcHMgb2JqZWN0XHJcbmxldCBidWlsZFNoaXBzID0gZnVuY3Rpb24gKCl7XHJcbiAgICBmb3IgKGxldCBzIGluIHNoaXBfY29uZmlnKXtcclxuICAgICAgICBzaGlwc1tzXSA9IHtzaXplOiBzaGlwX2NvbmZpZ1tzXS5zaXplLCBcclxuXHRcdCAgICB0eXBlOiBzaGlwX2NvbmZpZ1tzXS5pZCxcclxuXHQgICAgICAgICAgICBjb2xvcjogc2hpcF9jb25maWdbc10uY29sb3IsXHJcblx0XHQgICAgY2xpY2tDbGFzczogc2hpcF9jb25maWdbc10uY2xpY2tDbGFzcyxcclxuXHRcdCAgICBsYWJlbDogc2hpcF9jb25maWdbc10ubGFiZWxcclxuXHQgICAgICAgICAgIH07XHJcbiAgICB9XHJcbnJldHVybiBzaGlwcztcclxufVxyXG5cclxubGV0IGJ1aWxkU2hpcCA9IGZ1bmN0aW9uKHR5cGUpe1xyXG4gICAgICAgIHNoaXBzW3R5cGVdID0gX3NoaXAoc2hpcF9jb25maWdbdHlwZV0uc2l6ZSwgc2hpcF9jb25maWdbdHlwZV0uaWQsIHNoaXBfY29uZmlnW3R5cGVdLmNvbG9yLCBzaGlwX2NvbmZpZ1t0eXBlXS5jbGlja0NsYXNzLCBzaGlwX2NvbmZpZ1t0eXBlXS5sYWJlbCk7XHJcblx0cmV0dXJuIHNoaXBzO1xyXG59XHJcblxyXG4vLyBTZXQgdmFsdWUgaW4gc2hpcCBvYmplY3QuIFxyXG5sZXQgc2V0U2hpcCA9IGZ1bmN0aW9uKHR5cGUsIGtleSwgdmFsdWUpe1xyXG4gICAgICAgIGlmICh0eXBlICYmIHNoaXBzW3R5cGVdICYmIGtleSkgeyAvLyBvbmx5IGF0dGVtcHQgYW4gdXBkYXRlIGlmIHRoZXJlIGlzIGEgbGVnaXQgc2hpcCB0eXBlIGFuZCBhIGtleVxyXG4gICAgICAgICAgICBzaGlwc1t0eXBlXS5rZXkgPSB2YWx1ZTtcclxuICAgfVxyXG59XHJcblxyXG4vLyBSZXR1cm4gc2hpcCBvYmplY3QgaWYgbm8gdHlwZSBnaXZlbiBvdGhlcndpc2UgcmV0dXJuIG9iamVjdCBjb250YWluaW5nIGp1c3QgcmVxdWVzdGVkIHNoaXBcclxubGV0IGdldFNoaXAgPSBmdW5jdGlvbiAodHlwZSl7XHJcbiAgICBpZih0eXBlKXtcclxuICAgICAgICByZXR1cm4gc2hpcHNbdHlwZV07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBzaGlwcztcclxuICAgIH1cclxufVxyXG5cclxuLy8gUHJpdmF0ZSBmdW5jdGlvbiB0byByYW5kb21seSBkZXRlcm1pbmUgc2hpcCdzIG9yaWVudGF0aW9uIGFsb25nIHRoZSBYLWF4aXMgb3IgWS1heGlzLiBPbmx5IHVzZWQgd2hlbiBwbG90dGluZyBzaGlwcyBmb3IgdGhlIGZpcnN0IHRpbWUuXHJcbmZ1bmN0aW9uIF9nZXRTdGFydENvb3JkaW5hdGUoc2l6ZSl7XHJcbiAgICBjb25zdCBzdGFydF9vcmllbnRhdGlvbj1NYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTApID4gNSA/ICd4JyA6ICd5JztcclxuICAgIGNvbnN0IHN0YXJ0X3ggPSBzdGFydF9vcmllbnRhdGlvbiA9PSAneCcgPyBfZ2V0UmFuZG9tQ29vcmRpbmF0ZShzaXplKSA6IF9nZXRSYW5kb21Db29yZGluYXRlKDApO1xyXG4gICAgY29uc3Qgc3RhcnRfeSA9IHN0YXJ0X29yaWVudGF0aW9uID09ICd5JyA/IF9nZXRSYW5kb21Db29yZGluYXRlKHNpemUpIDogX2dldFJhbmRvbUNvb3JkaW5hdGUoMCk7XHJcblxyXG4gICAgcmV0dXJuIHtjb29yZGluYXRlOiBzdGFydF94ICsgJ18nICsgc3RhcnRfeSwgb3JpZW50YXRpb246IHN0YXJ0X29yaWVudGF0aW9ufTtcclxufVxyXG5cclxuLy8gVGFrZSBzaGlwIHNpemUgYW5kIG9yaWVudGF0aW9uIGludG8gYWNjb3VudCB3aGVuIGRldGVybWluaW5nIHRoZSBzdGFydCByYW5nZSB2YWx1ZS4gZXguIGRvbid0XHJcbi8vIGxldCBhbiBhaXJjcmFmdCBjYXJyaWVyIHdpdGggYW4gb3JpZW50YXRpb24gb2YgJ1gnIHN0YXJ0IGF0IHJvdyA3IGJlY2F1c2UgaXQgd2lsbCBtYXggb3V0IG92ZXIgdGhlXHJcbi8vIGdyaWQgc2l6ZS5cclxuZnVuY3Rpb24gX2dldFJhbmRvbUNvb3JkaW5hdGUob2Zmc2V0KXtcclxuICAgIGNvbnN0IE1BWF9DT09SRCA9IDEwO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSooTUFYX0NPT1JEIC0gb2Zmc2V0KSk7XHJcblxyXG59XHJcblxyXG4vLyBGSVhNRSBEb2VzIGZsZWV0Lmdob3N0U2hpcCBkbyB0aGlzIG5vdz9cclxuLy8gQnVpbGQgYW4gYXJyYXkgb2YgY29vcmRpbmF0ZXMgZm9yIGEgc2hpcCBiYXNlZCBvbiBpdCdzIG9yaWVudGF0aW9uLCBpbnRlbmRlZCBzdGFydCBwb2ludCBhbmQgc2l6ZVxyXG5sZXQgX3NoaXBTdHJpbmcgPSBmdW5jdGlvbihzKSB7XHJcblx0Y29uc3QgbyA9IHMub3JpZW50YXRpb247XHJcblx0Y29uc3Qgc3QgPSBzLnN0YXJ0X2Nvb3JkaW5hdGU7XHJcblx0bGV0IHIgPSBuZXcgQXJyYXk7XHJcbiAgICAgICAgbGV0IHRfcGllY2VzID0gc3Quc3BsaXQoJ18nKTtcclxuXHRjb25zdCBpID0gbyA9PSAneCcgPyAwIDogMTtcclxuXHJcblx0Zm9yIChsZXQgaj0wOyBqIDwgcy5zaXplO2orKykge1xyXG5cdFx0dF9waWVjZXNbaV0gPSB0X3BpZWNlc1tpXSsxO1xyXG5cdFx0ci5wdXNoICh0X3BpZWNlc1swXSArICdfJyArIHRfcGllY2VzWzFdKTtcclxuXHR9XHJcblx0cmV0dXJuIHI7XHJcbn1cclxuXHJcblxyXG4vKlxyXG4gKiBwbGFjZVNoaXBzIC0gSW5pdGlhbCBwbGFjZW1lbnQgb2Ygc2hpcHMgb24gdGhlIGJvYXJkXHJcbiAqL1xyXG5sZXQgcGxhY2VTaGlwcyA9IGZ1bmN0aW9uIHBsYWNlU2hpcHMoZmxlZXQpe1xyXG4gICAgICAgIC8qIFJhbmRvbWx5IHBsYWNlIHNoaXBzIG9uIHRoZSBncmlkLiBJbiBvcmRlciBkbyB0aGlzIGVhY2ggc2hpcCBtdXN0OlxyXG5cdCAqICAgKiBQaWNrIGFuIG9yaWVudGF0aW9uXHJcblx0ICogICAqIFBpY2sgYSBzdGFydGluZyBjb29yZGluYXRlXHJcblx0ICogICAqIFZhbGlkYXRlIHRoYXQgdGhlIGNvb3JkaW5hdGUgaXMgdmFsaWQgKGRvZXMgbm90IHJ1biBPT0IsIGRvZXMgbm90IGNyb3NzIGFueSBvdGhlciBzaGlwLCBldGMuKVxyXG5cdCAqICAgKiBJZiB2YWxpZDpcclxuXHQgKiAgIFx0KiBTYXZlIHN0YXJ0IGNvb3JkIGFuZCBvcmllbnRhdGlvbiBhcyBwYXJ0IG9mIHNoaXAgb2JqZWN0XHJcblx0ICogICBcdCogUGxvdCBzaGlwIG9uIG1hc3RlciBtYXRyaXhcclxuXHQgKi9cclxuXHRsZXQgc2hpcExpc3QgPSBnZXRTaGlwKCk7XHJcbiAgICAgICAgZm9yICh2YXIgc2hpcCBpbiBzaGlwTGlzdCkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gX2dldFN0YXJ0Q29vcmRpbmF0ZShzaGlwTGlzdFtzaGlwXS5zaXplKTsgXHJcblx0ICAgIGxldCBzaGlwX3N0cmluZyA9IGZsZWV0Lmdob3N0U2hpcChzaGlwTGlzdFtzaGlwXS50eXBlLCBzdGFydC5jb29yZGluYXRlLCBzdGFydC5vcmllbnRhdGlvbik7XHJcblx0ICAgIHNoaXBMaXN0W3NoaXBdLm9yaWVudGF0aW9uID0gc3RhcnQub3JpZW50YXRpb247XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoIWZsZWV0LnZhbGlkYXRlU2hpcChzaGlwX3N0cmluZykpIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0ID0gX2dldFN0YXJ0Q29vcmRpbmF0ZShzaGlwTGlzdFtzaGlwXS5zaXplKTsgXHJcblx0XHRzaGlwTGlzdFtzaGlwXS5vcmllbnRhdGlvbiA9IHN0YXJ0Lm9yaWVudGF0aW9uO1xyXG5cdFx0c2hpcF9zdHJpbmcgPSBmbGVldC5naG9zdFNoaXAoc2hpcExpc3Rbc2hpcF0udHlwZSwgc3RhcnQuY29vcmRpbmF0ZSwgc3RhcnQub3JpZW50YXRpb24pO1xyXG5cdFx0fVxyXG5cclxuICAgICAgICAgICAgZmxlZXQuc2V0RmxlZXQoc3RhcnQub3JpZW50YXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgc2hpcExpc3Rbc2hpcF0udHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICBzaGlwTGlzdFtzaGlwXS5zaXplLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0LmNvb3JkaW5hdGUpO1xyXG4gICAgICAgICAgICB9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBidWlsZFNoaXBzOiBidWlsZFNoaXBzLFxyXG4gICAgYnVpbGRTaGlwOiBidWlsZFNoaXAsXHJcbiAgICBnZXRTaGlwOiBnZXRTaGlwLFxyXG4gICAgc2V0U2hpcDogc2V0U2hpcCxcclxuICAgIHBsYWNlU2hpcHM6IHBsYWNlU2hpcHNcclxufVxyXG4iXX0=
