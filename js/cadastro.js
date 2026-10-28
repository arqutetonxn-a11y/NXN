
"use strict";

import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

(function () {
    if (window.__CYBER_NEXIS_REGISTER_INITIALIZED__) return;
    window.__CYBER_NEXIS_REGISTER_INITIALIZED__ = true;

    const $ = (id) => document.getElementById(id);

    function showMessage(message, type) {
        const element = $("registerMessage");
        if (!element) return;

        element.textContent = message;
        element.classList.remove("is-error", "is-success", "is-info");
        element.classList.add("is-" + type);
        element.hidden = false;
    }

    function clearMessage() {
        const element = $("registerMessage");
        if (!element) return;

        element.textContent = "";
        element.classList.remove("is-error", "is-success", "is-info");
    }

    function setupPasswordToggle(inputId, buttonId) {
        const input = $(inputId);
        const button = $(buttonId);
        if (!input || !button) return;

        button.addEventListener("click", () => {
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            button.setAttribute("aria-pressed", String(show));
            button.setAttribute(
                "aria-label",
                show ? "Ocultar senha" : "Mostrar senha"
            );
        });
    }

    function getPasswordStrength(password) {
        if (!password) return 0;

        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (password.length < 8) return 1;
        if (score <= 2) return 2;
        if (score <= 3) return 3;
        return 4;
    }

    function updatePasswordStrength() {
        const password = $("registerPassword");
        const text = $("passwordStrengthText");
        const bars = document.querySelectorAll(
            "#passwordStrength .strength-bars span"
        );

        if (!password || !text) return;

        const strength = getPasswordStrength(password.value);
        const labels = [
            "Mínimo de 8 caracteres",
            "Muito fraca",
            "Fraca",
            "Razoável",
            "Forte"
        ];

        text.textContent = labels[strength];

        bars.forEach((bar, index) => {
            bar.classList.toggle("active", index < strength);
        });
    }

    function friendlyError(error) {
        const messages = {
            "auth/email-already-in-use":
                "Este e-mail já possui uma conta. Entre ou recupere sua senha.",
            "auth/invalid-email":
                "O endereço de e-mail é inválido.",
            "auth/weak-password":
                "A senha não atende aos requisitos de segurança do Firebase.",
            "auth/operation-not-allowed":
                "O cadastro por e-mail e senha não está ativado no Firebase.",
            "auth/network-request-failed":
                "Falha de conexão. Verifique a internet e tente novamente.",
            "auth/too-many-requests":
                "Muitas tentativas. Aguarde antes de tentar novamente.",
            "auth/invalid-api-key":
                "A configuração do Firebase precisa ser verificada."
        };

        return messages[error.code] ||
            "Não foi possível criar a conta. Verifique a configuração do Firebase e tente novamente.";
    }

    function initRegisterForm() {
        const form = $("registerForm");
        if (!form) return;

        const name = $("registerName");
        const username = $("registerUsername");
        const email = $("registerEmail");
        const password = $("registerPassword");
        const confirmation = $("confirmPassword");
        const acceptRules = $("acceptRules");
        const submitButton = form.querySelector('[type="submit"]');

        if (![name, username, email, password, confirmation, acceptRules]
            .every(Boolean)) {
            console.error("CYBER NEXIS: campos do cadastro não encontrados.");
            return;
        }

        [name, username, email, password, confirmation].forEach((field) => {
            field.addEventListener("input", clearMessage);
        });

        acceptRules.addEventListener("change", clearMessage);
        password.addEventListener("input", updatePasswordStrength);

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            clearMessage();

            const fullName = name.value.trim();
            const userName = username.value.trim();
            const userEmail = email.value.trim();
            const userPassword = password.value;

            if (fullName.length < 3 || fullName.length > 100) {
                showMessage("Informe seu nome completo (3 a 100 caracteres).", "error");
                name.focus();
                return;
            }

            if (!/^[A-Za-z0-9_.-]{3,30}$/.test(userName)) {
                showMessage("O usuário deve ter de 3 a 30 caracteres: letras sem acento, números, ponto, hífen ou underline.", "error");
                username.focus();
                return;
            }

            if (userEmail.length > 120 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
                showMessage("Digite um endereço de e-mail válido.", "error");
                email.focus();
                return;
            }

            if (userPassword.length < 8 || userPassword.length > 128) {
                showMessage("A senha deve ter entre 8 e 128 caracteres.", "error");
                password.focus();
                return;
            }

            if (userPassword !== confirmation.value) {
                showMessage("As senhas digitadas não coincidem.", "error");
                confirmation.focus();
                return;
            }

            if (!acceptRules.checked) {
                showMessage("Você precisa aceitar as regras do CYBER NEXIS.", "error");
                acceptRules.focus();
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.setAttribute("aria-busy", "true");
            }

            try {
                const credential = await createUserWithEmailAndPassword(
                    auth,
                    userEmail,
                    userPassword
                );

                await updateProfile(credential.user, {
                    displayName: fullName
                });

                showMessage(
                    "Conta criada com sucesso! Redirecionando para o CYBER NEXIS...",
                    "success"
                );

                form.reset();
                updatePasswordStrength();

                window.setTimeout(() => {
                    window.location.replace("nexus.html");
                }, 1200);

            } catch (error) {
                console.error("Erro no cadastro Firebase:", error.code);
                showMessage(friendlyError(error), "error");
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.removeAttribute("aria-busy");
                }
            }
        });
    }

    function initRegister() {
        setupPasswordToggle("registerPassword", "toggleRegisterPassword");
        setupPasswordToggle("confirmPassword", "toggleConfirmPassword");
        initRegisterForm();
        updatePasswordStrength();

        const year = $("currentYear");
        if (year) year.textContent = String(new Date().getFullYear());

        console.info("CYBER NEXIS: cadastro Firebase inicializado.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initRegister, { once: true });
    } else {
        initRegister();
    }
})();
