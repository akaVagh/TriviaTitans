import base64
import json
import boto3
from google.cloud import pubsub_v1

dynamodb = boto3.resource('dynamodb')
# TODO: replace with your table name
table = dynamodb.Table('WebSocketConnections')
api_gateway_management = boto3.client(
    'apigatewaymanagementapi',
    endpoint_url='https://rireb5nnb2.execute-api.us-east-1.amazonaws.com/dev'
)


def receive_pubsub(event, context):

    # Get the JSON body from the event
    body = json.loads(event['body'])
    print('body: ', body)

    # The actual message is base64-encoded in 'data'
    message_base64 = body['message']['data']

    message_bytes = base64.b64decode(message_base64)
    message_str = message_bytes.decode('utf-8')

    received_message = json.loads(message_str)
    print('Received message:', received_message)

    # Get the teamId from the received message
    target_team_id = received_message.get('teamId')

    print("target_team_id: ", target_team_id)

    # Get all connections
    connections = table.scan()['Items']

    # Filter connections to only include those with the matching teamId
    matching_connections = [
        conn for conn in connections if conn.get('teamId') == target_team_id]

    print(f"Matching connections: {matching_connections}")

    # Send a message to each matching connection
    for connection in matching_connections:
        try:
            api_gateway_management.post_to_connection(
                ConnectionId=connection['connectionId'],
                # The data should be a JSON string
                Data=json.dumps(received_message)
            )
            print(f"Message sent to connection {connection['connectionId']}")
        except Exception as e:
            print(
                f"Error sending to connection {connection['connectionId']}: {e}")

    return {
        'statusCode': 200,
        'body': 'Message processed'
    }
