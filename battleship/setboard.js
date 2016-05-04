(function (setBoard){
    /*
    ships = {
        aircraftCarrier : {
            size : 5,
            id : 'aircraftCarrier',
            color : 'Crimson',
            clickClass : 'acclicked',
            label : 'Aircraft Carrier'
        },
        battleship : {
            size : 4,
            id : 'battleship',
            color:'DarkGreen',
            clickClass : 'bsclicked',
            label : 'Battleship'
        },
        destroyer : {
            size : 3,
            id : 'destroyer',
            color:'CadetBlue',
            clickClass : 'declicked',
            label : 'Destroyer'
        },
        submarine  : {
            size : 3,
            id : 'submarine',
            color:'DarkRed',
            clickClass : 'suclicked',
            label : 'Submarine'
        },
        patrolBoat : {
            size : 2,
            id : 'patrolBoat',
            color:'Gold',
            clickClass : 'pbclicked',
            label : 'Patrol Boat'
        },

    };

    board={
        spaces:[],
        };

*/
    var localClass;
    setBoard.setClass = function(lclass){localClass=ships[lclass].clickClass};

    setBoard.setPage = function () {
        //TODO - Allow grid size to be entered on setup page
        //var page=document.createElement('div');
        var grid=clickableGrid(10,10,function(el,row,col,i){
            if (el.className) {
                el.className='';
            } else {
            }
        });

        var rgrp=document.createElement('div');

        for (var ship in ships) {
            var label = document.createElement('div');
            label.innerHTML=ships[ship].label;
            label.className=ships[ship].clickClass + 'lbl';
            rgrp.appendChild(label);

/*
            var boat = document.createElement('div');
            boat.className='shipblock';
            boat.setAttribute('draggable','true');
            boat.setAttribute('id',ships[ship].id);
            boat.addEventListener('dragstart',(
                function(ev){
                    ev.dataTransfer.effectAllowed='move';
                    //var style = window.getComputedStyle(ev.target, null);

                    // Calculate which square was clicked to guide placement
                    var square = parseInt(parseInt(ev.clientX, 10) / 30, 10);
                    **
                    console.log('square = ' + square);
                    console.log('clientX ' + ev.clientX);
                    console.log('clientY ' + ev.clientY);
                    **
                    //console.log('target ' + ev.target.id);
                    console.log( "square:" + square);
                    console.log( "index:"  + this.id);

                    ev.dataTransfer.setData("text/plain", 
                        JSON.stringify({
                                        "square":square,
                                        "index" :this.id,
                                        "orientation": 'x'
                                       })
                        );
                })
            );
            */
            /*
            for (var r=0; r<ships[ship].size; ++r){
                var thisboat = document.createElement('div');
                thisboat.className='grid ' + ships[ship].clickClass;
                boat.appendChild(thisboat);
            }

            rgrp.appendChild(boat);
            */
            //var lf = document.createElement('br');
            //rgrp.appendChild(lf);
        }

        return { grid : grid, rgrp : rgrp };
        //return { page : page};
    // Private function
               // Validate legitimate move (ship goes in a straight line)
               // Remove selection if max ship spaces have been reached
        function validate_move(className) {
            var isvalid = 1;
            var error;

            var pieces = document.getElementsByClassName(className);
            var numPieces = pieces.length;
            //console.log ('className = ' + className);
            //console.log ('pieces = ' + JSON.stringify(pieces));
            //console.log ('numPieces = ' + numPieces);

            return {isvalid : isvalid, numPieces : numPieces, error : error}
        }
    }

setBoard.place_ships = function(){
        /* Randomly place ships on the grid */
        for (var ship in ships) {

            var start_orientation=Math.floor(Math.random()*2);
            var orientation=['x','y'];
            
            while (true) {
                var start_x=Math.floor(Math.random()*11);
                var start_y=Math.floor(Math.random()*11);
                var target=start_x + '_' + start_y;
                var boat = plot_ship(orientation[start_orientation],{square: 0, index: ships[ship].id}, target);

                if (validate_ship(boat)) break;
            }

            //console.log('ship: ' + JSON.stringify(ship));
            adjust_board(boat, ships[ship]);
            //console.log('boat (' + ships[ship].id + '):' + JSON.stringify(boat));

        }
}

}(window.setBoard = window.setBoard || {}));
