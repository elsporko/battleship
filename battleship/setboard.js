(function (setBoard){
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

    var localClass;
    setBoard.setClass = function(lclass){localClass=ships[lclass].clickClass};

    setBoard.setPage = function () {

        //TODO - Allow grid size to be entered on setup page
        var grid=clickableGrid(10,10,function(el,row,col,i){
            if (el.className) {
                el.className='';
            } else {
                var move = validate_move(localClass);
                //console.log('move = ' + JSON.stringify(move);
                console.log('localClass = ' + localClass);
                console.log('ships[' + localClass + '] = ' + ships[localClass]);
                if (move.isvalid && move.numPieces < ships[localClass].size) {
                    el.className=localClass;
                }
            }
        });

        var rgrp=document.createElement('form');
        rgrp.setAttribute('name', 'pickFleet');
        rgrp.className='pickFleet';

        for (var ship in ships) {
           var button = document.createElement('input');
           button.setAttribute('name', 'shipType');
           button.setAttribute('type', 'radio');
           button.setAttribute('id', ships[ship].id);
           button.setAttribute('value', ship);
           button.addEventListener('click', (function(){
               // Validate legitimate move (ship goes in a straight line)
               // Remove selection if max ship spaces have been reached
               // Set selection class
           //    var move = validate_move(this.class);
               /*
               if (move.error()) {
                   //TODO set error message and skip the rest
               }
               */
           //    if (move.isvalid && move.numPieces < ships[this.id].size) {
                   setBoard.setClass(this.id)
             //      }
               }), false);

           var label = document.createElement('label');
           label.className=ships[ship].clickClass;
           label.innerHTML=ships[ship].label + ' - ' + ships[ship].size;
           label.setAttribute('for', ships[ship].id);

           var lf = document.createElement('br');

           rgrp.appendChild(button);
           rgrp.appendChild(label);
           rgrp.appendChild(lf);
        }

        //FIXME - Add a button to submit fleet
        //rgrp.appendChile(lf);
        
        return { grid : grid, rgrp : rgrp };
    // Private function
               // Validate legitimate move (ship goes in a straight line)
               // Remove selection if max ship spaces have been reached
        function validate_move(className) {
            var isvalid = 1;
            var error;

            var pieces = document.getElementsByClassName(className);
            var numPieces = pieces.length;
            console.log ('className = ' + className);
            console.log ('pieces = ' + JSON.stringify(pieces));
            console.log ('numPieces = ' + numPieces);

            return {isvalid : isvalid, numPieces : numPieces, error : error}
        }
    }

}(window.setBoard = window.setBoard || {}));
