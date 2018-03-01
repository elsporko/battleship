import boto3
import json

class SQS_Policy:
    def get_policy(self, topic_name, queue_name, queue_url):
        
        queue = boto3.resource('sqs', endpoint_url=queue_url).get_queue_by_name(QueueName=queue_name)
        topic = boto3.resource('sns')

        topic_arn = topic.create_topic(Name=topic_name).attributes['TopicArn']
        policy = self.get_queue_policy(queue)
        sid = "{}2SQS".format(topic_name)
        sourcearn = "arn:aws:sns:us-east-2:849664249614:{}".format(topic_name)
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
                  "aws:SourceArn": sourcearn
                }
              }
            })

        return (json.dumps(policy))

    def get_queue_policy (self, queue):
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

