function clickableGrid( rows, cols, callback ){
    var i=0;
    var grid = document.createElement('table');
    //console.log('ships: ' + JSON.stringify(ships));
    grid.className = 'grid setboard';
    //grid.className = 'setboard';
    for (var r=0;r<rows;++r){
        var tr = grid.appendChild(document.createElement('tr'));
        for (var c=0;c<cols;++c){
            var cell = tr.appendChild(document.createElement('td'));
            cell.className='cell';

            // Identify matrix coordinates to better track selections
            cell.id = r + '_' + c;
            /* Save this for the gameplay portion. Act on single cell clicks
            cell.addEventListener('click',(function(el,r,c,i){
                return function(){
                    callback(el,r,c,i);
                }
            })(cell,r,c,i),false);
            */
            cell.setAttribute('draggable','true');
            cell.addEventListener('dragstart',(
                function(ev){
                    ev.dataTransfer.effectAllowed='move';
                    var shipCfg = config.ships;
                    var pieces=this.id.split('_');
                    var type = board.spaces[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)].type;

                    // Calculate which square was clicked to guide placement
                    var square = _find_square(this.id, shipCfg[type].orientation, shipCfg[type].size);
                    ev.dataTransfer.setData("text/plain", 
                        JSON.stringify({
                                        square :square,
                                        index  :shipCfg[type].size,
                                        type   :type,
                                        current_coord:shipCfg[type].coordinates
                                        //type   :board.spaces[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)].type,
                                        //"orientation": this.orientation
                                       })
                        );
                })
            );

            // Add Drag/Drop capabilities
            cell.addEventListener('drop',(
                function(ev){
                    var shipCfg = config.ships;
                    //console.log('dropping');
                    var dropObj = JSON.parse(ev.dataTransfer.getData("text/plain"));
                    //console.log('dropObj: ' + JSON.stringify(dropObj));
                    var ship=shipCfg[dropObj.type];
                    //console.log('ship: '  + JSON.stringify(ship));
                    //console.log('drop target: ' + JSON.stringify(ev.target.id));

                    //var current_coord=shipCfg[dropObj.type].coordinates;
                    //console.log('current coord: ' + JSON.stringify(dropObj.current_coord));
                    ships.plotShip(ship.orientation, dropObj, ev.target.id);
                    if(ships.validateShip(dropObj.type)) {
                        board.adjustBoard(dropObj.type);
                        ships.adjustShip(dropObj.type);
                        ships.displayShip(dropObj.type, dropObj.current_coord);
                    }

                    ev.stopPropagation();
                    ev.preventDefault();
                    return false;
                    }
                )
            );

            cell.addEventListener('dragover',(
                function(ev){
                    //console.log('dragover');
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect='move';
                    return false;
                    }
                ));

            cell.addEventListener('click', (function(e){
                var shipCfg = config.ships;
                var pieces=this.id.split('_');
                var type = board.spaces[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)].type;
                //console.log('1--ship' + JSON.stringify(shipCfg[type]));
                //var current_coord=shipCfg[type].coordinates;

                // Calculate which square was clicked to guide placement
                var square = _find_square(this.id, shipCfg[type].orientation, shipCfg[type].size);
                var oMap = {x: 'y', y: 'x'};
                shipCfg[type].orientation = oMap[shipCfg[type].orientation];
                //console.log('click current_coord' + JSON.stringify(current_coord));
                //console.log('ship' + JSON.stringify(shipCfg[type]));

                var current_coord=shipCfg[type].coordinates;

                ships.plotShip(shipCfg[type].orientation,
                                           {type: shipCfg[type].id, 
                                            square: square,
                                            index: shipCfg[type].size},
                               this.id);
                //console.log('2--ship' + JSON.stringify(shipCfg[type]));
                //console.log('current_coord: ' + JSON.stringify(current_coord));

                if (ships.validateShip(shipCfg[type].id)) {
                    board.adjustBoard(shipCfg[type].id);
                    ships.adjustShip(shipCfg[type].id);
                    ships.displayShip(shipCfg[type].id, current_coord, 1);
                } else {
                    // Reset change to orientation
                    shipCfg[type].orientation = oMap[shipCfg[type].orientation]
                }

                }));
        }
    }

    return grid;
}

function _find_square(start_pos, orientation, size){
    // beginning at start_pos traverse the ship according to the board struct
    // until the endpoint is hit. The value of square=size of ship - number of squares
    // to the end point.
    var t_pieces=start_pos.split('_');
    var pieces={
        "x":t_pieces[0],
        "y":t_pieces[1],
    };
    var type = board.spaces[pieces.x][pieces.y].type;
    var i;

    for (i=0; i < size; i++) {
        if (board.spaces[pieces.x] &&
            board.spaces[pieces.x][pieces.y] &&
            type == board.spaces[pieces.x][pieces.y].type){
            pieces[orientation]++;
        } else {
            break;
        }
    }

//    return size - i + 1;
    return size - i;
}
