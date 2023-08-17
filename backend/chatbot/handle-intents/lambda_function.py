# Author: Shubham Mishra

########################################################################################
#    Code Reference: LexRuntimeV2
#    Author: AWS
#    Availability: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/lexv2-runtime.html
########################################################################################/

import requests
# Define intent names
navigationIntent = 'NavigationIntent'
teamScoresIntent = 'TeamScoresIntent'

def lambda_handler(event, context):
    # Extract intent name and user input from the Lex event
    intent_name = event['sessionState']['intent']['name']

    # Check the intent name and call the corresponding handler function
    if intent_name == navigationIntent:
        return handleNavIntent(event)

    if intent_name == teamScoresIntent:
        return handleTeamScoresIntent(event)


def handleNavIntent(event):
    # URL of the application
    app_url = "https://serverless-quizapp-mirroredrepo-ayabirf2sa-uc.a.run.app"

    # Extract slot values from the Lex event to access user input data
    slots = event['sessionState']['intent']['slots']
    nav_req_name = slots['navReqName']['value']['interpretedValue'].lower().strip()
    print("navReqName=", nav_req_name)
    
    # Dictionary mapping navigation requests to their corresponding URLs
    dictionary = {
        'landing': f'{app_url}/',
        'login': f'{app_url}/SignIn',
        'signin': f'{app_url}/SignIn',
        'signup': f'{app_url}/SignIn',
        'teams': f'{app_url}/welcomeTeamPage',
        'profile': f'{app_url}/profile',
        'invitation': f'{app_url}/inviteTeam',
        'statistics': f'{app_url}/UserStats',
        'stats': f'{app_url}/UserStats',
        'quiz': f'{app_url}/Quiz',
        'leaderboard': f'{app_url}/leaderboard',
    }
    
    if nav_req_name in dictionary:
        # If the user's navigation request exists in the dictionary, retrieve the corresponding URL
        response_str = f'URL of {nav_req_name} page is: {dictionary[nav_req_name]}'
    else:
        # If the user's navigation request is not found in the dictionary, provide a default response
        response_str = f'{nav_req_name} page not found.'
    
    # Response message containing the navigation URL
    response = {
        "sessionState": {
            "dialogAction": {
                "type": "Close"
            },
            "intent": {
                "name": "NavigationIntent",
                "state": "Fulfilled"
            }
        },
        "messages": [
            {
                "contentType": "PlainText",
                "content": response_str
            }
        ]
    }
    
    print("handleNavIntent==", response)
    
    # Return the response message to Lex for further processing and displaying to the user
    return response

########################################################################################
#    Code Reference: DynamoDB
#    Author: AWS
#    Availability: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/dynamodb.html
########################################################################################/

def handleTeamScoresIntent(event):
    slots = event['sessionState']['intent']['slots']
    team_name = slots['teamName']['value']['interpretedValue'].lower()
    
    api_url = f'https://jmflaholi8.execute-api.us-east-1.amazonaws.com/dev/getteamstatsbyname?teamName={team_name}'
    
    try:
        # Make a GET request to the API
        response = requests.get(api_url)
        if response.status_code == 200:
            data = response.json()
            team_scores = data[0]
            total_matches = team_scores.get('totalMatches', 0)
            total_wins = team_scores.get('totalWins', 0)
            total_losses = team_scores.get('totalLosses', 0)
            total_points = team_scores.get('totalPoints', 0)
            response_str = f"{team_name} stats:\nTotal Matches: {total_matches}\nTotal Wins: {total_wins}\nTotal Losses: {total_losses}\nTotal Points: {total_points}"
        else:
            response_str = f'Team stats not found for team: {team_name}'
    except requests.RequestException as e:
        print('Error fetching team score:', e)
        response_str = f'Error fetching team stats for {team_name}'
    
    response = {
        "sessionState": {
            "dialogAction": {
                "type": "Close"
            },
            "intent": {
                "name": "TeamScoresIntent",
                "state": "Fulfilled"
            }
        },
        "messages": [
            {
                "contentType": "PlainText",
                "content": response_str
            }
        ]
    }
    
    return response