'use strict';
var fleet = require('./fleet.js');
var ships = require('./ships.js');
var player = require('./player.js');

let moveShip = function(ships, dropObj, ev, fleet, player){
    console.log('pre-set fleet move');
    let ship=ships.getShip(dropObj.type);
    // Remove initial image
    displayShip(ships, dropObj.type);

    fleet.setFleet (dropObj.orientation, dropObj.type, ship.size, ev.target.id, dropObj.offset); 

    // Redraw image in new location
    displayShip(ships, dropObj.type);
}

/*
 * Called after player sets initial fleet. Overwrite the moveShip function so it behaves different.
 */
let setMoveShip = function(){
	/* change value of moveShip function */
	moveShip = function(ships, dropObj, ev, fleet, player, dropShip, moveType){
	    console.log('In game move');
	    // Remove initial image
	    displayShip(ships, dropObj.type);

	    // draw image based on dropShip
	    displayShip(ships, dropObj.type, dropShip);

	    // Store ghostShip in move object
	    player.setMove({ type: moveType, 
		             coordinate: ev.target.id, 
		             ghost: dropShip,
		             orientation: dropObj.orientation, 
		             shipType: dropObj.type,
		             ships: ships, 
		             grid: grid, 
		             undo: fleet.ghostShip(dropObj.type) // Need to preserve the ship's position pre-move
	    });
	}
}

/*
 * Build the grid and attach handlers for drag/drop events
 */
let clickableGrid = function ( rows, cols, ships, fleet, player, phandle){
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
                _setMyListeners(cell, ships, fleet, player)
	    } else {
               _setPlayerListeners(player, cell, phandle);
	    }
        }
    }
    return gridTable;
}

function _setMyListeners(cell, ships, fleet, player){
            // Set up drag and drop for each cell.
            cell.setAttribute('draggable','true');


            cell.addEventListener('dragstart',(
                function(ev){
                    ev.dataTransfer.effectAllowed='move';
		    let type = _getTypeByClass(ships, this.className);
		    let ship = ships.getShip(type);

                    // Calculate which square was clicked to guide placement
                    let start = _find_start(this.id, ship.orientation, ship.size, type);
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
			    if(player.canMove()) {moveShip(ships, dropObj, ev, fleet, player, dropShip, 'move')};
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
		    let type = _getTypeByClass(ships, this.className);
		    let ship = ships.getShip(type);
                    let start = _find_start(e.target.id, ship.orientation, ship.size, type);
		    let orientation = (ship.orientation == 'x') ? 'y':'x'; // flip the orientation
		    //let ghost = fleet.ghostShip(type, e.target.id, orientation, ship.size, start.offset);
		    let ghost = fleet.ghostShip(type, e.target.id, orientation, ship.size, start.offset);

		    drop.type = type;
		    drop.offset = start.offset;
		    drop.orientation = orientation;

                    if(fleet.validateShip(ghost, type)) {
			if(player.canMove()) {
		            ship.orientation = orientation;
			    moveShip(ships, drop, e, fleet, player, ghost, 'pivot')};
                    }
                }));
}

function _setPlayerListeners(player, cell, handle){
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
}

/*
 * _find_start - Determine the starting coordinate of a ship given the square that was clicked. For example
 * it is possible that a battleship along the x-axis was clicked at location 3_3 but that was the second square
 * on the ship. This function will identify that the battleship starts at 2_3.
 */

function _find_start(start_pos, orientation, size, type){
    let index = (orientation == 'x') ? 0 : 1;

    let pieces=start_pos.split('_');
    let offset = 0;

    for (let i=0; i < size; i++) {
	if (pieces[index] == 0) {break;}
        pieces[index]--;
	let g = fleet.checkGrid(pieces[0] + '_' + pieces[1]);
        //if (g != undefined && g == type && g != false){
        if (g == type && g != false){
	    offset++;
            start_pos = pieces[0] + '_' + pieces[1];
        } else {
            break;
        }
    }

    return {start_pos: start_pos, offset: offset};
}

let displayShip = function (ships, type, c) {
    let coordinates = c || fleet.getFleet(type);
    let ship = ships.getShip(type);

    for (let coord in coordinates) {
        _setSpace(coordinates[coord], ship.clickClass);
    }
}

function _setSpace(space, className) {
    var b = document.getElementById(space); 
    b.classList.toggle(className);
}

function _getTypeByClass(ships, className){
	let shipList = ships.getShip();
	for (let s in shipList){
		if (className.match(shipList[s].clickClass)){
			return shipList[s].type;
		}
	}
}

module.exports = {
    clickableGrid: clickableGrid,
    displayShip: displayShip,
    setMoveShip: setMoveShip,
}

