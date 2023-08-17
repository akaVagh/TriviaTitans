const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const params = {
    TableName: "questions",
    Item: {
      questionID: event.questionID,
      question: event.question,
      options: event.options,
      correctAnswer: event.correctAnswer,
      category: event.category,
      difficultyLevel: event.difficultyLevel,
      tags: event.tags,
    },
  };

  try {
    await dynamodb.put(params).promise();
    return {
      statusCode: 200,
      body: "Question added successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: "Failed to add the question",
    };
  }
};
