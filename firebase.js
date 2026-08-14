import { app } from "./firebase-config.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

window.firebaseDB = db;
window.firebaseAuth = auth;
window.firebaseCollection = collection;
window.firebaseAddDoc = addDoc;
window.firebaseQuery = query;
window.firebaseOrderBy = orderBy;
window.firebaseOnSnapshot = onSnapshot;
window.firebaseOnAuthStateChanged = onAuthStateChanged;

window.firebaseReady = signInAnonymously(auth)
  .then((credential) => {
    console.log("✅ Login anônimo ok");
    return credential.user;
  })
  .catch((error) => {
    console.error("❌ Falha no login anônimo:", error);
    throw error;
  });
