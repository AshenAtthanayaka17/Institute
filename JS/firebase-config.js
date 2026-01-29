// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyDuabt4MshAZFpYy5Wdc1urS1wSwYDOhEU",
  authDomain: "aets-space.firebaseapp.com",
  projectId: "aets-space",
  storageBucket: "aets-space.firebasestorage.app",
  messagingSenderId: "28674364813",
  appId: "1:28674364813:web:46e7f038ccde78f1c099c4",
  measurementId: "G-X19H7YHMHD"
};

const app = initializeApp(firebaseConfig);

export { app };