const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const params = {
    TableName: "questions",
    Key: {
      questionID: event.questionID,
    },
  };

  try {
    await dynamodb.delete(params).promise();
    return {
      statusCode: 200,
      body: "Question deleted successfully",
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "Failed to delete the question",
    };
  }
};
