from random import *
class Ships:
    def __init__(self):
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

    def setHitCounter (self, type, bit):
        ships.hitCounter[type] = ships.ship_config[type].mask^(bit*bit)
        if ships.hitCounter[type] == ships.ship_config[type].mask: # I don't know if this is correct but the idea is check to see if the ship is sunk and flag it if need be
            ships.setSunkCounter(type)

    def setSunkCounter(self, type):
        ships.sunkCounter = ships.sunkCounter^type;

    def getHitCounter (self, type):
        return ships.hitCounter[type]

    def getSunkCounter (self):
        return ships.sunkCounter
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
        for s in ships.ship_config:
            ships[s] = {'size': ships.ship_config[s].size, 'type': ships.ship_config[s].id, 'label': ships.ship_config[s].label}
        return ships

    def buildShip (self, type):
        ships[type] = ships.ship(ships.ship_config[type].size, ships.ship_config[type].id, ships.ship_config[type].label)
        return ships;

    # Set value in ship object. 
    def setShip (self, type, key, value):
        if type and ships[type] and key: # only attempt an update if there is a legit ship type and a key
            ships[type].key = value;

    # Return ship object if no type given otherwise return object containing just requested ship
    def getShip(self, type):
        if type:
            return ships[type]
        else:
            return ships.ship_config

    # Private function to randomly determine ship's orientation along the X-axis or Y-axis. Only used when plotting ships for the first time.
    def getStartCoordinate(self, size):
	#TODO const = javascript immutable...translate
        start_orientation=('x', 'y')[randint(1,10) > 5]
        start_x = (ships.getRandomCoordinate(size), ships.getRandomCoordinate(0))[start_orientation == 'x'] 
        start_y = (ships.getRandomCoordinate(size), ships.getRandomCoordinate(0))[start_orientation == 'y']

        return {coordinate: start_x + '_' + start_y, orientation: start_orientation}

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
        shipList = ships.getShip()
        for ship in shipList:
            start = ships.getStartCoordinate(shipList[ship].size)
            ship_string = fleet.ghostShip(ship, start.coordinate, start.orientation)
            shipList[ship].orientation = start.orientation

            while not fleet.validateShip(ship_string):
                start = ships.getStartCoordinate(shipList[ship].size)
                shipList[ship].orientation = start.orientation
                ship_string = fleet.ghostShip(ship, start.coordinate, start.orientation)

            fleet.setFleet(start.orientation, ship, shipList[ship].size, start.coordinate)


