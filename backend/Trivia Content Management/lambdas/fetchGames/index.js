const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async () => {
  const params = {
    TableName: "GamesTable",
  };

  try {
    const result = await dynamodb.scan(params).promise();
    const games = result.Items;

    return {
      statusCode: 200,
      body: games,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch games" }),
    };
  }
};
