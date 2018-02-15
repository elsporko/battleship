class Player:
    def __init__(self):
        self.playerRoster = {} # Placeholder for all players in the game
        self.playerOrder = [0 for x in range(100)] # Order of player turn
        #self.chart =[[0 for x in range(10)] for y in range(10)] # Map of ship locations
        self.me = {}
        self.orderIndex = 0
        self.flow = ['register','game']
        #self.currentFlow: undefined
        
    def canMove(self):
        if self.playerOrder.length > move.getMoveSize():
            return true;
        return false;

    # Register handle
    def register(self,handle):
        self.me = handle # Self identify thineself
        # TODO - call out to the registration service and get back handle and turn order. This
        # structure represents the return call from the registration service.
        reg = { 'handle': 'elsporko',
                'order': 0
        }
        print (reg)

        self.playerOrder[reg['order']] = reg['handle']
        #self.gameFlow()
        return

     # Accept registration from other players
    def acceptReg(self, handle, order):
        self.playerOrder[order] = handle;
        self.playerRoster = {
            [handle]: {'pgrid': fleet.buildNauticalChart}
        }

    def myTurn(self):
        return (1,0)[self.currentPlayer() == self.me]

    def nextPlayer(self):
        self.orderIndex = (0, self.orderIndex + 1)[self.orderIndex == self.playerOrder.length - 1]
        return;

    def currentPlayer (self):
        return self.playerOrder[self.orderIndex];

    def gameFlow(self):
        if self.currentFlow != undefined:
            self.currentFlow+=1
        else:
            self.currentFlow = 0

    def setMove(self, m):
        return move.setMove(m);


