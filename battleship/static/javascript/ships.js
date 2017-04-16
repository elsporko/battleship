    // Config settings 
    let ship_config = {
        aircraftCarrier : {
            size : 5,
            id : 'aircraftCarrier',
            color : 'Crimson',
            clickClass : 'acclicked',
            label : 'Aircraft Carrier',
        },
        battleship : {
            size : 4,
            id : 'battleship',
            color:'DarkGreen',
            clickClass : 'bsclicked',
            label : 'Battleship',
        },
        destroyer : {
            size : 3,
            id : 'destroyer',
            color:'CadetBlue',
            clickClass : 'declicked',
            label : 'Destroyer',
        },
        submarine  : {
            size : 3,
            id : 'submarine',
            color:'DarkRed',
            clickClass : 'suclicked',
            label : 'Submarine',
        },
        patrolBoat : {
            size : 2,
            id : 'patrolBoat',
            color:'Gold',
            clickClass : 'pbclicked',
            label : 'Patrol Boat',
        },
    };

    // Ship constructor - shipyard???
    function _ship(size, id, color, clickClass, label) {
            this.size        = size;
            this.id          = id;
            this.color       = color;
            this.clickClass  = clickClass;
            this.label       = label;
            //this.coordinates = [];  // Don't really need to know coordinates or orientation, do we??
            //this.orientation = '';

            return (this);
    }

    // Container to hold ships object (Private)
    let ships={};

    // Public function to initially create ships object
    module.exports = function buildShips(){
        return if (ships); // Don't create new ships if they already exist
        for (let s in ship_config){
            ships.s = _ship(s.size, s.id, s.color, s.clickClass, s.label);
        }
    }

    // Return ship object if no type given otherwise return object containing just requested ship
    module.exports = function getShip(type){
        if(!type){
            return ships.type;
        } else {
            return ships;
        }
    }

    // Private function to randomly determine ship's orientation along the X-axis or Y-axis. Only used when plotting ships for the first time.
    function _getOrientation(){
        var start_x=Math.floor(Math.random()*11);
        var start_y=Math.floor(Math.random()*11);
        return start_x + '_' + start_y;
    }

    module.exports = function placeShips(){
            /* Randomly place ships on the grid */
            //var shipsCfg = config.ships;
            for (var ship in getShip()) {
                //var start_orientation=Math.floor(Math.random()*2);
                //var orientation=['x','y'];
                //shipsCfg[ship].orientation = orientation[start_orientation];
                //shipsCfg[ship].plotted=[];
                
                while (true) {
                    ships.plotShip(_getOrientation//shipsCfg[ship].orientation,
                                               {type: s.id//shipsCfg[ship].id, 
                                                square: 0,
                                                index: s.size//shipsCfg[ship].size},
                                               target);
                    if (this.validateShip(shipsCfg[ship].id)) break;
                }

                //board.adjustBoard(shipsCfg[ship].id);
                //ships.adjustShip(shipsCfg[ship].id);
                //ships.displayShip(shipsCfg[ship].id);
                ships.displayShip(s.id);
            }
    };

    module.exports function displayShip(type, current_coord, skip) {
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

    module.exports = function plotShip(orientation, dropObj, target, callback){
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

     module.exports = function validateShip(type, callback){
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

    module.exports = function adjustShip(type, callback){
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


