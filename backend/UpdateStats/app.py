import os
import json
from datetime import datetime
from decimal import Decimal

import boto3
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


# Initialize the Firebase Admin SDK
cred = credentials.Certificate('./serviceAccountKey.json')
default_app = firebase_admin.initialize_app(cred)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./serviceAccountKey.json"


def lambda_handler(event, context):
    game_id = event['gameId']
    game_state = event['gameState']
    team_id = event['teamId']

    db = firestore.client()

    # Retrieve Firestore document references
    users_stats_col = db.collection('UserStatistics')
    teams_stats_col = db.collection('TeamStatistics')

    # Calculate total questions count for the won logic
    total_questions_count = len(game_state['questionIds'])

    team_data = game_state['teams'][team_id]
    team_score = game_state['scores'][team_id]['teamScore']
    team_won = team_score >= total_questions_count / 2  # Team won logic

    # Update team stats
    team_stats_ref = teams_stats_col.document(team_id)
    team_stats = team_stats_ref.get().to_dict()

    if team_stats is None:
        team_stats = {
            'teamName': team_data['teamName'],
            'matchHistory': [],
            'totalMatches': 0,
            'totalPoints': 0,
            'totalWins': 0,
            'totalLosses': 0
        }
    else:
        match_history = team_stats['matchHistory']

    match_history = team_stats['matchHistory']
    match_history.append({
        'Date': datetime.now(),  # Server timestamp
        'Game': game_id,
        'Category': game_state['category'],
        'Difficulty': game_state['difficultyLevel'],
        'Points': team_score,
        'Won': team_won,
        'team': team_data['teamName']
    })

    team_stats['totalMatches'] += 1
    team_stats['totalPoints'] += team_score
    team_stats['totalWins'] += int(team_won)  # Increase only if team won
    # Increase only if team lost
    team_stats['totalLosses'] += int(not team_won)

    team_stats_ref.set(team_stats)  # Update Firestore

    # Update user stats
    for user_email, user_data in game_state['scores'][team_id]['members'].items():
        # User's points logic
        user_points = user_data['correctAnswersCount']
        user_won = team_won  # User's won logic

        # Calculate user incorrect answers
        user_incorrect_answers = user_data['incorrectAnswersCount']

        user_stats_ref = users_stats_col.document(user_email)
        user_stats = user_stats_ref.get().to_dict()

        if user_stats is None:
            user_stats = {
                'matchHistory': [],
                'totalMatches': 0,
                'totalPoints': 0,
                'totalWins': 0,
                'totalLosses': 0,
                'incorrectAnswers': 0
            }
        else:
            match_history = user_stats['matchHistory']

        match_history = user_stats['matchHistory']
        match_history.append({
            'Date': datetime.now(),  # Server timestamp
            'Game': game_id,
            'Points': user_points,
            'Won': user_won,
            'team': team_data['teamName']
        })

        user_stats['totalMatches'] += 1
        user_stats['totalPoints'] += user_points
        # Increase only if user won
        user_stats['totalWins'] += int(user_won)
        # Increase only if user lost
        user_stats['totalLosses'] += int(not user_won)
        user_stats['incorrectAnswers'] += user_incorrect_answers

        user_stats_ref.set(user_stats)  # Update Firestore
