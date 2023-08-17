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
lambda_client = boto3.client('lambda')


def check_answer(submitted_answer, correct_answer):
    # Comparing the answers - considering case-insensitivity and stripping any leading/trailing white spaces
    return correct_answer.lower().strip() == submitted_answer.lower().strip()


def lambda_handler(event, context):
    try:
        game_id = event['gameId']
        team_id = event['teamId']

        print("teamId", team_id)

        ans_responder = event['ansResponder']
        submitted_answer = event['submittedAnswer']

        # Fetch the current game state from Firestore
        doc_ref = db.collection('currentGame').document(game_id)
        game_state = doc_ref.get().to_dict()

        print(game_state)

        # TODO: Replace request with nikhil's db
        # Get the correct answer from the current question
        current_question_id = game_state['questionIds'][game_state['currentQuestionIndex']]
        current_question_response = requests.get(
            f'https://3eqgdvn9wf.execute-api.us-east-1.amazonaws.com/dev/getquestion?questionId={current_question_id}')
        current_question = current_question_response.json()
        correct_answer = current_question['correctAnswer']

        # Check if submitted answer is correct
        is_correct = check_answer(submitted_answer, correct_answer)

        if is_correct:
            game_state['scores'][team_id]['members'][ans_responder]['correctAnswersCount'] += 1
            # Update team score
            game_state['scores'][team_id]['teamScore'] += 1
        else:
            game_state['scores'][team_id]['members'][ans_responder]['incorrectAnswersCount'] += 1

        # TODO: Replace request with nikhil's db
        # Check if this was the last question
        is_last_question = game_state['currentQuestionIndex'] + \
            1 == len(game_state['questionIds'])

        if is_last_question:
            game_state['isGameEnded'] = True
            # Update the game state in Firestore
            doc_ref.set(game_state, merge=True)

            # Team won logic
            team_won = game_state['scores'][team_id]['teamScore'] >= game_state['totalQuestions'] / 2

            # Publish the final scores to Pub/Sub
            publish_message = {
                'action': 'END_GAME',
                'teamId': team_id,
                'data': {
                    'gameId': game_id,
                    'scores': game_state['scores'],
                    'result': team_won
                }
            }

            payload = {
                'gameId': game_id,
                'teamId': team_id,
                'gameState': game_state
            }

            response = lambda_client.invoke(
                FunctionName='UpdateStats-UpdateStatsFunction-nrqOYHL23tpT',
                InvocationType='Event',  # use 'Event' for asynchronous execution
                Payload=json.dumps(payload),
            )

        else:
            # Update the currentQuestionIndex
            game_state['currentQuestionIndex'] += 1

            # Fetch the next question
            next_question_id = game_state['questionIds'][game_state['currentQuestionIndex']]
            next_question_response = requests.get(
                f'https://3eqgdvn9wf.execute-api.us-east-1.amazonaws.com/dev/getquestion?questionId={next_question_id}')
            next_question = next_question_response.json()

            # Update the currentAnsweringUserIndex and nextResponder for each team
            index = game_state['currentAnsweringUserIndex'][team_id]
            next_index = (
                index + 1) % len(game_state['teams'][team_id]['teamMembers'])
            game_state['currentAnsweringUserIndex'][team_id] = next_index
            game_state['nextResponder'] = game_state['teams'][team_id]['teamMembers'][next_index]['userEmail']

            # game_state['nextResponder'][team_id] = game_state['teams'][team_id]['teamMembers'][next_index]['userEmail']

            # Update the game state in Firestore
            doc_ref.set(game_state, merge=True)
            # Publish the next question to Pub/Sub
            publish_message = {
                'action': 'NEXT_QUESTION',
                'teamId': team_id,
                'data': {
                    'gameId': game_id,
                    'question': next_question,
                    'nextResponder': game_state['nextResponder'],
                    'questionIndex': game_state['currentQuestionIndex']
                }
            }
            print("publish_message: ", publish_message)

        publish_message_str = json.dumps(publish_message)
        publish_message_bytes = publish_message_str.encode('utf-8')

        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(
            'serverless-project-21', 'GameStarted')

        publish_future = publisher.publish(
            topic_path, data=publish_message_bytes)
        publish_future.result()

        return {
            'statusCode': 200,
            'body': json.dumps({"message": "Request processed successfully"}),
        }

    except Exception as e:
        # log the error with a traceback
        logging.error("Error occurred:", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({"message": "An error occurred while processing the request"}),
        }
