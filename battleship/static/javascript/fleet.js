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
