var dispatchPages= {
    setboard : function() {
                    var page = setBoard.setPage();
                    // Clear doc before display the grid
                    document.body.innerHTML='';

                    for (var item in page){
                        document.body.appendChild(page[item]);
                    }
    },
                    
    default : function() {}
};

function clickableGrid( rows, cols, callback ){
    var i=0;
    var grid = document.createElement('table');
    grid.className = 'grid';
    for (var r=0;r<rows;++r){
        var tr = grid.appendChild(document.createElement('tr'));
        for (var c=0;c<cols;++c){
            var cell = tr.appendChild(document.createElement('td'));

            // Identify matrix coordinates to better track selections
            cell.id = r + '_' + c;
            cell.addEventListener('click',(function(el,r,c,i){
                return function(){
                    callback(el,r,c,i);
                }
            })(cell,r,c,i),false);
        }
    }
    return grid;
}

