import boto3

sns_client = boto3.client('sns')
sqs_client = boto3.client('sqs')

# Create topic
sns_game_topic = sns_client.create_topic(Name='Battleship_Registration')

# Create queue
queue = sqs_client.create_queue(QueueName='Battleship_Registration.fifo', Attributes={'FifoQueue':'true', 'ContentBasedDeduplication': 'true'})
sqs_arn = sqs_client.get_queue_attributes(QueueUrl=queue['QueueUrl'], AttributeNames=['QueueArn'])['Attributes']['QueueArn']

sns_arn = sns_game_topic['TopicArn']

#print ("sns_arn: ", sns_arn)
#print ("sqs_arn: ", sqs_arn)
#print ("sqs_url: ", queue['QueueUrl'])

sns_client.subscribe(TopicArn=sns_arn, Protocol='sqs', Endpoint=sqs_arn)
#while(1):
#message1 = sqs_client.receive_message(QueueUrl=queue['QueueUrl'])
#print ("message1: ", message1)
#print ("message1: ", message1['Messages'])

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
