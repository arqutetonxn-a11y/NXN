// ============================================================
// CYBER-NEXIS V9.2.1 — CONFIGURAÇÃO CENTRAL DO FIREBASE
// Este deve ser o ÚNICO arquivo que inicializa o Firebase.
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

/*
 * Projeto Firebase atualmente utilizado pela Cyber-Nexis.
 *
 * IMPORTANTE:
 * A configuração Web do Firebase não é uma senha administrativa.
 * A segurança real continua nas Security Rules e no backend.
 */
const firebaseConfig = Object.freeze({
  apiKey: "AIzaSyCDgU9Rz0OzE56yjtL5wc5rIrQS9FXGjeQ",
  authDomain: "cnx000-a239a.firebaseapp.com",
  projectId: "cnx000-a239a",
  storageBucket: "cnx000-a239a.firebasestorage.app",
  messagingSenderId: "954924634133",
  appId: "1:954924634133:web:650cb5dc86d3baaa273e1c"
});


/* ============================================================
   VALIDAÇÃO DA CONFIGURAÇÃO
============================================================ */

const REQUIRED_CONFIG_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId"
];

const PLACEHOLDER_PATTERN =
  /COLE_AQUI|SEU_PROJECT_ID|SUA_API_KEY/i;


/**
 * Verifica se os campos essenciais do Firebase
 * estão preenchidos corretamente.
 */
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


/**
 * Interrompe a execução caso a configuração
 * do Firebase esteja ausente ou incompleta.
 */
export function assertFirebaseConfigured() {
  if (!isFirebaseConfigured()) {
    const error = new Error(
      "Firebase não está configurado corretamente em firebase-config.js."
    );

    error.code =
      "app/firebase-config-missing";

    throw error;
  }
}


/* ============================================================
   INICIALIZAÇÃO DO FIREBASE
============================================================ */

assertFirebaseConfigured();


/*
 * Evita inicializar o Firebase duas vezes.
 *
 * Se já existir um app Firebase:
 * usa getApp()
 *
 * Caso contrário:
 * inicializa com initializeApp()
 */
const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);


/* ============================================================
   FIREBASE AUTHENTICATION
============================================================ */

const auth =
  getAuth(app);


/* ============================================================
   FIRESTORE DATABASE
============================================================ */

const db =
  getFirestore(app);


/* ============================================================
   PERSISTÊNCIA DA SESSÃO
============================================================ */

/*
 * Mantém o usuário autenticado mesmo depois
 * de atualizar ou fechar o navegador.
 *
 * Todas as rotinas de autenticação do site.js
 * aguardam authReady antes de acessar o Auth.
 */
const authReady =
  setPersistence(
    auth,
    browserLocalPersistence
  );


/* ============================================================
   EXPORTAÇÕES
============================================================ */

export {
  app,
  auth,
  authReady,
  db,
  firebaseConfig
};
