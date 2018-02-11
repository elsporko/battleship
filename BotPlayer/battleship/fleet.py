class Fleet:
#    init: function(){
#        return self.nauticalChart = self.buildNauticalChart(); // Detailed matrix of every ship in the fleet
#    },
#
    def __init__(self):
        self.nauticalMap = {} # Dictionary lookup that tracks each ship's starting point and current orientation
        self.chart =[[0 for x in range(10)] for y in range(10)] # Map of ship locations
        #self.nauticalChart = self.buildNauticalChart()

    def getFleet(self, type):
        orientation = (0,1) [self.nauticalMap[type].orientation]

        pieces = self.nauticalMap[type].start_coord.split('_')
        ret = []

        while pieces[orientation] < self.nauticalChart[orientation].length and self.nauticalChart[pieces[0]][pieces[1]] == type:
            ret.push (pieces[0] + '_' + pieces[1])
            pieces[orientation] = pieces[orientation] + 1
        return ret

    def getWholeFleet(self):
        ret={}
        for t in self.nauticalMap:
            ret[t] = self.getFleet(t)
        return ret
 
    def setFleet (self, orientation, type, size, start_coord, offset):
         pieces = start_coord.split('_');
         index = (0, 1)[orientation == 'x']
 
         offset = offset or 0;
 
         # Adjust for drag/drop when player picks a ship piece other than the head.
         pieces[index] = pieces[index] - offset;
 
         #Remove old ship from nauticalChart/Map
         self.clearShip(type, size);
 
         # set the nautical map value for this boat
         self.nauticalMap[type]={
             orientation: orientation,
             start_coord: pieces[0] + '_' + pieces[1]
         }
 
         for i in range(size):
             self.nauticalChart[pieces[0]][pieces[1]] = type;
             pieces[index] = pieces[index] + 1;

    def clearShip (self, type, size):
        map = self.nauticalMap[type];
        if map:
            return false

        pieces = map.start_coord.split('_')
        index = (0,1)[(map.orientation == 'x')]

        for i in range(size):
            self.nauticalChart[pieces[0]][pieces[1]]=undefined
            pieces[index]+=1

        del self.nauticalMap[type]

    # 
    # ghostShip - Before putting a ship on the chart it's potential location needs to be plotted so it can be
    # checked for validity. Given a ship this function will return the potential plotted coordinates. The function
    # may build coordinates for a known ship or for one moved around on the grid.
    # 
    def ghostShip (self, type, coordinate, orientation, size, offset):
        ship = ships.getShip(type)
        thisShip = self.readMap(type)
        ghost = []
        coordinate = coordinate or thisShip.start_coord
        orientation = orientation or thisShip.orientation
        size = size or ship.size
        offset = offset or 0
 
        pieces = coordinate.split('_')
        index = (0,1)[orientation == 'x']
        pieces[index] = pieces[index] - offset
        for i in range(size):
            ghost.push(pieces[0] + '_' + pieces[1])
            pieces[index] = pieces[index] + 1

        return ghost

    def readMap(self, type):
        return self.nauticalMap[type]

    # 
    # Given a coordinate or an array of coordinates return the same structure revealing the contents of the grid.
    # Will return a value of false if there is a problem checking the grid (ex. coords are out of range).
    # 
    def checkGrid (self, coordinates):
        if isinstance (coordinates, list):
            ret = []
            for c in coordinates:
                s = self.setChart(coordinates[c])
                if s == false:
                    return false
                ret.push (s)
            return ret
        else:
            return self.setChart(coordinates)

    def setChart (self, coordinate):
        pieces = coordinate.split('_');
        if pieces[0] >= self.nauticalChart.length or pieces[1] >= self.nauticalChart[pieces[0]].length:
            return false

        return self.nauticalChart[pieces[0]][pieces[1]]

    # 
    # Given a list of coordinates and a ship type validate that the coordinates do not violate the rules of:
    #     * ship must be on the grid
    #     * ship must not occupy the same square as any other ship
    # 
    def validateShip (self, coordinates, type):
        # Make sure there are no other boats already on any a space
        for p in range(coordinates.length):

            # Is there a collision?
            collision = self.checkGrid(coordinates)
            
            if collision == false:
                return false # If checkGrid returns false coordinates are out of range

            for c in coordinates:
                pieces = coordinates[c].split('_')
                if self.nauticalChart[pieces[0]][pieces[1]] != type and self.nauticalChart[pieces[0]][pieces[1]] != undefined: 
                    return false
        return true

