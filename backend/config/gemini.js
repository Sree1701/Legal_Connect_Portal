const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables. AI-powered guidance will use mock fallback responses.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

module.exports = {
  genAI
};

