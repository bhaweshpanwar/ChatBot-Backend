const fs = require('fs');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
dotenv.config({ path: './config.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

if (!process.env.GEMINI_API_KEY) {
  console.error('Error: env file is missing the API KEY');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Read knowledge base and prompt from files
const knowledgeBase = fs.readFileSync('./knowledge_base.txt', 'utf-8');
const prompt = fs.readFileSync('./prompt.txt', 'utf-8');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.post('/get', async (req, res) => {
  const userInput = req.body.msg;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const combinedInput = `${prompt}\n\n${knowledgeBase}\n\nUser Input: ${userInput}`;

    const response = await model.generateContent([combinedInput]);

    res.send(response.response.text());
  } catch (error) {
    console.error('Error generating response: ', error);
    res.status(500).send('An error occurred while generating the response');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
