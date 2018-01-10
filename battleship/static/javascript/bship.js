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
						start_coord:   (fleet.readMap(type)).start_coord,
						index:         ship.size,
						type:          type,
						current_coord: fleet.ghostShip(type, start.start_pos),
						orientation:   (fleet.readMap(type)).orientation
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
		moveStruct.undo = m.undo || undefined;

		return moveStruct;
	},

	// Add delete move function
	set_mvListeners: function(mv){
		mv.addEventListener('click', (function() {
			let m = move.getMove(mv);
			// Check to see if another ship is in the path of the attempted restore
			if (mv.id.match(/^attack/) ){
				move.delete_move(mv);
			} else if (fleet.validateShip(m.undo, m.shipType )) {
				move.delete_move(mv);
				// Repaint the original ship
				grid.displayShip(m.shipType);
				fleet.setFleet (m.orientation, m.shipType, ships.getShip(m.shipType).size, m.ghost[0], 0); 
				grid.displayShip(m.shipType);
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
		move.moveList.splice(move.getMove(mv),1);
	},

	getMove: function (mv){
		for (let l in move.moveList) {
			if(move.moveList[l].id == mv.id){
				return move.moveList[l]
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
			let mv = move.moveList[m];
			console.log('move: ', mv);
			switch(mv.type) {
				case 'attack': 
					grid.attackPlayer(mv.coordinate);
					break;
				case 'mine':
					grid.setMine(mv.coordinate);
					break;
				case 'move':
					grid.moveShip();
					break;
				case 'pivot':
					break;
			}
		let child = document.getElementById(mv.id);
		parent.removeChild(child);
		}
	},

	moveShip: function(){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL21udC9jL1VzZXJzL0pTL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJhdHRsZXNoaXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbi8qKiogZmxlZXQuanMgKioqL1xudmFyIGZsZWV0ID0ge1xuXHRuYXV0aWNhbE1hcDoge30sIC8vIEhhc2ggbG9va3VwIHRoYXQgdHJhY2tzIGVhY2ggc2hpcCdzIHN0YXJ0aW5nIHBvaW50IGFuZCBjdXJyZW50IG9yaWVudGF0aW9uXG5cdGluaXQ6IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGZsZWV0Lm5hdXRpY2FsQ2hhcnQgPSBmbGVldC5idWlsZE5hdXRpY2FsQ2hhcnQoKTsgLy8gRGV0YWlsZWQgbWF0cml4IG9mIGV2ZXJ5IHNoaXAgaW4gdGhlIGZsZWV0XG5cdH0sXG5cblx0YnVpbGROYXV0aWNhbENoYXJ0OiBmdW5jdGlvbigpe1xuXHRcdGxldCBjaGFydCA9IG5ldyBBcnJheTtcblx0XHRmb3IobGV0IGk9MDsgaSA8IDEwOyBpKyspIHtcblx0XHRcdGNoYXJ0W2ldID0gbmV3IEFycmF5O1xuXHRcdFx0Zm9yIChsZXQgaj0wOyBqIDwgMTA7IGorKyl7XG5cdFx0XHRcdGNoYXJ0W2ldW2pdID0gdW5kZWZpbmVkOy8vbmV3IEFycmF5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gY2hhcnQ7XG5cdH0sXG5cblx0Z2V0RmxlZXQ6IGZ1bmN0aW9uKHR5cGUpe1xuXHRcdGxldCBvcmllbnRhdGlvbiA9IGZsZWV0Lm5hdXRpY2FsTWFwW3R5cGVdLm9yaWVudGF0aW9uID09ICd4JyA/IDAgOiAxO1xuXHRcdGxldCBwaWVjZXMgPSBmbGVldC5uYXV0aWNhbE1hcFt0eXBlXS5zdGFydF9jb29yZC5zcGxpdCgnXycpO1xuXHRcdGxldCByZXQgPSBuZXcgQXJyYXk7XG5cblx0XHR3aGlsZSAocGllY2VzW29yaWVudGF0aW9uXSA8IGZsZWV0Lm5hdXRpY2FsQ2hhcnRbb3JpZW50YXRpb25dLmxlbmd0aCAmJiBmbGVldC5uYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV0gPT0gdHlwZSkge1xuXHRcdFx0cmV0LnB1c2ggKHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXSk7XG5cdFx0XHRwaWVjZXNbb3JpZW50YXRpb25dID0gcGFyc2VJbnQocGllY2VzW29yaWVudGF0aW9uXSwgMTApICsgMTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKHJldCk7XG5cdH0sXG5cblx0Z2V0V2hvbGVGbGVldDogZnVuY3Rpb24oKXtcblx0XHRsZXQgcmV0PXt9O1xuXHRcdGZvciAobGV0IHQgaW4gZmxlZXQubmF1dGljYWxNYXApIHtcblx0XHRcdHJldFt0XSA9IGZsZWV0LmdldEZsZWV0KHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmV0O1xuXHR9LFxuXG5cdC8vIFRPRE8gLSBzZXRGbGVldDogUmVtb3ZlIHByZXZpb3VzIHNoaXAgZnJvbSBjaGFydCAtLSBtYXkgYmUgZG9uZS4uLm5lZWRzIHRlc3Rcblx0Lypcblx0ICogc2V0RmxlZXQgLSBwbGFjZSBzaGlwIG9uIG5hdXRpY2FsIGNoYXJ0XG5cdCAqL1xuXHRzZXRGbGVldDogZnVuY3Rpb24gKG9yaWVudGF0aW9uLCB0eXBlLCBzaXplLCBzdGFydF9jb29yZCwgb2Zmc2V0KXsgXG5cdFx0bGV0IHBpZWNlcyA9IHN0YXJ0X2Nvb3JkLnNwbGl0KCdfJyk7XG5cdCAgICBsZXQgaW5kZXggPSAob3JpZW50YXRpb24gPT0gJ3gnKSA/IDAgOiAxO1xuXG5cdCAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuXHQgICAgLy8gQWRqdXN0IGZvciBkcmFnL2Ryb3Agd2hlbiBwbGF5ZXIgcGlja3MgYSBzaGlwIHBpZWNlIG90aGVyIHRoYW4gdGhlIGhlYWQuXG5cdCAgICBwaWVjZXNbaW5kZXhdID0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApIC0gb2Zmc2V0O1xuXG5cdCAgICAvKlxuXHQgICAgICogUmVtb3ZlIG9sZCBzaGlwIGZyb20gbmF1dGljYWxDaGFydC9NYXBcblx0ICAgICAqL1xuXHQgICAgZmxlZXQuY2xlYXJTaGlwKHR5cGUsIHNpemUpO1xuXG5cdCAgICAvLyBzZXQgdGhlIG5hdXRpY2FsIG1hcCB2YWx1ZSBmb3IgdGhpcyBib2F0XG5cdCAgICBmbGVldC5uYXV0aWNhbE1hcFt0eXBlXT17XG5cdFx0ICAgIG9yaWVudGF0aW9uOiBvcmllbnRhdGlvbixcblx0XHQgICAgc3RhcnRfY29vcmQ6IHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXVxuXHQgICAgfTtcblxuXHQgICAgZm9yICh2YXIgaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XG5cdFx0ZmxlZXQubmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldID0gdHlwZTtcblx0XHRwaWVjZXNbaW5kZXhdPSBwYXJzZUludChwaWVjZXNbaW5kZXhdLCAxMCkgKzE7XG5cdCAgICB9XG5cdH0sXG5cblx0Y2xlYXJTaGlwOiBmdW5jdGlvbih0eXBlLCBzaXplKXtcblx0ICAgIGxldCBtYXAgPSBmbGVldC5uYXV0aWNhbE1hcFt0eXBlXTtcblx0ICAgIGlmIChtYXAgPT09IHVuZGVmaW5lZCl7cmV0dXJuIGZhbHNlO31cblxuXHQgICAgbGV0IHBpZWNlcyA9IG1hcC5zdGFydF9jb29yZC5zcGxpdCgnXycpO1xuXHQgICAgbGV0IGluZGV4ID0gKG1hcC5vcmllbnRhdGlvbiA9PSAneCcpID8gMCA6IDE7XG5cblx0ICAgIGZvciAobGV0IGk9MDsgaSA8IHNpemU7IGkrKykge1xuXHRcdCAgICBmbGVldC5uYXV0aWNhbENoYXJ0W3BhcnNlSW50KHBpZWNlc1swXSwgMTApXVtwYXJzZUludChwaWVjZXNbMV0sIDEwKV09dW5kZWZpbmVkO1xuXHRcdCAgICBwaWVjZXNbaW5kZXhdKys7XG5cdCAgICB9XG5cblx0ICAgIGRlbGV0ZSBmbGVldC5uYXV0aWNhbE1hcFt0eXBlXTtcblx0fSxcblxuXHQvKlxuXHQgKiBnaG9zdFNoaXAgLSBCZWZvcmUgcHV0dGluZyBhIHNoaXAgb24gdGhlIGNoYXJ0IGl0J3MgcG90ZW50aWFsIGxvY2F0aW9uIG5lZWRzIHRvIGJlIHBsb3R0ZWQgc28gaXQgY2FuIGJlXG5cdCAqIGNoZWNrZWQgZm9yIHZhbGlkaXR5LiBHaXZlbiBhIHNoaXAgdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiB0aGUgcG90ZW50aWFsIHBsb3R0ZWQgY29vcmRpbmF0ZXMuIFRoZSBmdW5jdGlvblxuXHQgKiBtYXkgYnVpbGQgY29vcmRpbmF0ZXMgZm9yIGEga25vd24gc2hpcCBvciBmb3Igb25lIG1vdmVkIGFyb3VuZCBvbiB0aGUgZ3JpZC5cblx0ICovXG5cdGdob3N0U2hpcDogZnVuY3Rpb24odHlwZSwgY29vcmRpbmF0ZSwgb3JpZW50YXRpb24sIHNpemUsIG9mZnNldCl7XG5cdFx0bGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xuXHRcdGxldCB0aGlzU2hpcCA9IGZsZWV0LnJlYWRNYXAodHlwZSk7XG5cdFx0bGV0IGdob3N0ID0gW107XG5cdFx0Y29vcmRpbmF0ZSA9IGNvb3JkaW5hdGUgfHwgdGhpc1NoaXAuc3RhcnRfY29vcmQ7XG5cdFx0b3JpZW50YXRpb24gPSBvcmllbnRhdGlvbiB8fCB0aGlzU2hpcC5vcmllbnRhdGlvbjtcblx0XHRzaXplID0gc2l6ZSB8fCBzaGlwLnNpemU7XG5cdFx0b2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XG5cblx0XHRsZXQgcGllY2VzID0gY29vcmRpbmF0ZS5zcGxpdCgnXycpO1xuXHRcdGxldCBpbmRleCA9IChvcmllbnRhdGlvbiA9PSAneCcpID8gMDogMTtcblx0XHRwaWVjZXNbaW5kZXhdID0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApIC0gb2Zmc2V0O1xuXHRcdGZvciAobGV0IGk9MDsgaSA8IHNpemU7IGkrKykge1xuXHRcdFx0Z2hvc3QucHVzaChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xuXHRcdFx0cGllY2VzW2luZGV4XSA9IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSArMTtcblx0XHR9XG5cdFx0cmV0dXJuIGdob3N0O1xuXHR9LFxuXG5cdHJlYWRNYXA6IGZ1bmN0aW9uKHR5cGUpe1xuXHRcdHJldHVybiBmbGVldC5uYXV0aWNhbE1hcFt0eXBlXTtcblx0fSxcblxuXHQvKlxuXHQgKiBHaXZlbiBhIGNvb3JkaW5hdGUgb3IgYW4gYXJyYXkgb2YgY29vcmRpbmF0ZXMgcmV0dXJuIHRoZSBzYW1lIHN0cnVjdHVyZSByZXZlYWxpbmcgdGhlIGNvbnRlbnRzIG9mIHRoZSBncmlkLlxuXHQgKiBXaWxsIHJldHVybiBhIHZhbHVlIG9mIGZhbHNlIGlmIHRoZXJlIGlzIGEgcHJvYmxlbSBjaGVja2luZyB0aGUgZ3JpZCAoZXguIGNvb3JkcyBhcmUgb3V0IG9mIHJhbmdlKS5cblx0ICovXG5cdGNoZWNrR3JpZDogZnVuY3Rpb24oY29vcmRpbmF0ZXMpe1xuXHRcdGlmIChjb29yZGluYXRlcyBpbnN0YW5jZW9mIEFycmF5KXtcblx0XHRcdGxldCByZXQgPSBuZXcgQXJyYXk7XG5cdFx0XHRmb3IobGV0IGMgaW4gY29vcmRpbmF0ZXMpe1xuXHRcdFx0XHRsZXQgcyA9IGZsZWV0LnNldENoYXJ0KGNvb3JkaW5hdGVzW2NdKTtcblx0XHRcdFx0aWYgKHMgPT09IGZhbHNlKSB7cmV0dXJuIGZhbHNlfTtcblx0XHRcdFx0cmV0LnB1c2ggKHMpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJldDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZsZWV0LnNldENoYXJ0KGNvb3JkaW5hdGVzKTtcblx0XHR9XG5cdH0sXG5cblx0c2V0Q2hhcnQ6IGZ1bmN0aW9uKGNvb3JkaW5hdGUpe1xuXHRcdGxldCBwaWVjZXMgPSBjb29yZGluYXRlLnNwbGl0KCdfJyk7XG5cdFx0aWYgKHBhcnNlSW50KHBpZWNlc1swXSwgMTApID49IGZsZWV0Lm5hdXRpY2FsQ2hhcnQubGVuZ3RoIHx8XG5cdFx0ICAgIHBhcnNlSW50KHBpZWNlc1sxXSwgMTApPj0gZmxlZXQubmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV0ubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZsZWV0Lm5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXTtcblx0fSxcblxuXHQvKiBcblx0ICogR2l2ZW4gYSBsaXN0IG9mIGNvb3JkaW5hdGVzIGFuZCBhIHNoaXAgdHlwZSB2YWxpZGF0ZSB0aGF0IHRoZSBjb29yZGluYXRlcyBkbyBub3QgdmlvbGF0ZSB0aGUgcnVsZXMgb2Y6XG5cdCAqIFx0KiBzaGlwIG11c3QgYmUgb24gdGhlIGdyaWRcblx0ICogXHQqIHNoaXAgbXVzdCBub3Qgb2NjdXB5IHRoZSBzYW1lIHNxdWFyZSBhcyBhbnkgb3RoZXIgc2hpcFxuXHQgKi9cblx0dmFsaWRhdGVTaGlwOiBmdW5jdGlvbiAoY29vcmRpbmF0ZXMsIHR5cGUpe1xuXHQgICAgLy8gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyBvdGhlciBib2F0cyBhbHJlYWR5IG9uIGFueSBhIHNwYWNlXG5cdCAgICBmb3IgKHZhciBwPTA7IHAgPCBjb29yZGluYXRlcy5sZW5ndGg7IHArKykge1xuXG5cdFx0Ly8gSXMgdGhlcmUgYSBjb2xsaXNpb24/XG5cdFx0bGV0IGNvbGxpc2lvbiA9IGZsZWV0LmNoZWNrR3JpZChjb29yZGluYXRlcyk7XG5cdFx0XG5cdFx0aWYgKGNvbGxpc2lvbiA9PSBmYWxzZSkge3JldHVybiBmYWxzZX07IC8vIElmIGNoZWNrR3JpZCByZXR1cm5zIGZhbHNlIGNvb3JkaW5hdGVzIGFyZSBvdXQgb2YgcmFuZ2VcblxuXHRcdGZvciAobGV0IGMgaW4gY29vcmRpbmF0ZXMpIHtcblx0XHRcdGxldCBwaWVjZXMgPSBjb29yZGluYXRlc1tjXS5zcGxpdCgnXycpO1xuXHRcdFx0XHRpZiAoZmxlZXQubmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldICE9IHR5cGUgJiZcblx0XHRcdFx0ICAgIGZsZWV0Lm5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSAhPSB1bmRlZmluZWQpIHtyZXR1cm4gZmFsc2V9O1xuXHRcdH1cblx0ICAgIH1cblx0ICAgIHJldHVybiB0cnVlO1xuXHR9LFxufTtcblxuLyoqKiBncmlkLmpzICoqKi9cbmxldCBncmlkID0ge1xuXHRtb3ZlU2hpcDogZnVuY3Rpb24oZHJvcE9iaiwgZXYpe1xuXHQgICAgY29uc29sZS5sb2coJ3ByZS1zZXQgZmxlZXQgbW92ZScpO1xuXHQgICAgbGV0IHNoaXA9c2hpcHMuZ2V0U2hpcChkcm9wT2JqLnR5cGUpO1xuXHQgICAgLy8gUmVtb3ZlIGluaXRpYWwgaW1hZ2Vcblx0ICAgIGdyaWQuZGlzcGxheVNoaXAoZHJvcE9iai50eXBlKTtcblxuXHQgICAgZmxlZXQuc2V0RmxlZXQgKGRyb3BPYmoub3JpZW50YXRpb24sIGRyb3BPYmoudHlwZSwgc2hpcC5zaXplLCBldi50YXJnZXQuaWQsIGRyb3BPYmoub2Zmc2V0KTsgXG5cblx0ICAgIC8vIFJlZHJhdyBpbWFnZSBpbiBuZXcgbG9jYXRpb25cblx0ICAgIGdyaWQuZGlzcGxheVNoaXAoZHJvcE9iai50eXBlKTtcblx0fSxcblxuXHQvKlxuXHQgKiBDYWxsZWQgYWZ0ZXIgcGxheWVyIHNldHMgaW5pdGlhbCBmbGVldC4gT3ZlcndyaXRlIHRoZSBtb3ZlU2hpcCBmdW5jdGlvbiBzbyBpdCBiZWhhdmVzIGRpZmZlcmVudC5cblx0ICovXG5cdHNldE1vdmVTaGlwOiBmdW5jdGlvbigpe1xuXHRcdC8qIGNoYW5nZSB2YWx1ZSBvZiBtb3ZlU2hpcCBmdW5jdGlvbiAqL1xuXHRcdGdyaWQubW92ZVNoaXAgPSBmdW5jdGlvbihkcm9wT2JqLCBldiwgZHJvcFNoaXAsIG1vdmVUeXBlKXtcblx0XHQgICAgY29uc29sZS5sb2coJ0luIGdhbWUgbW92ZScpO1xuXHRcdCAgICAvLyBSZW1vdmUgaW5pdGlhbCBpbWFnZVxuXHRcdCAgICBncmlkLmRpc3BsYXlTaGlwKGRyb3BPYmoudHlwZSk7XG5cblx0XHQgICAgLy8gZHJhdyBpbWFnZSBiYXNlZCBvbiBkcm9wU2hpcFxuXHRcdCAgICBncmlkLmRpc3BsYXlTaGlwKGRyb3BPYmoudHlwZSwgZHJvcFNoaXApO1xuXG5cdFx0ICAgIC8vIFN0b3JlIGdob3N0U2hpcCBpbiBtb3ZlIG9iamVjdFxuXHRcdCAgICBwbGF5ZXIuc2V0TW92ZSh7IHR5cGU6IG1vdmVUeXBlLCBcblx0XHRcdFx0ICAgICBjb29yZGluYXRlOiBldi50YXJnZXQuaWQsIFxuXHRcdFx0XHQgICAgIGdob3N0OiBkcm9wU2hpcCxcblx0XHRcdFx0ICAgICBvcmllbnRhdGlvbjogZHJvcE9iai5vcmllbnRhdGlvbiwgXG5cdFx0XHRcdCAgICAgc2hpcFR5cGU6IGRyb3BPYmoudHlwZSxcblx0XHRcdFx0ICAgICB1bmRvOiBmbGVldC5naG9zdFNoaXAoZHJvcE9iai50eXBlKSAvLyBOZWVkIHRvIHByZXNlcnZlIHRoZSBzaGlwJ3MgcG9zaXRpb24gcHJlLW1vdmVcblx0XHQgICAgfSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qXG5cdCAqIEJ1aWxkIHRoZSBncmlkIGFuZCBhdHRhY2ggaGFuZGxlcnMgZm9yIGRyYWcvZHJvcCBldmVudHNcblx0ICovXG5cdGNsaWNrYWJsZUdyaWQ6IGZ1bmN0aW9uICggcm93cywgY29scywgcGhhbmRsZSl7XG5cdCAgICBsZXQgZ3JpZFRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcblx0ICAgIGdyaWRUYWJsZS5jbGFzc05hbWU9J2dyaWQnO1xuXHQgICAgZm9yICh2YXIgcj0wO3I8cm93czsrK3Ipe1xuXHRcdHZhciB0ciA9IGdyaWRUYWJsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpKTtcblx0XHRmb3IgKHZhciBjPTA7Yzxjb2xzOysrYyl7XG5cdFx0ICAgIHZhciBjZWxsID0gdHIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKSk7XG5cdFx0ICAgIC8vIEVhY2ggY2VsbCBvbiB0aGUgZ3JpZCBpcyBvZiBjbGFzcyAnY2VsbCdcblx0XHQgICAgY2VsbC5jbGFzc05hbWU9J2NlbGwnO1xuXG5cdFx0ICAgIC8vIFNldCB0aGUgSUQgdmFsdWUgb2YgZWFjaCBjZWxsIHRvIHRoZSByb3cvY29sdW1uIHZhbHVlIGZvcm1hdHRlZCBhcyByX2Ncblx0XHQgICAgY2VsbC5pZCA9IHIgKyAnXycgKyBjO1xuXG5cdFx0ICAgIGlmIChwaGFuZGxlID09IHVuZGVmaW5lZCl7XG5cdFx0XHRncmlkLnNldE15TGlzdGVuZXJzKGNlbGwpXG5cdFx0ICAgIH0gZWxzZSB7XG5cdFx0ICAgICAgIGdyaWQuc2V0UGxheWVyTGlzdGVuZXJzKGNlbGwsIHBoYW5kbGUpO1xuXHRcdCAgICB9XG5cdFx0fVxuXHQgICAgfVxuXHQgICAgcmV0dXJuIGdyaWRUYWJsZTtcblx0fSxcblxuXHRzZXRNeUxpc3RlbmVyczogZnVuY3Rpb24oY2VsbCl7XG5cdFx0ICAgIC8vIFNldCB1cCBkcmFnIGFuZCBkcm9wIGZvciBlYWNoIGNlbGwuXG5cdFx0ICAgIGNlbGwuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCd0cnVlJyk7XG5cblx0XHQgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLChcblx0XHRcdGZ1bmN0aW9uKGV2KXtcblx0XHRcdCAgICBldi5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZD0nbW92ZSc7XG5cdFx0XHQgICAgbGV0IHR5cGUgPSBncmlkLmdldFR5cGVCeUNsYXNzKHRoaXMuY2xhc3NOYW1lKTtcblx0XHRcdCAgICBsZXQgc2hpcCA9IHNoaXBzLmdldFNoaXAodHlwZSk7XG5cblx0XHRcdCAgICAvLyBDYWxjdWxhdGUgd2hpY2ggc3F1YXJlIHdhcyBjbGlja2VkIHRvIGd1aWRlIHBsYWNlbWVudFxuXHRcdFx0ICAgIGxldCBzdGFydCA9IGdyaWQuZmluZF9zdGFydCh0aGlzLmlkLCBzaGlwLm9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHR5cGUpO1xuXHRcdFx0ICAgIGV2LmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dC9wbGFpblwiLCBcblx0XHRcdFx0SlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0XHRcdFx0b2Zmc2V0OiAgICAgICAgc3RhcnQub2Zmc2V0LFxuXHRcdFx0XHRcdFx0c3RhcnRfY29vcmQ6ICAgKGZsZWV0LnJlYWRNYXAodHlwZSkpLnN0YXJ0X2Nvb3JkLFxuXHRcdFx0XHRcdFx0aW5kZXg6ICAgICAgICAgc2hpcC5zaXplLFxuXHRcdFx0XHRcdFx0dHlwZTogICAgICAgICAgdHlwZSxcblx0XHRcdFx0XHRcdGN1cnJlbnRfY29vcmQ6IGZsZWV0Lmdob3N0U2hpcCh0eXBlLCBzdGFydC5zdGFydF9wb3MpLFxuXHRcdFx0XHRcdFx0b3JpZW50YXRpb246ICAgKGZsZWV0LnJlYWRNYXAodHlwZSkpLm9yaWVudGF0aW9uXG5cdFx0XHRcdFx0ICAgICAgIH0pXG5cdFx0XHQgICAgKTtcblx0XHRcdH0pXG5cdFx0ICAgICk7XG5cblx0XHQgICAgLy8gQWRkIERyYWcvRHJvcCBjYXBhYmlsaXRpZXNcblx0XHQgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywoXG5cdFx0XHRmdW5jdGlvbihldil7XG5cdFx0XHQgICAgY29uc29sZS5sb2coJ2Ryb3BwaW5nJyk7XG5cdFx0XHQgICAgbGV0IGRyb3BPYmogPSBKU09OLnBhcnNlKGV2LmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9wbGFpblwiKSk7XG5cdFx0XHQgICAgY29uc29sZS5sb2coJ2N1cnJlbnQgY29vcmQ6ICcsIGRyb3BPYmouY3VycmVudF9jb29yZCk7XG5cdFx0XHQgICAgbGV0IHNoaXA9c2hpcHMuZ2V0U2hpcChkcm9wT2JqLnR5cGUpO1xuXHRcdFx0ICAgIGxldCBkcm9wU2hpcCA9IGZsZWV0Lmdob3N0U2hpcChkcm9wT2JqLnR5cGUsIGV2LnRhcmdldC5pZCwgZHJvcE9iai5vcmllbnRhdGlvbiwgc2hpcC5zaXplLCBkcm9wT2JqLm9mZnNldCk7XG5cblx0XHRcdCAgICBpZihmbGVldC52YWxpZGF0ZVNoaXAoZHJvcFNoaXAsIGRyb3BPYmoudHlwZSkpIHtcblx0XHRcdFx0ICAgIC8qIFRoZXJlIGFyZSBkaWZmZXJlbnQgYmVoYXZpb3JzIGZvciBzZXR0aW5nIHNoaXBzIGJhc2VkIG9uIHRoZSBpbml0aWFsIGxvYWRpbmcgb2YgdGhlIHNoaXBzXG5cdFx0XHRcdCAgICAgKiB2ZXJzdXMgbW92aW5nIGEgc2hpcCBpbiBnYW1lLiBXaGVuIG1vdmluZyBzaGlwcyBpbiBnYW1lIHRoZSBkaXNwbGF5IHNob3VsZCBjaGFuZ2UgdG8gcmVmbGVjdFxuXHRcdFx0XHQgICAgICogdGhlIHBvdGVudGlhbCBtb3ZlIGJ1dCB0aGUgaW50ZXJuYWwgc3RydWN0dXJlcyBzaG91bGQgbm90IGNoYW5nZSB1bnRpbCBpdCBoYXMgYmVlbiB2YWxpZGF0ZWRcblx0XHRcdFx0ICAgICAqIHdoZW4gcmVzb2x2aW5nIG1vdmVzLlxuXHRcdFx0XHQgICAgICpcblx0XHRcdFx0ICAgICAqIFdoZW4gc2V0dGluZyB1cCBzaGlwcyBmb3IgdGhlIGluaXRpYWwgZ2FtIHRoZSBzdHJ1Y3R1cmVzIHNob3VsZCBjaGFuZ2UgYWxvbmcgd2l0aCB0aGUgZGlzcGxheSxcblx0XHRcdFx0ICAgICAqIGFsbCBhdCBvbmNlLlxuXHRcdFx0XHQgICAgICpcblx0XHRcdFx0ICAgICAqIFRoZSBmdW5jdGlvbiBtb3ZlU2hpcCBpcyBhIGNsb3N1cmUgd2hvc2UgdmFsdWUgaXMgY2hhbmdlZCBvbmNlIHRoZSBwbGF5ZXIgc2V0cyB0aGUgaW5pdGlhbCBmbGVldC5cblx0XHRcdFx0ICAgICAqL1xuXHRcdFx0XHQgICAgaWYocGxheWVyLmNhbk1vdmUoKSkge2dyaWQubW92ZVNoaXAoZHJvcE9iaiwgZXYsIGRyb3BTaGlwLCAnbW92ZScpfTtcblx0XHRcdCAgICB9XG5cblx0XHRcdCAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdCAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ICAgIHJldHVybiBmYWxzZTtcblx0XHRcdCAgICB9XG5cdFx0XHQpXG5cdFx0ICAgICk7XG5cblx0XHQgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsKFxuXHRcdFx0ZnVuY3Rpb24oZXYpe1xuXHRcdFx0ICAgIGNvbnNvbGUubG9nKCdkcmFnb3ZlcicpO1xuXHRcdFx0ICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHQgICAgZXYuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3Q9J21vdmUnO1xuXHRcdFx0ICAgIHJldHVybiBmYWxzZTtcblx0XHRcdCAgICB9XG5cdFx0XHQpKTtcblxuXHRcdCAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKFxuXHRcdFx0ZnVuY3Rpb24oZSl7XG5cdFx0XHQgICAgbGV0IGRyb3AgPSB7fTtcblx0XHRcdCAgICBsZXQgdHlwZSA9IGdyaWQuZ2V0VHlwZUJ5Q2xhc3ModGhpcy5jbGFzc05hbWUpO1xuXHRcdFx0ICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcblx0XHRcdCAgICBsZXQgc3RhcnQgPSBncmlkLmZpbmRfc3RhcnQoZS50YXJnZXQuaWQsIHNoaXAub3JpZW50YXRpb24sIHNoaXAuc2l6ZSwgdHlwZSk7XG5cdFx0XHQgICAgbGV0IG9yaWVudGF0aW9uID0gKHNoaXAub3JpZW50YXRpb24gPT0gJ3gnKSA/ICd5JzoneCc7IC8vIGZsaXAgdGhlIG9yaWVudGF0aW9uXG5cdFx0XHQgICAgbGV0IGdob3N0ID0gZmxlZXQuZ2hvc3RTaGlwKHR5cGUsIGUudGFyZ2V0LmlkLCBvcmllbnRhdGlvbiwgc2hpcC5zaXplLCBzdGFydC5vZmZzZXQpO1xuXG5cdFx0XHQgICAgZHJvcC50eXBlID0gdHlwZTtcblx0XHRcdCAgICBkcm9wLm9mZnNldCA9IHN0YXJ0Lm9mZnNldDtcblx0XHRcdCAgICBkcm9wLm9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XG5cblx0XHRcdCAgICBpZihmbGVldC52YWxpZGF0ZVNoaXAoZ2hvc3QsIHR5cGUpKSB7XG5cdFx0XHRcdGlmKHBsYXllci5jYW5Nb3ZlKCkpIHtcblx0XHRcdFx0ICAgIHNoaXAub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcblx0XHRcdFx0ICAgIGdyaWQubW92ZVNoaXAoZHJvcCwgZSwgZ2hvc3QsICdwaXZvdCcpfTtcblx0XHRcdCAgICB9XG5cdFx0XHR9KSk7XG5cdH0sXG5cblx0c2V0UGxheWVyTGlzdGVuZXJzOiBmdW5jdGlvbihjZWxsLCBoYW5kbGUpe1xuXHRcdCAgICAvLyBTZXQgdGhlIElEIHZhbHVlIG9mIGVhY2ggY2VsbCB0byB0aGUgcm93L2NvbHVtbiB2YWx1ZSBmb3JtYXR0ZWQgYXMgcl9jXG5cdFx0ICAgIGNlbGwuaWQgPSBoYW5kbGUgKyAnXycgKyBjZWxsLmlkO1xuXHRcdCAgICAvLyBTZXQgdXAgZHJhZyBhbmQgZHJvcCBmb3IgZWFjaCBjZWxsLlxuXG5cdFx0ICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoXG5cdFx0XHRmdW5jdGlvbihlKXtcblx0XHRcdCAgICBpZihwbGF5ZXIuY2FuTW92ZSgpKSB7XG5cdFx0XHRcdHBsYXllci5zZXRNb3ZlKHt0eXBlOiAnYXR0YWNrJyxcblx0XHRcdFx0XHQgICAgICBjb29yZGluYXRlOiBlLnRhcmdldC5pZH0pO1xuXHRcdFx0XHRjb25zb2xlLmxvZyggZS50YXJnZXQuaWQgKyAnIGlzIHVuZGVyIGF0dGFjaycpO1xuXHRcdFx0ICAgIH1cblx0XHRcdH1cblx0XHQgICAgKSk7XG5cdH0sXG5cblx0Lypcblx0ICogZmluZF9zdGFydCAtIERldGVybWluZSB0aGUgc3RhcnRpbmcgY29vcmRpbmF0ZSBvZiBhIHNoaXAgZ2l2ZW4gdGhlIHNxdWFyZSB0aGF0IHdhcyBjbGlja2VkLiBGb3IgZXhhbXBsZVxuXHQgKiBpdCBpcyBwb3NzaWJsZSB0aGF0IGEgYmF0dGxlc2hpcCBhbG9uZyB0aGUgeC1heGlzIHdhcyBjbGlja2VkIGF0IGxvY2F0aW9uIDNfMyBidXQgdGhhdCB3YXMgdGhlIHNlY29uZCBzcXVhcmVcblx0ICogb24gdGhlIHNoaXAuIFRoaXMgZnVuY3Rpb24gd2lsbCBpZGVudGlmeSB0aGF0IHRoZSBiYXR0bGVzaGlwIHN0YXJ0cyBhdCAyXzMuXG5cdCAqL1xuXG5cdGZpbmRfc3RhcnQ6IGZ1bmN0aW9uKHN0YXJ0X3Bvcywgb3JpZW50YXRpb24sIHNpemUsIHR5cGUpe1xuXHQgICAgbGV0IGluZGV4ID0gKG9yaWVudGF0aW9uID09ICd4JykgPyAwIDogMTtcblxuXHQgICAgbGV0IHBpZWNlcz1zdGFydF9wb3Muc3BsaXQoJ18nKTtcblx0ICAgIGxldCBvZmZzZXQgPSAwO1xuXG5cdCAgICBmb3IgKGxldCBpPTA7IGkgPCBzaXplOyBpKyspIHtcblx0XHRpZiAocGllY2VzW2luZGV4XSA9PSAwKSB7YnJlYWs7fVxuXHRcdHBpZWNlc1tpbmRleF0tLTtcblx0XHRsZXQgZyA9IGZsZWV0LmNoZWNrR3JpZChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xuXHRcdGlmIChnID09IHR5cGUgJiYgZyAhPSBmYWxzZSl7XG5cdFx0ICAgIG9mZnNldCsrO1xuXHRcdCAgICBzdGFydF9wb3MgPSBwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV07XG5cdFx0fSBlbHNlIHtcblx0XHQgICAgYnJlYWs7XG5cdFx0fVxuXHQgICAgfVxuXG5cdCAgICByZXR1cm4ge3N0YXJ0X3Bvczogc3RhcnRfcG9zLCBvZmZzZXQ6IG9mZnNldH07XG5cdH0sXG5cblx0ZGlzcGxheVNoaXA6IGZ1bmN0aW9uICh0eXBlLCBjKSB7XG5cdCAgICBsZXQgY29vcmRpbmF0ZXMgPSBjIHx8IGZsZWV0LmdldEZsZWV0KHR5cGUpO1xuXHQgICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xuXG5cdCAgICBmb3IgKGxldCBjb29yZCBpbiBjb29yZGluYXRlcykge1xuXHRcdGdyaWQuc2V0U3BhY2UoY29vcmRpbmF0ZXNbY29vcmRdLCBzaGlwLmNsaWNrQ2xhc3MpO1xuXHQgICAgfVxuXHR9LFxuXG5cdHNldFNwYWNlOiBmdW5jdGlvbihzcGFjZSwgY2xhc3NOYW1lKSB7XG5cdCAgICB2YXIgYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNwYWNlKTsgXG5cdCAgICBiLmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lKTtcblx0fSxcblxuXHRnZXRUeXBlQnlDbGFzczogZnVuY3Rpb24oY2xhc3NOYW1lKXtcblx0XHRsZXQgc2hpcExpc3QgPSBzaGlwcy5nZXRTaGlwKCk7XG5cdFx0Zm9yIChsZXQgcyBpbiBzaGlwTGlzdCl7XG5cdFx0XHRpZiAoY2xhc3NOYW1lLm1hdGNoKHNoaXBMaXN0W3NdLmNsaWNrQ2xhc3MpKXtcblx0XHRcdFx0cmV0dXJuIHM7XG5cdFx0XHRcdC8vcmV0dXJuIHNoaXBMaXN0W3NdLnR5cGU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG4vKioqIHNoaXBzLmpzICoqKi9cbmxldCBzaGlwcyA9IHtcblx0Ly8gQ29uZmlnIHNldHRpbmdzIFxuXHRzaGlwX2NvbmZpZzoge1xuXHQgICAgYWlyY3JhZnRDYXJyaWVyIDoge1xuXHRcdHNpemUgOiA1LFxuXHRcdGlkIDogJ2FpcmNyYWZ0Q2FycmllcicsXG5cdFx0Y29sb3IgOiAnQ3JpbXNvbicsXG5cdFx0Y2xpY2tDbGFzcyA6ICdhY2NsaWNrZWQnLFxuXHRcdGxhYmVsIDogJ0FpcmNyYWZ0IENhcnJpZXInLFxuXHRcdG1hc2sgOiAzMSxcblx0ICAgIH0sXG5cdCAgICBiYXR0bGVzaGlwIDoge1xuXHRcdHNpemUgOiA0LFxuXHRcdGlkIDogJ2JhdHRsZXNoaXAnLFxuXHRcdGNvbG9yOidEYXJrR3JlZW4nLFxuXHRcdGNsaWNrQ2xhc3MgOiAnYnNjbGlja2VkJyxcblx0XHRsYWJlbCA6ICdCYXR0bGVzaGlwJyxcblx0XHRtYXNrOiAxNSxcblx0ICAgIH0sXG5cdCAgICBkZXN0cm95ZXIgOiB7XG5cdFx0c2l6ZSA6IDMsXG5cdFx0aWQgOiAnZGVzdHJveWVyJyxcblx0XHRjb2xvcjonQ2FkZXRCbHVlJyxcblx0XHRjbGlja0NsYXNzIDogJ2RlY2xpY2tlZCcsXG5cdFx0bGFiZWwgOiAnRGVzdHJveWVyJyxcblx0XHRtYXNrOiA3LFxuXHQgICAgfSxcblx0ICAgIHN1Ym1hcmluZSAgOiB7XG5cdFx0c2l6ZSA6IDMsXG5cdFx0aWQgOiAnc3VibWFyaW5lJyxcblx0XHRjb2xvcjonRGFya1JlZCcsXG5cdFx0Y2xpY2tDbGFzcyA6ICdzdWNsaWNrZWQnLFxuXHRcdGxhYmVsIDogJ1N1Ym1hcmluZScsXG5cdFx0bWFzayA6IDcsXG5cdCAgICB9LFxuXHQgICAgcGF0cm9sQm9hdCA6IHtcblx0XHRzaXplIDogMixcblx0XHRpZCA6ICdwYXRyb2xCb2F0Jyxcblx0XHRjb2xvcjonR29sZCcsXG5cdFx0Y2xpY2tDbGFzcyA6ICdwYmNsaWNrZWQnLFxuXHRcdGxhYmVsIDogJ1BhdHJvbCBCb2F0Jyxcblx0XHRtYXNrOiAzLFxuXHQgICAgfSxcblx0fSxcblxuXHRoaXRDb3VudGVyOiB7XG5cdCAgICBhaXJjcmFmdENhcnJpZXIgOiAwLFxuXHQgICAgYmF0dGxlc2hpcCA6IDAsXG5cdCAgICBkZXN0cm95ZXIgOiAwLFxuXHQgICAgc3VibWFyaW5lICA6IDAsXG5cdCAgICBwYXRyb2xCb2F0IDogMFxuXHR9LFxuXG5cdHN1bmtDb3VudGVyOiB7fSwgLy8gVHJhY2tzIHdoaWNoIGJvYXRzIGhhdmUgYmVlbiBzdW5rXG5cblx0Ly8gVmFsdWVzIGZvciBkZXRlcm1pbmluZyBiaXQgdmFsdWVzIHdoZW4gYSBib2F0IHNpbmtzXG5cdGFpckNyYWZ0Q2FycmllcjogMSxcblx0YmF0dGxlc2hpcDogMixcblx0ZGVzdHJveWVyOiA0LFxuXHRzdWJtYXJpbmU6IDgsXG5cdHBhdHJvbEJvYXQ6IDE2LFxuXG5cdHNldEhpdENvdW50ZXI6IGZ1bmN0aW9uICh0eXBlLCBiaXQpIHtcblx0XHRzaGlwcy5oaXRDb3VudGVyW3R5cGVdID0gc2hpcHMuc2hpcF9jb25maWdbdHlwZV0ubWFza14oYml0KmJpdCk7XG5cdFx0aWYgKHNoaXBzLmhpdENvdW50ZXJbdHlwZV0gPT0gc2hpcHMuc2hpcF9jb25maWdbdHlwZV0ubWFzaykgeyAvLyBJIGRvbid0IGtub3cgaWYgdGhpcyBpcyBjb3JyZWN0IGJ1dCB0aGUgaWRlYSBpcyBjaGVjayB0byBzZWUgaWYgdGhlIHNoaXAgaXMgc3VuayBhbmQgZmxhZyBpdCBpZiBuZWVkIGJlXG5cdFx0XHRzaGlwcy5zZXRTdW5rQ291bnRlcih0eXBlKTtcblx0XHR9XG5cdH0sXG5cblx0c2V0U3Vua0NvdW50ZXI6IGZ1bmN0aW9uICh0eXBlKSB7XG5cdFx0c2hpcHMuc3Vua0NvdW50ZXIgPSBzaGlwcy5zdW5rQ291bnRlcl50eXBlO1xuXHR9LFxuXG5cdGdldEhpdENvdW50ZXI6IGZ1bmN0aW9uICh0eXBlKXtcblx0XHRyZXR1cm4gc2hpcHMuaGl0Q291bnRlclt0eXBlXTtcblx0fSxcblxuXHRnZXRTdW5rQ291bnRlcjogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gc2hpcHMuc3Vua0NvdW50ZXI7XG5cdH0sXG5cblx0Ly8gU2hpcCBjb25zdHJ1Y3RvciAtIHNoaXB5YXJkPz8/XG5cdHNoaXA6IGZ1bmN0aW9uKHNpemUsIGlkLCBjb2xvciwgY2xpY2tDbGFzcywgbGFiZWwpIHtcblx0XHR0aGlzLnNpemUgICAgICAgID0gc2l6ZTtcblx0XHR0aGlzLmlkICAgICAgICAgID0gaWQ7XG5cdFx0dGhpcy5jb2xvciAgICAgICA9IGNvbG9yO1xuXHRcdHRoaXMuY2xpY2tDbGFzcyAgPSBjbGlja0NsYXNzO1xuXHRcdHRoaXMubGFiZWwgICAgICAgPSBsYWJlbDtcblxuXHRcdHJldHVybiAodGhpcyk7XG5cdH0sXG5cblx0Lypcblx0ICogVGhlIHNoaXAgb2JqZWN0IGhvbGRzIHRoZSBjdXJyZW50IG9yaWVudGF0aW9uIG9mIHRoZSBzaGlwIGFuZCB0aGUgc3RhcnQgY29vcmRpbmF0ZSAodG9wbW9zdC9sZWZ0bW9zdCkuIFdoZW5cblx0ICogdGhlcmUgaXMgYSBjaGFuZ2UgdG8gdGhlIHNoaXAgdGhlIG1hc3RlciBtYXRyaXggbmVlZHMgdG8gYmUgdXBkYXRlZC4gQW4gZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB0aGVyZSBpc1xuXHQgKiBhIGNvb3JkaW5hdGUgY2hhbmdlLiBUaGlzIGxpc3RlbmVyIHdpbGwgdXBkYXRlIHRoZSBtYXN0ZXIgbWF0cml4LiBDYWxscyB0byBjaGVjayBsb2NhdGlvbiAobW92ZSB2YWxpZHRpb24sIFxuXHQgKiBjaGVjayBpZiBoaXQsIGV0Yy4pIHdpbGwgYmUgbWFkZSBhZ2FpbnN0IHRoZSBtYXN0ZXIgbWF0cml4LlxuXHQgKi9cblx0Ly8gUHVibGljIGZ1bmN0aW9uIHRvIGluaXRpYWxseSBjcmVhdGUgc2hpcHMgb2JqZWN0XG5cdGJ1aWxkU2hpcHM6IGZ1bmN0aW9uICgpe1xuXHQgICAgZm9yIChsZXQgcyBpbiBzaGlwcy5zaGlwX2NvbmZpZyl7XG5cdFx0c2hpcHNbc10gPSB7c2l6ZTogc2hpcHMuc2hpcF9jb25maWdbc10uc2l6ZSwgXG5cdFx0XHQgICAgdHlwZTogc2hpcHMuc2hpcF9jb25maWdbc10uaWQsXG5cdFx0XHQgICAgY29sb3I6IHNoaXBzLnNoaXBfY29uZmlnW3NdLmNvbG9yLFxuXHRcdFx0ICAgIGNsaWNrQ2xhc3M6IHNoaXBzLnNoaXBfY29uZmlnW3NdLmNsaWNrQ2xhc3MsXG5cdFx0XHQgICAgbGFiZWw6IHNoaXBzLnNoaXBfY29uZmlnW3NdLmxhYmVsXG5cdFx0XHQgICB9O1xuXHQgICAgfVxuXHRyZXR1cm4gc2hpcHM7XG5cdH0sXG5cblx0YnVpbGRTaGlwOiBmdW5jdGlvbih0eXBlKXtcblx0XHRzaGlwc1t0eXBlXSA9IHNoaXBzLnNoaXAoc2hpcHMuc2hpcF9jb25maWdbdHlwZV0uc2l6ZSwgc2hpcHMuc2hpcF9jb25maWdbdHlwZV0uaWQsIHNoaXBzLnNoaXBfY29uZmlnW3R5cGVdLmNvbG9yLCBzaGlwcy5zaGlwX2NvbmZpZ1t0eXBlXS5jbGlja0NsYXNzLCBzaGlwcy5zaGlwX2NvbmZpZ1t0eXBlXS5sYWJlbCk7XG5cdFx0cmV0dXJuIHNoaXBzO1xuXHR9LFxuXG5cdC8vIFNldCB2YWx1ZSBpbiBzaGlwIG9iamVjdC4gXG5cdHNldFNoaXA6IGZ1bmN0aW9uKHR5cGUsIGtleSwgdmFsdWUpe1xuXHRcdGlmICh0eXBlICYmIHNoaXBzW3R5cGVdICYmIGtleSkgeyAvLyBvbmx5IGF0dGVtcHQgYW4gdXBkYXRlIGlmIHRoZXJlIGlzIGEgbGVnaXQgc2hpcCB0eXBlIGFuZCBhIGtleVxuXHRcdCAgICBzaGlwc1t0eXBlXS5rZXkgPSB2YWx1ZTtcblx0ICAgfVxuXHR9LFxuXG5cdC8vIFJldHVybiBzaGlwIG9iamVjdCBpZiBubyB0eXBlIGdpdmVuIG90aGVyd2lzZSByZXR1cm4gb2JqZWN0IGNvbnRhaW5pbmcganVzdCByZXF1ZXN0ZWQgc2hpcFxuXHRnZXRTaGlwOiBmdW5jdGlvbiAodHlwZSl7XG5cdCAgICBpZih0eXBlKXtcblx0XHRyZXR1cm4gc2hpcHNbdHlwZV07XG5cdCAgICB9IGVsc2Uge1xuXHRcdHJldHVybiBzaGlwcy5zaGlwX2NvbmZpZztcblx0ICAgIH1cblx0fSxcblxuXHQvLyBQcml2YXRlIGZ1bmN0aW9uIHRvIHJhbmRvbWx5IGRldGVybWluZSBzaGlwJ3Mgb3JpZW50YXRpb24gYWxvbmcgdGhlIFgtYXhpcyBvciBZLWF4aXMuIE9ubHkgdXNlZCB3aGVuIHBsb3R0aW5nIHNoaXBzIGZvciB0aGUgZmlyc3QgdGltZS5cblx0Z2V0U3RhcnRDb29yZGluYXRlOiBmdW5jdGlvbihzaXplKXtcblx0ICAgIGNvbnN0IHN0YXJ0X29yaWVudGF0aW9uPU1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxMCkgPiA1ID8gJ3gnIDogJ3knO1xuXHQgICAgY29uc3Qgc3RhcnRfeCA9IHN0YXJ0X29yaWVudGF0aW9uID09ICd4JyA/IHNoaXBzLmdldFJhbmRvbUNvb3JkaW5hdGUoc2l6ZSkgOiBzaGlwcy5nZXRSYW5kb21Db29yZGluYXRlKDApO1xuXHQgICAgY29uc3Qgc3RhcnRfeSA9IHN0YXJ0X29yaWVudGF0aW9uID09ICd5JyA/IHNoaXBzLmdldFJhbmRvbUNvb3JkaW5hdGUoc2l6ZSkgOiBzaGlwcy5nZXRSYW5kb21Db29yZGluYXRlKDApO1xuXG5cdCAgICByZXR1cm4ge2Nvb3JkaW5hdGU6IHN0YXJ0X3ggKyAnXycgKyBzdGFydF95LCBvcmllbnRhdGlvbjogc3RhcnRfb3JpZW50YXRpb259O1xuXHR9LFxuXG5cdC8vIFRha2Ugc2hpcCBzaXplIGFuZCBvcmllbnRhdGlvbiBpbnRvIGFjY291bnQgd2hlbiBkZXRlcm1pbmluZyB0aGUgc3RhcnQgcmFuZ2UgdmFsdWUuIGV4LiBkb24ndFxuXHQvLyBsZXQgYW4gYWlyY3JhZnQgY2FycmllciB3aXRoIGFuIG9yaWVudGF0aW9uIG9mICdYJyBzdGFydCBhdCByb3cgNyBiZWNhdXNlIGl0IHdpbGwgbWF4IG91dCBvdmVyIHRoZVxuXHQvLyBncmlkIHNpemUuXG5cdGdldFJhbmRvbUNvb3JkaW5hdGU6IGZ1bmN0aW9uKG9mZnNldCl7XG5cdCAgICBjb25zdCBNQVhfQ09PUkQgPSAxMDtcblx0ICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqKE1BWF9DT09SRCAtIG9mZnNldCkpO1xuXHR9LFxuXG5cdC8vIEZJWE1FIERvZXMgZmxlZXQuZ2hvc3RTaGlwIGRvIHRoaXMgbm93P1xuXHQvLyBCdWlsZCBhbiBhcnJheSBvZiBjb29yZGluYXRlcyBmb3IgYSBzaGlwIGJhc2VkIG9uIGl0J3Mgb3JpZW50YXRpb24sIGludGVuZGVkIHN0YXJ0IHBvaW50IGFuZCBzaXplXG5cdC8qXG5cdF9zaGlwU3RyaW5nOiBmdW5jdGlvbihzKSB7XG5cdFx0Y29uc3QgbyA9IHMub3JpZW50YXRpb247XG5cdFx0Y29uc3Qgc3QgPSBzLnN0YXJ0X2Nvb3JkaW5hdGU7XG5cdFx0bGV0IHIgPSBuZXcgQXJyYXk7XG5cdFx0bGV0IHRfcGllY2VzID0gc3Quc3BsaXQoJ18nKTtcblx0XHRjb25zdCBpID0gbyA9PSAneCcgPyAwIDogMTtcblxuXHRcdGZvciAobGV0IGo9MDsgaiA8IHMuc2l6ZTtqKyspIHtcblx0XHRcdHRfcGllY2VzW2ldID0gdF9waWVjZXNbaV0rMTtcblx0XHRcdHIucHVzaCAodF9waWVjZXNbMF0gKyAnXycgKyB0X3BpZWNlc1sxXSk7XG5cdFx0fVxuXHRcdHJldHVybiByO1xuXHR9LFxuXHQqL1xuXG5cdC8qXG5cdCAqIHBsYWNlU2hpcHMgLSBJbml0aWFsIHBsYWNlbWVudCBvZiBzaGlwcyBvbiB0aGUgYm9hcmRcblx0ICovXG5cdHBsYWNlU2hpcHM6IGZ1bmN0aW9uICgpe1xuXHRcdC8qIFJhbmRvbWx5IHBsYWNlIHNoaXBzIG9uIHRoZSBncmlkLiBJbiBvcmRlciBkbyB0aGlzIGVhY2ggc2hpcCBtdXN0OlxuXHRcdCAqICAgKiBQaWNrIGFuIG9yaWVudGF0aW9uXG5cdFx0ICogICAqIFBpY2sgYSBzdGFydGluZyBjb29yZGluYXRlXG5cdFx0ICogICAqIFZhbGlkYXRlIHRoYXQgdGhlIGNvb3JkaW5hdGUgaXMgdmFsaWQgKGRvZXMgbm90IHJ1biBPT0IsIGRvZXMgbm90IGNyb3NzIGFueSBvdGhlciBzaGlwLCBldGMuKVxuXHRcdCAqICAgKiBJZiB2YWxpZDpcblx0XHQgKiAgIFx0KiBTYXZlIHN0YXJ0IGNvb3JkIGFuZCBvcmllbnRhdGlvbiBhcyBwYXJ0IG9mIHNoaXAgb2JqZWN0XG5cdFx0ICogICBcdCogUGxvdCBzaGlwIG9uIG1hc3RlciBtYXRyaXhcblx0XHQgKi9cblx0XHRsZXQgc2hpcExpc3QgPSBzaGlwcy5nZXRTaGlwKCk7XG5cdFx0Zm9yICh2YXIgc2hpcCBpbiBzaGlwTGlzdCkge1xuXHRcdCAgICBcblx0XHQgICAgbGV0IHN0YXJ0ID0gc2hpcHMuZ2V0U3RhcnRDb29yZGluYXRlKHNoaXBMaXN0W3NoaXBdLnNpemUpOyBcblx0XHQgICAgbGV0IHNoaXBfc3RyaW5nID0gZmxlZXQuZ2hvc3RTaGlwKHNoaXAsIHN0YXJ0LmNvb3JkaW5hdGUsIHN0YXJ0Lm9yaWVudGF0aW9uKTtcblx0XHQgICAgc2hpcExpc3Rbc2hpcF0ub3JpZW50YXRpb24gPSBzdGFydC5vcmllbnRhdGlvbjtcblxuXHRcdCAgICB3aGlsZSAoIWZsZWV0LnZhbGlkYXRlU2hpcChzaGlwX3N0cmluZykpIHtcblx0XHRcdHN0YXJ0ID0gc2hpcHMuZ2V0U3RhcnRDb29yZGluYXRlKHNoaXBMaXN0W3NoaXBdLnNpemUpOyBcblx0XHRcdHNoaXBMaXN0W3NoaXBdLm9yaWVudGF0aW9uID0gc3RhcnQub3JpZW50YXRpb247XG5cdFx0XHRzaGlwX3N0cmluZyA9IGZsZWV0Lmdob3N0U2hpcChzaGlwLCBzdGFydC5jb29yZGluYXRlLCBzdGFydC5vcmllbnRhdGlvbik7XG5cdFx0XHR9XG5cblx0XHQgICAgZmxlZXQuc2V0RmxlZXQoc3RhcnQub3JpZW50YXRpb24sXG5cdFx0XHQgICAgICAgc2hpcCxcblx0XHRcdCAgICAgICBzaGlwTGlzdFtzaGlwXS5zaXplLFxuXHRcdFx0ICAgICAgIHN0YXJ0LmNvb3JkaW5hdGUpO1xuXHRcdCAgICB9XG5cdH1cbn1cblxuLyoqKiBwbGF5ZXIuanMgKioqL1xubGV0IHBsYXllciA9IHtcblx0cGxheWVyUm9zdGVyOiBuZXcgT2JqZWN0LCAvLyBQbGFjZWhvbGRlciBmb3IgYWxsIHBsYXllcnMgaW4gdGhlIGdhbWVcblx0cGxheWVyT3JkZXI6IFtdLCAvLyBPcmRlciBvZiBwbGF5ZXIgdHVyblxuXHRtZTogdW5kZWZpbmVkLFxuXHRvcmRlckluZGV4OiAwLFxuXHRmbG93OiBbJ3JlZ2lzdGVyJywnZ2FtZSddLFxuXHRjdXJyZW50RmxvdzogdW5kZWZpbmVkLFxuXG5cdGNhbk1vdmU6IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChwbGF5ZXIucGxheWVyT3JkZXIubGVuZ3RoID4gbW92ZS5nZXRNb3ZlU2l6ZSgpKSByZXR1cm4gdHJ1ZTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cblx0Ly8gUmVnaXN0ZXIgaGFuZGxlXG5cdHJlZ2lzdGVyOiBmdW5jdGlvbihoYW5kbGUpe1xuXHRcdHBsYXllci5tZSA9IGhhbmRsZTsgLy8gU2VsZiBpZGVudGlmeSB0aGluZXNlbGZcblx0XHQvLyBUT0RPIC0gY2FsbCBvdXQgdG8gdGhlIHJlZ2lzdHJhdGlvbiBzZXJ2aWNlIGFuZCBnZXQgYmFjayBoYW5kbGUgYW5kIHR1cm4gb3JkZXIuIFRoaXNcblx0XHQvLyBzdHJ1Y3R1cmUgcmVwcmVzZW50cyB0aGUgcmV0dXJuIGNhbGwgZnJvbSB0aGUgcmVnaXN0cmF0aW9uIHNlcnZpY2UuXG5cdFx0Y29uc3QgcmVnID0ge1xuXHRcdFx0ICAgICAgaGFuZGxlOiAnZWxzcG9ya28nLFxuXHRcdFx0ICAgICAgb3JkZXI6IDBcblx0XHR9O1xuXG5cdFx0cGxheWVyLnBsYXllck9yZGVyW3JlZy5vcmRlcl0gPSByZWcuaGFuZGxlO1xuXHRcdHBsYXllci5nYW1lRmxvdygpO1xuXHRcdHJldHVybjtcblx0fSxcblxuXHQvL0FjY2VwdCByZWdpc3RyYXRpb24gZnJvbSBvdGhlciBwbGF5ZXJzXG5cdGFjY2VwdFJlZzogZnVuY3Rpb24oaGFuZGxlLCBvcmRlcil7XG5cdFx0cGxheWVyLnBsYXllck9yZGVyW29yZGVyXSA9IGhhbmRsZTtcblx0XHRwbGF5ZXIucGxheWVyUm9zdGVyID0ge1xuXHRcdFx0W2hhbmRsZV06IHtwZ3JpZDogZmxlZXQuYnVpbGROYXV0aWNhbENoYXJ0fVxuXHRcdH1cblx0XHRsZXQgcGcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWVyR3JpZCcpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTs7XG5cdFx0XG5cdFx0cGcuaWQ9aGFuZGxlO1xuXHRcdHBnLmlubmVySFRNTD1oYW5kbGU7XG5cblx0XHRwZy5hcHBlbmRDaGlsZChncmlkLmNsaWNrYWJsZUdyaWQoMTAsIDEwLCBoYW5kbGUpKTtcblx0fSxcblxuXHRteVR1cm46IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAocGxheWVyLmN1cnJlbnRQbGF5ZXIoKSA9PSBwbGF5ZXIubWUpID8gMSA6IDA7XG5cdH0sXG5cblx0bmV4dFBsYXllcjogZnVuY3Rpb24oKSB7XG5cdFx0cGxheWVyLm9yZGVySW5kZXggPSAocGxheWVyLm9yZGVySW5kZXggPT0gcGxheWVyLnBsYXllck9yZGVyLmxlbmd0aCAtIDEpID8gIDAgOiBwbGF5ZXIub3JkZXJJbmRleCsxO1xuXHRcdHJldHVybjtcblx0fSxcblxuXHRjdXJyZW50UGxheWVyOiBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBwbGF5ZXIucGxheWVyT3JkZXJbcGxheWVyLm9yZGVySW5kZXhdO1xuXHR9LFxuXG5cdGdhbWVGbG93OiBmdW5jdGlvbigpe1xuXHRcdGlmIChwbGF5ZXIuY3VycmVudEZsb3cgIT0gdW5kZWZpbmVkKXtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBsYXllci5mbG93W3BsYXllci5jdXJyZW50Rmxvd10pLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuXHRcdFx0cGxheWVyLmN1cnJlbnRGbG93Kys7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBsYXllci5jdXJyZW50RmxvdyA9IDA7XG5cdFx0fVxuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBsYXllci5mbG93W3BsYXllci5jdXJyZW50Rmxvd10pLnN0eWxlLmRpc3BsYXk9J2lubGluZSc7XG5cdH0sXG5cblx0c2V0TW92ZTogZnVuY3Rpb24obSl7XG5cdFx0cmV0dXJuIG1vdmUuc2V0TW92ZShtKTtcblx0fSxcbn1cblxuLyoqKiBtb3ZlLmpzICoqKi9cbmxldCBtb3ZlID0ge1xuXHRtb3ZlTGlzdDogW10sXG5cdG1vdmVNYXA6IHt9LFxuXG5cdGRlbGV0ZU1vdmU6IGZ1bmN0aW9uKCl7XG5cdH0sXG5cblx0Y2xlYXJNb3ZlTGlzdDogZnVuY3Rpb24oKSB7XG5cdFx0bW92ZS5tb3ZlTGlzdCA9IFtdO1xuXHR9LFxuXG5cdC8qXG5cdCAqIENyZWF0ZSBhIGJsb2NrIHRvIHZpc3VhbGx5IHJlcHJlc2VudCBhIG1vdmUuIEdlbmVyaWMgSFRNTCBibG9jayBmb3IgbW92ZSBvYmplY3RzOlxuXHQgKiA8ZGl2IGlkPTx0eXBlPl88cGxheWVyPl88Y29vcmRzPiBjbGFzcz1cIm1vdmVcIj5cblx0ICogICA8ZGl2IGNsYXNzPVwibW92ZURldGFpbFwiPlxuXHQgKiAgICAgYXR0YWNrOiBtZWdhbl8wXzAgKCogTW92ZSB0ZXh0ICopYFxuXHQgKiAgICAgPGRpdiBjbGFzcz1cImRlbGV0ZVwiPmRlbGV0ZTwvZGl2PiA8IS0tIGVsZW1lbnQgdG8gZGVsZXRlIG1vdmUgYmVmb3JlIHN1Ym1pdHRlZCAtLT5cblx0ICogICA8L2Rpdj5cblx0ICogPC9kaXY+XG5cdCAqIFxuXHQgKi9cblx0bW92ZUxpc3RCbG9jazogZnVuY3Rpb24obSkge1xuXHRcdGxldCBtb3ZlU3RydWN0PXt9O1xuXHRcdGxldCBtdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdG1vdmVTdHJ1Y3QuaWQgPSBtdi5pZCA9IG0udHlwZSArICdfJyArIG0uY29vcmRpbmF0ZTtcblx0XHRtdi5jbGFzc05hbWUgPSAnbW92ZSc7XG5cblx0XHRtdi5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsJ3RydWUnKTtcblx0XHRtb3ZlLm1vdmVPcmRlckhhbmRsZXIobXYpO1xuXG5cdFx0bGV0IG1vdmVTdHJpbmcgPSBtLnR5cGUgKyAnOiAnICsgbS5jb29yZGluYXRlO1xuXHRcdGxldCBtZHRsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0bWR0bC5pbm5lckhUTUw9bW92ZVN0cmluZztcblxuXHRcdGxldCBtZGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0bWRlbC5pbm5lckhUTUw9J0RlbGV0ZSc7XG5cdFx0bWRlbC5pZCA9ICdkZWxfJyArIG12LmlkO1xuXHRcdG1vdmUuc2V0X212TGlzdGVuZXJzKG12KTtcblxuXHRcdG12LmFwcGVuZENoaWxkKG1kdGwpO1xuXHRcdG12LmFwcGVuZENoaWxkKG1kZWwpO1xuXHRcdFxuXHRcdG1vdmVTdHJ1Y3QuZG9tID0gbXY7XG5cdFx0bW92ZVN0cnVjdC50eXBlID0gbS50eXBlO1xuXHRcdC8vIHN0b3JlIGN1cnJlbnQgc2hpcCBjb29yZGluYXRlIHN0cmluZyBzbyB0aGF0IHdoZW4gYSBtb3ZlIGlzIGRlbGV0ZWQgaXQgd2lsbCBiZSByZXN0b3JlZCB0byBpdCdzIHByaW9yIGxvY2F0aW9uXG5cdFx0bW92ZVN0cnVjdC5naG9zdCA9IG0uZ2hvc3Q7XG5cdFx0bW92ZVN0cnVjdC5vcmllbnRhdGlvbiA9IG0ub3JpZW50YXRpb247XG5cdFx0bW92ZVN0cnVjdC5zaGlwVHlwZSA9IG0uc2hpcFR5cGU7XG5cdFx0bW92ZVN0cnVjdC5zaXplID0gbS5zaGlwU2l6ZTtcblx0XHRtb3ZlU3RydWN0LnVuZG8gPSBtLnVuZG8gfHwgdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIG1vdmVTdHJ1Y3Q7XG5cdH0sXG5cblx0Ly8gQWRkIGRlbGV0ZSBtb3ZlIGZ1bmN0aW9uXG5cdHNldF9tdkxpc3RlbmVyczogZnVuY3Rpb24obXYpe1xuXHRcdG12LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IG0gPSBtb3ZlLmdldE1vdmUobXYpO1xuXHRcdFx0Ly8gQ2hlY2sgdG8gc2VlIGlmIGFub3RoZXIgc2hpcCBpcyBpbiB0aGUgcGF0aCBvZiB0aGUgYXR0ZW1wdGVkIHJlc3RvcmVcblx0XHRcdGlmIChtdi5pZC5tYXRjaCgvXmF0dGFjay8pICl7XG5cdFx0XHRcdG1vdmUuZGVsZXRlX21vdmUobXYpO1xuXHRcdFx0fSBlbHNlIGlmIChmbGVldC52YWxpZGF0ZVNoaXAobS51bmRvLCBtLnNoaXBUeXBlICkpIHtcblx0XHRcdFx0bW92ZS5kZWxldGVfbW92ZShtdik7XG5cdFx0XHRcdC8vIFJlcGFpbnQgdGhlIG9yaWdpbmFsIHNoaXBcblx0XHRcdFx0Z3JpZC5kaXNwbGF5U2hpcChtLnNoaXBUeXBlKTtcblx0XHRcdFx0ZmxlZXQuc2V0RmxlZXQgKG0ub3JpZW50YXRpb24sIG0uc2hpcFR5cGUsIHNoaXBzLmdldFNoaXAobS5zaGlwVHlwZSkuc2l6ZSwgbS5naG9zdFswXSwgMCk7IFxuXHRcdFx0XHRncmlkLmRpc3BsYXlTaGlwKG0uc2hpcFR5cGUpO1xuXHRcdFx0fVxuXHRcdH0pKTtcblx0fSxcblxuXHRkZWxldGVfbW92ZTogZnVuY3Rpb24obXYpe1xuXHRcdC8vIFJlbW92ZSB0aGUgZGl2XG5cdFx0Ly8gTmVlZCB0byBrbm93IHBhcmVudCBlbGVtZW50IHdoaWNoLCBmb3IgZXZlcnl0aGluZyBpbiB0aGUgbW92ZSBsaXN0LCBpcyB0aGUgZWxlbWVudCB3aG9zZSBpZCBpcyBwbGF5T3JkZXJcblx0XHRsZXQgcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKTtcblx0XHRsZXQgZG12ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobXYuaWQpO1xuXHRcdHAucmVtb3ZlQ2hpbGQoZG12KTtcblxuXHRcdC8vIERlbGV0ZSB0aGUgZW50cnkgZnJvbSB0aGUgYXJyYXlcblx0XHRtb3ZlLm1vdmVMaXN0LnNwbGljZShtb3ZlLmdldE1vdmUobXYpLDEpO1xuXHR9LFxuXG5cdGdldE1vdmU6IGZ1bmN0aW9uIChtdil7XG5cdFx0Zm9yIChsZXQgbCBpbiBtb3ZlLm1vdmVMaXN0KSB7XG5cdFx0XHRpZihtb3ZlLm1vdmVMaXN0W2xdLmlkID09IG12LmlkKXtcblx0XHRcdFx0cmV0dXJuIG1vdmUubW92ZUxpc3RbbF1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8vIFNldCB1cCBkcmFnIGRyb3AgZnVuY3Rpb25hbGl0eSBmb3Igc2V0dGluZyBtb3ZlIG9yZGVyXG5cdG1vdmVPcmRlckhhbmRsZXI6IGZ1bmN0aW9uKHBvKSB7XG5cdCAgICBwby5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLChmdW5jdGlvbihlKXtcblx0XHQgICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZD0nbW92ZSc7XG5cdFx0ICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsXG5cdFx0XHRKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRcdGNoYW5nZU1vdmU6IGUudGFyZ2V0LmlkXG5cdFx0XHR9KVxuXHRcdCAgICApO1xuXHQgICAgfSkpO1xuXHQgICAgcG8uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLChmdW5jdGlvbihlKXtcblx0XHRcdCAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHQgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdD0nbW92ZSc7XG5cdFx0XHQgICAgcmV0dXJuIGZhbHNlO1xuXHQgICAgfSkpO1xuXHQgICAgcG8uYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsKGZ1bmN0aW9uKGUpe1xuXHRcdFx0ICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHQgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ICAgIGxldCBkcm9wT2JqID0gSlNPTi5wYXJzZShlLmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9wbGFpblwiKSk7XG5cdFx0XHQgICAgbW92ZS5hbHRlck1vdmVJbmRleChkcm9wT2JqLmNoYW5nZU1vdmUsIGUudGFyZ2V0LmlkKTtcblx0XHRcdCAgICByZXR1cm4gZmFsc2U7XG5cdCAgICB9KSk7XG5cdH0sXG5cblx0YWx0ZXJNb3ZlSW5kZXg6IGZ1bmN0aW9uKHN0YXJ0SW5kZXgsIGVuZEluZGV4KXtcblx0XHRsZXQgc3RhcnRJZCA9IHN0YXJ0SW5kZXg7XG5cdFx0c3RhcnRJbmRleCA9IHBhcnNlSW50KG1vdmUubW92ZU1hcFtzdGFydEluZGV4XSk7XG5cdFx0ZW5kSW5kZXggICA9IHBhcnNlSW50KG1vdmUubW92ZU1hcFtlbmRJbmRleF0pO1xuXG5cdFx0bGV0IGJlZ2luID0gc3RhcnRJbmRleCA8IGVuZEluZGV4ID8gcGFyc2VJbnQoc3RhcnRJbmRleCwgMTApIDogcGFyc2VJbnQoZW5kSW5kZXgsIDEwKTtcblx0XHRsZXQgZW5kID0gICBzdGFydEluZGV4IDwgZW5kSW5kZXggPyBwYXJzZUludChlbmRJbmRleCwgMTApIDogcGFyc2VJbnQoc3RhcnRJbmRleCwgMTApO1xuXHRcdGxldCBob2xkID0gbW92ZS5tb3ZlTGlzdFtzdGFydEluZGV4XTtcblxuXHRcdHdoaWxlKGJlZ2luIDwgZW5kKXtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vdmUubW92ZUxpc3RbYmVnaW5dLmlkKS5hcHBlbmRDaGlsZCgobW92ZS5tb3ZlTGlzdFtiZWdpbisxXSkpO1xuXHRcdFx0bW92ZS5tb3ZlTGlzdFtiZWdpbl0gPSBtb3ZlLm1vdmVMaXN0W2JlZ2luKzFdO1xuXHRcdFx0bW92ZS5tb3ZlTWFwW3N0YXJ0SWRdID0gYmVnaW4rMTtcblx0XHRcdGJlZ2luKys7XG5cdFx0fVxuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vdmUubW92ZUxpc3RbZW5kXS5pZCkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWRbaG9sZF0uaWQpO1xuXHRcdG1vdmUubW92ZUxpc3RbZW5kXSA9IGhvbGQ7XG5cdFx0bW92ZS5tb3ZlTWFwW3N0YXJ0SWRdID0gZW5kO1xuXHR9LFxuXG5cdHJlc29sdmVNb3ZlczogZnVuY3Rpb24gKCl7XG5cdFx0bGV0IHBhcmVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKTtcblx0XHRjb25zb2xlLmxvZygnUmVzb2x2aW5nIG1vdmVzJyk7XG5cdFx0Zm9yKGxldCBtIGluIG1vdmUubW92ZUxpc3QpIHtcblx0XHRcdGxldCBtdiA9IG1vdmUubW92ZUxpc3RbbV07XG5cdFx0XHRjb25zb2xlLmxvZygnbW92ZTogJywgbXYpO1xuXHRcdFx0c3dpdGNoKG12LnR5cGUpIHtcblx0XHRcdFx0Y2FzZSAnYXR0YWNrJzogXG5cdFx0XHRcdFx0Z3JpZC5hdHRhY2tQbGF5ZXIobXYuY29vcmRpbmF0ZSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ21pbmUnOlxuXHRcdFx0XHRcdGdyaWQuc2V0TWluZShtdi5jb29yZGluYXRlKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnbW92ZSc6XG5cdFx0XHRcdFx0Z3JpZC5tb3ZlU2hpcCgpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdwaXZvdCc6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0bGV0IGNoaWxkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobXYuaWQpO1xuXHRcdHBhcmVudC5yZW1vdmVDaGlsZChjaGlsZCk7XG5cdFx0fVxuXHR9LFxuXG5cdG1vdmVTaGlwOiBmdW5jdGlvbigpe1xuXHRcdC8vIENoZWNrIGZvciBtaW5lcyBiYXNlZCBvbiBnaG9zdCAtIHNlbmQgbWVzc2FnZSB0byBtaW5lIHNlcnZpY2Vcblx0XHRsZXQgYmxhc3RBdCA9IGdyaWQuY2hlY2tfZm9yX21pbmUobW92ZS5naG9zdCk7XG5cdFx0aWYgKGJsYXN0QXQgIT0gZmFsc2Upe1xuXHRcdFx0Ly8gUmVzZXQgZ2hvc3QgaWYgbWluZSBmb3VuZCAtIElmIGEgbWluZSBoYXMgYmVlbiBlbmNvdW50ZXJlZCB0aGVuIHRoZSBzaGlwIG9ubHkgbW92ZXMgdG8gdGhlIHBvaW50IG9mIHRoZSBibGFzdFxuXHRcdFx0Z3JpZC5yZXNldEdob3N0KGJsYXN0QXQpO1xuXHRcdFx0Ly8gZmluZCB3aGljaCBzcXVhcmUgZ290IGhpdFxuXHRcdFx0bGV0IHRhcmdldDtcblx0XHRcdGZvcihsZXQgbSBpbiBtb3ZlLmdob3N0KXtcblx0XHRcdFx0aWYgKG1vdmUuZ2hvc3RbbV0gPT0gYmxhc3RBdClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRhcmdldD1tb3ZlLmdob3N0W21dO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRzaGlwcy5zZXRIaXRDb3VudGVyKG1vdmUuc2hpcFR5cGUsIG0rMSk7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXQpLmNsYXNzTmFtZSArPScgc2hpcEhpdCc7XG5cdFx0fVxuXG5cdFx0bGV0IGZsID0gZmxlZXQuZ2V0RmxlZXQobW92ZS5zaGlwVHlwZSk7XG5cdFx0bGV0IHMgPSBzaGlwcy5nZXRTaGlwKG1vdmUuc2hpcFR5cGUpO1xuXG5cdFx0aWYgKGZsWzBdID09IG1vdmUuZ2hvc3RbMF0gJiYgbW92ZS5vcmllbnRhdGlvbiA9PSBzLm9yaWVudGF0aW9uKSB7IC8vIGNoZWNrIHN0YXJ0aW5nIHBvaW50cyBhbmQgb3JpZW50YXRpb24gc2V0IGFuZCByZWRpc3BsYXkgb25seSBpZiBkaWZmZXJlbnRcblx0XHRcdC8vIFZhbGlkYXRlIG1vdmUgY2FuIGJlIG1hZGVcblx0XHRcdGlmKGZsZWV0LnZhbGlkYXRlU2hpcChtb3ZlLmdob3N0LCBtb3ZlLnNoaXBUeXBlKSkge1xuXHRcdFx0XHRncmlkLmRpc3BsYXlTaGlwKHNoaXBzLCBtb3ZlLnNoaXBUeXBlKTtcblx0XHRcdFx0Ly8gU2V0IGdob3N0IHRvIE5hdXRpY2FsQ2hhcnQvTWFwXG5cdFx0XHRcdGZsZWV0LnNldEZsZWV0IChtb3ZlLm9yaWVudGF0aW9uLCBtb3ZlLnNoaXBUeXBlLCBzaGlwcy5nZXRTaGlwKG1vdmUuc2hpcFR5cGUpLnNpemUsIG1vdmUuZ2hvc3RbMF0sIDApOyBcblx0XHRcdH1cblxuXHRcdFx0Ly8gRGlzcGxheSBuZXcgc2hpcCBsb2NhdGlvbiBiYXNlZCBvbiBOYXV0aWNhbENoYXJ0L01hcFxuXHRcdFx0Z3JpZC5kaXNwbGF5U2hpcChtb3ZlLnNoaXBUeXBlLCBtb3ZlLmdob3N0KTtcblx0XHR9XG5cdH0sXG5cblx0cmVzZXRHaG9zdDogZnVuY3Rpb24oYmxhc3RBdCl7XG5cdFx0Zm9yIChsZXQgaSBpbiBtb3ZlLmdob3N0KXtcblx0XHRcdGlmIChibGFzdEF0ID09IG1vdmUuZ2hvc3RbaV0pIGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiBtb3ZlLmdob3N0ID0gZmxlZXQuZ2hvc3RTaGlwKG1vdmUudHlwZSwgbW92ZS5naG9zdFtpXSwgbW92ZS5vcmllbnRhdGlvbiwgbW92ZS5naG9zdC5sZW5ndGgsIGkpO1xuXHR9LFxuXG5cdC8vIFN0dWIgZm9yIG1pbmUgZGV0ZWN0aW9uXG5cdGNoZWNrX2Zvcl9taW5lOiBmdW5jdGlvbiAoZyl7XG5cdFx0bGV0IG1pbmVBdCA9IHsnMF82JzogMSwgJzFfNic6IDEsICcyXzYnOiAxLCAnM182JzogMSwgJzRfNic6IDEsICc1XzYnOiAxLCAnNl82JzogMSwgJzdfNic6IDEsICc4XzYnOiAxLCAnOV82JzogMX07XG5cdFx0Zm9yKGxldCBpIGluIGcpIHtcblx0XHRcdC8vIHJldHVybiBsb2NhdGlvbiB3aGVyZSBtaW5lIHN0cnVja1xuXHRcdFx0aWYobWluZUF0W2dbaV1dID09IDEpIHsgXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdCT09NJyk7XG5cdFx0XHRcdHJldHVybiBnW2ldOyBcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHRcdFxuXG5cdGF0dGFja1BsYXllcjogZnVuY3Rpb24oY29vcmRpbmF0ZSl7XG5cdFx0Ly8gU2VuZCBhIG1lc3NhZ2UgcmVxdWVzdGluZyBoaXQvbWlzcyB2YWx1ZSBvbiBlbmVteSdzIGdyaWRcblx0XHQvLyBJbmZvcm0gYWxsIG9mIGVuZW15J3MgY29vcmRpbmF0ZSBzdGF0dXNcblx0fSxcblxuXHRzZXRNaW5lOiBmdW5jdGlvbihjb29yZGluYXRlKXtcblx0XHQvLyBTZW5kIGEgbWVzc2FnZSByZXF1ZXN0aW5nIGhpdC9taXNzIHZhbHVlIG9uIGVuZW15J3MgZ3JpZFxuXHRcdC8vIElmIG5vdCBhIGhpdCByZWdpc3RlciB3aXRoIHNlcnZpY2UgdGhhdCBtaW5lIHBsYWNlZCBvbiBlbmVteSBncmlkXG5cdH0sXG5cblx0c2V0TW92ZTogZnVuY3Rpb24obSl7XG5cdFx0aWYobW92ZS5tb3ZlTWFwW20uY29vcmRpbmF0ZV0gPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRtb3ZlLm1vdmVNYXBbbS5jb29yZGluYXRlXSA9IG1vdmUubW92ZUxpc3QubGVuZ3RoO1xuXHRcdFx0bGV0IG12ID0gbW92ZS5tb3ZlTGlzdEJsb2NrKG0pO1xuXHRcdFx0bW92ZS5tb3ZlTGlzdC5wdXNoKG12KTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKS5hcHBlbmRDaGlsZChtdi5kb20pO1xuXHRcdH1cblx0fSxcblxuXHRnZXRNb3ZlU2l6ZTogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gbW92ZS5tb3ZlTGlzdC5sZW5ndGg7XG5cdH1cbn1cblxuLyoqKiBiYXR0bGVzaGlwT25lLmpzICoqKi9cblxuZmxlZXQuaW5pdCgpO1xucGxheWVyLmdhbWVGbG93KCk7XG5cbi8qIFJlZ2lzdGVyICovXG4vLyBUT0RPIC0gYXR0YWNoIGhhbmRsZXIgdGhyb3VnaCBwdWc7IG1vdmUgaGFuZGxlcnMgdG8gYW5vdGhlciBtb2R1bGVcbmxldCByPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3RlcicpO1xuci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxuICAgIGZ1bmN0aW9uKCl7XG5cdCAgICBwbGF5ZXIucmVnaXN0ZXIoKTtcblx0ICAgIC8vcmV0dXJuO1xuICAgIH0sIGZhbHNlKTtcblxubGV0IGY9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldEZsZWV0Jyk7XG5mLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXG4gICAgZnVuY3Rpb24oKXtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldEZsZWV0Jykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXJHcmlkJykuc3R5bGUuZGlzcGxheT0naW5saW5lJztcblx0Z3JpZC5zZXRNb3ZlU2hpcCgpOyBcblx0ICAgIHBsYXlHYW1lKCk7XG5cdCAgICAvL3JldHVybjtcbiAgICB9LCBmYWxzZSk7XG5cbi8vIFNldCB1cCBsaW5rIHRvIHJlc29sdmUgbW92ZXNcbmxldCBkPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkb01vdmVzJyk7XG5kLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxcblx0ZnVuY3Rpb24oKXtcblx0XHQvLyBSZXNvbHZlIG9yZGVyc1xuXHRcdG1vdmUucmVzb2x2ZU1vdmVzKCk7XG5cdFx0Ly8gUmVzZXQgbW92ZXNcblx0XHRtb3ZlLmNsZWFyTW92ZUxpc3QoKTtcblx0XHQvLyBUdXJuIG1vdmVzIG92ZXIgdG8gdGhlIG5leHQgcGxheWVyXG5cdFx0Ly8gRklYTUUgLSBTaW11bGF0aW5nIG1vdmVzIGZvciBub3cuIFJlbW92ZSB3aGVuIHJlYWR5IGZvciByZWFsc2llc1xuXG5cdH0sIGZhbHNlKTtcbi8vIFNldCB1cCBncmlkXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXlHcmlkJykuYXBwZW5kQ2hpbGQoZ3JpZC5jbGlja2FibGVHcmlkKDEwLCAxMCkpO1xuXG4vLyBTZXQgdXAgZHJhZy9kcm9wIG9mIG1vdmVzXG4vL2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5T3JkZXInKS5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsJ3RydWUnKTtcbi8vcGxheWVyLnBsYXllck9yZGVySGFuZGxlcigpO1xuXG4vKiBTZXQgcmFuZG9tIGZsZWV0ICovXG5zaGlwcy5idWlsZFNoaXBzKCk7XG5zaGlwcy5wbGFjZVNoaXBzKCk7XG5sZXQgd2hvbGVGbGVldCA9IGZsZWV0LmdldFdob2xlRmxlZXQoKTtcbmZvciAobGV0IHQgaW4gd2hvbGVGbGVldCkge1xuXHRncmlkLmRpc3BsYXlTaGlwKHQpO1xufVxuXG4vKiBcbiAqIE1vY2sgZ2FtZSB3aWxsIGJlIHJlbW92ZWQgXG4gKi9cbmxldCBtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ01lZ2FuUmVnJyk7XG5tLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXG4gICAgZnVuY3Rpb24oKXtcbiAgICAgICAgcGxheWVyLmFjY2VwdFJlZygnTWVnYW4nLCAxKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ01lZ2FuUmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgfSwgZmFsc2UpO1xuXG5sZXQgcnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnUnlhblJlZycpO1xucnkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBcbiAgICBmdW5jdGlvbigpe1xuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdSeWFuJywgMik7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdSeWFuUmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgfSwgZmFsc2UpO1xuXG5sZXQgdHIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnVHJhY2V5UmVnJyk7XG50ci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxuICAgIGZ1bmN0aW9uKCl7XG4gICAgICAgIHBsYXllci5hY2NlcHRSZWcoJ1RyYWNleScsIDMpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnVHJhY2V5UmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgfSwgZmFsc2UpO1xuXG4vKiBQbGF5IGdhbWUgKi9cbi8qXG53aGlsZSAoMSkge1xuXHRwbGF5ZXIuZ2V0VHVybigpO1xufVxuKi9cblxuZnVuY3Rpb24gcGxheUdhbWUoKXtcblx0aWYgKHBsYXllci5teVR1cm4oKSl7XG5cdFx0Ly93aW5kb3cub3BlbignJywnYXR0YWNrJywgJ2hlaWdodD0yMDAsd2lkdGg9MjAwLG1lbnViYXI9bm8sc3RhdHVzPW5vLHRpdGxlYmFyPW5vLHRvb2xiYXI9bm8nLCBmYWxzZSApO1xuXHR9XG59XG5cbiJdfQ==
