import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAo6OYE7hhXOrwhw4yhhYc7E2P1krA6Qy8", // updated API key
  authDomain: "beeaproduction.firebaseapp.com",
  projectId: "beeaproduction",
  storageBucket: "beeaproduction.appspot.com",
  messagingSenderId: "881776099057",
  appId: "1:881776099057:web:f11450726dd9af213cf350",
  measurementId: "G-7T18Q5ME27"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics }; 


// AIzaSyBMrMxMvd1ZpzRJo07IqTj-FqWq3qbnKK4    googleplaces API KEY