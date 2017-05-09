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

// Set value in ship object. 
let setShip = function(type, key, value){
        if (type && ships[type] && key) { // only attempt an update if there is a legit ship type and a key
            ships[type].key = value;
   }
}

// Return ship object if no type given otherwise return object containing just requested ship
let getShip = function (type){
    if(!type){
        return ships.type;
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
		const ship_string = _shipString(ship);
                
                if (fleet.validateShip(ship_string)){
                    fleet.setFleet(start.orientation,
                             {
                               type: s.id,
                               square: 0,
                               index: s.size
                             },
                             start.coordinate);
		       	break;
		}
            }
            // Add ship to main matrix
                
            //board.adjustBoard(shipsCfg[ship].id);
            //ships.adjustShip(shipsCfg[ship].id);
            //ships.displayShip(shipsCfg[ship].id);

            //displayShip(s.id);
        }
};


let displayShip = function (type, current_coord, skip) {
    var shipsCfg = config.ships;

    if (typeof current_coord !== undefined){
        for (coord in current_coord) {
            setSpace(current_coord[coord], shipsCfg[type].clickClass);
        }
    }

    if (!skip){
        for (coord in shipsCfg[type].coordinates){
            setSpace(shipsCfg[type].coordinates[coord], shipsCfg[type].clickClass);
        }
    }
}

module.exports = {
    buildShips: buildShips,
    getShip: getShip,
    setShip: setShip,
    placeShips: placeShips,
    displayShip: displayShip
}
