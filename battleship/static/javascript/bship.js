(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/*** fleet.js ***/
var fleet = {
	nauticalMap: {}, // Hash lookup that tracks each ship's starting point and current orientation
	init: function(){
		return fleet.nauticalChart = fleet.buildNauticalChart(); // Detailed matrix of every ship in the fleet
	},

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
	    fleet.clearShip(type, size);

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

	clearShip: function(type, size){
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
				let s = fleet.setChart(coordinates[c]);
				if (s === false) {return false};
				ret.push (s);
			}
			return ret;
		} else {
			return fleet.setChart(coordinates);
		}
	},

	setChart: function(coordinate){
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
			grid.setMyListeners(cell)
		    } else {
		       grid.setPlayerListeners(cell, phandle);
		    }
		}
	    }
	    return gridTable;
	},

	setMyListeners: function(cell){
		    // Set up drag and drop for each cell.
		    cell.setAttribute('draggable','true');

		    cell.addEventListener('dragstart',(
			function(ev){
			    ev.dataTransfer.effectAllowed='move';
			    let type = grid.getTypeByClass(this.className);
			    let ship = ships.getShip(type);

			    // Calculate which square was clicked to guide placement
			    let start = grid.find_start(this.id, ship.orientation, ship.size, type);
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
			    let type = grid.getTypeByClass(this.className);
			    let ship = ships.getShip(type);
			    let start = grid.find_start(e.target.id, ship.orientation, ship.size, type);
			    let orientation = (ship.orientation == 'x') ? 'y':'x'; // flip the orientation
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

	setPlayerListeners: function(cell, handle){
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
	},

	/*
	 * find_start - Determine the starting coordinate of a ship given the square that was clicked. For example
	 * it is possible that a battleship along the x-axis was clicked at location 3_3 but that was the second square
	 * on the ship. This function will identify that the battleship starts at 2_3.
	 */

	find_start: function(start_pos, orientation, size, type){
	    let index = (orientation == 'x') ? 0 : 1;

	    let pieces=start_pos.split('_');
	    let offset = 0;

	    for (let i=0; i < size; i++) {
		if (pieces[index] == 0) {break;}
		pieces[index]--;
		let g = fleet.checkGrid(pieces[0] + '_' + pieces[1]);
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
		grid.setSpace(coordinates[coord], ship.clickClass);
	    }
	},

	setSpace: function(space, className) {
	    var b = document.getElementById(space); 
	    b.classList.toggle(className);
	},

	getTypeByClass: function(className){
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
	ship: function(size, id, color, clickClass, label) {
		this.size        = size;
		this.id          = id;
		this.color       = color;
		this.clickClass  = clickClass;
		this.label       = label;

		return (this);
	},

	/*
	 * The ship object holds the current orientation of the ship and the start coordinate (topmost/leftmost). When
	 * there is a change to the ship the master matrix needs to be updated. An event will be triggered when there is
	 * a coordinate change. This listener will update the master matrix. Calls to check location (move validtion, 
	 * check if hit, etc.) will be made against the master matrix.
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
		ships[type] = ships.ship(ships.ship_config[type].size, ships.ship_config[type].id, ships.ship_config[type].color, ships.ship_config[type].clickClass, ships.ship_config[type].label);
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
	getStartCoordinate: function(size){
	    const start_orientation=Math.floor(Math.random()*10) > 5 ? 'x' : 'y';
	    const start_x = start_orientation == 'x' ? ships.getRandomCoordinate(size) : ships.getRandomCoordinate(0);
	    const start_y = start_orientation == 'y' ? ships.getRandomCoordinate(size) : ships.getRandomCoordinate(0);

	    return {coordinate: start_x + '_' + start_y, orientation: start_orientation};
	},

	// Take ship size and orientation into account when determining the start range value. ex. don't
	// let an aircraft carrier with an orientation of 'X' start at row 7 because it will max out over the
	// grid size.
	getRandomCoordinate: function(offset){
	    const MAX_COORD = 10;
	    return Math.floor(Math.random()*(MAX_COORD - offset));
	},

	// FIXME Does fleet.ghostShip do this now?
	// Build an array of coordinates for a ship based on it's orientation, intended start point and size
	/*
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
	*/

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
		    
		    let start = ships.getStartCoordinate(shipList[ship].size); 
		    let ship_string = fleet.ghostShip(ship, start.coordinate, start.orientation);
		    shipList[ship].orientation = start.orientation;

		    while (!fleet.validateShip(ship_string)) {
			start = ships.getStartCoordinate(shipList[ship].size); 
			shipList[ship].orientation = start.orientation;
			ship_string = fleet.ghostShip(ship, start.coordinate, start.orientation);
			}

		    fleet.setFleet(start.orientation,
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
		move.set_mvListeners(mv);

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
	set_mvListeners: function(mv){
		mv.addEventListener('click', (function() {
			// Check to see if another ship is in the path of the attempted restore
			if (mv.id.match(/^attack/) ){
				move.delete_move(mv);
			} else if (fleet.validateShip(move.undo, move.shipType )) {
				move.delete_move(mv);
				// Repaint the original ship
				grid.displayShip(move.shipType);
				fleet.setFleet (move.orientation, move.shipType, ships.getShip(move.shipType).size, move.ghost[0], 0); 
				grid.displayShip(move.ships, move.shipType);
			}
		}));
	},

	delete_move: function(mv){
		// Remove the div
		// Need to know parent element which, for everything in the move list, is the element whose id is playOrder
		let p = document.getElementById('playOrder');
		let dmv = document.getElementById(mv.id);
		p.removeChild(dmv);

		// Delete the entry from the array
		for (let l in move.moveList) {
			if(move.moveList[l].id == mv.id){
				move.moveList.splice(l,1);
				break;
			}
		}

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
		let startId = startIndex;
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
					grid.moveShip();
					break;
				case 'pivot':
					break;
			}
		let child = document.getElementById(move.id);
		parent.removeChild(child);
		}
	},

	moveShip: function(move){
		// Check for mines based on ghost - send message to mine service
		let blastAt = grid.check_for_mine(move.ghost);
		if (blastAt != false){
			// Reset ghost if mine found - If a mine has been encountered then the ship only moves to the point of the blast
			grid.resetGhost(blastAt);
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

	resetGhost: function(blastAt){
		for (let i in move.ghost){
			if (blastAt == move.ghost[i]) break;
		}

		return move.ghost = fleet.ghostShip(move.type, move.ghost[i], move.orientation, move.ghost.length, i);
	},

	// Stub for mine detection
	check_for_mine: function (g){
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
		if(move.moveMap[m.coordinate] == undefined) {
			move.moveMap[m.coordinate] = move.moveList.length;
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
 * Mock game will be removed 
 */
let m = document.getElementById('MeganReg');
m.addEventListener('click', 
    function(){
        player.acceptReg('Megan', 1);
        document.getElementById('MeganReg').style.display='none';
    }, false);

let ry = document.getElementById('RyanReg');
ry.addEventListener('click', 
    function(){
        player.acceptReg('Ryan', 2);
        document.getElementById('RyanReg').style.display='none';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJhdHRsZXNoaXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKiogZmxlZXQuanMgKioqL1xyXG52YXIgZmxlZXQgPSB7XHJcblx0bmF1dGljYWxNYXA6IHt9LCAvLyBIYXNoIGxvb2t1cCB0aGF0IHRyYWNrcyBlYWNoIHNoaXAncyBzdGFydGluZyBwb2ludCBhbmQgY3VycmVudCBvcmllbnRhdGlvblxyXG5cdGluaXQ6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gZmxlZXQubmF1dGljYWxDaGFydCA9IGZsZWV0LmJ1aWxkTmF1dGljYWxDaGFydCgpOyAvLyBEZXRhaWxlZCBtYXRyaXggb2YgZXZlcnkgc2hpcCBpbiB0aGUgZmxlZXRcclxuXHR9LFxyXG5cclxuXHRidWlsZE5hdXRpY2FsQ2hhcnQ6IGZ1bmN0aW9uKCl7XHJcblx0XHRsZXQgY2hhcnQgPSBuZXcgQXJyYXk7XHJcblx0XHRmb3IobGV0IGk9MDsgaSA8IDEwOyBpKyspIHtcclxuXHRcdFx0Y2hhcnRbaV0gPSBuZXcgQXJyYXk7XHJcblx0XHRcdGZvciAobGV0IGo9MDsgaiA8IDEwOyBqKyspe1xyXG5cdFx0XHRcdGNoYXJ0W2ldW2pdID0gdW5kZWZpbmVkOy8vbmV3IEFycmF5O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY2hhcnQ7XHJcblx0fSxcclxuXHJcblx0Z2V0RmxlZXQ6IGZ1bmN0aW9uKHR5cGUpe1xyXG5cdFx0bGV0IG9yaWVudGF0aW9uID0gZmxlZXQubmF1dGljYWxNYXBbdHlwZV0ub3JpZW50YXRpb24gPT0gJ3gnID8gMCA6IDE7XHJcblx0XHRsZXQgcGllY2VzID0gZmxlZXQubmF1dGljYWxNYXBbdHlwZV0uc3RhcnRfY29vcmQuc3BsaXQoJ18nKTtcclxuXHRcdGxldCByZXQgPSBuZXcgQXJyYXk7XHJcblxyXG5cdFx0d2hpbGUgKHBpZWNlc1tvcmllbnRhdGlvbl0gPCBmbGVldC5uYXV0aWNhbENoYXJ0W29yaWVudGF0aW9uXS5sZW5ndGggJiYgZmxlZXQubmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldID09IHR5cGUpIHtcclxuXHRcdFx0cmV0LnB1c2ggKHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXSk7XHJcblx0XHRcdHBpZWNlc1tvcmllbnRhdGlvbl0gPSBwYXJzZUludChwaWVjZXNbb3JpZW50YXRpb25dLCAxMCkgKyAxO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiAocmV0KTtcclxuXHR9LFxyXG5cclxuXHRnZXRXaG9sZUZsZWV0OiBmdW5jdGlvbigpe1xyXG5cdFx0bGV0IHJldD17fTtcclxuXHRcdGZvciAobGV0IHQgaW4gZmxlZXQubmF1dGljYWxNYXApIHtcclxuXHRcdFx0cmV0W3RdID0gZmxlZXQuZ2V0RmxlZXQodCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH0sXHJcblxyXG5cdC8vIFRPRE8gLSBzZXRGbGVldDogUmVtb3ZlIHByZXZpb3VzIHNoaXAgZnJvbSBjaGFydCAtLSBtYXkgYmUgZG9uZS4uLm5lZWRzIHRlc3RcclxuXHQvKlxyXG5cdCAqIHNldEZsZWV0IC0gcGxhY2Ugc2hpcCBvbiBuYXV0aWNhbCBjaGFydFxyXG5cdCAqL1xyXG5cdHNldEZsZWV0OiBmdW5jdGlvbiAob3JpZW50YXRpb24sIHR5cGUsIHNpemUsIHN0YXJ0X2Nvb3JkLCBvZmZzZXQpeyBcclxuXHRcdGxldCBwaWVjZXMgPSBzdGFydF9jb29yZC5zcGxpdCgnXycpO1xyXG5cdCAgICBsZXQgaW5kZXggPSAob3JpZW50YXRpb24gPT0gJ3gnKSA/IDAgOiAxO1xyXG5cclxuXHQgICAgb2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XHJcblxyXG5cdCAgICAvLyBBZGp1c3QgZm9yIGRyYWcvZHJvcCB3aGVuIHBsYXllciBwaWNrcyBhIHNoaXAgcGllY2Ugb3RoZXIgdGhhbiB0aGUgaGVhZC5cclxuXHQgICAgcGllY2VzW2luZGV4XSA9IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSAtIG9mZnNldDtcclxuXHJcblx0ICAgIC8qXHJcblx0ICAgICAqIFJlbW92ZSBvbGQgc2hpcCBmcm9tIG5hdXRpY2FsQ2hhcnQvTWFwXHJcblx0ICAgICAqL1xyXG5cdCAgICBmbGVldC5jbGVhclNoaXAodHlwZSwgc2l6ZSk7XHJcblxyXG5cdCAgICAvLyBzZXQgdGhlIG5hdXRpY2FsIG1hcCB2YWx1ZSBmb3IgdGhpcyBib2F0XHJcblx0ICAgIGZsZWV0Lm5hdXRpY2FsTWFwW3R5cGVdPXtcclxuXHRcdCAgICBvcmllbnRhdGlvbjogb3JpZW50YXRpb24sXHJcblx0XHQgICAgc3RhcnRfY29vcmQ6IHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXVxyXG5cdCAgICB9O1xyXG5cclxuXHQgICAgZm9yICh2YXIgaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XHJcblx0XHRmbGVldC5uYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gPSB0eXBlO1xyXG5cdFx0cGllY2VzW2luZGV4XT0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApICsxO1xyXG5cdCAgICB9XHJcblx0fSxcclxuXHJcblx0Y2xlYXJTaGlwOiBmdW5jdGlvbih0eXBlLCBzaXplKXtcclxuXHQgICAgbGV0IG1hcCA9IGZsZWV0Lm5hdXRpY2FsTWFwW3R5cGVdO1xyXG5cdCAgICBpZiAobWFwID09PSB1bmRlZmluZWQpe3JldHVybiBmYWxzZTt9XHJcblxyXG5cdCAgICBsZXQgcGllY2VzID0gbWFwLnN0YXJ0X2Nvb3JkLnNwbGl0KCdfJyk7XHJcblx0ICAgIGxldCBpbmRleCA9IChtYXAub3JpZW50YXRpb24gPT0gJ3gnKSA/IDAgOiAxO1xyXG5cclxuXHQgICAgZm9yIChsZXQgaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XHJcblx0XHQgICAgZmxlZXQubmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldPXVuZGVmaW5lZDtcclxuXHRcdCAgICBwaWVjZXNbaW5kZXhdKys7XHJcblx0ICAgIH1cclxuXHJcblx0ICAgIGRlbGV0ZSBmbGVldC5uYXV0aWNhbE1hcFt0eXBlXTtcclxuXHR9LFxyXG5cclxuXHQvKlxyXG5cdCAqIGdob3N0U2hpcCAtIEJlZm9yZSBwdXR0aW5nIGEgc2hpcCBvbiB0aGUgY2hhcnQgaXQncyBwb3RlbnRpYWwgbG9jYXRpb24gbmVlZHMgdG8gYmUgcGxvdHRlZCBzbyBpdCBjYW4gYmVcclxuXHQgKiBjaGVja2VkIGZvciB2YWxpZGl0eS4gR2l2ZW4gYSBzaGlwIHRoaXMgZnVuY3Rpb24gd2lsbCByZXR1cm4gdGhlIHBvdGVudGlhbCBwbG90dGVkIGNvb3JkaW5hdGVzLiBUaGUgZnVuY3Rpb25cclxuXHQgKiBtYXkgYnVpbGQgY29vcmRpbmF0ZXMgZm9yIGEga25vd24gc2hpcCBvciBmb3Igb25lIG1vdmVkIGFyb3VuZCBvbiB0aGUgZ3JpZC5cclxuXHQgKi9cclxuXHRnaG9zdFNoaXA6IGZ1bmN0aW9uKHR5cGUsIGNvb3JkaW5hdGUsIG9yaWVudGF0aW9uLCBzaXplLCBvZmZzZXQpe1xyXG5cdFx0bGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG5cdFx0bGV0IHRoaXNTaGlwID0gZmxlZXQucmVhZE1hcCh0eXBlKTtcclxuXHRcdGxldCBnaG9zdCA9IFtdO1xyXG5cdFx0Y29vcmRpbmF0ZSA9IGNvb3JkaW5hdGUgfHwgdGhpc1NoaXAuc3RhcnRfY29vcmQ7XHJcblx0XHRvcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uIHx8IHRoaXNTaGlwLm9yaWVudGF0aW9uO1xyXG5cdFx0c2l6ZSA9IHNpemUgfHwgc2hpcC5zaXplO1xyXG5cdFx0b2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XHJcblxyXG5cdFx0bGV0IHBpZWNlcyA9IGNvb3JkaW5hdGUuc3BsaXQoJ18nKTtcclxuXHRcdGxldCBpbmRleCA9IChvcmllbnRhdGlvbiA9PSAneCcpID8gMDogMTtcclxuXHRcdHBpZWNlc1tpbmRleF0gPSBwYXJzZUludChwaWVjZXNbaW5kZXhdLCAxMCkgLSBvZmZzZXQ7XHJcblx0XHRmb3IgKGxldCBpPTA7IGkgPCBzaXplOyBpKyspIHtcclxuXHRcdFx0Z2hvc3QucHVzaChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xyXG5cdFx0XHRwaWVjZXNbaW5kZXhdID0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApICsxO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGdob3N0O1xyXG5cdH0sXHJcblxyXG5cdHJlYWRNYXA6IGZ1bmN0aW9uKHR5cGUpe1xyXG5cdFx0cmV0dXJuIGZsZWV0Lm5hdXRpY2FsTWFwW3R5cGVdO1xyXG5cdH0sXHJcblxyXG5cdC8qXHJcblx0ICogR2l2ZW4gYSBjb29yZGluYXRlIG9yIGFuIGFycmF5IG9mIGNvb3JkaW5hdGVzIHJldHVybiB0aGUgc2FtZSBzdHJ1Y3R1cmUgcmV2ZWFsaW5nIHRoZSBjb250ZW50cyBvZiB0aGUgZ3JpZC5cclxuXHQgKiBXaWxsIHJldHVybiBhIHZhbHVlIG9mIGZhbHNlIGlmIHRoZXJlIGlzIGEgcHJvYmxlbSBjaGVja2luZyB0aGUgZ3JpZCAoZXguIGNvb3JkcyBhcmUgb3V0IG9mIHJhbmdlKS5cclxuXHQgKi9cclxuXHRjaGVja0dyaWQ6IGZ1bmN0aW9uKGNvb3JkaW5hdGVzKXtcclxuXHRcdGlmIChjb29yZGluYXRlcyBpbnN0YW5jZW9mIEFycmF5KXtcclxuXHRcdFx0bGV0IHJldCA9IG5ldyBBcnJheTtcclxuXHRcdFx0Zm9yKGxldCBjIGluIGNvb3JkaW5hdGVzKXtcclxuXHRcdFx0XHRsZXQgcyA9IGZsZWV0LnNldENoYXJ0KGNvb3JkaW5hdGVzW2NdKTtcclxuXHRcdFx0XHRpZiAocyA9PT0gZmFsc2UpIHtyZXR1cm4gZmFsc2V9O1xyXG5cdFx0XHRcdHJldC5wdXNoIChzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmV0O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGZsZWV0LnNldENoYXJ0KGNvb3JkaW5hdGVzKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRzZXRDaGFydDogZnVuY3Rpb24oY29vcmRpbmF0ZSl7XHJcblx0XHRsZXQgcGllY2VzID0gY29vcmRpbmF0ZS5zcGxpdCgnXycpO1xyXG5cdFx0aWYgKHBhcnNlSW50KHBpZWNlc1swXSwgMTApID49IGZsZWV0Lm5hdXRpY2FsQ2hhcnQubGVuZ3RoIHx8XHJcblx0XHQgICAgcGFyc2VJbnQocGllY2VzWzFdLCAxMCk+PSBmbGVldC5uYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXS5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBmbGVldC5uYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV07XHJcblx0fSxcclxuXHJcblx0LyogXHJcblx0ICogR2l2ZW4gYSBsaXN0IG9mIGNvb3JkaW5hdGVzIGFuZCBhIHNoaXAgdHlwZSB2YWxpZGF0ZSB0aGF0IHRoZSBjb29yZGluYXRlcyBkbyBub3QgdmlvbGF0ZSB0aGUgcnVsZXMgb2Y6XHJcblx0ICogXHQqIHNoaXAgbXVzdCBiZSBvbiB0aGUgZ3JpZFxyXG5cdCAqIFx0KiBzaGlwIG11c3Qgbm90IG9jY3VweSB0aGUgc2FtZSBzcXVhcmUgYXMgYW55IG90aGVyIHNoaXBcclxuXHQgKi9cclxuXHR2YWxpZGF0ZVNoaXA6IGZ1bmN0aW9uIChjb29yZGluYXRlcywgdHlwZSl7XHJcblx0ICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gb3RoZXIgYm9hdHMgYWxyZWFkeSBvbiBhbnkgYSBzcGFjZVxyXG5cdCAgICBmb3IgKHZhciBwPTA7IHAgPCBjb29yZGluYXRlcy5sZW5ndGg7IHArKykge1xyXG5cclxuXHRcdC8vIElzIHRoZXJlIGEgY29sbGlzaW9uP1xyXG5cdFx0bGV0IGNvbGxpc2lvbiA9IGZsZWV0LmNoZWNrR3JpZChjb29yZGluYXRlcyk7XHJcblx0XHRcclxuXHRcdGlmIChjb2xsaXNpb24gPT0gZmFsc2UpIHtyZXR1cm4gZmFsc2V9OyAvLyBJZiBjaGVja0dyaWQgcmV0dXJucyBmYWxzZSBjb29yZGluYXRlcyBhcmUgb3V0IG9mIHJhbmdlXHJcblxyXG5cdFx0Zm9yIChsZXQgYyBpbiBjb29yZGluYXRlcykge1xyXG5cdFx0XHRsZXQgcGllY2VzID0gY29vcmRpbmF0ZXNbY10uc3BsaXQoJ18nKTtcclxuXHRcdFx0XHRpZiAoZmxlZXQubmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldICE9IHR5cGUgJiZcclxuXHRcdFx0XHQgICAgZmxlZXQubmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldICE9IHVuZGVmaW5lZCkge3JldHVybiBmYWxzZX07XHJcblx0XHR9XHJcblx0ICAgIH1cclxuXHQgICAgcmV0dXJuIHRydWU7XHJcblx0fSxcclxufTtcclxuXHJcbi8qKiogZ3JpZC5qcyAqKiovXHJcbmxldCBncmlkID0ge1xyXG5cdG1vdmVTaGlwOiBmdW5jdGlvbihkcm9wT2JqLCBldil7XHJcblx0ICAgIGNvbnNvbGUubG9nKCdwcmUtc2V0IGZsZWV0IG1vdmUnKTtcclxuXHQgICAgbGV0IHNoaXA9c2hpcHMuZ2V0U2hpcChkcm9wT2JqLnR5cGUpO1xyXG5cdCAgICAvLyBSZW1vdmUgaW5pdGlhbCBpbWFnZVxyXG5cdCAgICBncmlkLmRpc3BsYXlTaGlwKGRyb3BPYmoudHlwZSk7XHJcblxyXG5cdCAgICBmbGVldC5zZXRGbGVldCAoZHJvcE9iai5vcmllbnRhdGlvbiwgZHJvcE9iai50eXBlLCBzaGlwLnNpemUsIGV2LnRhcmdldC5pZCwgZHJvcE9iai5vZmZzZXQpOyBcclxuXHJcblx0ICAgIC8vIFJlZHJhdyBpbWFnZSBpbiBuZXcgbG9jYXRpb25cclxuXHQgICAgZ3JpZC5kaXNwbGF5U2hpcChkcm9wT2JqLnR5cGUpO1xyXG5cdH0sXHJcblxyXG5cdC8qXHJcblx0ICogQ2FsbGVkIGFmdGVyIHBsYXllciBzZXRzIGluaXRpYWwgZmxlZXQuIE92ZXJ3cml0ZSB0aGUgbW92ZVNoaXAgZnVuY3Rpb24gc28gaXQgYmVoYXZlcyBkaWZmZXJlbnQuXHJcblx0ICovXHJcblx0c2V0TW92ZVNoaXA6IGZ1bmN0aW9uKCl7XHJcblx0XHQvKiBjaGFuZ2UgdmFsdWUgb2YgbW92ZVNoaXAgZnVuY3Rpb24gKi9cclxuXHRcdGdyaWQubW92ZVNoaXAgPSBmdW5jdGlvbihkcm9wT2JqLCBldiwgZHJvcFNoaXAsIG1vdmVUeXBlKXtcclxuXHRcdCAgICBjb25zb2xlLmxvZygnSW4gZ2FtZSBtb3ZlJyk7XHJcblx0XHQgICAgLy8gUmVtb3ZlIGluaXRpYWwgaW1hZ2VcclxuXHRcdCAgICBncmlkLmRpc3BsYXlTaGlwKGRyb3BPYmoudHlwZSk7XHJcblxyXG5cdFx0ICAgIC8vIGRyYXcgaW1hZ2UgYmFzZWQgb24gZHJvcFNoaXBcclxuXHRcdCAgICBncmlkLmRpc3BsYXlTaGlwKGRyb3BPYmoudHlwZSwgZHJvcFNoaXApO1xyXG5cclxuXHRcdCAgICAvLyBTdG9yZSBnaG9zdFNoaXAgaW4gbW92ZSBvYmplY3RcclxuXHRcdCAgICBwbGF5ZXIuc2V0TW92ZSh7IHR5cGU6IG1vdmVUeXBlLCBcclxuXHRcdFx0XHQgICAgIGNvb3JkaW5hdGU6IGV2LnRhcmdldC5pZCwgXHJcblx0XHRcdFx0ICAgICBnaG9zdDogZHJvcFNoaXAsXHJcblx0XHRcdFx0ICAgICBvcmllbnRhdGlvbjogZHJvcE9iai5vcmllbnRhdGlvbiwgXHJcblx0XHRcdFx0ICAgICBzaGlwVHlwZTogZHJvcE9iai50eXBlLFxyXG5cdFx0XHRcdCAgICAgdW5kbzogZmxlZXQuZ2hvc3RTaGlwKGRyb3BPYmoudHlwZSkgLy8gTmVlZCB0byBwcmVzZXJ2ZSB0aGUgc2hpcCdzIHBvc2l0aW9uIHByZS1tb3ZlXHJcblx0XHQgICAgfSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0LypcclxuXHQgKiBCdWlsZCB0aGUgZ3JpZCBhbmQgYXR0YWNoIGhhbmRsZXJzIGZvciBkcmFnL2Ryb3AgZXZlbnRzXHJcblx0ICovXHJcblx0Y2xpY2thYmxlR3JpZDogZnVuY3Rpb24gKCByb3dzLCBjb2xzLCBwaGFuZGxlKXtcclxuXHQgICAgbGV0IGdyaWRUYWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcblx0ICAgIGdyaWRUYWJsZS5jbGFzc05hbWU9J2dyaWQnO1xyXG5cdCAgICBmb3IgKHZhciByPTA7cjxyb3dzOysrcil7XHJcblx0XHR2YXIgdHIgPSBncmlkVGFibGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKSk7XHJcblx0XHRmb3IgKHZhciBjPTA7Yzxjb2xzOysrYyl7XHJcblx0XHQgICAgdmFyIGNlbGwgPSB0ci5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpKTtcclxuXHRcdCAgICAvLyBFYWNoIGNlbGwgb24gdGhlIGdyaWQgaXMgb2YgY2xhc3MgJ2NlbGwnXHJcblx0XHQgICAgY2VsbC5jbGFzc05hbWU9J2NlbGwnO1xyXG5cclxuXHRcdCAgICAvLyBTZXQgdGhlIElEIHZhbHVlIG9mIGVhY2ggY2VsbCB0byB0aGUgcm93L2NvbHVtbiB2YWx1ZSBmb3JtYXR0ZWQgYXMgcl9jXHJcblx0XHQgICAgY2VsbC5pZCA9IHIgKyAnXycgKyBjO1xyXG5cclxuXHRcdCAgICBpZiAocGhhbmRsZSA9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRncmlkLnNldE15TGlzdGVuZXJzKGNlbGwpXHJcblx0XHQgICAgfSBlbHNlIHtcclxuXHRcdCAgICAgICBncmlkLnNldFBsYXllckxpc3RlbmVycyhjZWxsLCBwaGFuZGxlKTtcclxuXHRcdCAgICB9XHJcblx0XHR9XHJcblx0ICAgIH1cclxuXHQgICAgcmV0dXJuIGdyaWRUYWJsZTtcclxuXHR9LFxyXG5cclxuXHRzZXRNeUxpc3RlbmVyczogZnVuY3Rpb24oY2VsbCl7XHJcblx0XHQgICAgLy8gU2V0IHVwIGRyYWcgYW5kIGRyb3AgZm9yIGVhY2ggY2VsbC5cclxuXHRcdCAgICBjZWxsLnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywndHJ1ZScpO1xyXG5cclxuXHRcdCAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsKFxyXG5cdFx0XHRmdW5jdGlvbihldil7XHJcblx0XHRcdCAgICBldi5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZD0nbW92ZSc7XHJcblx0XHRcdCAgICBsZXQgdHlwZSA9IGdyaWQuZ2V0VHlwZUJ5Q2xhc3ModGhpcy5jbGFzc05hbWUpO1xyXG5cdFx0XHQgICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG5cclxuXHRcdFx0ICAgIC8vIENhbGN1bGF0ZSB3aGljaCBzcXVhcmUgd2FzIGNsaWNrZWQgdG8gZ3VpZGUgcGxhY2VtZW50XHJcblx0XHRcdCAgICBsZXQgc3RhcnQgPSBncmlkLmZpbmRfc3RhcnQodGhpcy5pZCwgc2hpcC5vcmllbnRhdGlvbiwgc2hpcC5zaXplLCB0eXBlKTtcclxuXHRcdFx0ICAgIGV2LmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dC9wbGFpblwiLCBcclxuXHRcdFx0XHRKU09OLnN0cmluZ2lmeSh7XHJcblx0XHRcdFx0XHRcdG9mZnNldDogICAgICAgIHN0YXJ0Lm9mZnNldCxcclxuXHRcdFx0XHRcdFx0c3RhcnRfY29vcmQ6ICAgc3RhcnQuc3RhcnRfY29vcmQsXHJcblx0XHRcdFx0XHRcdGluZGV4OiAgICAgICAgIHNoaXAuc2l6ZSxcclxuXHRcdFx0XHRcdFx0dHlwZTogICAgICAgICAgdHlwZSxcclxuXHRcdFx0XHRcdFx0Y3VycmVudF9jb29yZDogZmxlZXQuZ2hvc3RTaGlwKHR5cGUsIHN0YXJ0LnN0YXJ0X2Nvb3JkKSxcclxuXHRcdFx0XHRcdFx0b3JpZW50YXRpb246ICAgc2hpcC5vcmllbnRhdGlvblxyXG5cdFx0XHRcdFx0ICAgICAgIH0pXHJcblx0XHRcdCAgICApO1xyXG5cdFx0XHR9KVxyXG5cdFx0ICAgICk7XHJcblxyXG5cdFx0ICAgIC8vIEFkZCBEcmFnL0Ryb3AgY2FwYWJpbGl0aWVzXHJcblx0XHQgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywoXHJcblx0XHRcdGZ1bmN0aW9uKGV2KXtcclxuXHRcdFx0ICAgIGNvbnNvbGUubG9nKCdkcm9wcGluZycpO1xyXG5cdFx0XHQgICAgbGV0IGRyb3BPYmogPSBKU09OLnBhcnNlKGV2LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9wbGFpblwiKSk7XHJcblx0XHRcdCAgICBjb25zb2xlLmxvZygnY3VycmVudCBjb29yZDogJywgZHJvcE9iai5jdXJyZW50X2Nvb3JkKTtcclxuXHRcdFx0ICAgIGxldCBzaGlwPXNoaXBzLmdldFNoaXAoZHJvcE9iai50eXBlKTtcclxuXHRcdFx0ICAgIGxldCBkcm9wU2hpcCA9IGZsZWV0Lmdob3N0U2hpcChkcm9wT2JqLnR5cGUsIGV2LnRhcmdldC5pZCwgZHJvcE9iai5vcmllbnRhdGlvbiwgc2hpcC5zaXplLCBkcm9wT2JqLm9mZnNldCk7XHJcblxyXG5cdFx0XHQgICAgaWYoZmxlZXQudmFsaWRhdGVTaGlwKGRyb3BTaGlwLCBkcm9wT2JqLnR5cGUpKSB7XHJcblx0XHRcdFx0ICAgIC8qIFRoZXJlIGFyZSBkaWZmZXJlbnQgYmVoYXZpb3JzIGZvciBzZXR0aW5nIHNoaXBzIGJhc2VkIG9uIHRoZSBpbml0aWFsIGxvYWRpbmcgb2YgdGhlIHNoaXBzXHJcblx0XHRcdFx0ICAgICAqIHZlcnN1cyBtb3ZpbmcgYSBzaGlwIGluIGdhbWUuIFdoZW4gbW92aW5nIHNoaXBzIGluIGdhbWUgdGhlIGRpc3BsYXkgc2hvdWxkIGNoYW5nZSB0byByZWZsZWN0XHJcblx0XHRcdFx0ICAgICAqIHRoZSBwb3RlbnRpYWwgbW92ZSBidXQgdGhlIGludGVybmFsIHN0cnVjdHVyZXMgc2hvdWxkIG5vdCBjaGFuZ2UgdW50aWwgaXQgaGFzIGJlZW4gdmFsaWRhdGVkXHJcblx0XHRcdFx0ICAgICAqIHdoZW4gcmVzb2x2aW5nIG1vdmVzLlxyXG5cdFx0XHRcdCAgICAgKlxyXG5cdFx0XHRcdCAgICAgKiBXaGVuIHNldHRpbmcgdXAgc2hpcHMgZm9yIHRoZSBpbml0aWFsIGdhbSB0aGUgc3RydWN0dXJlcyBzaG91bGQgY2hhbmdlIGFsb25nIHdpdGggdGhlIGRpc3BsYXksXHJcblx0XHRcdFx0ICAgICAqIGFsbCBhdCBvbmNlLlxyXG5cdFx0XHRcdCAgICAgKlxyXG5cdFx0XHRcdCAgICAgKiBUaGUgZnVuY3Rpb24gbW92ZVNoaXAgaXMgYSBjbG9zdXJlIHdob3NlIHZhbHVlIGlzIGNoYW5nZWQgb25jZSB0aGUgcGxheWVyIHNldHMgdGhlIGluaXRpYWwgZmxlZXQuXHJcblx0XHRcdFx0ICAgICAqL1xyXG5cdFx0XHRcdCAgICBpZihwbGF5ZXIuY2FuTW92ZSgpKSB7Z3JpZC5tb3ZlU2hpcChkcm9wT2JqLCBldiwgZHJvcFNoaXAsICdtb3ZlJyl9O1xyXG5cdFx0XHQgICAgfVxyXG5cclxuXHRcdFx0ICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cdFx0XHQgICAgZXYucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0ICAgIHJldHVybiBmYWxzZTtcclxuXHRcdFx0ICAgIH1cclxuXHRcdFx0KVxyXG5cdFx0ICAgICk7XHJcblxyXG5cdFx0ICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLChcclxuXHRcdFx0ZnVuY3Rpb24oZXYpe1xyXG5cdFx0XHQgICAgY29uc29sZS5sb2coJ2RyYWdvdmVyJyk7XHJcblx0XHRcdCAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHQgICAgZXYuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3Q9J21vdmUnO1xyXG5cdFx0XHQgICAgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHQgICAgfVxyXG5cdFx0XHQpKTtcclxuXHJcblx0XHQgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChcclxuXHRcdFx0ZnVuY3Rpb24oZSl7XHJcblx0XHRcdCAgICBsZXQgZHJvcCA9IHt9O1xyXG5cdFx0XHQgICAgbGV0IHR5cGUgPSBncmlkLmdldFR5cGVCeUNsYXNzKHRoaXMuY2xhc3NOYW1lKTtcclxuXHRcdFx0ICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuXHRcdFx0ICAgIGxldCBzdGFydCA9IGdyaWQuZmluZF9zdGFydChlLnRhcmdldC5pZCwgc2hpcC5vcmllbnRhdGlvbiwgc2hpcC5zaXplLCB0eXBlKTtcclxuXHRcdFx0ICAgIGxldCBvcmllbnRhdGlvbiA9IChzaGlwLm9yaWVudGF0aW9uID09ICd4JykgPyAneSc6J3gnOyAvLyBmbGlwIHRoZSBvcmllbnRhdGlvblxyXG5cdFx0XHQgICAgbGV0IGdob3N0ID0gZmxlZXQuZ2hvc3RTaGlwKHR5cGUsIGUudGFyZ2V0LmlkLCBvcmllbnRhdGlvbiwgc2hpcC5zaXplLCBzdGFydC5vZmZzZXQpO1xyXG5cclxuXHRcdFx0ICAgIGRyb3AudHlwZSA9IHR5cGU7XHJcblx0XHRcdCAgICBkcm9wLm9mZnNldCA9IHN0YXJ0Lm9mZnNldDtcclxuXHRcdFx0ICAgIGRyb3Aub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcclxuXHJcblx0XHRcdCAgICBpZihmbGVldC52YWxpZGF0ZVNoaXAoZ2hvc3QsIHR5cGUpKSB7XHJcblx0XHRcdFx0aWYocGxheWVyLmNhbk1vdmUoKSkge1xyXG5cdFx0XHRcdCAgICBzaGlwLm9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XHJcblx0XHRcdFx0ICAgIGdyaWQubW92ZVNoaXAoZHJvcCwgZSwgZ2hvc3QsICdwaXZvdCcpfTtcclxuXHRcdFx0ICAgIH1cclxuXHRcdFx0fSkpO1xyXG5cdH0sXHJcblxyXG5cdHNldFBsYXllckxpc3RlbmVyczogZnVuY3Rpb24oY2VsbCwgaGFuZGxlKXtcclxuXHRcdCAgICAvLyBTZXQgdGhlIElEIHZhbHVlIG9mIGVhY2ggY2VsbCB0byB0aGUgcm93L2NvbHVtbiB2YWx1ZSBmb3JtYXR0ZWQgYXMgcl9jXHJcblx0XHQgICAgY2VsbC5pZCA9IGhhbmRsZSArICdfJyArIGNlbGwuaWQ7XHJcblx0XHQgICAgLy8gU2V0IHVwIGRyYWcgYW5kIGRyb3AgZm9yIGVhY2ggY2VsbC5cclxuXHJcblx0XHQgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChcclxuXHRcdFx0ZnVuY3Rpb24oZSl7XHJcblx0XHRcdCAgICBpZihwbGF5ZXIuY2FuTW92ZSgpKSB7XHJcblx0XHRcdFx0cGxheWVyLnNldE1vdmUoe3R5cGU6ICdhdHRhY2snLFxyXG5cdFx0XHRcdFx0ICAgICAgY29vcmRpbmF0ZTogZS50YXJnZXQuaWR9KTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyggZS50YXJnZXQuaWQgKyAnIGlzIHVuZGVyIGF0dGFjaycpO1xyXG5cdFx0XHQgICAgfVxyXG5cdFx0XHR9XHJcblx0XHQgICAgKSk7XHJcblx0fSxcclxuXHJcblx0LypcclxuXHQgKiBmaW5kX3N0YXJ0IC0gRGV0ZXJtaW5lIHRoZSBzdGFydGluZyBjb29yZGluYXRlIG9mIGEgc2hpcCBnaXZlbiB0aGUgc3F1YXJlIHRoYXQgd2FzIGNsaWNrZWQuIEZvciBleGFtcGxlXHJcblx0ICogaXQgaXMgcG9zc2libGUgdGhhdCBhIGJhdHRsZXNoaXAgYWxvbmcgdGhlIHgtYXhpcyB3YXMgY2xpY2tlZCBhdCBsb2NhdGlvbiAzXzMgYnV0IHRoYXQgd2FzIHRoZSBzZWNvbmQgc3F1YXJlXHJcblx0ICogb24gdGhlIHNoaXAuIFRoaXMgZnVuY3Rpb24gd2lsbCBpZGVudGlmeSB0aGF0IHRoZSBiYXR0bGVzaGlwIHN0YXJ0cyBhdCAyXzMuXHJcblx0ICovXHJcblxyXG5cdGZpbmRfc3RhcnQ6IGZ1bmN0aW9uKHN0YXJ0X3Bvcywgb3JpZW50YXRpb24sIHNpemUsIHR5cGUpe1xyXG5cdCAgICBsZXQgaW5kZXggPSAob3JpZW50YXRpb24gPT0gJ3gnKSA/IDAgOiAxO1xyXG5cclxuXHQgICAgbGV0IHBpZWNlcz1zdGFydF9wb3Muc3BsaXQoJ18nKTtcclxuXHQgICAgbGV0IG9mZnNldCA9IDA7XHJcblxyXG5cdCAgICBmb3IgKGxldCBpPTA7IGkgPCBzaXplOyBpKyspIHtcclxuXHRcdGlmIChwaWVjZXNbaW5kZXhdID09IDApIHticmVhazt9XHJcblx0XHRwaWVjZXNbaW5kZXhdLS07XHJcblx0XHRsZXQgZyA9IGZsZWV0LmNoZWNrR3JpZChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xyXG5cdFx0aWYgKGcgPT0gdHlwZSAmJiBnICE9IGZhbHNlKXtcclxuXHRcdCAgICBvZmZzZXQrKztcclxuXHRcdCAgICBzdGFydF9wb3MgPSBwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV07XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0ICAgIGJyZWFrO1xyXG5cdFx0fVxyXG5cdCAgICB9XHJcblxyXG5cdCAgICByZXR1cm4ge3N0YXJ0X3Bvczogc3RhcnRfcG9zLCBvZmZzZXQ6IG9mZnNldH07XHJcblx0fSxcclxuXHJcblx0ZGlzcGxheVNoaXA6IGZ1bmN0aW9uICh0eXBlLCBjKSB7XHJcblx0ICAgIGxldCBjb29yZGluYXRlcyA9IGMgfHwgZmxlZXQuZ2V0RmxlZXQodHlwZSk7XHJcblx0ICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuXHJcblx0ICAgIGZvciAobGV0IGNvb3JkIGluIGNvb3JkaW5hdGVzKSB7XHJcblx0XHRncmlkLnNldFNwYWNlKGNvb3JkaW5hdGVzW2Nvb3JkXSwgc2hpcC5jbGlja0NsYXNzKTtcclxuXHQgICAgfVxyXG5cdH0sXHJcblxyXG5cdHNldFNwYWNlOiBmdW5jdGlvbihzcGFjZSwgY2xhc3NOYW1lKSB7XHJcblx0ICAgIHZhciBiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3BhY2UpOyBcclxuXHQgICAgYi5jbGFzc0xpc3QudG9nZ2xlKGNsYXNzTmFtZSk7XHJcblx0fSxcclxuXHJcblx0Z2V0VHlwZUJ5Q2xhc3M6IGZ1bmN0aW9uKGNsYXNzTmFtZSl7XHJcblx0XHRsZXQgc2hpcExpc3QgPSBzaGlwcy5nZXRTaGlwKCk7XHJcblx0XHRmb3IgKGxldCBzIGluIHNoaXBMaXN0KXtcclxuXHRcdFx0aWYgKGNsYXNzTmFtZS5tYXRjaChzaGlwTGlzdFtzXS5jbGlja0NsYXNzKSl7XHJcblx0XHRcdFx0cmV0dXJuIHM7XHJcblx0XHRcdFx0Ly9yZXR1cm4gc2hpcExpc3Rbc10udHlwZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbi8qKiogc2hpcHMuanMgKioqL1xyXG5sZXQgc2hpcHMgPSB7XHJcblx0Ly8gQ29uZmlnIHNldHRpbmdzIFxyXG5cdHNoaXBfY29uZmlnOiB7XHJcblx0ICAgIGFpcmNyYWZ0Q2FycmllciA6IHtcclxuXHRcdHNpemUgOiA1LFxyXG5cdFx0aWQgOiAnYWlyY3JhZnRDYXJyaWVyJyxcclxuXHRcdGNvbG9yIDogJ0NyaW1zb24nLFxyXG5cdFx0Y2xpY2tDbGFzcyA6ICdhY2NsaWNrZWQnLFxyXG5cdFx0bGFiZWwgOiAnQWlyY3JhZnQgQ2FycmllcicsXHJcblx0XHRtYXNrIDogMzEsXHJcblx0ICAgIH0sXHJcblx0ICAgIGJhdHRsZXNoaXAgOiB7XHJcblx0XHRzaXplIDogNCxcclxuXHRcdGlkIDogJ2JhdHRsZXNoaXAnLFxyXG5cdFx0Y29sb3I6J0RhcmtHcmVlbicsXHJcblx0XHRjbGlja0NsYXNzIDogJ2JzY2xpY2tlZCcsXHJcblx0XHRsYWJlbCA6ICdCYXR0bGVzaGlwJyxcclxuXHRcdG1hc2s6IDE1LFxyXG5cdCAgICB9LFxyXG5cdCAgICBkZXN0cm95ZXIgOiB7XHJcblx0XHRzaXplIDogMyxcclxuXHRcdGlkIDogJ2Rlc3Ryb3llcicsXHJcblx0XHRjb2xvcjonQ2FkZXRCbHVlJyxcclxuXHRcdGNsaWNrQ2xhc3MgOiAnZGVjbGlja2VkJyxcclxuXHRcdGxhYmVsIDogJ0Rlc3Ryb3llcicsXHJcblx0XHRtYXNrOiA3LFxyXG5cdCAgICB9LFxyXG5cdCAgICBzdWJtYXJpbmUgIDoge1xyXG5cdFx0c2l6ZSA6IDMsXHJcblx0XHRpZCA6ICdzdWJtYXJpbmUnLFxyXG5cdFx0Y29sb3I6J0RhcmtSZWQnLFxyXG5cdFx0Y2xpY2tDbGFzcyA6ICdzdWNsaWNrZWQnLFxyXG5cdFx0bGFiZWwgOiAnU3VibWFyaW5lJyxcclxuXHRcdG1hc2sgOiA3LFxyXG5cdCAgICB9LFxyXG5cdCAgICBwYXRyb2xCb2F0IDoge1xyXG5cdFx0c2l6ZSA6IDIsXHJcblx0XHRpZCA6ICdwYXRyb2xCb2F0JyxcclxuXHRcdGNvbG9yOidHb2xkJyxcclxuXHRcdGNsaWNrQ2xhc3MgOiAncGJjbGlja2VkJyxcclxuXHRcdGxhYmVsIDogJ1BhdHJvbCBCb2F0JyxcclxuXHRcdG1hc2s6IDMsXHJcblx0ICAgIH0sXHJcblx0fSxcclxuXHJcblx0aGl0Q291bnRlcjoge1xyXG5cdCAgICBhaXJjcmFmdENhcnJpZXIgOiAwLFxyXG5cdCAgICBiYXR0bGVzaGlwIDogMCxcclxuXHQgICAgZGVzdHJveWVyIDogMCxcclxuXHQgICAgc3VibWFyaW5lICA6IDAsXHJcblx0ICAgIHBhdHJvbEJvYXQgOiAwXHJcblx0fSxcclxuXHJcblx0c3Vua0NvdW50ZXI6IHt9LCAvLyBUcmFja3Mgd2hpY2ggYm9hdHMgaGF2ZSBiZWVuIHN1bmtcclxuXHJcblx0Ly8gVmFsdWVzIGZvciBkZXRlcm1pbmluZyBiaXQgdmFsdWVzIHdoZW4gYSBib2F0IHNpbmtzXHJcblx0YWlyQ3JhZnRDYXJyaWVyOiAxLFxyXG5cdGJhdHRsZXNoaXA6IDIsXHJcblx0ZGVzdHJveWVyOiA0LFxyXG5cdHN1Ym1hcmluZTogOCxcclxuXHRwYXRyb2xCb2F0OiAxNixcclxuXHJcblx0c2V0SGl0Q291bnRlcjogZnVuY3Rpb24gKHR5cGUsIGJpdCkge1xyXG5cdFx0c2hpcHMuaGl0Q291bnRlclt0eXBlXSA9IHNoaXBzLnNoaXBfY29uZmlnW3R5cGVdLm1hc2teKGJpdCpiaXQpO1xyXG5cdFx0aWYgKHNoaXBzLmhpdENvdW50ZXJbdHlwZV0gPT0gc2hpcHMuc2hpcF9jb25maWdbdHlwZV0ubWFzaykgeyAvLyBJIGRvbid0IGtub3cgaWYgdGhpcyBpcyBjb3JyZWN0IGJ1dCB0aGUgaWRlYSBpcyBjaGVjayB0byBzZWUgaWYgdGhlIHNoaXAgaXMgc3VuayBhbmQgZmxhZyBpdCBpZiBuZWVkIGJlXHJcblx0XHRcdHNoaXBzLnNldFN1bmtDb3VudGVyKHR5cGUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdHNldFN1bmtDb3VudGVyOiBmdW5jdGlvbiAodHlwZSkge1xyXG5cdFx0c2hpcHMuc3Vua0NvdW50ZXIgPSBzaGlwcy5zdW5rQ291bnRlcl50eXBlO1xyXG5cdH0sXHJcblxyXG5cdGdldEhpdENvdW50ZXI6IGZ1bmN0aW9uICh0eXBlKXtcclxuXHRcdHJldHVybiBzaGlwcy5oaXRDb3VudGVyW3R5cGVdO1xyXG5cdH0sXHJcblxyXG5cdGdldFN1bmtDb3VudGVyOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHNoaXBzLnN1bmtDb3VudGVyO1xyXG5cdH0sXHJcblxyXG5cdC8vIFNoaXAgY29uc3RydWN0b3IgLSBzaGlweWFyZD8/P1xyXG5cdHNoaXA6IGZ1bmN0aW9uKHNpemUsIGlkLCBjb2xvciwgY2xpY2tDbGFzcywgbGFiZWwpIHtcclxuXHRcdHRoaXMuc2l6ZSAgICAgICAgPSBzaXplO1xyXG5cdFx0dGhpcy5pZCAgICAgICAgICA9IGlkO1xyXG5cdFx0dGhpcy5jb2xvciAgICAgICA9IGNvbG9yO1xyXG5cdFx0dGhpcy5jbGlja0NsYXNzICA9IGNsaWNrQ2xhc3M7XHJcblx0XHR0aGlzLmxhYmVsICAgICAgID0gbGFiZWw7XHJcblxyXG5cdFx0cmV0dXJuICh0aGlzKTtcclxuXHR9LFxyXG5cclxuXHQvKlxyXG5cdCAqIFRoZSBzaGlwIG9iamVjdCBob2xkcyB0aGUgY3VycmVudCBvcmllbnRhdGlvbiBvZiB0aGUgc2hpcCBhbmQgdGhlIHN0YXJ0IGNvb3JkaW5hdGUgKHRvcG1vc3QvbGVmdG1vc3QpLiBXaGVuXHJcblx0ICogdGhlcmUgaXMgYSBjaGFuZ2UgdG8gdGhlIHNoaXAgdGhlIG1hc3RlciBtYXRyaXggbmVlZHMgdG8gYmUgdXBkYXRlZC4gQW4gZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB0aGVyZSBpc1xyXG5cdCAqIGEgY29vcmRpbmF0ZSBjaGFuZ2UuIFRoaXMgbGlzdGVuZXIgd2lsbCB1cGRhdGUgdGhlIG1hc3RlciBtYXRyaXguIENhbGxzIHRvIGNoZWNrIGxvY2F0aW9uIChtb3ZlIHZhbGlkdGlvbiwgXHJcblx0ICogY2hlY2sgaWYgaGl0LCBldGMuKSB3aWxsIGJlIG1hZGUgYWdhaW5zdCB0aGUgbWFzdGVyIG1hdHJpeC5cclxuXHQgKi9cclxuXHQvLyBQdWJsaWMgZnVuY3Rpb24gdG8gaW5pdGlhbGx5IGNyZWF0ZSBzaGlwcyBvYmplY3RcclxuXHRidWlsZFNoaXBzOiBmdW5jdGlvbiAoKXtcclxuXHQgICAgZm9yIChsZXQgcyBpbiBzaGlwcy5zaGlwX2NvbmZpZyl7XHJcblx0XHRzaGlwc1tzXSA9IHtzaXplOiBzaGlwcy5zaGlwX2NvbmZpZ1tzXS5zaXplLCBcclxuXHRcdFx0ICAgIHR5cGU6IHNoaXBzLnNoaXBfY29uZmlnW3NdLmlkLFxyXG5cdFx0XHQgICAgY29sb3I6IHNoaXBzLnNoaXBfY29uZmlnW3NdLmNvbG9yLFxyXG5cdFx0XHQgICAgY2xpY2tDbGFzczogc2hpcHMuc2hpcF9jb25maWdbc10uY2xpY2tDbGFzcyxcclxuXHRcdFx0ICAgIGxhYmVsOiBzaGlwcy5zaGlwX2NvbmZpZ1tzXS5sYWJlbFxyXG5cdFx0XHQgICB9O1xyXG5cdCAgICB9XHJcblx0cmV0dXJuIHNoaXBzO1xyXG5cdH0sXHJcblxyXG5cdGJ1aWxkU2hpcDogZnVuY3Rpb24odHlwZSl7XHJcblx0XHRzaGlwc1t0eXBlXSA9IHNoaXBzLnNoaXAoc2hpcHMuc2hpcF9jb25maWdbdHlwZV0uc2l6ZSwgc2hpcHMuc2hpcF9jb25maWdbdHlwZV0uaWQsIHNoaXBzLnNoaXBfY29uZmlnW3R5cGVdLmNvbG9yLCBzaGlwcy5zaGlwX2NvbmZpZ1t0eXBlXS5jbGlja0NsYXNzLCBzaGlwcy5zaGlwX2NvbmZpZ1t0eXBlXS5sYWJlbCk7XHJcblx0XHRyZXR1cm4gc2hpcHM7XHJcblx0fSxcclxuXHJcblx0Ly8gU2V0IHZhbHVlIGluIHNoaXAgb2JqZWN0LiBcclxuXHRzZXRTaGlwOiBmdW5jdGlvbih0eXBlLCBrZXksIHZhbHVlKXtcclxuXHRcdGlmICh0eXBlICYmIHNoaXBzW3R5cGVdICYmIGtleSkgeyAvLyBvbmx5IGF0dGVtcHQgYW4gdXBkYXRlIGlmIHRoZXJlIGlzIGEgbGVnaXQgc2hpcCB0eXBlIGFuZCBhIGtleVxyXG5cdFx0ICAgIHNoaXBzW3R5cGVdLmtleSA9IHZhbHVlO1xyXG5cdCAgIH1cclxuXHR9LFxyXG5cclxuXHQvLyBSZXR1cm4gc2hpcCBvYmplY3QgaWYgbm8gdHlwZSBnaXZlbiBvdGhlcndpc2UgcmV0dXJuIG9iamVjdCBjb250YWluaW5nIGp1c3QgcmVxdWVzdGVkIHNoaXBcclxuXHRnZXRTaGlwOiBmdW5jdGlvbiAodHlwZSl7XHJcblx0ICAgIGlmKHR5cGUpe1xyXG5cdFx0cmV0dXJuIHNoaXBzW3R5cGVdO1xyXG5cdCAgICB9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIHNoaXBzLnNoaXBfY29uZmlnO1xyXG5cdCAgICB9XHJcblx0fSxcclxuXHJcblx0Ly8gUHJpdmF0ZSBmdW5jdGlvbiB0byByYW5kb21seSBkZXRlcm1pbmUgc2hpcCdzIG9yaWVudGF0aW9uIGFsb25nIHRoZSBYLWF4aXMgb3IgWS1heGlzLiBPbmx5IHVzZWQgd2hlbiBwbG90dGluZyBzaGlwcyBmb3IgdGhlIGZpcnN0IHRpbWUuXHJcblx0Z2V0U3RhcnRDb29yZGluYXRlOiBmdW5jdGlvbihzaXplKXtcclxuXHQgICAgY29uc3Qgc3RhcnRfb3JpZW50YXRpb249TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjEwKSA+IDUgPyAneCcgOiAneSc7XHJcblx0ICAgIGNvbnN0IHN0YXJ0X3ggPSBzdGFydF9vcmllbnRhdGlvbiA9PSAneCcgPyBzaGlwcy5nZXRSYW5kb21Db29yZGluYXRlKHNpemUpIDogc2hpcHMuZ2V0UmFuZG9tQ29vcmRpbmF0ZSgwKTtcclxuXHQgICAgY29uc3Qgc3RhcnRfeSA9IHN0YXJ0X29yaWVudGF0aW9uID09ICd5JyA/IHNoaXBzLmdldFJhbmRvbUNvb3JkaW5hdGUoc2l6ZSkgOiBzaGlwcy5nZXRSYW5kb21Db29yZGluYXRlKDApO1xyXG5cclxuXHQgICAgcmV0dXJuIHtjb29yZGluYXRlOiBzdGFydF94ICsgJ18nICsgc3RhcnRfeSwgb3JpZW50YXRpb246IHN0YXJ0X29yaWVudGF0aW9ufTtcclxuXHR9LFxyXG5cclxuXHQvLyBUYWtlIHNoaXAgc2l6ZSBhbmQgb3JpZW50YXRpb24gaW50byBhY2NvdW50IHdoZW4gZGV0ZXJtaW5pbmcgdGhlIHN0YXJ0IHJhbmdlIHZhbHVlLiBleC4gZG9uJ3RcclxuXHQvLyBsZXQgYW4gYWlyY3JhZnQgY2FycmllciB3aXRoIGFuIG9yaWVudGF0aW9uIG9mICdYJyBzdGFydCBhdCByb3cgNyBiZWNhdXNlIGl0IHdpbGwgbWF4IG91dCBvdmVyIHRoZVxyXG5cdC8vIGdyaWQgc2l6ZS5cclxuXHRnZXRSYW5kb21Db29yZGluYXRlOiBmdW5jdGlvbihvZmZzZXQpe1xyXG5cdCAgICBjb25zdCBNQVhfQ09PUkQgPSAxMDtcclxuXHQgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSooTUFYX0NPT1JEIC0gb2Zmc2V0KSk7XHJcblx0fSxcclxuXHJcblx0Ly8gRklYTUUgRG9lcyBmbGVldC5naG9zdFNoaXAgZG8gdGhpcyBub3c/XHJcblx0Ly8gQnVpbGQgYW4gYXJyYXkgb2YgY29vcmRpbmF0ZXMgZm9yIGEgc2hpcCBiYXNlZCBvbiBpdCdzIG9yaWVudGF0aW9uLCBpbnRlbmRlZCBzdGFydCBwb2ludCBhbmQgc2l6ZVxyXG5cdC8qXHJcblx0X3NoaXBTdHJpbmc6IGZ1bmN0aW9uKHMpIHtcclxuXHRcdGNvbnN0IG8gPSBzLm9yaWVudGF0aW9uO1xyXG5cdFx0Y29uc3Qgc3QgPSBzLnN0YXJ0X2Nvb3JkaW5hdGU7XHJcblx0XHRsZXQgciA9IG5ldyBBcnJheTtcclxuXHRcdGxldCB0X3BpZWNlcyA9IHN0LnNwbGl0KCdfJyk7XHJcblx0XHRjb25zdCBpID0gbyA9PSAneCcgPyAwIDogMTtcclxuXHJcblx0XHRmb3IgKGxldCBqPTA7IGogPCBzLnNpemU7aisrKSB7XHJcblx0XHRcdHRfcGllY2VzW2ldID0gdF9waWVjZXNbaV0rMTtcclxuXHRcdFx0ci5wdXNoICh0X3BpZWNlc1swXSArICdfJyArIHRfcGllY2VzWzFdKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByO1xyXG5cdH0sXHJcblx0Ki9cclxuXHJcblx0LypcclxuXHQgKiBwbGFjZVNoaXBzIC0gSW5pdGlhbCBwbGFjZW1lbnQgb2Ygc2hpcHMgb24gdGhlIGJvYXJkXHJcblx0ICovXHJcblx0cGxhY2VTaGlwczogZnVuY3Rpb24gKCl7XHJcblx0XHQvKiBSYW5kb21seSBwbGFjZSBzaGlwcyBvbiB0aGUgZ3JpZC4gSW4gb3JkZXIgZG8gdGhpcyBlYWNoIHNoaXAgbXVzdDpcclxuXHRcdCAqICAgKiBQaWNrIGFuIG9yaWVudGF0aW9uXHJcblx0XHQgKiAgICogUGljayBhIHN0YXJ0aW5nIGNvb3JkaW5hdGVcclxuXHRcdCAqICAgKiBWYWxpZGF0ZSB0aGF0IHRoZSBjb29yZGluYXRlIGlzIHZhbGlkIChkb2VzIG5vdCBydW4gT09CLCBkb2VzIG5vdCBjcm9zcyBhbnkgb3RoZXIgc2hpcCwgZXRjLilcclxuXHRcdCAqICAgKiBJZiB2YWxpZDpcclxuXHRcdCAqICAgXHQqIFNhdmUgc3RhcnQgY29vcmQgYW5kIG9yaWVudGF0aW9uIGFzIHBhcnQgb2Ygc2hpcCBvYmplY3RcclxuXHRcdCAqICAgXHQqIFBsb3Qgc2hpcCBvbiBtYXN0ZXIgbWF0cml4XHJcblx0XHQgKi9cclxuXHRcdGxldCBzaGlwTGlzdCA9IHNoaXBzLmdldFNoaXAoKTtcclxuXHRcdGZvciAodmFyIHNoaXAgaW4gc2hpcExpc3QpIHtcclxuXHRcdCAgICBcclxuXHRcdCAgICBsZXQgc3RhcnQgPSBzaGlwcy5nZXRTdGFydENvb3JkaW5hdGUoc2hpcExpc3Rbc2hpcF0uc2l6ZSk7IFxyXG5cdFx0ICAgIGxldCBzaGlwX3N0cmluZyA9IGZsZWV0Lmdob3N0U2hpcChzaGlwLCBzdGFydC5jb29yZGluYXRlLCBzdGFydC5vcmllbnRhdGlvbik7XHJcblx0XHQgICAgc2hpcExpc3Rbc2hpcF0ub3JpZW50YXRpb24gPSBzdGFydC5vcmllbnRhdGlvbjtcclxuXHJcblx0XHQgICAgd2hpbGUgKCFmbGVldC52YWxpZGF0ZVNoaXAoc2hpcF9zdHJpbmcpKSB7XHJcblx0XHRcdHN0YXJ0ID0gc2hpcHMuZ2V0U3RhcnRDb29yZGluYXRlKHNoaXBMaXN0W3NoaXBdLnNpemUpOyBcclxuXHRcdFx0c2hpcExpc3Rbc2hpcF0ub3JpZW50YXRpb24gPSBzdGFydC5vcmllbnRhdGlvbjtcclxuXHRcdFx0c2hpcF9zdHJpbmcgPSBmbGVldC5naG9zdFNoaXAoc2hpcCwgc3RhcnQuY29vcmRpbmF0ZSwgc3RhcnQub3JpZW50YXRpb24pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0ICAgIGZsZWV0LnNldEZsZWV0KHN0YXJ0Lm9yaWVudGF0aW9uLFxyXG5cdFx0XHQgICAgICAgc2hpcCxcclxuXHRcdFx0ICAgICAgIHNoaXBMaXN0W3NoaXBdLnNpemUsXHJcblx0XHRcdCAgICAgICBzdGFydC5jb29yZGluYXRlKTtcclxuXHRcdCAgICB9XHJcblx0fVxyXG59XHJcblxyXG4vKioqIHBsYXllci5qcyAqKiovXHJcbmxldCBwbGF5ZXIgPSB7XHJcblx0cGxheWVyUm9zdGVyOiBuZXcgT2JqZWN0LCAvLyBQbGFjZWhvbGRlciBmb3IgYWxsIHBsYXllcnMgaW4gdGhlIGdhbWVcclxuXHRwbGF5ZXJPcmRlcjogW10sIC8vIE9yZGVyIG9mIHBsYXllciB0dXJuXHJcblx0bWU6IHVuZGVmaW5lZCxcclxuXHRvcmRlckluZGV4OiAwLFxyXG5cdGZsb3c6IFsncmVnaXN0ZXInLCdnYW1lJ10sXHJcblx0Y3VycmVudEZsb3c6IHVuZGVmaW5lZCxcclxuXHJcblx0Y2FuTW92ZTogZnVuY3Rpb24oKSB7XHJcblx0XHRpZiAocGxheWVyLnBsYXllck9yZGVyLmxlbmd0aCA+IG1vdmUuZ2V0TW92ZVNpemUoKSkgcmV0dXJuIHRydWU7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fSxcclxuXHJcblx0Ly8gUmVnaXN0ZXIgaGFuZGxlXHJcblx0cmVnaXN0ZXI6IGZ1bmN0aW9uKGhhbmRsZSl7XHJcblx0XHRwbGF5ZXIubWUgPSBoYW5kbGU7IC8vIFNlbGYgaWRlbnRpZnkgdGhpbmVzZWxmXHJcblx0XHQvLyBUT0RPIC0gY2FsbCBvdXQgdG8gdGhlIHJlZ2lzdHJhdGlvbiBzZXJ2aWNlIGFuZCBnZXQgYmFjayBoYW5kbGUgYW5kIHR1cm4gb3JkZXIuIFRoaXNcclxuXHRcdC8vIHN0cnVjdHVyZSByZXByZXNlbnRzIHRoZSByZXR1cm4gY2FsbCBmcm9tIHRoZSByZWdpc3RyYXRpb24gc2VydmljZS5cclxuXHRcdGNvbnN0IHJlZyA9IHtcclxuXHRcdFx0ICAgICAgaGFuZGxlOiAnZWxzcG9ya28nLFxyXG5cdFx0XHQgICAgICBvcmRlcjogMFxyXG5cdFx0fTtcclxuXHJcblx0XHRwbGF5ZXIucGxheWVyT3JkZXJbcmVnLm9yZGVyXSA9IHJlZy5oYW5kbGU7XHJcblx0XHRwbGF5ZXIuZ2FtZUZsb3coKTtcclxuXHRcdHJldHVybjtcclxuXHR9LFxyXG5cclxuXHQvL0FjY2VwdCByZWdpc3RyYXRpb24gZnJvbSBvdGhlciBwbGF5ZXJzXHJcblx0YWNjZXB0UmVnOiBmdW5jdGlvbihoYW5kbGUsIG9yZGVyKXtcclxuXHRcdHBsYXllci5wbGF5ZXJPcmRlcltvcmRlcl0gPSBoYW5kbGU7XHJcblx0XHRwbGF5ZXIucGxheWVyUm9zdGVyID0ge1xyXG5cdFx0XHRbaGFuZGxlXToge3BncmlkOiBmbGVldC5idWlsZE5hdXRpY2FsQ2hhcnR9XHJcblx0XHR9XHJcblx0XHRsZXQgcGcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWVyR3JpZCcpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTs7XHJcblx0XHRcclxuXHRcdHBnLmlkPWhhbmRsZTtcclxuXHRcdHBnLmlubmVySFRNTD1oYW5kbGU7XHJcblxyXG5cdFx0cGcuYXBwZW5kQ2hpbGQoZ3JpZC5jbGlja2FibGVHcmlkKDEwLCAxMCwgaGFuZGxlKSk7XHJcblx0fSxcclxuXHJcblx0bXlUdXJuOiBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiAocGxheWVyLmN1cnJlbnRQbGF5ZXIoKSA9PSBwbGF5ZXIubWUpID8gMSA6IDA7XHJcblx0fSxcclxuXHJcblx0bmV4dFBsYXllcjogZnVuY3Rpb24oKSB7XHJcblx0XHRwbGF5ZXIub3JkZXJJbmRleCA9IChwbGF5ZXIub3JkZXJJbmRleCA9PSBwbGF5ZXIucGxheWVyT3JkZXIubGVuZ3RoIC0gMSkgPyAgMCA6IHBsYXllci5vcmRlckluZGV4KzE7XHJcblx0XHRyZXR1cm47XHJcblx0fSxcclxuXHJcblx0Y3VycmVudFBsYXllcjogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBwbGF5ZXIucGxheWVyT3JkZXJbcGxheWVyLm9yZGVySW5kZXhdO1xyXG5cdH0sXHJcblxyXG5cdGdhbWVGbG93OiBmdW5jdGlvbigpe1xyXG5cdFx0aWYgKHBsYXllci5jdXJyZW50RmxvdyAhPSB1bmRlZmluZWQpe1xyXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwbGF5ZXIuZmxvd1twbGF5ZXIuY3VycmVudEZsb3ddKS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuXHRcdFx0cGxheWVyLmN1cnJlbnRGbG93Kys7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRwbGF5ZXIuY3VycmVudEZsb3cgPSAwO1xyXG5cdFx0fVxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGxheWVyLmZsb3dbcGxheWVyLmN1cnJlbnRGbG93XSkuc3R5bGUuZGlzcGxheT0naW5saW5lJztcclxuXHR9LFxyXG5cclxuXHRzZXRNb3ZlOiBmdW5jdGlvbihtKXtcclxuXHRcdHJldHVybiBtb3ZlLnNldE1vdmUobSk7XHJcblx0fSxcclxufVxyXG5cclxuLyoqKiBtb3ZlLmpzICoqKi9cclxubGV0IG1vdmUgPSB7XHJcblx0bW92ZUxpc3Q6IFtdLFxyXG5cdG1vdmVNYXA6IHt9LFxyXG5cclxuXHRkZWxldGVNb3ZlOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdGNsZWFyTW92ZUxpc3Q6IGZ1bmN0aW9uKCkge1xyXG5cdFx0bW92ZS5tb3ZlTGlzdCA9IFtdO1xyXG5cdH0sXHJcblxyXG5cdC8qXHJcblx0ICogQ3JlYXRlIGEgYmxvY2sgdG8gdmlzdWFsbHkgcmVwcmVzZW50IGEgbW92ZS4gR2VuZXJpYyBIVE1MIGJsb2NrIGZvciBtb3ZlIG9iamVjdHM6XHJcblx0ICogPGRpdiBpZD08dHlwZT5fPHBsYXllcj5fPGNvb3Jkcz4gY2xhc3M9XCJtb3ZlXCI+XHJcblx0ICogICA8ZGl2IGNsYXNzPVwibW92ZURldGFpbFwiPlxyXG5cdCAqICAgICBhdHRhY2s6IG1lZ2FuXzBfMCAoKiBNb3ZlIHRleHQgKilgXHJcblx0ICogICAgIDxkaXYgY2xhc3M9XCJkZWxldGVcIj5kZWxldGU8L2Rpdj4gPCEtLSBlbGVtZW50IHRvIGRlbGV0ZSBtb3ZlIGJlZm9yZSBzdWJtaXR0ZWQgLS0+XHJcblx0ICogICA8L2Rpdj5cclxuXHQgKiA8L2Rpdj5cclxuXHQgKiBcclxuXHQgKi9cclxuXHRtb3ZlTGlzdEJsb2NrOiBmdW5jdGlvbihtKSB7XHJcblx0XHRsZXQgbW92ZVN0cnVjdD17fTtcclxuXHRcdGxldCBtdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0bW92ZVN0cnVjdC5pZCA9IG12LmlkID0gbS50eXBlICsgJ18nICsgbS5jb29yZGluYXRlO1xyXG5cdFx0bXYuY2xhc3NOYW1lID0gJ21vdmUnO1xyXG5cclxuXHRcdG12LnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywndHJ1ZScpO1xyXG5cdFx0bW92ZS5tb3ZlT3JkZXJIYW5kbGVyKG12KTtcclxuXHJcblx0XHRsZXQgbW92ZVN0cmluZyA9IG0udHlwZSArICc6ICcgKyBtLmNvb3JkaW5hdGU7XHJcblx0XHRsZXQgbWR0bCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0bWR0bC5pbm5lckhUTUw9bW92ZVN0cmluZztcclxuXHJcblx0XHRsZXQgbWRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0bWRlbC5pbm5lckhUTUw9J0RlbGV0ZSc7XHJcblx0XHRtZGVsLmlkID0gJ2RlbF8nICsgbXYuaWQ7XHJcblx0XHRtb3ZlLnNldF9tdkxpc3RlbmVycyhtdik7XHJcblxyXG5cdFx0bXYuYXBwZW5kQ2hpbGQobWR0bCk7XHJcblx0XHRtdi5hcHBlbmRDaGlsZChtZGVsKTtcclxuXHRcdFxyXG5cdFx0bW92ZVN0cnVjdC5kb20gPSBtdjtcclxuXHRcdG1vdmVTdHJ1Y3QudHlwZSA9IG0udHlwZTtcclxuXHRcdC8vIHN0b3JlIGN1cnJlbnQgc2hpcCBjb29yZGluYXRlIHN0cmluZyBzbyB0aGF0IHdoZW4gYSBtb3ZlIGlzIGRlbGV0ZWQgaXQgd2lsbCBiZSByZXN0b3JlZCB0byBpdCdzIHByaW9yIGxvY2F0aW9uXHJcblx0XHRtb3ZlU3RydWN0Lmdob3N0ID0gbS5naG9zdDtcclxuXHRcdG1vdmVTdHJ1Y3Qub3JpZW50YXRpb24gPSBtLm9yaWVudGF0aW9uO1xyXG5cdFx0bW92ZVN0cnVjdC5zaGlwVHlwZSA9IG0uc2hpcFR5cGU7XHJcblx0XHRtb3ZlU3RydWN0LnNpemUgPSBtLnNoaXBTaXplO1xyXG5cclxuXHRcdHJldHVybiBtb3ZlU3RydWN0O1xyXG5cdH0sXHJcblxyXG5cdC8vIEFkZCBkZWxldGUgbW92ZSBmdW5jdGlvblxyXG5cdHNldF9tdkxpc3RlbmVyczogZnVuY3Rpb24obXYpe1xyXG5cdFx0bXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdC8vIENoZWNrIHRvIHNlZSBpZiBhbm90aGVyIHNoaXAgaXMgaW4gdGhlIHBhdGggb2YgdGhlIGF0dGVtcHRlZCByZXN0b3JlXHJcblx0XHRcdGlmIChtdi5pZC5tYXRjaCgvXmF0dGFjay8pICl7XHJcblx0XHRcdFx0bW92ZS5kZWxldGVfbW92ZShtdik7XHJcblx0XHRcdH0gZWxzZSBpZiAoZmxlZXQudmFsaWRhdGVTaGlwKG1vdmUudW5kbywgbW92ZS5zaGlwVHlwZSApKSB7XHJcblx0XHRcdFx0bW92ZS5kZWxldGVfbW92ZShtdik7XHJcblx0XHRcdFx0Ly8gUmVwYWludCB0aGUgb3JpZ2luYWwgc2hpcFxyXG5cdFx0XHRcdGdyaWQuZGlzcGxheVNoaXAobW92ZS5zaGlwVHlwZSk7XHJcblx0XHRcdFx0ZmxlZXQuc2V0RmxlZXQgKG1vdmUub3JpZW50YXRpb24sIG1vdmUuc2hpcFR5cGUsIHNoaXBzLmdldFNoaXAobW92ZS5zaGlwVHlwZSkuc2l6ZSwgbW92ZS5naG9zdFswXSwgMCk7IFxyXG5cdFx0XHRcdGdyaWQuZGlzcGxheVNoaXAobW92ZS5zaGlwcywgbW92ZS5zaGlwVHlwZSk7XHJcblx0XHRcdH1cclxuXHRcdH0pKTtcclxuXHR9LFxyXG5cclxuXHRkZWxldGVfbW92ZTogZnVuY3Rpb24obXYpe1xyXG5cdFx0Ly8gUmVtb3ZlIHRoZSBkaXZcclxuXHRcdC8vIE5lZWQgdG8ga25vdyBwYXJlbnQgZWxlbWVudCB3aGljaCwgZm9yIGV2ZXJ5dGhpbmcgaW4gdGhlIG1vdmUgbGlzdCwgaXMgdGhlIGVsZW1lbnQgd2hvc2UgaWQgaXMgcGxheU9yZGVyXHJcblx0XHRsZXQgcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKTtcclxuXHRcdGxldCBkbXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChtdi5pZCk7XHJcblx0XHRwLnJlbW92ZUNoaWxkKGRtdik7XHJcblxyXG5cdFx0Ly8gRGVsZXRlIHRoZSBlbnRyeSBmcm9tIHRoZSBhcnJheVxyXG5cdFx0Zm9yIChsZXQgbCBpbiBtb3ZlLm1vdmVMaXN0KSB7XHJcblx0XHRcdGlmKG1vdmUubW92ZUxpc3RbbF0uaWQgPT0gbXYuaWQpe1xyXG5cdFx0XHRcdG1vdmUubW92ZUxpc3Quc3BsaWNlKGwsMSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0fSxcclxuXHJcblx0Ly8gU2V0IHVwIGRyYWcgZHJvcCBmdW5jdGlvbmFsaXR5IGZvciBzZXR0aW5nIG1vdmUgb3JkZXJcclxuXHRtb3ZlT3JkZXJIYW5kbGVyOiBmdW5jdGlvbihwbykge1xyXG5cdCAgICBwby5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLChmdW5jdGlvbihlKXtcclxuXHRcdCAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkPSdtb3ZlJztcclxuXHRcdCAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dC9wbGFpblwiLFxyXG5cdFx0XHRKU09OLnN0cmluZ2lmeSh7XHJcblx0XHRcdFx0Y2hhbmdlTW92ZTogZS50YXJnZXQuaWRcclxuXHRcdFx0fSlcclxuXHRcdCAgICApO1xyXG5cdCAgICB9KSk7XHJcblx0ICAgIHBvLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywoZnVuY3Rpb24oZSl7XHJcblx0XHRcdCAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdCAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0PSdtb3ZlJztcclxuXHRcdFx0ICAgIHJldHVybiBmYWxzZTtcclxuXHQgICAgfSkpO1xyXG5cdCAgICBwby5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywoZnVuY3Rpb24oZSl7XHJcblx0XHRcdCAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cdFx0XHQgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHQgICAgbGV0IGRyb3BPYmogPSBKU09OLnBhcnNlKGUuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJ0ZXh0L3BsYWluXCIpKTtcclxuXHRcdFx0ICAgIG1vdmUuYWx0ZXJNb3ZlSW5kZXgoZHJvcE9iai5jaGFuZ2VNb3ZlLCBlLnRhcmdldC5pZCk7XHJcblx0XHRcdCAgICByZXR1cm4gZmFsc2U7XHJcblx0ICAgIH0pKTtcclxuXHR9LFxyXG5cclxuXHRhbHRlck1vdmVJbmRleDogZnVuY3Rpb24oc3RhcnRJbmRleCwgZW5kSW5kZXgpe1xyXG5cdFx0bGV0IHN0YXJ0SWQgPSBzdGFydEluZGV4O1xyXG5cdFx0c3RhcnRJbmRleCA9IHBhcnNlSW50KG1vdmUubW92ZU1hcFtzdGFydEluZGV4XSk7XHJcblx0XHRlbmRJbmRleCAgID0gcGFyc2VJbnQobW92ZS5tb3ZlTWFwW2VuZEluZGV4XSk7XHJcblxyXG5cdFx0bGV0IGJlZ2luID0gc3RhcnRJbmRleCA8IGVuZEluZGV4ID8gcGFyc2VJbnQoc3RhcnRJbmRleCwgMTApIDogcGFyc2VJbnQoZW5kSW5kZXgsIDEwKTtcclxuXHRcdGxldCBlbmQgPSAgIHN0YXJ0SW5kZXggPCBlbmRJbmRleCA/IHBhcnNlSW50KGVuZEluZGV4LCAxMCkgOiBwYXJzZUludChzdGFydEluZGV4LCAxMCk7XHJcblx0XHRsZXQgaG9sZCA9IG1vdmUubW92ZUxpc3Rbc3RhcnRJbmRleF07XHJcblxyXG5cdFx0d2hpbGUoYmVnaW4gPCBlbmQpe1xyXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChtb3ZlLm1vdmVMaXN0W2JlZ2luXS5pZCkuYXBwZW5kQ2hpbGQoKG1vdmUubW92ZUxpc3RbYmVnaW4rMV0pKTtcclxuXHRcdFx0bW92ZS5tb3ZlTGlzdFtiZWdpbl0gPSBtb3ZlLm1vdmVMaXN0W2JlZ2luKzFdO1xyXG5cdFx0XHRtb3ZlLm1vdmVNYXBbc3RhcnRJZF0gPSBiZWdpbisxO1xyXG5cdFx0XHRiZWdpbisrO1xyXG5cdFx0fVxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobW92ZS5tb3ZlTGlzdFtlbmRdLmlkKS5hcHBlbmRDaGlsZChkb2N1bWVudC5nZXRFbGVtZW50QnlJZFtob2xkXS5pZCk7XHJcblx0XHRtb3ZlLm1vdmVMaXN0W2VuZF0gPSBob2xkO1xyXG5cdFx0bW92ZS5tb3ZlTWFwW3N0YXJ0SWRdID0gZW5kO1xyXG5cdH0sXHJcblxyXG5cdHJlc29sdmVNb3ZlczogZnVuY3Rpb24gKCl7XHJcblx0XHRsZXQgcGFyZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXlPcmRlcicpO1xyXG5cdFx0Y29uc29sZS5sb2coJ1Jlc29sdmluZyBtb3ZlcycpO1xyXG5cdFx0Zm9yKGxldCBtIGluIG1vdmUubW92ZUxpc3QpIHtcclxuXHRcdFx0bGV0IG1vdmUgPSBtb3ZlLm1vdmVMaXN0W21dO1xyXG5cdFx0XHRjb25zb2xlLmxvZygnbW92ZTogJywgbW92ZSk7XHJcblx0XHRcdHN3aXRjaChtb3ZlLnR5cGUpIHtcclxuXHRcdFx0XHRjYXNlICdhdHRhY2snOiBcclxuXHRcdFx0XHRcdGdyaWQuYXR0YWNrUGxheWVyKG1vdmUuY29vcmRpbmF0ZSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlICdtaW5lJzpcclxuXHRcdFx0XHRcdGdyaWQuc2V0TWluZShtb3ZlLmNvb3JkaW5hdGUpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAnbW92ZSc6XHJcblx0XHRcdFx0XHRncmlkLm1vdmVTaGlwKCk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlICdwaXZvdCc6XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0bGV0IGNoaWxkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobW92ZS5pZCk7XHJcblx0XHRwYXJlbnQucmVtb3ZlQ2hpbGQoY2hpbGQpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdG1vdmVTaGlwOiBmdW5jdGlvbihtb3ZlKXtcclxuXHRcdC8vIENoZWNrIGZvciBtaW5lcyBiYXNlZCBvbiBnaG9zdCAtIHNlbmQgbWVzc2FnZSB0byBtaW5lIHNlcnZpY2VcclxuXHRcdGxldCBibGFzdEF0ID0gZ3JpZC5jaGVja19mb3JfbWluZShtb3ZlLmdob3N0KTtcclxuXHRcdGlmIChibGFzdEF0ICE9IGZhbHNlKXtcclxuXHRcdFx0Ly8gUmVzZXQgZ2hvc3QgaWYgbWluZSBmb3VuZCAtIElmIGEgbWluZSBoYXMgYmVlbiBlbmNvdW50ZXJlZCB0aGVuIHRoZSBzaGlwIG9ubHkgbW92ZXMgdG8gdGhlIHBvaW50IG9mIHRoZSBibGFzdFxyXG5cdFx0XHRncmlkLnJlc2V0R2hvc3QoYmxhc3RBdCk7XHJcblx0XHRcdC8vIGZpbmQgd2hpY2ggc3F1YXJlIGdvdCBoaXRcclxuXHRcdFx0bGV0IHRhcmdldDtcclxuXHRcdFx0Zm9yKGxldCBtIGluIG1vdmUuZ2hvc3Qpe1xyXG5cdFx0XHRcdGlmIChtb3ZlLmdob3N0W21dID09IGJsYXN0QXQpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0dGFyZ2V0PW1vdmUuZ2hvc3RbbV07XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0c2hpcHMuc2V0SGl0Q291bnRlcihtb3ZlLnNoaXBUeXBlLCBtKzEpO1xyXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXQpLmNsYXNzTmFtZSArPScgc2hpcEhpdCc7XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGZsID0gZmxlZXQuZ2V0RmxlZXQobW92ZS5zaGlwVHlwZSk7XHJcblx0XHRsZXQgcyA9IHNoaXBzLmdldFNoaXAobW92ZS5zaGlwVHlwZSk7XHJcblxyXG5cdFx0aWYgKGZsWzBdID09IG1vdmUuZ2hvc3RbMF0gJiYgbW92ZS5vcmllbnRhdGlvbiA9PSBzLm9yaWVudGF0aW9uKSB7IC8vIGNoZWNrIHN0YXJ0aW5nIHBvaW50cyBhbmQgb3JpZW50YXRpb24gc2V0IGFuZCByZWRpc3BsYXkgb25seSBpZiBkaWZmZXJlbnRcclxuXHRcdFx0Ly8gVmFsaWRhdGUgbW92ZSBjYW4gYmUgbWFkZVxyXG5cdFx0XHRpZihmbGVldC52YWxpZGF0ZVNoaXAobW92ZS5naG9zdCwgbW92ZS5zaGlwVHlwZSkpIHtcclxuXHRcdFx0XHRncmlkLmRpc3BsYXlTaGlwKHNoaXBzLCBtb3ZlLnNoaXBUeXBlKTtcclxuXHRcdFx0XHQvLyBTZXQgZ2hvc3QgdG8gTmF1dGljYWxDaGFydC9NYXBcclxuXHRcdFx0XHRmbGVldC5zZXRGbGVldCAobW92ZS5vcmllbnRhdGlvbiwgbW92ZS5zaGlwVHlwZSwgc2hpcHMuZ2V0U2hpcChtb3ZlLnNoaXBUeXBlKS5zaXplLCBtb3ZlLmdob3N0WzBdLCAwKTsgXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIERpc3BsYXkgbmV3IHNoaXAgbG9jYXRpb24gYmFzZWQgb24gTmF1dGljYWxDaGFydC9NYXBcclxuXHRcdFx0Z3JpZC5kaXNwbGF5U2hpcChtb3ZlLnNoaXBUeXBlLCBtb3ZlLmdob3N0KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRyZXNldEdob3N0OiBmdW5jdGlvbihibGFzdEF0KXtcclxuXHRcdGZvciAobGV0IGkgaW4gbW92ZS5naG9zdCl7XHJcblx0XHRcdGlmIChibGFzdEF0ID09IG1vdmUuZ2hvc3RbaV0pIGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBtb3ZlLmdob3N0ID0gZmxlZXQuZ2hvc3RTaGlwKG1vdmUudHlwZSwgbW92ZS5naG9zdFtpXSwgbW92ZS5vcmllbnRhdGlvbiwgbW92ZS5naG9zdC5sZW5ndGgsIGkpO1xyXG5cdH0sXHJcblxyXG5cdC8vIFN0dWIgZm9yIG1pbmUgZGV0ZWN0aW9uXHJcblx0Y2hlY2tfZm9yX21pbmU6IGZ1bmN0aW9uIChnKXtcclxuXHRcdGxldCBtaW5lQXQgPSB7JzBfNic6IDEsICcxXzYnOiAxLCAnMl82JzogMSwgJzNfNic6IDEsICc0XzYnOiAxLCAnNV82JzogMSwgJzZfNic6IDEsICc3XzYnOiAxLCAnOF82JzogMSwgJzlfNic6IDF9O1xyXG5cdFx0Zm9yKGxldCBpIGluIGcpIHtcclxuXHRcdFx0Ly8gcmV0dXJuIGxvY2F0aW9uIHdoZXJlIG1pbmUgc3RydWNrXHJcblx0XHRcdGlmKG1pbmVBdFtnW2ldXSA9PSAxKSB7IFxyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdCT09NJyk7XHJcblx0XHRcdFx0cmV0dXJuIGdbaV07IFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fSxcclxuXHRcdFxyXG5cclxuXHRhdHRhY2tQbGF5ZXI6IGZ1bmN0aW9uKGNvb3JkaW5hdGUpe1xyXG5cdFx0Ly8gU2VuZCBhIG1lc3NhZ2UgcmVxdWVzdGluZyBoaXQvbWlzcyB2YWx1ZSBvbiBlbmVteSdzIGdyaWRcclxuXHRcdC8vIEluZm9ybSBhbGwgb2YgZW5lbXkncyBjb29yZGluYXRlIHN0YXR1c1xyXG5cdH0sXHJcblxyXG5cdHNldE1pbmU6IGZ1bmN0aW9uKGNvb3JkaW5hdGUpe1xyXG5cdFx0Ly8gU2VuZCBhIG1lc3NhZ2UgcmVxdWVzdGluZyBoaXQvbWlzcyB2YWx1ZSBvbiBlbmVteSdzIGdyaWRcclxuXHRcdC8vIElmIG5vdCBhIGhpdCByZWdpc3RlciB3aXRoIHNlcnZpY2UgdGhhdCBtaW5lIHBsYWNlZCBvbiBlbmVteSBncmlkXHJcblx0fSxcclxuXHJcblx0c2V0TW92ZTogZnVuY3Rpb24obSl7XHJcblx0XHRpZihtb3ZlLm1vdmVNYXBbbS5jb29yZGluYXRlXSA9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0bW92ZS5tb3ZlTWFwW20uY29vcmRpbmF0ZV0gPSBtb3ZlLm1vdmVMaXN0Lmxlbmd0aDtcclxuXHRcdFx0bGV0IG12ID0gbW92ZS5tb3ZlTGlzdEJsb2NrKG0pO1xyXG5cdFx0XHRtb3ZlLm1vdmVMaXN0LnB1c2gobXYpO1xyXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheU9yZGVyJykuYXBwZW5kQ2hpbGQobXYuZG9tKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRnZXRNb3ZlU2l6ZTogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiBtb3ZlLm1vdmVMaXN0Lmxlbmd0aDtcclxuXHR9XHJcbn1cclxuXHJcbi8qKiogYmF0dGxlc2hpcE9uZS5qcyAqKiovXHJcblxyXG5mbGVldC5pbml0KCk7XHJcbnBsYXllci5nYW1lRmxvdygpO1xyXG5cclxuLyogUmVnaXN0ZXIgKi9cclxuLy8gVE9ETyAtIGF0dGFjaCBoYW5kbGVyIHRocm91Z2ggcHVnOyBtb3ZlIGhhbmRsZXJzIHRvIGFub3RoZXIgbW9kdWxlXHJcbmxldCByPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3RlcicpO1xyXG5yLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXHJcbiAgICBmdW5jdGlvbigpe1xyXG5cdCAgICBwbGF5ZXIucmVnaXN0ZXIoKTtcclxuXHQgICAgLy9yZXR1cm47XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG5sZXQgZj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0RmxlZXQnKTtcclxuZi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0RmxlZXQnKS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWVyR3JpZCcpLnN0eWxlLmRpc3BsYXk9J2lubGluZSc7XHJcblx0Z3JpZC5zZXRNb3ZlU2hpcCgpOyBcclxuXHQgICAgcGxheUdhbWUoKTtcclxuXHQgICAgLy9yZXR1cm47XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG4vLyBTZXQgdXAgbGluayB0byByZXNvbHZlIG1vdmVzXHJcbmxldCBkPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkb01vdmVzJyk7XHJcbmQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLFxyXG5cdGZ1bmN0aW9uKCl7XHJcblx0XHQvLyBSZXNvbHZlIG9yZGVyc1xyXG5cdFx0bW92ZS5yZXNvbHZlTW92ZXMoKTtcclxuXHRcdC8vIFJlc2V0IG1vdmVzXHJcblx0XHRtb3ZlLmNsZWFyTW92ZUxpc3QoKTtcclxuXHRcdC8vIFR1cm4gbW92ZXMgb3ZlciB0byB0aGUgbmV4dCBwbGF5ZXJcclxuXHRcdC8vIEZJWE1FIC0gU2ltdWxhdGluZyBtb3ZlcyBmb3Igbm93LiBSZW1vdmUgd2hlbiByZWFkeSBmb3IgcmVhbHNpZXNcclxuXHJcblx0fSwgZmFsc2UpO1xyXG4vLyBTZXQgdXAgZ3JpZFxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXlHcmlkJykuYXBwZW5kQ2hpbGQoZ3JpZC5jbGlja2FibGVHcmlkKDEwLCAxMCkpO1xyXG5cclxuLy8gU2V0IHVwIGRyYWcvZHJvcCBvZiBtb3Zlc1xyXG4vL2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKS5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsJ3RydWUnKTtcclxuLy9wbGF5ZXIucGxheWVyT3JkZXJIYW5kbGVyKCk7XHJcblxyXG4vKiBTZXQgcmFuZG9tIGZsZWV0ICovXHJcbnNoaXBzLmJ1aWxkU2hpcHMoKTtcclxuc2hpcHMucGxhY2VTaGlwcygpO1xyXG5sZXQgd2hvbGVGbGVldCA9IGZsZWV0LmdldFdob2xlRmxlZXQoKTtcclxuZm9yIChsZXQgdCBpbiB3aG9sZUZsZWV0KSB7XHJcblx0Z3JpZC5kaXNwbGF5U2hpcCh0KTtcclxufVxyXG5cclxuLyogXHJcbiAqIE1vY2sgZ2FtZSB3aWxsIGJlIHJlbW92ZWQgXHJcbiAqL1xyXG5sZXQgbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdNZWdhblJlZycpO1xyXG5tLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXHJcbiAgICBmdW5jdGlvbigpe1xyXG4gICAgICAgIHBsYXllci5hY2NlcHRSZWcoJ01lZ2FuJywgMSk7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ01lZ2FuUmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG5sZXQgcnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnUnlhblJlZycpO1xyXG5yeS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdSeWFuJywgMik7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1J5YW5SZWcnKS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuICAgIH0sIGZhbHNlKTtcclxuXHJcbmxldCB0ciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdUcmFjZXlSZWcnKTtcclxudHIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBcclxuICAgIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcGxheWVyLmFjY2VwdFJlZygnVHJhY2V5JywgMyk7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1RyYWNleVJlZycpLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxuLyogUGxheSBnYW1lICovXHJcbi8qXHJcbndoaWxlICgxKSB7XHJcblx0cGxheWVyLmdldFR1cm4oKTtcclxufVxyXG4qL1xyXG5cclxuZnVuY3Rpb24gcGxheUdhbWUoKXtcclxuXHRpZiAocGxheWVyLm15VHVybigpKXtcclxuXHRcdC8vd2luZG93Lm9wZW4oJycsJ2F0dGFjaycsICdoZWlnaHQ9MjAwLHdpZHRoPTIwMCxtZW51YmFyPW5vLHN0YXR1cz1ubyx0aXRsZWJhcj1ubyx0b29sYmFyPW5vJywgZmFsc2UgKTtcclxuXHR9XHJcbn1cclxuXHJcbiJdfQ==
