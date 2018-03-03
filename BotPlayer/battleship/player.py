import boto3
import json
import pprint
from random import *
from battleship.sqs_policy import SQS_Policy

class Player:
    def __init__(self):
        self.playerRoster = {} # Placeholder for all players in the game self.playerOrder = [0 for x in range(100)] # Order of player turn
        #TODO I don't like setting a hard limit for players but for now this will do
        self.playerOrder = [None for x in range(100)]
        #self.chart =[[0 for x in range(10)] for y in range(10)] # Map of ship locations
        self.orderIndex = 0
        self.flow = ['register','game']
        self.sns_client = boto3.client('sns', 'us-east-2')
        self.sqs_client = boto3.client('sqs', 'us-east-2')
        self.fake_names = ['Hugh Mann', 'elsporko', 'Amanda Hugenkiz', 'Not A Bot']
        #self.currentFlow: undefined
        
    def canMove(self):
        if self.playerOrder.length > move.getMoveSize():
            return true;
        return false;

    # Register handle
    def register(self,handle):
        sqs_policy = SQS_Policy()
        pp=pprint.PrettyPrinter(indent=4)

        # Get registration queue
        queue = self.sqs_client.create_queue(QueueName='Battleship_Registration')
        sqs_arn = self.sqs_client.get_queue_attributes(QueueUrl=queue['QueueUrl'], AttributeNames=['QueueArn'])['Attributes']['QueueArn']

        # Subscribe to own topic
        self.sns_client.subscribe(TopicArn='arn:aws:sns:us-east-2:849664249614:BR_Topic', Protocol='sqs', Endpoint=sqs_arn)

        # Create topic for commuications to this bot
        topic_arn = self.sns_client.create_topic(Name='elsporko')

        # Tie topic to queue
        policy = sqs_policy.get_policy('elsporko', 'Battleship_Registration', queue['QueueUrl'])
        self.sqs_client.set_queue_attributes(QueueUrl=queue['QueueUrl'], Attributes={'Policy': policy})

        # Connect topic to queue
        # Subscribe to own topic
        self.sns_client.subscribe(TopicArn=topic_arn['TopicArn'], Protocol='sqs', Endpoint=sqs_arn)

        # Prepare and publish registration message
        message = "action=register;handle={};topic_arn={}".format(self.get_fake_name(),topic_arn['TopicArn']) 
        self.sns_client.publish(TopicArn='arn:aws:sns:us-east-2:849664249614:BR_Topic', Message=message)

        registered = False

        # Keep trying to register a unique handle
        while not registered:
            payload = self.sqs_client.receive_message(QueueUrl=queue['QueueUrl'])
            if 'Messages' not in payload:
                continue
            for msg in payload['Messages']:
                receipthandle=msg['ReceiptHandle']
                msg = dict(item.split("=") for item in json.loads(msg['Body'])['Message'].split(";"))
                if 'registration' in msg and msg['registration']=='SUCCESS':
                    self.playerRoster[msg['handle']]={
                        'me': 1,
                        'order': int(msg['order']),
                        'topic_arn': msg['topic_arn']
                    }
                    self.playerOrder[int(msg['order'])]=msg['handle']
                    print ("Roster: ", self.playerRoster)
                    self.sqs_client.delete_message(QueueUrl=queue['QueueUrl'], ReceiptHandle=receipthandle)
                    registered=True
                    print("Should break now")
                    break
                elif 'registration' in msg and msg['registration']=='FAIL':
                    message = "action=register;handle={};topic_arn={}".format(self.get_fake_name(),topic_arn['TopicArn']) 
                    self.sns_client.publish(TopicArn='arn:aws:sns:us-east-2:849664249614:BR_Topic', Message=message)
                    registered=True
        return

    # return a fake name from the predetermined list
    def get_fake_name (self):
        fake_name = self.fake_names[randint(0, len(self.fake_names)) - 1]
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

