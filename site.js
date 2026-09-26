// ============================================================
// CYBER-NEXIS
// site.js
// Firebase Authentication + Firestore
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
  reload,
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


// ============================================================
// CONFIGURAÇÃO
// ============================================================

const LOGIN_PAGE = "login.html";
const HOME_PAGE = "Index.html";


// ============================================================
// ERRO PADRONIZADO
// ============================================================

function authError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}


// ============================================================
// NORMALIZAR E-MAIL
// ============================================================

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}


// ============================================================
// REDIRECIONAMENTO
// ============================================================

function redirectTo(page) {
  window.location.href = page;
}


// ============================================================
// ESPERAR FIREBASE
// ============================================================

async function waitFirebase() {
  assertFirebaseConfigured();

  if (authReady) {
    await authReady;
  }

  return auth;
}


// ============================================================
// LER PERFIL DO USUÁRIO
// usuarios/{uid}
// ============================================================

async function readProfile(uid) {
  const profileRef = doc(db, "usuarios", uid);
  const snapshot = await getDoc(profileRef);

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


// ============================================================
// REGISTRO
// ============================================================

export async function register(email, password) {
  await waitFirebase();

  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    throw authError(
      "auth/missing-email",
      "Informe seu e-mail."
    );
  }

  if (!password) {
    throw authError(
      "auth/missing-password",
      "Informe sua senha."
    );
  }

  if (password.length < 6) {
    throw authError(
      "auth/weak-password",
      "A senha precisa ter pelo menos 6 caracteres."
    );
  }

  let credential = null;
  let profileCreated = false;

  try {
    // --------------------------------------------------------
    // CRIAR CONTA
    // --------------------------------------------------------

    credential =
      await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

    const user = credential.user;

    // --------------------------------------------------------
    // CRIAR PERFIL NO FIRESTORE
    // --------------------------------------------------------

    const profileRef = doc(
      db,
      "usuarios",
      user.uid
    );

    await setDoc(
      profileRef,
      initialProfile(user)
    );

    profileCreated = true;

    // --------------------------------------------------------
    // E-MAIL DE VERIFICAÇÃO
    // --------------------------------------------------------

    const actionCodeSettings = {
      url:
        new URL(
          "login.html?verified=1",
          window.location.href
        ).href,

      handleCodeInApp: false
    };

    await sendEmailVerification(
      user,
      actionCodeSettings
    );

    // --------------------------------------------------------
    // DESLOGAR
    // --------------------------------------------------------

    await signOut(auth);

    return {
      user,
      verificationSent: true
    };

  } catch (error) {

    console.error(
      "Erro durante o cadastro:",
      error
    );

    // --------------------------------------------------------
    // LIMPEZA DE SEGURANÇA
    // --------------------------------------------------------

    if (credential?.user && !profileCreated) {
      try {
        await deleteUser(credential.user);
      } catch (deleteError) {
        console.error(
          "Erro ao remover usuário incompleto:",
          deleteError
        );
      }
    }

    try {
      await signOut(auth);
    } catch (_) {}

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

  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    throw authError(
      "auth/missing-email",
      "Informe seu e-mail."
    );
  }

  if (!password) {
    throw authError(
      "auth/missing-password",
      "Informe sua senha."
    );
  }

  try {

    // --------------------------------------------------------
    // LOGIN TEMPORÁRIO
    // --------------------------------------------------------

    const credential =
      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

    const user = credential.user;

    // --------------------------------------------------------
    // ATUALIZAR DADOS
    // --------------------------------------------------------

    await reload(user);

    if (user.emailVerified) {
      throw authError(
        "auth/already-verified",
        "Este e-mail já foi verificado."
      );
    }

    // --------------------------------------------------------
    // REENVIAR E-MAIL
    // --------------------------------------------------------

    const actionCodeSettings = {
      url:
        new URL(
          "login.html?verified=1",
          window.location.href
        ).href,

      handleCodeInApp: false
    };

    await sendEmailVerification(
      user,
      actionCodeSettings
    );

    return true;

  } finally {

    // --------------------------------------------------------
    // DESLOGAR
    // --------------------------------------------------------

    try {
      await signOut(auth);
    } catch (_) {}
  }
}


// ============================================================
// REDEFINIR SENHA
// ============================================================

export async function resetPassword(email) {
  await waitFirebase();

  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    throw authError(
      "auth/missing-email",
      "Informe seu e-mail para redefinir a senha."
    );
  }

  // Firebase envia o e-mail de redefinição.
  await sendPasswordResetEmail(
    auth,
    cleanEmail
  );

  return true;
}


// ============================================================
// LOGIN
// ============================================================

export async function login(
  email,
  password
) {
  await waitFirebase();

  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail || !password) {
    throw authError(
      "auth/missing-fields",
      "Preencha e-mail e senha."
    );
  }

  try {

    // --------------------------------------------------------
    // LOGIN
    // --------------------------------------------------------

    const credential =
      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

    const user = credential.user;

    // --------------------------------------------------------
    // ATUALIZAR INFORMAÇÕES DO USUÁRIO
    // --------------------------------------------------------

    await reload(user);

    // --------------------------------------------------------
    // VERIFICAR E-MAIL
    // --------------------------------------------------------

    if (!user.emailVerified) {

      throw authError(
        "auth/email-not-verified",
        "Seu e-mail ainda não foi verificado."
      );
    }

    // --------------------------------------------------------
    // BUSCAR PERFIL
    // --------------------------------------------------------

    const profile =
      await readProfile(user.uid);

    if (!profile) {

      throw authError(
        "profile/missing",
        "Perfil do usuário não encontrado."
      );
    }

    // --------------------------------------------------------
    // VERIFICAR BLOQUEIO
    // --------------------------------------------------------

    if (profile.bloqueado === true) {

      throw authError(
        "auth/account-blocked",
        "Esta conta está bloqueada."
      );
    }

    return {
      user,
      profile
    };

  } catch (error) {

    // --------------------------------------------------------
    // GARANTIR LOGOUT EM CASO DE ERRO
    // --------------------------------------------------------

    try {
      await signOut(auth);
    } catch (_) {}

    throw error;
  }
}


// ============================================================
// USUÁRIO ATUAL
// ============================================================

export async function getCurrentUser() {
  await waitFirebase();

  return auth.currentUser;
}


// ============================================================
// SESSÃO ATUAL
// ============================================================

export async function getCurrentSession() {
  await waitFirebase();

  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  await reload(user);

  const profile =
    await readProfile(user.uid);

  return {
    user,
    profile
  };
}


// ============================================================
// PROTEGER PÁGINA
// ============================================================

export async function protectPage() {
  await waitFirebase();

  const user = auth.currentUser;

  if (!user) {
    redirectTo(LOGIN_PAGE);
    return null;
  }

  await reload(user);

  if (!user.emailVerified) {

    try {
      await signOut(auth);
    } catch (_) {}

    redirectTo(LOGIN_PAGE);

    return null;
  }

  const profile =
    await readProfile(user.uid);

  if (!profile) {

    try {
      await signOut(auth);
    } catch (_) {}

    redirectTo(LOGIN_PAGE);

    return null;
  }

  if (profile.bloqueado === true) {

    try {
      await signOut(auth);
    } catch (_) {}

    redirectTo(LOGIN_PAGE);

    return null;
  }

  return {
    user,
    profile
  };
}


// ============================================================
// LOGOUT
// ============================================================

export async function logout() {
  await waitFirebase();

  await signOut(auth);

  redirectTo(LOGIN_PAGE);
}


// ============================================================
// DADOS DO USUÁRIO
// ============================================================

export async function getUserData(uid = null) {
  await waitFirebase();

  const user = auth.currentUser;

  const targetUid =
    uid ||
    user?.uid;

  if (!targetUid) {
    return null;
  }

  return await readProfile(
    targetUid
  );
}


// ============================================================
// OBSERVADOR DE AUTENTICAÇÃO
// ============================================================

export function watchAuth(callback) {

  assertFirebaseConfigured();

  return onAuthStateChanged(
    auth,
    callback
  );
}
