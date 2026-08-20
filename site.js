// ============================================================
// CYBER-NEXIS V9.2.2
// AUTH GATEWAY + DIAGNÓSTICO
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


// ============================================================
// CONFIGURAÇÃO
// ============================================================

const LOGIN_PAGE = "login.html";
const HOME_PAGE = "Index.html";


// ============================================================
// ERROS
// ============================================================

function authError(code, message, diagnostic = null) {

  const error =
    new Error(message);

  error.code =
    code;

  if (diagnostic) {
    error.diagnostic =
      diagnostic;
  }

  return error;
}


// ============================================================
// NORMALIZAÇÃO
// ============================================================

function normalizeEmail(email) {

  return String(
    email || ""
  )
    .trim()
    .toLowerCase();
}


// ============================================================
// URL DE VERIFICAÇÃO
// ============================================================

function getVerificationUrl() {

  /*
   * No Netlify:
   *
   * https://cybernetl.netlify.app
   *
   * Resultado:
   *
   * https://cybernetl.netlify.app/login.html?verified=1
   */

  const url =
    new URL(
      "/login.html",
      window.location.origin
    );

  url.searchParams.set(
    "verified",
    "1"
  );

  return url.href;
}


// ============================================================
// REDIRECIONAMENTO
// ============================================================

function redirectTo(
  path,
  reason = ""
) {

  const url =
    new URL(
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


// ============================================================
// FIREBASE READY
// ============================================================

async function waitFirebase() {

  assertFirebaseConfigured();

  await authReady;
}


// ============================================================
// PERFIL FIRESTORE
// ============================================================

async function readProfile(uid) {

  if (!uid) {
    return null;
  }

  const ref =
    doc(
      db,
      "users",
      uid
    );

  const snapshot =
    await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}


// ============================================================
// PERFIL INICIAL
// ============================================================

function initialProfile(user) {

  return {

    uid:
      user.uid,

    email:
      user.email || "",

    codinome:
      "",

    bio:
      "",

    avatar:
      "🧬",

    patente:
      "Observador N0",

    nivel:
      0,

    nivelNumero:
      0,

    role:
      "observer",

    divisao:
      "Sem Divisão",

    status:
      "pendente",

    xp:
      0,

    creditos:
      0,

    aprovado:
      false,

    bloqueado:
      false,

    missoesConcluidas:
      0,

    treinamentosConcluidos:
      0,

    lojaCompras:
      0,

    denunciasEnviadas:
      0,

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp()
  };
}


// ============================================================
// DIAGNÓSTICO
// ============================================================

function createDiagnostic(
  user = null,
  profile = null
) {

  return {

    timestamp:
      new Date().toISOString(),

    origin:
      window.location.origin,

    firebaseUser:
      Boolean(user),

    uid:
      user?.uid || null,

    email:
      user?.email || null,

    emailVerified:
      user?.emailVerified === true,

    profileExists:
      Boolean(profile),

    bloqueado:
      profile?.bloqueado === true,

    aprovado:
      profile?.aprovado === true,

    role:
      profile?.role || null,

    patente:
      profile?.patente || null,

    divisao:
      profile?.divisao || null
  };
}


// ============================================================
// DIAGNÓSTICO PÚBLICO
// ============================================================

export async function getAuthDiagnostic() {

  await waitFirebase();

  const user =
    auth.currentUser;

  if (!user) {

    return createDiagnostic();
  }

  try {

    await user.reload();

  } catch (error) {

    console.warn(
      "[CYBER-NEXIS] reload diagnóstico:",
      error
    );
  }

  const currentUser =
    auth.currentUser;

  if (!currentUser) {

    return createDiagnostic();
  }

  let profile =
    null;

  if (
    currentUser.emailVerified
  ) {

    try {

      profile =
        await readProfile(
          currentUser.uid
        );

    } catch (error) {

      console.error(
        "[CYBER-NEXIS] Perfil diagnóstico:",
        error
      );
    }
  }

  return createDiagnostic(
    currentUser,
    profile
  );
}


// ============================================================
// CADASTRO
// ============================================================

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


  // ----------------------------------------------------------
  // CRIA AUTH
  // ----------------------------------------------------------

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

  const user =
    credential.user;


  try {

    // --------------------------------------------------------
    // CRIA PERFIL
    // --------------------------------------------------------

    await setDoc(
      doc(
        db,
        "users",
        user.uid
      ),
      initialProfile(user)
    );


    // --------------------------------------------------------
    // URL FIXA DE RETORNO
    // --------------------------------------------------------

    const verificationUrl =
      getVerificationUrl();


    console.info(
      "[CYBER-NEXIS] URL de verificação:",
      verificationUrl
    );


    // --------------------------------------------------------
    // ENVIA VERIFICAÇÃO
    // --------------------------------------------------------

    await sendEmailVerification(
      user,
      {
        url:
          verificationUrl,

        handleCodeInApp:
          false
      }
    );


    console.info(
      "[CYBER-NEXIS] Verificação enviada para:",
      user.email
    );


    // --------------------------------------------------------
    // ENCERRA SESSÃO
    // --------------------------------------------------------

    await signOut(auth);


    return {

      email:
        cleanEmail,

      verificationSent:
        true,

      verificationUrl
    };


  } catch (error) {

    console.error(
      "[CYBER-NEXIS] Falha no cadastro:",
      error
    );


    // --------------------------------------------------------
    // LIMPEZA
    // --------------------------------------------------------

    try {

      const profile =
        await readProfile(
          user.uid
        );


      /*
       * Se o perfil não chegou a ser criado,
       * remove a conta incompleta.
       */

      if (!profile) {

        await deleteUser(
          user
        );

      } else {

        await signOut(auth);
      }

    } catch (cleanupError) {

      console.error(
        "[CYBER-NEXIS] Falha na limpeza:",
        cleanupError
      );
    }


    if (
      error?.code ===
      "permission-denied"
    ) {

      throw authError(
        "profile/save-failed",
        "O perfil não pôde ser criado no Firestore."
      );
    }


    throw error;
  }
}


// ============================================================
// REENVIAR VERIFICAÇÃO
// ============================================================

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
      "Informe e-mail e senha."
    );
  }


  const credential =
    await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );


  try {

    await credential.user.reload();


    const user =
      auth.currentUser;


    if (!user) {

      throw authError(
        "auth/session-lost",
        "A sessão Firebase foi perdida."
      );
    }


    console.info(
      "[CYBER-NEXIS] emailVerified antes do reenvio:",
      user.emailVerified
    );


    // --------------------------------------------------------
    // JÁ VERIFICADO
    // --------------------------------------------------------

    if (
      user.emailVerified
    ) {

      throw authError(
        "auth/already-verified",
        "Este e-mail já foi verificado.",
        createDiagnostic(user)
      );
    }


    const verificationUrl =
      getVerificationUrl();


    console.info(
      "[CYBER-NEXIS] Reenvio para:",
      verificationUrl
    );


    // --------------------------------------------------------
    // REENVIA
    // --------------------------------------------------------

    await sendEmailVerification(
      user,
      {
        url:
          verificationUrl,

        handleCodeInApp:
          false
      }
    );


    return {

      success:
        true,

      email:
        user.email,

      verificationUrl
    };


  } finally {

    try {

      await signOut(auth);

    } catch {}
  }
}


// ============================================================
// LOGIN
// ============================================================

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


  // ----------------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------------

  const credential =
    await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );


  let user =
    credential.user;


  console.info(
    "[CYBER-NEXIS] Authentication OK:",
    {
      uid:
        user.uid,

      email:
        user.email,

      emailVerifiedAntesReload:
        user.emailVerified
    }
  );


  try {

    // --------------------------------------------------------
    // FORÇA ATUALIZAÇÃO DO SERVIDOR
    // --------------------------------------------------------

    await user.reload();


    /*
     * Depois de reload(), usamos auth.currentUser,
     * garantindo que estamos lendo a instância atualizada.
     */

    user =
      auth.currentUser;


    if (!user) {

      throw authError(
        "auth/session-lost",
        "A sessão desapareceu após atualizar o usuário."
      );
    }


    console.info(
      "[CYBER-NEXIS] Depois de user.reload():",
      {
        uid:
          user.uid,

        email:
          user.email,

        emailVerified:
          user.emailVerified
      }
    );


    // --------------------------------------------------------
    // EMAIL NÃO VERIFICADO
    // --------------------------------------------------------

    if (
      !user.emailVerified
    ) {

      const diagnostic =
        createDiagnostic(
          user
        );


      console.warn(
        "[CYBER-NEXIS] EMAIL NÃO VERIFICADO:",
        diagnostic
      );


      throw authError(
        "auth/email-not-verified",
        "Confirme o e-mail antes de entrar.",
        diagnostic
      );
    }


    // --------------------------------------------------------
    // FIRESTORE
    // --------------------------------------------------------

    const profile =
      await readProfile(
        user.uid
      );


    // --------------------------------------------------------
    // PERFIL AUSENTE
    // --------------------------------------------------------

    if (!profile) {

      const diagnostic =
        createDiagnostic(
          user,
          null
        );


      console.warn(
        "[CYBER-NEXIS] PERFIL AUSENTE:",
        diagnostic
      );


      throw authError(
        "profile/missing",
        "A conta existe no Authentication, mas users/{uid} não existe no Firestore.",
        diagnostic
      );
    }


    // --------------------------------------------------------
    // BLOQUEIO
    // --------------------------------------------------------

    if (
      profile.bloqueado === true
    ) {

      const diagnostic =
        createDiagnostic(
          user,
          profile
        );


      throw authError(
        "auth/account-blocked",
        "Esta identidade está bloqueada.",
        diagnostic
      );
    }


    // --------------------------------------------------------
    // DIAGNÓSTICO FINAL
    // --------------------------------------------------------

    const diagnostic =
      createDiagnostic(
        user,
        profile
      );


    console.info(
      "[CYBER-NEXIS] LOGIN APROVADO:",
      diagnostic
    );


    return {

      user,

      profile,

      diagnostic
    };


  } catch (error) {

    /*
     * Copiamos o diagnóstico antes de encerrar
     * a sessão.
     */

    if (
      !error.diagnostic &&
      user
    ) {

      error.diagnostic =
        createDiagnostic(
          user
        );
    }


    try {

      await signOut(auth);

    } catch {}


    throw error;
  }
}


// ============================================================
// SESSÃO ATUAL
// ============================================================

export async function getCurrentSession() {

  await waitFirebase();


  let user =
    auth.currentUser;


  if (!user) {

    return null;
  }


  try {

    await user.reload();

  } catch (error) {

    console.warn(
      "[CYBER-NEXIS] reload sessão:",
      error
    );
  }


  user =
    auth.currentUser;


  if (!user) {

    return null;
  }


  if (
    !user.emailVerified
  ) {

    return null;
  }


  const profile =
    await readProfile(
      user.uid
    );


  if (!profile) {

    return null;
  }


  if (
    profile.bloqueado === true
  ) {

    return null;
  }


  return {

    user,

    profile,

    diagnostic:
      createDiagnostic(
        user,
        profile
      )
  };
}


// ============================================================
// OBSERVADOR DA AUTENTICAÇÃO
// ============================================================

export function getCurrentUser(
  callback
) {

  if (
    typeof callback !==
    "function"
  ) {

    throw new TypeError(
      "getCurrentUser precisa receber uma função."
    );
  }


  let unsubscribe =
    () => {};


  waitFirebase()

    .then(() => {

      unsubscribe =
        onAuthStateChanged(
          auth,
          async user => {

            if (!user) {

              callback(
                null
              );

              return;
            }


            try {

              await user.reload();


              const currentUser =
                auth.currentUser;


              if (!currentUser) {

                callback(
                  null
                );

                return;
              }


              if (
                !currentUser.emailVerified
              ) {

                callback(
                  null,
                  null,
                  null,
                  createDiagnostic(
                    currentUser
                  )
                );

                return;
              }


              const profile =
                await readProfile(
                  currentUser.uid
                );


              if (
                !profile ||
                profile.bloqueado === true
              ) {

                callback(
                  null,
                  profile
                );

                return;
              }


              callback(
                currentUser,
                profile,
                null,
                createDiagnostic(
                  currentUser,
                  profile
                )
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


    .catch(error => {

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


  return () => {

    unsubscribe();
  };
}


// ============================================================
// PROTEGER PÁGINA
// ============================================================

export function protectPage(
  redirect = LOGIN_PAGE
) {

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
          async user => {

            // ------------------------------------------------
            // SEM LOGIN
            // ------------------------------------------------

            if (!user) {

              redirectTo(
                redirect,
                "login-required"
              );

              return;
            }


            try {

              // ----------------------------------------------
              // ATUALIZA AUTH
              // ----------------------------------------------

              await user.reload();


              const currentUser =
                auth.currentUser;


              if (!currentUser) {

                redirectTo(
                  redirect,
                  "login-required"
                );

                return;
              }


              // ----------------------------------------------
              // EMAIL
              // ----------------------------------------------

              if (
                !currentUser.emailVerified
              ) {

                console.warn(
                  "[CYBER-NEXIS] Página protegida:",
                  createDiagnostic(
                    currentUser
                  )
                );


                await signOut(auth);


                redirectTo(
                  redirect,
                  "email-not-verified"
                );

                return;
              }


              // ----------------------------------------------
              // PERFIL
              // ----------------------------------------------

              const profile =
                await readProfile(
                  currentUser.uid
                );


              if (!profile) {

                await signOut(auth);


                redirectTo(
                  redirect,
                  "profile-missing"
                );

                return;
              }


              // ----------------------------------------------
              // BLOQUEADO
              // ----------------------------------------------

              if (
                profile.bloqueado === true
              ) {

                await signOut(auth);


                redirectTo(
                  redirect,
                  "account-blocked"
                );

                return;
              }


              console.info(
                "[CYBER-NEXIS] Página autorizada:",
                createDiagnostic(
                  currentUser,
                  profile
                )
              );


              // ----------------------------------------------
              // LIBERA VISUALIZAÇÃO
              // ----------------------------------------------

              if (
                guard.isConnected
              ) {

                guard.remove();
              }


            } catch (error) {

              console.error(
                "[CYBER-NEXIS] Guard:",
                error
              );


              try {

                await signOut(auth);

              } catch {}


              redirectTo(
                redirect,
                "session-error"
              );
            }
          }
        );
    })


    .catch(error => {

      console.error(
        "[CYBER-NEXIS] Firebase init:",
        error
      );


      redirectTo(
        redirect,
        "firebase-error"
      );
    });


  return () => {

    unsubscribe();


    if (
      guard.isConnected
    ) {

      guard.remove();
    }
  };
}


// ============================================================
// LOGOUT
// ============================================================

export async function logout(
  redirect = LOGIN_PAGE
) {

  await waitFirebase();


  await signOut(
    auth
  );


  if (redirect) {

    window.location.replace(
      redirect
    );
  }
}


// ============================================================
// DADOS DO USUÁRIO
// ============================================================

export async function getUserData(
  uid
) {

  await waitFirebase();


  return readProfile(
    uid
  );
}


// ============================================================
// DEBUG MANUAL
// ============================================================

export async function debugFirebaseAuth() {

  const diagnostic =
    await getAuthDiagnostic();


  console.table(
    diagnostic
  );


  return diagnostic;
}
