class Move:
    def __init__(self):
        self.moveList = []
        self.moveMap = {}

    def clearMoveList(self):
        move.moveList = [];

    def moveListBlock(self, m):
        moveStruct={};

        moveStruct.type = m.type;
        # store current ship coordinate string so that when a move is deleted it will be restored to it's prior location
        moveStruct.ghost = m.ghost;
        moveStruct.orientation = m.orientation;
        moveStruct.shipType = m.shipType;
        moveStruct.size = m.shipSize;
        moveStruct.undo = m.undo or undefined;

        return moveStruct;

    def getMove(self, mv):
        for l in move.moveList:
            if move.moveList[l].id == mv.id:
                return move.moveList[l]

    def resolveMoves(self):
        console.log('Resolving moves')
        move_actions={
            'attack': self.attackPlayer(mv.coordinate)
            'mine':   self.setMine(mv.coordinate)
            'move':   self.moveShip()
            'pivot':  self.pivotShip()
        }
        for m in move.moveList:
            mv = move.moveList[m]
            move_actions[mv.type]

    def moveShip(self):
        # Check for mines based on ghost - send message to mine service
        blastAt = move.check_for_mine(move.ghost);
        if blastAt != false:
            # find which square got hit
            target
            for m in move.ghost:
                if move.ghost[m] == blastAt:
                    target=move.ghost[m]
                    break
            ships.setHitCounter(move.shipType, m+1)

        fl = fleet.getFleet(move.shipType)
        s = ships.getShip(move.shipType)

        if fl[0] == move.ghost[0] and move.orientation == s.orientation: # check starting points and orientation set and redisplay only if different
            # Validate move can be made
            if fleet.validateShip(move.ghost, move.shipType):
                # Set ghost to NauticalChart/Map
                fleet.setFleet (move.orientation, move.shipType, ships.getShip(move.shipType).size, move.ghost[0], 0)

    def resetGhost (self, blastAt):
        for i in move.ghost:
            if blastAt == move.ghost[i]:
                break;

        return move.ghost = fleet.ghostShip(move.type, move.ghost[i], move.orientation, move.ghost.length, i)

    # Stub for mine detection
    def check_for_mine (self, g):
        mineAt = {'0_6'= 1, '1_6'= 1, '2_6'= 1, '3_6'= 1, '4_6'= 1, '5_6'= 1, '6_6'= 1, '7_6'= 1, '8_6'= 1, '9_6'= 1};
        for i in g:
            # return location where mine struck
            if mineAt[g[i]] == 1:
                #console.log('BOOM');
                return g[i]
        return false

    def attackPlayer (self, coordinate):
        # Send a message requesting hit/miss value on enemy's grid
        # Inform all of enemy's coordinate status

    def setMine(self, coordinate):
        # Send a message requesting hit/miss value on enemy's grid
        # If not a hit register with service that mine placed on enemy grid

    def setMove (self, m):
        if move.moveMap[m.coordinate] == undefined:
            move.moveMap[m.coordinate] = move.moveList.length
            mv = move.moveListBlock(m)
            move.moveList.push(mv)

    def getMoveSize(self):
        return move.moveList.length;


