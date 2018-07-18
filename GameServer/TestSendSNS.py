import boto3
import json

sns_client = boto3.client('sns')
resp=''

message={'message': 'Hello World'}
msg_atr={'topic_type':{'DataType': 'String','StringValue':'Test_Topic'}}

print ("Publishing: ", json.dumps(message))
try:
    # Basic
    #resp = sns_client.publish(TopicArn="arn:aws:sns:us-east-2:849664249614:Test_Topic", Message=json.dumps(message))
    #resp = sns_client.publish(TopicArn="arn:aws:sns:us-east-2:849664249614:Test_Topic", Message=json.dumps(message), MessageAttributes={'topic_type':{'DataType': 'String','StringValue':'Test_Topic'}})
    resp = sns_client.publish(TopicArn="arn:aws:sns:us-east-2:849664249614:Test_Topic", Message=json.dumps(message), MessageAttributes=msg_atr)
    # If resp != messageId then trouble abrewin
    print("Response: ", resp)
except:
    print("Could not publish message: ", message)

message={'message': 'Hello from the other side'}
msg_atr={'topic_type':{'DataType': 'String','StringValue':'Test_Topic'}}
print ("Publishing: ", json.dumps(message))
try:
    # Basic
    #resp = sns_client.publish(TopicArn="arn:aws:sns:us-east-2:849664249614:Test_Topic2", Message=json.dumps(message))
    resp = sns_client.publish(TopicArn="arn:aws:sns:us-east-2:849664249614:Test_Topic2", Message=json.dumps(message), MessageAttributes={'topic_type':{'DataType': 'String','StringValue':'Test_Topic2'}})
    ##resp = sns_client.publish(TopicArn="arn:aws:sns:us-east-2:849664249614:Test_Topic2", Message=json.dumps(message), MessageAttributes=msg_atr)
    print("Response: ", resp)
except:
    print("Could not publish message: ", message)
