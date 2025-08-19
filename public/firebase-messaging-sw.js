
// Import the functions you need from the SDKs you need
importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js");

// Your web app's Firebase configuration
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
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/with-incheon-energy-icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
