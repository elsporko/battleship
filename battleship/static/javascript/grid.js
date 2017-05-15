let fleet = require('./fleet');
let ships = require('./ships');

/*
 * Build the grid and attach handlers for drag/drop events
 */
let clickableGrid = function ( rows, cols, isMyGrid){
    let grid = document.createElement('table');
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
		    let type = fleet.checkGrid(this.id);
		    let ship = ships.getShip(type);

                    // Calculate which square was clicked to guide placement
                    var start_coord = _find_start(this.id, ship.orientation, ship.size);
                    ev.dataTransfer.setData("text/plain", 
                        JSON.stringify({
                                        square :start_coord,
                                        index  :ship.size,
                                        type   :type,
                                        current_coord: fleet.ghostShip(type, start_coord)
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

                    if(ships.validateShip(dropObj.type, dropObj.current_coord)) {
			    // Remove initial image
			    _displayShip(type, current_coord, skip);

			    fleet.setFleet (fleet.readMap(DropObj.type), DropObj.type, ship.size, dropObj.current_coord); // (orientation, type, size, start_coord)

			    // Redraw image in new location
			    _displayShip(type, current_coord, skip);
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
		let thisShip = fleet.checkGrid(type);
		let ship = ship.getShip(type);
		let orientation = (thisShip.orientation == 'x') ? 'y':'x';
		let ghost = fleet.ghostShip('type', _find_start(this.id, orientation, ship.size );

                if (ships.validateShip(type, ghost)) {
		    // Remove initial image
		    _displayShip(type, current_coord, skip);

		    fleet.setFleet (fleet.readMap(DropObj.type), DropObj.type, ship.size, dropObj.current_coord);

		    // Redraw image in new location
		    _displayShip(type, current_coord, skip);
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

function _find_start(start_pos, orientation, size){
    let type = fleet.checkGrid(this.id);
    let ship = ships.getShip(type);
    let index = eorientation == 'x') ? 0 : 1;

    let pieces=start_pos.split('_');

    for (let i=0; i < size; i++) {
	let g = fleet.checkGrid(pieces[0] + '_' + pieces[1]);
        if (g != undefined && g == type){
            pieces[index]++;
        } else {
            break;
        }
    }

    start = start_pos.split('_');
    start[index] = start[index] - (size - i);
    return start[0] + '_' + start[1];
}

function _displayShip(type) {
    let coordinates = fleet.getFleet(type);

    for (coord in coordinates) {
        setSpace(coordinates[coord], shipsCfg[type].clickClass);
    }
}

function _setSpace(space, className) {
    var b = document.getElementById(space); 
    b.classList.toggle(className);
}

module.s=exports={
    clickableGrid: clickableGrid,
}

