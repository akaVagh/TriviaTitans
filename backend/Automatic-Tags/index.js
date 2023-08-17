const AWS = require('aws-sdk');
const axios = require('axios');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    // Process the DynamoDB stream event
    const records = event.Records;

    // Assuming there's only one record in the stream for simplicity
    if (records.length === 1) {
      const record = records[0];
      if (record.eventName === 'INSERT' || record.eventName === 'UPDATE') {
        // Get the data from the DynamoDB stream event
        const dynamoData = record.dynamodb.NewImage;
        console.log(dynamoData);

        // Extract values using the appropriate property for each data type
        const questionID = dynamoData.questionID.S;
        console.log("questionID: "+ questionID);
        const question = dynamoData.question.S;
        console.log("Question: "+question);

        // Send the fetched question to the REST API
        const apiUrl = 'https://us-central1-deep-way-391222.cloudfunctions.net/extractTags';
        const response = await axios.post(apiUrl, { question });
        const tags = response.data.tags;

        // Update the DynamoDB table with the retrieved tags
        const params = {
          TableName: 'questions', // Replace 'Questions' with your actual table name
          Key: {
            questionID: questionID,
          },
          UpdateExpression: 'SET tags = :tags',
          ExpressionAttributeValues: {
            ':tags': tags,
          },
        };

        await dynamoDB.update(params).promise();
        console.log(`Updated question with ID ${questionID} with tags: ${tags}`);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    };
  } catch (error) {
    console.error('Error processing event:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing event' }),
    };
  }
};
