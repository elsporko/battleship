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

