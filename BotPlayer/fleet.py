class Fleet:
    nauticalMap = {} # Dictionary lookup that tracks each ship's starting point and current orientation
    chart = [][] # Map of ship locations
    #def buildNauticalChart(self)
    #chart = []
    #for i in range(10):
        #chart[i] = []
        #for j in range(10):
            #chart[i][j] = undefined
    #return chart;
#    init: function(){
#        return fleet.nauticalChart = fleet.buildNauticalChart(); // Detailed matrix of every ship in the fleet
#    },
#
    def getFleet(self, type)
        orientation = fleet.nauticalMap[type].orientation == 'x' ? 0 : 1
        pieces = fleet.nauticalMap[type].start_coord.split('_')
        ret = []

        while (pieces[orientation] < fleet.nauticalChart[orientation].length && fleet.nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] == type) {
            ret.push (pieces[0] + '_' + pieces[1]);
            pieces[orientation] = pieces[orientation] + 1;
        }
        return ret

    def getWholeFleet(self)
        ret={}
        for t in fleet.nauticalMap
            ret[t] = fleet.getFleet(t)
        }
        return ret
 
     def setFleet (self, orientation, type, size, start_coord, offset) 
         let pieces = start_coord.split('_');
         index = (orientation == 'x') ? 0 : 1;
 
         offset = offset || 0;
 
         # Adjust for drag/drop when player picks a ship piece other than the head.
         pieces[index] = pieces[index] - offset;
 
         #Remove old ship from nauticalChart/Map
         fleet.clearShip(type, size);
 
         # set the nautical map value for this boat
         fleet.nauticalMap[type]={
             orientation: orientation,
             start_coord: pieces[0] + '_' + pieces[1]
         }
 
         for i in range(size)
             fleet.nauticalChart[pieces[0]][pieces[1]] = type;
             pieces[index] = pieces[index] + 1;

    def clearShip (self, type, size)
        let map = fleet.nauticalMap[type];
        if (map){return false;}

        pieces = map.start_coord.split('_');
        index = (map.orientation == 'x') ? 0 : 1;

        for i in range(size)
            fleet.nauticalChart[pieces[0]][pieces[1]]=undefined
            pieces[index]++

        delete fleet.nauticalMap[type]

     # 
     # ghostShip - Before putting a ship on the chart it's potential location needs to be plotted so it can be
     # checked for validity. Given a ship this function will return the potential plotted coordinates. The function
     # may build coordinates for a known ship or for one moved around on the grid.
     # 
     def ghostShip (self, type, coordinate, orientation, size, offset)
         ship = ships.getShip(type)
         thisShip = fleet.readMap(type)
         ghost = []
         coordinate = coordinate || thisShip.start_coord
         orientation = orientation || thisShip.orientation
         size = size || ship.size
         offset = offset || 0
 
         pieces = coordinate.split('_')
         index = (orientation == 'x') ? 0: 1
         pieces[index] = pieces[index] - offset
         for i in range(size)
             ghost.push(pieces[0] + '_' + pieces[1])
             pieces[index] = pieces[index] + 1

         return ghost

    def readMap(self, type)
        return fleet.nauticalMap[type]

    # 
    # Given a coordinate or an array of coordinates return the same structure revealing the contents of the grid.
    # Will return a value of false if there is a problem checking the grid (ex. coords are out of range).
    # 
    def checkGrid (self, coordinates)
        if (coordinates instanceof Array){
            ret = []
            for c in coordinates
                s = fleet.setChart(coordinates[c])
                if (s == false) 
                    return false
                ret.push (s)
            return ret
        else
            return fleet.setChart(coordinates)

    def setChart (self, coordinate)
        pieces = coordinate.split('_');
        if (pieces[0] >= fleet.nauticalChart.length || pieces[1] >= fleet.nauticalChart[pieces[0]].length) {
                return false
        }

        return fleet.nauticalChart[pieces[0]][pieces[1]]

    # 
    # Given a list of coordinates and a ship type validate that the coordinates do not violate the rules of:
    #     * ship must be on the grid
    #     * ship must not occupy the same square as any other ship
    # 
    def validateShip (self, coordinates, type)
        # Make sure there are no other boats already on any a space
        for p in range(coordinates.length) {

            # Is there a collision?
            collision = fleet.checkGrid(coordinates)
            
            if (collision == false)
                return false # If checkGrid returns false coordinates are out of range

            for c in coordinates
                pieces = coordinates[c].split('_')
                    if (fleet.nauticalChart[pieces[0]][pieces[1]] != type &&
                        fleet.nauticalChart[pieces[0]][pieces[1]] != undefined) 
                            return false
        return true

