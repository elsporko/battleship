import boto3
import json
import random
import string

class SQS_Policy(object):
    def __init__(self, queue_name='Battleship_Registration'):
        # Create reusable sns and sqs client resources
        self.sns_client = boto3.client('sns', 'us-east-2')
        self.sqs_client = boto3.client('sqs', 'us-east-2')
        self.sqs_resource = boto3.resource('sqs', 'us-east-2')
        #TODO Validation of queue_name

        # Subscribe to Registration topic
        self.queue = self.sqs_resource.get_queue_by_name(QueueName=queue_name)
      
        sqs_arn = self.sqs_client.get_queue_attributes(QueueUrl=self.queue.url, AttributeNames=['QueueArn'])['Attributes']['QueueArn']

        # Create topic for commuications to this bot and store it in the Player object. Topic name is a random string of 16 characters and letters
        self.my_topic_name = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(16)])
        self.my_topic_arn = self.sns_client.create_topic(Name=self.my_topic_name)

        # Tie topic to queue
        policy = self.build_policy(self.my_topic_name, queue_name, self.queue.url)

        self.sqs_client.set_queue_attributes(QueueUrl=self.queue.url, Attributes={'Policy': policy})

        # Connect topic to queue
        # Subscribe to own topic
        self.sub_arn = self.sns_client.subscribe(TopicArn=self.my_topic_arn['TopicArn'], Protocol='sqs', Endpoint=sqs_arn)

        # Set subscription filter
        self.sns_client.set_subscription_attributes(SubscriptionArn=self.sub_arn['SubscriptionArn'], AttributeName="FilterPolicy", AttributeValue="{{\"topic_type\": [\"{}\"]}}".format(self.my_topic_arn['TopicArn']))

    def policy_has_permissions_for_topic(self, policy, topic_arn):
        for statement in policy['Statement']:
            if statement['Condition']['ArnEquals']['aws:SourceArn'] == topic_arn and statement['Effect'] == 'Allow':
                return True
            return False
    
    def build_policy(self, topic_name, queue_name, queue_url):
        
        topic_arn = self.sns_client.create_topic(Name=topic_name)['TopicArn']
        sqs_arn = self.sqs_client.get_queue_attributes(QueueUrl=queue_url, AttributeNames=['QueueArn'])['Attributes']['QueueArn']
        policy =  self.sqs_client.get_queue_attributes(QueueUrl=queue_url, AttributeNames=['Policy'])
        if 'Attributes' in policy:
            policy = json.loads(policy['Attributes']['Policy'])
    
        if 'Version' not in policy:
            policy['Version'] = "2012-10-17"
        if 'Id' not in policy:
            policy['Id'] = "%s/SQSDefaultPolicy" % "arn:aws:sqs:us-east-2:849664249614:{}".format('Topic_Queue')
        if 'Statement' not in policy:
            policy['Statement'] = []
        if 'ResponseMetadata' in policy:
            del policy['ResponseMetadata']
    
        sid = "{}2SQS".format(topic_name)
        if not self.policy_has_permissions_for_topic (policy, topic_arn):
            res = "arn:aws:sqs:us-east-2:849664249614:{}".format(queue_name)
    
            policy['Statement'].append({
              "Sid":sid,
              "Effect": "Allow",
              "Principal": {
                "AWS": "*"
              },
              "Action": "SQS:SendMessage",
              "Resource": res,
              "Condition": {
                "ArnEquals": {
                  "aws:SourceArn": topic_arn
                }
              }
            })
    
        # Return policy as a string
        return (json.dumps(policy))
    
