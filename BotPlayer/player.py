#!/usr/bin/python3
fleet = import()

#'use strict';
#
#class Fleet:
#    nauticalMap = {} # Dictionary lookup that tracks each ship's starting point and current orientation
#    chart = [][] # Map of ship locations
#    #def buildNauticalChart(self)
#    #chart = []
#    #for i in range(10):
#        #chart[i] = []
#        #for j in range(10):
#            #chart[i][j] = undefined
#    #return chart;
##    init: function(){
##        return fleet.nauticalChart = fleet.buildNauticalChart(); // Detailed matrix of every ship in the fleet
##    },
##
#    def getFleet(self, type)
#        orientation = fleet.nauticalMap[type].orientation == 'x' ? 0 : 1
#        pieces = fleet.nauticalMap[type].start_coord.split('_')
#        ret = []
#
#        while (pieces[orientation] < fleet.nauticalChart[orientation].length && fleet.nauticalChart[parseInt(pieces[0], 10)][parseInt(pieces[1], 10)] == type) {
#            ret.push (pieces[0] + '_' + pieces[1]);
#            pieces[orientation] = pieces[orientation] + 1;
#        }
#        return ret
#
#    def getWholeFleet(self)
#        ret={}
#        for t in fleet.nauticalMap
#            ret[t] = fleet.getFleet(t)
#        }
#        return ret
# 
#     def setFleet (self, orientation, type, size, start_coord, offset) 
#         let pieces = start_coord.split('_');
#         index = (orientation == 'x') ? 0 : 1;
# 
#         offset = offset || 0;
# 
#         # Adjust for drag/drop when player picks a ship piece other than the head.
#         pieces[index] = pieces[index] - offset;
# 
#         #Remove old ship from nauticalChart/Map
#         fleet.clearShip(type, size);
# 
#         # set the nautical map value for this boat
#         fleet.nauticalMap[type]={
#             orientation: orientation,
#             start_coord: pieces[0] + '_' + pieces[1]
#         }
# 
#         for i in range(size)
#             fleet.nauticalChart[pieces[0]][pieces[1]] = type;
#             pieces[index] = pieces[index] + 1;
#
#    def clearShip (self, type, size)
#        let map = fleet.nauticalMap[type];
#        if (map){return false;}
#
#        pieces = map.start_coord.split('_');
#        index = (map.orientation == 'x') ? 0 : 1;
#
#        for i in range(size)
#            fleet.nauticalChart[pieces[0]][pieces[1]]=undefined
#            pieces[index]++
#
#        delete fleet.nauticalMap[type]
#
#     # 
#     # ghostShip - Before putting a ship on the chart it's potential location needs to be plotted so it can be
#     # checked for validity. Given a ship this function will return the potential plotted coordinates. The function
#     # may build coordinates for a known ship or for one moved around on the grid.
#     # 
#     def ghostShip (self, type, coordinate, orientation, size, offset)
#         ship = ships.getShip(type)
#         thisShip = fleet.readMap(type)
#         ghost = []
#         coordinate = coordinate || thisShip.start_coord
#         orientation = orientation || thisShip.orientation
#         size = size || ship.size
#         offset = offset || 0
# 
#         pieces = coordinate.split('_')
#         index = (orientation == 'x') ? 0: 1
#         pieces[index] = pieces[index] - offset
#         for i in range(size)
#             ghost.push(pieces[0] + '_' + pieces[1])
#             pieces[index] = pieces[index] + 1
#
#         return ghost
#
#    def readMap(self, type)
#        return fleet.nauticalMap[type]
#
#    # 
#    # Given a coordinate or an array of coordinates return the same structure revealing the contents of the grid.
#    # Will return a value of false if there is a problem checking the grid (ex. coords are out of range).
#    # 
#    def checkGrid (self, coordinates)
#        if (coordinates instanceof Array){
#            ret = []
#            for c in coordinates
#                s = fleet.setChart(coordinates[c])
#                if (s == false) 
#                    return false
#                ret.push (s)
#            return ret
#        else
#            return fleet.setChart(coordinates)
#
#    def setChart (self, coordinate)
#        pieces = coordinate.split('_');
#        if (pieces[0] >= fleet.nauticalChart.length || pieces[1] >= fleet.nauticalChart[pieces[0]].length) {
#                return false
#        }
#
#        return fleet.nauticalChart[pieces[0]][pieces[1]]
#
#    # 
#    # Given a list of coordinates and a ship type validate that the coordinates do not violate the rules of:
#    #     * ship must be on the grid
#    #     * ship must not occupy the same square as any other ship
#    # 
#    def validateShip (self, coordinates, type)
#        # Make sure there are no other boats already on any a space
#        for p in range(coordinates.length) {
#
#            # Is there a collision?
#            collision = fleet.checkGrid(coordinates)
#            
#            if (collision == false)
#                return false # If checkGrid returns false coordinates are out of range
#
#            for c in coordinates
#                pieces = coordinates[c].split('_')
#                    if (fleet.nauticalChart[pieces[0]][pieces[1]] != type &&
#                        fleet.nauticalChart[pieces[0]][pieces[1]] != undefined) 
#                            return false
#        return true
#
class Ships:
#   Config settings 
    ship_config = {
        'aircraftCarrier' = {'size': 5, 'id': 'aircraftCarrier', 'label' : 'Aircraft Carrier', 'mask' : 31},
        'battleship' = {'size': 4, 'id' : 'battleship', 'label' : 'Battleship', 'mask': 15, },
        'destroyer' = {'size': 3, 'id' : 'destroyer', 'label' : 'Destroyer', 'mask': 7, },
        'submarine'  = {'size': 3, 'id' : 'submarine', 'label' : 'Submarine', 'mask' : 7, },
        'patrolBoat' = {'size': 2, 'id' : 'patrolBoat', 'label' : 'Patrol Boat', 'mask': 3, },
    }

    hitCounter = {'aircraftCarrier' : 0, 'battleship' : 0, 'destroyer' : 0, 'submarine'  : 0, 'patrolBoat' : 0 }

    sunkCounter = {} # Tracks which boats have been sunk

    # Values for determining bit values when a boat sinks
    airCraftCarrier: 1,
    battleship: 2,
    destroyer: 4,
    submarine: 8,
    patrolBoat: 16,

    def setHitCounter (self, type, bit)
        ships.hitCounter[type] = ships.ship_config[type].mask^(bit*bit)
        if (ships.hitCounter[type] == ships.ship_config[type].mask) # I don't know if this is correct but the idea is check to see if the ship is sunk and flag it if need be
            ships.setSunkCounter(type)

    def setSunkCounter(self, type)
        ships.sunkCounter = ships.sunkCounter^type;

    def getHitCounter (self, type){
        return ships.hitCounter[type]
    },


    def getSunkCounter (self)
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
    def buildShips(self)
        for s in ships.ship_config
            ships[s] = {'size': ships.ship_config[s].size, 'type': ships.ship_config[s].id, 'label': ships.ship_config[s].label}
        return ships

    def buildShip (self, type)
        ships[type] = ships.ship(ships.ship_config[type].size, ships.ship_config[type].id, ships.ship_config[type].label)
        return ships;

    # Set value in ship object. 
    def setShip (self, type, key, value)
        if (type && ships[type] && key) # only attempt an update if there is a legit ship type and a key
            ships[type].key = value;

    # Return ship object if no type given otherwise return object containing just requested ship
    def getShip(self, type)
        if(type)
            return ships[type];
        else
            return ships.ship_config;

    # Private function to randomly determine ship's orientation along the X-axis or Y-axis. Only used when plotting ships for the first time.
    def getStartCoordinate(self, size)
	#TODO const = javascript immutable...translate
        const start_orientation=Math.floor(Math.random()*10) > 5 ? 'x' : 'y'
        const start_x = start_orientation == 'x' ? ships.getRandomCoordinate(size) : ships.getRandomCoordinate(0)
        const start_y = start_orientation == 'y' ? ships.getRandomCoordinate(size) : ships.getRandomCoordinate(0)

        return {coordinate: start_x + '_' + start_y, orientation: start_orientation}
    },

    # Take ship size and orientation into account when determining the start range value. ex. don't
    # let an aircraft carrier with an orientation of 'X' start at row 7 because it will max out over the
    # grid size.
    def getRandomCoordinate (self, offset)
        const MAX_COORD = 10;
        return Math.floor(Math.random()*(MAX_COORD - offset))

    # 
    # placeShips - Initial placement of ships on the board
    # 
    def placeShips(self)
         # Randomly place ships on the grid. In order do this each ship must:
         #   * Pick an orientation
         #   * Pick a starting coordinate
         #   * Validate that the coordinate is valid (does not run OOB, does not cross any other ship, etc.)
         #   * If valid:
         #       * Save start coord and orientation as part of ship object
         #       * Plot ship on master matrix
         #
        shipList = ships.getShip()
        for ship in shipList
            start = ships.getStartCoordinate(shipList[ship].size)
            ship_string = fleet.ghostShip(ship, start.coordinate, start.orientation)
            shipList[ship].orientation = start.orientation

            while (!fleet.validateShip(ship_string))
                start = ships.getStartCoordinate(shipList[ship].size)
                shipList[ship].orientation = start.orientation
                ship_string = fleet.ghostShip(ship, start.coordinate, start.orientation)

            fleet.setFleet(start.orientation, ship, shipList[ship].size, start.coordinate)

class Player:
    playerRoster = {} # Placeholder for all players in the game
    playerOrder = [] # Order of player turn
    me = {}
    orderIndex = 0
    flow = ['register','game']
    #currentFlow: undefined
    def canMove(self)
        if (player.playerOrder.length > move.getMoveSize()) 
            return true;
        return false;

    # Register handle
    def register(self, handle)
        player.me = handle # Self identify thineself
        # TODO - call out to the registration service and get back handle and turn order. This
        # structure represents the return call from the registration service.
        const reg = {
                  'handle' = 'elsporko',
                  'order' = 0
        }

        player.playerOrder[reg.order] = reg.handle
        player.gameFlow()
        return

     # Accept registration from other players
    def acceptReg(self, handle, order)
        player.playerOrder[order] = handle;
        player.playerRoster = {
            [handle]: {'pgrid' = fleet.buildNauticalChart}

    def myTurn(self)
        return (player.currentPlayer() == player.me) ? 1 : 0;

    def nextPlayer(self)
        player.orderIndex = (player.orderIndex == player.playerOrder.length - 1) ?  0 : player.orderIndex+1;
        return;

    def currentPlayer (self)
        return player.playerOrder[player.orderIndex];

    def gameFlow(self)
        if (player.currentFlow != undefined)
            player.currentFlow++;
        else
            player.currentFlow = 0;

    def setMove(self, m)
        return move.setMove(m);

class Move:
    moveList = []
    moveMap = {}

    def clearMoveList(self)
        move.moveList = [];

    def moveListBlock(self, m)
        let moveStruct={};

        moveStruct.type = m.type;
        # store current ship coordinate string so that when a move is deleted it will be restored to it's prior location
        moveStruct.ghost = m.ghost;
        moveStruct.orientation = m.orientation;
        moveStruct.shipType = m.shipType;
        moveStruct.size = m.shipSize;
        moveStruct.undo = m.undo || undefined;

        return moveStruct;

    def getMove(self, mv)
        for l in move.moveList)
            if(move.moveList[l].id == mv.id)
                return move.moveList[l]

    def resolveMoves(self)
        console.log('Resolving moves')
        for m in move.moveList
            let mv = move.moveList[m]
            console.log('move: ', mv)
            switch(mv.type)
                case 'attack': 
                    grid.attackPlayer(mv.coordinate)
                    break;
                case 'mine':
                    grid.setMine(mv.coordinate)
                    break;
                case 'move':
                    grid.moveShip()
                    break;
                case 'pivot':
                    break;

    def moveShip(self)
        # Check for mines based on ghost - send message to mine service
        blastAt = move.check_for_mine(move.ghost);
        if (blastAt != false)
            # find which square got hit
            let target
            for m in move.ghost
                if (move.ghost[m] == blastAt)
                    target=move.ghost[m]
                    break
            ships.setHitCounter(move.shipType, m+1)

        fl = fleet.getFleet(move.shipType)
        s = ships.getShip(move.shipType)

        if (fl[0] == move.ghost[0] && move.orientation == s.orientation) # check starting points and orientation set and redisplay only if different
            # Validate move can be made
            if(fleet.validateShip(move.ghost, move.shipType))
                # Set ghost to NauticalChart/Map
                fleet.setFleet (move.orientation, move.shipType, ships.getShip(move.shipType).size, move.ghost[0], 0)

    def resetGhost (self, blastAt){
        for i in move.ghost
            if (blastAt == move.ghost[i])
                break;

        return move.ghost = fleet.ghostShip(move.type, move.ghost[i], move.orientation, move.ghost.length, i)

    # Stub for mine detection
    def check_for_mine (self, g){
        let mineAt = {'0_6'= 1, '1_6'= 1, '2_6'= 1, '3_6'= 1, '4_6'= 1, '5_6'= 1, '6_6'= 1, '7_6'= 1, '8_6'= 1, '9_6'= 1};
        for i in g
            # return location where mine struck
            if(mineAt[g[i]] == 1)
                #console.log('BOOM');
                return g[i]
        return false

    def attackPlayer (self, coordinate)
        # Send a message requesting hit/miss value on enemy's grid
        # Inform all of enemy's coordinate status

    def setMine(self, coordinate)
        # Send a message requesting hit/miss value on enemy's grid
        # If not a hit register with service that mine placed on enemy grid

    def setMove (self, m)
        if(move.moveMap[m.coordinate] == undefined)
            move.moveMap[m.coordinate] = move.moveList.length
            let mv = move.moveListBlock(m)
            move.moveList.push(mv)

    def getMoveSize(self)
        return move.moveList.length;

######################################
######################################
#
#/*** battleshipOne.js ***/
#
#fleet.init();
#player.gameFlow();
# Register
player.register();
#

#    grid.setMoveShip(); 
#        playGame();
#
#// Set up link to resolve moves
#let d=document.getElementById('doMoves');
#d.addEventListener('click',
#    function(){
#        // Resolve orders
#        move.resolveMoves();
#        // Reset moves
#        move.clearMoveList();
#        // Turn moves over to the next player
#        // FIXME - Simulating moves for now. Remove when ready for realsies
#
#    }, false);
#
#// Set up drag/drop of moves
#//document.getElementById('playOrder').setAttribute('draggable','true');
#//player.playerOrderHandler();
#
# Set random fleet
ships.buildShips();
ships.placeShips();

#/* 
# * Mock game will be removed 
# */
#let m = document.getElementById('MeganReg');
#m.addEventListener('click', 
#    function(){
#        player.acceptReg('Megan', 1);
#        document.getElementById('MeganReg').style.display='none';
#    }, false);
#
#let ry = document.getElementById('RyanReg');
#ry.addEventListener('click', 
#    function(){
#        player.acceptReg('Ryan', 2);
#        document.getElementById('RyanReg').style.display='none';
#    }, false);
#
#let tr = document.getElementById('TraceyReg');
#tr.addEventListener('click', 
#    function(){
#        player.acceptReg('Tracey', 3);
#        document.getElementById('TraceyReg').style.display='none';
#    }, false);
#
#/* Play game */
#/*
#while (1) {
#    player.getTurn();
#}
#*/
#
#function playGame(){
#    if (player.myTurn()){
#        //window.open('','attack', 'height=200,width=200,menubar=no,status=no,titlebar=no,toolbar=no', false );
#    }
#}
#
