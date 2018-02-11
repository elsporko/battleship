class Player:
    def __init__(self):
        self.playerRoster = {} # Placeholder for all players in the game
        self.playerOrder = [] # Order of player turn
        self.me = {}
        self.orderIndex = 0
        self.flow = ['register','game']
        #self.currentFlow: undefined
        
    def canMove(self):
        if player.playerOrder.length > move.getMoveSize():
            return true;
        return false;

    # Register handle
    def register(self, handle):
        player.me = handle # Self identify thineself
        # TODO - call out to the registration service and get back handle and turn order. This
        # structure represents the return call from the registration service.
        reg = { 'handle': 'elsporko',
                'order': 0
        }

        player.playerOrder[reg.order] = reg.handle
        player.gameFlow()
        return

     # Accept registration from other players
    def acceptReg(self, handle, order):
        player.playerOrder[order] = handle;
        player.playerRoster = {
            [handle]: {'pgrid': fleet.buildNauticalChart}
        }

    def myTurn(self):
        return (1,0)[self.currentPlayer() == player.me]

    def nextPlayer(self):
        player.orderIndex = (0, self.orderIndex + 1)[player.orderIndex == player.playerOrder.length - 1]
        return;

    def currentPlayer (self):
        return player.playerOrder[player.orderIndex];

    def gameFlow(self):
        if player.currentFlow != undefined:
            player.currentFlow+=1
        else:
            player.currentFlow = 0

    def setMove(self, m):
        return move.setMove(m);


