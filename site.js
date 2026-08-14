import {
  auth,
  authReady,
  db
} from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";


function authError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}


/* ============================================================
   LOGIN
============================================================ */

export async function login(email, senha) {
  await authReady;

  const normalized = String(email || "")
    .trim()
    .toLowerCase();

  if (!normalized || !senha) {
    throw authError(
      "auth/missing-fields",
      "Email e senha são obrigatórios."
    );
  }

  const credential =
    await signInWithEmailAndPassword(
      auth,
      normalized,
      senha
    );

  await credential.user.reload();

  if (!credential.user.emailVerified) {
    await signOut(auth);

    throw authError(
      "auth/email-not-verified",
      "Confirme o e-mail antes de entrar."
    );
  }

  return credential;
}


/* ============================================================
   CADASTRO
============================================================ */

export async function register(email, senha) {
  await authReady;

  const normalized = String(email || "")
    .trim()
    .toLowerCase();

  if (!normalized || !senha) {
    throw authError(
      "auth/missing-fields",
      "Email e senha são obrigatórios."
    );
  }

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      normalized,
      senha
    );

  const user = credential.user;

  try {

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,

        email: normalized,

        codinome: "",

        patente: "Observador N0",

        nivel: 0,

        divisao: "Sem Divisão",

        role: "observer",

        xp: 0,

        creditos: 0,

        status: "pendente",

        aprovado: false,

        bloqueado: false,

        missoesConcluidas: 0,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp()
      }
    );

    await sendEmailVerification(user);

  } catch (error) {

    console.error(
      "Erro ao preparar perfil do usuário:",
      error
    );

    throw error;

  } finally {

    await signOut(auth);

  }

  return credential;
}


/* ============================================================
   PERFIL DO FIRESTORE
============================================================ */

export async function getUserProfile(uid) {
  await authReady;

  if (!uid) {
    return null;
  }

  const reference =
    doc(db, "users", uid);

  const snapshot =
    await getDoc(reference);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}


/* ============================================================
   PROTEÇÃO DE PÁGINA
============================================================ */

export function protectPage(
  redirect = "login.html"
) {

  let active = true;

  authReady
    .then(() => {

      if (!active) return;

      onAuthStateChanged(
        auth,
        async (user) => {

          if (!user) {

            window.location.replace(
              `${redirect}?reason=login-required`
            );

            return;
          }

          try {

            await user.reload();

          } catch (error) {

            console.warn(
              "Não foi possível atualizar a sessão:",
              error
            );

          }

          if (!auth.currentUser?.emailVerified) {

            await signOut(auth);

            window.location.replace(
              `${redirect}?reason=email-not-verified`
            );

            return;
          }


          /*
             Verifica também se existe perfil no Firestore
          */

          try {

            const profile =
              await getUserProfile(
                auth.currentUser.uid
              );

            if (!profile) {

              console.error(
                "Perfil Firestore inexistente."
              );

              await signOut(auth);

              window.location.replace(
                `${redirect}?reason=profile-not-found`
              );

              return;
            }

            if (profile.bloqueado === true) {

              await signOut(auth);

              window.location.replace(
                `${redirect}?reason=blocked`
              );

            }

          } catch (error) {

            console.error(
              "Falha ao verificar perfil:",
              error
            );

          }

        }
      );

    })
    .catch((error) => {

      console.error(
        "Falha ao preparar autenticação:",
        error
      );

    });


  return () => {
    active = false;
  };
}


/* ============================================================
   LOGOUT
============================================================ */

export async function logout(
  redirect = "login.html"
) {

  await authReady;

  await signOut(auth);

  if (redirect) {
    window.location.replace(redirect);
  }
}


/* ============================================================
   USUÁRIO ATUAL
============================================================ */

export function getCurrentUser(callback) {

  if (typeof callback !== "function") {

    throw new TypeError(
      "getCurrentUser precisa receber uma função callback."
    );

  }

  let unsubscribe = () => {};

  authReady
    .then(() => {

      unsubscribe =
        onAuthStateChanged(
          auth,
          callback
        );

    })
    .catch((error) => {

      callback(
        null,
        error
      );

    });

  return () => unsubscribe();
}
