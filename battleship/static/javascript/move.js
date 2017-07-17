// Module to manage moves on player's turn.

let fleet = require('./fleet.js');

let moveList = [];
let moveMap = {};

let deleteMove = function(){
}

let clearMoveList = function() {
	moveList = [];
}

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
let moveListBlock = function(move) {
	let moveStruct={};
	let mv = document.createElement('div');
	moveStruct.id = mv.id = move.type + '_' + move.coordinate;
	mv.className = 'move';

	move.undo = fleet.ghostShip(move.shipType);

        mv.setAttribute('draggable','true');
	moveOrderHandler(mv);

	let moveString = move.type + ': ' + move.coordinate;
	let mdtl = document.createElement('div');
	mdtl.innerHTML=moveString;

	let mdel = document.createElement('div');
	mdel.innerHTML='Delete';
	mdel.id = 'del_' + mv.id;
	_set_mvListeners(mv, move);


	mv.appendChild(mdtl);
	mv.appendChild(mdel);
	
	moveStruct.dom = mv;
	moveStruct.type = move.type;
	// store current ship coordinate string so that when a move is deleted it will be restored to it's prior location
	moveStruct.ghost = move.ghost;
	moveStruct.orientation = move.orientation;
	moveStruct.shipType = move.shipType;
	moveStruct.size = move.shipSize;

	return moveStruct;
}

// Add delete move function
function _set_mvListeners(mv, move){
	mv.addEventListener('click', (function() {
		// Check to see if another ship is in the path of the attempted restore
		if (fleet.validateShip(move.undo, move.shipType, move.grid, move.ships)) {
			// Remove the div
			// Need to know parent element which, for everything in the move list, is the element whose id is playOrder
			let p = document.getElementById('playOrder');
			let dmv = document.getElementById(mv.id);
			p.removeChild(dmv);

			// Delete the entry from the array
			//moveList.push(mv);
			for (l in moveList) {
				if(moveList[l].id == mv.id){
					moveList.splice(l,1);
					break;
				}
			}

			// Repaint the original ship
			move.grid.displayShip(move.ships, move.shipType);
			move.grid.displayShip(move.ships, move.shipType, move.undo);
		}
	}));
}

// Set up drag drop functionality for setting move order
let moveOrderHandler = function(po) {
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
	    	    alterMoveIndex(dropObj.changeMove, e.target.id);
                    return false;
    }));
}

function alterMoveIndex(startIndex, endIndex){
	startId = startIndex;
	startIndex = parseInt(moveMap[startIndex]);
	endIndex   = parseInt(moveMap[endIndex]);

	let begin = startIndex < endIndex ? parseInt(startIndex, 10) : parseInt(endIndex, 10);
	let end =   startIndex < endIndex ? parseInt(endIndex, 10) : parseInt(startIndex, 10);
	let hold = moveList[startIndex];

	while(begin < end){
		document.getElementById(moveList[begin].id).appendChild((moveList[begin+1]));
		moveList[begin] = moveList[begin+1];
		moveMap[startId] = begin+1;
		begin++;
	}
	document.getElementById(moveList[end].id).appendChild(document.getElementById[hold].id);
	moveList[end] = hold;
	moveMap[startId] = end;
}

let resolveMoves = function (fleet, ships, grid){
	let parent = document.getElementById('playOrder');
	console.log('Resolving moves');
	for(m in moveList) {
		let move = moveList[m];
		console.log('move: ', move);
		switch(move.type) {
			case 'attack': 
				attackPlayer(move.coordinate);
				break;
			case 'mine':
				setMine(move.coordinate);
				break;
			case 'move':
				moveShip(fleet, ships, grid, move);
				break;
			case 'pivot':
				break;
		}
	let child = document.getElementById(move.id);
	parent.removeChild(child);
	}
}

let moveShip = function(fleet, ships, grid, move){
	// Check for mines based on ghost - send message to mine service
	let blastAt = _check_for_mine(move.ghost);
	if (blastAt != false){
		// Reset ghost if mine found - If a mine has been encountered then the ship only moves to the point of the blast
		_resetGhost(fleet, blastAt, move);
		// find which square got hit
		let target;
		for(m in move.ghost){
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
		grid.displayShip(ships, move.shipType, move.ghost);
	}
}

function _resetGhost(fleet, blastAt, move){
	for (i in move.ghost){
		if (blastAt == move.ghost[i]) break;
	}

	return move.ghost = fleet.ghostShip(move.type, move.ghost[i], move.orientation, move.ghost.length, i);
}

// Stub for mine detection
function _check_for_mine(g){
	let mineAt = {'0_6': 1, '1_6': 1, '2_6': 1, '3_6': 1, '4_6': 1, '5_6': 1, '6_6': 1, '7_6': 1, '8_6': 1, '9_6': 1};
	for(i in g) {
		// return location where mine struck
		if(mineAt[g[i]] == 1) { 
			console.log('BOOM');
			return g[i]; 
		}
	}
	return false;
}
	

let attackPlayer = function(coordinate){
	// Send a message requesting hit/miss value on enemy's grid
	// Inform all of enemy's coordinate status
}

let setMine = function(coordinate){
	// Send a message requesting hit/miss value on enemy's grid
	// If not a hit register with service that mine placed on enemy grid
}

let setMove = function(move){
	//let moveString;
	if(moveMap[move.coordinate] == undefined) {
		moveMap[move.coordinate] = moveList.length;
		//moveString = move.type + ': ' + move.coordinate;
		//let b = moveListBlock(move.coordinate, moveString);
		let mv = moveListBlock(move);
		moveList.push(mv);
		document.getElementById('playOrder').appendChild(mv.dom);
	}
}

let getMoveSize = function(){
	return moveList.length;
}

module.exports = {
    clearMoveList: clearMoveList,
    setMove: setMove,
    deleteMove: deleteMove,
    moveOrderHandler: moveOrderHandler,
    resolveMoves: resolveMoves,
    getMoveSize: getMoveSize,
}
