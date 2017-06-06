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
let clickableGrid = function ( rows, cols, ships, fleet){
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
    }
    return grid;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJhdHRsZXNoaXAuanMiLCJjb25maWcuanMiLCJmbGVldC5qcyIsImdyaWQuanMiLCJwbGF5ZXIuanMiLCJzaGlwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgZ3JpZCA9IHJlcXVpcmUoJy4vZ3JpZC5qcycpO1xyXG52YXIgcGxheWVyID0gcmVxdWlyZSgnLi9wbGF5ZXIuanMnKTtcclxudmFyIHNoaXBzID0gcmVxdWlyZSgnLi9zaGlwcy5qcycpO1xyXG52YXIgZmxlZXQgPSByZXF1aXJlKCcuL2ZsZWV0LmpzJyk7XHJcbnZhciBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qcycpO1xyXG5cclxuLyogUmVnaXN0ZXIgKi9cclxucGxheWVyLnJlZ2lzdGVyKCdlbHNwb3JrbycpO1xyXG5cclxuLy8gU2V0IHVwIGdyaWRcclxuLy9sZXQgZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdteUdyaWQnKTtcclxuLy9nLmFwcGVuZENoaWxkKGdyaWQuY2xpY2thYmxlR3JpZCgxMCwgMTApKTtcclxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChncmlkLmNsaWNrYWJsZUdyaWQoMTAsIDEwLCBzaGlwcywgZmxlZXQpKTtcclxuXHJcblxyXG4vKiBTZXQgcmFuZG9tIGZsZWV0ICovXHJcbnNoaXBzLmJ1aWxkU2hpcHMoKTtcclxuc2hpcHMucGxhY2VTaGlwcyhmbGVldCk7XHJcbmxldCB3aG9sZUZsZWV0ID0gZmxlZXQuZ2V0V2hvbGVGbGVldChmbGVldCk7XHJcbmZvciAodCBpbiB3aG9sZUZsZWV0KSB7XHJcblx0Z3JpZC5kaXNwbGF5U2hpcChzaGlwcywgdCk7XHJcbn1cclxuXHJcbi8qIFNldCBjb25maXJtIGZsZWV0ICovXHJcblxyXG4vKiBQbGF5IGdhbWUgKi9cclxuLypcclxud2hpbGUgKDEpIHtcclxuXHRwbGF5ZXIuZ2V0VHVybigpO1xyXG59XHJcbiovXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29uZmlnIChjb25maWcpe1xyXG4gICAgc2hpcHMgPSB7XHJcbiAgICAgICAgYWlyY3JhZnRDYXJyaWVyIDoge1xyXG4gICAgICAgICAgICBzaXplIDogNSxcclxuICAgICAgICAgICAgaWQgOiAnYWlyY3JhZnRDYXJyaWVyJyxcclxuICAgICAgICAgICAgY29sb3IgOiAnQ3JpbXNvbicsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnYWNjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnQWlyY3JhZnQgQ2FycmllcicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBiYXR0bGVzaGlwIDoge1xyXG4gICAgICAgICAgICBzaXplIDogNCxcclxuICAgICAgICAgICAgaWQgOiAnYmF0dGxlc2hpcCcsXHJcbiAgICAgICAgICAgIGNvbG9yOidEYXJrR3JlZW4nLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ2JzY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ0JhdHRsZXNoaXAnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzdHJveWVyIDoge1xyXG4gICAgICAgICAgICBzaXplIDogMyxcclxuICAgICAgICAgICAgaWQgOiAnZGVzdHJveWVyJyxcclxuICAgICAgICAgICAgY29sb3I6J0NhZGV0Qmx1ZScsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnZGVjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnRGVzdHJveWVyJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1hcmluZSAgOiB7XHJcbiAgICAgICAgICAgIHNpemUgOiAzLFxyXG4gICAgICAgICAgICBpZCA6ICdzdWJtYXJpbmUnLFxyXG4gICAgICAgICAgICBjb2xvcjonRGFya1JlZCcsXHJcbiAgICAgICAgICAgIGNsaWNrQ2xhc3MgOiAnc3VjbGlja2VkJyxcclxuICAgICAgICAgICAgbGFiZWwgOiAnU3VibWFyaW5lJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhdHJvbEJvYXQgOiB7XHJcbiAgICAgICAgICAgIHNpemUgOiAyLFxyXG4gICAgICAgICAgICBpZCA6ICdwYXRyb2xCb2F0JyxcclxuICAgICAgICAgICAgY29sb3I6J0dvbGQnLFxyXG4gICAgICAgICAgICBjbGlja0NsYXNzIDogJ3BiY2xpY2tlZCcsXHJcbiAgICAgICAgICAgIGxhYmVsIDogJ1BhdHJvbCBCb2F0JyxcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxufVxyXG4iLCJ2YXIgc2hpcHM9cmVxdWlyZSgnLi9zaGlwcy5qcycpO1xuXG5sZXQgbmF1dGljYWxNYXAgPSB7fTsgLy8gSGFzaCBsb29rdXAgdGhhdCB0cmFja3MgZWFjaCBzaGlwJ3Mgc3RhcnRpbmcgcG9pbnQgYW5kIGN1cnJlbnQgb3JpZW50YXRpb25cblxubGV0IGJ1aWxkTmF1dGljYWxDaGFydCA9IGZ1bmN0aW9uKCl7XG5cdGxldCBjaGFydCA9IG5ldyBBcnJheTtcblx0Zm9yKGxldCBpPTA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0Y2hhcnRbaV0gPSBuZXcgQXJyYXk7XG5cdFx0Zm9yIChsZXQgaj0wOyBqIDwgMTA7IGorKyl7XG5cdFx0XHRjaGFydFtpXVtqXSA9IHVuZGVmaW5lZDsvL25ldyBBcnJheTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGNoYXJ0O1xufVxuXG5sZXQgbmF1dGljYWxDaGFydCA9IGJ1aWxkTmF1dGljYWxDaGFydCgpOyAvLyBEZXRhaWxlZCBtYXRyaXggb2YgZXZlcnkgc2hpcCBpbiB0aGUgZmxlZXRcblxubGV0IGdldEZsZWV0ID0gZnVuY3Rpb24odHlwZSl7XG5cdGxldCBvcmllbnRhdGlvbiA9IG5hdXRpY2FsTWFwW3R5cGVdLm9yaWVudGF0aW9uID09ICd4JyA/IDAgOiAxO1xuXG5cdGxldCBwaWVjZXMgPSBuYXV0aWNhbE1hcFt0eXBlXS5zdGFydF9jb29yZC5zcGxpdCgnXycpO1xuXHRsZXQgcmV0ID0gbmV3IEFycmF5O1xuXG5cdHdoaWxlIChuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gPT0gdHlwZSkge1xuXHRcdHJldC5wdXNoIChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xuXHRcdHBpZWNlc1tvcmllbnRhdGlvbl0gPSBwYXJzZUludChwaWVjZXNbb3JpZW50YXRpb25dLCAxMCkgKyAxO1xuXHR9XG5cblx0cmV0dXJuIChyZXQpO1xufVxuXG5sZXQgZ2V0V2hvbGVGbGVldCA9IGZ1bmN0aW9uKCl7XG5cdGxldCByZXQ9e307XG5cdGZvciAodCBpbiBuYXV0aWNhbE1hcCkge1xuXHRcdHJldFt0XSA9IGdldEZsZWV0KHQpO1xuXHR9XG5cdHJldHVybiByZXQ7XG59XG5cbi8vIFRPRE8gLSBzZXRGbGVldDogUmVtb3ZlIHByZXZpb3VzIHNoaXAgZnJvbSBjaGFydCAtLSBtYXkgYmUgZG9uZS4uLm5lZWRzIHRlc3Rcbi8qXG4gKiBzZXRGbGVldCAtIHBsYWNlIHNoaXAgb24gbmF1dGljYWwgY2hhcnRcbiAqL1xubGV0IHNldEZsZWV0ID0gZnVuY3Rpb24gKG9yaWVudGF0aW9uLCB0eXBlLCBzaXplLCBzdGFydF9jb29yZCwgb2Zmc2V0KXtcbiAgICBsZXQgcGllY2VzID0gc3RhcnRfY29vcmQuc3BsaXQoJ18nKTtcbiAgICBsZXQgaW5kZXggPSAob3JpZW50YXRpb24gPT0gJ3gnKSA/IDAgOiAxO1xuXG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XG5cbiAgICAvLyBBZGp1c3QgZm9yIGRyYWcvZHJvcCB3aGVuIHBsYXllciBwaWNrcyBhIHNoaXAgcGllY2Ugb3RoZXIgdGhhbiB0aGUgaGVhZC5cbiAgICBwaWVjZXNbaW5kZXhdID0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApIC0gb2Zmc2V0O1xuXG4gICAgLypcbiAgICAgKiBSZW1vdmUgb2xkIHNoaXAgZnJvbSBuYXV0aWNhbENoYXJ0L01hcFxuICAgICAqL1xuICAgIF9jbGVhclNoaXAodHlwZSwgc2l6ZSk7XG5cbiAgICAvLyBzZXQgdGhlIG5hdXRpY2FsIG1hcCB2YWx1ZSBmb3IgdGhpcyBib2F0XG4gICAgbmF1dGljYWxNYXBbdHlwZV09e1xuXHQgICAgb3JpZW50YXRpb246IG9yaWVudGF0aW9uLFxuXHQgICAgc3RhcnRfY29vcmQ6IHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXVxuICAgIH07XG5cbiAgICBmb3IgKHZhciBpPTA7IGkgPCBzaXplOyBpKyspIHtcblx0bmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldID0gdHlwZTtcblx0cGllY2VzW2luZGV4XT0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApICsxO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX2NsZWFyU2hpcCh0eXBlLCBzaXplKXtcbiAgICBsZXQgbWFwID0gbmF1dGljYWxNYXBbdHlwZV07XG4gICAgaWYgKG1hcCA9PT0gdW5kZWZpbmVkKXtyZXR1cm4gZmFsc2U7fVxuXG4gICAgbGV0IHBpZWNlcyA9IG1hcC5zdGFydF9jb29yZC5zcGxpdCgnXycpO1xuICAgIGxldCBpbmRleCA9IChtYXAub3JpZW50YXRpb24gPT0gJ3gnKSA/IDAgOiAxO1xuXG4gICAgZm9yIChpPTA7IGkgPCBzaXplOyBpKyspIHtcblx0ICAgIG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXT11bmRlZmluZWQ7XG5cdCAgICBwaWVjZXNbaW5kZXhdKys7XG4gICAgfVxuXG4gICAgZGVsZXRlIG5hdXRpY2FsTWFwW3R5cGVdO1xuXG59XG5cbi8qXG4gKiBnaG9zdFNoaXAgLSBCZWZvcmUgcHV0dGluZyBhIHNoaXAgb24gdGhlIGNoYXJ0IGl0J3MgcG90ZW50aWFsIGxvY2F0aW9uIG5lZWRzIHRvIGJlIHBsb3R0ZWQgc28gaXQgY2FuIGJlXG4gKiBjaGVja2VkIGZvciB2YWxpZGl0eS4gR2l2ZW4gYSBzaGlwIHRoaXMgZnVuY3Rpb24gd2lsbCByZXR1cm4gdGhlIHBvdGVudGlhbCBwbG90dGVkIGNvb3JkaW5hdGVzLiBUaGUgZnVuY3Rpb25cbiAqIG1heSBidWlsZCBjb29yZGluYXRlcyBmb3IgYSBrbm93biBzaGlwIG9yIGZvciBvbmUgbW92ZWQgYXJvdW5kIG9uIHRoZSBncmlkLlxuICovXG5sZXQgZ2hvc3RTaGlwID0gZnVuY3Rpb24odHlwZSwgY29vcmRpbmF0ZSwgb3JpZW50YXRpb24sIHNpemUsIG9mZnNldCl7XG5cdGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcblx0bGV0IHRoaXNTaGlwID0gcmVhZE1hcCh0eXBlKTtcblx0bGV0IGdob3N0ID0gW107XG5cdGNvb3JkaW5hdGUgPSBjb29yZGluYXRlIHx8IHRoaXNTaGlwLnN0YXJ0X2Nvb3JkO1xuXHRvcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uIHx8IHRoaXNTaGlwLm9yaWVudGF0aW9uO1xuXHRzaXplID0gc2l6ZSB8fCBzaGlwLnNpemU7XG5cdG9mZnNldCA9IG9mZnNldCB8fCAwO1xuXG5cdGxldCBwaWVjZXMgPSBjb29yZGluYXRlLnNwbGl0KCdfJyk7XG5cdGxldCBpbmRleCA9IChvcmllbnRhdGlvbiA9PSAneCcpID8gMDogMTtcblx0cGllY2VzW2luZGV4XSA9IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSAtIG9mZnNldDtcblx0Zm9yIChsZXQgaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XG5cdFx0Z2hvc3QucHVzaChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xuXHRcdHBpZWNlc1tpbmRleF0gPSBwYXJzZUludChwaWVjZXNbaW5kZXhdLCAxMCkgKzE7XG5cdH1cblx0cmV0dXJuIGdob3N0O1xufTtcblxubGV0IHJlYWRNYXAgPSBmdW5jdGlvbih0eXBlKXtcblx0cmV0dXJuIG5hdXRpY2FsTWFwW3R5cGVdO1xufVxuXG4vKlxuICogR2l2ZW4gYSBjb29yZGluYXRlIG9yIGFuIGFycmF5IG9mIGNvb3JkaW5hdGVzIHJldHVybiB0aGUgc2FtZSBzdHJ1Y3R1cmUgcmV2ZWFsaW5nIHRoZSBjb250ZW50cyBvZiB0aGUgZ3JpZC5cbiAqIFdpbGwgcmV0dXJuIGEgdmFsdWUgb2YgZmFsc2UgaWYgdGhlcmUgaXMgYSBwcm9ibGVtIGNoZWNraW5nIHRoZSBncmlkIChleC4gY29vcmRzIGFyZSBvdXQgb2YgcmFuZ2UpLlxuICovXG5sZXQgY2hlY2tHcmlkID0gZnVuY3Rpb24oY29vcmRpbmF0ZXMpe1xuXHRpZiAoY29vcmRpbmF0ZXMgaW5zdGFuY2VvZiBBcnJheSl7XG5cdFx0bGV0IHJldCA9IG5ldyBBcnJheTtcblx0XHRmb3IoYyBpbiBjb29yZGluYXRlcyl7XG5cdFx0XHRsZXQgcyA9IF9zZXRDaGFydChjb29yZGluYXRlc1tjXSk7XG5cdFx0XHRpZiAocyA9PT0gZmFsc2UpIHtyZXR1cm4gZmFsc2V9O1xuXHRcdFx0cmV0LnB1c2ggKHMpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmV0O1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBfc2V0Q2hhcnQoY29vcmRpbmF0ZXMpO1xuXHR9XG59O1xuXG5sZXQgX3NldENoYXJ0ID0gZnVuY3Rpb24oY29vcmRpbmF0ZSl7XG5cdGxldCBwaWVjZXMgPSBjb29yZGluYXRlLnNwbGl0KCdfJyk7XG5cdGlmIChwYXJzZUludChwaWVjZXNbMF0sIDEwKSA+PSBuYXV0aWNhbENoYXJ0Lmxlbmd0aCB8fFxuXHQgICAgcGFyc2VJbnQocGllY2VzWzFdLCAxMCk+PSBuYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXS5sZW5ndGgpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4gbmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldO1xufTtcblxuLyogXG4gKiBHaXZlbiBhIGxpc3Qgb2YgY29vcmRpbmF0ZXMgYW5kIGEgc2hpcCB0eXBlIHZhbGlkYXRlIHRoYXQgdGhlIGNvb3JkaW5hdGVzIGRvIG5vdCB2aW9sYXRlIHRoZSBydWxlcyBvZjpcbiAqIFx0KiBzaGlwIG11c3QgYmUgb24gdGhlIGdyaWRcbiAqIFx0KiBzaGlwIG11c3Qgbm90IG9jY3VweSB0aGUgc2FtZSBzcXVhcmUgYXMgYW55IG90aGVyIHNoaXBcbiAqL1xubGV0IHZhbGlkYXRlU2hpcCA9IGZ1bmN0aW9uIChjb29yZGluYXRlcywgdHlwZSl7XG4gICAgLy8gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyBvdGhlciBib2F0cyBhbHJlYWR5IG9uIGFueSBhIHNwYWNlXG4gICAgZm9yICh2YXIgcD0wOyBwIDwgY29vcmRpbmF0ZXMubGVuZ3RoOyBwKyspIHtcblxuXHQvLyBJcyB0aGVyZSBhIGNvbGxpc2lvbj9cblx0bGV0IGdyaWQgPSBjaGVja0dyaWQoY29vcmRpbmF0ZXMpO1xuXHRcblx0aWYgKGdyaWQgPT0gZmFsc2UpIHtyZXR1cm4gZmFsc2V9OyAvLyBJZiBjaGVja0dyaWQgcmV0dXJucyBmYWxzZSBjb29yZGluYXRlcyBhcmUgb3V0IG9mIHJhbmdlXG5cblx0Zm9yIChjIGluIGNvb3JkaW5hdGVzKSB7XG5cdFx0bGV0IHBpZWNlcyA9IGNvb3JkaW5hdGVzW2NdLnNwbGl0KCdfJyk7XG5cdFx0aWYgKG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSAhPSB0eXBlICYmXG5cdFx0ICAgIG5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSAhPSB1bmRlZmluZWQpIHtyZXR1cm4gZmFsc2V9O1xuXHR9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0RmxlZXQ6IGdldEZsZWV0LFxuICAgIHNldEZsZWV0OiBzZXRGbGVldCxcbiAgICBnZXRXaG9sZUZsZWV0OiBnZXRXaG9sZUZsZWV0LFxuICAgIHZhbGlkYXRlU2hpcDogdmFsaWRhdGVTaGlwLFxuICAgIGNoZWNrR3JpZDogY2hlY2tHcmlkLFxuICAgIGJ1aWxkTmF1dGljYWxDaGFydDogYnVpbGROYXV0aWNhbENoYXJ0LFxuICAgIGdob3N0U2hpcDogZ2hvc3RTaGlwXG59XG4iLCJsZXQgZmxlZXQgPSByZXF1aXJlKCcuL2ZsZWV0Jyk7XHJcbmxldCBzaGlwcyA9IHJlcXVpcmUoJy4vc2hpcHMnKTtcclxuXHJcbi8qXHJcbiAqIEJ1aWxkIHRoZSBncmlkIGFuZCBhdHRhY2ggaGFuZGxlcnMgZm9yIGRyYWcvZHJvcCBldmVudHNcclxuICovXHJcbmxldCBjbGlja2FibGVHcmlkID0gZnVuY3Rpb24gKCByb3dzLCBjb2xzLCBzaGlwcywgZmxlZXQpe1xyXG4gICAgbGV0IGdyaWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xyXG4gICAgZ3JpZC5jbGFzc05hbWU9J2dyaWQnO1xyXG4gICAgZm9yICh2YXIgcj0wO3I8cm93czsrK3Ipe1xyXG4gICAgICAgIHZhciB0ciA9IGdyaWQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKSk7XHJcbiAgICAgICAgZm9yICh2YXIgYz0wO2M8Y29sczsrK2Mpe1xyXG4gICAgICAgICAgICB2YXIgY2VsbCA9IHRyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJykpO1xyXG4gICAgICAgICAgICAvLyBFYWNoIGNlbGwgb24gdGhlIGdyaWQgaXMgb2YgY2xhc3MgJ2NlbGwnXHJcbiAgICAgICAgICAgIGNlbGwuY2xhc3NOYW1lPSdjZWxsJztcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCB0aGUgSUQgdmFsdWUgb2YgZWFjaCBjZWxsIHRvIHRoZSByb3cvY29sdW1uIHZhbHVlIGZvcm1hdHRlZCBhcyByX2NcclxuICAgICAgICAgICAgY2VsbC5pZCA9IHIgKyAnXycgKyBjO1xyXG4gICAgICAgICAgICAvLyBTZXQgdXAgZHJhZyBhbmQgZHJvcCBmb3IgZWFjaCBjZWxsLlxyXG4gICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywndHJ1ZScpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywoXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihldil7XHJcbiAgICAgICAgICAgICAgICAgICAgZXYuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQ9J21vdmUnO1xyXG5cdFx0ICAgIGxldCB0eXBlID0gX2dldFR5cGVCeUNsYXNzKHNoaXBzLCB0aGlzLmNsYXNzTmFtZSk7XHJcblx0XHQgICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgd2hpY2ggc3F1YXJlIHdhcyBjbGlja2VkIHRvIGd1aWRlIHBsYWNlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdGFydCA9IF9maW5kX3N0YXJ0KHRoaXMuaWQsIHNoaXAub3JpZW50YXRpb24sIHNoaXAuc2l6ZSwgdHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXYuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6ICAgICAgICBzdGFydC5vZmZzZXQsXHJcblx0XHRcdFx0ICAgICAgICBzdGFydF9jb29yZDogICBzdGFydC5zdGFydF9jb29yZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiAgICAgICAgIHNoaXAuc2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICAgICAgICAgIHR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X2Nvb3JkOiBmbGVldC5naG9zdFNoaXAodHlwZSwgc3RhcnQuc3RhcnRfY29vcmQpLFxyXG5cdFx0XHRcdCAgICAgICAgb3JpZW50YXRpb246ICAgc2hpcC5vcmllbnRhdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIERyYWcvRHJvcCBjYXBhYmlsaXRpZXNcclxuICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywoXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihldil7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2Ryb3BwaW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRyb3BPYmogPSBKU09OLnBhcnNlKGV2LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9wbGFpblwiKSk7XHJcblx0XHQgICAgY29uc29sZS5sb2coJ2N1cnJlbnQgY29vcmQ6ICcsIGRyb3BPYmouY3VycmVudF9jb29yZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNoaXA9c2hpcHMuZ2V0U2hpcChkcm9wT2JqLnR5cGUpO1xyXG5cclxuXHRcdCAgICBsZXQgZHJvcFNoaXAgPSBmbGVldC5naG9zdFNoaXAoZHJvcE9iai50eXBlLCBldi50YXJnZXQuaWQsIGRyb3BPYmoub3JpZW50YXRpb24sIHNoaXAuc2l6ZSwgZHJvcE9iai5vZmZzZXQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihmbGVldC52YWxpZGF0ZVNoaXAoZHJvcFNoaXAsIGRyb3BPYmoudHlwZSkpIHtcclxuXHRcdFx0ICAgIC8vIFJlbW92ZSBpbml0aWFsIGltYWdlXHJcblx0XHRcdCAgICBkaXNwbGF5U2hpcChzaGlwcywgZHJvcE9iai50eXBlKTtcclxuXHJcblx0XHRcdCAgICBmbGVldC5zZXRGbGVldCAoZHJvcE9iai5vcmllbnRhdGlvbiwgZHJvcE9iai50eXBlLCBzaGlwLnNpemUsIGV2LnRhcmdldC5pZCwgZHJvcE9iai5vZmZzZXQpOyBcclxuXHJcblx0XHRcdCAgICAvLyBSZWRyYXcgaW1hZ2UgaW4gbmV3IGxvY2F0aW9uXHJcblx0XHRcdCAgICBkaXNwbGF5U2hpcChzaGlwcywgZHJvcE9iai50eXBlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLChcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGV2KXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZHJhZ292ZXInKTtcclxuICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0PSdtb3ZlJztcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKSk7XHJcblxyXG4gICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKFxyXG5cdFx0ZnVuY3Rpb24oZSl7XHJcblx0XHQgICAgbGV0IHR5cGUgPSBfZ2V0VHlwZUJ5Q2xhc3Moc2hpcHMsIHRoaXMuY2xhc3NOYW1lKTtcclxuXHRcdCAgICBsZXQgc2hpcCA9IHNoaXBzLmdldFNoaXAodHlwZSk7XHJcblx0XHQgICAgbGV0IG9yaWVudGF0aW9uID0gKHNoaXAub3JpZW50YXRpb24gPT0gJ3gnKSA/ICd5JzoneCc7IC8vIGZsaXAgdGhlIG9yaWVudGF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXJ0ID0gX2ZpbmRfc3RhcnQoZS50YXJnZXQuaWQsIG9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHR5cGUpO1xyXG5cdFx0ICAgIGxldCBnaG9zdCA9IGZsZWV0Lmdob3N0U2hpcCh0eXBlLCBlLnRhcmdldC5pZCwgb3JpZW50YXRpb24sIHNoaXAuc2l6ZSwgc3RhcnQub2Zmc2V0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZmxlZXQudmFsaWRhdGVTaGlwKGdob3N0LCB0eXBlKSkge1xyXG5cdFx0ICAgICAgICAvLyBSZW1vdmUgaW5pdGlhbCBpbWFnZVxyXG5cdFx0ICAgICAgICBkaXNwbGF5U2hpcChzaGlwcywgdHlwZSk7XHJcbiAgICBcclxuXHRcdCAgICAgICAgZmxlZXQuc2V0RmxlZXQgKG9yaWVudGF0aW9uLCB0eXBlLCBzaGlwLnNpemUsIGUudGFyZ2V0LmlkKTsgXHJcbiAgICBcclxuXHRcdCAgICAgICAgLy8gUmVkcmF3IGltYWdlIGluIG5ldyBsb2NhdGlvblxyXG5cdFx0ICAgICAgICBkaXNwbGF5U2hpcChzaGlwcywgdHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBncmlkO1xyXG59XHJcblxyXG4vKlxyXG4gKiBfZmluZF9zdGFydCAtIERldGVybWluZSB0aGUgc3RhcnRpbmcgY29vcmRpbmF0ZSBvZiBhIHNoaXAgZ2l2ZW4gdGhlIHNxdWFyZSB0aGF0IHdhcyBjbGlja2VkLiBGb3IgZXhhbXBsZVxyXG4gKiBpdCBpcyBwb3NzaWJsZSB0aGF0IGEgYmF0dGxlc2hpcCBhbG9uZyB0aGUgeC1heGlzIHdhcyBjbGlja2VkIGF0IGxvY2F0aW9uIDNfMyBidXQgdGhhdCB3YXMgdGhlIHNlY29uZCBzcXVhcmVcclxuICogb24gdGhlIHNoaXAuIFRoaXMgZnVuY3Rpb24gd2lsbCBpZGVudGlmeSB0aGF0IHRoZSBiYXR0bGVzaGlwIHN0YXJ0cyBhdCAyXzMuXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gX2ZpbmRfc3RhcnQoc3RhcnRfcG9zLCBvcmllbnRhdGlvbiwgc2l6ZSwgdHlwZSl7XHJcbiAgICBsZXQgaW5kZXggPSAob3JpZW50YXRpb24gPT0gJ3gnKSA/IDAgOiAxO1xyXG5cclxuICAgIGxldCBwaWVjZXM9c3RhcnRfcG9zLnNwbGl0KCdfJyk7XHJcbiAgICBsZXQgb2Zmc2V0ID0gMDtcclxuXHJcbiAgICBmb3IgKGk9MDsgaSA8IHNpemU7IGkrKykge1xyXG5cdGlmIChwaWVjZXNbaW5kZXhdID09IDApIHticmVhazt9XHJcbiAgICAgICAgcGllY2VzW2luZGV4XS0tO1xyXG5cdGxldCBnID0gZmxlZXQuY2hlY2tHcmlkKHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXSk7XHJcbiAgICAgICAgaWYgKGcgIT0gdW5kZWZpbmVkICYmIGcgPT0gdHlwZSAmJiBnICE9IGZhbHNlKXtcclxuXHQgICAgb2Zmc2V0Kys7XHJcbiAgICAgICAgICAgIHN0YXJ0X3BvcyA9IHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtzdGFydF9wb3M6IHN0YXJ0X3Bvcywgb2Zmc2V0OiBvZmZzZXR9O1xyXG59XHJcblxyXG5sZXQgZGlzcGxheVNoaXAgPSBmdW5jdGlvbiAoc2hpcHMsIHR5cGUpIHtcclxuICAgIGxldCBjb29yZGluYXRlcyA9IGZsZWV0LmdldEZsZWV0KHR5cGUpO1xyXG4gICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG5cclxuICAgIGZvciAoY29vcmQgaW4gY29vcmRpbmF0ZXMpIHtcclxuICAgICAgICBfc2V0U3BhY2UoY29vcmRpbmF0ZXNbY29vcmRdLCBzaGlwLmNsaWNrQ2xhc3MpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBfc2V0U3BhY2Uoc3BhY2UsIGNsYXNzTmFtZSkge1xyXG4gICAgdmFyIGIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzcGFjZSk7IFxyXG4gICAgYi5jbGFzc0xpc3QudG9nZ2xlKGNsYXNzTmFtZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9nZXRUeXBlQnlDbGFzcyhzaGlwcywgY2xhc3NOYW1lKXtcclxuXHRsZXQgc2hpcExpc3QgPSBzaGlwcy5nZXRTaGlwKCk7XHJcblx0Zm9yIChzIGluIHNoaXBMaXN0KXtcclxuXHRcdGlmIChjbGFzc05hbWUubWF0Y2goc2hpcExpc3Rbc10uY2xpY2tDbGFzcykpe1xyXG5cdFx0XHRyZXR1cm4gc2hpcExpc3Rbc10udHlwZTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzPXtcclxuICAgIGNsaWNrYWJsZUdyaWQ6IGNsaWNrYWJsZUdyaWQsXHJcbiAgICBkaXNwbGF5U2hpcDogZGlzcGxheVNoaXBcclxufVxyXG5cclxuIiwiLy9sZXQgcmFiYml0ID0gcmVxdWlyZSgnLi9ic19SYWJiaXRNUScpO1xubGV0IGZsZWV0ID0gcmVxdWlyZSgnLi9mbGVldC5qcycpO1xuXG5sZXQgcGxheWVyUm9zdGVyID0gbmV3IE9iamVjdDsgLy8gUGxhY2Vob2xkZXIgZm9yIGFsbCBwbGF5ZXJzIGluIHRoZSBnYW1lXG5sZXQgcGxheWVyT3JkZXIgPSBbXTsgLy8gT3JkZXIgb2YgcGxheWVyIHR1cm5cblxubGV0IG1lO1xubGV0IG9yZGVySW5kZXg9MDtcblxuLy8gUmVnaXN0ZXIgaGFuZGxlXG5sZXQgcmVnaXN0ZXIgPSBmdW5jdGlvbihoYW5kbGUpe1xuXHRtZSA9IGhhbmRsZTsgLy8gU2VsZiBpZGVudGlmeSB0aGluZXNlbGZcblx0Ly8gVE9ETyAtIGNhbGwgb3V0IHRvIHRoZSByZWdpc3RyYXRpb24gc2VydmljZSBhbmQgZ2V0IGJhY2sgaGFuZGxlIGFuZCB0dXJuIG9yZGVyLiBUaGlzXG5cdC8vIHN0cnVjdHVyZSByZXByZXNlbnRzIHRoZSByZXR1cm4gY2FsbCBmcm9tIHRoZSByZWdpc3RyYXRpb24gc2VydmljZS5cblx0Y29uc3QgcmVnID0ge1xuXHRcdCAgICAgIGhhbmRsZTogJ2Vsc3BvcmtvJyxcblx0XHQgICAgICBvcmRlcjogMFxuXHR9O1xuXG5cdC8vX3BvcHVsYXRlX3BsYXllck9yZGVyKCdlbHNwb3JrbycsIDApO1xuXHRwbGF5ZXJPcmRlcltyZWcub3JkZXJdID0gcmVnLmhhbmRsZTtcbn1cblxuLypcbiAqICBPbmUgY29uc2lkZXJhdGlvbiBpcyBmb3IgdGhlIHJlZ2lzdHJhdGlvbiBzZXJ2aWNlIHRvIHByb3ZpZGUgYSByYW5kb20gbnVtYmVyIGZvciBvcmRlciB2YWx1ZSBzbyB0aGF0IHBsYXllciBvcmRlciBpcyBub3RcbiAqICBuZWNlc3NhcmlseSBGSUZPLiBBbHNvIHRoZXJlIGlzIG5vIGd1YXJhbnRlZSB0aGF0IHBsYXllciBvcmRlciB2YWx1ZXMgd2lsbCBhcnJpdmUgaW4gY29uc2VjdXRpdmUgb3JkZXIgc28gdGhlcmUgbmVlZHMgdG9cbiAqICBiZSBhIHNvcnQgbWVjaGFuaXNtLlxuICovXG5sZXQgX3BvcHVsYXRlX3BsYXllck9yZGVyID0gZnVuY3Rpb24oaGFuZGxlLCBvcmRlcil7XG59XG5cbi8vQWNjZXB0IHJlZ2lzdHJhdGlvbiBmcm9tIG90aGVyIHBsYXllcnNcbmxldCBhY2NlcHRSZWcgPSBmdW5jdGlvbihoYW5kbGUsIG9yZGVyKXtcblx0cGxheWVyT3JkZXJbb3JkZXJdID0gaGFuZGxlO1xuXHRwbGF5ZXJSb3N0ZXIgPSB7XG5cdFx0W2hhbmRsZV06IHtncmlkOiBmbGVldC5idWlsZE5hdXRpY2FsQ2hhcnR9XG5cdH1cbn1cblxubGV0IG15VHVybiA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gKGN1cnJlbnRQbGF5ZXIoKSA9PSBtZSkgPyAxIDogMDtcbn1cblxubGV0IG5leHRQbGF5ZXIgPSBmdW5jdGlvbigpIHtcblx0b3JkZXJJbmRleCA9IChvcmRlckluZGV4ID09IHBsYXllck9yZGVyLmxlbmd0aCAtIDEpID8gIDAgOiBvcmRlckluZGV4KzE7XG5cdHJldHVybjtcbn1cblxubGV0IGN1cnJlbnRQbGF5ZXIgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gcGxheWVyT3JkZXJbb3JkZXJJbmRleF07XG59XG5cbmxldCBwbGF5ZXJNb3ZlID0gZnVuY3Rpb24oKXtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmVnaXN0ZXI6IHJlZ2lzdGVyLFxuICAgIGFjY2VwdFJlZzogYWNjZXB0UmVnLFxuICAgIG15VHVybjogbXlUdXJuLFxuICAgIGN1cnJlbnRQbGF5ZXI6IGN1cnJlbnRQbGF5ZXIsXG4gICAgbmV4dFBsYXllcjogbmV4dFBsYXllclxufVxuIiwidmFyIGZsZWV0PXJlcXVpcmUoJy4vZmxlZXQuanMnKTtcclxuXHJcbi8vIENvbmZpZyBzZXR0aW5ncyBcclxubGV0IHNoaXBfY29uZmlnID0ge1xyXG4gICAgYWlyY3JhZnRDYXJyaWVyIDoge1xyXG4gICAgICAgIHNpemUgOiA1LFxyXG4gICAgICAgIGlkIDogJ2FpcmNyYWZ0Q2FycmllcicsXHJcbiAgICAgICAgY29sb3IgOiAnQ3JpbXNvbicsXHJcbiAgICAgICAgY2xpY2tDbGFzcyA6ICdhY2NsaWNrZWQnLFxyXG4gICAgICAgIGxhYmVsIDogJ0FpcmNyYWZ0IENhcnJpZXInLFxyXG4gICAgfSxcclxuICAgIGJhdHRsZXNoaXAgOiB7XHJcbiAgICAgICAgc2l6ZSA6IDQsXHJcbiAgICAgICAgaWQgOiAnYmF0dGxlc2hpcCcsXHJcbiAgICAgICAgY29sb3I6J0RhcmtHcmVlbicsXHJcbiAgICAgICAgY2xpY2tDbGFzcyA6ICdic2NsaWNrZWQnLFxyXG4gICAgICAgIGxhYmVsIDogJ0JhdHRsZXNoaXAnLFxyXG4gICAgfSxcclxuICAgIGRlc3Ryb3llciA6IHtcclxuICAgICAgICBzaXplIDogMyxcclxuICAgICAgICBpZCA6ICdkZXN0cm95ZXInLFxyXG4gICAgICAgIGNvbG9yOidDYWRldEJsdWUnLFxyXG4gICAgICAgIGNsaWNrQ2xhc3MgOiAnZGVjbGlja2VkJyxcclxuICAgICAgICBsYWJlbCA6ICdEZXN0cm95ZXInLFxyXG4gICAgfSxcclxuICAgIHN1Ym1hcmluZSAgOiB7XHJcbiAgICAgICAgc2l6ZSA6IDMsXHJcbiAgICAgICAgaWQgOiAnc3VibWFyaW5lJyxcclxuICAgICAgICBjb2xvcjonRGFya1JlZCcsXHJcbiAgICAgICAgY2xpY2tDbGFzcyA6ICdzdWNsaWNrZWQnLFxyXG4gICAgICAgIGxhYmVsIDogJ1N1Ym1hcmluZScsXHJcbiAgICB9LFxyXG4gICAgcGF0cm9sQm9hdCA6IHtcclxuICAgICAgICBzaXplIDogMixcclxuICAgICAgICBpZCA6ICdwYXRyb2xCb2F0JyxcclxuICAgICAgICBjb2xvcjonR29sZCcsXHJcbiAgICAgICAgY2xpY2tDbGFzcyA6ICdwYmNsaWNrZWQnLFxyXG4gICAgICAgIGxhYmVsIDogJ1BhdHJvbCBCb2F0JyxcclxuICAgIH0sXHJcbn07XHJcblxyXG4vLyBTaGlwIGNvbnN0cnVjdG9yIC0gc2hpcHlhcmQ/Pz9cclxuZnVuY3Rpb24gX3NoaXAoc2l6ZSwgaWQsIGNvbG9yLCBjbGlja0NsYXNzLCBsYWJlbCkge1xyXG4gICAgICAgIHRoaXMuc2l6ZSAgICAgICAgPSBzaXplO1xyXG4gICAgICAgIHRoaXMuaWQgICAgICAgICAgPSBpZDtcclxuICAgICAgICB0aGlzLmNvbG9yICAgICAgID0gY29sb3I7XHJcbiAgICAgICAgdGhpcy5jbGlja0NsYXNzICA9IGNsaWNrQ2xhc3M7XHJcbiAgICAgICAgdGhpcy5sYWJlbCAgICAgICA9IGxhYmVsO1xyXG5cclxuICAgICAgICByZXR1cm4gKHRoaXMpO1xyXG59XHJcblxyXG5sZXQgc2hpcHM9e307XHJcblxyXG4vKlxyXG4gKiBUaGUgc2hpcCBvYmplY3QgaG9sZHMgdGhlIGN1cnJlbnQgb3JpZW50YXRpb24gb2YgdGhlIHNoaXAgYW5kIHRoZSBzdGFydCBjb29yZGluYXRlICh0b3Btb3N0L2xlZnRtb3N0KS4gV2hlblxyXG4gKiB0aGVyZSBpcyBhIGNoYW5nZSB0byB0aGUgc2hpcCB0aGUgbWFzdGVyIG1hdHJpeCBuZWVkcyB0byBiZSB1cGRhdGVkLiBBbiBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHRoZXJlIGlzXHJcbiAqIGEgY29vcmRpbmF0ZSBjaGFuZ2UuIFRoaXMgbGlzdGVuZXIgd2lsbCB1cGRhdGUgdGhlIG1hc3RlciBtYXRyaXguIENhbGxzIHRvIGNoZWNrIGxvY2F0aW9uIChtb3ZlIHZhbGlkdGlvbiwgXHJcbiAqIGNoZWNrIGlmIGhpdCwgZXRjLikgd2lsbCBiZSBtYWRlIGFnYWluc3QgdGhlIG1hc3RlciBtYXRyaXguXHJcbiAqL1xyXG4vKlxyXG5sZXQgc2hpcElpbnQgPSBmdW5jdGlvbigpe1xyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcignc2hpcE1vdmUnLCgpKSB9XHJcblxyXG59XHJcbiovXHJcbi8vIFB1YmxpYyBmdW5jdGlvbiB0byBpbml0aWFsbHkgY3JlYXRlIHNoaXBzIG9iamVjdFxyXG5sZXQgYnVpbGRTaGlwcyA9IGZ1bmN0aW9uICgpe1xyXG4gICAgZm9yIChsZXQgcyBpbiBzaGlwX2NvbmZpZyl7XHJcbiAgICAgICAgc2hpcHNbc10gPSB7c2l6ZTogc2hpcF9jb25maWdbc10uc2l6ZSwgXHJcblx0XHQgICAgdHlwZTogc2hpcF9jb25maWdbc10uaWQsXHJcblx0ICAgICAgICAgICAgY29sb3I6IHNoaXBfY29uZmlnW3NdLmNvbG9yLFxyXG5cdFx0ICAgIGNsaWNrQ2xhc3M6IHNoaXBfY29uZmlnW3NdLmNsaWNrQ2xhc3MsXHJcblx0XHQgICAgbGFiZWw6IHNoaXBfY29uZmlnW3NdLmxhYmVsXHJcblx0ICAgICAgICAgICB9O1xyXG4gICAgfVxyXG5yZXR1cm4gc2hpcHM7XHJcbn1cclxuXHJcbmxldCBidWlsZFNoaXAgPSBmdW5jdGlvbih0eXBlKXtcclxuICAgICAgICBzaGlwc1t0eXBlXSA9IF9zaGlwKHNoaXBfY29uZmlnW3R5cGVdLnNpemUsIHNoaXBfY29uZmlnW3R5cGVdLmlkLCBzaGlwX2NvbmZpZ1t0eXBlXS5jb2xvciwgc2hpcF9jb25maWdbdHlwZV0uY2xpY2tDbGFzcywgc2hpcF9jb25maWdbdHlwZV0ubGFiZWwpO1xyXG5cdHJldHVybiBzaGlwcztcclxufVxyXG5cclxuLy8gU2V0IHZhbHVlIGluIHNoaXAgb2JqZWN0LiBcclxubGV0IHNldFNoaXAgPSBmdW5jdGlvbih0eXBlLCBrZXksIHZhbHVlKXtcclxuICAgICAgICBpZiAodHlwZSAmJiBzaGlwc1t0eXBlXSAmJiBrZXkpIHsgLy8gb25seSBhdHRlbXB0IGFuIHVwZGF0ZSBpZiB0aGVyZSBpcyBhIGxlZ2l0IHNoaXAgdHlwZSBhbmQgYSBrZXlcclxuICAgICAgICAgICAgc2hpcHNbdHlwZV0ua2V5ID0gdmFsdWU7XHJcbiAgIH1cclxufVxyXG5cclxuLy8gUmV0dXJuIHNoaXAgb2JqZWN0IGlmIG5vIHR5cGUgZ2l2ZW4gb3RoZXJ3aXNlIHJldHVybiBvYmplY3QgY29udGFpbmluZyBqdXN0IHJlcXVlc3RlZCBzaGlwXHJcbmxldCBnZXRTaGlwID0gZnVuY3Rpb24gKHR5cGUpe1xyXG4gICAgaWYodHlwZSl7XHJcbiAgICAgICAgcmV0dXJuIHNoaXBzW3R5cGVdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gc2hpcHM7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIFByaXZhdGUgZnVuY3Rpb24gdG8gcmFuZG9tbHkgZGV0ZXJtaW5lIHNoaXAncyBvcmllbnRhdGlvbiBhbG9uZyB0aGUgWC1heGlzIG9yIFktYXhpcy4gT25seSB1c2VkIHdoZW4gcGxvdHRpbmcgc2hpcHMgZm9yIHRoZSBmaXJzdCB0aW1lLlxyXG5mdW5jdGlvbiBfZ2V0U3RhcnRDb29yZGluYXRlKHNpemUpe1xyXG4gICAgY29uc3Qgc3RhcnRfb3JpZW50YXRpb249TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjEwKSA+IDUgPyAneCcgOiAneSc7XHJcbiAgICBjb25zdCBzdGFydF94ID0gc3RhcnRfb3JpZW50YXRpb24gPT0gJ3gnID8gX2dldFJhbmRvbUNvb3JkaW5hdGUoc2l6ZSkgOiBfZ2V0UmFuZG9tQ29vcmRpbmF0ZSgwKTtcclxuICAgIGNvbnN0IHN0YXJ0X3kgPSBzdGFydF9vcmllbnRhdGlvbiA9PSAneScgPyBfZ2V0UmFuZG9tQ29vcmRpbmF0ZShzaXplKSA6IF9nZXRSYW5kb21Db29yZGluYXRlKDApO1xyXG5cclxuICAgIHJldHVybiB7Y29vcmRpbmF0ZTogc3RhcnRfeCArICdfJyArIHN0YXJ0X3ksIG9yaWVudGF0aW9uOiBzdGFydF9vcmllbnRhdGlvbn07XHJcbn1cclxuXHJcbi8vIFRha2Ugc2hpcCBzaXplIGFuZCBvcmllbnRhdGlvbiBpbnRvIGFjY291bnQgd2hlbiBkZXRlcm1pbmluZyB0aGUgc3RhcnQgcmFuZ2UgdmFsdWUuIGV4LiBkb24ndFxyXG4vLyBsZXQgYW4gYWlyY3JhZnQgY2FycmllciB3aXRoIGFuIG9yaWVudGF0aW9uIG9mICdYJyBzdGFydCBhdCByb3cgNyBiZWNhdXNlIGl0IHdpbGwgbWF4IG91dCBvdmVyIHRoZVxyXG4vLyBncmlkIHNpemUuXHJcbmZ1bmN0aW9uIF9nZXRSYW5kb21Db29yZGluYXRlKG9mZnNldCl7XHJcbiAgICBjb25zdCBNQVhfQ09PUkQgPSAxMDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqKE1BWF9DT09SRCAtIG9mZnNldCkpO1xyXG5cclxufVxyXG5cclxuLy8gRklYTUUgRG9lcyBmbGVldC5naG9zdFNoaXAgZG8gdGhpcyBub3c/XHJcbi8vIEJ1aWxkIGFuIGFycmF5IG9mIGNvb3JkaW5hdGVzIGZvciBhIHNoaXAgYmFzZWQgb24gaXQncyBvcmllbnRhdGlvbiwgaW50ZW5kZWQgc3RhcnQgcG9pbnQgYW5kIHNpemVcclxubGV0IF9zaGlwU3RyaW5nID0gZnVuY3Rpb24ocykge1xyXG5cdGNvbnN0IG8gPSBzLm9yaWVudGF0aW9uO1xyXG5cdGNvbnN0IHN0ID0gcy5zdGFydF9jb29yZGluYXRlO1xyXG5cdGxldCByID0gbmV3IEFycmF5O1xyXG4gICAgICAgIGxldCB0X3BpZWNlcyA9IHN0LnNwbGl0KCdfJyk7XHJcblx0Y29uc3QgaSA9IG8gPT0gJ3gnID8gMCA6IDE7XHJcblxyXG5cdGZvciAobGV0IGo9MDsgaiA8IHMuc2l6ZTtqKyspIHtcclxuXHRcdHRfcGllY2VzW2ldID0gdF9waWVjZXNbaV0rMTtcclxuXHRcdHIucHVzaCAodF9waWVjZXNbMF0gKyAnXycgKyB0X3BpZWNlc1sxXSk7XHJcblx0fVxyXG5cdHJldHVybiByO1xyXG59XHJcblxyXG5cclxuLypcclxuICogcGxhY2VTaGlwcyAtIEluaXRpYWwgcGxhY2VtZW50IG9mIHNoaXBzIG9uIHRoZSBib2FyZFxyXG4gKi9cclxubGV0IHBsYWNlU2hpcHMgPSBmdW5jdGlvbiBwbGFjZVNoaXBzKGZsZWV0KXtcclxuICAgICAgICAvKiBSYW5kb21seSBwbGFjZSBzaGlwcyBvbiB0aGUgZ3JpZC4gSW4gb3JkZXIgZG8gdGhpcyBlYWNoIHNoaXAgbXVzdDpcclxuXHQgKiAgICogUGljayBhbiBvcmllbnRhdGlvblxyXG5cdCAqICAgKiBQaWNrIGEgc3RhcnRpbmcgY29vcmRpbmF0ZVxyXG5cdCAqICAgKiBWYWxpZGF0ZSB0aGF0IHRoZSBjb29yZGluYXRlIGlzIHZhbGlkIChkb2VzIG5vdCBydW4gT09CLCBkb2VzIG5vdCBjcm9zcyBhbnkgb3RoZXIgc2hpcCwgZXRjLilcclxuXHQgKiAgICogSWYgdmFsaWQ6XHJcblx0ICogICBcdCogU2F2ZSBzdGFydCBjb29yZCBhbmQgb3JpZW50YXRpb24gYXMgcGFydCBvZiBzaGlwIG9iamVjdFxyXG5cdCAqICAgXHQqIFBsb3Qgc2hpcCBvbiBtYXN0ZXIgbWF0cml4XHJcblx0ICovXHJcblx0bGV0IHNoaXBMaXN0ID0gZ2V0U2hpcCgpO1xyXG4gICAgICAgIGZvciAodmFyIHNoaXAgaW4gc2hpcExpc3QpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBzdGFydCA9IF9nZXRTdGFydENvb3JkaW5hdGUoc2hpcExpc3Rbc2hpcF0uc2l6ZSk7IFxyXG5cdCAgICBsZXQgc2hpcF9zdHJpbmcgPSBmbGVldC5naG9zdFNoaXAoc2hpcExpc3Rbc2hpcF0udHlwZSwgc3RhcnQuY29vcmRpbmF0ZSwgc3RhcnQub3JpZW50YXRpb24pO1xyXG5cdCAgICBzaGlwTGlzdFtzaGlwXS5vcmllbnRhdGlvbiA9IHN0YXJ0Lm9yaWVudGF0aW9uO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKCFmbGVldC52YWxpZGF0ZVNoaXAoc2hpcF9zdHJpbmcpKSB7XHJcbiAgICAgICAgICAgICAgICBzdGFydCA9IF9nZXRTdGFydENvb3JkaW5hdGUoc2hpcExpc3Rbc2hpcF0uc2l6ZSk7IFxyXG5cdFx0c2hpcExpc3Rbc2hpcF0ub3JpZW50YXRpb24gPSBzdGFydC5vcmllbnRhdGlvbjtcclxuXHRcdHNoaXBfc3RyaW5nID0gZmxlZXQuZ2hvc3RTaGlwKHNoaXBMaXN0W3NoaXBdLnR5cGUsIHN0YXJ0LmNvb3JkaW5hdGUsIHN0YXJ0Lm9yaWVudGF0aW9uKTtcclxuXHRcdH1cclxuXHJcbiAgICAgICAgICAgIGZsZWV0LnNldEZsZWV0KHN0YXJ0Lm9yaWVudGF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHNoaXBMaXN0W3NoaXBdLnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgc2hpcExpc3Rbc2hpcF0uc2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICBzdGFydC5jb29yZGluYXRlKTtcclxuICAgICAgICAgICAgfVxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgYnVpbGRTaGlwczogYnVpbGRTaGlwcyxcclxuICAgIGJ1aWxkU2hpcDogYnVpbGRTaGlwLFxyXG4gICAgZ2V0U2hpcDogZ2V0U2hpcCxcclxuICAgIHNldFNoaXA6IHNldFNoaXAsXHJcbiAgICBwbGFjZVNoaXBzOiBwbGFjZVNoaXBzXHJcbn1cclxuIl19
