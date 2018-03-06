import boto3
import json
from game.game import Game
from game.sqs_policy import SQS_Policy

game=Game()

sns_client = boto3.client('sns')
sqs_client = boto3.client('sqs')

print("Creating topic BR_Topic")
# Create topic
sns_game_topic = sns_client.create_topic(Name='BR_Topic')
sns_arn = sns_game_topic['TopicArn']

print("Creating queue Battleship_Registration")
# Create queue
queue = sqs_client.create_queue(QueueName='Battleship_Registration')
sqs_arn = sqs_client.get_queue_attributes(QueueUrl=queue['QueueUrl'], AttributeNames=['QueueArn'])['Attributes']['QueueArn']
sqs_policy = SQS_Policy()

print ("Tie topic to queue")
# Tie queue with topic
policy = sqs_policy.get_policy('BR_Topic', 'Battleship_Registration', queue['QueueUrl'])
sqs_client.set_queue_attributes(QueueUrl=queue['QueueUrl'], Attributes={'Policy': policy})

print ("Subscribing to topic")
# Subscribe to topic
sns_client.subscribe(TopicArn=sns_arn, Protocol='sqs', Endpoint=sqs_arn)

print ("GAME ON!!!!")
def process_message(message):
    payload = json.loads(message)
    actions = {
        'register': register(payload),
    }

    # Message formatted in comma delimited key/value pairs separated by semicolons
    try:
        actions[payload['action']]
    except KeyError:
        return

def register(payload):
    message = {"registration": "FAIL"}
    msg=json.loads(payload['Message'])
    payload=json.loads(payload['Message'])
    if 'handle' in payload and payload['handle'] not in game.playerRoster:
        game.playerRoster[payload['handle']]={'handle': payload['handle'], 'arn': payload['topic_arn'], 'order': game.order}
        sns_client.subscribe(TopicArn=payload['topic_arn'], Protocol='sqs', Endpoint=sqs_arn)

        # message returned to caller
        message = {"registration": "SUCCESS",
                   "topic_arn": payload["topic_arn"],
                   "order" : game.order,
                   "handle" : payload['handle']
                  }
        game.order += 1
    try:
        resp = sns_client.publish(TopicArn=payload['topic_arn'], Message=json.dumps(message))
    except KeyError:
        return
    except TypeError:
        return

    print ("Roster: ", game.playerRoster)

while True:
    messages = sqs_client.receive_message(QueueUrl=queue['QueueUrl'],MaxNumberOfMessages=10, WaitTimeSeconds=5)
    if 'Messages' in messages: # when the queue is exhausted, the response dict contains no 'Messages' key
        for message in messages['Messages']: # 'Messages' is a list
            # process the messages
            process_message(message['Body'])
            # next, we delete the message from the queue so no one else will process it again
            sqs_client.delete_message(QueueUrl=queue['QueueUrl'], ReceiptHandle=message['ReceiptHandle'])

