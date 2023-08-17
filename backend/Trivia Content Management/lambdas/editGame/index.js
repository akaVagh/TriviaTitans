const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const params = {
    TableName: "GamesTable",
    Key: { gameID: event.gameID },
    UpdateExpression:
      "SET gameName = :gameName, category = :category, difficultyLevel = :difficultyLevel, startTime = :startTime, endTime = :endTime, questions = :questions,  scores = :scores",
    ExpressionAttributeValues: {
      ":gameName": event.gameName,
      ":category": event.category,
      ":difficultyLevel": event.difficultyLevel,
      ":startTime": event.startTime,
      ":endTime": event.endTime,
      ":questions": event.questions,
      ":scores": event.scores,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamodb.update(params).promise();
    const updatedGame = result.Attributes;

    return {
      statusCode: 200,
      body: updatedGame,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to update game", error }),
    };
  }
};
