import requests
import os
import boto3

SLACK_URL = os.environ['SLACK_URL']
TABLE_NAME = os.environ['TABLE_NAME']

dynamodb = boto3.client('dynamodb')

def handler(event, context): 
    print("event = {}".format(event))

    for record in event['Records']:
        message = record['Sns']['Message']

        result = dynamodb.put_item(
            TableName=TABLE_NAME,
            Item={
                'id': { 'S': record['Sns']['MessageId'] },
                'message': { 'S': message }
            }
        )
        print("ddb result = {}".format(result))

        payload = { "text": message }
        requests.post(SLACK_URL, json=payload)