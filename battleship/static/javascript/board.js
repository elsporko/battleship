(function (board, callback){
    board.adjustBoard = function (type, callback){
        var shipsCfg=config.ships;
        var plotted=shipsCfg[type].plotted;

        // Go through the coordinates list and remove them from the board
        for (var p=0; p < shipsCfg[type].coordinates.length; p++) {
            const t_pieces = shipsCfg[type].coordinates[p].split('_');

            const x=parseInt(t_pieces[0], 10);
            const y=parseInt(t_pieces[1], 10);
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

        if (typeof callback === "function") {return callback();}
    }

}(window.board = window.board || {}));
