const axios = require("axios");
require("dotenv").config(); // Load .env file

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const getFoodDetails = async (food) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Give a detailed recipe for preparing ${food} along with its nutritional information (calories, protein, carbs, fats, and vitamins).`
              }
            ]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return responseText || "No details found.";
  } catch (error) {
    console.error("Error fetching food details:", error.response?.data || error.message);
    return "Error getting food details.";
  }
};

module.exports = { getFoodDetails };
