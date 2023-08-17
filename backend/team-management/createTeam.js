const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const { Configuration, OpenAIApi } = require("openai");

// Initialize the OpenAI client
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

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
          userRole: 'admin',
          ready: false
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
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: 'Generate a creative team name.',
      max_tokens: 10,
      temperature: 0.7,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });

    const teamName = response.data.choices[0].text.trim();

    if (!teamName) {
      throw new Error('Failed to generate a team name');
    }

    return teamName;
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