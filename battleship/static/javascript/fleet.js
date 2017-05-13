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
	let orientation = nauticalMap.type.orientation == 'x' ? 0 : 1;
	let pieces = nauticalMap.type.start_coord.split('_');
	let ret = new Array;

	while (nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] == type) {
		ret.push (pieces[0] + '_' + pieces[1]);
		pieces[orientation] = parseInt(pieces[orientation], 10) + 1;
	}

	return (ret);

}

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

function setSpace(space, className) {
    var b = document.getElementById(space); 
    b.classList.toggle(className);
}

// TODO - setFleet: Remove previous ship from chart
/*
 * setFleet - place ship on nautical chart
 */
let setFleet = function (orientation, square, type, size, target){
    // Square represents the square on the ship that is the focus of the action
    var t_pieces = target.split('_');
    var pieces={
        "x":t_pieces[0],
        "y":t_pieces[1],
    };


    // Get initial target
    pieces[orientation] = pieces[orientation] - square;
    // set the nautical map value for this boat
    nauticalMap.type={
	    orientation: orientation,
	    start_coord: pieces.x + '_' + pieces.y
    };


    for (var i=0; i < size; i++) {
	nauticalChart[pieces.x][pieces.y]=type;
	pieces[orientation]+=1;
    }
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

let adjustShip = function (type, callback){
    var shipsCfg = config.ships;

    // Wipe out existing coordinates
    shipsCfg[type].coordinates.length=0;

    // Map plotted ships to real coordinates
    for (var p=0; p < shipsCfg[type].plotted.length; p++) {
        shipsCfg[type].coordinates[p] = shipsCfg[type].plotted[p];
    }

    if (typeof callback === "function") {return callback();}
    return 1;
}

module.exports = {
    displayShip: displayShip,
    getFleet: getFleet,
    setFleet: setFleet,
    validateShip: validateShip,
    adjustShip: adjustShip,
    checkGrid: checkGrid,
    buildNauticalChart: buildNauticalChart
}
