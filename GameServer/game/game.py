class Game:
    def __init__(self):
        self.order = 0
        self.playerRoster = {} # Placeholder for all players in the game self.playerOrder = [0 for x in range(100)] # Order of player turn
        self.playerOrder = [None for x in range(20)] # There is a limit on the number of SNS topics that can be active in one account at one time
