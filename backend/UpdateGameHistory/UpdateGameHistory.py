import json
import boto3

dynamodb = boto3.resource('dynamodb')
# replace with your table name
table = dynamodb.Table('GameHistory')
lambda_client = boto3.client('lambda', region_name='us-east-1')

def lambda_handler(event, context):
    # assume the event has the game state
    game_state = event

    # construct game history item
    game_history_item = {
        'gameId': game_state['gameId'],
        'questionIndex': game_state['currentQuestionIndex'],
        'totalQuestions': len(game_state['questionIds']),
        'teamInfo': {},
        'questionIds': game_state['questionIds'],
        'isGameEnded': game_state['isGameEnded'],
    }

    for team_id, team_data in game_state['teams'].items():
        team_state = game_state['scores'][team_id]
        game_history_item['teamInfo'][team_id] = {
            'teamScore': team_state['teamScore'],
            'members': team_state['members'],
            'teamMembers': team_data['teamMembers'],
            'teamName': team_data['teamName']
        }

    # put the game history item into the DynamoDB table
    table.put_item(Item=game_history_item)


    # invoke the second lambda with game_state
    lambda_client.invoke(
        FunctionName='UpdateUserStatisitc',  # replace with the name of the second lambda function
        InvocationType='Event',  # 'Event' for asynchronous invocation
        Payload=json.dumps(game_state),
    )

    return {
        'statusCode': 200,
        'body': 'Game history saved successfully'
    }
