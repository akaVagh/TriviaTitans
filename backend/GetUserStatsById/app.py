import os
import json

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use the application default credentials
cred = credentials.Certificate('./serviceAccountKey.json')
default_app = firebase_admin.initialize_app(cred)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./serviceAccountKey.json"


def lambda_handler(event, context):
    # Get the user ID from the query string parameters
    user_id = event['queryStringParameters']['userId']

    db = firestore.client()
    users_stats_col = db.collection('UserStatistics')

    # Get the document with the user ID
    user_stats_ref = users_stats_col.document(user_id)
    user_stats = user_stats_ref.get().to_dict()

    print(user_stats)

    # Check if the user stats were found
    if user_stats is None:
        return {
            'statusCode': 404,
            'body': json.dumps('User stats not found'),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
        }
    else:
        for match in user_stats['matchHistory']:
            match['Date'] = match['Date'].strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        return {
            'statusCode': 200,
            'body': json.dumps(user_stats),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
        }
