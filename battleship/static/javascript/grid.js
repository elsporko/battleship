let fleet = require('./fleet');
let ships = require('./ships');

/*
 * Build the grid and attach handlers for drag/drop events
 */
let clickableGrid = function ( rows, cols, ships, fleet){
    let grid = document.createElement('table');
    grid.className='grid';
    for (var r=0;r<rows;++r){
        var tr = grid.appendChild(document.createElement('tr'));
        for (var c=0;c<cols;++c){
            var cell = tr.appendChild(document.createElement('td'));
            // Each cell on the grid is of class 'cell'
            cell.className='cell';

            // Set the ID value of each cell to the row/column value formatted as r_c
            cell.id = r + '_' + c;
            // Set up drag and drop for each cell.
            cell.setAttribute('draggable','true');


            cell.addEventListener('dragstart',(
                function(ev){
                    ev.dataTransfer.effectAllowed='move';
		    let type = _getTypeByClass(ships, this.className);
		    let ship = ships.getShip(type);

                    // Calculate which square was clicked to guide placement
                    var start_coord = _find_start(this.id, ship.orientation, ship.size, type);
                    ev.dataTransfer.setData("text/plain", 
                        JSON.stringify({
                                        square :start_coord,
                                        index  :ship.size,
                                        type   :type,
                                        current_coord: fleet.ghostShip(type, start_coord),
				        orientation: ship.orientation
                                       })
                    );
                })
            );

            // Add Drag/Drop capabilities
            cell.addEventListener('drop',(
                function(ev){
                    console.log('dropping');
                    var dropObj = JSON.parse(ev.dataTransfer.getData("text/plain"));
                    let ship=ships.getShip(dropObj.type);

                    if(fleet.validateShip(dropObj.current_coord, dropObj.type)) {
			    // Remove initial image
			    displayShip(ships, dropObj.type);

			    fleet.setFleet (dropObj.orientation, dropObj.type, ship.size, dropObj.square); 

			    // Redraw image in new location
			    displayShip(dropObj.type, dropObj.current_coord);
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

            cell.addEventListener('click', (function(e){
		let type = fleet.checkGrid(this.id);
		let ship = ship.getShip(type);
		let orientation = (thisShip.orientation == 'x') ? 'y':'x';
		let ghost = fleet.ghostShip(type, _find_start(this.id, orientation, ship.size));

                if (ships.validateShip(type, ghost)) {
		    // Remove initial image
		    displayShip(ships, type);

		    fleet.setFleet (fleet.readMap(dropObj.type), dropObj.type, ship.size, dropObj.current_coord);

		    // Redraw image in new location
		    displayShip(ships, type);
                }

                }));
        }
    }
    return grid;
}

/*
 * _find_start - Determine the starting coordinate of a ship given the square that was clicked. For example
 * it is possible that a battleship along the x-axis was clicked at location 3_3 but that was the second square
 * on the ship. This function will identify that the battleship starts at 2_3.
 */

function _find_start(start_pos, orientation, size, type){
    let index = (orientation == 'x') ? 0 : 1;

    let pieces=start_pos.split('_');

    for (i=0; i < size; i++) {
        pieces[index]--;
	let g = fleet.checkGrid(pieces[0] + '_' + pieces[1]);
        if (g != undefined && g == type && g != false){
            start_pos = pieces[0] + '_' + pieces[1];
        } else {
            break;
        }
    }

    return start_pos;
}

let displayShip = function (ships, type) {
    let coordinates = fleet.getFleet(type);
    let ship = ships.getShip(type);

    for (coord in coordinates) {
        _setSpace(coordinates[coord], ship.clickClass);
    }
}

function _setSpace(space, className) {
    var b = document.getElementById(space); 
    b.classList.toggle(className);
}

function _getTypeByClass(ships, className){
	let shipList = ships.getShip();
	for (s in shipList){
		if (className.match(shipList[s].clickClass)){
			return shipList[s].type;
		}
	}
}

module.exports={
    clickableGrid: clickableGrid,
    displayShip: displayShip
}

