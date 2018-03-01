import boto3
import json
from game.game import Game
from game.sqs_policy import SQS_Policy

game=Game()

sns_client = boto3.client('sns')
sqs_client = boto3.client('sqs')

# Create topic
sns_game_topic = sns_client.create_topic(Name='BR_Topic')
sns_arn = sns_game_topic['TopicArn']

# Create queue
queue = sqs_client.create_queue(QueueName='Battleship_Registration')
sqs_arn = sqs_client.get_queue_attributes(QueueUrl=queue['QueueUrl'], AttributeNames=['QueueArn'])['Attributes']['QueueArn']
sqs_policy = SQS_Policy()

# Tie queue with topic
policy = sqs_policy.get_policy('BR_Topic', 'Battleship_Registration', queue['QueueUrl'])
sqs_client.set_queue_attributes(QueueUrl=queue['QueueUrl'], Attributes={'Policy': policy})

# Subscribe to topic
sns_client.subscribe(TopicArn=sns_arn, Protocol='sqs', Endpoint=sqs_arn)

def process_message(message):
    msg = json.loads(message)
    payload = dict(item.split("=") for item in msg['Message'].split(";"))
    actions = {
        'register': register(payload),
    }

    print("processing: ", payload['action'])
    # Message formatted in comma delimited key/value pairs separated by semicolons
    actions[payload['action']]

def register(payload):
    message = 'registration=FAIL'
    print ("Roster: ", game.playerRoster)
    if payload['handle'] not in game.playerRoster:
        game.playerRoster[payload['handle']]={'handle': payload['handle'], 'arn': payload['topic_arn'], 'order': game.order}
        game.order += 1
        print("players: ", game.playerRoster)
        sns_client.subscribe(TopicArn=payload['topic_arn'], Protocol='sqs', Endpoint=sqs_arn)

        # message returned to caller
        print ("Publishing to: ", payload['topic_arn'])
        message = "registration=SUCCESS;topic_arn={};order={};handle={}".format(payload['topic_arn'], game.order, payload['handle'])
    print ("registration returning: ", message)
    sns_client.publish(TopicArn=payload['topic_arn'], Message=message)

while True:
    messages = sqs_client.receive_message(QueueUrl=queue['QueueUrl'])
    if 'Messages' in messages: # when the queue is exhausted, the response dict contains no 'Messages' key
        for message in messages['Messages']: # 'Messages' is a list
            # process the messages
            process_message(message['Body'])
            # next, we delete the message from the queue so no one else will process it again
            sqs_client.delete_message(QueueUrl=queue['QueueUrl'], ReceiptHandle=message['ReceiptHandle'])
#    else:
#        print('Queue is now empty')
#        break

