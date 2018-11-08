import threading
import json
import sys
sys.path.append('..')
from lib.sqs_policy import SQS_Policy
from battleship.fleet import Fleet

class Roster(SQS_Policy):
    def __init__(self):
        self.me={}
        self.playerRoster = {} # Placeholder for all players in the game self.playerOrder = [0 for x in range(20)]
        super().__init__()

    def load_other_players(self, playerlist=None):
        intro_message={'action': 'playerReg',
                       'handle': self.me['handle'],
                       'arn': self.me['arn']}

        if playerlist:
            self.otherPlayer = playerlist
            pr=self.playerRoster
            for handle in playerlist:
                #TODO - make the publish try/catch in case 
                self.sns_client.publish(TopicArn=playerlist[handle]['arn'], Message=json.dumps(intro_message))
                if handle not in self.playerRoster: # Avoid adding 'me' to the roster more than once
                    plist_arn = playerlist[handle]['arn']
                    #fleet = Fleet()
                    plist_record = json.dumps({
                        'grid': json.dumps(Fleet().__dict__),
                        'order': int(playerlist[handle]['order']),
                        'arn': str(plist_arn)
                    })
                    pr[handle]=plist_record

            self.playerRoster=pr

    # Accept registration from other players
    def acceptReg(self, handle, order):
        pr=self.playerRoster

        if handle not in self.playerRoster: # Avoid adding 'me' to the roster more than once
            plist_arn = playerlist[handle]['arn']
            #fleet = Fleet()
            plist_record = json.dumps({
                'grid': json.dumps(Fleet().__dict__),
                #'grid': fleet,
                'order': int(playerlist[handle]['order']),
                'arn': str(plist_arn)
            })
            pr[handle]=plist_record

        print("accept reg: ", self.playerRoster)

