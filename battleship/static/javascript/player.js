//let rabbit = require('./bs_RabbitMQ');
let fleet = require('./fleet.js');

let playerRoster = new Object; // Placeholder for all players in the game
let playerOrder = []; // Order of player turn

let me;
let orderIndex=0;

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
}

/*
 *  One consideration is for the registration service to provide a random number for order value so that player order is not
 *  necessarily FIFO. Also there is no guarantee that player order values will arrive in consecutive order so there needs to
 *  be a sort mechanism.
 */
let _populate_playerOrder = function(handle, order){
}

//Accept registration from other players
let acceptReg = function(handle, order){
	playerOrder[order] = handle;
	playerRoster = {
		[handle]: {grid: fleet.buildNauticalChart}
	}
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

let playerMove = function(){
}

module.exports = {
    register: register,
    acceptReg: acceptReg,
    myTurn: myTurn,
    currentPlayer: currentPlayer,
    nextPlayer: nextPlayer
}
