const axios = require("axios");

const getRecipe = async (food) => {
  try {
    const response = await axios.post(
      "https://api.google.com/gemini",
      { prompt: `Give a recipe for cooking ${food}.` },
      { headers: { Authorization: `Bearer ${process.env.GEMINI_API_KEY}` } }
    );
    return response.data.recipe || "Recipe not found";
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return "Error getting recipe";
  }
};

module.exports = { getRecipe };
