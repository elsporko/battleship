import boto3
import json
import random
import string
import time

class SQS_Policy(object):
    def __init__(self, queue_name=None, topic_name=None):
        # Create reusable sns and sqs client resources
        self.sns_client = boto3.client('sns', 'us-east-2')
        self.sqs_client = boto3.client('sqs', 'us-east-2')
        self.sqs_resource = boto3.resource('sqs', 'us-east-2')
        #TODO Validation of queue_name

        # Create own queue
        queue_name = queue_name or self.aws_name()
        print("Creating queue: ", queue_name)
        self.queue = self.sqs_resource.create_queue(QueueName=queue_name)
        self.my_topic_name = topic_name or self.aws_name()

        # Subscribe to Registration topic
        self.reg_queue = self.sqs_resource.get_queue_by_name(QueueName=queue_name)
      
        sqs_arn = self.sqs_client.get_queue_attributes(QueueUrl=self.reg_queue.url, AttributeNames=['QueueArn'])['Attributes']['QueueArn']

        # Create topic for commuications to this bot and store it in the Player object. Topic name is a random string of 16 characters and letters
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

    def get_message(self, topic_filter=None, msg_ids=dict()):
        topic_filter = topic_filter or self.my_topic_name
        print ("Retrieving Messages")
        messages = self.sqs_client.receive_message(QueueUrl=self.queue.url,MaxNumberOfMessages=10, WaitTimeSeconds=2, VisibilityTimeout=10)
    
        if 'Messages' in messages:
            #print ("messages: ", json.dumps(messages, indent=4))
            for message in messages['Messages']:
                body = json.loads(message['Body'])
                if body['MessageId'] not in msg_ids:
                    bmsg = json.loads(body['Message'])
                    #print ("body: ", json.dumps(body, indent=4))
                    a = body['MessageAttributes']
                    continue
                try:
                    topic_filter in a['topic_type']['Value'] 
    
                except KeyError:
                    #time.sleep(5)
                    return self.get_message(topic_filter, msg_ids)
    
                if a['topic_type']['Value'] == topic_filter:
                    return(bmsg)
    
                #msg_ids[body['MessageId']]=bmsg['message']
                msg_ids[body['MessageId']]=body['MessageId']
                #time.sleep(5)
                return self.get_message(topic_filter, msg_ids)

    """ Send message to destination(s) """
    def send_message(self, message, destination):
        resp = ''
        try:
            for d in destination:
                print ("d: ", d)
                resp = self.sns_client.publish(TopicArn=d, Message=json.dumps(message), MessageAttributes={'topic_type':{'DataType': 'String','StringValue': d}})
                print("Response: ", resp)
        except:
            print("Could not publish message: ", message)
            print("Reason: ", resp)

    def aws_name(self):
        return ''.join([random.choice(string.ascii_letters + string.digits) for n in range(16)])
