/* =========================================================
   CYBER NEXIS
   js/auth.js
   Autenticação, sessão, perfil e progresso
   ========================================================= */

"use strict";

const AUTH_CONFIG = {
    sessionKey: "cyberNexis_session",
    userKey: "cyberNexis_user",
    usersKey: "cyberNexis_users",

    beginnerKey: "cyberNexis_iniciante_passed",
    intermediateKey: "cyberNexis_intermediario_passed",
    profileKey: "cyberNexis_profile_completed",

    beginnerResultKey: "cyberNexis_iniciante_result",
    intermediateResultKey: "cyberNexis_intermediario_result",
    profileResultKey: "cyberNexis_profile_result",

    activityKey: "cyberNexis_activity",
    rememberKey: "cyberNexis_remember",

    maxActivities: 30
};


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function authGetElement(id) {
    return document.getElementById(id);
}

function authGetElements(selector) {
    return Array.from(document.querySelectorAll(selector));
}

function authGenerateId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}

function authGetDate() {
    return new Date().toISOString();
}

function authFormatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short"
    }).format(date);
}

function authFormatDateTime(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(date);
}

function authNormalize(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

function authEscapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   STORAGE
   ========================================================= */

function authGetUsers() {
    try {
        const raw =
            localStorage.getItem(AUTH_CONFIG.usersKey);

        if (!raw) {
            return [];
        }

        const users = JSON.parse(raw);

        return Array.isArray(users)
            ? users
            : [];
    } catch (error) {
        return [];
    }
}

function authSaveUsers(users) {
    try {
        localStorage.setItem(
            AUTH_CONFIG.usersKey,
            JSON.stringify(users)
        );

        return true;
    } catch (error) {
        return false;
    }
}

function authGetCurrentUser() {
    try {
        const raw =
            localStorage.getItem(AUTH_CONFIG.userKey);

        if (!raw) {
            return null;
        }

        return JSON.parse(raw);
    } catch (error) {
        return null;
    }
}

function authSaveCurrentUser(user) {
    try {
        if (!user) {
            localStorage.removeItem(
                AUTH_CONFIG.userKey
            );

            return true;
        }

        localStorage.setItem(
            AUTH_CONFIG.userKey,
            JSON.stringify(user)
        );

        return true;
    } catch (error) {
        return false;
    }
}


/* =========================================================
   SESSÃO
   ========================================================= */

function authGetSession() {
    try {
        const session =
            sessionStorage.getItem(
                AUTH_CONFIG.sessionKey
            );

        if (session) {
            return JSON.parse(session);
        }

        const remembered =
            localStorage.getItem(
                AUTH_CONFIG.rememberKey
            );

        if (remembered !== "true") {
            return null;
        }

        const persistent =
            localStorage.getItem(
                AUTH_CONFIG.sessionKey
            );

        if (!persistent) {
            return null;
        }

        return JSON.parse(persistent);
    } catch (error) {
        return null;
    }
}

function authIsLoggedIn() {
    return Boolean(authGetSession());
}

function authSetSession(user, remember = false) {
    if (!user) {
        sessionStorage.removeItem(
            AUTH_CONFIG.sessionKey
        );

        localStorage.removeItem(
            AUTH_CONFIG.sessionKey
        );

        localStorage.removeItem(
            AUTH_CONFIG.rememberKey
        );

        return false;
    }

    const session = {
        userId: user.id,
        username: user.username,
        createdAt: authGetDate()
    };

    try {
        sessionStorage.setItem(
            AUTH_CONFIG.sessionKey,
            JSON.stringify(session)
        );

        if (remember) {
            localStorage.setItem(
                AUTH_CONFIG.sessionKey,
                JSON.stringify(session)
            );

            localStorage.setItem(
                AUTH_CONFIG.rememberKey,
                "true"
            );
        } else {
            localStorage.removeItem(
                AUTH_CONFIG.sessionKey
            );

            localStorage.setItem(
                AUTH_CONFIG.rememberKey,
                "false"
            );
        }

        return true;
    } catch (error) {
        return false;
    }
}


/* =========================================================
   MENSAGENS
   ========================================================= */

function authShowMessage(
    element,
    message,
    type = "info"
) {
    if (!element) {
        return;
    }

    element.textContent = message;

    element.className =
        `auth-message ${type}`;

    element.hidden = false;
}

function authClearMessage(element) {
    if (!element) {
        return;
    }

    element.textContent = "";
    element.hidden = true;
}


/* =========================================================
   RESULTADOS
   ========================================================= */

function authGetResult(key) {
    try {
        const raw =
            localStorage.getItem(key);

        return raw
            ? JSON.parse(raw)
            : null;
    } catch (error) {
        return null;
    }
}

function authSaveResult(
    key,
    result
) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(result)
        );

        return true;
    } catch (error) {
        return false;
    }
}

function authGetTestResults() {
    return {
        beginner:
            authGetResult(
                AUTH_CONFIG.beginnerResultKey
            ),

        intermediate:
            authGetResult(
                AUTH_CONFIG.intermediateResultKey
            ),

        profile:
            authGetResult(
                AUTH_CONFIG.profileResultKey
            )
    };
}


/* =========================================================
   PROGRESSO
   ========================================================= */

function authStorageBoolean(key) {
    return (
        localStorage.getItem(key) === "true"
    );
}

function authGetProgress() {
    const beginner =
        authStorageBoolean(
            AUTH_CONFIG.beginnerKey
        );

    const intermediate =
        authStorageBoolean(
            AUTH_CONFIG.intermediateKey
        );

    const profile =
        authStorageBoolean(
            AUTH_CONFIG.profileKey
        );

    const completedTests = [
        beginner,
        intermediate,
        profile
    ].filter(Boolean).length;

    const totalTests = 3;

    const percentage =
        Math.round(
            (completedTests / totalTests) * 100
        );

    let level = "N0";
    let rank = "RECRUTA";

    if (beginner) {
        level = "N1";
        rank = "INICIADO";
    }

    if (beginner && intermediate) {
        level = "N2";
        rank = "OPERADOR";
    }

    if (
        beginner &&
        intermediate &&
        profile
    ) {
        level = "N3";
        rank = "ESPECIALISTA";
    }

    return {
        beginner,
        intermediate,
        profile,
        completedTests,
        totalTests,
        percentage,
        level,
        rank
    };
}


/* =========================================================
   ATIVIDADES
   ========================================================= */

function authGetActivities() {
    try {
        const raw =
            localStorage.getItem(
                AUTH_CONFIG.activityKey
            );

        if (!raw) {
            return [];
        }

        const activities =
            JSON.parse(raw);

        return Array.isArray(activities)
            ? activities
            : [];
    } catch (error) {
        return [];
    }
}

function authSaveActivities(activities) {
    try {
        localStorage.setItem(
            AUTH_CONFIG.activityKey,
            JSON.stringify(
                activities.slice(
                    0,
                    AUTH_CONFIG.maxActivities
                )
            )
        );

        return true;
    } catch (error) {
        return false;
    }
}

function authAddActivity(
    type,
    title,
    description = ""
) {
    const user =
        authGetCurrentUser();

    const activity = {
        id: authGenerateId("activity"),
        userId: user?.id || null,
        type: String(type || "system"),
        title: String(title || "Atividade"),
        description:
            String(description || ""),
        date: authGetDate()
    };

    const activities =
        authGetActivities();

    activities.unshift(activity);

    authSaveActivities(activities);

    return activity;
}

function authGetUserActivities() {
    const user =
        authGetCurrentUser();

    if (!user) {
        return [];
    }

    return authGetActivities()
        .filter(
            (activity) =>
                activity.userId === user.id
        );
}


/* =========================================================
   TOGGLE DE SENHA
   ========================================================= */

function initPasswordToggle(
    buttonId,
    inputId
) {
    const button =
        authGetElement(buttonId);

    const input =
        authGetElement(inputId);

    if (!button || !input) {
        return;
    }

    button.addEventListener("click", () => {
        const isPassword =
            input.type === "password";

        input.type =
            isPassword
                ? "text"
                : "password";

        button.setAttribute(
            "aria-label",
            isPassword
                ? "Ocultar senha"
                : "Mostrar senha"
        );

        button.classList.toggle(
            "visible",
            isPassword
        );
    });
}


/* =========================================================
   FORÇA DA SENHA
   ========================================================= */

function calculatePasswordStrength(password) {
    const value =
        String(password || "");

    if (!value) {
        return {
            score: 0,
            label: "Digite uma senha"
        };
    }

    let score = 0;

    if (value.length >= 8) {
        score++;
    }

    if (value.length >= 12) {
        score++;
    }

    if (/[a-z]/.test(value)) {
        score++;
    }

    if (/[A-Z]/.test(value)) {
        score++;
    }

    if (/\d/.test(value)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(value)) {
        score++;
    }

    let label = "Muito fraca";

    if (score >= 6) {
        label = "Muito forte";
    } else if (score >= 4) {
        label = "Forte";
    } else if (score >= 3) {
        label = "Média";
    } else if (score >= 2) {
        label = "Fraca";
    }

    return {
        score,
        label
    };
}

function updatePasswordStrength() {
    const input =
        authGetElement("registerPassword");

    const bars =
        authGetElements(
            ".password-strength-bar"
        );

    const text =
        authGetElement(
            "passwordStrengthText"
        );

    const hiddenStrength =
        authGetElement(
            "passwordStrength"
        );

    if (!input) {
        return;
    }

    const result =
        calculatePasswordStrength(
            input.value
        );

    if (hiddenStrength) {
        hiddenStrength.value =
            String(result.score);
    }

    if (text) {
        text.textContent =
            result.label;
    }

    bars.forEach((bar, index) => {
        bar.classList.toggle(
            "active",
            index < result.score
        );
    });
}


/* =========================================================
   PROTEÇÃO DE PÁGINAS
   ========================================================= */

function protectAuthenticatedPage(
    redirect = "login.html"
) {
    if (authIsLoggedIn()) {
        return true;
    }

    window.location.href = redirect;

    return false;
}


/* =========================================================
   NEXUS
   ========================================================= */

function authCanAccessNexus() {
    const progress =
        authGetProgress();

    return (
        authIsLoggedIn() &&
        progress.beginner &&
        progress.intermediate &&
        progress.profile
    );
}

function authUpdateNexusAccess() {
    const button =
        authGetElement(
            "nexusAccessButton"
        );

    const status =
        authGetElement(
            "nexusAccessStatus"
        );

    const progress =
        authGetProgress();

    const unlocked =
        authCanAccessNexus();

    if (status) {
        status.textContent =
            unlocked
                ? "ACESSO LIBERADO"
                : `${progress.completedTests}/3 REQUISITOS`;
    }

    if (button) {
        button.classList.toggle(
            "disabled",
            !unlocked
        );

        button.setAttribute(
            "aria-disabled",
            String(!unlocked)
        );
    }
}


/* =========================================================
   PERFIL
   ========================================================= */

function authUpdateProfilePage() {
    const user =
        authGetCurrentUser();

    if (!user) {
        return;
    }

    const progress =
        authGetProgress();

    const results =
        authGetTestResults();

    const fields = {
        profileTitle:
            user.title || progress.rank,

        profileUsername:
            user.username,

        profileName:
            user.name,

        profileUser:
            `@${user.username}`,

        profileBio:
            user.bio ||
            "Membro da comunidade CYBER NEXIS.",

        profileJoinDate:
            authFormatDate(
                user.createdAt
            ),

        profileLastAccess:
            authFormatDateTime(
                user.lastAccess
            ),

        profileLevel:
            progress.level,

        testsCompleted:
            `${progress.completedTests}/${progress.totalTests}`,

        profileScore:
            `${progress.percentage}%`
    };

    Object.entries(fields)
        .forEach(([id, value]) => {
            const element =
                authGetElement(id);

            if (element) {
                element.textContent =
                    value;
            }
        });

    const avatar =
        authGetElement(
            "profileAvatar"
        );

    if (avatar && user.avatar) {
        avatar.src = user.avatar;
    }

    authUpdateProgressBars();
    authUpdateAchievements();
    authUpdateActivityList();
    authUpdateNexusAccess();
}


/* =========================================================
   BARRAS DE PROGRESSO
   ========================================================= */

function setProgressBar(
    barId,
    textId,
    statusId,
    percentage,
    completed
) {
    const bar =
        authGetElement(barId);

    const text =
        authGetElement(textId);

    const status =
        authGetElement(statusId);

    if (bar) {
        bar.style.width =
            `${Math.max(
                0,
                Math.min(100, percentage)
            )}%`;
    }

    if (text) {
        text.textContent =
            `${percentage}%`;
    }

    if (status) {
        status.textContent =
            completed
                ? "CONCLUÍDO"
                : "EM ANDAMENTO";
    }
}

function authUpdateProgressBars() {
    const progress =
        authGetProgress();

    const beginnerResult =
        authGetResult(
            AUTH_CONFIG.beginnerResultKey
        );

    const intermediateResult =
        authGetResult(
            AUTH_CONFIG.intermediateResultKey
        );

    const profileResult =
        authGetResult(
            AUTH_CONFIG.profileResultKey
        );

    const beginnerPercentage =
        beginnerResult?.percentage ??
        (progress.beginner ? 100 : 0);

    const intermediatePercentage =
        intermediateResult?.percentage ??
        (progress.intermediate ? 100 : 0);

    const profilePercentage =
        profileResult
            ? 100
            : 0;

    setProgressBar(
        "beginnerProgress",
        "beginnerProgressText",
        "beginnerStatus",
        beginnerPercentage,
        progress.beginner
    );

    setProgressBar(
        "intermediateProgress",
        "intermediateProgressText",
        "intermediateStatus",
        intermediatePercentage,
        progress.intermediate
    );

    setProgressBar(
        "profileTestProgress",
        "profileTestProgressText",
        "profileTestStatus",
        profilePercentage,
        progress.profile
    );
}


/* =========================================================
   CONQUISTAS
   ========================================================= */

function updateAchievement(
    id,
    unlocked
) {
    const element =
        authGetElement(id);

    if (!element) {
        return;
    }

    element.classList.toggle(
        "unlocked",
        unlocked
    );

    element.classList.toggle(
        "locked",
        !unlocked
    );

    element.setAttribute(
        "aria-label",
        unlocked
            ? "Conquista desbloqueada"
            : "Conquista bloqueada"
    );
}

function authUpdateAchievements() {
    const progress =
        authGetProgress();

    updateAchievement(
        "achievementBeginner",
        progress.beginner
    );

    updateAchievement(
        "achievementIntermediate",
        progress.intermediate
    );

    updateAchievement(
        "achievementProfile",
        progress.profile
    );

    updateAchievement(
        "achievementNexus",
        authCanAccessNexus()
    );
}


/* =========================================================
   LISTA DE ATIVIDADES
   ========================================================= */

function authUpdateActivityList() {
    const list =
        authGetElement(
            "activityList"
        );

    if (!list) {
        return;
    }

    const activities =
        authGetUserActivities();

    if (!activities.length) {
        list.innerHTML = `
            <div class="activity-empty">
                <span>NENHUMA ATIVIDADE</span>
                <small>
                    Suas atividades aparecerão aqui.
                </small>
            </div>
        `;

        return;
    }

    list.innerHTML =
        activities
            .slice(0, 10)
            .map((activity) => `
                <article class="activity-item">
                    <div class="activity-icon">
                        ${authEscapeHTML(
                            activity.type
                                .slice(0, 1)
                                .toUpperCase()
                        )}
                    </div>

                    <div class="activity-content">
                        <strong>
                            ${authEscapeHTML(
                                activity.title
                            )}
                        </strong>

                        <p>
                            ${authEscapeHTML(
                                activity.description
                            )}
                        </p>

                        <time>
                            ${authEscapeHTML(
                                authFormatDateTime(
                                    activity.date
                                )
                            )}
                        </time>
                    </div>
                </article>
            `)
            .join("");
}


/* =========================================================
   ATUALIZAÇÃO DE PERFIL
   ========================================================= */

function authUpdateProfile(updates = {}) {
    const user =
        authGetCurrentUser();

    if (!user) {
        return false;
    }

    const allowedFields = [
        "name",
        "bio",
        "avatar",
        "title"
    ];

    allowedFields.forEach((field) => {
        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                field
            )
        ) {
            user[field] =
                String(
                    updates[field] ?? ""
                ).trim();
        }
    });

    user.updatedAt =
        authGetDate();

    const users =
        authGetUsers();

    const index =
        users.findIndex(
            (item) =>
                item.id === user.id
        );

    if (index !== -1) {
        users[index] = {
            ...users[index],
            ...user
        };

        authSaveUsers(users);
    }

    authSaveCurrentUser(user);

    authUpdateProfilePage();

    authAddActivity(
        "perfil",
        "Perfil atualizado",
        "As informações do perfil foram atualizadas."
    );

    return true;
}


/* =========================================================
   EDIÇÃO DO PERFIL
   ========================================================= */

function authInitProfileEdit() {
    const button =
        authGetElement(
            "editProfileButton"
        );

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {
        const user =
            authGetCurrentUser();

        if (!user) {
            return;
        }

        const name =
            window.prompt(
                "Nome:",
                user.name || ""
            );

        if (name === null) {
            return;
        }

        const bio =
            window.prompt(
                "Bio:",
                user.bio || ""
            );

        if (bio === null) {
            return;
        }

        authUpdateProfile({
            name,
            bio
        });
    });
}


/* =========================================================
   AVATAR
   ========================================================= */

function authInitAvatarChange() {
    const button =
        authGetElement(
            "changeAvatarButton"
        );

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {
        const user =
            authGetCurrentUser();

        if (!user) {
            return;
        }

        const avatar =
            window.prompt(
                "Informe uma URL de imagem para o avatar:",
                user.avatar || ""
            );

        if (avatar === null) {
            return;
        }

        if (
            avatar &&
            !/^https?:\/\//i.test(avatar)
        ) {
            window.alert(
                "Informe uma URL HTTP ou HTTPS válida."
            );

            return;
        }

        authUpdateProfile({
            avatar
        });
    });
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser(
    redirect = "index.html"
) {
    authSetSession(null);

    localStorage.removeItem(
        AUTH_CONFIG.userKey
    );

    /*
     * Os resultados não são apagados automaticamente.
     * Eles pertencem ao estado demonstrativo do navegador.
     */

    authAddActivity(
        "auth",
        "Sessão encerrada",
        "A sessão do CYBER NEXIS foi encerrada."
    );

    window.location.href =
        redirect;
}


/* =========================================================
   LOGIN
   ========================================================= */

function handleLogin(event) {
    event.preventDefault();

    const form =
        event.currentTarget;

    const email =
        authNormalize(
            authGetElement(
                "loginEmail"
            )?.value
        );

    const password =
        authGetElement(
            "loginPassword"
        )?.value || "";

    const remember =
        Boolean(
            authGetElement(
                "rememberMe"
            )?.checked
        );

    const message =
        authGetElement(
            "loginMessage"
        );

    authClearMessage(message);

    if (!email || !password) {
        authShowMessage(
            message,
            "Preencha e-mail e senha.",
            "error"
        );

        return;
    }

    const users =
        authGetUsers();

    const user =
        users.find(
            (item) =>
                authNormalize(
                    item.email
                ) === email
        );

    if (!user) {
        authShowMessage(
            message,
            "E-mail ou senha inválidos.",
            "error"
        );

        return;
    }

    /*
     * IMPORTANTE:
     * Esta comparação é apenas para o protótipo local.
     * Em produção, a senha não deve ser armazenada dessa forma.
     */
    if (user.password !== password) {
        authShowMessage(
            message,
            "E-mail ou senha inválidos.",
            "error"
        );

        return;
    }

    user.lastAccess =
        authGetDate();

    const index =
        users.findIndex(
            (item) =>
                item.id === user.id
        );

    if (index !== -1) {
        users[index] = user;
    }

    authSaveUsers(users);
    authSaveCurrentUser(user);
    authSetSession(
        user,
        remember
    );

    authAddActivity(
        "auth",
        "Login realizado",
        "Acesso à conta realizado com sucesso."
    );

    window.location.href =
        "perfil.html";
}


/* =========================================================
   CADASTRO
   ========================================================= */

function handleRegister(event) {
    event.preventDefault();

    const name =
        String(
            authGetElement(
                "registerName"
            )?.value || ""
        ).trim();

    const username =
        authNormalize(
            authGetElement(
                "registerUsername"
            )?.value
        );

    const email =
        authNormalize(
            authGetElement(
                "registerEmail"
            )?.value
        );

    const password =
        authGetElement(
            "registerPassword"
        )?.value || "";

    const confirmPassword =
        authGetElement(
            "confirmPassword"
        )?.value || "";

    const rules =
        authGetElement(
            "acceptRules"
        )?.checked;

    const message =
        authGetElement(
            "registerMessage"
        );

    authClearMessage(message);

    if (name.length < 2) {
        authShowMessage(
            message,
            "Informe seu nome.",
            "error"
        );

        return;
    }

    if (
        !/^[a-z0-9._-]{3,24}$/i.test(
            username
        )
    ) {
        authShowMessage(
            message,
            "O usuário deve ter entre 3 e 24 caracteres e usar apenas letras, números, ponto, hífen ou sublinhado.",
            "error"
        );

        return;
    }

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    ) {
        authShowMessage(
            message,
            "Informe um e-mail válido.",
            "error"
        );

        return;
    }

    if (password.length < 8) {
        authShowMessage(
            message,
            "A senha deve possuir pelo menos 8 caracteres.",
            "error"
        );

        return;
    }

    if (password !== confirmPassword) {
        authShowMessage(
            message,
            "As senhas não coincidem.",
            "error"
        );

        return;
    }

    if (!rules) {
        authShowMessage(
            message,
            "Você precisa aceitar as regras da organização.",
            "error"
        );

        return;
    }

    const users =
        authGetUsers();

    const usernameExists =
        users.some(
            (user) =>
                authNormalize(
                    user.username
                ) === username
        );

    if (usernameExists) {
        authShowMessage(
            message,
            "Esse nome de usuário já está em uso.",
            "error"
        );

        return;
    }

    const emailExists =
        users.some(
            (user) =>
                authNormalize(
                    user.email
                ) === email
        );

    if (emailExists) {
        authShowMessage(
            message,
            "Esse e-mail já está cadastrado.",
            "error"
        );

        return;
    }

    const user = {
        id: authGenerateId("user"),

        name,

        username,

        email,

        /*
         * SOMENTE PROTÓTIPO LOCAL.
         * Não utilizar este modelo em produção.
         */
        password,

        bio:
            "Membro da comunidade CYBER NEXIS.",

        title:
            "RECRUTA",

        avatar:
            "assets/images/logo.png",

        createdAt:
            authGetDate(),

        lastAccess:
            authGetDate(),

        updatedAt:
            authGetDate()
    };

    users.push(user);

    if (!authSaveUsers(users)) {
        authShowMessage(
            message,
            "Não foi possível salvar a conta neste navegador.",
            "error"
        );

        return;
    }

    /*
     * Limpa progresso de demonstração anterior.
     */
    localStorage.removeItem(
        AUTH_CONFIG.beginnerKey
    );

    localStorage.removeItem(
        AUTH_CONFIG.intermediateKey
    );

    localStorage.removeItem(
        AUTH_CONFIG.profileKey
    );

    localStorage.removeItem(
        AUTH_CONFIG.beginnerResultKey
    );

    localStorage.removeItem(
        AUTH_CONFIG.intermediateResultKey
    );

    localStorage.removeItem(
        AUTH_CONFIG.profileResultKey
    );

    localStorage.removeItem(
        AUTH_CONFIG.activityKey
    );

    authSaveCurrentUser(user);

    authSetSession(
        user,
        true
    );

    authAddActivity(
        "auth",
        "Conta criada",
        "Sua conta CYBER NEXIS foi criada."
    );

    window.location.href =
        "perfil.html";
}


/* =========================================================
   BOTÕES DE LOGOUT
   ========================================================= */

function initLogoutButtons() {
    authGetElements(
        "#logoutButton, #logoutButtonSide, [data-logout]"
    ).forEach((button) => {
        button.addEventListener(
            "click",
            (event) => {
                event.preventDefault();

                logoutUser();
            }
        );
    });
}


/* =========================================================
   LOGIN / CADASTRO
   ========================================================= */

function initLogin() {
    const form =
        authGetElement(
            "loginForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        handleLogin
    );

    initPasswordToggle(
        "togglePassword",
        "loginPassword"
    );
}

function initRegister() {
    const form =
        authGetElement(
            "registerForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        handleRegister
    );

    initPasswordToggle(
        "toggleRegisterPassword",
        "registerPassword"
    );

    initPasswordToggle(
        "toggleConfirmPassword",
        "confirmPassword"
    );

    const password =
        authGetElement(
            "registerPassword"
        );

    if (password) {
        password.addEventListener(
            "input",
            updatePasswordStrength
        );

        updatePasswordStrength();
    }
}


/* =========================================================
   REDIRECIONAMENTO DO NEXUS NO PERFIL
   ========================================================= */

function initNexusProfileButton() {
    const button =
        authGetElement(
            "nexusAccessButton"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        (event) => {
            event.preventDefault();

            if (!authCanAccessNexus()) {
                window.location.href =
                    "testes.html";

                return;
            }

            window.location.href =
                "nexus.html";
        }
    );
}


/* =========================================================
   PROTEÇÃO DO PERFIL
   ========================================================= */

function initProfileProtection() {
    const profilePage =
        document.querySelector(
            ".profile-page"
        );

    if (!profilePage) {
        return;
    }

    if (!protectAuthenticatedPage()) {
        return;
    }

    authUpdateProfilePage();

    authInitProfileEdit();
    authInitAvatarChange();
}


/* =========================================================
   ESTADO DA SESSÃO NA INTERFACE
   ========================================================= */

function authUpdateSessionState() {
    const loggedIn =
        authIsLoggedIn();

    authGetElements(
        "[data-auth='logged-in']"
    ).forEach((element) => {
        element.hidden =
            !loggedIn;
    });

    authGetElements(
        "[data-auth='logged-out']"
    ).forEach((element) => {
        element.hidden =
            loggedIn;
    });

    authGetElements(
        "[data-auth-user]"
    ).forEach((element) => {
        const user =
            authGetCurrentUser();

        element.textContent =
            user?.name ||
            user?.username ||
            "";
    });
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function initAuth() {
    initLogin();
    initRegister();

    initLogoutButtons();
    initNexusProfileButton();

    initProfileProtection();

    authUpdateSessionState();
}


/* =========================================================
   INICIALIZAÇÃO DOM
   ========================================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initAuth,
        {
            once: true
        }
    );
} else {
    initAuth();
}


/* =========================================================
   API PÚBLICA
   ========================================================= */

window.CyberNexisAuth = {
    config: AUTH_CONFIG,

    getUsers: authGetUsers,

    getCurrentUser:
        authGetCurrentUser,

    getSession:
        authGetSession,

    isLoggedIn:
        authIsLoggedIn,

    setSession:
        authSetSession,

    logout:
        logoutUser,

    logoutUser:
        logoutUser,

    protectPage:
        protectAuthenticatedPage,

    getProgress:
        authGetProgress,

    getTestResults:
        authGetTestResults,

    getActivities:
        authGetUserActivities,

    addActivity:
        authAddActivity,

    canAccessNexus:
        authCanAccessNexus,

    updateProfile:
        authUpdateProfile,

    updateProfilePage:
        authUpdateProfilePage,

    updateProgressBars:
        authUpdateProgressBars,

    updateAchievements:
        authUpdateAchievements,

    updateNexusAccess:
        authUpdateNexusAccess,

    formatDate:
        authFormatDate,

    formatDateTime:
        authFormatDateTime,

    escapeHTML:
        authEscapeHTML
};