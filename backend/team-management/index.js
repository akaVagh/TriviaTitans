const express = require("express")
require("dotenv").config()
const { Configuration, OpenAIApi } = require("openai")

const app = express()

app.use(express.json())

const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY,
})
const openai = new OpenAIApi(configuration)

// Feature - Team Management
// get notifications by email
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const { userEmail } = event.queryStringParameters;
    // Retrieve the item with the given userEmail from DynamoDB
    const result = await dynamoDB.get({
      TableName: 'notification',
      Key: {
        userEmail: userEmail
      }
    }).promise();

    if (result.Item) {
      // Return the complete item
      const response = {
        statusCode: 200,
        body: JSON.stringify(result.Item),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET'
        }
      };
      return response;
    } else {
      const response = {
        statusCode: 404,
        body: 'No item found for the given userEmail',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET'
        }
      };
      return response;
    }
  } catch (error) {
    console.error('Failed to retrieve item:', error);
    const response = {
      statusCode: 500,
      body: 'Failed to retrieve item',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET'
      }
    };
    return response;
  }
};


// handle team invite
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
//const sns = new AWS.SNS();

async function updateTeam(userEmail, teamId) {
  const team = await dynamoDb.get({
    TableName: 'team',
    Key: { teamId: teamId },
  }).promise();
  
  team.Item.teamMembers.push({ userEmail: userEmail, userRole: 'member' });

  await dynamoDb.put({
    TableName: 'team',
    Item: team.Item
  }).promise();

  return team.Item;
}

async function updateNotifications(userEmail, teamId, action) {
  const notifications = await dynamoDb.get({
    TableName: 'notification',
    Key: { userEmail: userEmail },
  }).promise();

  notifications.Item.messages = notifications.Item.messages.filter(message => message.teamId !== teamId);

  let notificationMessage;
  switch (action) {
    case 'accept':
      notificationMessage = 'You have accepted the team invite.';
      break;
    case 'decline':
      notificationMessage = 'You have rejected the team invite.';
      break;
  }

  // Add new notification message
  if (notificationMessage) {
    notifications.Item.messages.push({ teamId: teamId, message: notificationMessage });
  }

  await dynamoDb.put({
    TableName: 'notification',
    Item: notifications.Item
  }).promise();
}

async function subscribeUserToTeamTopic(userEmail, teamName) {
  const topicName = `${teamName}-topic`;

  const listTopicsResponse = await sns.listTopics().promise();
  const topics = listTopicsResponse.Topics;

  const topic = topics.find(t => t.TopicArn.includes(topicName));
  if (!topic) {
    throw new Error(`Topic not found with name ${topicName}`);
  }

  const topicArn = topic.TopicArn;

  const subscribeParams = {
    Protocol: 'email',
    TopicArn: topicArn,
    Endpoint: userEmail
  };

  await sns.subscribe(subscribeParams).promise();
}

async function publishMessageToTeamTopic(teamName, message) {
  const topicName = `${teamName}-topic`;

  const listTopicsResponse = await sns.listTopics().promise();
  const topics = listTopicsResponse.Topics;

  const topic = topics.find(t => t.TopicArn.includes(topicName));
  if (!topic) {
    throw new Error(`Topic not found with name ${topicName}`);
  }

  const topicArn = topic.TopicArn;

  const publishParams = {
    TopicArn: topicArn,
    Message: message
  };

  await sns.publish(publishParams).promise();
}

exports.handler = async (event) => {
  const { action, teamId, userEmail } = event;

  let team;
  let message;
  
  switch (action) {
    case 'accept':
      team = await updateTeam(userEmail, teamId);
      await updateNotifications(userEmail, teamId);
      await subscribeUserToTeamTopic(userEmail, team.teamName); // Subscribing user to team topic
      message = `${userEmail} has accepted the team invitation.`;
      await publishMessageToTeamTopic(team.teamName, message);
      break;
    case 'decline':
      await updateNotifications(userEmail, teamId);
      message = `${userEmail} has declined the team invitation.`;
      await publishMessageToTeamTopic(team.teamName, message);
      break;
    default:
      console.log('Unknown action');
  }
};

// handle team update
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

exports.handler = async (event) => {
  const { currentUserEmail, teamId, userEmail, action } = event;

  try {
    // Fetch the existing team record from DynamoDB
    const { Item } = await dynamodb.get({
      TableName: 'team',
      Key: { teamId: teamId }
    }).promise();

    // Check if the team exists
    if (!Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: 'Team not found'
      };
    }

    // Find the user in the team members list
    const userIndex = Item.teamMembers.findIndex(member => member.userEmail === userEmail);

    // Check if the user exists in the team
    if (userIndex === -1) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: 'User not found in the team'
      };
    }

    let message;

    if (action === 'updateRole') {
      // Update the user's role
      Item.teamMembers[userIndex].userRole = Item.teamMembers[userIndex].userRole === 'admin' ? 'member' : 'admin';
      message = `User role updated for ${userEmail} on team ${teamId}.`;
    } else if (action === 'kickUser') {
      // Remove the user from the teamMembers list
      Item.teamMembers.splice(userIndex, 1);
      message = `User ${userEmail} was kicked from team ${teamId}.`;
    }

    // Update the team record in DynamoDB
    await dynamodb.put({
      TableName: 'team',
      Item: Item
    }).promise();

    // Fetch SNS topic ARN based on team name
    const topicsData = await sns.listTopics().promise();
    const topicArn = topicsData.Topics.find(topic => topic.TopicArn.includes(Item.teamName + '-topic'))?.TopicArn;

    if (!topicArn) {
      throw new Error(`Topic for team ${Item.teamName} not found`);
    }

    // Publish a message to the SNS topic
    await sns.publish({
      TopicArn: topicArn,
      Message: message,
    }).promise();

    // Retrieve current notifications for the user
    const response = await dynamodb.get({
      TableName: 'notification',
      Key: { userEmail },
    }).promise();

    let notifications = response.Item ? response.Item.messages : [];
    notifications.push({ type: action, content: message });

    // Update notifications in the DynamoDB table
    await dynamodb.put({
      TableName: 'notification',
      Item: {
        userEmail,
        messages: notifications
      }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: 'Operation performed successfully'
    };
  } catch (error) {
    console.error('Error performing the operation:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: 'Internal server error'
    };
  }
};

// get team by user email
const AWS = require('aws-sdk');
//const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    console.log(event, "This is incoming")
    const userEmail = event.queryStringParameters.userEmail;
    console.log("Got the email", userEmail)
    const team = await getTeamByUserId(userEmail);

    const response = {
      statusCode: 200,
      body: JSON.stringify(team),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET'
      }
    };

    return response;
  } catch (error) {
    console.error('Error retrieving team:', error);

    const errorResponse = {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error retrieving team' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET'
      }
    };

    return errorResponse;
  }
};

async function getTeamByUserId(userEmail) {
  try {
    const params = {
      TableName: 'team'
    };

    const result = await dynamoDB.scan(params).promise();

    if (result.Items.length === 0) {
      throw new Error('No teams found');
    }

    const teams = result.Items.filter(team => 
      team.teamMembers.some(member => member.userEmail === userEmail)
    );

    if (teams.length === 0) {
      throw new Error('No teams found for the given userId');
    }

    return teams;
  } catch (error) {
    console.error('Error retrieving team:', error);
    throw error;
  }
}

// Get team by teamID
const AWS = require('aws-sdk');
//const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    console.log("This is the incoming event", event);
    const teamId = event.queryStringParameters.teamId;
    const team = await getTeamById(teamId);

    return {
      statusCode: 200,
      body: JSON.stringify(team),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Allow": "GET, OPTIONS, POST",
        "Access-Control-Allow-Methods": "GET, OPTIONS, POST",
        "Access-Control-Allow-Headers": "*"
      }
    };
  } catch (error) {
    console.error('Error retrieving team:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error retrieving team' }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Allow": "GET, OPTIONS, POST",
        "Access-Control-Allow-Methods": "GET, OPTIONS, POST",
        "Access-Control-Allow-Headers": "*"
      }
    };
  }
};

async function getTeamById(teamId) {
  try {
    const params = {
      TableName: 'team',
      KeyConditionExpression: 'teamId = :teamId',
      ExpressionAttributeValues: {
        ':teamId': teamId
      }
    };

    const result = await dynamoDB.query(params).promise();

    if (result.Items.length === 0) {
      throw new Error('Team not found for the given teamId');
    }

    return result.Items[0];
  } catch (error) {
    console.error('Error retrieving team:', error);
    throw error;
  }
}


// create topic for user
const AWS = require('aws-sdk');
//const sns = new AWS.SNS();

exports.handler = async (event) => {
  try {
    const { inviteEmail } = event;

    // Extract the name before the "@" symbol
    const nameBeforeAtSymbol = inviteEmail.split('@')[0];

    // Generate topic name by adding "-topic" at the end
    const topicName = `${nameBeforeAtSymbol}-topic`;

    // Create a new SNS topic
    const createTopicParams = {
      Name: topicName
    };
    const createTopicResponse = await sns.createTopic(createTopicParams).promise();
    const topicArn = createTopicResponse.TopicArn;

    console.log(`Topic created with ARN: ${topicArn}`);

    // Subscribe the email address to the topic
    const subscribeParams = {
      Protocol: 'email',
      TopicArn: topicArn,
      Endpoint: inviteEmail
    };
    await sns.subscribe(subscribeParams).promise();

    console.log(`Email address ${inviteEmail} subscribed to topic`);

    return {
      statusCode: 200,
      body: topicArn
    };
  } catch (error) {
    console.error('Failed to create topic:', error);
    return {
      statusCode: 500,
      body: 'Error'
    };
  }
};

// subscribe to team notifications
const AWS = require('aws-sdk');
//const sns = new AWS.SNS();

exports.handler = async (event) => {
  const { teamName, email } = event;

  try {
    // Fetch the ARN of the SNS topic
    const listTopicsResponse = await sns.listTopics().promise();
    const topicArn = listTopicsResponse.Topics.find(topic => topic.TopicArn.endsWith(`${teamName}-topic`)).TopicArn;

    if (!topicArn) {
      throw new Error(`SNS topic not found for team name: ${teamName}`);
    }

    // Subscribe the email to the topic
    const params = {
      Protocol: 'email',
      TopicArn: topicArn,
      Endpoint: email
    };
    
    const response = await sns.subscribe(params).promise();

    console.log('Subscription ARN:', response.SubscriptionArn);
    return {
      statusCode: 200,
      body: 'Successfully subscribed email to SNS topic.'
    };
  } catch (error) {
    console.error('Error subscribing to SNS topic:', error);
    return {
      statusCode: 500,
      body: error.message
    };
  }
};

// publish message to topic
const AWS = require('aws-sdk');
//const sns = new AWS.SNS();
//const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const { inviteEmail, message, typeOfMessage, teamId, teamName } = event;

    const nameBeforeAtSymbol = inviteEmail.split('@')[0];
    const userTopicName = `${nameBeforeAtSymbol}-topic`;
    const teamTopicName = `${teamName}-topic`;

    // Retrieve all topics
    const listTopicsResponse = await sns.listTopics().promise();
    const topics = listTopicsResponse.Topics;

    // Find the topic ARN based on the topic name
    const userTopic = topics.find(t => t.TopicArn.includes(userTopicName));
    const teamTopic = topics.find(t => t.TopicArn.includes(teamTopicName));
    if (!userTopic || !teamTopic) {
      throw new Error(`Topic not found`);
    }
    const userTopicArn = userTopic.TopicArn;
    const teamTopicArn = teamTopic.TopicArn;

    // Publish the message to the user topic
    const publishToUserParams = {
      TopicArn: userTopicArn,
      Message: 'Please log in to your Quiz application to view the full notification. ' + message + '. From ' + teamName
    };
    await sns.publish(publishToUserParams).promise();

    // Publish the new message to the team topic
    const publishToTeamParams = {
      TopicArn: teamTopicArn,
      Message: `New user ${inviteEmail} has been invited to the team ${teamName}.`
    };
    await sns.publish(publishToTeamParams).promise();

    // Add notification to DynamoDB
    const params = {
      TableName: "notification",
      Item: {
        "userEmail": inviteEmail,
        "messages": [
          {
            "type": typeOfMessage,
            "content": message + '. From ' + teamName + '.',
            "teamId": teamId,
            "teamName": teamName
          },
          {
            "type": "teamUpdate",
            "content": `${inviteEmail} has been invited to the team ${teamName}.`,
            "teamId": teamId,
            "teamName": teamName
          }
        ]
      }
    };

    await dynamoDb.put(params).promise();

    return {
      statusCode: 200,
      body: 'Success'
    };
  } catch (error) {
    console.error('Failed to publish message:', error);
    return {
      statusCode: 500,
      body: 'Error'
    };
  }
};


// create new team
const AWS = require('aws-sdk');
//const dynamoDB = new AWS.DynamoDB.DocumentClient();
//const sns = new AWS.SNS();

exports.handler = async (event) => {
  try {
    const userEmail = event.userEmail;

    const teamId = generateTeamId();
    const teamName = await getTeamName();

    const team = {
      teamId: teamId,
      teamName: teamName,
      teamMembers: [
        {
          userEmail: userEmail,
          userRole: 'admin'
        }
      ]
    };

    await saveTeam(team);
    await createSNSTopic(teamName, userEmail);

    return {
      statusCode: 200,
      body: team
    };
  } catch (error) {
    console.error('Error creating team:', error);
    return {
      statusCode: 500,
      body: error.message
    };
  }
};

function generateTeamId() {
  const timestamp = new Date().getTime();
  return `team-${timestamp}`;
}

async function getTeamName() {
  try {
    const randomNumber = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999
    return `team_${randomNumber}`;
  } catch (error) {
    console.error('Error getting team name:', error);
    throw error;
  }
}

async function saveTeam(team) {
  try {
    const params = {
      TableName: 'team',
      Item: team
    };

    await dynamoDB.put(params).promise();

    console.log('Team saved:', team);
  } catch (error) {
    console.error('Error saving team:', error);
    throw error;
  }
}

async function createSNSTopic(teamName, userEmail) {
  const params = {
    Name: `${teamName}-topic`
  };
  try {
    const data = await sns.createTopic(params).promise();
    console.log("Topic ARN is " + data.TopicArn);

    // Subscribe the email to the topic
    const subscribeParams = {
      Protocol: 'email',
      TopicArn: data.TopicArn,
      Endpoint: userEmail
    };
    
    const response = await sns.subscribe(subscribeParams).promise();
    console.log('Subscription ARN:', response.SubscriptionArn);

  } catch (error) {
    console.error('Error creating SNS topic:', error);
    throw error;
  }
}


// End point for list of team mambers

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`))