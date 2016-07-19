(function (board, callback){
    board.adjustBoard = function (type, callback){
        var shipsCfg=config.ships;
        //console.log('adjustBoard');
        //console.log('type: ' + type);
        //console.log('cfg type: ' + JSON.stringify(shipsCfg[type].plotted));
        //var plotted=shipsCfg[type].plotted;
        var plotted=shipsCfg[type].plotted;
        //console.log ('plotted: ' + JSON.stringify(plotted));
        //console.log ('ship: ' + JSON.stringify(shipsCfg[type]));

        // Go through the coordinates list and remove them from the board
        for (var p=0; p < shipsCfg[type].coordinates.length; p++) {
            var t_pieces = shipsCfg[type].coordinates[p].split('_');

            var x=parseInt(t_pieces[0], 10);
            var y=parseInt(t_pieces[1], 10);
            if (typeof board.spaces[x] !== 'undefined') {
                board.spaces[x][y] = undefined; 
            }
        }

        // Plot plotted coords to the board map
        for (var p=0; p < shipsCfg[type].plotted.length; p++) {
            var t_pieces = shipsCfg[type].plotted[p].split('_');

            var x=parseInt(t_pieces[0], 10);
            var y=parseInt(t_pieces[1], 10);
            if (typeof board.spaces[x] === 'undefined') {
                board.spaces[x] = new Array();
            }

            // For display purposes determine which squares
            // need to be cleared and which need to be populated
            board.spaces[x][y] = {type:type};
        }

        //console.log('type: ' + type);
        //console.log('board: ' + JSON.stringify(board));
        if (typeof callback === "function") {return callback();}
    }

}(window.board = window.board || {}));
