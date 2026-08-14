// ============================================================
// CYBER-NEXIS — CONFIGURAÇÃO CENTRAL DO FIREBASE
// Projeto atual: sistema666-cc64e
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

const firebaseConfig = {
  apiKey: "AIzaSyB0SryLm896-f7X11Ykx_0M1-ON9shsHK8",
  authDomain: "sistema666-cc64e.firebaseapp.com",
  projectId: "sistema666-cc64e",
  storageBucket: "sistema666-cc64e.firebasestorage.app",
  messagingSenderId: "622186114045",
  appId: "1:622186114045:web:4d6b0839ca2abf3cad8794"
};

const PLACEHOLDER_PATTERN =
  /COLE_AQUI|SEU_PROJECT_ID/i;

const REQUIRED_CONFIG_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId"
];

export function isFirebaseConfigured() {
  return REQUIRED_CONFIG_KEYS.every((key) => {
    const value = firebaseConfig[key];

    return (
      typeof value === "string" &&
      value.length > 0 &&
      !PLACEHOLDER_PATTERN.test(value)
    );
  });
}

export function assertFirebaseConfigured() {
  if (!isFirebaseConfigured()) {
    const error = new Error(
      "Firebase ainda não foi configurado corretamente."
    );

    error.code = "app/firebase-config-missing";

    throw error;
  }
}

assertFirebaseConfigured();

const app =
  getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

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