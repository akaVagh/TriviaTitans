// Author: Shubham Mishra

/***************************************************************************************
*    Code Reference: Getting started with DynamoDB and the AWS SDKs
*    Author: AWS
*    Availability: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.html
***************************************************************************************/

// Import AWS SDK and create a DynamoDB DocumentClient instance
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Lambda handler function
exports.handler = async (event) => {
  const functionName = event.functionName;
  if (functionName === 'checkUserExists') {
    return checkUserExists(event);
  } else if (functionName === 'checkSecurityAnswers') {
    return checkSecurityAnswers(event);
  }
};

// Function to check if the user exists in the DynamoDB table
async function checkUserExists(event) {
  const userId = event.userId; 
  const params = {
    TableName: 'security_questions',
    Key: {
      userId: userId,
    },
  };

  try {
    const response = await dynamodb.get(params).promise();
    const item = response.Item;

    if (!item) {
      // User not found in DynamoDB
      return {
        statusCode: 200,
        body: JSON.stringify({ newUser: true }),
      };
    } else {
      // User found in DynamoDB
      return {
        statusCode: 200,
        body: JSON.stringify({ newUser: false }),
      };
    }
  } catch (error) {
    console.error('Error fetching user info from DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
}

// Function to check if the provided security answers match the ones in DynamoDB
async function checkSecurityAnswers(event) {
  const userId = event.userId; 
  const answers = event.securityAnswers;

  const params = {
    TableName: 'security_questions',
    Key: {
      userId: userId,
    },
  };

  try {
    const response = await dynamodb.get(params).promise();
    const item = response.Item;

    if (!item) {
      // User not found in DynamoDB, write the answers for the user
      const putParams = {
        TableName: 'security_questions',
        Item: {
          userId: userId,
          securityAnswers: answers,
        },
      };

      await dynamodb.put(putParams).promise();

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Answers saved successfully', newUser: true }),
      };
    }

    const dbAnswers = item.securityAnswers;

    // Check if the answers match
    if (JSON.stringify(answers) === JSON.stringify(dbAnswers)) {
      // Answers match
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Answers match', newUser: false }),
      };
    } else {
      // Answers do not match
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Answers do not match', newUser: false  }),
      };
    }
  } catch (error) {
    console.error('Error fetching/putting answers in DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
}
