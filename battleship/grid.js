function clickableGrid( rows, cols, callback ){
    var i=0;
    var grid = document.createElement('table');
    //console.log('ships: ' + JSON.stringify(ships));
    grid.className = 'grid';
    for (var r=0;r<rows;++r){
        var tr = grid.appendChild(document.createElement('tr'));
        for (var c=0;c<cols;++c){
            var cell = tr.appendChild(document.createElement('td'));

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
                    //var style = window.getComputedStyle(ev.target, null);

                    // Calculate which square was clicked to guide placement
                    var square = parseInt(parseInt(ev.clientX, 10) / 30, 10);
                    /*
                    console.log('square = ' + square);
                    console.log('clientX ' + ev.clientX);
                    console.log('clientY ' + ev.clientY);
                    */
                    //console.log('target ' + ev.target.id);
                    console.log( "square:" + square);
                    console.log( "index:"  + this.id);
                    var pieces=this.id.split('_');
//board.spaces[parseInt(t_pieces[0], 10)][t_pieces[1]].push({type:ship.id})
                    console.log( "board:"  + JSON.stringify(board.spaces[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)]));
                    ev.dataTransfer.setData("text/plain", 
//board.spaces[parseInt(pieces[0], 10)][pieces[1]].push({type:ship.id})
                        JSON.stringify({
                                        "square":square,
                                        "index" :board.spaces[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)].type,
                                        "orientation": this.orientation
                                       })
                        );
                })
            );

            // Add Drag/Drop capabilities
            cell.addEventListener('drop',(
                function(ev){
                    var shipCfg = config.ships;
                    console.log('dropping');
                    var dropObj = JSON.parse(ev.dataTransfer.getData("text/plain"));
                    var ship=shipCfg[dropObj.index];
                    console.log('dropObj = ' + JSON.stringify(dropObj));
                    console.log('ship = ' + JSON.stringify(ship));

                    //console.log('target = ' + ev.target.id);

/*
 * 3 steps:
 *  * Define ship
 *  * Validate all positions
 *  * Turn on class
 */
// var boat = ships.plot_ship(ship.orientation, dropObj, ev.target.id,
//                              ships.validate_ship(boat, 
//                                  board.adjust_board(boat, ship,
//                                      grid.display_grid()
//                                  )
//                              )
//                           );
                    var boat = ships.plot_ship(ship.orientation, dropObj, ev.target.id);
                    if (ships.validate_ship(boat)) {
                        console.log('Yay validation');
                        board.adjust_board(boat, ship);
                        console.log('after board: ' + JSON.stringify(board));
                        //activate_ship(boat);
                    } else {
                        //console.log('Nelson says hah-hah');
                    }

                    //console.log('boat: ' + JSON.stringify(boat));
                    //var orientation = dropObj.orientation;

                    // This is how we doooo it
                    //b = document.getElementById(ev.target.id); 
                    //b.className=ship.clickClass;

                    //var chunk = string.split(ev.target.id);
/*

                    for(var i=0; i++; i < ship.size){
                        ev.target.class = ship.clickClass;
                    }
                    */

                    //console.log('offset = ' + JSON.stringify(ev.dataTransfer.getData("text/plain")));
                    /*
                    var src = ev.dataTransfer.getData("Text");
                    ev.target.appendChild(document.getElementById(src));
                    //ev.stopPropagation();
                    return false;
                    */
                    /*
                    var offset = ev.dataTransfer.getData("text/plain").split(',');
                    //var dm = document.getElementById('dragme');
                    var dm = document.getElementsByClassName('grid');
                    console.log('dm => ' + JSON.stringify(dm));
                    var style = window.getComputedStyle(ev.target, null);
                    //console.log('style => ' + JSON.stringify(style));
                    //dm.style.left = (ev.clientX + parseInt(offset[0],10)) + 'px';
                    //dm.style.top = (ev.clientY + parseInt(offset[1],10)) + 'px';
                    */
                    ev.stopPropagation();
                    ev.preventDefault();
                    return false;
                    }
                )
            );

            cell.addEventListener('dragend',(
                function(ev){
                    console.log('dragend');
                    //ev.preventDefault();
                    //return false;
                    return true;
                }
            ));

            cell.addEventListener('dragover',(
                function(ev){
                    console.log('dragover');
                    //ev.stopPropagation();
                    ev.preventDefault();
                    //console.log('default prevented');
                    ev.dataTransfer.dropEffect='move';
                    return false;
                    }
                ));
        }
    }

    return grid;
}

/*
function adjust_board(boat, ship){
    for (var p=0; p < boat.length; p++) {
        var t_pieces = boat[p].split('_');
        //console.log('t_pieces: ' + JSON.stringify(t_pieces));

        //board.spaces[parseInt(t_pieces[0], 10)][t_pieces[1]].push({type:ship.id});
        var x=parseInt(t_pieces[0], 10);
        var y=parseInt(t_pieces[1], 10);
        if (typeof board.spaces[x] === 'undefined') {
            board.spaces[x] = new Array();
        }
        board.spaces[x][y] = {type:ship.id};
        //console.log('ab board: ' + JSON.stringify(board));
        //board.spaces.t_pieces[0].push(t_pieces[1]);
        //console.log('Setting class ' + ship.clickClass + ' for id ' + boat[p]);
        var b = document.getElementById(boat[p]); 
        b.className=ship.clickClass;
    }
}
*/

