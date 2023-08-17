# Author: Shubham Mishra

########################################################################################
#    Code Reference: LexRuntimeV2
#    Author: AWS
#    Availability: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/lexv2-runtime.html
########################################################################################/

import json
import boto3

# Create a Lex Runtime client
lex_runtime = boto3.client('lexv2-runtime')

def lambda_handler(event, context):
    # Extract user information from the event
    user_id = event['sessionId']
    user_input = event['text']
    
    # Log user information
    print("userinfo=", user_id, user_input)

    # Set parameters for calling Lex Runtime to recognize user text input
    params = {
        'botId': 'N3WILBLNLZ',
        'botAliasId': 'VJJI2N8JM0',
        'localeId': 'en_US',
        'sessionId': user_id,
        'text': user_input,
    }

    try:
        # Call Lex Runtime to recognize user text input
        response = lex_runtime.recognize_text(**params)
        messages = response['messages']
        print("messages=", messages)
        bot_message = next((msg for msg in messages if msg['contentType'] == 'PlainText'), None)
        
        print("bot_msg=", bot_message)
        if bot_message:
            # If the response from Lex contains a plain text message, return it as the response
            return {
                'statusCode': 200,
                'body': bot_message['content'],
            }
        else:
            # If the response does not contain a plain text message, return a default response
            return {
                'statusCode': 200,
                'body': 'Please message again.',
            }
    except Exception as e:
        # Handle any errors that occur during the Lex Runtime call
        print('Error sending message to Lex:', e)
        return {
            'statusCode': 500,
            'content': json.dumps({'error': 'Error sending message to Lex'}),
        }
