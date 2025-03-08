const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ ERROR: Missing GEMINI_API_KEY in .env file");
  process.exit(1);
}

// API Route for Food Recognition
app.post("/api/fetch-food-details", async (req, res) => {
  const { food } = req.body;

  if (!food) {
    return res.status(400).json({ error: "Food name is required" });
  }

  try {
    console.log("🔍 Fetching details for:", food);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: `Give nutritional info and preparation details for ${food}` }] }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "FoodAI-Client/1.0"
        }
      }
    );

    console.log("✅ API Response:", response.data);

    const foodDetails =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No details found";

    res.json({ food, details: foodDetails });

  } catch (error) {
    console.error("❌ Error fetching food details:", error.response?.data || error.message);

    // Handle Quota Limit Error
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: "API quota exceeded. Please try again later.",
        details: error.response?.data,
      });
    }

    res.status(500).json({
      error: "API Error",
      details: error.response?.data || "Unknown error",
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
