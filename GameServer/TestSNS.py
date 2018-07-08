import boto3
import json
#from game.sqs_policy import SQS_Policy

sns_client = boto3.client('sns')
sqs_client = boto3.client('sqs')

# Build a policy:
# * Get current policy
# * Check for Version, Id, Statement and add if needed
# * Check for permissions
# * Add permissions if needed

def policy_has_permissions_for_topic(policy, topic_arn):

    for statement in policy['Statement']:
        if statement['Condition']['ArnEquals']['aws:SourceArn'] == topic_arn and statement['Effect'] == 'Allow':
            return True
    return False

def build_policy(topic_name, queue_name, queue_url):
    
    topic_arn = sns_client.create_topic(Name=topic_name)['TopicArn']
    sqs_arn = sqs_client.get_queue_attributes(QueueUrl=queue['QueueUrl'], AttributeNames=['QueueArn'])['Attributes']['QueueArn']
    policy =  sqs_client.get_queue_attributes(QueueUrl=queue['QueueUrl'], AttributeNames=['Policy'])
    if 'Attributes' in policy:
        policy = json.loads(policy['Attributes']['Policy'])

    if 'Version' not in policy:
        print("Adding Version")
        policy['Version'] = "2012-10-17"
    if 'Id' not in policy:
        print("Adding Id")
        policy['Id'] = "%s/SQSDefaultPolicy" % "arn:aws:sqs:us-east-2:849664249614:{}".format('Topic_Queue')
    if 'Statement' not in policy:
        print("Adding Statement")
        policy['Statement'] = []
    if 'ResponseMetadata' in policy:
        print("Deleting ResponseMetadata")
        del policy['ResponseMetadata']

    sid = "{}2SQS".format(topic_name)
    if not policy_has_permissions_for_topic (policy, topic_arn):
        res = "arn:aws:sqs:us-east-2:849664249614:{}".format(queue_name)

        policy['Statement'].append({
          "Sid":sid,
          "Effect": "Allow",
          "Principal": {
            "AWS": "*"
          },
          "Action": ["SQS:SendMessage"],
          "Resource": res,
          "Condition": {
            "ArnEquals": {
              "aws:SourceArn": topic_arn
            }
          }
        })

    # Return policy as a string
    return (json.dumps(policy))

# Create queue
print("Creating queue Test_Queue")
queue = sqs_client.create_queue(QueueName='Test_Queue')
sqs_arn = sqs_client.get_queue_attributes(QueueUrl=queue['QueueUrl'], AttributeNames=['QueueArn'])['Attributes']['QueueArn']

# Create topic
print("Creating topic Test_Topic")
sns_game_topic = sns_client.create_topic(Name='Test_Topic')
sns_arn = sns_game_topic['TopicArn']

# Tie queue with topic
print ("Tie topic to queue")
policy = build_policy('Test_Topic', 'Test_Queue', queue['QueueUrl'])
sqs_client.set_queue_attributes(QueueUrl=queue['QueueUrl'], Attributes={'Policy': policy})

# Subscribe to topic
print ("Subscribing to topic")
# Subscribe to topic
print ("Topic arn: ", sns_arn)
sub_arn = sns_client.subscribe(TopicArn=sns_arn, Protocol='sqs', Endpoint=sqs_arn)
print ("sub arn: ", sub_arn['SubscriptionArn'])

# Set subscription filter
print ("Setting subscription filter")
f = sns_client.set_subscription_attributes(SubscriptionArn=sub_arn['SubscriptionArn'], AttributeName="FilterPolicy", AttributeValue="{\"topic_type\": [\"Test_Topic\"]}")
print ("filter: ", f)

print ("Retrieving Messages")
messages = sqs_client.receive_message(QueueUrl=queue['QueueUrl'],MaxNumberOfMessages=10, WaitTimeSeconds=2, VisibilityTimeout=3)
msg_ids=dict()
if 'Messages' in messages:
    for message in messages['Messages']:
        body = json.loads(message['Body'])
        print ("body: ", json.dumps(body, indent=4))
        if body['MessageId'] not in msg_ids:
            bmsg = json.loads(body['Message'])
            #print ("msg attribs: ", json.dumps(body['MessageAttributes']))
            msg_ids[body['MessageId']]=bmsg['message']
            print(json.dumps(bmsg))

print (msg_ids)
