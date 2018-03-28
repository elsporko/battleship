import threading
import json
from battleship.sqs_policy import SQS_Policy

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
                #print("handle: ", handle)
                #print("playerlist[handle]: ", playerlist[handle])
                self.sns_client.publish(TopicArn=playerlist[handle]['arn'], Message=json.dumps(intro_message))
                if handle not in self.playerRoster: # Avoid adding 'me' to the roster more than once
                    plist_arn = playerlist[handle]['arn']
                    plist_record = json.dumps({
                        'order': int(playerlist[handle]['order']),
                        'arn': str(plist_arn)
                    })
                    pr[handle]=plist_record

                    #self.playerRoster[playerlist[handle]]=plist_record
            self.playerRoster=pr

