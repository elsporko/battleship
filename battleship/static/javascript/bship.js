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
		/*
		for (let l in move.moveList) {
			if(move.moveList[l].id == mv.id){
				move.moveList.splice(l,1);
				break;
			}
		}
		*/

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJhdHRsZXNoaXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKioqIGZsZWV0LmpzICoqKi9cclxudmFyIGZsZWV0ID0ge1xyXG5cdG5hdXRpY2FsTWFwOiB7fSwgLy8gSGFzaCBsb29rdXAgdGhhdCB0cmFja3MgZWFjaCBzaGlwJ3Mgc3RhcnRpbmcgcG9pbnQgYW5kIGN1cnJlbnQgb3JpZW50YXRpb25cclxuXHRpbml0OiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIGZsZWV0Lm5hdXRpY2FsQ2hhcnQgPSBmbGVldC5idWlsZE5hdXRpY2FsQ2hhcnQoKTsgLy8gRGV0YWlsZWQgbWF0cml4IG9mIGV2ZXJ5IHNoaXAgaW4gdGhlIGZsZWV0XHJcblx0fSxcclxuXHJcblx0YnVpbGROYXV0aWNhbENoYXJ0OiBmdW5jdGlvbigpe1xyXG5cdFx0bGV0IGNoYXJ0ID0gbmV3IEFycmF5O1xyXG5cdFx0Zm9yKGxldCBpPTA7IGkgPCAxMDsgaSsrKSB7XHJcblx0XHRcdGNoYXJ0W2ldID0gbmV3IEFycmF5O1xyXG5cdFx0XHRmb3IgKGxldCBqPTA7IGogPCAxMDsgaisrKXtcclxuXHRcdFx0XHRjaGFydFtpXVtqXSA9IHVuZGVmaW5lZDsvL25ldyBBcnJheTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGNoYXJ0O1xyXG5cdH0sXHJcblxyXG5cdGdldEZsZWV0OiBmdW5jdGlvbih0eXBlKXtcclxuXHRcdGxldCBvcmllbnRhdGlvbiA9IGZsZWV0Lm5hdXRpY2FsTWFwW3R5cGVdLm9yaWVudGF0aW9uID09ICd4JyA/IDAgOiAxO1xyXG5cdFx0bGV0IHBpZWNlcyA9IGZsZWV0Lm5hdXRpY2FsTWFwW3R5cGVdLnN0YXJ0X2Nvb3JkLnNwbGl0KCdfJyk7XHJcblx0XHRsZXQgcmV0ID0gbmV3IEFycmF5O1xyXG5cclxuXHRcdHdoaWxlIChwaWVjZXNbb3JpZW50YXRpb25dIDwgZmxlZXQubmF1dGljYWxDaGFydFtvcmllbnRhdGlvbl0ubGVuZ3RoICYmIGZsZWV0Lm5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSA9PSB0eXBlKSB7XHJcblx0XHRcdHJldC5wdXNoIChwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV0pO1xyXG5cdFx0XHRwaWVjZXNbb3JpZW50YXRpb25dID0gcGFyc2VJbnQocGllY2VzW29yaWVudGF0aW9uXSwgMTApICsgMTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gKHJldCk7XHJcblx0fSxcclxuXHJcblx0Z2V0V2hvbGVGbGVldDogZnVuY3Rpb24oKXtcclxuXHRcdGxldCByZXQ9e307XHJcblx0XHRmb3IgKGxldCB0IGluIGZsZWV0Lm5hdXRpY2FsTWFwKSB7XHJcblx0XHRcdHJldFt0XSA9IGZsZWV0LmdldEZsZWV0KHQpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9LFxyXG5cclxuXHQvLyBUT0RPIC0gc2V0RmxlZXQ6IFJlbW92ZSBwcmV2aW91cyBzaGlwIGZyb20gY2hhcnQgLS0gbWF5IGJlIGRvbmUuLi5uZWVkcyB0ZXN0XHJcblx0LypcclxuXHQgKiBzZXRGbGVldCAtIHBsYWNlIHNoaXAgb24gbmF1dGljYWwgY2hhcnRcclxuXHQgKi9cclxuXHRzZXRGbGVldDogZnVuY3Rpb24gKG9yaWVudGF0aW9uLCB0eXBlLCBzaXplLCBzdGFydF9jb29yZCwgb2Zmc2V0KXsgXHJcblx0XHRsZXQgcGllY2VzID0gc3RhcnRfY29vcmQuc3BsaXQoJ18nKTtcclxuXHQgICAgbGV0IGluZGV4ID0gKG9yaWVudGF0aW9uID09ICd4JykgPyAwIDogMTtcclxuXHJcblx0ICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xyXG5cclxuXHQgICAgLy8gQWRqdXN0IGZvciBkcmFnL2Ryb3Agd2hlbiBwbGF5ZXIgcGlja3MgYSBzaGlwIHBpZWNlIG90aGVyIHRoYW4gdGhlIGhlYWQuXHJcblx0ICAgIHBpZWNlc1tpbmRleF0gPSBwYXJzZUludChwaWVjZXNbaW5kZXhdLCAxMCkgLSBvZmZzZXQ7XHJcblxyXG5cdCAgICAvKlxyXG5cdCAgICAgKiBSZW1vdmUgb2xkIHNoaXAgZnJvbSBuYXV0aWNhbENoYXJ0L01hcFxyXG5cdCAgICAgKi9cclxuXHQgICAgZmxlZXQuY2xlYXJTaGlwKHR5cGUsIHNpemUpO1xyXG5cclxuXHQgICAgLy8gc2V0IHRoZSBuYXV0aWNhbCBtYXAgdmFsdWUgZm9yIHRoaXMgYm9hdFxyXG5cdCAgICBmbGVldC5uYXV0aWNhbE1hcFt0eXBlXT17XHJcblx0XHQgICAgb3JpZW50YXRpb246IG9yaWVudGF0aW9uLFxyXG5cdFx0ICAgIHN0YXJ0X2Nvb3JkOiBwaWVjZXNbMF0gKyAnXycgKyBwaWVjZXNbMV1cclxuXHQgICAgfTtcclxuXHJcblx0ICAgIGZvciAodmFyIGk9MDsgaSA8IHNpemU7IGkrKykge1xyXG5cdFx0ZmxlZXQubmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldID0gdHlwZTtcclxuXHRcdHBpZWNlc1tpbmRleF09IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSArMTtcclxuXHQgICAgfVxyXG5cdH0sXHJcblxyXG5cdGNsZWFyU2hpcDogZnVuY3Rpb24odHlwZSwgc2l6ZSl7XHJcblx0ICAgIGxldCBtYXAgPSBmbGVldC5uYXV0aWNhbE1hcFt0eXBlXTtcclxuXHQgICAgaWYgKG1hcCA9PT0gdW5kZWZpbmVkKXtyZXR1cm4gZmFsc2U7fVxyXG5cclxuXHQgICAgbGV0IHBpZWNlcyA9IG1hcC5zdGFydF9jb29yZC5zcGxpdCgnXycpO1xyXG5cdCAgICBsZXQgaW5kZXggPSAobWFwLm9yaWVudGF0aW9uID09ICd4JykgPyAwIDogMTtcclxuXHJcblx0ICAgIGZvciAobGV0IGk9MDsgaSA8IHNpemU7IGkrKykge1xyXG5cdFx0ICAgIGZsZWV0Lm5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXT11bmRlZmluZWQ7XHJcblx0XHQgICAgcGllY2VzW2luZGV4XSsrO1xyXG5cdCAgICB9XHJcblxyXG5cdCAgICBkZWxldGUgZmxlZXQubmF1dGljYWxNYXBbdHlwZV07XHJcblx0fSxcclxuXHJcblx0LypcclxuXHQgKiBnaG9zdFNoaXAgLSBCZWZvcmUgcHV0dGluZyBhIHNoaXAgb24gdGhlIGNoYXJ0IGl0J3MgcG90ZW50aWFsIGxvY2F0aW9uIG5lZWRzIHRvIGJlIHBsb3R0ZWQgc28gaXQgY2FuIGJlXHJcblx0ICogY2hlY2tlZCBmb3IgdmFsaWRpdHkuIEdpdmVuIGEgc2hpcCB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHRoZSBwb3RlbnRpYWwgcGxvdHRlZCBjb29yZGluYXRlcy4gVGhlIGZ1bmN0aW9uXHJcblx0ICogbWF5IGJ1aWxkIGNvb3JkaW5hdGVzIGZvciBhIGtub3duIHNoaXAgb3IgZm9yIG9uZSBtb3ZlZCBhcm91bmQgb24gdGhlIGdyaWQuXHJcblx0ICovXHJcblx0Z2hvc3RTaGlwOiBmdW5jdGlvbih0eXBlLCBjb29yZGluYXRlLCBvcmllbnRhdGlvbiwgc2l6ZSwgb2Zmc2V0KXtcclxuXHRcdGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuXHRcdGxldCB0aGlzU2hpcCA9IGZsZWV0LnJlYWRNYXAodHlwZSk7XHJcblx0XHRsZXQgZ2hvc3QgPSBbXTtcclxuXHRcdGNvb3JkaW5hdGUgPSBjb29yZGluYXRlIHx8IHRoaXNTaGlwLnN0YXJ0X2Nvb3JkO1xyXG5cdFx0b3JpZW50YXRpb24gPSBvcmllbnRhdGlvbiB8fCB0aGlzU2hpcC5vcmllbnRhdGlvbjtcclxuXHRcdHNpemUgPSBzaXplIHx8IHNoaXAuc2l6ZTtcclxuXHRcdG9mZnNldCA9IG9mZnNldCB8fCAwO1xyXG5cclxuXHRcdGxldCBwaWVjZXMgPSBjb29yZGluYXRlLnNwbGl0KCdfJyk7XHJcblx0XHRsZXQgaW5kZXggPSAob3JpZW50YXRpb24gPT0gJ3gnKSA/IDA6IDE7XHJcblx0XHRwaWVjZXNbaW5kZXhdID0gcGFyc2VJbnQocGllY2VzW2luZGV4XSwgMTApIC0gb2Zmc2V0O1xyXG5cdFx0Zm9yIChsZXQgaT0wOyBpIDwgc2l6ZTsgaSsrKSB7XHJcblx0XHRcdGdob3N0LnB1c2gocGllY2VzWzBdICsgJ18nICsgcGllY2VzWzFdKTtcclxuXHRcdFx0cGllY2VzW2luZGV4XSA9IHBhcnNlSW50KHBpZWNlc1tpbmRleF0sIDEwKSArMTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBnaG9zdDtcclxuXHR9LFxyXG5cclxuXHRyZWFkTWFwOiBmdW5jdGlvbih0eXBlKXtcclxuXHRcdHJldHVybiBmbGVldC5uYXV0aWNhbE1hcFt0eXBlXTtcclxuXHR9LFxyXG5cclxuXHQvKlxyXG5cdCAqIEdpdmVuIGEgY29vcmRpbmF0ZSBvciBhbiBhcnJheSBvZiBjb29yZGluYXRlcyByZXR1cm4gdGhlIHNhbWUgc3RydWN0dXJlIHJldmVhbGluZyB0aGUgY29udGVudHMgb2YgdGhlIGdyaWQuXHJcblx0ICogV2lsbCByZXR1cm4gYSB2YWx1ZSBvZiBmYWxzZSBpZiB0aGVyZSBpcyBhIHByb2JsZW0gY2hlY2tpbmcgdGhlIGdyaWQgKGV4LiBjb29yZHMgYXJlIG91dCBvZiByYW5nZSkuXHJcblx0ICovXHJcblx0Y2hlY2tHcmlkOiBmdW5jdGlvbihjb29yZGluYXRlcyl7XHJcblx0XHRpZiAoY29vcmRpbmF0ZXMgaW5zdGFuY2VvZiBBcnJheSl7XHJcblx0XHRcdGxldCByZXQgPSBuZXcgQXJyYXk7XHJcblx0XHRcdGZvcihsZXQgYyBpbiBjb29yZGluYXRlcyl7XHJcblx0XHRcdFx0bGV0IHMgPSBmbGVldC5zZXRDaGFydChjb29yZGluYXRlc1tjXSk7XHJcblx0XHRcdFx0aWYgKHMgPT09IGZhbHNlKSB7cmV0dXJuIGZhbHNlfTtcclxuXHRcdFx0XHRyZXQucHVzaCAocyk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHJldDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBmbGVldC5zZXRDaGFydChjb29yZGluYXRlcyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0c2V0Q2hhcnQ6IGZ1bmN0aW9uKGNvb3JkaW5hdGUpe1xyXG5cdFx0bGV0IHBpZWNlcyA9IGNvb3JkaW5hdGUuc3BsaXQoJ18nKTtcclxuXHRcdGlmIChwYXJzZUludChwaWVjZXNbMF0sIDEwKSA+PSBmbGVldC5uYXV0aWNhbENoYXJ0Lmxlbmd0aCB8fFxyXG5cdFx0ICAgIHBhcnNlSW50KHBpZWNlc1sxXSwgMTApPj0gZmxlZXQubmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV0ubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZmxlZXQubmF1dGljYWxDaGFydFtwYXJzZUludChwaWVjZXNbMF0sIDEwKV1bcGFyc2VJbnQocGllY2VzWzFdLCAxMCldO1xyXG5cdH0sXHJcblxyXG5cdC8qIFxyXG5cdCAqIEdpdmVuIGEgbGlzdCBvZiBjb29yZGluYXRlcyBhbmQgYSBzaGlwIHR5cGUgdmFsaWRhdGUgdGhhdCB0aGUgY29vcmRpbmF0ZXMgZG8gbm90IHZpb2xhdGUgdGhlIHJ1bGVzIG9mOlxyXG5cdCAqIFx0KiBzaGlwIG11c3QgYmUgb24gdGhlIGdyaWRcclxuXHQgKiBcdCogc2hpcCBtdXN0IG5vdCBvY2N1cHkgdGhlIHNhbWUgc3F1YXJlIGFzIGFueSBvdGhlciBzaGlwXHJcblx0ICovXHJcblx0dmFsaWRhdGVTaGlwOiBmdW5jdGlvbiAoY29vcmRpbmF0ZXMsIHR5cGUpe1xyXG5cdCAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIG90aGVyIGJvYXRzIGFscmVhZHkgb24gYW55IGEgc3BhY2VcclxuXHQgICAgZm9yICh2YXIgcD0wOyBwIDwgY29vcmRpbmF0ZXMubGVuZ3RoOyBwKyspIHtcclxuXHJcblx0XHQvLyBJcyB0aGVyZSBhIGNvbGxpc2lvbj9cclxuXHRcdGxldCBjb2xsaXNpb24gPSBmbGVldC5jaGVja0dyaWQoY29vcmRpbmF0ZXMpO1xyXG5cdFx0XHJcblx0XHRpZiAoY29sbGlzaW9uID09IGZhbHNlKSB7cmV0dXJuIGZhbHNlfTsgLy8gSWYgY2hlY2tHcmlkIHJldHVybnMgZmFsc2UgY29vcmRpbmF0ZXMgYXJlIG91dCBvZiByYW5nZVxyXG5cclxuXHRcdGZvciAobGV0IGMgaW4gY29vcmRpbmF0ZXMpIHtcclxuXHRcdFx0bGV0IHBpZWNlcyA9IGNvb3JkaW5hdGVzW2NdLnNwbGl0KCdfJyk7XHJcblx0XHRcdFx0aWYgKGZsZWV0Lm5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSAhPSB0eXBlICYmXHJcblx0XHRcdFx0ICAgIGZsZWV0Lm5hdXRpY2FsQ2hhcnRbcGFyc2VJbnQocGllY2VzWzBdLCAxMCldW3BhcnNlSW50KHBpZWNlc1sxXSwgMTApXSAhPSB1bmRlZmluZWQpIHtyZXR1cm4gZmFsc2V9O1xyXG5cdFx0fVxyXG5cdCAgICB9XHJcblx0ICAgIHJldHVybiB0cnVlO1xyXG5cdH0sXHJcbn07XHJcblxyXG4vKioqIGdyaWQuanMgKioqL1xyXG5sZXQgZ3JpZCA9IHtcclxuXHRtb3ZlU2hpcDogZnVuY3Rpb24oZHJvcE9iaiwgZXYpe1xyXG5cdCAgICBjb25zb2xlLmxvZygncHJlLXNldCBmbGVldCBtb3ZlJyk7XHJcblx0ICAgIGxldCBzaGlwPXNoaXBzLmdldFNoaXAoZHJvcE9iai50eXBlKTtcclxuXHQgICAgLy8gUmVtb3ZlIGluaXRpYWwgaW1hZ2VcclxuXHQgICAgZ3JpZC5kaXNwbGF5U2hpcChkcm9wT2JqLnR5cGUpO1xyXG5cclxuXHQgICAgZmxlZXQuc2V0RmxlZXQgKGRyb3BPYmoub3JpZW50YXRpb24sIGRyb3BPYmoudHlwZSwgc2hpcC5zaXplLCBldi50YXJnZXQuaWQsIGRyb3BPYmoub2Zmc2V0KTsgXHJcblxyXG5cdCAgICAvLyBSZWRyYXcgaW1hZ2UgaW4gbmV3IGxvY2F0aW9uXHJcblx0ICAgIGdyaWQuZGlzcGxheVNoaXAoZHJvcE9iai50eXBlKTtcclxuXHR9LFxyXG5cclxuXHQvKlxyXG5cdCAqIENhbGxlZCBhZnRlciBwbGF5ZXIgc2V0cyBpbml0aWFsIGZsZWV0LiBPdmVyd3JpdGUgdGhlIG1vdmVTaGlwIGZ1bmN0aW9uIHNvIGl0IGJlaGF2ZXMgZGlmZmVyZW50LlxyXG5cdCAqL1xyXG5cdHNldE1vdmVTaGlwOiBmdW5jdGlvbigpe1xyXG5cdFx0LyogY2hhbmdlIHZhbHVlIG9mIG1vdmVTaGlwIGZ1bmN0aW9uICovXHJcblx0XHRncmlkLm1vdmVTaGlwID0gZnVuY3Rpb24oZHJvcE9iaiwgZXYsIGRyb3BTaGlwLCBtb3ZlVHlwZSl7XHJcblx0XHQgICAgY29uc29sZS5sb2coJ0luIGdhbWUgbW92ZScpO1xyXG5cdFx0ICAgIC8vIFJlbW92ZSBpbml0aWFsIGltYWdlXHJcblx0XHQgICAgZ3JpZC5kaXNwbGF5U2hpcChkcm9wT2JqLnR5cGUpO1xyXG5cclxuXHRcdCAgICAvLyBkcmF3IGltYWdlIGJhc2VkIG9uIGRyb3BTaGlwXHJcblx0XHQgICAgZ3JpZC5kaXNwbGF5U2hpcChkcm9wT2JqLnR5cGUsIGRyb3BTaGlwKTtcclxuXHJcblx0XHQgICAgLy8gU3RvcmUgZ2hvc3RTaGlwIGluIG1vdmUgb2JqZWN0XHJcblx0XHQgICAgcGxheWVyLnNldE1vdmUoeyB0eXBlOiBtb3ZlVHlwZSwgXHJcblx0XHRcdFx0ICAgICBjb29yZGluYXRlOiBldi50YXJnZXQuaWQsIFxyXG5cdFx0XHRcdCAgICAgZ2hvc3Q6IGRyb3BTaGlwLFxyXG5cdFx0XHRcdCAgICAgb3JpZW50YXRpb246IGRyb3BPYmoub3JpZW50YXRpb24sIFxyXG5cdFx0XHRcdCAgICAgc2hpcFR5cGU6IGRyb3BPYmoudHlwZSxcclxuXHRcdFx0XHQgICAgIHVuZG86IGZsZWV0Lmdob3N0U2hpcChkcm9wT2JqLnR5cGUpIC8vIE5lZWQgdG8gcHJlc2VydmUgdGhlIHNoaXAncyBwb3NpdGlvbiBwcmUtbW92ZVxyXG5cdFx0ICAgIH0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdC8qXHJcblx0ICogQnVpbGQgdGhlIGdyaWQgYW5kIGF0dGFjaCBoYW5kbGVycyBmb3IgZHJhZy9kcm9wIGV2ZW50c1xyXG5cdCAqL1xyXG5cdGNsaWNrYWJsZUdyaWQ6IGZ1bmN0aW9uICggcm93cywgY29scywgcGhhbmRsZSl7XHJcblx0ICAgIGxldCBncmlkVGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xyXG5cdCAgICBncmlkVGFibGUuY2xhc3NOYW1lPSdncmlkJztcclxuXHQgICAgZm9yICh2YXIgcj0wO3I8cm93czsrK3Ipe1xyXG5cdFx0dmFyIHRyID0gZ3JpZFRhYmxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJykpO1xyXG5cdFx0Zm9yICh2YXIgYz0wO2M8Y29sczsrK2Mpe1xyXG5cdFx0ICAgIHZhciBjZWxsID0gdHIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKSk7XHJcblx0XHQgICAgLy8gRWFjaCBjZWxsIG9uIHRoZSBncmlkIGlzIG9mIGNsYXNzICdjZWxsJ1xyXG5cdFx0ICAgIGNlbGwuY2xhc3NOYW1lPSdjZWxsJztcclxuXHJcblx0XHQgICAgLy8gU2V0IHRoZSBJRCB2YWx1ZSBvZiBlYWNoIGNlbGwgdG8gdGhlIHJvdy9jb2x1bW4gdmFsdWUgZm9ybWF0dGVkIGFzIHJfY1xyXG5cdFx0ICAgIGNlbGwuaWQgPSByICsgJ18nICsgYztcclxuXHJcblx0XHQgICAgaWYgKHBoYW5kbGUgPT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0Z3JpZC5zZXRNeUxpc3RlbmVycyhjZWxsKVxyXG5cdFx0ICAgIH0gZWxzZSB7XHJcblx0XHQgICAgICAgZ3JpZC5zZXRQbGF5ZXJMaXN0ZW5lcnMoY2VsbCwgcGhhbmRsZSk7XHJcblx0XHQgICAgfVxyXG5cdFx0fVxyXG5cdCAgICB9XHJcblx0ICAgIHJldHVybiBncmlkVGFibGU7XHJcblx0fSxcclxuXHJcblx0c2V0TXlMaXN0ZW5lcnM6IGZ1bmN0aW9uKGNlbGwpe1xyXG5cdFx0ICAgIC8vIFNldCB1cCBkcmFnIGFuZCBkcm9wIGZvciBlYWNoIGNlbGwuXHJcblx0XHQgICAgY2VsbC5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsJ3RydWUnKTtcclxuXHJcblx0XHQgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLChcclxuXHRcdFx0ZnVuY3Rpb24oZXYpe1xyXG5cdFx0XHQgICAgZXYuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQ9J21vdmUnO1xyXG5cdFx0XHQgICAgbGV0IHR5cGUgPSBncmlkLmdldFR5cGVCeUNsYXNzKHRoaXMuY2xhc3NOYW1lKTtcclxuXHRcdFx0ICAgIGxldCBzaGlwID0gc2hpcHMuZ2V0U2hpcCh0eXBlKTtcclxuXHJcblx0XHRcdCAgICAvLyBDYWxjdWxhdGUgd2hpY2ggc3F1YXJlIHdhcyBjbGlja2VkIHRvIGd1aWRlIHBsYWNlbWVudFxyXG5cdFx0XHQgICAgbGV0IHN0YXJ0ID0gZ3JpZC5maW5kX3N0YXJ0KHRoaXMuaWQsIHNoaXAub3JpZW50YXRpb24sIHNoaXAuc2l6ZSwgdHlwZSk7XHJcblx0XHRcdCAgICBldi5kYXRhVHJhbnNmZXIuc2V0RGF0YShcInRleHQvcGxhaW5cIiwgXHJcblx0XHRcdFx0SlNPTi5zdHJpbmdpZnkoe1xyXG5cdFx0XHRcdFx0XHRvZmZzZXQ6ICAgICAgICBzdGFydC5vZmZzZXQsXHJcblx0XHRcdFx0XHRcdHN0YXJ0X2Nvb3JkOiAgIChmbGVldC5yZWFkTWFwKHR5cGUpKS5zdGFydF9jb29yZCxcclxuXHRcdFx0XHRcdFx0aW5kZXg6ICAgICAgICAgc2hpcC5zaXplLFxyXG5cdFx0XHRcdFx0XHR0eXBlOiAgICAgICAgICB0eXBlLFxyXG5cdFx0XHRcdFx0XHRjdXJyZW50X2Nvb3JkOiBmbGVldC5naG9zdFNoaXAodHlwZSwgc3RhcnQuc3RhcnRfcG9zKSxcclxuXHRcdFx0XHRcdFx0b3JpZW50YXRpb246ICAgKGZsZWV0LnJlYWRNYXAodHlwZSkpLm9yaWVudGF0aW9uXHJcblx0XHRcdFx0XHQgICAgICAgfSlcclxuXHRcdFx0ICAgICk7XHJcblx0XHRcdH0pXHJcblx0XHQgICAgKTtcclxuXHJcblx0XHQgICAgLy8gQWRkIERyYWcvRHJvcCBjYXBhYmlsaXRpZXNcclxuXHRcdCAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLChcclxuXHRcdFx0ZnVuY3Rpb24oZXYpe1xyXG5cdFx0XHQgICAgY29uc29sZS5sb2coJ2Ryb3BwaW5nJyk7XHJcblx0XHRcdCAgICBsZXQgZHJvcE9iaiA9IEpTT04ucGFyc2UoZXYuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJ0ZXh0L3BsYWluXCIpKTtcclxuXHRcdFx0ICAgIGNvbnNvbGUubG9nKCdjdXJyZW50IGNvb3JkOiAnLCBkcm9wT2JqLmN1cnJlbnRfY29vcmQpO1xyXG5cdFx0XHQgICAgbGV0IHNoaXA9c2hpcHMuZ2V0U2hpcChkcm9wT2JqLnR5cGUpO1xyXG5cdFx0XHQgICAgbGV0IGRyb3BTaGlwID0gZmxlZXQuZ2hvc3RTaGlwKGRyb3BPYmoudHlwZSwgZXYudGFyZ2V0LmlkLCBkcm9wT2JqLm9yaWVudGF0aW9uLCBzaGlwLnNpemUsIGRyb3BPYmoub2Zmc2V0KTtcclxuXHJcblx0XHRcdCAgICBpZihmbGVldC52YWxpZGF0ZVNoaXAoZHJvcFNoaXAsIGRyb3BPYmoudHlwZSkpIHtcclxuXHRcdFx0XHQgICAgLyogVGhlcmUgYXJlIGRpZmZlcmVudCBiZWhhdmlvcnMgZm9yIHNldHRpbmcgc2hpcHMgYmFzZWQgb24gdGhlIGluaXRpYWwgbG9hZGluZyBvZiB0aGUgc2hpcHNcclxuXHRcdFx0XHQgICAgICogdmVyc3VzIG1vdmluZyBhIHNoaXAgaW4gZ2FtZS4gV2hlbiBtb3Zpbmcgc2hpcHMgaW4gZ2FtZSB0aGUgZGlzcGxheSBzaG91bGQgY2hhbmdlIHRvIHJlZmxlY3RcclxuXHRcdFx0XHQgICAgICogdGhlIHBvdGVudGlhbCBtb3ZlIGJ1dCB0aGUgaW50ZXJuYWwgc3RydWN0dXJlcyBzaG91bGQgbm90IGNoYW5nZSB1bnRpbCBpdCBoYXMgYmVlbiB2YWxpZGF0ZWRcclxuXHRcdFx0XHQgICAgICogd2hlbiByZXNvbHZpbmcgbW92ZXMuXHJcblx0XHRcdFx0ICAgICAqXHJcblx0XHRcdFx0ICAgICAqIFdoZW4gc2V0dGluZyB1cCBzaGlwcyBmb3IgdGhlIGluaXRpYWwgZ2FtIHRoZSBzdHJ1Y3R1cmVzIHNob3VsZCBjaGFuZ2UgYWxvbmcgd2l0aCB0aGUgZGlzcGxheSxcclxuXHRcdFx0XHQgICAgICogYWxsIGF0IG9uY2UuXHJcblx0XHRcdFx0ICAgICAqXHJcblx0XHRcdFx0ICAgICAqIFRoZSBmdW5jdGlvbiBtb3ZlU2hpcCBpcyBhIGNsb3N1cmUgd2hvc2UgdmFsdWUgaXMgY2hhbmdlZCBvbmNlIHRoZSBwbGF5ZXIgc2V0cyB0aGUgaW5pdGlhbCBmbGVldC5cclxuXHRcdFx0XHQgICAgICovXHJcblx0XHRcdFx0ICAgIGlmKHBsYXllci5jYW5Nb3ZlKCkpIHtncmlkLm1vdmVTaGlwKGRyb3BPYmosIGV2LCBkcm9wU2hpcCwgJ21vdmUnKX07XHJcblx0XHRcdCAgICB9XHJcblxyXG5cdFx0XHQgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdCAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHQgICAgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHQgICAgfVxyXG5cdFx0XHQpXHJcblx0XHQgICAgKTtcclxuXHJcblx0XHQgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsKFxyXG5cdFx0XHRmdW5jdGlvbihldil7XHJcblx0XHRcdCAgICBjb25zb2xlLmxvZygnZHJhZ292ZXInKTtcclxuXHRcdFx0ICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdCAgICBldi5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdD0nbW92ZSc7XHJcblx0XHRcdCAgICByZXR1cm4gZmFsc2U7XHJcblx0XHRcdCAgICB9XHJcblx0XHRcdCkpO1xyXG5cclxuXHRcdCAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKFxyXG5cdFx0XHRmdW5jdGlvbihlKXtcclxuXHRcdFx0ICAgIGxldCBkcm9wID0ge307XHJcblx0XHRcdCAgICBsZXQgdHlwZSA9IGdyaWQuZ2V0VHlwZUJ5Q2xhc3ModGhpcy5jbGFzc05hbWUpO1xyXG5cdFx0XHQgICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG5cdFx0XHQgICAgbGV0IHN0YXJ0ID0gZ3JpZC5maW5kX3N0YXJ0KGUudGFyZ2V0LmlkLCBzaGlwLm9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHR5cGUpO1xyXG5cdFx0XHQgICAgbGV0IG9yaWVudGF0aW9uID0gKHNoaXAub3JpZW50YXRpb24gPT0gJ3gnKSA/ICd5JzoneCc7IC8vIGZsaXAgdGhlIG9yaWVudGF0aW9uXHJcblx0XHRcdCAgICBsZXQgZ2hvc3QgPSBmbGVldC5naG9zdFNoaXAodHlwZSwgZS50YXJnZXQuaWQsIG9yaWVudGF0aW9uLCBzaGlwLnNpemUsIHN0YXJ0Lm9mZnNldCk7XHJcblxyXG5cdFx0XHQgICAgZHJvcC50eXBlID0gdHlwZTtcclxuXHRcdFx0ICAgIGRyb3Aub2Zmc2V0ID0gc3RhcnQub2Zmc2V0O1xyXG5cdFx0XHQgICAgZHJvcC5vcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xyXG5cclxuXHRcdFx0ICAgIGlmKGZsZWV0LnZhbGlkYXRlU2hpcChnaG9zdCwgdHlwZSkpIHtcclxuXHRcdFx0XHRpZihwbGF5ZXIuY2FuTW92ZSgpKSB7XHJcblx0XHRcdFx0ICAgIHNoaXAub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcclxuXHRcdFx0XHQgICAgZ3JpZC5tb3ZlU2hpcChkcm9wLCBlLCBnaG9zdCwgJ3Bpdm90Jyl9O1xyXG5cdFx0XHQgICAgfVxyXG5cdFx0XHR9KSk7XHJcblx0fSxcclxuXHJcblx0c2V0UGxheWVyTGlzdGVuZXJzOiBmdW5jdGlvbihjZWxsLCBoYW5kbGUpe1xyXG5cdFx0ICAgIC8vIFNldCB0aGUgSUQgdmFsdWUgb2YgZWFjaCBjZWxsIHRvIHRoZSByb3cvY29sdW1uIHZhbHVlIGZvcm1hdHRlZCBhcyByX2NcclxuXHRcdCAgICBjZWxsLmlkID0gaGFuZGxlICsgJ18nICsgY2VsbC5pZDtcclxuXHRcdCAgICAvLyBTZXQgdXAgZHJhZyBhbmQgZHJvcCBmb3IgZWFjaCBjZWxsLlxyXG5cclxuXHRcdCAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKFxyXG5cdFx0XHRmdW5jdGlvbihlKXtcclxuXHRcdFx0ICAgIGlmKHBsYXllci5jYW5Nb3ZlKCkpIHtcclxuXHRcdFx0XHRwbGF5ZXIuc2V0TW92ZSh7dHlwZTogJ2F0dGFjaycsXHJcblx0XHRcdFx0XHQgICAgICBjb29yZGluYXRlOiBlLnRhcmdldC5pZH0pO1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCBlLnRhcmdldC5pZCArICcgaXMgdW5kZXIgYXR0YWNrJyk7XHJcblx0XHRcdCAgICB9XHJcblx0XHRcdH1cclxuXHRcdCAgICApKTtcclxuXHR9LFxyXG5cclxuXHQvKlxyXG5cdCAqIGZpbmRfc3RhcnQgLSBEZXRlcm1pbmUgdGhlIHN0YXJ0aW5nIGNvb3JkaW5hdGUgb2YgYSBzaGlwIGdpdmVuIHRoZSBzcXVhcmUgdGhhdCB3YXMgY2xpY2tlZC4gRm9yIGV4YW1wbGVcclxuXHQgKiBpdCBpcyBwb3NzaWJsZSB0aGF0IGEgYmF0dGxlc2hpcCBhbG9uZyB0aGUgeC1heGlzIHdhcyBjbGlja2VkIGF0IGxvY2F0aW9uIDNfMyBidXQgdGhhdCB3YXMgdGhlIHNlY29uZCBzcXVhcmVcclxuXHQgKiBvbiB0aGUgc2hpcC4gVGhpcyBmdW5jdGlvbiB3aWxsIGlkZW50aWZ5IHRoYXQgdGhlIGJhdHRsZXNoaXAgc3RhcnRzIGF0IDJfMy5cclxuXHQgKi9cclxuXHJcblx0ZmluZF9zdGFydDogZnVuY3Rpb24oc3RhcnRfcG9zLCBvcmllbnRhdGlvbiwgc2l6ZSwgdHlwZSl7XHJcblx0ICAgIGxldCBpbmRleCA9IChvcmllbnRhdGlvbiA9PSAneCcpID8gMCA6IDE7XHJcblxyXG5cdCAgICBsZXQgcGllY2VzPXN0YXJ0X3Bvcy5zcGxpdCgnXycpO1xyXG5cdCAgICBsZXQgb2Zmc2V0ID0gMDtcclxuXHJcblx0ICAgIGZvciAobGV0IGk9MDsgaSA8IHNpemU7IGkrKykge1xyXG5cdFx0aWYgKHBpZWNlc1tpbmRleF0gPT0gMCkge2JyZWFrO31cclxuXHRcdHBpZWNlc1tpbmRleF0tLTtcclxuXHRcdGxldCBnID0gZmxlZXQuY2hlY2tHcmlkKHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXSk7XHJcblx0XHRpZiAoZyA9PSB0eXBlICYmIGcgIT0gZmFsc2Upe1xyXG5cdFx0ICAgIG9mZnNldCsrO1xyXG5cdFx0ICAgIHN0YXJ0X3BvcyA9IHBpZWNlc1swXSArICdfJyArIHBpZWNlc1sxXTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHQgICAgYnJlYWs7XHJcblx0XHR9XHJcblx0ICAgIH1cclxuXHJcblx0ICAgIHJldHVybiB7c3RhcnRfcG9zOiBzdGFydF9wb3MsIG9mZnNldDogb2Zmc2V0fTtcclxuXHR9LFxyXG5cclxuXHRkaXNwbGF5U2hpcDogZnVuY3Rpb24gKHR5cGUsIGMpIHtcclxuXHQgICAgbGV0IGNvb3JkaW5hdGVzID0gYyB8fCBmbGVldC5nZXRGbGVldCh0eXBlKTtcclxuXHQgICAgbGV0IHNoaXAgPSBzaGlwcy5nZXRTaGlwKHR5cGUpO1xyXG5cclxuXHQgICAgZm9yIChsZXQgY29vcmQgaW4gY29vcmRpbmF0ZXMpIHtcclxuXHRcdGdyaWQuc2V0U3BhY2UoY29vcmRpbmF0ZXNbY29vcmRdLCBzaGlwLmNsaWNrQ2xhc3MpO1xyXG5cdCAgICB9XHJcblx0fSxcclxuXHJcblx0c2V0U3BhY2U6IGZ1bmN0aW9uKHNwYWNlLCBjbGFzc05hbWUpIHtcclxuXHQgICAgdmFyIGIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzcGFjZSk7IFxyXG5cdCAgICBiLmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lKTtcclxuXHR9LFxyXG5cclxuXHRnZXRUeXBlQnlDbGFzczogZnVuY3Rpb24oY2xhc3NOYW1lKXtcclxuXHRcdGxldCBzaGlwTGlzdCA9IHNoaXBzLmdldFNoaXAoKTtcclxuXHRcdGZvciAobGV0IHMgaW4gc2hpcExpc3Qpe1xyXG5cdFx0XHRpZiAoY2xhc3NOYW1lLm1hdGNoKHNoaXBMaXN0W3NdLmNsaWNrQ2xhc3MpKXtcclxuXHRcdFx0XHRyZXR1cm4gcztcclxuXHRcdFx0XHQvL3JldHVybiBzaGlwTGlzdFtzXS50eXBlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuLyoqKiBzaGlwcy5qcyAqKiovXHJcbmxldCBzaGlwcyA9IHtcclxuXHQvLyBDb25maWcgc2V0dGluZ3MgXHJcblx0c2hpcF9jb25maWc6IHtcclxuXHQgICAgYWlyY3JhZnRDYXJyaWVyIDoge1xyXG5cdFx0c2l6ZSA6IDUsXHJcblx0XHRpZCA6ICdhaXJjcmFmdENhcnJpZXInLFxyXG5cdFx0Y29sb3IgOiAnQ3JpbXNvbicsXHJcblx0XHRjbGlja0NsYXNzIDogJ2FjY2xpY2tlZCcsXHJcblx0XHRsYWJlbCA6ICdBaXJjcmFmdCBDYXJyaWVyJyxcclxuXHRcdG1hc2sgOiAzMSxcclxuXHQgICAgfSxcclxuXHQgICAgYmF0dGxlc2hpcCA6IHtcclxuXHRcdHNpemUgOiA0LFxyXG5cdFx0aWQgOiAnYmF0dGxlc2hpcCcsXHJcblx0XHRjb2xvcjonRGFya0dyZWVuJyxcclxuXHRcdGNsaWNrQ2xhc3MgOiAnYnNjbGlja2VkJyxcclxuXHRcdGxhYmVsIDogJ0JhdHRsZXNoaXAnLFxyXG5cdFx0bWFzazogMTUsXHJcblx0ICAgIH0sXHJcblx0ICAgIGRlc3Ryb3llciA6IHtcclxuXHRcdHNpemUgOiAzLFxyXG5cdFx0aWQgOiAnZGVzdHJveWVyJyxcclxuXHRcdGNvbG9yOidDYWRldEJsdWUnLFxyXG5cdFx0Y2xpY2tDbGFzcyA6ICdkZWNsaWNrZWQnLFxyXG5cdFx0bGFiZWwgOiAnRGVzdHJveWVyJyxcclxuXHRcdG1hc2s6IDcsXHJcblx0ICAgIH0sXHJcblx0ICAgIHN1Ym1hcmluZSAgOiB7XHJcblx0XHRzaXplIDogMyxcclxuXHRcdGlkIDogJ3N1Ym1hcmluZScsXHJcblx0XHRjb2xvcjonRGFya1JlZCcsXHJcblx0XHRjbGlja0NsYXNzIDogJ3N1Y2xpY2tlZCcsXHJcblx0XHRsYWJlbCA6ICdTdWJtYXJpbmUnLFxyXG5cdFx0bWFzayA6IDcsXHJcblx0ICAgIH0sXHJcblx0ICAgIHBhdHJvbEJvYXQgOiB7XHJcblx0XHRzaXplIDogMixcclxuXHRcdGlkIDogJ3BhdHJvbEJvYXQnLFxyXG5cdFx0Y29sb3I6J0dvbGQnLFxyXG5cdFx0Y2xpY2tDbGFzcyA6ICdwYmNsaWNrZWQnLFxyXG5cdFx0bGFiZWwgOiAnUGF0cm9sIEJvYXQnLFxyXG5cdFx0bWFzazogMyxcclxuXHQgICAgfSxcclxuXHR9LFxyXG5cclxuXHRoaXRDb3VudGVyOiB7XHJcblx0ICAgIGFpcmNyYWZ0Q2FycmllciA6IDAsXHJcblx0ICAgIGJhdHRsZXNoaXAgOiAwLFxyXG5cdCAgICBkZXN0cm95ZXIgOiAwLFxyXG5cdCAgICBzdWJtYXJpbmUgIDogMCxcclxuXHQgICAgcGF0cm9sQm9hdCA6IDBcclxuXHR9LFxyXG5cclxuXHRzdW5rQ291bnRlcjoge30sIC8vIFRyYWNrcyB3aGljaCBib2F0cyBoYXZlIGJlZW4gc3Vua1xyXG5cclxuXHQvLyBWYWx1ZXMgZm9yIGRldGVybWluaW5nIGJpdCB2YWx1ZXMgd2hlbiBhIGJvYXQgc2lua3NcclxuXHRhaXJDcmFmdENhcnJpZXI6IDEsXHJcblx0YmF0dGxlc2hpcDogMixcclxuXHRkZXN0cm95ZXI6IDQsXHJcblx0c3VibWFyaW5lOiA4LFxyXG5cdHBhdHJvbEJvYXQ6IDE2LFxyXG5cclxuXHRzZXRIaXRDb3VudGVyOiBmdW5jdGlvbiAodHlwZSwgYml0KSB7XHJcblx0XHRzaGlwcy5oaXRDb3VudGVyW3R5cGVdID0gc2hpcHMuc2hpcF9jb25maWdbdHlwZV0ubWFza14oYml0KmJpdCk7XHJcblx0XHRpZiAoc2hpcHMuaGl0Q291bnRlclt0eXBlXSA9PSBzaGlwcy5zaGlwX2NvbmZpZ1t0eXBlXS5tYXNrKSB7IC8vIEkgZG9uJ3Qga25vdyBpZiB0aGlzIGlzIGNvcnJlY3QgYnV0IHRoZSBpZGVhIGlzIGNoZWNrIHRvIHNlZSBpZiB0aGUgc2hpcCBpcyBzdW5rIGFuZCBmbGFnIGl0IGlmIG5lZWQgYmVcclxuXHRcdFx0c2hpcHMuc2V0U3Vua0NvdW50ZXIodHlwZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0c2V0U3Vua0NvdW50ZXI6IGZ1bmN0aW9uICh0eXBlKSB7XHJcblx0XHRzaGlwcy5zdW5rQ291bnRlciA9IHNoaXBzLnN1bmtDb3VudGVyXnR5cGU7XHJcblx0fSxcclxuXHJcblx0Z2V0SGl0Q291bnRlcjogZnVuY3Rpb24gKHR5cGUpe1xyXG5cdFx0cmV0dXJuIHNoaXBzLmhpdENvdW50ZXJbdHlwZV07XHJcblx0fSxcclxuXHJcblx0Z2V0U3Vua0NvdW50ZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gc2hpcHMuc3Vua0NvdW50ZXI7XHJcblx0fSxcclxuXHJcblx0Ly8gU2hpcCBjb25zdHJ1Y3RvciAtIHNoaXB5YXJkPz8/XHJcblx0c2hpcDogZnVuY3Rpb24oc2l6ZSwgaWQsIGNvbG9yLCBjbGlja0NsYXNzLCBsYWJlbCkge1xyXG5cdFx0dGhpcy5zaXplICAgICAgICA9IHNpemU7XHJcblx0XHR0aGlzLmlkICAgICAgICAgID0gaWQ7XHJcblx0XHR0aGlzLmNvbG9yICAgICAgID0gY29sb3I7XHJcblx0XHR0aGlzLmNsaWNrQ2xhc3MgID0gY2xpY2tDbGFzcztcclxuXHRcdHRoaXMubGFiZWwgICAgICAgPSBsYWJlbDtcclxuXHJcblx0XHRyZXR1cm4gKHRoaXMpO1xyXG5cdH0sXHJcblxyXG5cdC8qXHJcblx0ICogVGhlIHNoaXAgb2JqZWN0IGhvbGRzIHRoZSBjdXJyZW50IG9yaWVudGF0aW9uIG9mIHRoZSBzaGlwIGFuZCB0aGUgc3RhcnQgY29vcmRpbmF0ZSAodG9wbW9zdC9sZWZ0bW9zdCkuIFdoZW5cclxuXHQgKiB0aGVyZSBpcyBhIGNoYW5nZSB0byB0aGUgc2hpcCB0aGUgbWFzdGVyIG1hdHJpeCBuZWVkcyB0byBiZSB1cGRhdGVkLiBBbiBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHRoZXJlIGlzXHJcblx0ICogYSBjb29yZGluYXRlIGNoYW5nZS4gVGhpcyBsaXN0ZW5lciB3aWxsIHVwZGF0ZSB0aGUgbWFzdGVyIG1hdHJpeC4gQ2FsbHMgdG8gY2hlY2sgbG9jYXRpb24gKG1vdmUgdmFsaWR0aW9uLCBcclxuXHQgKiBjaGVjayBpZiBoaXQsIGV0Yy4pIHdpbGwgYmUgbWFkZSBhZ2FpbnN0IHRoZSBtYXN0ZXIgbWF0cml4LlxyXG5cdCAqL1xyXG5cdC8vIFB1YmxpYyBmdW5jdGlvbiB0byBpbml0aWFsbHkgY3JlYXRlIHNoaXBzIG9iamVjdFxyXG5cdGJ1aWxkU2hpcHM6IGZ1bmN0aW9uICgpe1xyXG5cdCAgICBmb3IgKGxldCBzIGluIHNoaXBzLnNoaXBfY29uZmlnKXtcclxuXHRcdHNoaXBzW3NdID0ge3NpemU6IHNoaXBzLnNoaXBfY29uZmlnW3NdLnNpemUsIFxyXG5cdFx0XHQgICAgdHlwZTogc2hpcHMuc2hpcF9jb25maWdbc10uaWQsXHJcblx0XHRcdCAgICBjb2xvcjogc2hpcHMuc2hpcF9jb25maWdbc10uY29sb3IsXHJcblx0XHRcdCAgICBjbGlja0NsYXNzOiBzaGlwcy5zaGlwX2NvbmZpZ1tzXS5jbGlja0NsYXNzLFxyXG5cdFx0XHQgICAgbGFiZWw6IHNoaXBzLnNoaXBfY29uZmlnW3NdLmxhYmVsXHJcblx0XHRcdCAgIH07XHJcblx0ICAgIH1cclxuXHRyZXR1cm4gc2hpcHM7XHJcblx0fSxcclxuXHJcblx0YnVpbGRTaGlwOiBmdW5jdGlvbih0eXBlKXtcclxuXHRcdHNoaXBzW3R5cGVdID0gc2hpcHMuc2hpcChzaGlwcy5zaGlwX2NvbmZpZ1t0eXBlXS5zaXplLCBzaGlwcy5zaGlwX2NvbmZpZ1t0eXBlXS5pZCwgc2hpcHMuc2hpcF9jb25maWdbdHlwZV0uY29sb3IsIHNoaXBzLnNoaXBfY29uZmlnW3R5cGVdLmNsaWNrQ2xhc3MsIHNoaXBzLnNoaXBfY29uZmlnW3R5cGVdLmxhYmVsKTtcclxuXHRcdHJldHVybiBzaGlwcztcclxuXHR9LFxyXG5cclxuXHQvLyBTZXQgdmFsdWUgaW4gc2hpcCBvYmplY3QuIFxyXG5cdHNldFNoaXA6IGZ1bmN0aW9uKHR5cGUsIGtleSwgdmFsdWUpe1xyXG5cdFx0aWYgKHR5cGUgJiYgc2hpcHNbdHlwZV0gJiYga2V5KSB7IC8vIG9ubHkgYXR0ZW1wdCBhbiB1cGRhdGUgaWYgdGhlcmUgaXMgYSBsZWdpdCBzaGlwIHR5cGUgYW5kIGEga2V5XHJcblx0XHQgICAgc2hpcHNbdHlwZV0ua2V5ID0gdmFsdWU7XHJcblx0ICAgfVxyXG5cdH0sXHJcblxyXG5cdC8vIFJldHVybiBzaGlwIG9iamVjdCBpZiBubyB0eXBlIGdpdmVuIG90aGVyd2lzZSByZXR1cm4gb2JqZWN0IGNvbnRhaW5pbmcganVzdCByZXF1ZXN0ZWQgc2hpcFxyXG5cdGdldFNoaXA6IGZ1bmN0aW9uICh0eXBlKXtcclxuXHQgICAgaWYodHlwZSl7XHJcblx0XHRyZXR1cm4gc2hpcHNbdHlwZV07XHJcblx0ICAgIH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gc2hpcHMuc2hpcF9jb25maWc7XHJcblx0ICAgIH1cclxuXHR9LFxyXG5cclxuXHQvLyBQcml2YXRlIGZ1bmN0aW9uIHRvIHJhbmRvbWx5IGRldGVybWluZSBzaGlwJ3Mgb3JpZW50YXRpb24gYWxvbmcgdGhlIFgtYXhpcyBvciBZLWF4aXMuIE9ubHkgdXNlZCB3aGVuIHBsb3R0aW5nIHNoaXBzIGZvciB0aGUgZmlyc3QgdGltZS5cclxuXHRnZXRTdGFydENvb3JkaW5hdGU6IGZ1bmN0aW9uKHNpemUpe1xyXG5cdCAgICBjb25zdCBzdGFydF9vcmllbnRhdGlvbj1NYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTApID4gNSA/ICd4JyA6ICd5JztcclxuXHQgICAgY29uc3Qgc3RhcnRfeCA9IHN0YXJ0X29yaWVudGF0aW9uID09ICd4JyA/IHNoaXBzLmdldFJhbmRvbUNvb3JkaW5hdGUoc2l6ZSkgOiBzaGlwcy5nZXRSYW5kb21Db29yZGluYXRlKDApO1xyXG5cdCAgICBjb25zdCBzdGFydF95ID0gc3RhcnRfb3JpZW50YXRpb24gPT0gJ3knID8gc2hpcHMuZ2V0UmFuZG9tQ29vcmRpbmF0ZShzaXplKSA6IHNoaXBzLmdldFJhbmRvbUNvb3JkaW5hdGUoMCk7XHJcblxyXG5cdCAgICByZXR1cm4ge2Nvb3JkaW5hdGU6IHN0YXJ0X3ggKyAnXycgKyBzdGFydF95LCBvcmllbnRhdGlvbjogc3RhcnRfb3JpZW50YXRpb259O1xyXG5cdH0sXHJcblxyXG5cdC8vIFRha2Ugc2hpcCBzaXplIGFuZCBvcmllbnRhdGlvbiBpbnRvIGFjY291bnQgd2hlbiBkZXRlcm1pbmluZyB0aGUgc3RhcnQgcmFuZ2UgdmFsdWUuIGV4LiBkb24ndFxyXG5cdC8vIGxldCBhbiBhaXJjcmFmdCBjYXJyaWVyIHdpdGggYW4gb3JpZW50YXRpb24gb2YgJ1gnIHN0YXJ0IGF0IHJvdyA3IGJlY2F1c2UgaXQgd2lsbCBtYXggb3V0IG92ZXIgdGhlXHJcblx0Ly8gZ3JpZCBzaXplLlxyXG5cdGdldFJhbmRvbUNvb3JkaW5hdGU6IGZ1bmN0aW9uKG9mZnNldCl7XHJcblx0ICAgIGNvbnN0IE1BWF9DT09SRCA9IDEwO1xyXG5cdCAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKihNQVhfQ09PUkQgLSBvZmZzZXQpKTtcclxuXHR9LFxyXG5cclxuXHQvLyBGSVhNRSBEb2VzIGZsZWV0Lmdob3N0U2hpcCBkbyB0aGlzIG5vdz9cclxuXHQvLyBCdWlsZCBhbiBhcnJheSBvZiBjb29yZGluYXRlcyBmb3IgYSBzaGlwIGJhc2VkIG9uIGl0J3Mgb3JpZW50YXRpb24sIGludGVuZGVkIHN0YXJ0IHBvaW50IGFuZCBzaXplXHJcblx0LypcclxuXHRfc2hpcFN0cmluZzogZnVuY3Rpb24ocykge1xyXG5cdFx0Y29uc3QgbyA9IHMub3JpZW50YXRpb247XHJcblx0XHRjb25zdCBzdCA9IHMuc3RhcnRfY29vcmRpbmF0ZTtcclxuXHRcdGxldCByID0gbmV3IEFycmF5O1xyXG5cdFx0bGV0IHRfcGllY2VzID0gc3Quc3BsaXQoJ18nKTtcclxuXHRcdGNvbnN0IGkgPSBvID09ICd4JyA/IDAgOiAxO1xyXG5cclxuXHRcdGZvciAobGV0IGo9MDsgaiA8IHMuc2l6ZTtqKyspIHtcclxuXHRcdFx0dF9waWVjZXNbaV0gPSB0X3BpZWNlc1tpXSsxO1xyXG5cdFx0XHRyLnB1c2ggKHRfcGllY2VzWzBdICsgJ18nICsgdF9waWVjZXNbMV0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHI7XHJcblx0fSxcclxuXHQqL1xyXG5cclxuXHQvKlxyXG5cdCAqIHBsYWNlU2hpcHMgLSBJbml0aWFsIHBsYWNlbWVudCBvZiBzaGlwcyBvbiB0aGUgYm9hcmRcclxuXHQgKi9cclxuXHRwbGFjZVNoaXBzOiBmdW5jdGlvbiAoKXtcclxuXHRcdC8qIFJhbmRvbWx5IHBsYWNlIHNoaXBzIG9uIHRoZSBncmlkLiBJbiBvcmRlciBkbyB0aGlzIGVhY2ggc2hpcCBtdXN0OlxyXG5cdFx0ICogICAqIFBpY2sgYW4gb3JpZW50YXRpb25cclxuXHRcdCAqICAgKiBQaWNrIGEgc3RhcnRpbmcgY29vcmRpbmF0ZVxyXG5cdFx0ICogICAqIFZhbGlkYXRlIHRoYXQgdGhlIGNvb3JkaW5hdGUgaXMgdmFsaWQgKGRvZXMgbm90IHJ1biBPT0IsIGRvZXMgbm90IGNyb3NzIGFueSBvdGhlciBzaGlwLCBldGMuKVxyXG5cdFx0ICogICAqIElmIHZhbGlkOlxyXG5cdFx0ICogICBcdCogU2F2ZSBzdGFydCBjb29yZCBhbmQgb3JpZW50YXRpb24gYXMgcGFydCBvZiBzaGlwIG9iamVjdFxyXG5cdFx0ICogICBcdCogUGxvdCBzaGlwIG9uIG1hc3RlciBtYXRyaXhcclxuXHRcdCAqL1xyXG5cdFx0bGV0IHNoaXBMaXN0ID0gc2hpcHMuZ2V0U2hpcCgpO1xyXG5cdFx0Zm9yICh2YXIgc2hpcCBpbiBzaGlwTGlzdCkge1xyXG5cdFx0ICAgIFxyXG5cdFx0ICAgIGxldCBzdGFydCA9IHNoaXBzLmdldFN0YXJ0Q29vcmRpbmF0ZShzaGlwTGlzdFtzaGlwXS5zaXplKTsgXHJcblx0XHQgICAgbGV0IHNoaXBfc3RyaW5nID0gZmxlZXQuZ2hvc3RTaGlwKHNoaXAsIHN0YXJ0LmNvb3JkaW5hdGUsIHN0YXJ0Lm9yaWVudGF0aW9uKTtcclxuXHRcdCAgICBzaGlwTGlzdFtzaGlwXS5vcmllbnRhdGlvbiA9IHN0YXJ0Lm9yaWVudGF0aW9uO1xyXG5cclxuXHRcdCAgICB3aGlsZSAoIWZsZWV0LnZhbGlkYXRlU2hpcChzaGlwX3N0cmluZykpIHtcclxuXHRcdFx0c3RhcnQgPSBzaGlwcy5nZXRTdGFydENvb3JkaW5hdGUoc2hpcExpc3Rbc2hpcF0uc2l6ZSk7IFxyXG5cdFx0XHRzaGlwTGlzdFtzaGlwXS5vcmllbnRhdGlvbiA9IHN0YXJ0Lm9yaWVudGF0aW9uO1xyXG5cdFx0XHRzaGlwX3N0cmluZyA9IGZsZWV0Lmdob3N0U2hpcChzaGlwLCBzdGFydC5jb29yZGluYXRlLCBzdGFydC5vcmllbnRhdGlvbik7XHJcblx0XHRcdH1cclxuXHJcblx0XHQgICAgZmxlZXQuc2V0RmxlZXQoc3RhcnQub3JpZW50YXRpb24sXHJcblx0XHRcdCAgICAgICBzaGlwLFxyXG5cdFx0XHQgICAgICAgc2hpcExpc3Rbc2hpcF0uc2l6ZSxcclxuXHRcdFx0ICAgICAgIHN0YXJ0LmNvb3JkaW5hdGUpO1xyXG5cdFx0ICAgIH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKiogcGxheWVyLmpzICoqKi9cclxubGV0IHBsYXllciA9IHtcclxuXHRwbGF5ZXJSb3N0ZXI6IG5ldyBPYmplY3QsIC8vIFBsYWNlaG9sZGVyIGZvciBhbGwgcGxheWVycyBpbiB0aGUgZ2FtZVxyXG5cdHBsYXllck9yZGVyOiBbXSwgLy8gT3JkZXIgb2YgcGxheWVyIHR1cm5cclxuXHRtZTogdW5kZWZpbmVkLFxyXG5cdG9yZGVySW5kZXg6IDAsXHJcblx0ZmxvdzogWydyZWdpc3RlcicsJ2dhbWUnXSxcclxuXHRjdXJyZW50RmxvdzogdW5kZWZpbmVkLFxyXG5cclxuXHRjYW5Nb3ZlOiBmdW5jdGlvbigpIHtcclxuXHRcdGlmIChwbGF5ZXIucGxheWVyT3JkZXIubGVuZ3RoID4gbW92ZS5nZXRNb3ZlU2l6ZSgpKSByZXR1cm4gdHJ1ZTtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9LFxyXG5cclxuXHQvLyBSZWdpc3RlciBoYW5kbGVcclxuXHRyZWdpc3RlcjogZnVuY3Rpb24oaGFuZGxlKXtcclxuXHRcdHBsYXllci5tZSA9IGhhbmRsZTsgLy8gU2VsZiBpZGVudGlmeSB0aGluZXNlbGZcclxuXHRcdC8vIFRPRE8gLSBjYWxsIG91dCB0byB0aGUgcmVnaXN0cmF0aW9uIHNlcnZpY2UgYW5kIGdldCBiYWNrIGhhbmRsZSBhbmQgdHVybiBvcmRlci4gVGhpc1xyXG5cdFx0Ly8gc3RydWN0dXJlIHJlcHJlc2VudHMgdGhlIHJldHVybiBjYWxsIGZyb20gdGhlIHJlZ2lzdHJhdGlvbiBzZXJ2aWNlLlxyXG5cdFx0Y29uc3QgcmVnID0ge1xyXG5cdFx0XHQgICAgICBoYW5kbGU6ICdlbHNwb3JrbycsXHJcblx0XHRcdCAgICAgIG9yZGVyOiAwXHJcblx0XHR9O1xyXG5cclxuXHRcdHBsYXllci5wbGF5ZXJPcmRlcltyZWcub3JkZXJdID0gcmVnLmhhbmRsZTtcclxuXHRcdHBsYXllci5nYW1lRmxvdygpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH0sXHJcblxyXG5cdC8vQWNjZXB0IHJlZ2lzdHJhdGlvbiBmcm9tIG90aGVyIHBsYXllcnNcclxuXHRhY2NlcHRSZWc6IGZ1bmN0aW9uKGhhbmRsZSwgb3JkZXIpe1xyXG5cdFx0cGxheWVyLnBsYXllck9yZGVyW29yZGVyXSA9IGhhbmRsZTtcclxuXHRcdHBsYXllci5wbGF5ZXJSb3N0ZXIgPSB7XHJcblx0XHRcdFtoYW5kbGVdOiB7cGdyaWQ6IGZsZWV0LmJ1aWxkTmF1dGljYWxDaGFydH1cclxuXHRcdH1cclxuXHRcdGxldCBwZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXJHcmlkJykuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpOztcclxuXHRcdFxyXG5cdFx0cGcuaWQ9aGFuZGxlO1xyXG5cdFx0cGcuaW5uZXJIVE1MPWhhbmRsZTtcclxuXHJcblx0XHRwZy5hcHBlbmRDaGlsZChncmlkLmNsaWNrYWJsZUdyaWQoMTAsIDEwLCBoYW5kbGUpKTtcclxuXHR9LFxyXG5cclxuXHRteVR1cm46IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIChwbGF5ZXIuY3VycmVudFBsYXllcigpID09IHBsYXllci5tZSkgPyAxIDogMDtcclxuXHR9LFxyXG5cclxuXHRuZXh0UGxheWVyOiBmdW5jdGlvbigpIHtcclxuXHRcdHBsYXllci5vcmRlckluZGV4ID0gKHBsYXllci5vcmRlckluZGV4ID09IHBsYXllci5wbGF5ZXJPcmRlci5sZW5ndGggLSAxKSA/ICAwIDogcGxheWVyLm9yZGVySW5kZXgrMTtcclxuXHRcdHJldHVybjtcclxuXHR9LFxyXG5cclxuXHRjdXJyZW50UGxheWVyOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHBsYXllci5wbGF5ZXJPcmRlcltwbGF5ZXIub3JkZXJJbmRleF07XHJcblx0fSxcclxuXHJcblx0Z2FtZUZsb3c6IGZ1bmN0aW9uKCl7XHJcblx0XHRpZiAocGxheWVyLmN1cnJlbnRGbG93ICE9IHVuZGVmaW5lZCl7XHJcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBsYXllci5mbG93W3BsYXllci5jdXJyZW50Rmxvd10pLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xyXG5cdFx0XHRwbGF5ZXIuY3VycmVudEZsb3crKztcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHBsYXllci5jdXJyZW50RmxvdyA9IDA7XHJcblx0XHR9XHJcblx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwbGF5ZXIuZmxvd1twbGF5ZXIuY3VycmVudEZsb3ddKS5zdHlsZS5kaXNwbGF5PSdpbmxpbmUnO1xyXG5cdH0sXHJcblxyXG5cdHNldE1vdmU6IGZ1bmN0aW9uKG0pe1xyXG5cdFx0cmV0dXJuIG1vdmUuc2V0TW92ZShtKTtcclxuXHR9LFxyXG59XHJcblxyXG4vKioqIG1vdmUuanMgKioqL1xyXG5sZXQgbW92ZSA9IHtcclxuXHRtb3ZlTGlzdDogW10sXHJcblx0bW92ZU1hcDoge30sXHJcblxyXG5cdGRlbGV0ZU1vdmU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Y2xlYXJNb3ZlTGlzdDogZnVuY3Rpb24oKSB7XHJcblx0XHRtb3ZlLm1vdmVMaXN0ID0gW107XHJcblx0fSxcclxuXHJcblx0LypcclxuXHQgKiBDcmVhdGUgYSBibG9jayB0byB2aXN1YWxseSByZXByZXNlbnQgYSBtb3ZlLiBHZW5lcmljIEhUTUwgYmxvY2sgZm9yIG1vdmUgb2JqZWN0czpcclxuXHQgKiA8ZGl2IGlkPTx0eXBlPl88cGxheWVyPl88Y29vcmRzPiBjbGFzcz1cIm1vdmVcIj5cclxuXHQgKiAgIDxkaXYgY2xhc3M9XCJtb3ZlRGV0YWlsXCI+XHJcblx0ICogICAgIGF0dGFjazogbWVnYW5fMF8wICgqIE1vdmUgdGV4dCAqKWBcclxuXHQgKiAgICAgPGRpdiBjbGFzcz1cImRlbGV0ZVwiPmRlbGV0ZTwvZGl2PiA8IS0tIGVsZW1lbnQgdG8gZGVsZXRlIG1vdmUgYmVmb3JlIHN1Ym1pdHRlZCAtLT5cclxuXHQgKiAgIDwvZGl2PlxyXG5cdCAqIDwvZGl2PlxyXG5cdCAqIFxyXG5cdCAqL1xyXG5cdG1vdmVMaXN0QmxvY2s6IGZ1bmN0aW9uKG0pIHtcclxuXHRcdGxldCBtb3ZlU3RydWN0PXt9O1xyXG5cdFx0bGV0IG12ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0XHRtb3ZlU3RydWN0LmlkID0gbXYuaWQgPSBtLnR5cGUgKyAnXycgKyBtLmNvb3JkaW5hdGU7XHJcblx0XHRtdi5jbGFzc05hbWUgPSAnbW92ZSc7XHJcblxyXG5cdFx0bXYuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCd0cnVlJyk7XHJcblx0XHRtb3ZlLm1vdmVPcmRlckhhbmRsZXIobXYpO1xyXG5cclxuXHRcdGxldCBtb3ZlU3RyaW5nID0gbS50eXBlICsgJzogJyArIG0uY29vcmRpbmF0ZTtcclxuXHRcdGxldCBtZHRsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0XHRtZHRsLmlubmVySFRNTD1tb3ZlU3RyaW5nO1xyXG5cclxuXHRcdGxldCBtZGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0XHRtZGVsLmlubmVySFRNTD0nRGVsZXRlJztcclxuXHRcdG1kZWwuaWQgPSAnZGVsXycgKyBtdi5pZDtcclxuXHRcdG1vdmUuc2V0X212TGlzdGVuZXJzKG12KTtcclxuXHJcblx0XHRtdi5hcHBlbmRDaGlsZChtZHRsKTtcclxuXHRcdG12LmFwcGVuZENoaWxkKG1kZWwpO1xyXG5cdFx0XHJcblx0XHRtb3ZlU3RydWN0LmRvbSA9IG12O1xyXG5cdFx0bW92ZVN0cnVjdC50eXBlID0gbS50eXBlO1xyXG5cdFx0Ly8gc3RvcmUgY3VycmVudCBzaGlwIGNvb3JkaW5hdGUgc3RyaW5nIHNvIHRoYXQgd2hlbiBhIG1vdmUgaXMgZGVsZXRlZCBpdCB3aWxsIGJlIHJlc3RvcmVkIHRvIGl0J3MgcHJpb3IgbG9jYXRpb25cclxuXHRcdG1vdmVTdHJ1Y3QuZ2hvc3QgPSBtLmdob3N0O1xyXG5cdFx0bW92ZVN0cnVjdC5vcmllbnRhdGlvbiA9IG0ub3JpZW50YXRpb247XHJcblx0XHRtb3ZlU3RydWN0LnNoaXBUeXBlID0gbS5zaGlwVHlwZTtcclxuXHRcdG1vdmVTdHJ1Y3Quc2l6ZSA9IG0uc2hpcFNpemU7XHJcblx0XHRtb3ZlU3RydWN0LnVuZG8gPSBtLnVuZG8gfHwgdW5kZWZpbmVkO1xyXG5cclxuXHRcdHJldHVybiBtb3ZlU3RydWN0O1xyXG5cdH0sXHJcblxyXG5cdC8vIEFkZCBkZWxldGUgbW92ZSBmdW5jdGlvblxyXG5cdHNldF9tdkxpc3RlbmVyczogZnVuY3Rpb24obXYpe1xyXG5cdFx0bXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGxldCBtID0gbW92ZS5nZXRNb3ZlKG12KTtcclxuXHRcdFx0Ly8gQ2hlY2sgdG8gc2VlIGlmIGFub3RoZXIgc2hpcCBpcyBpbiB0aGUgcGF0aCBvZiB0aGUgYXR0ZW1wdGVkIHJlc3RvcmVcclxuXHRcdFx0aWYgKG12LmlkLm1hdGNoKC9eYXR0YWNrLykgKXtcclxuXHRcdFx0XHRtb3ZlLmRlbGV0ZV9tb3ZlKG12KTtcclxuXHRcdFx0fSBlbHNlIGlmIChmbGVldC52YWxpZGF0ZVNoaXAobS51bmRvLCBtLnNoaXBUeXBlICkpIHtcclxuXHRcdFx0XHRtb3ZlLmRlbGV0ZV9tb3ZlKG12KTtcclxuXHRcdFx0XHQvLyBSZXBhaW50IHRoZSBvcmlnaW5hbCBzaGlwXHJcblx0XHRcdFx0Z3JpZC5kaXNwbGF5U2hpcChtLnNoaXBUeXBlKTtcclxuXHRcdFx0XHRmbGVldC5zZXRGbGVldCAobS5vcmllbnRhdGlvbiwgbS5zaGlwVHlwZSwgc2hpcHMuZ2V0U2hpcChtLnNoaXBUeXBlKS5zaXplLCBtLmdob3N0WzBdLCAwKTsgXHJcblx0XHRcdFx0Z3JpZC5kaXNwbGF5U2hpcChtLnNoaXBUeXBlKTtcclxuXHRcdFx0fVxyXG5cdFx0fSkpO1xyXG5cdH0sXHJcblxyXG5cdGRlbGV0ZV9tb3ZlOiBmdW5jdGlvbihtdil7XHJcblx0XHQvLyBSZW1vdmUgdGhlIGRpdlxyXG5cdFx0Ly8gTmVlZCB0byBrbm93IHBhcmVudCBlbGVtZW50IHdoaWNoLCBmb3IgZXZlcnl0aGluZyBpbiB0aGUgbW92ZSBsaXN0LCBpcyB0aGUgZWxlbWVudCB3aG9zZSBpZCBpcyBwbGF5T3JkZXJcclxuXHRcdGxldCBwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXlPcmRlcicpO1xyXG5cdFx0bGV0IGRtdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG12LmlkKTtcclxuXHRcdHAucmVtb3ZlQ2hpbGQoZG12KTtcclxuXHJcblx0XHQvLyBEZWxldGUgdGhlIGVudHJ5IGZyb20gdGhlIGFycmF5XHJcblx0XHRtb3ZlLm1vdmVMaXN0LnNwbGljZShtb3ZlLmdldE1vdmUobXYpLDEpO1xyXG5cdFx0LypcclxuXHRcdGZvciAobGV0IGwgaW4gbW92ZS5tb3ZlTGlzdCkge1xyXG5cdFx0XHRpZihtb3ZlLm1vdmVMaXN0W2xdLmlkID09IG12LmlkKXtcclxuXHRcdFx0XHRtb3ZlLm1vdmVMaXN0LnNwbGljZShsLDEpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQqL1xyXG5cclxuXHR9LFxyXG5cclxuXHRnZXRNb3ZlOiBmdW5jdGlvbiAobXYpe1xyXG5cdFx0Zm9yIChsZXQgbCBpbiBtb3ZlLm1vdmVMaXN0KSB7XHJcblx0XHRcdGlmKG1vdmUubW92ZUxpc3RbbF0uaWQgPT0gbXYuaWQpe1xyXG5cdFx0XHRcdHJldHVybiBtb3ZlLm1vdmVMaXN0W2xdXHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyBTZXQgdXAgZHJhZyBkcm9wIGZ1bmN0aW9uYWxpdHkgZm9yIHNldHRpbmcgbW92ZSBvcmRlclxyXG5cdG1vdmVPcmRlckhhbmRsZXI6IGZ1bmN0aW9uKHBvKSB7XHJcblx0ICAgIHBvLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsKGZ1bmN0aW9uKGUpe1xyXG5cdFx0ICAgIGUuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQ9J21vdmUnO1xyXG5cdFx0ICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsXHJcblx0XHRcdEpTT04uc3RyaW5naWZ5KHtcclxuXHRcdFx0XHRjaGFuZ2VNb3ZlOiBlLnRhcmdldC5pZFxyXG5cdFx0XHR9KVxyXG5cdFx0ICAgICk7XHJcblx0ICAgIH0pKTtcclxuXHQgICAgcG8uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLChmdW5jdGlvbihlKXtcclxuXHRcdFx0ICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0ICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3Q9J21vdmUnO1xyXG5cdFx0XHQgICAgcmV0dXJuIGZhbHNlO1xyXG5cdCAgICB9KSk7XHJcblx0ICAgIHBvLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLChmdW5jdGlvbihlKXtcclxuXHRcdFx0ICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdCAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdCAgICBsZXQgZHJvcE9iaiA9IEpTT04ucGFyc2UoZS5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvcGxhaW5cIikpO1xyXG5cdFx0XHQgICAgbW92ZS5hbHRlck1vdmVJbmRleChkcm9wT2JqLmNoYW5nZU1vdmUsIGUudGFyZ2V0LmlkKTtcclxuXHRcdFx0ICAgIHJldHVybiBmYWxzZTtcclxuXHQgICAgfSkpO1xyXG5cdH0sXHJcblxyXG5cdGFsdGVyTW92ZUluZGV4OiBmdW5jdGlvbihzdGFydEluZGV4LCBlbmRJbmRleCl7XHJcblx0XHRsZXQgc3RhcnRJZCA9IHN0YXJ0SW5kZXg7XHJcblx0XHRzdGFydEluZGV4ID0gcGFyc2VJbnQobW92ZS5tb3ZlTWFwW3N0YXJ0SW5kZXhdKTtcclxuXHRcdGVuZEluZGV4ICAgPSBwYXJzZUludChtb3ZlLm1vdmVNYXBbZW5kSW5kZXhdKTtcclxuXHJcblx0XHRsZXQgYmVnaW4gPSBzdGFydEluZGV4IDwgZW5kSW5kZXggPyBwYXJzZUludChzdGFydEluZGV4LCAxMCkgOiBwYXJzZUludChlbmRJbmRleCwgMTApO1xyXG5cdFx0bGV0IGVuZCA9ICAgc3RhcnRJbmRleCA8IGVuZEluZGV4ID8gcGFyc2VJbnQoZW5kSW5kZXgsIDEwKSA6IHBhcnNlSW50KHN0YXJ0SW5kZXgsIDEwKTtcclxuXHRcdGxldCBob2xkID0gbW92ZS5tb3ZlTGlzdFtzdGFydEluZGV4XTtcclxuXHJcblx0XHR3aGlsZShiZWdpbiA8IGVuZCl7XHJcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1vdmUubW92ZUxpc3RbYmVnaW5dLmlkKS5hcHBlbmRDaGlsZCgobW92ZS5tb3ZlTGlzdFtiZWdpbisxXSkpO1xyXG5cdFx0XHRtb3ZlLm1vdmVMaXN0W2JlZ2luXSA9IG1vdmUubW92ZUxpc3RbYmVnaW4rMV07XHJcblx0XHRcdG1vdmUubW92ZU1hcFtzdGFydElkXSA9IGJlZ2luKzE7XHJcblx0XHRcdGJlZ2luKys7XHJcblx0XHR9XHJcblx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChtb3ZlLm1vdmVMaXN0W2VuZF0uaWQpLmFwcGVuZENoaWxkKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkW2hvbGRdLmlkKTtcclxuXHRcdG1vdmUubW92ZUxpc3RbZW5kXSA9IGhvbGQ7XHJcblx0XHRtb3ZlLm1vdmVNYXBbc3RhcnRJZF0gPSBlbmQ7XHJcblx0fSxcclxuXHJcblx0cmVzb2x2ZU1vdmVzOiBmdW5jdGlvbiAoKXtcclxuXHRcdGxldCBwYXJlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheU9yZGVyJyk7XHJcblx0XHRjb25zb2xlLmxvZygnUmVzb2x2aW5nIG1vdmVzJyk7XHJcblx0XHRmb3IobGV0IG0gaW4gbW92ZS5tb3ZlTGlzdCkge1xyXG5cdFx0XHRsZXQgbXYgPSBtb3ZlLm1vdmVMaXN0W21dO1xyXG5cdFx0XHRjb25zb2xlLmxvZygnbW92ZTogJywgbXYpO1xyXG5cdFx0XHRzd2l0Y2gobXYudHlwZSkge1xyXG5cdFx0XHRcdGNhc2UgJ2F0dGFjayc6IFxyXG5cdFx0XHRcdFx0Z3JpZC5hdHRhY2tQbGF5ZXIobXYuY29vcmRpbmF0ZSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlICdtaW5lJzpcclxuXHRcdFx0XHRcdGdyaWQuc2V0TWluZShtdi5jb29yZGluYXRlKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ21vdmUnOlxyXG5cdFx0XHRcdFx0Z3JpZC5tb3ZlU2hpcCgpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAncGl2b3QnOlxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdGxldCBjaGlsZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG12LmlkKTtcclxuXHRcdHBhcmVudC5yZW1vdmVDaGlsZChjaGlsZCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0bW92ZVNoaXA6IGZ1bmN0aW9uKCl7XHJcblx0XHQvLyBDaGVjayBmb3IgbWluZXMgYmFzZWQgb24gZ2hvc3QgLSBzZW5kIG1lc3NhZ2UgdG8gbWluZSBzZXJ2aWNlXHJcblx0XHRsZXQgYmxhc3RBdCA9IGdyaWQuY2hlY2tfZm9yX21pbmUobW92ZS5naG9zdCk7XHJcblx0XHRpZiAoYmxhc3RBdCAhPSBmYWxzZSl7XHJcblx0XHRcdC8vIFJlc2V0IGdob3N0IGlmIG1pbmUgZm91bmQgLSBJZiBhIG1pbmUgaGFzIGJlZW4gZW5jb3VudGVyZWQgdGhlbiB0aGUgc2hpcCBvbmx5IG1vdmVzIHRvIHRoZSBwb2ludCBvZiB0aGUgYmxhc3RcclxuXHRcdFx0Z3JpZC5yZXNldEdob3N0KGJsYXN0QXQpO1xyXG5cdFx0XHQvLyBmaW5kIHdoaWNoIHNxdWFyZSBnb3QgaGl0XHJcblx0XHRcdGxldCB0YXJnZXQ7XHJcblx0XHRcdGZvcihsZXQgbSBpbiBtb3ZlLmdob3N0KXtcclxuXHRcdFx0XHRpZiAobW92ZS5naG9zdFttXSA9PSBibGFzdEF0KVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHRhcmdldD1tb3ZlLmdob3N0W21dO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHNoaXBzLnNldEhpdENvdW50ZXIobW92ZS5zaGlwVHlwZSwgbSsxKTtcclxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0KS5jbGFzc05hbWUgKz0nIHNoaXBIaXQnO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBmbCA9IGZsZWV0LmdldEZsZWV0KG1vdmUuc2hpcFR5cGUpO1xyXG5cdFx0bGV0IHMgPSBzaGlwcy5nZXRTaGlwKG1vdmUuc2hpcFR5cGUpO1xyXG5cclxuXHRcdGlmIChmbFswXSA9PSBtb3ZlLmdob3N0WzBdICYmIG1vdmUub3JpZW50YXRpb24gPT0gcy5vcmllbnRhdGlvbikgeyAvLyBjaGVjayBzdGFydGluZyBwb2ludHMgYW5kIG9yaWVudGF0aW9uIHNldCBhbmQgcmVkaXNwbGF5IG9ubHkgaWYgZGlmZmVyZW50XHJcblx0XHRcdC8vIFZhbGlkYXRlIG1vdmUgY2FuIGJlIG1hZGVcclxuXHRcdFx0aWYoZmxlZXQudmFsaWRhdGVTaGlwKG1vdmUuZ2hvc3QsIG1vdmUuc2hpcFR5cGUpKSB7XHJcblx0XHRcdFx0Z3JpZC5kaXNwbGF5U2hpcChzaGlwcywgbW92ZS5zaGlwVHlwZSk7XHJcblx0XHRcdFx0Ly8gU2V0IGdob3N0IHRvIE5hdXRpY2FsQ2hhcnQvTWFwXHJcblx0XHRcdFx0ZmxlZXQuc2V0RmxlZXQgKG1vdmUub3JpZW50YXRpb24sIG1vdmUuc2hpcFR5cGUsIHNoaXBzLmdldFNoaXAobW92ZS5zaGlwVHlwZSkuc2l6ZSwgbW92ZS5naG9zdFswXSwgMCk7IFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBEaXNwbGF5IG5ldyBzaGlwIGxvY2F0aW9uIGJhc2VkIG9uIE5hdXRpY2FsQ2hhcnQvTWFwXHJcblx0XHRcdGdyaWQuZGlzcGxheVNoaXAobW92ZS5zaGlwVHlwZSwgbW92ZS5naG9zdCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0cmVzZXRHaG9zdDogZnVuY3Rpb24oYmxhc3RBdCl7XHJcblx0XHRmb3IgKGxldCBpIGluIG1vdmUuZ2hvc3Qpe1xyXG5cdFx0XHRpZiAoYmxhc3RBdCA9PSBtb3ZlLmdob3N0W2ldKSBicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbW92ZS5naG9zdCA9IGZsZWV0Lmdob3N0U2hpcChtb3ZlLnR5cGUsIG1vdmUuZ2hvc3RbaV0sIG1vdmUub3JpZW50YXRpb24sIG1vdmUuZ2hvc3QubGVuZ3RoLCBpKTtcclxuXHR9LFxyXG5cclxuXHQvLyBTdHViIGZvciBtaW5lIGRldGVjdGlvblxyXG5cdGNoZWNrX2Zvcl9taW5lOiBmdW5jdGlvbiAoZyl7XHJcblx0XHRsZXQgbWluZUF0ID0geycwXzYnOiAxLCAnMV82JzogMSwgJzJfNic6IDEsICczXzYnOiAxLCAnNF82JzogMSwgJzVfNic6IDEsICc2XzYnOiAxLCAnN182JzogMSwgJzhfNic6IDEsICc5XzYnOiAxfTtcclxuXHRcdGZvcihsZXQgaSBpbiBnKSB7XHJcblx0XHRcdC8vIHJldHVybiBsb2NhdGlvbiB3aGVyZSBtaW5lIHN0cnVja1xyXG5cdFx0XHRpZihtaW5lQXRbZ1tpXV0gPT0gMSkgeyBcclxuXHRcdFx0XHRjb25zb2xlLmxvZygnQk9PTScpO1xyXG5cdFx0XHRcdHJldHVybiBnW2ldOyBcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0sXHJcblx0XHRcclxuXHJcblx0YXR0YWNrUGxheWVyOiBmdW5jdGlvbihjb29yZGluYXRlKXtcclxuXHRcdC8vIFNlbmQgYSBtZXNzYWdlIHJlcXVlc3RpbmcgaGl0L21pc3MgdmFsdWUgb24gZW5lbXkncyBncmlkXHJcblx0XHQvLyBJbmZvcm0gYWxsIG9mIGVuZW15J3MgY29vcmRpbmF0ZSBzdGF0dXNcclxuXHR9LFxyXG5cclxuXHRzZXRNaW5lOiBmdW5jdGlvbihjb29yZGluYXRlKXtcclxuXHRcdC8vIFNlbmQgYSBtZXNzYWdlIHJlcXVlc3RpbmcgaGl0L21pc3MgdmFsdWUgb24gZW5lbXkncyBncmlkXHJcblx0XHQvLyBJZiBub3QgYSBoaXQgcmVnaXN0ZXIgd2l0aCBzZXJ2aWNlIHRoYXQgbWluZSBwbGFjZWQgb24gZW5lbXkgZ3JpZFxyXG5cdH0sXHJcblxyXG5cdHNldE1vdmU6IGZ1bmN0aW9uKG0pe1xyXG5cdFx0aWYobW92ZS5tb3ZlTWFwW20uY29vcmRpbmF0ZV0gPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdG1vdmUubW92ZU1hcFttLmNvb3JkaW5hdGVdID0gbW92ZS5tb3ZlTGlzdC5sZW5ndGg7XHJcblx0XHRcdGxldCBtdiA9IG1vdmUubW92ZUxpc3RCbG9jayhtKTtcclxuXHRcdFx0bW92ZS5tb3ZlTGlzdC5wdXNoKG12KTtcclxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXlPcmRlcicpLmFwcGVuZENoaWxkKG12LmRvbSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Z2V0TW92ZVNpemU6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gbW92ZS5tb3ZlTGlzdC5sZW5ndGg7XHJcblx0fVxyXG59XHJcblxyXG4vKioqIGJhdHRsZXNoaXBPbmUuanMgKioqL1xyXG5cclxuZmxlZXQuaW5pdCgpO1xyXG5wbGF5ZXIuZ2FtZUZsb3coKTtcclxuXHJcbi8qIFJlZ2lzdGVyICovXHJcbi8vIFRPRE8gLSBhdHRhY2ggaGFuZGxlciB0aHJvdWdoIHB1ZzsgbW92ZSBoYW5kbGVycyB0byBhbm90aGVyIG1vZHVsZVxyXG5sZXQgcj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXInKTtcclxuci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuXHQgICAgcGxheWVyLnJlZ2lzdGVyKCk7XHJcblx0ICAgIC8vcmV0dXJuO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxubGV0IGY9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldEZsZWV0Jyk7XHJcbmYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBcclxuICAgIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldEZsZWV0Jykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllckdyaWQnKS5zdHlsZS5kaXNwbGF5PSdpbmxpbmUnO1xyXG5cdGdyaWQuc2V0TW92ZVNoaXAoKTsgXHJcblx0ICAgIHBsYXlHYW1lKCk7XHJcblx0ICAgIC8vcmV0dXJuO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxuLy8gU2V0IHVwIGxpbmsgdG8gcmVzb2x2ZSBtb3Zlc1xyXG5sZXQgZD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZG9Nb3ZlcycpO1xyXG5kLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxcclxuXHRmdW5jdGlvbigpe1xyXG5cdFx0Ly8gUmVzb2x2ZSBvcmRlcnNcclxuXHRcdG1vdmUucmVzb2x2ZU1vdmVzKCk7XHJcblx0XHQvLyBSZXNldCBtb3Zlc1xyXG5cdFx0bW92ZS5jbGVhck1vdmVMaXN0KCk7XHJcblx0XHQvLyBUdXJuIG1vdmVzIG92ZXIgdG8gdGhlIG5leHQgcGxheWVyXHJcblx0XHQvLyBGSVhNRSAtIFNpbXVsYXRpbmcgbW92ZXMgZm9yIG5vdy4gUmVtb3ZlIHdoZW4gcmVhZHkgZm9yIHJlYWxzaWVzXHJcblxyXG5cdH0sIGZhbHNlKTtcclxuLy8gU2V0IHVwIGdyaWRcclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ215R3JpZCcpLmFwcGVuZENoaWxkKGdyaWQuY2xpY2thYmxlR3JpZCgxMCwgMTApKTtcclxuXHJcbi8vIFNldCB1cCBkcmFnL2Ryb3Agb2YgbW92ZXNcclxuLy9kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheU9yZGVyJykuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCd0cnVlJyk7XHJcbi8vcGxheWVyLnBsYXllck9yZGVySGFuZGxlcigpO1xyXG5cclxuLyogU2V0IHJhbmRvbSBmbGVldCAqL1xyXG5zaGlwcy5idWlsZFNoaXBzKCk7XHJcbnNoaXBzLnBsYWNlU2hpcHMoKTtcclxubGV0IHdob2xlRmxlZXQgPSBmbGVldC5nZXRXaG9sZUZsZWV0KCk7XHJcbmZvciAobGV0IHQgaW4gd2hvbGVGbGVldCkge1xyXG5cdGdyaWQuZGlzcGxheVNoaXAodCk7XHJcbn1cclxuXHJcbi8qIFxyXG4gKiBNb2NrIGdhbWUgd2lsbCBiZSByZW1vdmVkIFxyXG4gKi9cclxubGV0IG0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnTWVnYW5SZWcnKTtcclxubS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIFxyXG4gICAgZnVuY3Rpb24oKXtcclxuICAgICAgICBwbGF5ZXIuYWNjZXB0UmVnKCdNZWdhbicsIDEpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdNZWdhblJlZycpLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xyXG4gICAgfSwgZmFsc2UpO1xyXG5cclxubGV0IHJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1J5YW5SZWcnKTtcclxucnkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBcclxuICAgIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcGxheWVyLmFjY2VwdFJlZygnUnlhbicsIDIpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdSeWFuUmVnJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XHJcbiAgICB9LCBmYWxzZSk7XHJcblxyXG5sZXQgdHIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnVHJhY2V5UmVnJyk7XHJcbnRyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXHJcbiAgICBmdW5jdGlvbigpe1xyXG4gICAgICAgIHBsYXllci5hY2NlcHRSZWcoJ1RyYWNleScsIDMpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdUcmFjZXlSZWcnKS5zdHlsZS5kaXNwbGF5PSdub25lJztcclxuICAgIH0sIGZhbHNlKTtcclxuXHJcbi8qIFBsYXkgZ2FtZSAqL1xyXG4vKlxyXG53aGlsZSAoMSkge1xyXG5cdHBsYXllci5nZXRUdXJuKCk7XHJcbn1cclxuKi9cclxuXHJcbmZ1bmN0aW9uIHBsYXlHYW1lKCl7XHJcblx0aWYgKHBsYXllci5teVR1cm4oKSl7XHJcblx0XHQvL3dpbmRvdy5vcGVuKCcnLCdhdHRhY2snLCAnaGVpZ2h0PTIwMCx3aWR0aD0yMDAsbWVudWJhcj1ubyxzdGF0dXM9bm8sdGl0bGViYXI9bm8sdG9vbGJhcj1ubycsIGZhbHNlICk7XHJcblx0fVxyXG59XHJcblxyXG4iXX0=
