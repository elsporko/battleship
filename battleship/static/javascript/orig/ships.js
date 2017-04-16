(function (ships){
    ships.properties={
    };

    ships.placeShips = function(){
            /* Randomly place ships on the grid */
            var shipsCfg = config.ships;
            for (var ship in shipsCfg) {
                var start_orientation=Math.floor(Math.random()*2);
                var orientation=['x','y'];
                shipsCfg[ship].orientation = orientation[start_orientation];
                shipsCfg[ship].plotted=[];
                
                while (true) {
                    var start_x=Math.floor(Math.random()*11);
                    var start_y=Math.floor(Math.random()*11);
                    var target=start_x + '_' + start_y;
                    ships.plotShip(shipsCfg[ship].orientation,
                                               {type: shipsCfg[ship].id, 
                                                square: 0,
                                                index: shipsCfg[ship].size},
                                               target);
                    if (this.validateShip(shipsCfg[ship].id)) break;
                }

                board.adjustBoard(shipsCfg[ship].id);
                ships.adjustShip(shipsCfg[ship].id);
                ships.displayShip(shipsCfg[ship].id);
            }
    };

    ships.displayShip = function(type, current_coord, skip) {
        var shipsCfg = config.ships;

        if (typeof current_coord !== undefined){
            for (coord in current_coord) {
                setSpace(current_coord[coord], shipsCfg[type].clickClass);
            }
        }

        if (!skip){
            for (coord in shipsCfg[type].coordinates){
                setSpace(shipsCfg[type].coordinates[coord], shipsCfg[type].clickClass);
            }
        }
    }

    function setSpace(space, className) {
        var b = document.getElementById(space); 
        b.classList.toggle(className);
    }

    ships.plotShip = function(orientation, dropObj, target, callback){
        var square=dropObj.square;
        var t_pieces = target.split('_');
        var shipsCfg = config.ships;
        
        var pieces={
            "x":t_pieces[0],
            "y":t_pieces[1],
        };

        // Get initial target
        pieces[orientation] = pieces[orientation] - square;
        var type = dropObj.type;

        for (var i=0; i < dropObj.index; i++) {
            shipsCfg[type].plotted[i] = pieces.x + '_' + pieces.y;
            pieces[orientation]+=1;
        }

        if (typeof callback === "function") {return callback();}
    };

     ships.validateShip = function (type, callback){
        var shipsCfg = config.ships;
        var plotted = shipsCfg[type].plotted;

        // Check first and last positions to see if they are in bounds
        if (!document.getElementById(plotted[0]) ||!document.getElementById(plotted[plotted.length -1])) {
            return 0;
        }

        // Make sure there are no other boats already on any a space
        for (var p=0; p < plotted.length; p++) {
            var t_pieces = plotted[p].split('_');

            var x=parseInt(t_pieces[0], 10);
            var y=parseInt(t_pieces[1], 10);

            if (typeof board.spaces[x] !== 'undefined' && 
                typeof board.spaces[x][y] !== 'undefined' &&
                board.spaces[x][y].type != type) { 
                    return 0
            }
        }

        if (typeof callback === "function") {return callback();}
        return 1;
    }

    ships.adjustShip = function (type, callback){
        var shipsCfg = config.ships;

        // Wipe out existing coordinates
        shipsCfg[type].coordinates.length=0;

        // Map plotted ships to real coordinates
        for (var p=0; p < shipsCfg[type].plotted.length; p++) {
            shipsCfg[type].coordinates[p] = shipsCfg[type].plotted[p];
        }

        if (typeof callback === "function") {return callback();}
        return 1;
    }

}(window.ships = window.ships || {}));
