//let rabbit = require('./bs_RabbitMQ');
let fleet = require('./fleet.js');

let playerRoster = new Object; // Placeholder for all players in the game
let playerOrder = []; // Order of player turn
let playerMove = [];
let playerMoveMap = {};

let me;
let orderIndex=0;
let flow=['register','game'];
let currentFlow;

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
	gameFlow();
	return;
}

//Accept registration from other players
let acceptReg = function(handle, order, grid, ships, fleet, player){
	playerOrder[order] = handle;
	playerRoster = {
		[handle]: {grid: fleet.buildNauticalChart}
	}
	let pg = document.getElementById('playerGrid').appendChild(document.createElement('div'));;
	
	//let pgd = pg.appendChild(document.createElement('div'));
	pg.id=handle;
	pg.innerHTML=handle;

	pg.appendChild(grid.clickableGrid(10, 10, ships, fleet, player, handle));
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

let gameFlow = function(){
	if (currentFlow != undefined){
		document.getElementById(flow[currentFlow]).style.display='none';
		currentFlow++;
	} else {
		currentFlow = 0;
	}
	document.getElementById(flow[currentFlow]).style.display='inline';
}

let setPlayerMove = function(move){
	let moveString;
	if(playerMoveMap[move.coordinate] == undefined) {
		playerMoveMap[move.coordinate] = playerMove.length;

		if (move.type == 'attack') {
			moveString = move.type + ': ' + move.coordinate;
		}

		let b = playerMoveBlock(move.coordinate, moveString);
		playerMove.push(b);
		document.getElementById('playOrder').appendChild(b);
	}
}

let deletePlayerMove = function(){
}

let playerCanMove = function() {
	if (playerOrder.length > playerMove.length) return true;

	return false;
}

let playerClearMove = function() {
	player = [];
}

// Create a block to visually represent a move so it can be reordered if wanted
let playerMoveBlock = function(handle, moveText) {
	let b = document.createElement('div');
	b.id = handle;
	b.width = 100;
	b.height = 21;

	b.innerHTML=moveText;

        b.setAttribute('draggable','true');
	playerOrderHandler(b);
	return b;
}

// Set up drag drop functionality for setting move order
let playerOrderHandler = function(po) {
    //document.getElementById('playOrder').setAttribute('draggable','true');
    //player.playerOrderHandlers();
    //let po = document.getElementById('playOrder');
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
	    	    displayMoveOrder();
                    return false;
    }));
}

function alterMoveIndex(startIndex, endIndex){
	startId = startIndex;
	startIndex = parseInt(playerMoveMap[startIndex]);
	endIndex   = parseInt(playerMoveMap[endIndex]);

	let begin = startIndex < endIndex ? parseInt(startIndex, 10) : parseInt(endIndex, 10);
	let end =   startIndex < endIndex ? parseInt(endIndex, 10) : parseInt(startIndex, 10);
	let hold = playerMove[startIndex];

	while(begin < end){
		document.getElementById(playerMove[begin].id).appendChild((playerMove[begin+1]));
		playerMove[begin] = playerMove[begin+1];
		playerMoveMap[startId] = begin+1;
		begin++;
	}
	document.getElementById(playerMove[end].id).appendChild(document.getElementById[hold].id);
	playerMove[end] = hold;
	playerMoveMap[startId] = end;
}

function displayMoveOrder(){
}

module.exports = {
    register: register,
    acceptReg: acceptReg,
    myTurn: myTurn,
    currentPlayer: currentPlayer,
    nextPlayer: nextPlayer,
    gameFlow: gameFlow,
    playerCanMove: playerCanMove,
    playerClearMove: playerClearMove,
    setPlayerMove: setPlayerMove,
    deletePlayerMove: deletePlayerMove,
    playerOrderHandler: playerOrderHandler
    //displayMoveOrder: displayMoveOrder;
}
