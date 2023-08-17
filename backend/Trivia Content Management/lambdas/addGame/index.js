const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const params = {
    TableName: "GamesTable",
    Item: {
      gameID: event.gameID,
      gameName: event.gameName,
      category: event.category,
      difficultyLevel: event.difficultyLevel,
      startTime: event.startTime,
      endTime: event.endTime,
      questions: event.questions,
      scores: event.scores,
    },
  };

  try {
    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Game added successfully" }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to add game" }),
    };
  }
};
