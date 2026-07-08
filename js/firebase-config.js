// Firebase console (console.firebase.google.com) থেকে নিজের project বানিয়ে
// Project Settings > General > Your apps > Web app থেকে এই config কপি করে বসাও
const firebaseConfig = {
  apiKey: "AIzaSyAz08Y5v26aWGzEp1JjiWT2HUkSO0zAhYc",
  authDomain: "course-portal-4ac4a.firebaseapp.com",
  projectId: "course-portal-4ac4a",
  storageBucket: "course-portal-4ac4a.firebasestorage.app",
  messagingSenderId: "419582908258",
  appId: "1:419582908258:web:2ac000eea857a3858bbe3b"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// এই ইমেইল দিয়ে লগইন করলে admin panel পাবে — নিজের ইমেইল বসাও
const ADMIN_EMAILS = ["ampplifyacademy@gmail.com"];

// Google Cloud Console > APIs & Services > Credentials এ বানানো API Key (Drive API enabled, HTTP referrer restricted)
// video duration auto-detect করার জন্য লাগে — না বসালে admin panel এ duration manually লিখতে হবে
const DRIVE_API_KEY = "YOUR_GOOGLE_DRIVE_API_KEY";
