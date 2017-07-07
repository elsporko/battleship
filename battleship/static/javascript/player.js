//let rabbit = require('./bs_RabbitMQ');
let fleet = require('./fleet.js');
let move = require('./move.js');

let playerRoster = new Object; // Placeholder for all players in the game
let playerOrder = []; // Order of player turn

let me;
let orderIndex=0;
let flow=['register','game'];
let currentFlow;

let canMove = function() {
	if (playerOrder.length > move.getMoveSize()) return true;

	return false;
}

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

let setMove = function(m){
	return move.setMove(m);
}

module.exports = {
    register: register,
    acceptReg: acceptReg,
    myTurn: myTurn,
    currentPlayer: currentPlayer,
    nextPlayer: nextPlayer,
    gameFlow: gameFlow,
    canMove: canMove,
    setMove: setMove
    //displayMoveOrder: displayMoveOrder;
}
