require('dotenv').config();
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");

const app = express();

app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/teamName", async (req, res) => {
  try {
    const response = await openai.createCompletion({
      model: "gpt-4-0314",
      prompt: 'Generate a creative team name.',
      max_tokens: 10,
      temperature: 0.7,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });

    return res.status(200).json({
      success: true,
      data: response.data.choices[0].text,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.response
        ? error.response.data
        : "There was an issue on the server",
    });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server listening on port ${port}`));
