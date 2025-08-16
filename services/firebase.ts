// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging"; // Firebase Messaging SDK 추가

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8lgAZInHWL7lFNGM-51VN8iDJJykQmY",
  authDomain: "withie-access-control.firebaseapp.com",
  projectId: "withie-access-control",
  storageBucket: "withie-access-control.firebasestorage.app",
  messagingSenderId: "152901600148",
  appId: "1:152901600148:web:9c014c0f1f1b0adcd70581",
  measurementId: "G-DYZKP1EEGV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app); // Firebase Messaging 서비스 초기화

export { app, analytics, messaging };
