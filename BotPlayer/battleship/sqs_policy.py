import boto3
import json
import random
import string

class SQS_Policy(object):
    def __init__(self):
        # Create reusable sns and sqs client resources
        self.sns_client = boto3.client('sns', 'us-east-2')
        self.sqs_client = boto3.client('sqs', 'us-east-2')
        self.sqs_resource = boto3.resource('sqs', 'us-east-2')

        # Subscribe to Registration topic
        self.queue = self.sqs_resource.get_queue_by_name(QueueName='Battleship_Registration')
      
        sqs_arn = self.sqs_client.get_queue_attributes(QueueUrl=self.queue.url, AttributeNames=['QueueArn'])['Attributes']['QueueArn']

        # Create topic for commuications to this bot and store it in the Player object. Topic name is a random string of 16 characters and letters
        self.my_topic_name = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(16)])
        self.my_topic_arn = self.sns_client.create_topic(Name=self.my_topic_name)

        # Tie topic to queue
        policy = self.get_policy(self.my_topic_name, 'Battleship_Registration', self.queue.url)
        self.sqs_client.set_queue_attributes(QueueUrl=self.queue.url, Attributes={'Policy': policy})

        # Connect topic to queue
        # Subscribe to own topic
        resp = self.sns_client.subscribe(TopicArn=self.my_topic_arn['TopicArn'], Protocol='sqs', Endpoint=sqs_arn)

    def get_policy(self, topic_name, queue_name, queue_url):
        
        topic_arn = self.sns_client.create_topic(Name=topic_name)['TopicArn']
        policy = self.get_queue_policy(self.queue)
        sid = "{}2SQS".format(topic_name)
        if not self.policy_has_permissions_for_topic (policy, topic_arn):
            policy['Statement'].append({
              "Sid":sid,
              "Effect": "Allow",
              "Principal": {
                "AWS": "*"
              },
              "Action": "SQS:SendMessage",
              "Resource": "arn:aws:sqs:us-east-2:849664249614:Battleship_Registration",
              "Condition": {
                "ArnEquals": {
                  "aws:SourceArn": topic_arn
                }
              }
            })

        return (json.dumps(policy))

    def get_queue_policy (self, queue=None):
        if not queue:
            queue = self.queue
        try:
            return json.loads(queue.attributes['Policy'])

        # If no current policy return a skeleton
        except KeyError:
            return {
                "Version": "2012-10-17",
                "Id": "%s/SQSDefaultPolicy" % queue.attributes['QueueArn'],
                "Statement": [],
            }

    def policy_has_permissions_for_topic(self, policy, topic_arn):
        for statement in policy['Statement']:
            if statement['Condition']['ArnEquals']['aws:SourceArn'] == topic_arn and statement['Effect'] == 'Allow':
                return True
        return False

    def delete_policy(self, Arn, Queue):
        policy = self.get_queue_policy()
        self.sqs_client.set_queue_attributes(QueueUrl=self.queue.url, Attributes={'Policy': json.dumps(policy)})

