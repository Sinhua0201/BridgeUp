// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAm7RfpQSsxLyasQAh5Tsbc6htKcJB7AkQ",
  authDomain: "bridgeup-f79f1.firebaseapp.com",
  databaseURL: "https://bridgeup-f79f1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bridgeup-f79f1",
  storageBucket: "bridgeup-f79f1.firebasestorage.app",
  messagingSenderId: "67674751985",
  appId: "1:67674751985:web:d844a58be60616a5443a50",
  measurementId: "G-JVK6E7JQZ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app); // ✅ 导出 auth 对象