import boto3
import json
import random
import string
from battleship.roster import Roster
#from battleship.sqs_policy import SQS_Policy

class Player(Roster):
    def __init__(self):
        # Max number of players is 20 as data is processed on 1 queue and the max number of policies tied to a queue is 20
        self.playerOrder = [None for x in range(20)] # Order of player turn
        self.orderIndex = 0
        self.fake_names = ['Hugh Mann', 'elsporko', 'Amanda Hugenkiz', 'Not A Bot', "Bender 'Bending' Rodriguez", 'Ann Onimus', 'Hugh Jass']
        super().__init__()
        
    def canMove(self):
        if self.playerOrder.length > move.getMoveSize():
            return true;
        return false;

    # Register handle
    def register(self):
        # Prepare and publish registration message
        fake_name = self.get_fake_name()
        message = {
            "action": "register",
            "handle": fake_name,
            "topic_arn": self.my_topic_arn['TopicArn']
        }

        self.sns_client.publish(TopicArn='arn:aws:sns:us-east-2:849664249614:BR_Topic', Message=json.dumps(message))

        registered = False
        empty_name_list = False # Have we run out of fake names?

        # Keep trying to register a unique handle
        while not registered and not empty_name_list:
            payload = self.sqs_client.receive_message(QueueUrl=self.queue.url, MaxNumberOfMessages=10, WaitTimeSeconds=5)

            if 'Messages' not in payload:
                continue
            for msg in payload['Messages']:
                receipthandle=msg['ReceiptHandle']

                msg=json.loads(msg['Body']) 
                msg=json.loads(msg['Message'])

                if 'registration' in msg and msg['registration']=='SUCCESS':
                    self.playerRoster[msg['handle']]={
                        'me': 1,
                        'order': int(msg['order']),
                        'topic_arn': msg['topic_arn']
                    }
                    self.playerOrder[int(msg['order'])]=msg['handle']
                    self.otherPlayers=self.load_other_players(msg['registered_players'])
                    self.sqs_client.delete_message(QueueUrl=self.queue.url, ReceiptHandle=receipthandle)
                    registered=True
                elif 'registration' in msg and msg['registration']=='FAIL':
                    fake_name = self.get_fake_name()
                    if not fake_name:
                        empty_name_list = True 

                    message = {
                        "action": "register",
                        "handle": fake_name,
                        "topic_arn": self.my_topic_arn['TopicArn']
                    }

                    self.me={'handle': fake_name, 'arn': self.my_topic_arn['TopicArn']}
                    self.sns_client.publish(TopicArn='arn:aws:sns:us-east-2:849664249614:BR_Topic', Message=json.dumps(message))
                    self.sqs_client.delete_message(QueueUrl=self.queue.url, ReceiptHandle=receipthandle)
                else:
                    print("Should not get here: ", msg)
        print("roster: ", self.otherPlayers)
        return

    def cleanup_subscription(self):
        self.sns_client.delete_topic(TopicArn=self.my_topic_arn['TopicArn'])
        self.delete_policy(Arn=self.my_topic_arn['TopicArn'], Queue=self.queue.url)

    # return a fake name from the predetermined list
    def get_fake_name (self):
        if len(self.fake_names) == 0:
            return False 
        fake_name = self.fake_names[random.randint(0, len(self.fake_names)) - 1]
        self.fake_names.remove(fake_name)
        return fake_name

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
