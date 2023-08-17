import boto3

def lambda_handler(event, context):
    print(f'Disconnect event received: {event}')
    dynamodb = boto3.client('dynamodb')
    dynamodb.delete_item(
        TableName='WebSocketConnections',
        Key={
            'connectionId': {'S': event['requestContext']['connectionId']}
        }
    )

    return {
        'statusCode': 200,
        'body': 'Disconnected.'
    }