class Move:
    def __init__(self):
        self.moveList = []
        self.moveMap = {}

    def clearMoveList(self):
        self.moveList = [];

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
        for l in self.moveList:
            if self.moveList[l].id == mv.id:
                return self.moveList[l]

    def resolveMoves(self):
        console.log('Resolving moves')
        move_actions={
            'attack': self.attackPlayer(mv.coordinate),
            'mine':   self.setMine(mv.coordinate),
            'move':   self.moveShip(),
            'pivot':  self.pivotShip()
        }
        for m in self.moveList:
            mv = self.moveList[m]
            move_actions[mv.type]

    def moveShip(self):
        # Check for mines based on ghost - send message to mine service
        blastAt = self.check_for_mine(self.ghost);
        if blastAt != false:
            # find which square got hit
            target
            for m in self.ghost:
                if self.ghost[m] == blastAt:
                    target=self.ghost[m]
                    break
            ships.setHitCounter(self.shipType, m+1)

        fl = fleet.getFleet(self.shipType)
        s = ships.getShip(self.shipType)

        if fl[0] == self.ghost[0] and self.orientation == s.orientation: # check starting points and orientation set and redisplay only if different
            # Validate move can be made
            if fleet.validateShip(self.ghost, self.shipType):
                # Set ghost to NauticalChart/Map
                fleet.setFleet (self.orientation, self.shipType, ships.getShip(self.shipType).size, self.ghost[0], 0)

    def resetGhost (self, blastAt):
        for i in self.ghost:
            if blastAt == self.ghost[i]:
                break;

        self.ghost = fleet.ghostShip(self.shipType, self.ghost[i], self.orientation, self.ghost.length, i)
        return self.ghost

    # Stub for mine detection
    def check_for_mine (self, g):
        mineAt = {'0_6': 1, '1_6': 1, '2_6': 1, '3_6': 1, '4_6': 1, '5_6': 1, '6_6': 1, '7_6': 1, '8_6': 1, '9_6': 1};
        for i in g:
            # return location where mine struck
            if mineAt[g[i]] == 1:
                #console.log('BOOM');
                return g[i]
        return false

    def attackPlayer (self, coordinate):
        # Send a message requesting hit/miss value on enemy's grid
        # Inform all of enemy's coordinate status
        return

    def setMine(self, coordinate):
        # Send a message requesting hit/miss value on enemy's grid
        # If not a hit register with service that mine placed on enemy grid
        return

    def setMove (self, m):
        if self.moveMap[m.coordinate] == undefined:
            self.moveMap[m.coordinate] = self.moveList.length
            mv = self.moveListBlock(m)
            self.moveList.push(mv)

    def getMoveSize(self):
        return self.moveList.length;


