
"use strict";

import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

(function () {
    if (window.__CYBER_NEXIS_AUTH_INITIALIZED__) {
        return;
    }

    window.__CYBER_NEXIS_AUTH_INITIALIZED__ = true;

    let currentUser = null;
    let authReady = false;
    let resolveAuthReady;

    const authReadyPromise = new Promise((resolve) => {
        resolveAuthReady = resolve;
    });

    function getElement(id) {
        return document.getElementById(id);
    }

    function showMessage(message, type) {
        const element = getElement("loginMessage");
        if (!element) return;

        element.textContent = message;
        element.classList.remove(
            "is-error",
            "is-success",
            "is-info"
        );
        element.classList.add("is-" + type);
        element.hidden = false;
    }

    function clearMessage() {
        const element = getElement("loginMessage");
        if (!element) return;

        element.textContent = "";
        element.classList.remove(
            "is-error",
            "is-success",
            "is-info"
        );
        element.hidden = true;
    }

    function friendlyError(error) {
        const messages = {
            "auth/invalid-email":
                "O formato do e-mail é inválido.",
            "auth/user-not-found":
                "Não foi encontrada uma conta com esses dados.",
            "auth/invalid-credential":
                "E-mail ou senha incorretos.",
            "auth/wrong-password":
                "E-mail ou senha incorretos.",
            "auth/too-many-requests":
                "Muitas tentativas. Aguarde e tente novamente.",
            "auth/network-request-failed":
                "Falha de conexão. Verifique a internet.",
            "auth/user-disabled":
                "Esta conta foi desativada."
        };

        return messages[error.code] ||
            "Não foi possível entrar. Tente novamente.";
    }

    function initPasswordToggle() {
        const password = getElement("loginPassword");
        const button = getElement("togglePassword");

        if (!password || !button) return;

        button.addEventListener("click", function () {
            const show = password.type === "password";

            password.type = show ? "text" : "password";

            button.setAttribute(
                "aria-pressed",
                String(show)
            );

            button.setAttribute(
                "aria-label",
                show ? "Ocultar senha" : "Mostrar senha"
            );
        });
    }

    function initLoginForm() {
        const form = getElement("loginForm");
        const emailInput = getElement("loginEmail");
        const passwordInput = getElement("loginPassword");
        const submitButton = getElement("loginSubmit");
        const rememberMe = getElement("rememberMe");

        if (!form || !emailInput || !passwordInput) return;

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            clearMessage();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                showMessage(
                    "Preencha o e-mail e a senha.",
                    "error"
                );
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
            }

            try {
                const persistence =
                    rememberMe && rememberMe.checked
                        ? browserLocalPersistence
                        : browserSessionPersistence;

                await setPersistence(auth, persistence);

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                showMessage(
                    "Login realizado. A abrir o CYBER NEXIS...",
                    "success"
                );

                window.location.replace("nexus.html");
            } catch (error) {
                console.error(
                    "Erro de autenticação:",
                    error.code
                );

                showMessage(
                    friendlyError(error),
                    "error"
                );
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                }
            }
        });

        [emailInput, passwordInput].forEach(function (input) {
            input.addEventListener("input", clearMessage);
        });
    }

    function initForgotPassword() {
        const button = getElement("forgotPassword");
        const emailInput = getElement("loginEmail");

        if (!button || !emailInput) return;

        button.addEventListener("click", async function () {
            clearMessage();

            const email = emailInput.value.trim();

            if (!email) {
                showMessage(
                    "Digite o seu e-mail no campo acima para recuperar a senha.",
                    "info"
                );

                emailInput.focus();
                return;
            }

            try {
                await sendPasswordResetEmail(auth, email);

                showMessage(
                    "Se a conta estiver registada, receberás as instruções de recuperação no e-mail.",
                    "success"
                );
            } catch (error) {
                console.error(
                    "Erro de recuperação:",
                    error.code
                );

                showMessage(
                    "Não foi possível iniciar a recuperação. Confirme o e-mail e tente novamente.",
                    "error"
                );
            }
        });
    }

    function initCurrentYear() {
        const year = getElement("currentYear");

        if (year) {
            year.textContent = String(
                new Date().getFullYear()
            );
        }
    }

    // O NEXUS poderá aguardar esta confirmação.
    onAuthStateChanged(
        auth,
        function (user) {
            currentUser = user;
            authReady = true;
            resolveAuthReady(user);
        },
        function (error) {
            console.error(
                "Erro ao verificar a sessão:",
                error.code
            );

            currentUser = null;
            authReady = true;
            resolveAuthReady(null);
        }
    );

    window.CyberNexisAuth = {
        getCurrentUser: function () {
            return currentUser;
        },

        isLoggedIn: function () {
            return authReady && currentUser !== null;
        },

        waitForAuthReady: function () {
            return authReadyPromise;
        },

        logout: async function () {
            try {
                await signOut(auth);
            } finally {
                window.location.replace("login.html");
            }
        }
    };

    function initAuth() {
        initPasswordToggle();
        initLoginForm();
        initForgotPassword();
        initCurrentYear();

        console.info(
            "CYBER NEXIS: Firebase Authentication inicializado."
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initAuth,
            { once: true }
        );
    } else {
        initAuth();
    }
})();
