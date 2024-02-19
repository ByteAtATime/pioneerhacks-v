// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRNMg0tFEdMUC5B9Wx2bJFWfytfPl9C7s",
  authDomain: "pioneerhacks-v.firebaseapp.com",
  projectId: "pioneerhacks-v",
  storageBucket: "pioneerhacks-v.appspot.com",
  messagingSenderId: "451555881997",
  appId: "1:451555881997:web:f8b73f971f5803585e9144",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
