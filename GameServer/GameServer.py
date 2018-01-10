import boto3

sqs = boto3.resource('sqs')

queue = sqs.create_queue(QueueName='battleship.fifo', Attributes={'FifoQueue':'true', 'ContentBasedDeduplication': 'true'})
#print (queue.url)
#print (queue.attributes)

queue = sqs.get_queue_by_name(QueueName='battleship.fifo')
#response = queue.send_message(MessageBody='battleMessage', MessageAttributes={
#    'MoveType': {
#        'StringValue': 'Attack',
#        'DataType': 'String'
#    },
#    'Position': {
#        'StringValue': '0_0',
#        'DataType': 'String'
#    }
#})

response = queue.send_messages(Entries=[
    {
        'Id': '1',
        'MessageBody': 'Attack',
        'MessageGroupId': 'AttackMegan',
        'MessageAttributes': {
            'AttackMegan':{
                'StringValue': '0_0',
                'DataType': 'String'
            }
        }
    },
    {
        'Id': '2',
        'MessageBody': 'Attack2',
        'MessageGroupId': 'AttackRyan',
        'MessageAttributes': {
            'AttackRyan':{
                'StringValue': '0_0',
                'DataType': 'String'
            }
        }
    }
    ])

print (response)
#queue = sqs.create_queue(QueueName='battleship')
#print (queue.url)
#print (queue.attributes)
