import json
import boto3

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    action = body['action']
    data = body['data']

    if action == 'updateReadyStatus':
        payload = json.dumps(data)
        response = lambda_client.invoke(
            FunctionName='updateReadyStatus',
            InvocationType='RequestResponse',
            Payload=payload
        )
    elif action == 'START_GAME':
        payload = json.dumps(data)
        print(payload)
        response = lambda_client.invoke(
            FunctionName='arn:aws:lambda:us-east-1:475379753728:function:StartGameFunction-StartGameFunction-Kba2nVdp1slq',
            InvocationType='RequestResponse',
            Payload=payload
        )

    elif action == 'NEXT_QUESTION':
        payload = json.dumps(data)
        print(payload)
        response = lambda_client.invoke(
            FunctionName='arn:aws:lambda:us-east-1:475379753728:function:GetNextQuestion-GetNextQuestionFunction-yBh7RMBuUohd',
            InvocationType='RequestResponse',
            Payload=payload
        )

    # Parse the response from the second function
    response_payload = json.loads(response['Payload'].read().decode('utf-8'))

    return_response = {
        'statusCode': response_payload['statusCode'],
        'body': response_payload['body'],
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        }
    }

    print(return_response)

    # Return the response from the second function
    return return_response