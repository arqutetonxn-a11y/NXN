// ============================================================
// CYBER-NEXIS V9.3 — AUTH GATEWAY
// Authentication + Firestore users/{uid}
// ============================================================

import {
  assertFirebaseConfigured,
  auth,
  authReady,
  db
} from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

const LOGIN_PAGE = "login.html";

function authError(code, message, diagnostic = null, cause = null) {
  const error = new Error(message);
  error.code = code;

  if (diagnostic) {
    error.diagnostic = diagnostic;
  }

  if (cause) {
    error.cause = cause;
  }

  return error;
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function getOriginUrl(path, params = {}) {
  const url = new URL(path, window.location.origin);

  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      url.searchParams.set(
        key,
        String(value)
      );
    }
  }

  return url.href;
}

function getVerificationUrl() {
  return getOriginUrl(
    "/login.html",
    {
      verified: "1"
    }
  );
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

async function readProfile(uid) {
  if (!uid) {
    return null;
  }

  const snapshot = await getDoc(
    doc(
      db,
      "users",
      uid
    )
  );

  return snapshot.exists()
    ? {
        id: snapshot.id,
        ...snapshot.data()
      }
    : null;
}

function initialProfile(user) {
  return {
    uid: user.uid,
    email: user.email || "",

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

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
}

function diagnosticFrom(
  user = null,
  profile = null
) {
  return {
    timestamp:
      new Date().toISOString(),

    origin:
      window.location.origin,

    authenticated:
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
    String(password).length < 8
  ) {
    throw authError(
      "auth/weak-password",
      "A senha precisa ter pelo menos 8 caracteres."
    );
  }

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

  const user =
    credential.user;

  // ==========================================================
  // CRIA O PERFIL NO FIRESTORE
  // ==========================================================

  try {
    await setDoc(
      doc(
        db,
        "users",
        user.uid
      ),
      initialProfile(user)
    );
  } catch (error) {
    try {
      await signOut(auth);
    } catch {}

    if (
      error?.code ===
      "permission-denied"
    ) {
      throw authError(
        "profile/save-failed",
        "A conta foi criada no Authentication, mas o perfil não pôde ser salvo no Firestore.",
        diagnosticFrom(user),
        error
      );
    }

    throw error;
  }

  // ==========================================================
  // TENTA ENVIAR VERIFICAÇÃO
  //
  // IMPORTANTE:
  // se o envio falhar, a conta NÃO é apagada.
  // ==========================================================

  let verificationSent = false;
  let verificationError = null;

  try {
    await sendEmailVerification(
      user,
      {
        url: getVerificationUrl(),
        handleCodeInApp: false
      }
    );

    verificationSent = true;

  } catch (error) {
    verificationError = {
      code:
        error?.code ||
        "auth/email-send-failed",

      message:
        error?.message ||
        "Falha ao enviar e-mail de verificação."
    };

    console.error(
      "[CYBER-NEXIS] Falha no e-mail de verificação:",
      error
    );
  }

  try {
    await signOut(auth);
  } catch {}

  return {
    uid:
      user.uid,

    email:
      cleanEmail,

    profileCreated:
      true,

    verificationSent,

    verificationError,

    verificationUrl:
      getVerificationUrl()
  };
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
      "Informe e-mail e senha para reenviar a verificação."
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
        "A sessão foi perdida após autenticar."
      );
    }

    if (
      user.emailVerified
    ) {
      return {
        sent: false,
        alreadyVerified: true,
        email: user.email
      };
    }

    await sendEmailVerification(
      user,
      {
        url: getVerificationUrl(),
        handleCodeInApp: false
      }
    );

    return {
      sent: true,
      alreadyVerified: false,
      email: user.email
    };

  } catch (error) {
    if (
      error?.code ===
        "auth/too-many-requests" ||
      error?.code ===
        "auth/quota-exceeded"
    ) {
      throw authError(
        error.code,
        "O Firebase bloqueou temporariamente novos envios. Aguarde e tente novamente.",
        null,
        error
      );
    }

    throw error;

  } finally {
    try {
      await signOut(auth);
    } catch {}
  }
}

// ============================================================
// REDEFINIÇÃO DE SENHA
// ============================================================

export async function requestPasswordReset(
  email
) {
  await waitFirebase();

  const cleanEmail =
    normalizeEmail(email);

  if (!cleanEmail) {
    throw authError(
      "auth/missing-email",
      "Informe o e-mail da conta."
    );
  }

  await sendPasswordResetEmail(
    auth,
    cleanEmail
  );

  return {
    sent: true,
    email: cleanEmail
  };
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

  const credential =
    await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

  let user =
    credential.user;

  try {
    // Consulta novamente o Firebase para evitar trabalhar
    // apenas com um estado antigo da sessão.
    await user.reload();

    user =
      auth.currentUser;

    if (!user) {
      throw authError(
        "auth/session-lost",
        "A sessão desapareceu após atualizar os dados da conta."
      );
    }

    // ========================================================
    // VERIFICAÇÃO DE EMAIL
    // ========================================================

    if (
      !user.emailVerified
    ) {
      throw authError(
        "auth/email-not-verified",
        "O Firebase ainda informa que este e-mail não foi verificado.",
        diagnosticFrom(user)
      );
    }

    // ========================================================
    // PERFIL FIRESTORE
    // ========================================================

    const profile =
      await readProfile(
        user.uid
      );

    if (!profile) {
      throw authError(
        "profile/missing",
        "A conta existe no Authentication, mas users/{uid} não foi encontrado no Firestore.",
        diagnosticFrom(user)
      );
    }

    // ========================================================
    // BLOQUEIO
    // ========================================================

    if (
      profile.bloqueado === true
    ) {
      throw authError(
        "auth/account-blocked",
        "Esta identidade está bloqueada.",
        diagnosticFrom(
          user,
          profile
        )
      );
    }

    return {
      user,
      profile,

      diagnostic:
        diagnosticFrom(
          user,
          profile
        )
    };

  } catch (error) {
    if (
      !error.diagnostic &&
      user
    ) {
      error.diagnostic =
        diagnosticFrom(user);
    }

    try {
      await signOut(auth);
    } catch {}

    throw error;
  }
}

// ============================================================
// DIAGNÓSTICO
// ============================================================

export async function getAuthDiagnostic() {
  await waitFirebase();

  let user =
    auth.currentUser;

  if (!user) {
    return diagnosticFrom();
  }

  try {
    await user.reload();
  } catch {}

  user =
    auth.currentUser;

  if (!user) {
    return diagnosticFrom();
  }

  let profile = null;

  try {
    profile =
      await readProfile(
        user.uid
      );
  } catch (error) {
    console.warn(
      "[CYBER-NEXIS] Não foi possível ler perfil no diagnóstico:",
      error
    );
  }

  return diagnosticFrom(
    user,
    profile
  );
}

// ============================================================
// CONSULTAR SESSÃO ATUAL
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
  } catch {}

  user =
    auth.currentUser;

  if (
    !user ||
    !user.emailVerified
  ) {
    return null;
  }

  const profile =
    await readProfile(
      user.uid
    );

  if (
    !profile ||
    profile.bloqueado === true
  ) {
    return null;
  }

  return {
    user,
    profile,

    diagnostic:
      diagnosticFrom(
        user,
        profile
      )
  };
}

// ============================================================
// OBSERVADOR DA SESSÃO
// ============================================================

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
            if (!user) {
              callback(
                null,
                null,
                null,
                diagnosticFrom()
              );

              return;
            }

            try {
              await user.reload();

              const currentUser =
                auth.currentUser;

              if (!currentUser) {
                callback(
                  null,
                  null,
                  null,
                  diagnosticFrom()
                );

                return;
              }

              let profile = null;

              try {
                profile =
                  await readProfile(
                    currentUser.uid
                  );

              } catch (error) {
                callback(
                  currentUser,
                  null,
                  error,
                  diagnosticFrom(
                    currentUser
                  )
                );

                return;
              }

              callback(
                currentUser,
                profile,
                null,

                diagnosticFrom(
                  currentUser,
                  profile
                )
              );

            } catch (error) {
              callback(
                null,
                null,
                error,
                null
              );
            }
          }
        );
    })
    .catch((error) => {
      callback(
        null,
        null,
        error,
        null
      );
    });

  return () =>
    unsubscribe();
}

// ============================================================
// PROTEÇÃO DAS PÁGINAS
// ============================================================

export function protectPage(
  redirect = LOGIN_PAGE
) {
  // Esconde a página enquanto o Firebase verifica a sessão.
  // Isso evita que conteúdo protegido apareça por alguns
  // milissegundos antes do redirecionamento.

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
            if (!user) {
              redirectTo(
                redirect,
                "login-required"
              );

              return;
            }

            try {
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

              // Email ainda não verificado.
              if (
                !currentUser.emailVerified
              ) {
                await signOut(auth);

                redirectTo(
                  redirect,
                  "email-not-verified"
                );

                return;
              }

              // Busca o perfil.
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

              // Verifica bloqueio.
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

              // Tudo certo.
              // Agora podemos revelar a página.

              if (
                guard.isConnected
              ) {
                guard.remove();
              }

            } catch (error) {
              console.error(
                "[CYBER-NEXIS] protectPage:",
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
    .catch((error) => {
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

  await signOut(auth);

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
