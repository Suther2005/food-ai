import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = { /* Your Firebase Config */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc };
