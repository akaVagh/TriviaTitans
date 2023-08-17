const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async () => {
  try {
    const params = {
      TableName: "questions",
    };

    const data = await dynamodb.scan(params).promise();
    const questions = data.Items;

    return {
      statusCode: 200,
      body: questions,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error fetching questions" }),
    };
  }
};
