(function (ships){
    ships.ships = function(){return config.ships};

    ships.place_ships = function(){
            /* Randomly place ships on the grid */
            var ships = config.ships;
            for (var ship in ships) {
                var start_orientation=Math.floor(Math.random()*2);
                var orientation=['x','y'];
                ships[ship].orientation = orientation[start_orientation];
                
                while (true) {
                    var start_x=Math.floor(Math.random()*11);
                    var start_y=Math.floor(Math.random()*11);
                    var target=start_x + '_' + start_y;
                    var boat = this.plot_ship(ships[ship].orientation, //orientation[start_orientation],
                                               {square: 0, index: ships[ship].size},
                                               target);
                    if (this.validate_ship(boat)) break;
                }

                //console.log('ship: ' + JSON.stringify(ship));
                board.adjust_board(boat, ships[ship]);
                //console.log('board: ' + JSON.stringify(board));
                //console.log('boat (' + ships[ship].id + '):' + JSON.stringify(boat));
            }
    };

    ships.plot_ship = function(orientation, dropObj, target){
        var square=dropObj.square;
        var t_pieces = target.split('_');
        var boat=[];
        
        var pieces={
            "x":t_pieces[0],
            "y":t_pieces[1],
        };

        // Get initial target
        pieces[orientation] = pieces[orientation] - square;
        for (var i=0; i < dropObj.index; i++) {
            boat[i] = pieces.x + '_' + pieces.y;
            pieces[orientation]++;
        }

        return boat;
    };

     ships.validate_ship = function (boat){
        // Check first and last positions to see if they are in bounds
        //console.log('Checking ends ' + boat[0] + ', ' + boat[boat.length -1]);
        if (!document.getElementById(boat[0]) ||!document.getElementById(boat[boat.length -1])) {
            //console.log('begin: ' + document.getElementById(boat[0]));
            //console.log('end: '   + document.getElementById(boat.length - 1));
            //console.log('ship out of bounds: ' + JSON.stringify(boat));
            return 0;
        }

        //console.log('boat: ' + boat);
        //console.log('boat length: ' + boat.length);
        // Make sure there are no other boats already on any a space
        for (var p=0; p < boat.length; p++) {
            var t_pieces = boat[p].split('_');

            //console.log('board: ' + JSON.stringify(board));
            //console.log('t_pieces: ' + t_pieces);
            //var spaces = board.spaces;
            //console.log('spaces: ' + JSON.stringify(spaces));

            var x=parseInt(t_pieces[0], 10);
            var y=parseInt(t_pieces[1], 10);

            if (typeof board.spaces[x] !== 'undefined' && typeof board.spaces[x][y] !== 'undefined') { 
                console.log('space occupied by ' + board.spaces[x][y]);
                return 0
            }
            /*
            for (var space in spaces) {
                console.log('space: ' + space);
                if (space[t_pieces[1]] !== 'undefined') { return 0}
            }
            */
        }

        return 1;
    }

}(window.ships = window.ships || {}));
