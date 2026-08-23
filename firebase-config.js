// ============================================================
// CYBER-NEXIS V9.3 — FIREBASE CONFIG
// PROJETO OFICIAL: CNX000
// ============================================================

import {
  getApp,
  getApps,
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";

import {
  browserLocalPersistence,
  getAuth,
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";


const firebaseConfig = Object.freeze({

  apiKey:
    "AIzaSyCDgU9Rz0OzE56yjtL5wc5rIrQS9FXGjeQ",

  authDomain:
    "cnx000-a239a.firebaseapp.com",

  projectId:
    "cnx000-a239a",

  storageBucket:
    "cnx000-a239a.firebasestorage.app",

  messagingSenderId:
    "954924634133",

  appId:
    "1:954924634133:web:650cb5dc86d3baaa273e1c"

});


const REQUIRED_CONFIG_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId"
];


const PLACEHOLDER_PATTERN =
  /COLE_AQUI|SEU_PROJECT_ID|SUA_API_KEY/i;


export function isFirebaseConfigured() {

  return REQUIRED_CONFIG_KEYS.every(
    (key) => {

      const value =
        firebaseConfig[key];

      return (
        typeof value === "string" &&
        value.trim().length > 0 &&
        !PLACEHOLDER_PATTERN.test(value)
      );

    }
  );

}


export function assertFirebaseConfigured() {

  if (
    !isFirebaseConfigured()
  ) {

    const error =
      new Error(
        "Firebase não está configurado corretamente em firebase-config.js."
      );

    error.code =
      "app/firebase-config-missing";

    throw error;

  }

}


assertFirebaseConfigured();


const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(
        firebaseConfig
      );


const auth =
  getAuth(app);


const db =
  getFirestore(app);


const authReady =
  setPersistence(
    auth,
    browserLocalPersistence
  );


export {
  app,
  auth,
  authReady,
  db,
  firebaseConfig
};
