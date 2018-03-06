import boto3
import json
import random
import string
from battleship.sqs_policy import SQS_Policy

class Player:
    def __init__(self):
        self.playerRoster = {} # Placeholder for all players in the game self.playerOrder = [0 for x in range(100)] # Order of player turn
        # Max number of players is 20 as data is processed on 1 queue and the max number of policies tied to a queue is 20
        self.playerOrder = [None for x in range(20)]
        self.orderIndex = 0
        self.sns_client = boto3.client('sns', 'us-east-2')
        self.sqs_client = boto3.client('sqs', 'us-east-2')
        self.fake_names = ['Hugh Mann', 'elsporko', 'Amanda Hugenkiz', 'Not A Bot']
        self.main_queue = self.sqs_client.create_queue(QueueName='Battleship_Registration')
        #self.flow = ['register','game']
        #self.currentFlow: undefined
        
    def canMove(self):
        if self.playerOrder.length > move.getMoveSize():
            return true;
        return false;

    # Register handle
    def register(self,handle):
        sqs_policy = SQS_Policy()

        # Get registration queue
        queue = self.main_queue
        sqs_arn = self.sqs_client.get_queue_attributes(QueueUrl=queue['QueueUrl'], AttributeNames=['QueueArn'])['Attributes']['QueueArn']

        # Subscribe to registration topic
        self.sns_client.subscribe(TopicArn='arn:aws:sns:us-east-2:849664249614:BR_Topic', Protocol='sqs', Endpoint=sqs_arn)

        # Create topic for commuications to this bot and store it in the Player object. Topic name is a random string of 16 characters and letters
        self.my_topic_name = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(16)])
        self.my_topic_arn = self.sns_client.create_topic(Name=self.my_topic_name)

        # Tie topic to queue
        policy = sqs_policy.get_policy(self.my_topic_name, 'Battleship_Registration', queue['QueueUrl'])
        self.sqs_client.set_queue_attributes(QueueUrl=queue['QueueUrl'], Attributes={'Policy': policy})

        # Connect topic to queue
        # Subscribe to own topic
        resp = self.sns_client.subscribe(TopicArn=self.my_topic_arn['TopicArn'], Protocol='sqs', Endpoint=sqs_arn)

        # Prepare and publish registration message
        fake_name = self.get_fake_name()
        message = {
            "action": "register",
            "handle": fake_name,
            "topic_arn": self.my_topic_arn['TopicArn']
        }
        self.sns_client.publish(TopicArn='arn:aws:sns:us-east-2:849664249614:BR_Topic', Message=json.dumps(message))

        registered = False
        empty_name_list = False

        # Keep trying to register a unique handle
        while not registered and not empty_name_list:
            payload = self.sqs_client.receive_message(QueueUrl=queue['QueueUrl'],MaxNumberOfMessages=10, WaitTimeSeconds=5)

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
                    print ("Roster: ", self.playerRoster)
                    self.sqs_client.delete_message(QueueUrl=queue['QueueUrl'], ReceiptHandle=receipthandle)
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

                    self.sns_client.publish(TopicArn='arn:aws:sns:us-east-2:849664249614:BR_Topic', Message=json.dumps(message))
                    self.sqs_client.delete_message(QueueUrl=queue['QueueUrl'], ReceiptHandle=receipthandle)
                else:
                    print("Should not get here: ", msg)
        return

    def cleanup_subscription(self):
        self.sns_client.delete_topic(TopicArn=self.my_topic_arn['TopicArn'])
        #sqs_policy = SQS_Policy()
        #policy=sqs_policy.delete_policy(Arn=self.my_topic_arn['TopicArn'], Queue=queue)
        #self.sqs_client.set_queue_attributes(QueueUrl=queue['QueueUrl'], Attributes={'Policy': policy})

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

