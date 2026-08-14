// ============================================================
// CYBER-NEXIS V9.2.1 — AUTH GATEWAY
// Authentication + perfil users/{uid}
// ============================================================

import {
  assertFirebaseConfigured,
  auth,
  authReady,
  db
} from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  deleteUser,
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


/* ============================================================
   FUNÇÕES INTERNAS
============================================================ */

function authError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}


function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}


function redirectTo(path, reason = "") {
  const url = new URL(
    path,
    window.location.href
  );

  if (reason) {
    url.searchParams.set(
      "reason",
      reason
    );
  }

  window.location.replace(
    url.href
  );
}


async function waitFirebase() {
  assertFirebaseConfigured();

  await authReady;
}


/* ============================================================
   PERFIL DO USUÁRIO
============================================================ */

async function readProfile(uid) {
  if (!uid) {
    return null;
  }

  const snap = await getDoc(
    doc(
      db,
      "users",
      uid
    )
  );

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data()
  };
}


/* ============================================================
   PERFIL INICIAL
============================================================ */

function initialProfile(user) {
  return {
    uid: user.uid,

    email:
      user.email || "",

    codinome: "",

    bio: "",

    avatar: "🧬",

    patente: "Observador N0",

    nivel: 0,

    nivelNumero: 0,

    role: "observer",

    divisao: "Sem Divisão",

    status: "pendente",

    xp: 0,

    creditos: 0,

    aprovado: false,

    bloqueado: false,

    missoesConcluidas: 0,

    treinamentosConcluidos: 0,

    lojaCompras: 0,

    denunciasEnviadas: 0,

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp()
  };
}


/* ============================================================
   CADASTRO
============================================================ */

export async function register(
  email,
  password
) {

  await waitFirebase();

  const cleanEmail =
    normalizeEmail(email);


  if (
    !cleanEmail ||
    !password
  ) {

    throw authError(
      "auth/missing-fields",
      "Informe e-mail e senha."
    );
  }


  if (
    String(password).length < 6
  ) {

    throw authError(
      "auth/weak-password",
      "A senha precisa ter pelo menos 6 caracteres."
    );
  }


  /* ----------------------------------------------------------
     CRIA USUÁRIO NO FIREBASE AUTHENTICATION
  ---------------------------------------------------------- */

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );


  const user =
    credential.user;


  try {

    /* --------------------------------------------------------
       CRIA PERFIL NO FIRESTORE

       users/{uid}

       O usuário nasce como:

       Observador N0
       role: observer
       XP: 0
       créditos: 0
       aprovado: false
       bloqueado: false
    -------------------------------------------------------- */

    await setDoc(
      doc(
        db,
        "users",
        user.uid
      ),

      initialProfile(user)
    );


    /* --------------------------------------------------------
       ENVIA VERIFICAÇÃO DE EMAIL
    -------------------------------------------------------- */

    await sendEmailVerification(
      user,

      {
        url: new URL(
          "login.html?verified=1",
          window.location.href
        ).href,

        handleCodeInApp: false
      }
    );


    /* --------------------------------------------------------
       APÓS CADASTRAR:
       NÃO MANTÉM O USUÁRIO LOGADO
    -------------------------------------------------------- */

    await signOut(auth);


    return {
      email: cleanEmail,
      verificationSent: true
    };


  } catch (error) {

    console.error(
      "[CYBER-NEXIS] Falha ao concluir cadastro:",
      error
    );


    /* --------------------------------------------------------
       TENTA VERIFICAR SE O PERFIL FOI CRIADO
    -------------------------------------------------------- */

    try {

      const profile =
        await readProfile(
          user.uid
        );


      /*
       * Se nem o perfil conseguiu ser criado,
       * removemos a conta incompleta.
       */

      if (!profile) {

        await deleteUser(
          user
        );

      } else {

        /*
         * Se o perfil existe, mantemos a conta,
         * mas encerramos a sessão.
         */

        await signOut(auth);
      }


    } catch (cleanupError) {

      console.error(
        "[CYBER-NEXIS] Falha na limpeza do cadastro:",
        cleanupError
      );
    }


    /* --------------------------------------------------------
       ERRO DAS SECURITY RULES
    -------------------------------------------------------- */

    if (
      error?.code ===
      "permission-denied"
    ) {

      throw authError(
        "profile/save-failed",
        "O perfil não pôde ser criado. Verifique as Security Rules do Firestore."
      );
    }


    throw error;
  }
}


/* ============================================================
   REENVIAR VERIFICAÇÃO DE EMAIL
============================================================ */

export async function resendVerification(
  email,
  password
) {

  await waitFirebase();


  const cleanEmail =
    normalizeEmail(email);


  if (
    !cleanEmail ||
    !password
  ) {

    throw authError(
      "auth/missing-fields",
      "Informe e-mail e senha para reenviar a verificação."
    );
  }


  /* ----------------------------------------------------------
     FAZ LOGIN TEMPORÁRIO
  ---------------------------------------------------------- */

  const credential =
    await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );


  try {

    await credential.user.reload();


    /* --------------------------------------------------------
       EMAIL JÁ VERIFICADO
    -------------------------------------------------------- */

    if (
      credential.user.emailVerified
    ) {

      throw authError(
        "auth/already-verified",
        "Este e-mail já foi verificado."
      );
    }


    /* --------------------------------------------------------
       ENVIA NOVA VERIFICAÇÃO
    -------------------------------------------------------- */

    await sendEmailVerification(
      credential.user,

      {
        url: new URL(
          "login.html?verified=1",
          window.location.href
        ).href,

        handleCodeInApp: false
      }
    );


  } finally {

    /*
     * Nunca deixa a sessão temporária aberta.
     */

    await signOut(auth);
  }


  return true;
}


/* ============================================================
   LOGIN
============================================================ */

export async function login(
  email,
  password
) {

  await waitFirebase();


  const cleanEmail =
    normalizeEmail(email);


  if (
    !cleanEmail ||
    !password
  ) {

    throw authError(
      "auth/missing-fields",
      "Informe e-mail e senha."
    );
  }


  /* ----------------------------------------------------------
     FIREBASE AUTHENTICATION
  ---------------------------------------------------------- */

  const credential =
    await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );


  const user =
    credential.user;


  try {

    /* --------------------------------------------------------
       ATUALIZA DADOS DO USUÁRIO
    -------------------------------------------------------- */

    await user.reload();


    /* --------------------------------------------------------
       VERIFICA EMAIL
    -------------------------------------------------------- */

    if (
      !user.emailVerified
    ) {

      throw authError(
        "auth/email-not-verified",
        "Confirme o e-mail antes de entrar."
      );
    }


    /* --------------------------------------------------------
       PROCURA PERFIL NO FIRESTORE
    -------------------------------------------------------- */

    const profile =
      await readProfile(
        user.uid
      );


    /* --------------------------------------------------------
       PERFIL NÃO EXISTE
    -------------------------------------------------------- */

    if (!profile) {

      throw authError(
        "profile/missing",
        "Sua conta existe no Authentication, mas o perfil users/{uid} não foi encontrado."
      );
    }


    /* --------------------------------------------------------
       USUÁRIO BLOQUEADO
    -------------------------------------------------------- */

    if (
      profile.bloqueado === true
    ) {

      throw authError(
        "auth/account-blocked",
        "Esta identidade está bloqueada."
      );
    }


    /* --------------------------------------------------------
       LOGIN APROVADO
    -------------------------------------------------------- */

    return {
      user,
      profile
    };


  } catch (error) {

    /*
     * Se qualquer verificação falhar,
     * encerra a sessão.
     */

    await signOut(auth);

    throw error;
  }
}


/* ============================================================
   OBTER SESSÃO ATUAL
============================================================ */

export async function getCurrentSession() {

  await waitFirebase();


  const user =
    auth.currentUser;


  if (!user) {
    return null;
  }


  await user.reload();


  /* ----------------------------------------------------------
     EMAIL NÃO VERIFICADO
  ---------------------------------------------------------- */

  if (
    !user.emailVerified
  ) {

    return null;
  }


  /* ----------------------------------------------------------
     CARREGA PERFIL
  ---------------------------------------------------------- */

  const profile =
    await readProfile(
      user.uid
    );


  /* ----------------------------------------------------------
     PERFIL INVÁLIDO OU BLOQUEADO
  ---------------------------------------------------------- */

  if (
    !profile ||
    profile.bloqueado === true
  ) {

    return null;
  }


  return {
    user,
    profile
  };
}


/* ============================================================
   OBSERVADOR DE AUTENTICAÇÃO
============================================================ */

export function getCurrentUser(
  callback
) {

  if (
    typeof callback !==
    "function"
  ) {

    throw new TypeError(
      "getCurrentUser precisa receber uma função callback."
    );
  }


  let unsubscribe =
    () => {};


  waitFirebase()

    .then(() => {

      unsubscribe =
        onAuthStateChanged(
          auth,

          async (user) => {

            /* ----------------------------------------------
               SEM USUÁRIO
            ---------------------------------------------- */

            if (!user) {

              callback(null);

              return;
            }


            try {

              await user.reload();


              /* --------------------------------------------
                 EMAIL NÃO VERIFICADO
              -------------------------------------------- */

              if (
                !user.emailVerified
              ) {

                callback(null);

                return;
              }


              /* --------------------------------------------
                 CARREGA PERFIL
              -------------------------------------------- */

              const profile =
                await readProfile(
                  user.uid
                );


              /* --------------------------------------------
                 PERFIL AUSENTE OU BLOQUEADO
              -------------------------------------------- */

              if (
                !profile ||
                profile.bloqueado === true
              ) {

                callback(null);

                return;
              }


              /* --------------------------------------------
                 USUÁRIO AUTORIZADO
              -------------------------------------------- */

              callback(
                user,
                profile
              );


            } catch (error) {

              console.error(
                "[CYBER-NEXIS] Sessão:",
                error
              );


              callback(
                null,
                null,
                error
              );
            }
          }
        );
    })


    .catch((error) => {

      console.error(
        "[CYBER-NEXIS] Firebase:",
        error
      );


      callback(
        null,
        null,
        error
      );
    });


  /* ----------------------------------------------------------
     CANCELA O OBSERVADOR
  ---------------------------------------------------------- */

  return () =>
    unsubscribe();
}


/* ============================================================
   PROTEGER PÁGINAS
============================================================ */

export function protectPage(
  redirect = "login.html"
) {

  /* ----------------------------------------------------------
     ESCONDE A PÁGINA DURANTE A VERIFICAÇÃO

     Isso evita que conteúdo protegido apareça
     por alguns milissegundos antes do redirect.
  ---------------------------------------------------------- */

  const guard =
    document.createElement(
      "style"
    );


  guard.dataset.authGuard =
    "true";


  guard.textContent =
    "html{visibility:hidden!important}";


  document.head.appendChild(
    guard
  );


  let unsubscribe =
    () => {};


  waitFirebase()

    .then(() => {

      unsubscribe =
        onAuthStateChanged(
          auth,

          async (user) => {

            /* ----------------------------------------------
               NÃO ESTÁ LOGADO
            ---------------------------------------------- */

            if (!user) {

              redirectTo(
                redirect,
                "login-required"
              );

              return;
            }


            try {

              await user.reload();


              /* --------------------------------------------
                 EMAIL NÃO VERIFICADO
              -------------------------------------------- */

              if (
                !user.emailVerified
              ) {

                await signOut(auth);


                redirectTo(
                  redirect,
                  "email-not-verified"
                );


                return;
              }


              /* --------------------------------------------
                 PERFIL FIRESTORE
              -------------------------------------------- */

              const profile =
                await readProfile(
                  user.uid
                );


              /* --------------------------------------------
                 PERFIL NÃO EXISTE
              -------------------------------------------- */

              if (!profile) {

                await signOut(auth);


                redirectTo(
                  redirect,
                  "profile-missing"
                );


                return;
              }


              /* --------------------------------------------
                 CONTA BLOQUEADA
              -------------------------------------------- */

              if (
                profile.bloqueado ===
                true
              ) {

                await signOut(auth);


                redirectTo(
                  redirect,
                  "account-blocked"
                );


                return;
              }


              /* --------------------------------------------
                 ACESSO AUTORIZADO

                 Mostra a página.
              -------------------------------------------- */

              guard.remove();


            } catch (error) {

              console.error(
                "[CYBER-NEXIS] Guard:",
                error
              );


              await signOut(auth);


              redirectTo(
                redirect,
                "session-error"
              );
            }
          }
        );
    })


    .catch((error) => {

      console.error(
        "[CYBER-NEXIS] Falha ao iniciar Firebase:",
        error
      );


      redirectTo(
        redirect,
        "firebase-error"
      );
    });


  /* ----------------------------------------------------------
     FUNÇÃO DE LIMPEZA
  ---------------------------------------------------------- */

  return () => {

    unsubscribe();


    if (
      guard.isConnected
    ) {

      guard.remove();
    }
  };
}


/* ============================================================
   LOGOUT
============================================================ */

export async function logout(
  redirect = "login.html"
) {

  await waitFirebase();


  await signOut(auth);


  if (redirect) {

    window.location.replace(
      redirect
    );
  }
}


/* ============================================================
   OBTER DADOS DE UM USUÁRIO
============================================================ */

export async function getUserData(
  uid
) {

  await waitFirebase();


  return readProfile(
    uid
  );
}
