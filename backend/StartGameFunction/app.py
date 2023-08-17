import requests
import boto3
import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google.cloud import pubsub_v1
import logging
import os

# Setting up logging
logging.basicConfig(level=logging.INFO)

# Initialize the Firebase Admin SDK
cred = credentials.Certificate('./serviceAccountKey.json')
default_app = firebase_admin.initialize_app(cred)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./serviceAccountKey.json"

db = firestore.client()

dynamodb = boto3.resource('dynamodb')


def lambda_handler(event, context):
    logging.info(event)
    try:
        game_id = event['gameId']
        team_id = event['teamId']

        print(event)

        # Get the game details from DynamoDB
        table = dynamodb.Table('GamesTable')
        game = table.get_item(Key={'gameID': game_id})['Item']

        teams = {}
        response = requests.get(
            f'https://sq9k6vbyqf.execute-api.us-east-1.amazonaws.com/test/team?teamId={team_id}')
        teams[team_id] = response.json()

        logging.info(f"Teams: {teams}")

        # Store only questionIDs
        question_ids = [question['questionID']
                        for question in game['questions']]

        game_category = game['category']
        diff_level = game['difficultyLevel']

        game_state = {
            'gameId': game_id,
            'questionIds': question_ids,
            'category': game_category,
            'difficultyLevel': diff_level,
            'teams': teams,
            'scores': {
                team_id: {
                    'teamScore': 0,
                    'members': {
                        member['userEmail']: {
                            'correctAnswersCount': 0,
                            'incorrectAnswersCount': 0
                        } for member in teams[team_id]['teamMembers']
                    }
                }
            },
            'totalQuestions': len(question_ids),
            'currentQuestionIndex': 0,
            # Include who is allowed to answer
            'currentAnsweringUserIndex': {team_id: 0 for team_id in teams},
            'nextResponder': teams[team_id]['teamMembers'][0]['userEmail']
        }

        # print(json.dumps(game_state, indent=4))

        # Set the current game state in Firestore
        doc_ref = db.collection('currentGame').document(game_id)
        doc_ref.set(game_state, merge=True)

        action = "FIRST_QUESTION"

        # TODO: Replace get request with nikhil
        # Fetch the first question
        first_question_response = requests.get(
            f'https://3eqgdvn9wf.execute-api.us-east-1.amazonaws.com/dev/getquestion?questionId={question_ids[0]}')
        first_question = first_question_response.json()

        # Include the nextResponder in the first question message
        first_question_message = {
            'gameId': game_id,
            'questionIndex': 0,
            'totalQuestions': len(question_ids),
            'question': first_question,
            'nextResponder': game_state['nextResponder']
        }

        publish_message = {
            'action': action,
            'teamId': team_id,
            'data': first_question_message
        }

        # Instantiate a Pub/Sub client with the scoped credentials.
        publisher = pubsub_v1.PublisherClient()

        topic_path = publisher.topic_path(
            'serverless-project-21', 'GameStarted')

        # Convert game state to JSON and encode it to bytes
        publish_message_str = json.dumps(publish_message)
        publish_message_bytes = publish_message_str.encode('utf-8')

        # Publish the game state
        publish_future = publisher.publish(
            topic_path, data=publish_message_bytes)
        publish_future.result()  # wait for the publish call to complete

        return {
            'statusCode': 200,
            'body': json.dumps({"message": "Game Started!"}),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
        }

    except Exception as e:
        # log the error with a traceback
        logging.error("Error occurred:", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({"message": "An error occurred while starting the game"}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
        }
