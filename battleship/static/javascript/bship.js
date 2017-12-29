(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/*** fleet.js ***/
var fleet = {
	nauticalMap: {}, // Hash lookup that tracks each ship's starting point and current orientation

	buildNauticalChart: function(){
		let chart = new Array;
		for(let i=0; i < 10; i++) {
			chart[i] = new Array;
			for (let j=0; j < 10; j++){
				chart[i][j] = undefined;//new Array;
			}
		}
		return chart;
	},

	/*
	nauticalChart: function(){
		return fleet.buildNauticalChart(); // Detailed matrix of every ship in the fleet
	},
	*/

	init: function(){
		return fleet.nauticalChart = fleet.buildNauticalChart(); // Detailed matrix of every ship in the fleet
	},

	getFleet: function(type){
		let orientation = fleet.nauticalMap[type].orientation == 'x' ? 0 : 1;

		let pieces = fleet.nauticalMap[type].start_coord.split('_');
		let ret = new Array;

		while (pieces[orientation] < fleet.nauticalChart[orientation].length && fleet.nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] == type) {
			ret.push (pieces[0] + '_' + pieces[1]);
			pieces[orientation] = parseInt(pieces[orientation], 10) + 1;
		}

		return (ret);
	},

	getWholeFleet: function(){
		let ret={};
		for (let t in fleet.nauticalMap) {
			ret[t] = fleet.getFleet(t);
		}
		return ret;
	},

	// TODO - setFleet: Remove previous ship from chart -- may be done...needs test
	/*
	 * setFleet - place ship on nautical chart
	 */
	setFleet: function (orientation, type, size, start_coord, offset){ 
		let pieces = start_coord.split('_');
	    let index = (orientation == 'x') ? 0 : 1;

	    offset = offset || 0;

	    // Adjust for drag/drop when player picks a ship piece other than the head.
	    pieces[index] = parseInt(pieces[index], 10) - offset;

	    /*
	     * Remove old ship from nauticalChart/Map
	     */
	    fleet._clearShip(type, size);

	    // set the nautical map value for this boat
	    fleet.nauticalMap[type]={
		    orientation: orientation,
		    start_coord: pieces[0] + '_' + pieces[1]
	    };

	    for (var i=0; i < size; i++) {
		fleet.nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] = type;
		pieces[index]= parseInt(pieces[index], 10) +1;
	    }
	},

	_clearShip: function(type, size){
	    let map = fleet.nauticalMap[type];
	    if (map === undefined){return false;}

	    let pieces = map.start_coord.split('_');
	    let index = (map.orientation == 'x') ? 0 : 1;

	    for (let i=0; i < size; i++) {
		    fleet.nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)]=undefined;
		    pieces[index]++;
	    }

	    delete fleet.nauticalMap[type];
	},

	/*
	 * ghostShip - Before putting a ship on the chart it's potential location needs to be plotted so it can be
	 * checked for validity. Given a ship this function will return the potential plotted coordinates. The function
	 * may build coordinates for a known ship or for one moved around on the grid.
	 */
	ghostShip: function(type, coordinate, orientation, size, offset){
		let ship = ships.getShip(type);
		let thisShip = fleet.readMap(type);
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
	},

	readMap: function(type){
		return fleet.nauticalMap[type];
	},

	/*
	 * Given a coordinate or an array of coordinates return the same structure revealing the contents of the grid.
	 * Will return a value of false if there is a problem checking the grid (ex. coords are out of range).
	 */
	checkGrid: function(coordinates){
		if (coordinates instanceof Array){
			let ret = new Array;
			for(let c in coordinates){
				let s = fleet._setChart(coordinates[c]);
				if (s === false) {return false};
				ret.push (s);
			}
			return ret;
		} else {
			return fleet._setChart(coordinates);
		}
	},

	_setChart: function(coordinate){
		let pieces = coordinate.split('_');
		if (parseInt(pieces[0], 10) >= fleet.nauticalChart.length ||
		    parseInt(pieces[1], 10)>= fleet.nauticalChart[parseInt(pieces[0], 10)].length) {
			return false;
		}

		return fleet.nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)];
	},

	/* 
	 * Given a list of coordinates and a ship type validate that the coordinates do not violate the rules of:
	 * 	* ship must be on the grid
	 * 	* ship must not occupy the same square as any other ship
	 */
	validateShip: function (coordinates, type){
	    // Make sure there are no other boats already on any a space
	    for (var p=0; p < coordinates.length; p++) {

		// Is there a collision?
		let collision = fleet.checkGrid(coordinates);
		
		if (collision == false) {return false}; // If checkGrid returns false coordinates are out of range

		for (let c in coordinates) {
			let pieces = coordinates[c].split('_');
				if (fleet.nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] != type &&
				    fleet.nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] != undefined) {return false};
		}
	    }
	    return true;
	},
};

/*** grid.js ***/
let grid = {

	moveShip: function(dropObj, ev){
	    console.log('pre-set fleet move');
	    let ship=ships.getShip(dropObj.type);
	    // Remove initial image
	    grid.displayShip(dropObj.type);

	    fleet.setFleet (dropObj.orientation, dropObj.type, ship.size, ev.target.id, dropObj.offset); 

	    // Redraw image in new location
	    grid.displayShip(dropObj.type);
	},

	/*
	 * Called after player sets initial fleet. Overwrite the moveShip function so it behaves different.
	 */
	setMoveShip: function(){
		/* change value of moveShip function */
		grid.moveShip = function(dropObj, ev, dropShip, moveType){
		    console.log('In game move');
		    // Remove initial image
		    grid.displayShip(dropObj.type);

		    // draw image based on dropShip
		    grid.displayShip(dropObj.type, dropShip);

		    // Store ghostShip in move object
		    player.setMove({ type: moveType, 
				     coordinate: ev.target.id, 
				     ghost: dropShip,
				     orientation: dropObj.orientation, 
				     shipType: dropObj.type,
				     undo: fleet.ghostShip(dropObj.type) // Need to preserve the ship's position pre-move
		    });
		}
	},

	/*
	 * Build the grid and attach handlers for drag/drop events
	 */
	clickableGrid: function ( rows, cols, phandle){
	    let gridTable = document.createElement('table');
	    gridTable.className='grid';
	    for (var r=0;r<rows;++r){
		var tr = gridTable.appendChild(document.createElement('tr'));
		for (var c=0;c<cols;++c){
		    var cell = tr.appendChild(document.createElement('td'));
		    // Each cell on the grid is of class 'cell'
		    cell.className='cell';

		    // Set the ID value of each cell to the row/column value formatted as r_c
		    cell.id = r + '_' + c;

		    if (phandle == undefined){
			grid._setMyListeners(cell)
		    } else {
		       grid._setPlayerListeners(cell, phandle);
		    }
		}
	    }
	    return gridTable;
	},

	_setMyListeners: function(cell){
		    // Set up drag and drop for each cell.
		    cell.setAttribute('draggable','true');

		    cell.addEventListener('dragstart',(
			function(ev){
			    ev.dataTransfer.effectAllowed='move';
			    let type = grid._getTypeByClass(this.className);
			    let ship = ships.getShip(type);

			    // Calculate which square was clicked to guide placement
			    let start = grid._find_start(this.id, ship.orientation, ship.size, type);
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
				    if(player.canMove()) {grid.moveShip(dropObj, ev, dropShip, 'move')};
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
			    let type = grid._getTypeByClass(this.className);
			    let ship = ships.getShip(type);
			    let start = grid._find_start(e.target.id, ship.orientation, ship.size, type);
			    let orientation = (ship.orientation == 'x') ? 'y':'x'; // flip the orientation
			    //let ghost = fleet.ghostShip(type, e.target.id, orientation, ship.size, start.offset);
			    let ghost = fleet.ghostShip(type, e.target.id, orientation, ship.size, start.offset);

			    drop.type = type;
			    drop.offset = start.offset;
			    drop.orientation = orientation;

			    if(fleet.validateShip(ghost, type)) {
				if(player.canMove()) {
				    ship.orientation = orientation;
				    grid.moveShip(drop, e, ghost, 'pivot')};
			    }
			}));
	},

	_setPlayerListeners: function(cell, handle){
		    // Set the ID value of each cell to the row/column value formatted as r_c
		    cell.id = handle + '_' + cell.id;
		    // Set up drag and drop for each cell.

		    cell.addEventListener('click', (
			function(e){
			    if(player.canMove()) {
				move.setMove({type: 'attack',
					      coordinate: e.target.id});
				console.log( e.target.id + ' is under attack');
			    }
			}
		    ));
	},

	/*
	 * _find_start - Determine the starting coordinate of a ship given the square that was clicked. For example
	 * it is possible that a battleship along the x-axis was clicked at location 3_3 but that was the second square
	 * on the ship. This function will identify that the battleship starts at 2_3.
	 */

	_find_start: function(start_pos, orientation, size, type){
	    let index = (orientation == 'x') ? 0 : 1;

	    let pieces=start_pos.split('_');
	    let offset = 0;

	    for (let i=0; i < size; i++) {
		if (pieces[index] == 0) {break;}
		pieces[index]--;
		let g = fleet.checkGrid(pieces[0] + '_' + pieces[1]);
		//if (g != undefined && g == type && g != false){}
		if (g == type && g != false){
		    offset++;
		    start_pos = pieces[0] + '_' + pieces[1];
		} else {
		    break;
		}
	    }

	    return {start_pos: start_pos, offset: offset};
	},

	displayShip: function (type, c) {
	    let coordinates = c || fleet.getFleet(type);
	    let ship = ships.getShip(type);

	    for (let coord in coordinates) {
		grid._setSpace(coordinates[coord], ship.clickClass);
	    }
	},

	_setSpace: function(space, className) {
	    var b = document.getElementById(space); 
	    b.classList.toggle(className);
	},

	_getTypeByClass: function(className){
		let shipList = ships.getShip();
		for (let s in shipList){
			if (className.match(shipList[s].clickClass)){
				return s;
				//return shipList[s].type;
			}
		}
	}
};
/*** ships.js ***/
let ships = {
	// Config settings 
	ship_config: {
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
	},

	hitCounter: {
	    aircraftCarrier : 0,
	    battleship : 0,
	    destroyer : 0,
	    submarine  : 0,
	    patrolBoat : 0
	},

	sunkCounter: {}, // Tracks which boats have been sunk

	// Values for determining bit values when a boat sinks
	airCraftCarrier: 1,
	battleship: 2,
	destroyer: 4,
	submarine: 8,
	patrolBoat: 16,

	setHitCounter: function (type, bit) {
		ships.hitCounter[type] = ships.ship_config[type].mask^(bit*bit);
		if (ships.hitCounter[type] == ships.ship_config[type].mask) { // I don't know if this is correct but the idea is check to see if the ship is sunk and flag it if need be
			ships.setSunkCounter(type);
		}
	},

	setSunkCounter: function (type) {
		ships.sunkCounter = ships.sunkCounter^type;
	},

	getHitCounter: function (type){
		return ships.hitCounter[type];
	},

	getSunkCounter: function(){
		return ships.sunkCounter;
	},

	// Ship constructor - shipyard???
	_ship: function(size, id, color, clickClass, label) {
		this.size        = size;
		this.id          = id;
		this.color       = color;
		this.clickClass  = clickClass;
		this.label       = label;

		return (this);
	},

	//ships: {},

	/*
	 * The ship object holds the current orientation of the ship and the start coordinate (topmost/leftmost). When
	 * there is a change to the ship the master matrix needs to be updated. An event will be triggered when there is
	 * a coordinate change. This listener will update the master matrix. Calls to check location (move validtion, 
	 * check if hit, etc.) will be made against the master matrix.
	 */
	/*
	let shipIint = function(){
	    addEventListener('shipMove',()) }

	{}
	*/
	// Public function to initially create ships object
	buildShips: function (){
	    for (let s in ships.ship_config){
		ships[s] = {size: ships.ship_config[s].size, 
			    type: ships.ship_config[s].id,
			    color: ships.ship_config[s].color,
			    clickClass: ships.ship_config[s].clickClass,
			    label: ships.ship_config[s].label
			   };
	    }
	return ships;
	},

	buildShip: function(type){
		ships[type] = ships._ship(ships.ship_config[type].size, ships.ship_config[type].id, ships.ship_config[type].color, ships.ship_config[type].clickClass, ships.ship_config[type].label);
		return ships;
	},

	// Set value in ship object. 
	setShip: function(type, key, value){
		if (type && ships[type] && key) { // only attempt an update if there is a legit ship type and a key
		    ships[type].key = value;
	   }
	},

	// Return ship object if no type given otherwise return object containing just requested ship
	getShip: function (type){
	    if(type){
		return ships[type];
	    } else {
		return ships.ship_config;
	    }
	},

	// Private function to randomly determine ship's orientation along the X-axis or Y-axis. Only used when plotting ships for the first time.
	_getStartCoordinate: function(size){
	    const start_orientation=Math.floor(Math.random()*10) > 5 ? 'x' : 'y';
	    const start_x = start_orientation == 'x' ? ships._getRandomCoordinate(size) : ships._getRandomCoordinate(0);
	    const start_y = start_orientation == 'y' ? ships._getRandomCoordinate(size) : ships._getRandomCoordinate(0);

	    return {coordinate: start_x + '_' + start_y, orientation: start_orientation};
	},

	// Take ship size and orientation into account when determining the start range value. ex. don't
	// let an aircraft carrier with an orientation of 'X' start at row 7 because it will max out over the
	// grid size.
	_getRandomCoordinate: function(offset){
	    const MAX_COORD = 10;
	    return Math.floor(Math.random()*(MAX_COORD - offset));
	},

	// FIXME Does fleet.ghostShip do this now?
	// Build an array of coordinates for a ship based on it's orientation, intended start point and size
	_shipString: function(s) {
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
	},

	/*
	 * placeShips - Initial placement of ships on the board
	 */
	placeShips: function (){
		/* Randomly place ships on the grid. In order do this each ship must:
		 *   * Pick an orientation
		 *   * Pick a starting coordinate
		 *   * Validate that the coordinate is valid (does not run OOB, does not cross any other ship, etc.)
		 *   * If valid:
		 *   	* Save start coord and orientation as part of ship object
		 *   	* Plot ship on master matrix
		 */
		let shipList = ships.getShip();
		for (var ship in shipList) {
		    
		    let start = ships._getStartCoordinate(shipList[ship].size); 
		    //let ship_string = fleet.ghostShip(shipList[ship].type, start.coordinate, start.orientation);
		    let ship_string = fleet.ghostShip(ship, start.coordinate, start.orientation);
		    shipList[ship].orientation = start.orientation;

		    while (!fleet.validateShip(ship_string)) {
			start = ships._getStartCoordinate(shipList[ship].size); 
			shipList[ship].orientation = start.orientation;
			//ship_string = fleet.ghostShip(shipList[ship].type, start.coordinate, start.orientation);
			ship_string = fleet.ghostShip(ship, start.coordinate, start.orientation);
			}

		    fleet.setFleet(start.orientation,
			       //shipList[ship].type,
			       ship,
			       shipList[ship].size,
			       start.coordinate);
		    }
	}
}

/*** player.js ***/
let player = {
	playerRoster: new Object, // Placeholder for all players in the game
	playerOrder: [], // Order of player turn
	me: undefined,
	orderIndex: 0,
	flow: ['register','game'],
	currentFlow: undefined,

	canMove: function() {
		if (player.playerOrder.length > move.getMoveSize()) return true;
		return false;
	},

	// Register handle
	register: function(handle){
		player.me = handle; // Self identify thineself
		// TODO - call out to the registration service and get back handle and turn order. This
		// structure represents the return call from the registration service.
		const reg = {
			      handle: 'elsporko',
			      order: 0
		};

		//_populate_playerOrder('elsporko', 0);
		player.playerOrder[reg.order] = reg.handle;
		player.gameFlow();
		return;
	},

	//Accept registration from other players
	acceptReg: function(handle, order){
		player.playerOrder[order] = handle;
		player.playerRoster = {
			[handle]: {pgrid: fleet.buildNauticalChart}
		}
		let pg = document.getElementById('playerGrid').appendChild(document.createElement('div'));;
		
		//let pgd = pg.appendChild(document.createElement('div'));
		pg.id=handle;
		pg.innerHTML=handle;

		pg.appendChild(grid.clickableGrid(10, 10, handle));
	},

	myTurn: function() {
		return (player.currentPlayer() == player.me) ? 1 : 0;
	},

	nextPlayer: function() {
		player.orderIndex = (player.orderIndex == player.playerOrder.length - 1) ?  0 : player.orderIndex+1;
		return;
	},

	currentPlayer: function(){
		return player.playerOrder[player.orderIndex];
	},

	gameFlow: function(){
		if (player.currentFlow != undefined){
			document.getElementById(player.flow[player.currentFlow]).style.display='none';
			player.currentFlow++;
		} else {
			player.currentFlow = 0;
		}
		document.getElementById(player.flow[player.currentFlow]).style.display='inline';
	},

	setMove: function(m){
		return move.setMove(m);
	},
}

/*** move.js ***/
let move = {
	moveList: [],
	moveMap: {},

	deleteMove: function(){
	},

	clearMoveList: function() {
		move.moveList = [];
	},

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
	moveListBlock: function(m) {
		let moveStruct={};
		let mv = document.createElement('div');
		moveStruct.id = mv.id = m.type + '_' + m.coordinate;
		mv.className = 'move';

		mv.setAttribute('draggable','true');
		move.moveOrderHandler(mv);

		let moveString = m.type + ': ' + m.coordinate;
		let mdtl = document.createElement('div');
		mdtl.innerHTML=moveString;

		let mdel = document.createElement('div');
		mdel.innerHTML='Delete';
		mdel.id = 'del_' + mv.id;
		move._set_mvListeners(mv);

		mv.appendChild(mdtl);
		mv.appendChild(mdel);
		
		moveStruct.dom = mv;
		moveStruct.type = m.type;
		// store current ship coordinate string so that when a move is deleted it will be restored to it's prior location
		moveStruct.ghost = m.ghost;
		moveStruct.orientation = m.orientation;
		moveStruct.shipType = m.shipType;
		moveStruct.size = m.shipSize;

		return moveStruct;
	},

	// Add delete move function
	_set_mvListeners: function(mv){
		mv.addEventListener('click', (function() {
			// Check to see if another ship is in the path of the attempted restore
			if (fleet.validateShip(move.undo, move.shipType)) {
				// Remove the div
				// Need to know parent element which, for everything in the move list, is the element whose id is playOrder
				let p = document.getElementById('playOrder');
				let dmv = document.getElementById(mv.id);
				p.removeChild(dmv);

				// Delete the entry from the array
				//move.moveList.push(mv);
				for (let l in move.moveList) {
					if(move.moveList[l].id == mv.id){
						move.moveList.splice(l,1);
						break;
					}
				}

				// Repaint the original ship
				grid.displayShip(move.shipType);
				fleet.setFleet (move.orientation, move.shipType, ships.getShip(move.shipType).size, move.ghost[0], 0); 
				grid.displayShip(move.ships, move.shipType);
			}
		}));
	},

	// Set up drag drop functionality for setting move order
	moveOrderHandler: function(po) {
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
			    move.alterMoveIndex(dropObj.changeMove, e.target.id);
			    return false;
	    }));
	},

	alterMoveIndex: function(startIndex, endIndex){
		startId = startIndex;
		startIndex = parseInt(move.moveMap[startIndex]);
		endIndex   = parseInt(move.moveMap[endIndex]);

		let begin = startIndex < endIndex ? parseInt(startIndex, 10) : parseInt(endIndex, 10);
		let end =   startIndex < endIndex ? parseInt(endIndex, 10) : parseInt(startIndex, 10);
		let hold = move.moveList[startIndex];

		while(begin < end){
			document.getElementById(move.moveList[begin].id).appendChild((move.moveList[begin+1]));
			move.moveList[begin] = move.moveList[begin+1];
			move.moveMap[startId] = begin+1;
			begin++;
		}
		document.getElementById(move.moveList[end].id).appendChild(document.getElementById[hold].id);
		move.moveList[end] = hold;
		move.moveMap[startId] = end;
	},

	resolveMoves: function (){
		let parent = document.getElementById('playOrder');
		console.log('Resolving moves');
		for(let m in move.moveList) {
			let move = move.moveList[m];
			console.log('move: ', move);
			switch(move.type) {
				case 'attack': 
					grid.attackPlayer(move.coordinate);
					break;
				case 'mine':
					grid.setMine(move.coordinate);
					break;
				case 'move':
					//moveShip(fleet, ships, grid, move);
					grid.moveShip();
					break;
				case 'pivot':
					break;
			}
		let child = document.getElementById(move.id);
		parent.removeChild(child);
		}
	},

	//let moveShip = function(fleet, ships, grid, move){}
	moveShip: function(move){
		// Check for mines based on ghost - send message to mine service
		let blastAt = grid._check_for_mine(move.ghost);
		if (blastAt != false){
			// Reset ghost if mine found - If a mine has been encountered then the ship only moves to the point of the blast
			grid._resetGhost(blastAt);
			// find which square got hit
			let target;
			for(let m in move.ghost){
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
			grid.displayShip(move.shipType, move.ghost);
		}
	},

	_resetGhost: function(blastAt){
		for (let i in move.ghost){
			if (blastAt == move.ghost[i]) break;
		}

		return move.ghost = fleet.ghostShip(move.type, move.ghost[i], move.orientation, move.ghost.length, i);
	},

	// Stub for mine detection
	_check_for_mine: function (g){
		let mineAt = {'0_6': 1, '1_6': 1, '2_6': 1, '3_6': 1, '4_6': 1, '5_6': 1, '6_6': 1, '7_6': 1, '8_6': 1, '9_6': 1};
		for(let i in g) {
			// return location where mine struck
			if(mineAt[g[i]] == 1) { 
				console.log('BOOM');
				return g[i]; 
			}
		}
		return false;
	},
		

	attackPlayer: function(coordinate){
		// Send a message requesting hit/miss value on enemy's grid
		// Inform all of enemy's coordinate status
	},

	setMine: function(coordinate){
		// Send a message requesting hit/miss value on enemy's grid
		// If not a hit register with service that mine placed on enemy grid
	},

	setMove: function(m){
		//let moveString;
		if(move.moveMap[m.coordinate] == undefined) {
			move.moveMap[m.coordinate] = move.moveList.length;
			//moveString = move.type + ': ' + move.coordinate;
			//let b = move.moveListBlock(move.coordinate, moveString);
			let mv = move.moveListBlock(m);
			move.moveList.push(mv);
			document.getElementById('playOrder').appendChild(mv.dom);
		}
	},

	getMoveSize: function(){
		return move.moveList.length;
	}
}

/*** battleshipOne.js ***/

fleet.init();
player.gameFlow();

/* Register */
// TODO - attach handler through pug; move handlers to another module
let r=document.getElementById('register');
r.addEventListener('click', 
    function(){
	    player.register();
	    //return;
    }, false);

let f=document.getElementById('setFleet');
f.addEventListener('click', 
    function(){
        document.getElementById('setFleet').style.display='none';
        document.getElementById('playerGrid').style.display='inline';
	grid.setMoveShip(); 
	    playGame();
	    //return;
    }, false);

// Set up link to resolve moves
let d=document.getElementById('doMoves');
d.addEventListener('click',
	function(){
		// Resolve orders
		move.resolveMoves();
		// Reset moves
		move.clearMoveList();
		// Turn moves over to the next player
		// FIXME - Simulating moves for now. Remove when ready for realsies

	}, false);
// Set up grid
document.getElementById('myGrid').appendChild(grid.clickableGrid(10, 10));

// Set up drag/drop of moves
//document.getElementById('playOrder').setAttribute('draggable','true');
//player.playerOrderHandler();

/* Set random fleet */
ships.buildShips();
ships.placeShips();
let wholeFleet = fleet.getWholeFleet();
for (let t in wholeFleet) {
	grid.displayShip(t);
}
/*
ships.buildShips();
ships.placeShips(fleet);
let wholeFleet = fleet.getWholeFleet(fleet);
for (let t in wholeFleet) {
	grid.displayShip(ships, t);
}
*/

/* 
 * Mock game will be removed 
 */
let m = document.getElementById('MeganReg');
m.addEventListener('click', 
    function(){
        player.acceptReg('Megan', 1);
        //m.style.display='none';
        document.getElementById('MeganReg').style.display='none';
	//document.getElementById(player.flow[player.currentFlow]).style.display='none';
        //m.appendChild(document.createElement('p'));
    }, false);

let ry = document.getElementById('RyanReg');
ry.addEventListener('click', 
    function(){
        player.acceptReg('Ryan', 2);
        document.getElementById('RyanReg').style.display='none';
        //let r=document.getElementById('Ryan').style.display='none';
        //r.appendChild(document.createElement('p'));
    }, false);

let tr = document.getElementById('TraceyReg');
tr.addEventListener('click', 
    function(){
        player.acceptReg('Tracey', 3);
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


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJhdHRsZXNoaXBPbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqKiBmbGVldC5qcyAqKiovXHJcbnZhciBmbGVldCA9IHtcclxuXHRuYXV0aWNhbE1hcDoge30sIC8vIEhhc2ggbG9va3VwIHRoYXQgdHJhY2tzIGVhY2ggc2hpcCdzIHN0YXJ0aW5nIHBvaW50IGFuZCBjdXJyZW50IG9yaWVudGF0aW9uXHJcblxyXG5cdGJ1aWxkTmF1dGljYWxDaGFydDogZnVuY3Rpb24oKXtcclxuXHRcdGxldCBjaGFydCA9IG5ldyBBcnJheTtcclxuXHRcdGZvcihsZXQgaT0wOyBpIDwgMTA7IGkrKykge1xyXG5cdFx0XHRjaGFydFtpXSA9IG5ldyBBcnJheTtcclxuXHRcdFx0Zm9yIChsZXQgaj0wOyBqIDwgMTA7IGorKyl7XHJcblx0XHRcdFx0Y2hhcnRbaV1bal0gPSB1bmRlZmluZWQ7Ly9uZXcgQXJyYXk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBjaGFydDtcclxuXHR9LFxyXG5cclxuXHQvKlxyXG5cdG5hdXRpY2FsQ2hhcnQ6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gZmxlZXQuYnVpbGROYXV0aWNhbENoYXJ0KCk7IC8vIERldGFpbGVkIG1hdHJpeCBvZiBldmVyeSBzaGlwIGluIHRoZSBmbGVldFxyXG5cdH0sXHJcblx0Ki9cclxuXHJcblx0aW5pdDogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBmbGVldC5uYXV0aWNhbENoYXJ0ID0gZmxlZXQuYnVpbGROYXV0aWNhbENoYXJ0KCk7IC8vIERldGFpbGVkIG1hdHJpeCBvZiBldmVyeSBzaGlwIGluIHRoZSBmbGVldFxyXG5cdH0sXHJcblxyXG5cdGdldEZsZWV0OiBmdW5jdGlvbih0eXBlKXtcclxuXHRcdGxldCBvcmllbnRhdGlvbiA9IGZsZWV0Lm5hdXRpY2FsTWFwW3R5cGVdLm9yaWVudGF0aW9uID09ICd4JyA/IDAgOiAxO1xyXG5cclxuXHRcdGxldCBwaWVjZXMgPSBmbGVldC5uYXV0aWNhbE1hcFt0eXBlXS5zdGFydF9jb29yZC5zcGxpdCgnXycpO1xyXG5cdFx0bGV0IHJldCA9IG5ldyBBcnJheTtcclxuXHJcblx0XHR3aGlsZSAocGllY2VzW29yaWVudGF0aW9uXSA8IGZsZWV0Lm5hdXRpY2FsQ2hhcnRbb3JpZW50YXRpb25dLmxlbmd0aCAmJiBmbGVldC5uYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gPT0gdHlwZSkge1xyXG5cdFx0XHRyZXQucHVzaCAocGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdKTtcclxuXHRcdFx0cGllY2VzW29yaWVudGF0aW9uXSA9IHBhcnNlSW50KHBpZWNlc1tvcmllbnRhdGlvbl0sIDEwKSArIDE7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIChyZXQpO1xyXG5cdH0sXHJcblxyXG5cdGdldFdob2xlRmxlZXQ6IGZ1bmN0aW9uKCl7XHJcblx0XHRsZXQgcmV0PXt9O1xyXG5cdFx0Zm9yIChsZXQgdCBpbiBmbGVldC5uYXV0aWNhbE1hcCkge1xyXG5cdFx0XHRyZXRbdF0gPSBmbGVldC5nZXRGbGVldCh0KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXQ7XHJcblx0fSxcclxuXHJcblx0Ly8gVE9ETyAtIHNldEZsZWV0OiBSZW1vdmUgcHJldmlvdXMgc2hpcCBmcm9tIGNoYXJ0IC0tIG1heSBiZSBkb25lLi4ubmVlZHMgdGVzdFxyXG5cdC8qXHJcblx0ICogc2V0RmxlZXQgLSBwbGFjZSBzaGlwIG9uIG5hdXRpY2FsIGNoYXJ0XHJcblx0ICovXHJcblx0c2V0RmxlZXQ6IGZ1bmN0aW9uIChvcmllbnRhdGlvbiwgdHlwZSwgc2l6ZSwgc3RhcnRfY29vcmQsIG9mZnNldCl7IFxyXG5cdFx0bGV0IHBpZWNlcyA9IHN0YXJ0X2Nvb3JkLnNwbGl0KCdfJyk7XHJcblx0ICAgIGxldCBpbmRleCA9IChvcmllbnRhdGlvbiA9PSAneCcpID8gMCA6IDE7XHJcblxyXG5cdCAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcclxuXHJcblx0ICAgIC8vIEFkanVzdCBmb3IgZHJhZy9kcm9wIHdoZW4gcGxheWVyIHBpY2tzIGEgc2hpcCBwaWVjZSBvdGhlciB0aGFuIHRoZSBoZWFkLlxyXG5cdCAgICBwaWVjZXNbaW5kZXhdID0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApIC0gb2Zmc2V0O1xyXG5cclxuXHQgICAgLypcclxuXHQgICAgICogUmVtb3ZlIG9sZCBzaGlwIGZyb20gbmF1dGljYWxDaGFydC9NYXBcclxuXHQgICAgICovXHJcblx0ICAgIGZsZWV0Ll9jbGVhclNoaXAodHlwZSwgc2l6ZSk7XHJcblxyXG5cdCAgICAvLyBzZXQgdGhlIG5hdXRpY2FsIG1hcCB2YWx1ZSBmb3IgdGhpcyBib2F0XHJcblx0ICAgIGZsZWV0Lm5hdXRpY2FsTWFwW3R5cGVdPXtcclxuXHRcdCAgICBvcmllbnRhdGlvbjogb3JpZW50YXRpb24sXHJcblx0XHQgICAgc3RhcnRfY29vcmQ6IHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXVxyXG5cdCAgICB9O1xyXG5cclxuXHQgICAgZm9yICh2YXIgaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XHJcblx0XHRmbGVldC5uYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gPSB0eXBlO1xyXG5cdFx0cGllY2VzW2luZGV4XT0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApICsxO1xyXG5cdCAgICB9XHJcblx0fSxcclxuXHJcblx0X2NsZWFyU2hpcDogZnVuY3Rpb24odHlwZSwgc2l6ZSl7XHJcblx0ICAgIGxldCBtYXAgPSBmbGVldC5uYXV0aWNhbE1hcFt0eXBlXTtcclxuXHQgICAgaWYgKG1hcCA9PT0gdW5kZWZpbmVkKXtyZXR1cm4gZmFsc2U7fVxyXG5cclxuXHQgICAgbGV0IHBpZWNlcyA9IG1hcC5zdGFydF9jb29yZC5zcGxpdCgnXycpO1xyXG5cdCAgICBsZXQgaW5kZXggPSAobWFwLm9yaWVudGF0aW9uID09ICd4JykgPyAwIDogMTtcclxuXHJcblx0ICAgIGZvciAobGV0IGk9MDsgaSA8IHNpemU7IGkrKykge1xyXG5cdFx0ICAgIGZsZWV0Lm5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXT11bmRlZmluZWQ7XHJcblx0XHQgICAgcGllY2VzW2luZGV4XSsrO1xyXG5cdCAgICB9XHJcblxyXG5cdCAgICBkZWxldGUgZmxlZXQubmF1dGljYWxNYXBbdHlwZV07XHJcblx0fSxcclxuXHJcblx0LypcclxuXHQgKiBnaG9zdFNoaXAgLSBCZWZvcmUgcHV0dGluZyBhIHNoaXAgb24gdGhlIGNoYXJ0IGl0J3MgcG90ZW50aWFsIGxvY2F0aW9uIG5lZWRzIHRvIGJlIHBsb3R0ZWQgc28gaXQgY2FuIGJlXHJcblx0ICogY2hlY2tlZCBmb3IgdmFsaWRpdHkuIEdpdmVuIGEgc2hpcCB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHRoZSBwb3RlbnRpYWwgcGxvdHRlZCBjb29yZGluYXRlcy4gVGhlIGZ1bmN0aW9uXHJcblx0ICogbWF5IGJ1aWxkIGNvb3JkaW5hdGVzIGZvciBhIGtub3duIHNoaXAgb3IgZm9yIG9uZSBtb3ZlZCBhcm91bmQgb24gdGhlIGdyaWQuXHJcblx0ICovXHJcblx0Z2hvc3RTaGlwOiBmdW5jdGlvbih0eXBlLCBjb29yZGluYXRlLCBvcmllbnRhdGlvbiwgc2l6ZSwgb2Zmc2V0KXtcclxuXHRcdGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuXHRcdGxldCB0aGlzU2hpcCA9IGZsZWV0LnJlYWRNYXAodHlwZSk7XHJcblx0XHRsZXQgZ2hvc3QgPSBbXTtcclxuXHRcdGNvb3JkaW5hdGUgPSBjb29yZGluYXRlIHx8IHRoaXNTaGlwLnN0YXJ0X2Nvb3JkO1xyXG5cdFx0b3JpZW50YXRpb24gPSBvcmllbnRhdGlvbiB8fCB0aGlzU2hpcC5vcmllbnRhdGlvbjtcclxuXHRcdHNpemUgPSBzaXplIHx8IHNoaXAuc2l6ZTtcclxuXHRcdG9mZnNldCA9IG9mZnNldCB8fCAwO1xyXG5cclxuXHRcdGxldCBwaWVjZXMgPSBjb29yZGluYXRlLnNwbGl0KCdfJyk7XHJcblx0XHRsZXQgaW5kZXggPSAob3JpZW50YXRpb24gPT0gJ3gnKSA/IDA6IDE7XHJcblx0XHRwaWVjZXNbaW5kZXhdID0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApIC0gb2Zmc2V0O1xyXG5cdFx0Zm9yIChsZXQgaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XHJcblx0XHRcdGdob3N0LnB1c2gocGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdKTtcclxuXHRcdFx0cGllY2VzW2luZGV4XSA9IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSArMTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBnaG9zdDtcclxuXHR9LFxyXG5cclxuXHRyZWFkTWFwOiBmdW5jdGlvbih0eXBlKXtcclxuXHRcdHJldHVybiBmbGVldC5uYXV0aWNhbE1hcFt0eXBlXTtcclxuXHR9LFxyXG5cclxuXHQvKlxyXG5cdCAqIEdpdmVuIGEgY29vcmRpbmF0ZSBvciBhbiBhcnJheSBvZiBjb29yZGluYXRlcyByZXR1cm4gdGhlIHNhbWUgc3RydWN0dXJlIHJldmVhbGluZyB0aGUgY29udGVudHMgb2YgdGhlIGdyaWQuXHJcblx0ICogV2lsbCByZXR1cm4gYSB2YWx1ZSBvZiBmYWxzZSBpZiB0aGVyZSBpcyBhIHByb2JsZW0gY2hlY2tpbmcgdGhlIGdyaWQgKGV4LiBjb29yZHMgYXJlIG91dCBvZiByYW5nZSkuXHJcblx0ICovXHJcblx0Y2hlY2tHcmlkOiBmdW5jdGlvbihjb29yZGluYXRlcyl7XHJcblx0XHRpZiAoY29vcmRpbmF0ZXMgaW5zdGFuY2VvZiBBcnJheSl7XHJcblx0XHRcdGxldCByZXQgPSBuZXcgQXJyYXk7XHJcblx0XHRcdGZvcihsZXQgYyBpbiBjb29yZGluYXRlcyl7XHJcblx0XHRcdFx0bGV0IHMgPSBmbGVldC5fc2V0Q2hhcnQoY29vcmRpbmF0ZXNbY10pO1xyXG5cdFx0XHRcdGlmIChzID09PSBmYWxzZSkge3JldHVybiBmYWxzZX07XHJcblx0XHRcdFx0cmV0LnB1c2ggKHMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiByZXQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gZmxlZXQuX3NldENoYXJ0KGNvb3JkaW5hdGVzKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfc2V0Q2hhcnQ6IGZ1bmN0aW9uKGNvb3JkaW5hdGUpe1xyXG5cdFx0bGV0IHBpZWNlcyA9IGNvb3JkaW5hdGUuc3BsaXQoJ18nKTtcclxuXHRcdGlmIChwYXJzZUludChwaWVjZXNbMF0sIDEwKSA+PSBmbGVldC5uYXV0aWNhbENoYXJ0Lmxlbmd0aCB8fFxyXG5cdFx0ICAgIHBhcnNlSW50KHBpZWNlc1sxXSwgMTApPj0gZmxlZXQubmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV0ubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZmxlZXQubmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldO1xyXG5cdH0sXHJcblxyXG5cdC8qIFxyXG5cdCAqIEdpdmVuIGEgbGlzdCBvZiBjb29yZGluYXRlcyBhbmQgYSBzaGlwIHR5cGUgdmFsaWRhdGUgdGhhdCB0aGUgY29vcmRpbmF0ZXMgZG8gbm90IHZpb2xhdGUgdGhlIHJ1bGVzIG9mOlxyXG5cdCAqIFx0KiBzaGlwIG11c3QgYmUgb24gdGhlIGdyaWRcclxuXHQgKiBcdCogc2hpcCBtdXN0IG5vdCBvY2N1cHkgdGhlIHNhbWUgc3F1YXJlIGFzIGFueSBvdGhlciBzaGlwXHJcblx0ICovXHJcblx0dmFsaWRhdGVTaGlwOiBmdW5jdGlvbiAoY29vcmRpbmF0ZXMsIHR5cGUpe1xyXG5cdCAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIG90aGVyIGJvYXRzIGFscmVhZHkgb24gYW55IGEgc3BhY2VcclxuXHQgICAgZm9yICh2YXIgcD0wOyBwIDwgY29vcmRpbmF0ZXMubGVuZ3RoOyBwKyspIHtcclxuXHJcblx0XHQvLyBJcyB0aGVyZSBhIGNvbGxpc2lvbj9cclxuXHRcdGxldCBjb2xsaXNpb24gPSBmbGVldC5jaGVja0dyaWQoY29vcmRpbmF0ZXMpO1xyXG5cdFx0XHJcblx0XHRpZiAoY29sbGlzaW9uID09IGZhbHNlKSB7cmV0dXJuIGZhbHNlfTsgLy8gSWYgY2hlY2tHcmlkIHJldHVybnMgZmFsc2UgY29vcmRpbmF0ZXMgYXJlIG91dCBvZiByYW5nZVxyXG5cclxuXHRcdGZvciAobGV0IGMgaW4gY29vcmRpbmF0ZXMpIHtcclxuXHRcdFx0bGV0IHBpZWNlcyA9IGNvb3JkaW5hdGVzW2NdLnNwbGl0KCdfJyk7XHJcblx0XHRcdFx0aWYgKGZsZWV0Lm5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSAhPSB0eXBlICYmXHJcblx0XHRcdFx0ICAgIGZsZWV0Lm5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSAhPSB1bmRlZmluZWQpIHtyZXR1cm4gZmFsc2V9O1xyXG5cdFx0fVxyXG5cdCAgICB9XHJcblx0ICAgIHJldHVybiB0cnVlO1xyXG5cdH0sXHJcbn07XHJcblxyXG4vKioqIGdyaWQuanMgKioqL1xyXG5sZXQgZ3JpZCA9IHtcclxuXHJcblx0bW92ZVNoaXA6IGZ1bmN0aW9uKGRyb3BPYmosIGV2KXtcclxuXHQgICAgY29uc29sZS5sb2coJ3ByZS1zZXQgZmxlZXQgbW92ZScpO1xyXG5cdCAgICBsZXQgc2hpcD1zaGlwcy5nZXRTaGlwKGRyb3BPYmoudHlwZSk7XHJcblx0ICAgIC8vIFJlbW92ZSBpbml0aWFsIGltYWdlXHJcblx0ICAgIGdyaWQuZGlzcGxheVNoaXAoZHJvcE9iai50eXBlKTtcclxuXHJcblx0ICAgIGZsZWV0LnNldEZsZWV0IChkcm9wT2JqLm9yaWVudGF0aW9uLCBkcm9wT2JqLnR5cGUsIHNoaXAuc2l6ZSwgZXYudGFyZ2V0LmlkLCBkcm9wT2JqLm9mZnNldCk7IFxyXG5cclxuXHQgICAgLy8gUmVkcmF3IGltYWdlIGluIG5ldyBsb2NhdGlvblxyXG5cdCAgICBncmlkLmRpc3BsYXlTaGlwKGRyb3BPYmoudHlwZSk7XHJcblx0fSxcclxuXHJcblx0LypcclxuXHQgKiBDYWxsZWQgYWZ0ZXIgcGxheWVyIHNldHMgaW5pdGlhbCBmbGVldC4gT3ZlcndyaXRlIHRoZSBtb3ZlU2hpcCBmdW5jdGlvbiBzbyBpdCBiZWhhdmVzIGRpZmZlcmVudC5cclxuXHQgKi9cclxuXHRzZXRNb3ZlU2hpcDogZnVuY3Rpb24oKXtcclxuXHRcdC8qIGNoYW5nZSB2YWx1ZSBvZiBtb3ZlU2hpcCBmdW5jdGlvbiAqL1xyXG5cdFx0Z3JpZC5tb3ZlU2hpcCA9IGZ1bmN0aW9uKGRyb3BPYmosIGV2LCBkcm9wU2hpcCwgbW92ZVR5cGUpe1xyXG5cdFx0ICAgIGNvbnNvbGUubG9nKCdJbiBnYW1lIG1vdmUnKTtcclxuXHRcdCAgICAvLyBSZW1vdmUgaW5pdGlhbCBpbWFnZVxyXG5cdFx0ICAgIGdyaWQuZGlzcGxheVNoaXAoZHJvcE9iai50eXBlKTtcclxuXHJcblx0XHQgICAgLy8gZHJhdyBpbWFnZSBiYXNlZCBvbiBkcm9wU2hpcFxyXG5cdFx0ICAgIGdyaWQuZGlzcGxheVNoaXAoZHJvcE9iai50eXBlLCBkcm9wU2hpcCk7XHJcblxyXG5cdFx0ICAgIC8vIFN0b3JlIGdob3N0U2hpcCBpbiBtb3ZlIG9iamVjdFxyXG5cdFx0ICAgIHBsYXllci5zZXRNb3ZlKHsgdHlwZTogbW92ZVR5cGUsIFxyXG5cdFx0XHRcdCAgICAgY29vcmRpbmF0ZTogZXYudGFyZ2V0LmlkLCBcclxuXHRcdFx0XHQgICAgIGdob3N0OiBkcm9wU2hpcCxcclxuXHRcdFx0XHQgICAgIG9yaWVudGF0aW9uOiBkcm9wT2JqLm9yaWVudGF0aW9uLCBcclxuXHRcdFx0XHQgICAgIHNoaXBUeXBlOiBkcm9wT2JqLnR5cGUsXHJcblx0XHRcdFx0ICAgICB1bmRvOiBmbGVldC5naG9zdFNoaXAoZHJvcE9iai50eXBlKSAvLyBOZWVkIHRvIHByZXNlcnZlIHRoZSBzaGlwJ3MgcG9zaXRpb24gcHJlLW1vdmVcclxuXHRcdCAgICB9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvKlxyXG5cdCAqIEJ1aWxkIHRoZSBncmlkIGFuZCBhdHRhY2ggaGFuZGxlcnMgZm9yIGRyYWcvZHJvcCBldmVudHNcclxuXHQgKi9cclxuXHRjbGlja2FibGVHcmlkOiBmdW5jdGlvbiAoIHJvd3MsIGNvbHMsIHBoYW5kbGUpe1xyXG5cdCAgICBsZXQgZ3JpZFRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuXHQgICAgZ3JpZFRhYmxlLmNsYXNzTmFtZT0nZ3JpZCc7XHJcblx0ICAgIGZvciAodmFyIHI9MDtyPHJvd3M7KytyKXtcclxuXHRcdHZhciB0ciA9IGdyaWRUYWJsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpKTtcclxuXHRcdGZvciAodmFyIGM9MDtjPGNvbHM7KytjKXtcclxuXHRcdCAgICB2YXIgY2VsbCA9IHRyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJykpO1xyXG5cdFx0ICAgIC8vIEVhY2ggY2VsbCBvbiB0aGUgZ3JpZCBpcyBvZiBjbGFzcyAnY2VsbCdcclxuXHRcdCAgICBjZWxsLmNsYXNzTmFtZT0nY2VsbCc7XHJcblxyXG5cdFx0ICAgIC8vIFNldCB0aGUgSUQgdmFsdWUgb2YgZWFjaCBjZWxsIHRvIHRoZSByb3cvY29sdW1uIHZhbHVlIGZvcm1hdHRlZCBhcyByX2NcclxuXHRcdCAgICBjZWxsLmlkID0gciArICdfJyArIGM7XHJcblxyXG5cdFx0ICAgIGlmIChwaGFuZGxlID09IHVuZGVmaW5lZCl7XHJcblx0XHRcdGdyaWQuX3NldE15TGlzdGVuZXJzKGNlbGwpXHJcblx0XHQgICAgfSBlbHNlIHtcclxuXHRcdCAgICAgICBncmlkLl9zZXRQbGF5ZXJMaXN0ZW5lcnMoY2VsbCwgcGhhbmRsZSk7XHJcblx0XHQgICAgfVxyXG5cdFx0fVxyXG5cdCAgICB9XHJcblx0ICAgIHJldHVybiBncmlkVGFibGU7XHJcblx0fSxcclxuXHJcblx0X3NldE15TGlzdGVuZXJzOiBmdW5jdGlvbihjZWxsKXtcclxuXHRcdCAgICAvLyBTZXQgdXAgZHJhZyBhbmQgZHJvcCBmb3IgZWFjaCBjZWxsLlxyXG5cdFx0ICAgIGNlbGwuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCd0cnVlJyk7XHJcblxyXG5cdFx0ICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywoXHJcblx0XHRcdGZ1bmN0aW9uKGV2KXtcclxuXHRcdFx0ICAgIGV2LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkPSdtb3ZlJztcclxuXHRcdFx0ICAgIGxldCB0eXBlID0gZ3JpZC5fZ2V0VHlwZUJ5Q2xhc3ModGhpcy5jbGFzc05hbWUpO1xyXG5cdFx0XHQgICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG5cclxuXHRcdFx0ICAgIC8vIENhbGN1bGF0ZSB3aGljaCBzcXVhcmUgd2FzIGNsaWNrZWQgdG8gZ3VpZGUgcGxhY2VtZW50XHJcblx0XHRcdCAgICBsZXQgc3RhcnQgPSBncmlkLl9maW5kX3N0YXJ0KHRoaXMuaWQsIHNoaXAub3JpZW50YXRpb24sIHNoaXAuc2l6ZSwgdHlwZSk7XHJcblx0XHRcdCAgICBldi5kYXRhVHJhbnNmZXIuc2V0RGF0YShcInRleHQvcGxhaW5cIiwgXHJcblx0XHRcdFx0SlNPTi5zdHJpbmdpZnkoe1xyXG5cdFx0XHRcdFx0XHRvZmZzZXQ6ICAgICAgICBzdGFydC5vZmZzZXQsXHJcblx0XHRcdFx0XHRcdHN0YXJ0X2Nvb3JkOiAgIHN0YXJ0LnN0YXJ0X2Nvb3JkLFxyXG5cdFx0XHRcdFx0XHRpbmRleDogICAgICAgICBzaGlwLnNpemUsXHJcblx0XHRcdFx0XHRcdHR5cGU6ICAgICAgICAgIHR5cGUsXHJcblx0XHRcdFx0XHRcdGN1cnJlbnRfY29vcmQ6IGZsZWV0Lmdob3N0U2hpcCh0eXBlLCBzdGFydC5zdGFydF9jb29yZCksXHJcblx0XHRcdFx0XHRcdG9yaWVudGF0aW9uOiAgIHNoaXAub3JpZW50YXRpb25cclxuXHRcdFx0XHRcdCAgICAgICB9KVxyXG5cdFx0XHQgICAgKTtcclxuXHRcdFx0fSlcclxuXHRcdCAgICApO1xyXG5cclxuXHRcdCAgICAvLyBBZGQgRHJhZy9Ecm9wIGNhcGFiaWxpdGllc1xyXG5cdFx0ICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsKFxyXG5cdFx0XHRmdW5jdGlvbihldil7XHJcblx0XHRcdCAgICBjb25zb2xlLmxvZygnZHJvcHBpbmcnKTtcclxuXHRcdFx0ICAgIGxldCBkcm9wT2JqID0gSlNPTi5wYXJzZShldi5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvcGxhaW5cIikpO1xyXG5cdFx0XHQgICAgY29uc29sZS5sb2coJ2N1cnJlbnQgY29vcmQ6ICcsIGRyb3BPYmouY3VycmVudF9jb29yZCk7XHJcblx0XHRcdCAgICBsZXQgc2hpcD1zaGlwcy5nZXRTaGlwKGRyb3BPYmoudHlwZSk7XHJcblx0XHRcdCAgICBsZXQgZHJvcFNoaXAgPSBmbGVldC5naG9zdFNoaXAoZHJvcE9iai50eXBlLCBldi50YXJnZXQuaWQsIGRyb3BPYmoub3JpZW50YXRpb24sIHNoaXAuc2l6ZSwgZHJvcE9iai5vZmZzZXQpO1xyXG5cclxuXHRcdFx0ICAgIGlmKGZsZWV0LnZhbGlkYXRlU2hpcChkcm9wU2hpcCwgZHJvcE9iai50eXBlKSkge1xyXG5cdFx0XHRcdCAgICAvKiBUaGVyZSBhcmUgZGlmZmVyZW50IGJlaGF2aW9ycyBmb3Igc2V0dGluZyBzaGlwcyBiYXNlZCBvbiB0aGUgaW5pdGlhbCBsb2FkaW5nIG9mIHRoZSBzaGlwc1xyXG5cdFx0XHRcdCAgICAgKiB2ZXJzdXMgbW92aW5nIGEgc2hpcCBpbiBnYW1lLiBXaGVuIG1vdmluZyBzaGlwcyBpbiBnYW1lIHRoZSBkaXNwbGF5IHNob3VsZCBjaGFuZ2UgdG8gcmVmbGVjdFxyXG5cdFx0XHRcdCAgICAgKiB0aGUgcG90ZW50aWFsIG1vdmUgYnV0IHRoZSBpbnRlcm5hbCBzdHJ1Y3R1cmVzIHNob3VsZCBub3QgY2hhbmdlIHVudGlsIGl0IGhhcyBiZWVuIHZhbGlkYXRlZFxyXG5cdFx0XHRcdCAgICAgKiB3aGVuIHJlc29sdmluZyBtb3Zlcy5cclxuXHRcdFx0XHQgICAgICpcclxuXHRcdFx0XHQgICAgICogV2hlbiBzZXR0aW5nIHVwIHNoaXBzIGZvciB0aGUgaW5pdGlhbCBnYW0gdGhlIHN0cnVjdHVyZXMgc2hvdWxkIGNoYW5nZSBhbG9uZyB3aXRoIHRoZSBkaXNwbGF5LFxyXG5cdFx0XHRcdCAgICAgKiBhbGwgYXQgb25jZS5cclxuXHRcdFx0XHQgICAgICpcclxuXHRcdFx0XHQgICAgICogVGhlIGZ1bmN0aW9uIG1vdmVTaGlwIGlzIGEgY2xvc3VyZSB3aG9zZSB2YWx1ZSBpcyBjaGFuZ2VkIG9uY2UgdGhlIHBsYXllciBzZXRzIHRoZSBpbml0aWFsIGZsZWV0LlxyXG5cdFx0XHRcdCAgICAgKi9cclxuXHRcdFx0XHQgICAgaWYocGxheWVyLmNhbk1vdmUoKSkge2dyaWQubW92ZVNoaXAoZHJvcE9iaiwgZXYsIGRyb3BTaGlwLCAnbW92ZScpfTtcclxuXHRcdFx0ICAgIH1cclxuXHJcblx0XHRcdCAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHRcdFx0ICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdCAgICByZXR1cm4gZmFsc2U7XHJcblx0XHRcdCAgICB9XHJcblx0XHRcdClcclxuXHRcdCAgICApO1xyXG5cclxuXHRcdCAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywoXHJcblx0XHRcdGZ1bmN0aW9uKGV2KXtcclxuXHRcdFx0ICAgIGNvbnNvbGUubG9nKCdkcmFnb3ZlcicpO1xyXG5cdFx0XHQgICAgZXYucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0ICAgIGV2LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0PSdtb3ZlJztcclxuXHRcdFx0ICAgIHJldHVybiBmYWxzZTtcclxuXHRcdFx0ICAgIH1cclxuXHRcdFx0KSk7XHJcblxyXG5cdFx0ICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoXHJcblx0XHRcdGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHQgICAgbGV0IGRyb3AgPSB7fTtcclxuXHRcdFx0ICAgIGxldCB0eXBlID0gZ3JpZC5fZ2V0VHlwZUJ5Q2xhc3ModGhpcy5jbGFzc05hbWUpO1xyXG5cdFx0XHQgICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG5cdFx0XHQgICAgbGV0IHN0YXJ0ID0gZ3JpZC5fZmluZF9zdGFydChlLnRhcmdldC5pZCwgc2hpcC5vcmllbnRhdGlvbiwgc2hpcC5zaXplLCB0eXBlKTtcclxuXHRcdFx0ICAgIGxldCBvcmllbnRhdGlvbiA9IChzaGlwLm9yaWVudGF0aW9uID09ICd4JykgPyAneSc6J3gnOyAvLyBmbGlwIHRoZSBvcmllbnRhdGlvblxyXG5cdFx0XHQgICAgLy9sZXQgZ2hvc3QgPSBmbGVldC5naG9zdFNoaXAodHlwZSwgZS50YXJnZXQuaWQsIG9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHN0YXJ0Lm9mZnNldCk7XHJcblx0XHRcdCAgICBsZXQgZ2hvc3QgPSBmbGVldC5naG9zdFNoaXAodHlwZSwgZS50YXJnZXQuaWQsIG9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHN0YXJ0Lm9mZnNldCk7XHJcblxyXG5cdFx0XHQgICAgZHJvcC50eXBlID0gdHlwZTtcclxuXHRcdFx0ICAgIGRyb3Aub2Zmc2V0ID0gc3RhcnQub2Zmc2V0O1xyXG5cdFx0XHQgICAgZHJvcC5vcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xyXG5cclxuXHRcdFx0ICAgIGlmKGZsZWV0LnZhbGlkYXRlU2hpcChnaG9zdCwgdHlwZSkpIHtcclxuXHRcdFx0XHRpZihwbGF5ZXIuY2FuTW92ZSgpKSB7XHJcblx0XHRcdFx0ICAgIHNoaXAub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcclxuXHRcdFx0XHQgICAgZ3JpZC5tb3ZlU2hpcChkcm9wLCBlLCBnaG9zdCwgJ3Bpdm90Jyl9O1xyXG5cdFx0XHQgICAgfVxyXG5cdFx0XHR9KSk7XHJcblx0fSxcclxuXHJcblx0X3NldFBsYXllckxpc3RlbmVyczogZnVuY3Rpb24oY2VsbCwgaGFuZGxlKXtcclxuXHRcdCAgICAvLyBTZXQgdGhlIElEIHZhbHVlIG9mIGVhY2ggY2VsbCB0byB0aGUgcm93L2NvbHVtbiB2YWx1ZSBmb3JtYXR0ZWQgYXMgcl9jXHJcblx0XHQgICAgY2VsbC5pZCA9IGhhbmRsZSArICdfJyArIGNlbGwuaWQ7XHJcblx0XHQgICAgLy8gU2V0IHVwIGRyYWcgYW5kIGRyb3AgZm9yIGVhY2ggY2VsbC5cclxuXHJcblx0XHQgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChcclxuXHRcdFx0ZnVuY3Rpb24oZSl7XHJcblx0XHRcdCAgICBpZihwbGF5ZXIuY2FuTW92ZSgpKSB7XHJcblx0XHRcdFx0bW92ZS5zZXRNb3ZlKHt0eXBlOiAnYXR0YWNrJyxcclxuXHRcdFx0XHRcdCAgICAgIGNvb3JkaW5hdGU6IGUudGFyZ2V0LmlkfSk7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coIGUudGFyZ2V0LmlkICsgJyBpcyB1bmRlciBhdHRhY2snKTtcclxuXHRcdFx0ICAgIH1cclxuXHRcdFx0fVxyXG5cdFx0ICAgICkpO1xyXG5cdH0sXHJcblxyXG5cdC8qXHJcblx0ICogX2ZpbmRfc3RhcnQgLSBEZXRlcm1pbmUgdGhlIHN0YXJ0aW5nIGNvb3JkaW5hdGUgb2YgYSBzaGlwIGdpdmVuIHRoZSBzcXVhcmUgdGhhdCB3YXMgY2xpY2tlZC4gRm9yIGV4YW1wbGVcclxuXHQgKiBpdCBpcyBwb3NzaWJsZSB0aGF0IGEgYmF0dGxlc2hpcCBhbG9uZyB0aGUgeC1heGlzIHdhcyBjbGlja2VkIGF0IGxvY2F0aW9uIDNfMyBidXQgdGhhdCB3YXMgdGhlIHNlY29uZCBzcXVhcmVcclxuXHQgKiBvbiB0aGUgc2hpcC4gVGhpcyBmdW5jdGlvbiB3aWxsIGlkZW50aWZ5IHRoYXQgdGhlIGJhdHRsZXNoaXAgc3RhcnRzIGF0IDJfMy5cclxuXHQgKi9cclxuXHJcblx0X2ZpbmRfc3RhcnQ6IGZ1bmN0aW9uKHN0YXJ0X3Bvcywgb3JpZW50YXRpb24sIHNpemUsIHR5cGUpe1xyXG5cdCAgICBsZXQgaW5kZXggPSAob3JpZW50YXRpb24gPT0gJ3gnKSA/IDAgOiAxO1xyXG5cclxuXHQgICAgbGV0IHBpZWNlcz1zdGFydF9wb3Muc3BsaXQoJ18nKTtcclxuXHQgICAgbGV0IG9mZnNldCA9IDA7XHJcblxyXG5cdCAgICBmb3IgKGxldCBpPTA7IGkgPCBzaXplOyBpKyspIHtcclxuXHRcdGlmIChwaWVjZXNbaW5kZXhdID09IDApIHticmVhazt9XHJcblx0XHRwaWVjZXNbaW5kZXhdLS07XHJcblx0XHRsZXQgZyA9IGZsZWV0LmNoZWNrR3JpZChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xyXG5cdFx0Ly9pZiAoZyAhPSB1bmRlZmluZWQgJiYgZyA9PSB0eXBlICYmIGcgIT0gZmFsc2Upe31cclxuXHRcdGlmIChnID09IHR5cGUgJiYgZyAhPSBmYWxzZSl7XHJcblx0XHQgICAgb2Zmc2V0Kys7XHJcblx0XHQgICAgc3RhcnRfcG9zID0gcGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdCAgICBicmVhaztcclxuXHRcdH1cclxuXHQgICAgfVxyXG5cclxuXHQgICAgcmV0dXJuIHtzdGFydF9wb3M6IHN0YXJ0X3Bvcywgb2Zmc2V0OiBvZmZzZXR9O1xyXG5cdH0sXHJcblxyXG5cdGRpc3BsYXlTaGlwOiBmdW5jdGlvbiAodHlwZSwgYykge1xyXG5cdCAgICBsZXQgY29vcmRpbmF0ZXMgPSBjIHx8IGZsZWV0LmdldEZsZWV0KHR5cGUpO1xyXG5cdCAgICBsZXQgc2hpcCA9IHNoaXBzLmdldFNoaXAodHlwZSk7XHJcblxyXG5cdCAgICBmb3IgKGxldCBjb29yZCBpbiBjb29yZGluYXRlcykge1xyXG5cdFx0Z3JpZC5fc2V0U3BhY2UoY29vcmRpbmF0ZXNbY29vcmRdLCBzaGlwLmNsaWNrQ2xhc3MpO1xyXG5cdCAgICB9XHJcblx0fSxcclxuXHJcblx0X3NldFNwYWNlOiBmdW5jdGlvbihzcGFjZSwgY2xhc3NOYW1lKSB7XHJcblx0ICAgIHZhciBiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3BhY2UpOyBcclxuXHQgICAgYi5jbGFzc0xpc3QudG9nZ2xlKGNsYXNzTmFtZSk7XHJcblx0fSxcclxuXHJcblx0X2dldFR5cGVCeUNsYXNzOiBmdW5jdGlvbihjbGFzc05hbWUpe1xyXG5cdFx0bGV0IHNoaXBMaXN0ID0gc2hpcHMuZ2V0U2hpcCgpO1xyXG5cdFx0Zm9yIChsZXQgcyBpbiBzaGlwTGlzdCl7XHJcblx0XHRcdGlmIChjbGFzc05hbWUubWF0Y2goc2hpcExpc3Rbc10uY2xpY2tDbGFzcykpe1xyXG5cdFx0XHRcdHJldHVybiBzO1xyXG5cdFx0XHRcdC8vcmV0dXJuIHNoaXBMaXN0W3NdLnR5cGU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbi8qKiogc2hpcHMuanMgKioqL1xyXG5sZXQgc2hpcHMgPSB7XHJcblx0Ly8gQ29uZmlnIHNldHRpbmdzIFxyXG5cdHNoaXBfY29uZmlnOiB7XHJcblx0ICAgIGFpcmNyYWZ0Q2FycmllciA6IHtcclxuXHRcdHNpemUgOiA1LFxyXG5cdFx0aWQgOiAnYWlyY3JhZnRDYXJyaWVyJyxcclxuXHRcdGNvbG9yIDogJ0NyaW1zb24nLFxyXG5cdFx0Y2xpY2tDbGFzcyA6ICdhY2NsaWNrZWQnLFxyXG5cdFx0bGFiZWwgOiAnQWlyY3JhZnQgQ2FycmllcicsXHJcblx0XHRtYXNrIDogMzEsXHJcblx0ICAgIH0sXHJcblx0ICAgIGJhdHRsZXNoaXAgOiB7XHJcblx0XHRzaXplIDogNCxcclxuXHRcdGlkIDogJ2JhdHRsZXNoaXAnLFxyXG5cdFx0Y29sb3I6J0RhcmtHcmVlbicsXHJcblx0XHRjbGlja0NsYXNzIDogJ2JzY2xpY2tlZCcsXHJcblx0XHRsYWJlbCA6ICdCYXR0bGVzaGlwJyxcclxuXHRcdG1hc2s6IDE1LFxyXG5cdCAgICB9LFxyXG5cdCAgICBkZXN0cm95ZXIgOiB7XHJcblx0XHRzaXplIDogMyxcclxuXHRcdGlkIDogJ2Rlc3Ryb3llcicsXHJcblx0XHRjb2xvcjonQ2FkZXRCbHVlJyxcclxuXHRcdGNsaWNrQ2xhc3MgOiAnZGVjbGlja2VkJyxcclxuXHRcdGxhYmVsIDogJ0Rlc3Ryb3llcicsXHJcblx0XHRtYXNrOiA3LFxyXG5cdCAgICB9LFxyXG5cdCAgICBzdWJtYXJpbmUgIDoge1xyXG5cdFx0c2l6ZSA6IDMsXHJcblx0XHRpZCA6ICdzdWJtYXJpbmUnLFxyXG5cdFx0Y29sb3I6J0RhcmtSZWQnLFxyXG5cdFx0Y2xpY2tDbGFzcyA6ICdzdWNsaWNrZWQnLFxyXG5cdFx0bGFiZWwgOiAnU3VibWFyaW5lJyxcclxuXHRcdG1hc2sgOiA3LFxyXG5cdCAgICB9LFxyXG5cdCAgICBwYXRyb2xCb2F0IDoge1xyXG5cdFx0c2l6ZSA6IDIsXHJcblx0XHRpZCA6ICdwYXRyb2xCb2F0JyxcclxuXHRcdGNvbG9yOidHb2xkJyxcclxuXHRcdGNsaWNrQ2xhc3MgOiAncGJjbGlja2VkJyxcclxuXHRcdGxhYmVsIDogJ1BhdHJvbCBCb2F0JyxcclxuXHRcdG1hc2s6IDMsXHJcblx0ICAgIH0sXHJcblx0fSxcclxuXHJcblx0aGl0Q291bnRlcjoge1xyXG5cdCAgICBhaXJjcmFmdENhcnJpZXIgOiAwLFxyXG5cdCAgICBiYXR0bGVzaGlwIDogMCxcclxuXHQgICAgZGVzdHJveWVyIDogMCxcclxuXHQgICAgc3VibWFyaW5lICA6IDAsXHJcblx0ICAgIHBhdHJvbEJvYXQgOiAwXHJcblx0fSxcclxuXHJcblx0c3Vua0NvdW50ZXI6IHt9LCAvLyBUcmFja3Mgd2hpY2ggYm9hdHMgaGF2ZSBiZWVuIHN1bmtcclxuXHJcblx0Ly8gVmFsdWVzIGZvciBkZXRlcm1pbmluZyBiaXQgdmFsdWVzIHdoZW4gYSBib2F0IHNpbmtzXHJcblx0YWlyQ3JhZnRDYXJyaWVyOiAxLFxyXG5cdGJhdHRsZXNoaXA6IDIsXHJcblx0ZGVzdHJveWVyOiA0LFxyXG5cdHN1Ym1hcmluZTogOCxcclxuXHRwYXRyb2xCb2F0OiAxNixcclxuXHJcblx0c2V0SGl0Q291bnRlcjogZnVuY3Rpb24gKHR5cGUsIGJpdCkge1xyXG5cdFx0c2hpcHMuaGl0Q291bnRlclt0eXBlXSA9IHNoaXBzLnNoaXBfY29uZmlnW3R5cGVdLm1hc2teKGJpdCpiaXQpO1xyXG5cdFx0aWYgKHNoaXBzLmhpdENvdW50ZXJbdHlwZV0gPT0gc2hpcHMuc2hpcF9jb25maWdbdHlwZV0ubWFzaykgeyAvLyBJIGRvbid0IGtub3cgaWYgdGhpcyBpcyBjb3JyZWN0IGJ1dCB0aGUgaWRlYSBpcyBjaGVjayB0byBzZWUgaWYgdGhlIHNoaXAgaXMgc3VuayBhbmQgZmxhZyBpdCBpZiBuZWVkIGJlXHJcblx0XHRcdHNoaXBzLnNldFN1bmtDb3VudGVyKHR5cGUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdHNldFN1bmtDb3VudGVyOiBmdW5jdGlvbiAodHlwZSkge1xyXG5cdFx0c2hpcHMuc3Vua0NvdW50ZXIgPSBzaGlwcy5zdW5rQ291bnRlcl50eXBlO1xyXG5cdH0sXHJcblxyXG5cdGdldEhpdENvdW50ZXI6IGZ1bmN0aW9uICh0eXBlKXtcclxuXHRcdHJldHVybiBzaGlwcy5oaXRDb3VudGVyW3R5cGVdO1xyXG5cdH0sXHJcblxyXG5cdGdldFN1bmtDb3VudGVyOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHNoaXBzLnN1bmtDb3VudGVyO1xyXG5cdH0sXHJcblxyXG5cdC8vIFNoaXAgY29uc3RydWN0b3IgLSBzaGlweWFyZD8/P1xyXG5cdF9zaGlwOiBmdW5jdGlvbihzaXplLCBpZCwgY29sb3IsIGNsaWNrQ2xhc3MsIGxhYmVsKSB7XHJcblx0XHR0aGlzLnNpemUgICAgICAgID0gc2l6ZTtcclxuXHRcdHRoaXMuaWQgICAgICAgICAgPSBpZDtcclxuXHRcdHRoaXMuY29sb3IgICAgICAgPSBjb2xvcjtcclxuXHRcdHRoaXMuY2xpY2tDbGFzcyAgPSBjbGlja0NsYXNzO1xyXG5cdFx0dGhpcy5sYWJlbCAgICAgICA9IGxhYmVsO1xyXG5cclxuXHRcdHJldHVybiAodGhpcyk7XHJcblx0fSxcclxuXHJcblx0Ly9zaGlwczoge30sXHJcblxyXG5cdC8qXHJcblx0ICogVGhlIHNoaXAgb2JqZWN0IGhvbGRzIHRoZSBjdXJyZW50IG9yaWVudGF0aW9uIG9mIHRoZSBzaGlwIGFuZCB0aGUgc3RhcnQgY29vcmRpbmF0ZSAodG9wbW9zdC9sZWZ0bW9zdCkuIFdoZW5cclxuXHQgKiB0aGVyZSBpcyBhIGNoYW5nZSB0byB0aGUgc2hpcCB0aGUgbWFzdGVyIG1hdHJpeCBuZWVkcyB0byBiZSB1cGRhdGVkLiBBbiBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHRoZXJlIGlzXHJcblx0ICogYSBjb29yZGluYXRlIGNoYW5nZS4gVGhpcyBsaXN0ZW5lciB3aWxsIHVwZGF0ZSB0aGUgbWFzdGVyIG1hdHJpeC4gQ2FsbHMgdG8gY2hlY2sgbG9jYXRpb24gKG1vdmUgdmFsaWR0aW9uLCBcclxuXHQgKiBjaGVjayBpZiBoaXQsIGV0Yy4pIHdpbGwgYmUgbWFkZSBhZ2FpbnN0IHRoZSBtYXN0ZXIgbWF0cml4LlxyXG5cdCAqL1xyXG5cdC8qXHJcblx0bGV0IHNoaXBJaW50ID0gZnVuY3Rpb24oKXtcclxuXHQgICAgYWRkRXZlbnRMaXN0ZW5lcignc2hpcE1vdmUnLCgpKSB9XHJcblxyXG5cdHt9XHJcblx0Ki9cclxuXHQvLyBQdWJsaWMgZnVuY3Rpb24gdG8gaW5pdGlhbGx5IGNyZWF0ZSBzaGlwcyBvYmplY3RcclxuXHRidWlsZFNoaXBzOiBmdW5jdGlvbiAoKXtcclxuXHQgICAgZm9yIChsZXQgcyBpbiBzaGlwcy5zaGlwX2NvbmZpZyl7XHJcblx0XHRzaGlwc1tzXSA9IHtzaXplOiBzaGlwcy5zaGlwX2NvbmZpZ1tzXS5zaXplLCBcclxuXHRcdFx0ICAgIHR5cGU6IHNoaXBzLnNoaXBfY29uZmlnW3NdLmlkLFxyXG5cdFx0XHQgICAgY29sb3I6IHNoaXBzLnNoaXBfY29uZmlnW3NdLmNvbG9yLFxyXG5cdFx0XHQgICAgY2xpY2tDbGFzczogc2hpcHMuc2hpcF9jb25maWdbc10uY2xpY2tDbGFzcyxcclxuXHRcdFx0ICAgIGxhYmVsOiBzaGlwcy5zaGlwX2NvbmZpZ1tzXS5sYWJlbFxyXG5cdFx0XHQgICB9O1xyXG5cdCAgICB9XHJcblx0cmV0dXJuIHNoaXBzO1xyXG5cdH0sXHJcblxyXG5cdGJ1aWxkU2hpcDogZnVuY3Rpb24odHlwZSl7XHJcblx0XHRzaGlwc1t0eXBlXSA9IHNoaXBzLl9zaGlwKHNoaXBzLnNoaXBfY29uZmlnW3R5cGVdLnNpemUsIHNoaXBzLnNoaXBfY29uZmlnW3R5cGVdLmlkLCBzaGlwcy5zaGlwX2NvbmZpZ1t0eXBlXS5jb2xvciwgc2hpcHMuc2hpcF9jb25maWdbdHlwZV0uY2xpY2tDbGFzcywgc2hpcHMuc2hpcF9jb25maWdbdHlwZV0ubGFiZWwpO1xyXG5cdFx0cmV0dXJuIHNoaXBzO1xyXG5cdH0sXHJcblxyXG5cdC8vIFNldCB2YWx1ZSBpbiBzaGlwIG9iamVjdC4gXHJcblx0c2V0U2hpcDogZnVuY3Rpb24odHlwZSwga2V5LCB2YWx1ZSl7XHJcblx0XHRpZiAodHlwZSAmJiBzaGlwc1t0eXBlXSAmJiBrZXkpIHsgLy8gb25seSBhdHRlbXB0IGFuIHVwZGF0ZSBpZiB0aGVyZSBpcyBhIGxlZ2l0IHNoaXAgdHlwZSBhbmQgYSBrZXlcclxuXHRcdCAgICBzaGlwc1t0eXBlXS5rZXkgPSB2YWx1ZTtcclxuXHQgICB9XHJcblx0fSxcclxuXHJcblx0Ly8gUmV0dXJuIHNoaXAgb2JqZWN0IGlmIG5vIHR5cGUgZ2l2ZW4gb3RoZXJ3aXNlIHJldHVybiBvYmplY3QgY29udGFpbmluZyBqdXN0IHJlcXVlc3RlZCBzaGlwXHJcblx0Z2V0U2hpcDogZnVuY3Rpb24gKHR5cGUpe1xyXG5cdCAgICBpZih0eXBlKXtcclxuXHRcdHJldHVybiBzaGlwc1t0eXBlXTtcclxuXHQgICAgfSBlbHNlIHtcclxuXHRcdHJldHVybiBzaGlwcy5zaGlwX2NvbmZpZztcclxuXHQgICAgfVxyXG5cdH0sXHJcblxyXG5cdC8vIFByaXZhdGUgZnVuY3Rpb24gdG8gcmFuZG9tbHkgZGV0ZXJtaW5lIHNoaXAncyBvcmllbnRhdGlvbiBhbG9uZyB0aGUgWC1heGlzIG9yIFktYXhpcy4gT25seSB1c2VkIHdoZW4gcGxvdHRpbmcgc2hpcHMgZm9yIHRoZSBmaXJzdCB0aW1lLlxyXG5cdF9nZXRTdGFydENvb3JkaW5hdGU6IGZ1bmN0aW9uKHNpemUpe1xyXG5cdCAgICBjb25zdCBzdGFydF9vcmllbnRhdGlvbj1NYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTApID4gNSA/ICd4JyA6ICd5JztcclxuXHQgICAgY29uc3Qgc3RhcnRfeCA9IHN0YXJ0X29yaWVudGF0aW9uID09ICd4JyA/IHNoaXBzLl9nZXRSYW5kb21Db29yZGluYXRlKHNpemUpIDogc2hpcHMuX2dldFJhbmRvbUNvb3JkaW5hdGUoMCk7XHJcblx0ICAgIGNvbnN0IHN0YXJ0X3kgPSBzdGFydF9vcmllbnRhdGlvbiA9PSAneScgPyBzaGlwcy5fZ2V0UmFuZG9tQ29vcmRpbmF0ZShzaXplKSA6IHNoaXBzLl9nZXRSYW5kb21Db29yZGluYXRlKDApO1xyXG5cclxuXHQgICAgcmV0dXJuIHtjb29yZGluYXRlOiBzdGFydF94ICsgJ18nICsgc3RhcnRfeSwgb3JpZW50YXRpb246IHN0YXJ0X29yaWVudGF0aW9ufTtcclxuXHR9LFxyXG5cclxuXHQvLyBUYWtlIHNoaXAgc2l6ZSBhbmQgb3JpZW50YXRpb24gaW50byBhY2NvdW50IHdoZW4gZGV0ZXJtaW5pbmcgdGhlIHN0YXJ0IHJhbmdlIHZhbHVlLiBleC4gZG9uJ3RcclxuXHQvLyBsZXQgYW4gYWlyY3JhZnQgY2FycmllciB3aXRoIGFuIG9yaWVudGF0aW9uIG9mICdYJyBzdGFydCBhdCByb3cgNyBiZWNhdXNlIGl0IHdpbGwgbWF4IG91dCBvdmVyIHRoZVxyXG5cdC8vIGdyaWQgc2l6ZS5cclxuXHRfZ2V0UmFuZG9tQ29vcmRpbmF0ZTogZnVuY3Rpb24ob2Zmc2V0KXtcclxuXHQgICAgY29uc3QgTUFYX0NPT1JEID0gMTA7XHJcblx0ICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqKE1BWF9DT09SRCAtIG9mZnNldCkpO1xyXG5cdH0sXHJcblxyXG5cdC8vIEZJWE1FIERvZXMgZmxlZXQuZ2hvc3RTaGlwIGRvIHRoaXMgbm93P1xyXG5cdC8vIEJ1aWxkIGFuIGFycmF5IG9mIGNvb3JkaW5hdGVzIGZvciBhIHNoaXAgYmFzZWQgb24gaXQncyBvcmllbnRhdGlvbiwgaW50ZW5kZWQgc3RhcnQgcG9pbnQgYW5kIHNpemVcclxuXHRfc2hpcFN0cmluZzogZnVuY3Rpb24ocykge1xyXG5cdFx0Y29uc3QgbyA9IHMub3JpZW50YXRpb247XHJcblx0XHRjb25zdCBzdCA9IHMuc3RhcnRfY29vcmRpbmF0ZTtcclxuXHRcdGxldCByID0gbmV3IEFycmF5O1xyXG5cdFx0bGV0IHRfcGllY2VzID0gc3Quc3BsaXQoJ18nKTtcclxuXHRcdGNvbnN0IGkgPSBvID09ICd4JyA/IDAgOiAxO1xyXG5cclxuXHRcdGZvciAobGV0IGo9MDsgaiA8IHMuc2l6ZTtqKyspIHtcclxuXHRcdFx0dF9waWVjZXNbaV0gPSB0X3BpZWNlc1tpXSsxO1xyXG5cdFx0XHRyLnB1c2ggKHRfcGllY2VzWzBdICsgJ18nICsgdF9waWVjZXNbMV0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHI7XHJcblx0fSxcclxuXHJcblx0LypcclxuXHQgKiBwbGFjZVNoaXBzIC0gSW5pdGlhbCBwbGFjZW1lbnQgb2Ygc2hpcHMgb24gdGhlIGJvYXJkXHJcblx0ICovXHJcblx0cGxhY2VTaGlwczogZnVuY3Rpb24gKCl7XHJcblx0XHQvKiBSYW5kb21seSBwbGFjZSBzaGlwcyBvbiB0aGUgZ3JpZC4gSW4gb3JkZXIgZG8gdGhpcyBlYWNoIHNoaXAgbXVzdDpcclxuXHRcdCAqICAgKiBQaWNrIGFuIG9yaWVudGF0aW9uXHJcblx0XHQgKiAgICogUGljayBhIHN0YXJ0aW5nIGNvb3JkaW5hdGVcclxuXHRcdCAqICAgKiBWYWxpZGF0ZSB0aGF0IHRoZSBjb29yZGluYXRlIGlzIHZhbGlkIChkb2VzIG5vdCBydW4gT09CLCBkb2VzIG5vdCBjcm9zcyBhbnkgb3RoZXIgc2hpcCwgZXRjLilcclxuXHRcdCAqICAgKiBJZiB2YWxpZDpcclxuXHRcdCAqICAgXHQqIFNhdmUgc3RhcnQgY29vcmQgYW5kIG9yaWVudGF0aW9uIGFzIHBhcnQgb2Ygc2hpcCBvYmplY3RcclxuXHRcdCAqICAgXHQqIFBsb3Qgc2hpcCBvbiBtYXN0ZXIgbWF0cml4XHJcblx0XHQgKi9cclxuXHRcdGxldCBzaGlwTGlzdCA9IHNoaXBzLmdldFNoaXAoKTtcclxuXHRcdGZvciAodmFyIHNoaXAgaW4gc2hpcExpc3QpIHtcclxuXHRcdCAgICBcclxuXHRcdCAgICBsZXQgc3RhcnQgPSBzaGlwcy5fZ2V0U3RhcnRDb29yZGluYXRlKHNoaXBMaXN0W3NoaXBdLnNpemUpOyBcclxuXHRcdCAgICAvL2xldCBzaGlwX3N0cmluZyA9IGZsZWV0Lmdob3N0U2hpcChzaGlwTGlzdFtzaGlwXS50eXBlLCBzdGFydC5jb29yZGluYXRlLCBzdGFydC5vcmllbnRhdGlvbik7XHJcblx0XHQgICAgbGV0IHNoaXBfc3RyaW5nID0gZmxlZXQuZ2hvc3RTaGlwKHNoaXAsIHN0YXJ0LmNvb3JkaW5hdGUsIHN0YXJ0Lm9yaWVudGF0aW9uKTtcclxuXHRcdCAgICBzaGlwTGlzdFtzaGlwXS5vcmllbnRhdGlvbiA9IHN0YXJ0Lm9yaWVudGF0aW9uO1xyXG5cclxuXHRcdCAgICB3aGlsZSAoIWZsZWV0LnZhbGlkYXRlU2hpcChzaGlwX3N0cmluZykpIHtcclxuXHRcdFx0c3RhcnQgPSBzaGlwcy5fZ2V0U3RhcnRDb29yZGluYXRlKHNoaXBMaXN0W3NoaXBdLnNpemUpOyBcclxuXHRcdFx0c2hpcExpc3Rbc2hpcF0ub3JpZW50YXRpb24gPSBzdGFydC5vcmllbnRhdGlvbjtcclxuXHRcdFx0Ly9zaGlwX3N0cmluZyA9IGZsZWV0Lmdob3N0U2hpcChzaGlwTGlzdFtzaGlwXS50eXBlLCBzdGFydC5jb29yZGluYXRlLCBzdGFydC5vcmllbnRhdGlvbik7XHJcblx0XHRcdHNoaXBfc3RyaW5nID0gZmxlZXQuZ2hvc3RTaGlwKHNoaXAsIHN0YXJ0LmNvb3JkaW5hdGUsIHN0YXJ0Lm9yaWVudGF0aW9uKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdCAgICBmbGVldC5zZXRGbGVldChzdGFydC5vcmllbnRhdGlvbixcclxuXHRcdFx0ICAgICAgIC8vc2hpcExpc3Rbc2hpcF0udHlwZSxcclxuXHRcdFx0ICAgICAgIHNoaXAsXHJcblx0XHRcdCAgICAgICBzaGlwTGlzdFtzaGlwXS5zaXplLFxyXG5cdFx0XHQgICAgICAgc3RhcnQuY29vcmRpbmF0ZSk7XHJcblx0XHQgICAgfVxyXG5cdH1cclxufVxyXG5cclxuLyoqKiBwbGF5ZXIuanMgKioqL1xyXG5sZXQgcGxheWVyID0ge1xyXG5cdHBsYXllclJvc3RlcjogbmV3IE9iamVjdCwgLy8gUGxhY2Vob2xkZXIgZm9yIGFsbCBwbGF5ZXJzIGluIHRoZSBnYW1lXHJcblx0cGxheWVyT3JkZXI6IFtdLCAvLyBPcmRlciBvZiBwbGF5ZXIgdHVyblxyXG5cdG1lOiB1bmRlZmluZWQsXHJcblx0b3JkZXJJbmRleDogMCxcclxuXHRmbG93OiBbJ3JlZ2lzdGVyJywnZ2FtZSddLFxyXG5cdGN1cnJlbnRGbG93OiB1bmRlZmluZWQsXHJcblxyXG5cdGNhbk1vdmU6IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKHBsYXllci5wbGF5ZXJPcmRlci5sZW5ndGggPiBtb3ZlLmdldE1vdmVTaXplKCkpIHJldHVybiB0cnVlO1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0sXHJcblxyXG5cdC8vIFJlZ2lzdGVyIGhhbmRsZVxyXG5cdHJlZ2lzdGVyOiBmdW5jdGlvbihoYW5kbGUpe1xyXG5cdFx0cGxheWVyLm1lID0gaGFuZGxlOyAvLyBTZWxmIGlkZW50aWZ5IHRoaW5lc2VsZlxyXG5cdFx0Ly8gVE9ETyAtIGNhbGwgb3V0IHRvIHRoZSByZWdpc3RyYXRpb24gc2VydmljZSBhbmQgZ2V0IGJhY2sgaGFuZGxlIGFuZCB0dXJuIG9yZGVyLiBUaGlzXHJcblx0XHQvLyBzdHJ1Y3R1cmUgcmVwcmVzZW50cyB0aGUgcmV0dXJuIGNhbGwgZnJvbSB0aGUgcmVnaXN0cmF0aW9uIHNlcnZpY2UuXHJcblx0XHRjb25zdCByZWcgPSB7XHJcblx0XHRcdCAgICAgIGhhbmRsZTogJ2Vsc3BvcmtvJyxcclxuXHRcdFx0ICAgICAgb3JkZXI6IDBcclxuXHRcdH07XHJcblxyXG5cdFx0Ly9fcG9wdWxhdGVfcGxheWVyT3JkZXIoJ2Vsc3BvcmtvJywgMCk7XHJcblx0XHRwbGF5ZXIucGxheWVyT3JkZXJbcmVnLm9yZGVyXSA9IHJlZy5oYW5kbGU7XHJcblx0XHRwbGF5ZXIuZ2FtZUZsb3coKTtcclxuXHRcdHJldHVybjtcclxuXHR9LFxyXG5cclxuXHQvL0FjY2VwdCByZWdpc3RyYXRpb24gZnJvbSBvdGhlciBwbGF5ZXJzXHJcblx0YWNjZXB0UmVnOiBmdW5jdGlvbihoYW5kbGUsIG9yZGVyKXtcclxuXHRcdHBsYXllci5wbGF5ZXJPcmRlcltvcmRlcl0gPSBoYW5kbGU7XHJcblx0XHRwbGF5ZXIucGxheWVyUm9zdGVyID0ge1xyXG5cdFx0XHRbaGFuZGxlXToge3BncmlkOiBmbGVldC5idWlsZE5hdXRpY2FsQ2hhcnR9XHJcblx0XHR9XHJcblx0XHRsZXQgcGcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWVyR3JpZCcpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTs7XHJcblx0XHRcclxuXHRcdC8vbGV0IHBnZCA9IHBnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuXHRcdHBnLmlkPWhhbmRsZTtcclxuXHRcdHBnLmlubmVySFRNTD1oYW5kbGU7XHJcblxyXG5cdFx0cGcuYXBwZW5kQ2hpbGQoZ3JpZC5jbGlja2FibGVHcmlkKDEwLCAxMCwgaGFuZGxlKSk7XHJcblx0fSxcclxuXHJcblx0bXlUdXJuOiBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiAocGxheWVyLmN1cnJlbnRQbGF5ZXIoKSA9PSBwbGF5ZXIubWUpID8gMSA6IDA7XHJcblx0fSxcclxuXHJcblx0bmV4dFBsYXllcjogZnVuY3Rpb24oKSB7XHJcblx0XHRwbGF5ZXIub3JkZXJJbmRleCA9IChwbGF5ZXIub3JkZXJJbmRleCA9PSBwbGF5ZXIucGxheWVyT3JkZXIubGVuZ3RoIC0gMSkgPyAgMCA6IHBsYXllci5vcmRlckluZGV4KzE7XHJcblx0XHRyZXR1cm47XHJcblx0fSxcclxuXHJcblx0Y3VycmVudFBsYXllcjogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBwbGF5ZXIucGxheWVyT3JkZXJbcGxheWVyLm9yZGVySW5kZXhdO1xyXG5cdH0sXHJcblxyXG5cdGdhbWVGbG93OiBmdW5jdGlvbigpe1xyXG5cdFx0aWYgKHBsYXllci5jdXJyZW50RmxvdyAhPSB1bmRlZmluZWQpe1xyXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwbGF5ZXIuZmxvd1twbGF5ZXIuY3VycmVudEZsb3ddKS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuXHRcdFx0cGxheWVyLmN1cnJlbnRGbG93Kys7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRwbGF5ZXIuY3VycmVudEZsb3cgPSAwO1xyXG5cdFx0fVxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGxheWVyLmZsb3dbcGxheWVyLmN1cnJlbnRGbG93XSkuc3R5bGUuZGlzcGxheT0naW5saW5lJztcclxuXHR9LFxyXG5cclxuXHRzZXRNb3ZlOiBmdW5jdGlvbihtKXtcclxuXHRcdHJldHVybiBtb3ZlLnNldE1vdmUobSk7XHJcblx0fSxcclxufVxyXG5cclxuLyoqKiBtb3ZlLmpzICoqKi9cclxubGV0IG1vdmUgPSB7XHJcblx0bW92ZUxpc3Q6IFtdLFxyXG5cdG1vdmVNYXA6IHt9LFxyXG5cclxuXHRkZWxldGVNb3ZlOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdGNsZWFyTW92ZUxpc3Q6IGZ1bmN0aW9uKCkge1xyXG5cdFx0bW92ZS5tb3ZlTGlzdCA9IFtdO1xyXG5cdH0sXHJcblxyXG5cdC8qXHJcblx0ICogQ3JlYXRlIGEgYmxvY2sgdG8gdmlzdWFsbHkgcmVwcmVzZW50IGEgbW92ZS4gR2VuZXJpYyBIVE1MIGJsb2NrIGZvciBtb3ZlIG9iamVjdHM6XHJcblx0ICogPGRpdiBpZD08dHlwZT5fPHBsYXllcj5fPGNvb3Jkcz4gY2xhc3M9XCJtb3ZlXCI+XHJcblx0ICogICA8ZGl2IGNsYXNzPVwibW92ZURldGFpbFwiPlxyXG5cdCAqICAgICBhdHRhY2s6IG1lZ2FuXzBfMCAoKiBNb3ZlIHRleHQgKilgXHJcblx0ICogICAgIDxkaXYgY2xhc3M9XCJkZWxldGVcIj5kZWxldGU8L2Rpdj4gPCEtLSBlbGVtZW50IHRvIGRlbGV0ZSBtb3ZlIGJlZm9yZSBzdWJtaXR0ZWQgLS0+XHJcblx0ICogICA8L2Rpdj5cclxuXHQgKiA8L2Rpdj5cclxuXHQgKiBcclxuXHQgKi9cclxuXHRtb3ZlTGlzdEJsb2NrOiBmdW5jdGlvbihtKSB7XHJcblx0XHRsZXQgbW92ZVN0cnVjdD17fTtcclxuXHRcdGxldCBtdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0bW92ZVN0cnVjdC5pZCA9IG12LmlkID0gbS50eXBlICsgJ18nICsgbS5jb29yZGluYXRlO1xyXG5cdFx0bXYuY2xhc3NOYW1lID0gJ21vdmUnO1xyXG5cclxuXHRcdG12LnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywndHJ1ZScpO1xyXG5cdFx0bW92ZS5tb3ZlT3JkZXJIYW5kbGVyKG12KTtcclxuXHJcblx0XHRsZXQgbW92ZVN0cmluZyA9IG0udHlwZSArICc6ICcgKyBtLmNvb3JkaW5hdGU7XHJcblx0XHRsZXQgbWR0bCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0bWR0bC5pbm5lckhUTUw9bW92ZVN0cmluZztcclxuXHJcblx0XHRsZXQgbWRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0bWRlbC5pbm5lckhUTUw9J0RlbGV0ZSc7XHJcblx0XHRtZGVsLmlkID0gJ2RlbF8nICsgbXYuaWQ7XHJcblx0XHRtb3ZlLl9zZXRfbXZMaXN0ZW5lcnMobXYpO1xyXG5cclxuXHRcdG12LmFwcGVuZENoaWxkKG1kdGwpO1xyXG5cdFx0bXYuYXBwZW5kQ2hpbGQobWRlbCk7XHJcblx0XHRcclxuXHRcdG1vdmVTdHJ1Y3QuZG9tID0gbXY7XHJcblx0XHRtb3ZlU3RydWN0LnR5cGUgPSBtLnR5cGU7XHJcblx0XHQvLyBzdG9yZSBjdXJyZW50IHNoaXAgY29vcmRpbmF0ZSBzdHJpbmcgc28gdGhhdCB3aGVuIGEgbW92ZSBpcyBkZWxldGVkIGl0IHdpbGwgYmUgcmVzdG9yZWQgdG8gaXQncyBwcmlvciBsb2NhdGlvblxyXG5cdFx0bW92ZVN0cnVjdC5naG9zdCA9IG0uZ2hvc3Q7XHJcblx0XHRtb3ZlU3RydWN0Lm9yaWVudGF0aW9uID0gbS5vcmllbnRhdGlvbjtcclxuXHRcdG1vdmVTdHJ1Y3Quc2hpcFR5cGUgPSBtLnNoaXBUeXBlO1xyXG5cdFx0bW92ZVN0cnVjdC5zaXplID0gbS5zaGlwU2l6ZTtcclxuXHJcblx0XHRyZXR1cm4gbW92ZVN0cnVjdDtcclxuXHR9LFxyXG5cclxuXHQvLyBBZGQgZGVsZXRlIG1vdmUgZnVuY3Rpb25cclxuXHRfc2V0X212TGlzdGVuZXJzOiBmdW5jdGlvbihtdil7XHJcblx0XHRtdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChmdW5jdGlvbigpIHtcclxuXHRcdFx0Ly8gQ2hlY2sgdG8gc2VlIGlmIGFub3RoZXIgc2hpcCBpcyBpbiB0aGUgcGF0aCBvZiB0aGUgYXR0ZW1wdGVkIHJlc3RvcmVcclxuXHRcdFx0aWYgKGZsZWV0LnZhbGlkYXRlU2hpcChtb3ZlLnVuZG8sIG1vdmUuc2hpcFR5cGUpKSB7XHJcblx0XHRcdFx0Ly8gUmVtb3ZlIHRoZSBkaXZcclxuXHRcdFx0XHQvLyBOZWVkIHRvIGtub3cgcGFyZW50IGVsZW1lbnQgd2hpY2gsIGZvciBldmVyeXRoaW5nIGluIHRoZSBtb3ZlIGxpc3QsIGlzIHRoZSBlbGVtZW50IHdob3NlIGlkIGlzIHBsYXlPcmRlclxyXG5cdFx0XHRcdGxldCBwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXlPcmRlcicpO1xyXG5cdFx0XHRcdGxldCBkbXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChtdi5pZCk7XHJcblx0XHRcdFx0cC5yZW1vdmVDaGlsZChkbXYpO1xyXG5cclxuXHRcdFx0XHQvLyBEZWxldGUgdGhlIGVudHJ5IGZyb20gdGhlIGFycmF5XHJcblx0XHRcdFx0Ly9tb3ZlLm1vdmVMaXN0LnB1c2gobXYpO1xyXG5cdFx0XHRcdGZvciAobGV0IGwgaW4gbW92ZS5tb3ZlTGlzdCkge1xyXG5cdFx0XHRcdFx0aWYobW92ZS5tb3ZlTGlzdFtsXS5pZCA9PSBtdi5pZCl7XHJcblx0XHRcdFx0XHRcdG1vdmUubW92ZUxpc3Quc3BsaWNlKGwsMSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gUmVwYWludCB0aGUgb3JpZ2luYWwgc2hpcFxyXG5cdFx0XHRcdGdyaWQuZGlzcGxheVNoaXAobW92ZS5zaGlwVHlwZSk7XHJcblx0XHRcdFx0ZmxlZXQuc2V0RmxlZXQgKG1vdmUub3JpZW50YXRpb24sIG1vdmUuc2hpcFR5cGUsIHNoaXBzLmdldFNoaXAobW92ZS5zaGlwVHlwZSkuc2l6ZSwgbW92ZS5naG9zdFswXSwgMCk7IFxyXG5cdFx0XHRcdGdyaWQuZGlzcGxheVNoaXAobW92ZS5zaGlwcywgbW92ZS5zaGlwVHlwZSk7XHJcblx0XHRcdH1cclxuXHRcdH0pKTtcclxuXHR9LFxyXG5cclxuXHQvLyBTZXQgdXAgZHJhZyBkcm9wIGZ1bmN0aW9uYWxpdHkgZm9yIHNldHRpbmcgbW92ZSBvcmRlclxyXG5cdG1vdmVPcmRlckhhbmRsZXI6IGZ1bmN0aW9uKHBvKSB7XHJcblx0ICAgIHBvLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsKGZ1bmN0aW9uKGUpe1xyXG5cdFx0ICAgIGUuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQ9J21vdmUnO1xyXG5cdFx0ICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsXHJcblx0XHRcdEpTT04uc3RyaW5naWZ5KHtcclxuXHRcdFx0XHRjaGFuZ2VNb3ZlOiBlLnRhcmdldC5pZFxyXG5cdFx0XHR9KVxyXG5cdFx0ICAgICk7XHJcblx0ICAgIH0pKTtcclxuXHQgICAgcG8uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLChmdW5jdGlvbihlKXtcclxuXHRcdFx0ICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0ICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3Q9J21vdmUnO1xyXG5cdFx0XHQgICAgcmV0dXJuIGZhbHNlO1xyXG5cdCAgICB9KSk7XHJcblx0ICAgIHBvLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLChmdW5jdGlvbihlKXtcclxuXHRcdFx0ICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdCAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdCAgICBsZXQgZHJvcE9iaiA9IEpTT04ucGFyc2UoZS5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvcGxhaW5cIikpO1xyXG5cdFx0XHQgICAgbW92ZS5hbHRlck1vdmVJbmRleChkcm9wT2JqLmNoYW5nZU1vdmUsIGUudGFyZ2V0LmlkKTtcclxuXHRcdFx0ICAgIHJldHVybiBmYWxzZTtcclxuXHQgICAgfSkpO1xyXG5cdH0sXHJcblxyXG5cdGFsdGVyTW92ZUluZGV4OiBmdW5jdGlvbihzdGFydEluZGV4LCBlbmRJbmRleCl7XHJcblx0XHRzdGFydElkID0gc3RhcnRJbmRleDtcclxuXHRcdHN0YXJ0SW5kZXggPSBwYXJzZUludChtb3ZlLm1vdmVNYXBbc3RhcnRJbmRleF0pO1xyXG5cdFx0ZW5kSW5kZXggICA9IHBhcnNlSW50KG1vdmUubW92ZU1hcFtlbmRJbmRleF0pO1xyXG5cclxuXHRcdGxldCBiZWdpbiA9IHN0YXJ0SW5kZXggPCBlbmRJbmRleCA/IHBhcnNlSW50KHN0YXJ0SW5kZXgsIDEwKSA6IHBhcnNlSW50KGVuZEluZGV4LCAxMCk7XHJcblx0XHRsZXQgZW5kID0gICBzdGFydEluZGV4IDwgZW5kSW5kZXggPyBwYXJzZUludChlbmRJbmRleCwgMTApIDogcGFyc2VJbnQoc3RhcnRJbmRleCwgMTApO1xyXG5cdFx0bGV0IGhvbGQgPSBtb3ZlLm1vdmVMaXN0W3N0YXJ0SW5kZXhdO1xyXG5cclxuXHRcdHdoaWxlKGJlZ2luIDwgZW5kKXtcclxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobW92ZS5tb3ZlTGlzdFtiZWdpbl0uaWQpLmFwcGVuZENoaWxkKChtb3ZlLm1vdmVMaXN0W2JlZ2luKzFdKSk7XHJcblx0XHRcdG1vdmUubW92ZUxpc3RbYmVnaW5dID0gbW92ZS5tb3ZlTGlzdFtiZWdpbisxXTtcclxuXHRcdFx0bW92ZS5tb3ZlTWFwW3N0YXJ0SWRdID0gYmVnaW4rMTtcclxuXHRcdFx0YmVnaW4rKztcclxuXHRcdH1cclxuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vdmUubW92ZUxpc3RbZW5kXS5pZCkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWRbaG9sZF0uaWQpO1xyXG5cdFx0bW92ZS5tb3ZlTGlzdFtlbmRdID0gaG9sZDtcclxuXHRcdG1vdmUubW92ZU1hcFtzdGFydElkXSA9IGVuZDtcclxuXHR9LFxyXG5cclxuXHRyZXNvbHZlTW92ZXM6IGZ1bmN0aW9uICgpe1xyXG5cdFx0bGV0IHBhcmVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKTtcclxuXHRcdGNvbnNvbGUubG9nKCdSZXNvbHZpbmcgbW92ZXMnKTtcclxuXHRcdGZvcihsZXQgbSBpbiBtb3ZlLm1vdmVMaXN0KSB7XHJcblx0XHRcdGxldCBtb3ZlID0gbW92ZS5tb3ZlTGlzdFttXTtcclxuXHRcdFx0Y29uc29sZS5sb2coJ21vdmU6ICcsIG1vdmUpO1xyXG5cdFx0XHRzd2l0Y2gobW92ZS50eXBlKSB7XHJcblx0XHRcdFx0Y2FzZSAnYXR0YWNrJzogXHJcblx0XHRcdFx0XHRncmlkLmF0dGFja1BsYXllcihtb3ZlLmNvb3JkaW5hdGUpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAnbWluZSc6XHJcblx0XHRcdFx0XHRncmlkLnNldE1pbmUobW92ZS5jb29yZGluYXRlKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ21vdmUnOlxyXG5cdFx0XHRcdFx0Ly9tb3ZlU2hpcChmbGVldCwgc2hpcHMsIGdyaWQsIG1vdmUpO1xyXG5cdFx0XHRcdFx0Z3JpZC5tb3ZlU2hpcCgpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAncGl2b3QnOlxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdGxldCBjaGlsZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vdmUuaWQpO1xyXG5cdFx0cGFyZW50LnJlbW92ZUNoaWxkKGNoaWxkKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvL2xldCBtb3ZlU2hpcCA9IGZ1bmN0aW9uKGZsZWV0LCBzaGlwcywgZ3JpZCwgbW92ZSl7fVxyXG5cdG1vdmVTaGlwOiBmdW5jdGlvbihtb3ZlKXtcclxuXHRcdC8vIENoZWNrIGZvciBtaW5lcyBiYXNlZCBvbiBnaG9zdCAtIHNlbmQgbWVzc2FnZSB0byBtaW5lIHNlcnZpY2VcclxuXHRcdGxldCBibGFzdEF0ID0gZ3JpZC5fY2hlY2tfZm9yX21pbmUobW92ZS5naG9zdCk7XHJcblx0XHRpZiAoYmxhc3RBdCAhPSBmYWxzZSl7XHJcblx0XHRcdC8vIFJlc2V0IGdob3N0IGlmIG1pbmUgZm91bmQgLSBJZiBhIG1pbmUgaGFzIGJlZW4gZW5jb3VudGVyZWQgdGhlbiB0aGUgc2hpcCBvbmx5IG1vdmVzIHRvIHRoZSBwb2ludCBvZiB0aGUgYmxhc3RcclxuXHRcdFx0Z3JpZC5fcmVzZXRHaG9zdChibGFzdEF0KTtcclxuXHRcdFx0Ly8gZmluZCB3aGljaCBzcXVhcmUgZ290IGhpdFxyXG5cdFx0XHRsZXQgdGFyZ2V0O1xyXG5cdFx0XHRmb3IobGV0IG0gaW4gbW92ZS5naG9zdCl7XHJcblx0XHRcdFx0aWYgKG1vdmUuZ2hvc3RbbV0gPT0gYmxhc3RBdClcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHR0YXJnZXQ9bW92ZS5naG9zdFttXTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRzaGlwcy5zZXRIaXRDb3VudGVyKG1vdmUuc2hpcFR5cGUsIG0rMSk7XHJcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldCkuY2xhc3NOYW1lICs9JyBzaGlwSGl0JztcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgZmwgPSBmbGVldC5nZXRGbGVldChtb3ZlLnNoaXBUeXBlKTtcclxuXHRcdGxldCBzID0gc2hpcHMuZ2V0U2hpcChtb3ZlLnNoaXBUeXBlKTtcclxuXHJcblx0XHRpZiAoZmxbMF0gPT0gbW92ZS5naG9zdFswXSAmJiBtb3ZlLm9yaWVudGF0aW9uID09IHMub3JpZW50YXRpb24pIHsgLy8gY2hlY2sgc3RhcnRpbmcgcG9pbnRzIGFuZCBvcmllbnRhdGlvbiBzZXQgYW5kIHJlZGlzcGxheSBvbmx5IGlmIGRpZmZlcmVudFxyXG5cdFx0XHQvLyBWYWxpZGF0ZSBtb3ZlIGNhbiBiZSBtYWRlXHJcblx0XHRcdGlmKGZsZWV0LnZhbGlkYXRlU2hpcChtb3ZlLmdob3N0LCBtb3ZlLnNoaXBUeXBlKSkge1xyXG5cdFx0XHRcdGdyaWQuZGlzcGxheVNoaXAoc2hpcHMsIG1vdmUuc2hpcFR5cGUpO1xyXG5cdFx0XHRcdC8vIFNldCBnaG9zdCB0byBOYXV0aWNhbENoYXJ0L01hcFxyXG5cdFx0XHRcdGZsZWV0LnNldEZsZWV0IChtb3ZlLm9yaWVudGF0aW9uLCBtb3ZlLnNoaXBUeXBlLCBzaGlwcy5nZXRTaGlwKG1vdmUuc2hpcFR5cGUpLnNpemUsIG1vdmUuZ2hvc3RbMF0sIDApOyBcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gRGlzcGxheSBuZXcgc2hpcCBsb2NhdGlvbiBiYXNlZCBvbiBOYXV0aWNhbENoYXJ0L01hcFxyXG5cdFx0XHRncmlkLmRpc3BsYXlTaGlwKG1vdmUuc2hpcFR5cGUsIG1vdmUuZ2hvc3QpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9yZXNldEdob3N0OiBmdW5jdGlvbihibGFzdEF0KXtcclxuXHRcdGZvciAobGV0IGkgaW4gbW92ZS5naG9zdCl7XHJcblx0XHRcdGlmIChibGFzdEF0ID09IG1vdmUuZ2hvc3RbaV0pIGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBtb3ZlLmdob3N0ID0gZmxlZXQuZ2hvc3RTaGlwKG1vdmUudHlwZSwgbW92ZS5naG9zdFtpXSwgbW92ZS5vcmllbnRhdGlvbiwgbW92ZS5naG9zdC5sZW5ndGgsIGkpO1xyXG5cdH0sXHJcblxyXG5cdC8vIFN0dWIgZm9yIG1pbmUgZGV0ZWN0aW9uXHJcblx0X2NoZWNrX2Zvcl9taW5lOiBmdW5jdGlvbiAoZyl7XHJcblx0XHRsZXQgbWluZUF0ID0geycwXzYnOiAxLCAnMV82JzogMSwgJzJfNic6IDEsICczXzYnOiAxLCAnNF82JzogMSwgJzVfNic6IDEsICc2XzYnOiAxLCAnN182JzogMSwgJzhfNic6IDEsICc5XzYnOiAxfTtcclxuXHRcdGZvcihsZXQgaSBpbiBnKSB7XHJcblx0XHRcdC8vIHJldHVybiBsb2NhdGlvbiB3aGVyZSBtaW5lIHN0cnVja1xyXG5cdFx0XHRpZihtaW5lQXRbZ1tpXV0gPT0gMSkgeyBcclxuXHRcdFx0XHRjb25zb2xlLmxvZygnQk9PTScpO1xyXG5cdFx0XHRcdHJldHVybiBnW2ldOyBcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0sXHJcblx0XHRcclxuXHJcblx0YXR0YWNrUGxheWVyOiBmdW5jdGlvbihjb29yZGluYXRlKXtcclxuXHRcdC8vIFNlbmQgYSBtZXNzYWdlIHJlcXVlc3RpbmcgaGl0L21pc3MgdmFsdWUgb24gZW5lbXkncyBncmlkXHJcblx0XHQvLyBJbmZvcm0gYWxsIG9mIGVuZW15J3MgY29vcmRpbmF0ZSBzdGF0dXNcclxuXHR9LFxyXG5cclxuXHRzZXRNaW5lOiBmdW5jdGlvbihjb29yZGluYXRlKXtcclxuXHRcdC8vIFNlbmQgYSBtZXNzYWdlIHJlcXVlc3RpbmcgaGl0L21pc3MgdmFsdWUgb24gZW5lbXkncyBncmlkXHJcblx0XHQvLyBJZiBub3QgYSBoaXQgcmVnaXN0ZXIgd2l0aCBzZXJ2aWNlIHRoYXQgbWluZSBwbGFjZWQgb24gZW5lbXkgZ3JpZFxyXG5cdH0sXHJcblxyXG5cdHNldE1vdmU6IGZ1bmN0aW9uKG0pe1xyXG5cdFx0Ly9sZXQgbW92ZVN0cmluZztcclxuXHRcdGlmKG1vdmUubW92ZU1hcFttLmNvb3JkaW5hdGVdID09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRtb3ZlLm1vdmVNYXBbbS5jb29yZGluYXRlXSA9IG1vdmUubW92ZUxpc3QubGVuZ3RoO1xyXG5cdFx0XHQvL21vdmVTdHJpbmcgPSBtb3ZlLnR5cGUgKyAnOiAnICsgbW92ZS5jb29yZGluYXRlO1xyXG5cdFx0XHQvL2xldCBiID0gbW92ZS5tb3ZlTGlzdEJsb2NrKG1vdmUuY29vcmRpbmF0ZSwgbW92ZVN0cmluZyk7XHJcblx0XHRcdGxldCBtdiA9IG1vdmUubW92ZUxpc3RCbG9jayhtKTtcclxuXHRcdFx0bW92ZS5tb3ZlTGlzdC5wdXNoKG12KTtcclxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXlPcmRlcicpLmFwcGVuZENoaWxkKG12LmRvbSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Z2V0TW92ZVNpemU6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gbW92ZS5tb3ZlTGlzdC5sZW5ndGg7XHJcblx0fVxyXG59XHJcblxyXG4vKioqIGJhdHRsZXNoaXBPbmUuanMgKioqL1xyXG5cclxuZmxlZXQuaW5pdCgpO1xyXG5wbGF5ZXIuZ2FtZUZsb3coKTtcclxuXHJcbi8qIFJlZ2lzdGVyICovXHJcbi8vIFRPRE8gLSBhdHRhY2ggaGFuZGxlciB0aHJvdWdoIHB1ZzsgbW92ZSBoYW5kbGVycyB0byBhbm90aGVyIG1vZHVsZVxyXG5sZXQgcj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXInKTtcclxuci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuXHQgICAgcGxheWVyLnJlZ2lzdGVyKCk7XHJcblx0ICAgIC8vcmV0dXJuO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxubGV0IGY9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldEZsZWV0Jyk7XHJcbmYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBcclxuICAgIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldEZsZWV0Jykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllckdyaWQnKS5zdHlsZS5kaXNwbGF5PSdpbmxpbmUnO1xyXG5cdGdyaWQuc2V0TW92ZVNoaXAoKTsgXHJcblx0ICAgIHBsYXlHYW1lKCk7XHJcblx0ICAgIC8vcmV0dXJuO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxuLy8gU2V0IHVwIGxpbmsgdG8gcmVzb2x2ZSBtb3Zlc1xyXG5sZXQgZD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZG9Nb3ZlcycpO1xyXG5kLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxcclxuXHRmdW5jdGlvbigpe1xyXG5cdFx0Ly8gUmVzb2x2ZSBvcmRlcnNcclxuXHRcdG1vdmUucmVzb2x2ZU1vdmVzKCk7XHJcblx0XHQvLyBSZXNldCBtb3Zlc1xyXG5cdFx0bW92ZS5jbGVhck1vdmVMaXN0KCk7XHJcblx0XHQvLyBUdXJuIG1vdmVzIG92ZXIgdG8gdGhlIG5leHQgcGxheWVyXHJcblx0XHQvLyBGSVhNRSAtIFNpbXVsYXRpbmcgbW92ZXMgZm9yIG5vdy4gUmVtb3ZlIHdoZW4gcmVhZHkgZm9yIHJlYWxzaWVzXHJcblxyXG5cdH0sIGZhbHNlKTtcclxuLy8gU2V0IHVwIGdyaWRcclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ215R3JpZCcpLmFwcGVuZENoaWxkKGdyaWQuY2xpY2thYmxlR3JpZCgxMCwgMTApKTtcclxuXHJcbi8vIFNldCB1cCBkcmFnL2Ryb3Agb2YgbW92ZXNcclxuLy9kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheU9yZGVyJykuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCd0cnVlJyk7XHJcbi8vcGxheWVyLnBsYXllck9yZGVySGFuZGxlcigpO1xyXG5cclxuLyogU2V0IHJhbmRvbSBmbGVldCAqL1xyXG5zaGlwcy5idWlsZFNoaXBzKCk7XHJcbnNoaXBzLnBsYWNlU2hpcHMoKTtcclxubGV0IHdob2xlRmxlZXQgPSBmbGVldC5nZXRXaG9sZUZsZWV0KCk7XHJcbmZvciAobGV0IHQgaW4gd2hvbGVGbGVldCkge1xyXG5cdGdyaWQuZGlzcGxheVNoaXAodCk7XHJcbn1cclxuLypcclxuc2hpcHMuYnVpbGRTaGlwcygpO1xyXG5zaGlwcy5wbGFjZVNoaXBzKGZsZWV0KTtcclxubGV0IHdob2xlRmxlZXQgPSBmbGVldC5nZXRXaG9sZUZsZWV0KGZsZWV0KTtcclxuZm9yIChsZXQgdCBpbiB3aG9sZUZsZWV0KSB7XHJcblx0Z3JpZC5kaXNwbGF5U2hpcChzaGlwcywgdCk7XHJcbn1cclxuKi9cclxuXHJcbi8qIFxyXG4gKiBNb2NrIGdhbWUgd2lsbCBiZSByZW1vdmVkIFxyXG4gKi9cclxubGV0IG0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnTWVnYW5SZWcnKTtcclxubS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdNZWdhbicsIDEpO1xyXG4gICAgICAgIC8vbS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnTWVnYW5SZWcnKS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuXHQvL2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBsYXllci5mbG93W3BsYXllci5jdXJyZW50Rmxvd10pLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xyXG4gICAgICAgIC8vbS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJykpO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxubGV0IHJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1J5YW5SZWcnKTtcclxucnkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBcclxuICAgIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcGxheWVyLmFjY2VwdFJlZygnUnlhbicsIDIpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdSeWFuUmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgLy9sZXQgcj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnUnlhbicpLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xyXG4gICAgICAgIC8vci5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJykpO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxubGV0IHRyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1RyYWNleVJlZycpO1xyXG50ci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdUcmFjZXknLCAzKTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnVHJhY2V5UmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG4vKiBQbGF5IGdhbWUgKi9cclxuLypcclxud2hpbGUgKDEpIHtcclxuXHRwbGF5ZXIuZ2V0VHVybigpO1xyXG59XHJcbiovXHJcblxyXG5mdW5jdGlvbiBwbGF5R2FtZSgpe1xyXG5cdGlmIChwbGF5ZXIubXlUdXJuKCkpe1xyXG5cdFx0Ly93aW5kb3cub3BlbignJywnYXR0YWNrJywgJ2hlaWdodD0yMDAsd2lkdGg9MjAwLG1lbnViYXI9bm8sc3RhdHVzPW5vLHRpdGxlYmFyPW5vLHRvb2xiYXI9bm8nLCBmYWxzZSApO1xyXG5cdH1cclxufVxyXG5cclxuIl19
