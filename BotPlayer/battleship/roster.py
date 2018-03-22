import threading
from battleship.sqs_policy import SQS_Policy

class Roster(SQS_Policy):
    def __init__(self):
        self.me={}
        self.playerRoster = {} # Placeholder for all players in the game self.playerOrder = [0 for x in range(20)]
        super().__init__()

    def load_other_players(self, playerlist=None):
        print("Roster!!!")
        intro_message={action='player_introduction','handle'=self.me['handle'], 'arn'=self.md['arn']}
        if playerlist:
            self.otherPlayer = playerlist
            for handle in playerlist:
                self.sns_client.publish(TopicArn=playerlist['topic_arn'], Message=json.dumps(intro_message))
                if handle not in self.playerRoster: # Avoid adding 'me' to the roster more than once
                    self.playerRoster[handle]={
                        'order': int(playerlist['order']),
                        'topic_arn': playerlist['topic_arn']
                    }

        #return self.playerRoster 

