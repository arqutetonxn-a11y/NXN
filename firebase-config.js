// ============================================================
// CYBER-NEXIS V9.3 — FIREBASE CONFIG
// ÚNICO arquivo responsável por inicializar o Firebase.
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
  apiKey: "AIzaSyB0SryLm896-f7X11Ykx_0M1-ON9shsHK8",
  authDomain: "sistema666-cc64e.firebaseapp.com",
  projectId: "sistema666-cc64e",
  storageBucket: "sistema666-cc64e.firebasestorage.app",
  messagingSenderId: "622186114045",
  appId: "1:622186114045:web:4d6b0839ca2abf3cad8794"
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
  return REQUIRED_CONFIG_KEYS.every((key) => {
    const value = firebaseConfig[key];

    return (
      typeof value === "string" &&
      value.trim().length > 0 &&
      !PLACEHOLDER_PATTERN.test(value)
    );
  });
}

export function assertFirebaseConfigured() {
  if (!isFirebaseConfigured()) {
    const error = new Error(
      "Firebase não está configurado corretamente em firebase-config.js."
    );

    error.code = "app/firebase-config-missing";
    throw error;
  }
}

assertFirebaseConfigured();

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// Mantém a sessão entre recarregamentos.
const authReady = setPersistence(
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
