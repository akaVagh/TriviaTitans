const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const params = {
    TableName: "questions",
    Key: {
      questionID: event.questionID,
    },
    UpdateExpression:
      "SET #question = :question, options = :options, correctAnswer = :correctAnswer, category = :category, difficultyLevel = :difficultyLevel, tags = :tags",
    ExpressionAttributeNames: {
      "#question": "question",
    },
    ExpressionAttributeValues: {
      ":question": event.question,
      ":options": event.options,
      ":correctAnswer": event.correctAnswer,
      ":category": event.category,
      ":difficultyLevel": event.difficultyLevel,
      ":tags": event.tags,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamodb.update(params).promise();
    return {
      statusCode: 200,
      body: "Question updated successfully",
      updatedQuestion: result.Attributes,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "Failed to update the question",
    };
  }
};
