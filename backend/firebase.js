const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

const saveUserHistory = async (food, weight) => {
  await db.collection("user_history").add({ food, weight, timestamp: Date.now() });
};

module.exports = { saveUserHistory };
