// Module to manage moves on player's turn.

let fleet = require('./fleet.js');

let moveList = [];
let moveMap = {};

let deleteMove = function(){
}

let clearMoveList = function() {
	moveList = [];
}

// Create a block to visually represent a move so it can be reordered if wanted
let moveListBlock = function(handle, moveText) {
	let b = document.createElement('div');
	b.id = handle;
	b.width = 100;
	b.height = 21;

	b.innerHTML=moveText;

        b.setAttribute('draggable','true');
	moveOrderHandler(b);
	return b;
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

let resolveMoves = function (){
	let parent = document.getElementById(gameDialog);
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
				break;
			case 'pivot':
				break;
		}
	let child = document.getElementById(move.coordinate);
	parent.removeChild(child);
	}
}

let attackPlayer = function(coordinate){
}

let setMine = function(coordinate){
}

let setMove = function(move){
	let moveString;
	if(moveMap[move.coordinate] == undefined) {
		moveMap[move.coordinate] = moveList.length;
		moveString = move.type + ': ' + move.coordinate;
		let b = moveListBlock(move.coordinate, moveString);
		moveList.push(b);
		document.getElementById('playOrder').appendChild(b);
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
    getMoveSize: getMoveSize
}
