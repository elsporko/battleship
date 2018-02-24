import boto3

sns_client = boto3.client('sns')
sqs_client = boto3.client('sqs')

# Create topic
sns_game_topic = sns_client.create_topic(Name='BR_Topic')

# Create queue
queue = sqs_client.create_queue(QueueName='Battleship_Registration')
sqs_arn = sqs_client.get_queue_attributes(QueueUrl=queue['QueueUrl'], AttributeNames=['QueueArn'])['Attributes']['QueueArn']

sns_arn = sns_game_topic['TopicArn']

sns_client.subscribe(TopicArn=sns_arn, Protocol='sqs', Endpoint=sqs_arn)

while True:
    messages = sqs_client.receive_message(QueueUrl=queue['QueueUrl'])
    if 'Messages' in messages: # when the queue is exhausted, the response dict contains no 'Messages' key
        for message in messages['Messages']: # 'Messages' is a list
            # process the messages
            print(message['Body'])
            # next, we delete the message from the queue so no one else will process it again
            sqs_client.delete_message(QueueUrl=queue['QueueUrl'], ReceiptHandle=message['ReceiptHandle'])
#    else:
#        print('Queue is now empty')
#        break
