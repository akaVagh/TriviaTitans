const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_SECRET_KEY,
});
const openai = new OpenAIApi(configuration);

exports.handler = async (event, context) => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Generate a funny team name without spaces'}],
    });

    const teamName = response.data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: teamName,
      }),
    };
  } catch (error) {
    console.log("Getting this error", error)
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: error.response
          ? error.response.data
          : "There was an issue on the server",
      }),
    };
  }
};