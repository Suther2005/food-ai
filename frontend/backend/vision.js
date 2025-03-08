const vision = require("@google-cloud/vision");
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const detectFood = async (imageBuffer) => {
  const [result] = await client.labelDetection(imageBuffer);
  const labels = result.labelAnnotations.map((label) => label.description);
  return labels.find((label) => isFoodItem(label)) || "Unknown";
};

const isFoodItem = (label) => {
  const foodItems = ["apple", "banana", "carrot", "rice", "chicken"];
  return foodItems.includes(label.toLowerCase());
};

module.exports = { detectFood };
