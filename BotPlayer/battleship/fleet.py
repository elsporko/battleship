from random import *
class Fleet(object):
    def __init__(self):
        self.nauticalMap = {} # Dictionary lookup that tracks each ship's starting point and current orientation
        self.chart =[[0 for x in range(10)] for y in range(10)] # Map of ship locations
        self.nauticalChart = [[0 for x in range(10)] for y in range(10)] # Map of my ship locations
        #   Config settings 
        self.ship_config = {
            'aircraftCarrier': {'size': 5, 'id': 'aircraftCarrier', 'label' : 'Aircraft Carrier', 'mask' : 31},
            'battleship':      {'size': 4, 'id' : 'battleship', 'label' : 'Battleship', 'mask': 15, },
            'destroyer':       {'size': 3, 'id' : 'destroyer', 'label' : 'Destroyer', 'mask': 7, },
            'submarine':       {'size': 3, 'id' : 'submarine', 'label' : 'Submarine', 'mask' : 7, },
            'patrolBoat':      {'size': 2, 'id' : 'patrolBoat', 'label' : 'Patrol Boat', 'mask': 3, },
        }
        self.hitCounter = {'aircraftCarrier' : 0, 'battleship' : 0, 'destroyer' : 0, 'submarine'  : 0, 'patrolBoat' : 0 }
        self.sunkCounter = {} # Tracks which boats have been sunk

        # Values for determining bit values when a boat sinks
        self.airCraftCarrier = 1,
        self.battleship = 2,
        self.destroyer = 4,
        self.submarine = 8,
        self.patrolBoat = 16,
        #self.chart =[[0 for x in range(10)] for y in range(10)] # Map of ship locations

    def getFleet(self, shipType):
        orientation = (0,1) [self.nauticalMap[shipType]['orientation'] == 'x']

        pieces = self.nauticalMap[shipType]['start_coord'].split('_')
        ret = []

        while int(pieces[orientation]) < len(self.nauticalChart[orientation]) and self.nauticalChart[int(pieces[0])][int(pieces[1])] == shipType:
            ret.append ("{}_{}".format(pieces[0], pieces[1]))
            pieces[orientation] = int(pieces[orientation]) + 1
        return ret

    def getWholeFleet(self):
        ret={}
        for t in self.nauticalMap:
            ret[t] = self.getFleet(t)
        return ret
 
    def setFleet (self, orientation, shipType, size, start_coord, offset=0):
         pieces = start_coord.split('_');
         index = (0, 1)[orientation == 'x']
 
         # Adjust for drag/drop when player picks a ship piece other than the head.
         pieces[index] = int(pieces[index]) - offset;
 
         #Remove old ship from nauticalChart/Map
         self.clearShip(shipType, size);
 
         # set the nautical map value for this boat
         self.nauticalMap[shipType]={
             'orientation': orientation,
             'start_coord': "{}_{}".format(int(pieces[0]), int(pieces[1]))
         }
 
         for i in range(size):
             self.nauticalChart[int(pieces[0])][int(pieces[1])] = shipType;
             pieces[index] = int(pieces[index]) + 1;

    def clearShip (self, shipType, size):
        # Stop processing if the ship is not yet listed or if the ship exists on the space being cleared
        if shipType not in self.nauticalMap or self.nauticalMap[shipType]:
            return False

        pieces = map.start_coord.split('_')
        index = (0,1)[(map.orientation == 'x')]

        for i in range(size):
            self.nauticalChart[pieces[0]][pieces[1]]=undefined
            pieces[index]+=1

        del self.nauticalMap[shipType]

    # 
    # ghostShip - Before putting a ship on the chart it's potential location needs to be plotted so it can be
    # checked for validity. Given a ship this function will return the potential plotted coordinates. The function
    # may build coordinates for a known ship or for one moved around on the grid.
    # 
    def ghostShip (self, shipType, coordinate, orientation=None, size=None, offset=None):
        ship = self.getShip(shipType)
        thisShip = self.readMap(shipType)
        ghost = []
        coordinate = coordinate or thisShip['start_coord']
        orientation = orientation or thisShip['orientation']
        size = size or ship['size']
        offset = offset or 0
 
        pieces = coordinate.split('_')
        index = (0,1)[orientation == 'x']
        pieces[index] = int(pieces[index]) - offset
        for i in range(size):
            ghost.append("{}_{}".format(pieces[0], pieces[1]))
            pieces[index] = pieces[index] + 1

        return ghost

    def readMap(self, shipType):
        mapval = None
        if shipType in self.nauticalMap:
            mapval = self.nauticalMap[shipType]
        return mapval

    # 
    # Given a coordinate or an array of coordinates return the same structure revealing the contents of the grid.
    # Will return a value of false if there is a problem checking the grid (ex. coords are out of range).
    # 
    def checkGrid (self, coordinates):
        if isinstance (coordinates, list):
            ret = []
            for c in range(len(coordinates)):
                s = self.setChart(coordinates[c])
                if s != 0:
                    return False
                ret.append (s)
            return ret
        else:
            return self.setChart(coordinates)

    def setChart (self, coordinate):
        pieces = coordinate.split('_')
        if int(pieces[0]) >= len(self.nauticalChart) or int(pieces[1]) >= len(self.nauticalChart[int(pieces[0])]):
            return False

        return self.nauticalChart[int(pieces[0])][int(pieces[1])]

    # 
    # Given a list of coordinates and a ship type validate that the coordinates do not violate the rules of:
    #     * ship must be on the grid
    #     * ship must not occupy the same square as any other ship
    # 
    def validateShip (self, coordinates, shipType=None):
        # Make sure there are no other boats already on any a space
        for p in range(len(coordinates)):

            # Is there a collision?
            collision = self.checkGrid(coordinates)
            
            if collision == False:
                return False # If checkGrid returns false coordinates are out of range

            for c in range(len(coordinates)):
                pieces = coordinates[c].split('_')
                if int(pieces[0]) >= len(self.nauticalChart) or int(pieces[1]) >= len(self.nauticalChart[int(pieces[0])]):
                    return False
                if self.nauticalChart[int(pieces[0])][int(pieces[1])] != shipType and self.nauticalChart[int(pieces[0])][int(pieces[1])] != 0:

                    return False
        return True

    def setHitCounter (self, shipType, bit):
        self.hitCounter[shipType] = self.ship_config[shipType].mask^(bit*bit)
        if self.hitCounter[shipType] == self.ship_config[shipType].mask: # I don't know if this is correct but the idea is check to see if the ship is sunk and flag it if need be
            self.setSunkCounter(shipType)

    def setSunkCounter(self, shipType):
        self.sunkCounter = self.sunkCounter^shipType;

    def getHitCounter (self, shipType):
        return self.hitCounter[shipType]

    def getSunkCounter (self):
        return self.sunkCounter
#
#    # Ship constructor - shipyard??? __init ???
#    ship: function(size, id, color, clickClass, label) {
#        this.size        = size;
#        this.id          = id;
#        this.color       = color;
#        this.clickClass  = clickClass;
#        this.label       = label;
#
#        return (this);
#    },

    # The ship object holds the current orientation of the ship and the start coordinate (topmost/leftmost). When
    # there is a change to the ship the master matrix needs to be updated. An event will be triggered when there is
    # a coordinate change. This listener will update the master matrix. Calls to check location (move validtion, 
    # check if hit, etc.) will be made against the master matrix.
    # Public function to initially create ships object
    def buildShips(self):
        #ships = [0 for x in range(10)]
        ships = {}
        for s in self.ship_config:
            ships[s] = {'size': self.ship_config[s]['size'], 'shipType': self.ship_config[s]['id'], 'label': self.ship_config[s]['label']}
        return ships

    def buildShip (self, shipType):
        ships[shipType] = self.ship(self.ship_config[shipType]['size'], self.ship_config[shipType]['id'], self.ship_config[shipType]['label'])
        return ships;

    # Set value in ship object. 
    def setShip (self, shipType, key, value):
        if shipType and ships[shipType] and key: # only attempt an update if there is a legit ship type and a key
            ships[shipType].key = value;

    # Return ship object if no type given otherwise return object containing just requested ship
    def getShip(self, shipType=None):
        if shipType:
            return self.ship_config[shipType]
        else:
            return self.ship_config

    # Private function to randomly determine ship's orientation along the X-axis or Y-axis. Only used when plotting ships for the first time.
    def getStartCoordinate(self, size):
	#TODO const = javascript immutable...translate
        start_orientation=('x', 'y')[randint(1,10) > 5]
        start_x = (self.getRandomCoordinate(size), self.getRandomCoordinate(0))[start_orientation == 'x'] 
        start_y = (self.getRandomCoordinate(size), self.getRandomCoordinate(0))[start_orientation == 'y']

        return {'coordinate': "{}_{}".format(start_x, start_y), 'orientation': start_orientation}

    # Take ship size and orientation into account when determining the start range value. ex. don't
    # let an aircraft carrier with an orientation of 'X' start at row 7 because it will max out over the
    # grid size.
    def getRandomCoordinate (self, offset):
        MAX_COORD = 10
        return randint(0,(MAX_COORD - offset))

    # 
    # placeShips - Initial placement of ships on the board
    # 
    def placeShips(self):
         # Randomly place ships on the grid. In order do this each ship must:
         #   * Pick an orientation
         #   * Pick a starting coordinate
         #   * Validate that the coordinate is valid (does not run OOB, does not cross any other ship, etc.)
         #   * If valid:
         #       * Save start coord and orientation as part of ship object
         #       * Plot ship on master matrix
         #
        shipList = self.getShip()
        for ship in shipList:
            start = self.getStartCoordinate(shipList[ship]['size'])
            ship_string = self.ghostShip(ship, start['coordinate'], start['orientation'])
            shipList[ship]['orientation'] = start['orientation']

            while not self.validateShip(ship_string):
                start = self.getStartCoordinate(shipList[ship]['size'])
                shipList[ship]['orientation'] = start['orientation']
                ship_string = self.ghostShip(ship, start['coordinate'], start['orientation'])

            self.setFleet(start['orientation'], ship, shipList[ship]['size'], start['coordinate'])


