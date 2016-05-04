(function (board){
    board.adjust_board = function (boat, ship){
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
}(window.board = window.board || {}));
