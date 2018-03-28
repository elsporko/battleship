import boto3
import json
import sys
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
    msg=json.loads(payload['Message'])
    payload=json.loads(payload['Message'])
    message = {"registration": "FAIL", 'arn': payload['arn']}
    print("register payload: ", payload)
    if 'handle' in payload and payload['handle'] not in game.playerRoster:
        game.playerRoster[payload['handle']]={'handle': payload['handle'], 'arn': payload['arn'], 'order': game.order}
        try:
            sub_ret = sns_client.subscribe(TopicArn=payload['arn'], Protocol='sqs', Endpoint=sqs_arn)
        # Do not register if topic has been deleted
        except:
            print("Could not subscribe to endpoint: ", sub_ret)
            return

        # message returned to caller
        message = {"registration": "SUCCESS",
                   "arn": payload["arn"],
                   "order" : game.order,
                   "handle" : payload['handle'],
                   "registered_players" : game.playerRoster
                  }
        game.order += 1

    try:
        print("message: ", message)
        resp = sns_client.publish(TopicArn=payload['arn'], Message=json.dumps(message))
        print ("Roster: {}\n\n".format(game.playerRoster))
        return
    except KeyError:
        print("payload: ", payload)
        print("register KeyError")
        return
    except TypeError:
        print("register TypeError")
        return
    except NotFound:
        print("register NotFound - Need to do something more than print")
        return

    # next, we delete the message from the queue so no one else will process it again
    sqs_client.delete_message(QueueUrl=queue['QueueUrl'], ReceiptHandle=message['ReceiptHandle'])

    return

count=1
while True:
    messages = sqs_client.receive_message(QueueUrl=queue['QueueUrl'],MaxNumberOfMessages=1, WaitTimeSeconds=20)
    print ("received message({}): {}".format(count, messages))
    count = count + 1
    if 'Messages' in messages: # when the queue is exhausted, the response dict contains no 'Messages' key
        for message in messages['Messages']: # 'Messages' is a list
            # process the messages
            process_message(message['Body'])

