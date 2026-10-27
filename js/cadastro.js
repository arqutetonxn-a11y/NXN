
"use strict";

/*
============================================================
 CYBER NEXIS
 CADASTRO — VALIDAÇÃO DA INTERFACE
 Arquivo: js/cadastro.js

 Esta versão valida o formulário no navegador.
 O cadastro real precisa de um backend seguro.
 Não armazena senhas nem simula contas criadas.
============================================================
*/

(function () {
    if (window.__CYBER_NEXIS_REGISTER_INITIALIZED__) {
        return;
    }

    window.__CYBER_NEXIS_REGISTER_INITIALIZED__ = true;

    function getElement(id) {
        return document.getElementById(id);
    }

    function showMessage(message, type) {
        const element = getElement("registerMessage");

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
        const element = getElement("registerMessage");

        if (!element) return;

        element.textContent = "";
        element.classList.remove(
            "is-error",
            "is-success",
            "is-info"
        );
    }

    function setupPasswordToggle(inputId, buttonId) {
        const input = getElement(inputId);
        const button = getElement(buttonId);

        if (!input || !button) return;

        button.addEventListener("click", function () {
            const show = input.type === "password";

            input.type = show ? "text" : "password";
            button.setAttribute("aria-pressed", String(show));
            button.setAttribute(
                "aria-label",
                show ? "Ocultar senha" : "Mostrar senha"
            );

            input.focus();
        });
    }

    function getPasswordStrength(password) {
        if (!password) return 0;

        let score = 0;

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) &&
            /[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (password.length < 8) return 1;
        if (score <= 2) return 2;
        if (score <= 3) return 3;

        return 4;
    }

    function updatePasswordStrength() {
        const password = getElement("registerPassword");
        const text = getElement("passwordStrengthText");
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

        bars.forEach(function (bar, index) {
            bar.classList.toggle(
                "active",
                index < strength
            );
        });
    }

    function initRegisterForm() {
        const form = getElement("registerForm");

        if (!form) return;

        const name = getElement("registerName");
        const username = getElement("registerUsername");
        const email = getElement("registerEmail");
        const password = getElement("registerPassword");
        const confirmPassword = getElement("confirmPassword");
        const acceptRules = getElement("acceptRules");

        const fields = [
            name,
            username,
            email,
            password,
            confirmPassword
        ];

        if (fields.some(function (field) {
            return !field;
        }) || !acceptRules) {
            console.error(
                "CYBER NEXIS: campos do cadastro não encontrados."
            );
            return;
        }

        fields.forEach(function (field) {
            field.addEventListener("input", clearMessage);
        });

        acceptRules.addEventListener("change", clearMessage);
        password.addEventListener("input", updatePasswordStrength);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            clearMessage();

            const fullName = name.value.trim();
            const userName = username.value.trim();
            const userEmail = email.value.trim();
            const userPassword = password.value;
            const confirmation = confirmPassword.value;

            if (fullName.length < 3 || fullName.length > 100) {
                showMessage(
                    "Informe seu nome com pelo menos 3 caracteres.",
                    "error"
                );
                name.focus();
                return;
            }

            if (!/^[A-Za-z0-9_.-]{3,30}$/.test(userName)) {
                showMessage(
                    "O usuário deve ter de 3 a 30 caracteres: letras sem acento, números, ponto, hífen ou underline.",
                    "error"
                );
                username.focus();
                return;
            }

            if (
                userEmail.length > 120 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)
            ) {
                showMessage(
                    "Digite um endereço de e-mail válido.",
                    "error"
                );
                email.focus();
                return;
            }

            if (userPassword.length < 8 ||
                userPassword.length > 128) {
                showMessage(
                    "A senha deve ter entre 8 e 128 caracteres.",
                    "error"
                );
                password.focus();
                return;
            }

            if (userPassword !== confirmation) {
                showMessage(
                    "As senhas digitadas não coincidem.",
                    "error"
                );
                confirmPassword.focus();
                return;
            }

            if (!acceptRules.checked) {
                showMessage(
                    "Você precisa aceitar as regras do CYBER NEXIS.",
                    "error"
                );
                acceptRules.focus();
                return;
            }

            /*
             * Ainda não envia dados para um servidor.
             * Não guardar a senha no navegador.
             */
            showMessage(
                "Validação concluída! Porém, o cadastro ainda não foi enviado nem criado. Para criar sua conta com segurança, precisamos conectar este formulário ao servidor de autenticação.",
                "info"
            );
        });
    }

    function initRegister() {
        setupPasswordToggle(
            "registerPassword",
            "toggleRegisterPassword"
        );

        setupPasswordToggle(
            "confirmPassword",
            "toggleConfirmPassword"
        );

        initRegisterForm();
        updatePasswordStrength();

        console.info(
            "CYBER NEXIS: validação do cadastro inicializada."
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initRegister,
            { once: true }
        );
    } else {
        initRegister();
    }
})();
