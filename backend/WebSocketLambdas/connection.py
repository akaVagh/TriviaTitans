import boto3

def lambda_handler(event, context):
    dynamodb = boto3.client('dynamodb')
    # dynamodb.put_item(
    #     TableName='WebSocketConnections',
    #     Item={
    #         'connectionId': {'S': event['requestContext']['connectionId']}
    #     }
    # )
    print(event)
    team_id = event['queryStringParameters'].get('teamId')
    connection_id = event['requestContext']['connectionId']

    dynamodb.put_item(
        TableName='WebSocketConnections',
        Item={
            'teamId': {'S': team_id},
            'connectionId': {'S': connection_id}
        }
    )


    return {
        'statusCode': 200,
        'body': 'Connected.'
    }
