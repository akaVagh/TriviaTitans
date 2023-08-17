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
    # Get the team name from the query string parameters
    team_name = event['queryStringParameters']['teamName']

    db = firestore.client()
    teams_stats_col = db.collection('TeamStatistics')

    # Query for documents where 'name' field is the team name
    teams_query = teams_stats_col.where('teamName', '==', team_name)
    teams_query_results = teams_query.stream()

    # Initialize list to store team stats
    teams_stats = []

    # Iterate over query results
    for doc in teams_query_results:
        team_stats = doc.to_dict()
        # Convert any datetime fields to strings
        for match in team_stats['matchHistory']:
            match['Date'] = match['Date'].strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        teams_stats.append(team_stats)

    # Check if any team stats were found
    if not teams_stats:
        return {
            'statusCode': 404,
            'body': json.dumps('Team stats not found'),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
        }
    else:
        return {
            'statusCode': 200,
            'body': json.dumps(teams_stats),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
        }
