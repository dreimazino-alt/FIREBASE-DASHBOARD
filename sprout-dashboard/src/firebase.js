
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1lZTwajevf9VAPiv3S3tSMqzmkk5xJTs",
  authDomain: "sprout-9fb12.firebaseapp.com",
  databaseURL:"https://sprout-9fb12-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sprout-9fb12",
  storageBucket: "sprout-9fb12.firebasestorage.app",
  messagingSenderId: "89616158662",
  appId: "1:89616158662:web:99dde5e03f60e915252cc7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);