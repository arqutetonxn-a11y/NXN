
"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBOPqHs6D_QN4wdI3-Hwr7EYqc6Futg-MY",
    authDomain: "cyber-nexis.firebaseapp.com",
    projectId: "cyber-nexis",
    storageBucket: "cyber-nexis.firebasestorage.app",
    messagingSenderId: "187921034798",
    appId: "1:187921034798:web:e33693ac9b0db888a3f9bf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
