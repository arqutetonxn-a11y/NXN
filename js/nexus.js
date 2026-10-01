/* =========================================================
   CYBER NEXIS
   NEXUS — Central Interna
   js/nexus.js
   ========================================================= */

(() => {
    "use strict";

    const NEXUS_CONFIG = {
        sessionKey: "cyberNexis_session",
        userKey: "cyberNexis_user",

        beginnerKey: "cyberNexis_iniciante_passed",
        intermediateKey: "cyberNexis_intermediario_passed",
        profileKey: "cyberNexis_profile_completed",

        beginnerResultKey: "cyberNexis_iniciante_result",
        intermediateResultKey: "cyberNexis_intermediario_result",
        profileResultKey: "cyberNexis_profile_result",

        activityKey: "cyberNexis_activity",

        accessUrl: "testes.html",
        profileUrl: "perfil.html",
        loginUrl: "login.html"
    };

    const state = {
        authorized: false,
        currentModule: "profile",
        terminalHistory: [],
        notificationCount: 0,
        initialized: false,
        clockTimer: null
    };

    /* =====================================================
       UTILIDADES
       ===================================================== */

    function $(selector, scope = document) {
        return scope.querySelector(selector);
    }

    function $$(selector, scope = document) {
        return Array.from(scope.querySelectorAll(selector));
    }

    function getStorage(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);

            if (value === null) {
                return fallback;
            }

            return JSON.parse(value);
        } catch {
            return fallback;
        }
    }

    function getBoolean(key) {
        return localStorage.getItem(key) === "true";
    }

    function getUser() {
        if (window.CyberNexisAuth?.getCurrentUser) {
            return window.CyberNexisAuth.getCurrentUser();
        }

        return getStorage(NEXUS_CONFIG.userKey, null);
    }

    function isLoggedIn() {
        if (window.CyberNexisAuth?.isLoggedIn) {
            return window.CyberNexisAuth.isLoggedIn();
        }

        return Boolean(
            localStorage.getItem(NEXUS_CONFIG.sessionKey)
        );
    }

    function escapeHTML(value) {
        if (window.CyberNexisAuth?.escapeHTML) {
            return window.CyberNexisAuth.escapeHTML(value);
        }

        if (window.CyberNexis?.escapeHTML) {
            return window.CyberNexis.escapeHTML(value);
        }

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(value) {
        if (window.CyberNexisAuth?.formatDate) {
            return window.CyberNexisAuth.formatDate(value);
        }

        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("pt-BR");
    }

    function formatDateTime(value) {
        if (window.CyberNexisAuth?.formatDateTime) {
            return window.CyberNexisAuth.formatDateTime(value);
        }

        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleString("pt-BR");
    }

    function showElement(element) {
        if (!element) {
            return;
        }

        element.hidden = false;
        element.removeAttribute("hidden");
    }

    function hideElement(element) {
        if (!element) {
            return;
        }

        element.hidden = true;
        element.setAttribute("hidden", "");
    }

    function clamp(value, min, max) {
        return Math.min(
            Math.max(value, min),
            max
        );
    }

    function safeNumber(value, fallback = 0) {
        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }

    function safePercentage(value) {
        return clamp(
            Math.round(safeNumber(value, 0)),
            0,
            100
        );
    }

    /* =====================================================
       PERMISSÕES
       ===================================================== */

    function checkAccess() {
        const logged = isLoggedIn();

        const beginnerPassed =
            getBoolean(NEXUS_CONFIG.beginnerKey);

        const intermediatePassed =
            getBoolean(NEXUS_CONFIG.intermediateKey);

        const profileCompleted =
            getBoolean(NEXUS_CONFIG.profileKey);

        state.authorized =
            logged &&
            beginnerPassed &&
            intermediatePassed &&
            profileCompleted;

        return {
            logged,
            beginnerPassed,
            intermediatePassed,
            profileCompleted,
            authorized: state.authorized
        };
    }

    function getRank() {
        const progress =
            window.CyberNexisAuth?.getProgress
                ? window.CyberNexisAuth.getProgress()
                : null;

        if (
            progress?.rank &&
            typeof progress.rank === "string"
        ) {
            return progress.rank;
        }

        const beginner =
            getBoolean(NEXUS_CONFIG.beginnerKey);

        const intermediate =
            getBoolean(NEXUS_CONFIG.intermediateKey);

        const profile =
            getBoolean(NEXUS_CONFIG.profileKey);

        if (
            beginner &&
            intermediate &&
            profile
        ) {
            return "N3 ESPECIALISTA";
        }

        if (
            beginner &&
            intermediate
        ) {
            return "N2 OPERADOR";
        }

        if (beginner) {
            return "N1 INICIADO";
        }

        return "N0 RECRUTA";
    }

    function getAccessLevel() {
        const rank = getRank();

        if (rank.includes("ESPECIALISTA")) {
            return 3;
        }

        if (rank.includes("OPERADOR")) {
            return 2;
        }

        if (rank.includes("INICIADO")) {
            return 1;
        }

        return 0;
    }

    /* =====================================================
       ACCESS GATE
       ===================================================== */

    function renderAccessGate() {
        const gate = $("#nexusAccessGate");
        const content = $("#nexusContent");
        const message = $("#nexusAccessMessage");

        if (!gate || !content) {
            return;
        }

        const access = checkAccess();

        if (access.authorized) {
            hideElement(gate);
            showElement(content);
            return;
        }

        showElement(gate);
        hideElement(content);

        if (!message) {
            updateRequirements(access);
            return;
        }

        if (!access.logged) {
            message.innerHTML = `
                <strong>ACESSO NEGADO</strong>

                <span>
                    É necessário estar autenticado
                    para acessar o NEXUS.
                </span>

                <a
                    class="btn btn-primary"
                    href="${NEXUS_CONFIG.loginUrl}"
                >
                    ENTRAR NO SISTEMA
                </a>
            `;
        } else {
            message.innerHTML = `
                <strong>ACESSO RESTRITO</strong>

                <span>
                    Complete os requisitos de progressão
                    para liberar esta área.
                </span>

                <a
                    class="btn btn-primary"
                    href="${NEXUS_CONFIG.accessUrl}"
                >
                    VER TESTES
                </a>
            `;
        }

        updateRequirements(access);
    }

    function updateRequirements(access = checkAccess()) {
        const requirements =
            $$("[data-nexus-requirement]");

        requirements.forEach((item) => {
            const type =
                item.dataset.nexusRequirement;

            let complete = false;

            switch (type) {
                case "login":
                    complete = access.logged;
                    break;

                case "iniciante":
                    complete = access.beginnerPassed;
                    break;

                case "intermediario":
                    complete = access.intermediatePassed;
                    break;

                case "perfil":
                    complete = access.profileCompleted;
                    break;

                default:
                    complete = false;
            }

            item.classList.toggle(
                "completed",
                complete
            );

            item.classList.toggle(
                "pending",
                !complete
            );

            const status =
                item.querySelector(
                    "[data-requirement-status]"
                );

            if (status) {
                status.textContent =
                    complete
                        ? "OK"
                        : "PENDENTE";
            }
        });
    }

    /* =====================================================
       IDENTIDADE
       ===================================================== */

    function updateIdentity() {
        const user = getUser();

        if (!user) {
            return;
        }

        const name =
            user.name ||
            user.username ||
            "OPERADOR";

        const username =
            user.username ||
            "operador";

        const rank = getRank();

        const nameElements = [
            $("#nexusUserName"),
            ...$$("[data-nexus-user-name]")
        ];

        const usernameElements = [
            $("#nexusUsername"),
            ...$$("[data-nexus-username]")
        ];

        const rankElements = [
            $("#nexusRank"),
            ...$$("[data-nexus-rank]")
        ];

        nameElements.forEach((element) => {
            if (element) {
                element.textContent = name;
            }
        });

        usernameElements.forEach((element) => {
            if (element) {
                element.textContent =
                    `@${username}`;
            }
        });

        rankElements.forEach((element) => {
            if (element) {
                element.textContent = rank;
            }
        });

        const levelElement =
            $("#nexusLevel");

        if (levelElement) {
            levelElement.textContent =
                `N${getAccessLevel()}`;
        }
    }

    /* =====================================================
       RELÓGIO
       ===================================================== */

    function updateClock() {
        const clock = $("#nexusClock");

        if (!clock) {
            return;
        }

        const now = new Date();

        clock.textContent =
            now.toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );
    }

    function startClock() {
        if (state.clockTimer) {
            clearInterval(state.clockTimer);
        }

        updateClock();

        state.clockTimer =
            window.setInterval(
                updateClock,
                1000
            );
    }

    function stopClock() {
        if (!state.clockTimer) {
            return;
        }

        clearInterval(
            state.clockTimer
        );

        state.clockTimer = null;
    }

    /* =====================================================
       MÓDULOS
       ===================================================== */

    function setActiveModule(module) {
        state.currentModule = module;

        $$("[data-nexus-module]").forEach(
            (button) => {
                button.classList.toggle(
                    "active",
                    button.dataset.nexusModule === module
                );
            }
        );
    }

    function getModuleContainer() {
        return $("#nexusModuleContent");
    }

    function renderModule(module) {
        const container =
            getModuleContainer();

        if (!container) {
            return;
        }

        setActiveModule(module);

        switch (module) {
            case "profile":
                renderProfileModule(container);
                break;

            case "training":
                renderTrainingModule(container);
                break;

            case "missions":
                renderMissionsModule(container);
                break;

            case "ranking":
                renderRankingModule(container);
                break;

            case "documents":
                renderDocumentsModule(container);
                break;

            case "chat":
                renderChatModule(container);
                break;

            case "notifications":
                renderNotificationsModule(container);
                break;

            case "terminal":
                renderTerminalModule(container);
                break;

            default:
                renderProfileModule(container);
        }
    }

    /* =====================================================
       MÓDULO — PERFIL
       ===================================================== */

    function renderProfileModule(container) {
        const user = getUser() || {};

        const progress =
            window.CyberNexisAuth?.getProgress
                ? window.CyberNexisAuth.getProgress()
                : null;

        const beginnerResult =
            getStorage(
                NEXUS_CONFIG.beginnerResultKey,
                null
            );

        const intermediateResult =
            getStorage(
                NEXUS_CONFIG.intermediateResultKey,
                null
            );

        const profileResult =
            getStorage(
                NEXUS_CONFIG.profileResultKey,
                null
            );

        const name =
            user.name ||
            user.username ||
            "Operador";

        const username =
            user.username ||
            "operador";

        const level = clamp(
            safeNumber(
                progress?.level,
                getAccessLevel()
            ),
            0,
            3
        );

        const completedTests = clamp(
            safeNumber(
                progress?.completedTests,
                3
            ),
            0,
            3
        );

        const percentage =
            safePercentage(
                progress?.percentage ?? 100
            );

        const beginnerPercentage =
            safePercentage(
                beginnerResult?.percentage
            );

        const intermediatePercentage =
            safePercentage(
                intermediateResult?.percentage
            );

        const profilePercentage =
            profileResult
                ? 100
                : 0;

        container.innerHTML = `
            <div class="nexus-module-header">
                <div>
                    <span class="nexus-kicker">
                        IDENTITY MODULE
                    </span>

                    <h2>
                        Perfil do operador
                    </h2>

                    <p>
                        Informações e progresso
                        registrado localmente.
                    </p>
                </div>

                <span class="nexus-module-status">
                    ONLINE
                </span>
            </div>

            <div class="nexus-profile-grid">

                <article class="nexus-profile-card">

                    <div class="nexus-profile-avatar">
                        ${escapeHTML(
                            String(name)
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </div>

                    <div class="nexus-profile-main">

                        <h3>
                            ${escapeHTML(name)}
                        </h3>

                        <p>
                            @${escapeHTML(username)}
                        </p>

                        <span class="nexus-rank-badge">
                            ${escapeHTML(getRank())}
                        </span>

                    </div>

                </article>

                <article class="nexus-data-card">
                    <span>NÍVEL</span>
                    <strong>N${level}</strong>
                </article>

                <article class="nexus-data-card">
                    <span>TESTES</span>
                    <strong>${completedTests}/3</strong>
                </article>

                <article class="nexus-data-card">
                    <span>PROGRESSO</span>
                    <strong>${percentage}%</strong>
                </article>

            </div>

            <div class="nexus-section-block">

                <div class="nexus-section-title">
                    <span>
                        PROGRESSO DE FORMAÇÃO
                    </span>
                </div>

                <div class="nexus-progress-list">

                    <div class="nexus-progress-item">

                        <div>
                            <span>N0 → N1</span>

                            <strong>
                                ${beginnerPercentage}%
                            </strong>
                        </div>

                        <div class="nexus-progress-bar">
                            <span
                                style="width:${beginnerPercentage}%"
                            ></span>
                        </div>

                    </div>

                    <div class="nexus-progress-item">

                        <div>
                            <span>N1 → N2</span>

                            <strong>
                                ${intermediatePercentage}%
                            </strong>
                        </div>

                        <div class="nexus-progress-bar">
                            <span
                                style="width:${intermediatePercentage}%"
                            ></span>
                        </div>

                    </div>

                    <div class="nexus-progress-item">

                        <div>
                            <span>PERFIL</span>

                            <strong>
                                ${profilePercentage}%
                            </strong>
                        </div>

                        <div class="nexus-progress-bar">
                            <span
                                style="width:${profilePercentage}%"
                            ></span>
                        </div>

                    </div>

                </div>
            </div>

            <div class="nexus-section-block">

                <div class="nexus-section-title">
                    <span>REGISTROS</span>
                </div>

                <div class="nexus-info-grid">

                    <div>
                        <span>CADASTRO</span>

                        <strong>
                            ${formatDate(
                                user.createdAt
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>ÚLTIMO ACESSO</span>

                        <strong>
                            ${formatDateTime(
                                user.lastLogin
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>STATUS</span>

                        <strong>
                            ATIVO
                        </strong>
                    </div>

                    <div>
                        <span>AUTORIZAÇÃO NEXUS</span>

                        <strong>
                            CONCEDIDA
                        </strong>
                    </div>

                </div>

            </div>

            <div class="nexus-module-note">

                <strong>NOTA:</strong>

                O NEXUS atual é uma interface
                local de demonstração.
                Os dados exibidos dependem
                do armazenamento do navegador.

            </div>
        `;
    }

    /* =====================================================
       MÓDULO — TREINAMENTO
       ===================================================== */

    function renderTrainingModule(container) {
        container.innerHTML = `
            <div class="nexus-module-header">

                <div>

                    <span class="nexus-kicker">
                        TRAINING MODULE
                    </span>

                    <h2>
                        Centro de treinamento
                    </h2>

                    <p>
                        Trilhas educacionais
                        para evolução técnica.
                    </p>

                </div>

            </div>

            <div class="nexus-module-cards">

                <article class="nexus-module-card">

                    <span class="nexus-card-number">
                        01
                    </span>

                    <h3>
                        Fundamentos de Redes
                    </h3>

                    <p>
                        TCP/IP, portas, protocolos,
                        DNS, HTTP e arquitetura
                        de redes.
                    </p>

                    <span class="nexus-card-status">
                        DISPONÍVEL
                    </span>

                </article>

                <article class="nexus-module-card">

                    <span class="nexus-card-number">
                        02
                    </span>

                    <h3>
                        Linux
                    </h3>

                    <p>
                        Terminal, arquivos,
                        permissões, processos
                        e administração básica.
                    </p>

                    <span class="nexus-card-status">
                        DISPONÍVEL
                    </span>

                </article>

                <article class="nexus-module-card">

                    <span class="nexus-card-number">
                        03
                    </span>

                    <h3>
                        Segurança Web
                    </h3>

                    <p>
                        Autenticação, sessões,
                        validação, XSS,
                        SQL Injection e defesa.
                    </p>

                    <span class="nexus-card-status">
                        DISPONÍVEL
                    </span>

                </article>

                <article class="nexus-module-card">

                    <span class="nexus-card-number">
                        04
                    </span>

                    <h3>
                        Criptografia
                    </h3>

                    <p>
                        Hashes, chaves,
                        certificados,
                        confidencialidade
                        e integridade.
                    </p>

                    <span class="nexus-card-status">
                        DISPONÍVEL
                    </span>

                </article>

            </div>
        `;
    }

    /* =====================================================
       MÓDULO — MISSÕES
       ===================================================== */

    function renderMissionsModule(container) {
        container.innerHTML = `
            <div class="nexus-module-header">

                <div>

                    <span class="nexus-kicker">
                        MISSION CONTROL
                    </span>

                    <h2>
                        Missões educacionais
                    </h2>

                    <p>
                        Desafios simulados
                        e autorizados.
                    </p>

                </div>

            </div>

            <div class="nexus-module-cards">

                <article class="nexus-module-card mission-card">

                    <span class="nexus-card-number">
                        N0
                    </span>

                    <h3>
                        Reconhecimento seguro
                    </h3>

                    <p>
                        Identifique informações públicas
                        dentro de um ambiente
                        de laboratório.
                    </p>

                    <span class="nexus-card-status">
                        LABORATÓRIO
                    </span>

                </article>

                <article class="nexus-module-card mission-card">

                    <span class="nexus-card-number">
                        N1
                    </span>

                    <h3>
                        Web Defense
                    </h3>

                    <p>
                        Analise cenários simulados
                        e identifique possíveis
                        controles defensivos.
                    </p>

                    <span class="nexus-card-status">
                        LABORATÓRIO
                    </span>

                </article>

                <article class="nexus-module-card mission-card">

                    <span class="nexus-card-number">
                        N2
                    </span>

                    <h3>
                        Incident Response
                    </h3>

                    <p>
                        Interprete eventos fictícios
                        de segurança e organize
                        uma resposta responsável.
                    </p>

                    <span class="nexus-card-status">
                        LABORATÓRIO
                    </span>

                </article>

            </div>

            <div class="nexus-module-note">

                Todas as missões devem permanecer
                dentro do ambiente autorizado.

                Nenhuma atividade deve ser direcionada
                contra sistemas reais sem autorização.

            </div>
        `;
    }

    /* =====================================================
       MÓDULO — RANKING
       ===================================================== */

    function renderRankingModule(container) {
        const user = getUser() || {};

        const username =
            user.username ||
            "operador";

        container.innerHTML = `
            <div class="nexus-module-header">

                <div>

                    <span class="nexus-kicker">
                        RANKING MODULE
                    </span>

                    <h2>
                        Ranking interno
                    </h2>

                    <p>
                        Classificação demonstrativa
                        do ambiente local.
                    </p>

                </div>

            </div>

            <div class="nexus-ranking">

                <div class="nexus-ranking-row highlight">

                    <span>#01</span>

                    <strong>
                        ${escapeHTML(username)}
                    </strong>

                    <em>
                        ${escapeHTML(getRank())}
                    </em>

                </div>

                <div class="nexus-ranking-row">

                    <span>#02</span>

                    <strong>
                        operator_alpha
                    </strong>

                    <em>
                        N2 OPERADOR
                    </em>

                </div>

                <div class="nexus-ranking-row">

                    <span>#03</span>

                    <strong>
                        operator_beta
                    </strong>

                    <em>
                        N1 INICIADO
                    </em>

                </div>

            </div>

            <div class="nexus-module-note">

                Este ranking é apenas demonstrativo
                e não representa uma classificação
                real de usuários.

            </div>
        `;
    }

    /* =====================================================
       MÓDULO — DOCUMENTOS
       ===================================================== */

    function renderDocumentsModule(container) {
        container.innerHTML = `
            <div class="nexus-module-header">

                <div>

                    <span class="nexus-kicker">
                        DOCUMENTS MODULE
                    </span>

                    <h2>
                        Documentação
                    </h2>

                    <p>
                        Materiais de referência
                        do CYBER NEXIS.
                    </p>

                </div>

            </div>

            <div class="nexus-document-list">

                <article class="nexus-document">

                    <div>

                        <span>
                            DOC-001
                        </span>

                        <h3>
                            Regras da organização
                        </h3>

                        <p>
                            Princípios de autorização,
                            privacidade e responsabilidade.
                        </p>

                    </div>

                    <a
                        href="regras.html"
                        class="btn btn-outline"
                    >
                        ABRIR
                    </a>

                </article>

                <article class="nexus-document">

                    <div>

                        <span>
                            DOC-002
                        </span>

                        <h3>
                            Serviços
                        </h3>

                        <p>
                            Áreas de atuação e serviços
                            de segurança da organização.
                        </p>

                    </div>

                    <a
                        href="servicos.html"
                        class="btn btn-outline"
                    >
                        ABRIR
                    </a>

                </article>

                <article class="nexus-document">

                    <div>

                        <span>
                            DOC-003
                        </span>

                        <h3>
                            Habilidades
                        </h3>

                        <p>
                            Testes e trilhas educacionais
                            disponíveis no ambiente.
                        </p>

                    </div>

                    <a
                        href="testes.html"
                        class="btn btn-outline"
                    >
                        ABRIR
                    </a>

                </article>

            </div>
        `;
    }

    /* =====================================================
       MÓDULO — CHAT
       ===================================================== */

    function renderChatModule(container) {
        container.innerHTML = `
            <div class="nexus-module-header">

                <div>

                    <span class="nexus-kicker">
                        COMMUNICATION MODULE
                    </span>

                    <h2>
                        Comunicação
                    </h2>

                    <p>
                        Canal interno demonstrativo.
                    </p>

                </div>

            </div>

            <div class="nexus-chat">

                <div class="nexus-chat-message">

                    <span>
                        SYSTEM
                    </span>

                    <p>
                        Bem-vindo ao canal NEXUS.
                    </p>

                </div>

                <div class="nexus-chat-message">

                    <span>
                        CYBER NEXIS
                    </span>

                    <p>
                        Utilize os canais oficiais
                        para comunicação real
                        com a organização.
                    </p>

                </div>

                <div class="nexus-chat-message">

                    <span>
                        STATUS
                    </span>

                    <p>
                        Chat interno ainda não conectado
                        a um serviço de mensagens.
                    </p>

                </div>

            </div>

            <div class="nexus-module-note">

                O chat atual é somente uma
                interface visual.

                Nenhuma mensagem é enviada
                para um servidor.

            </div>
        `;
    }

    /* =====================================================
       MÓDULO — NOTIFICAÇÕES
       ===================================================== */

    function getNotifications() {
        const activities =
            getStorage(
                NEXUS_CONFIG.activityKey,
                []
            );

        const list =
            Array.isArray(activities)
                ? activities
                : [];

        return list
            .slice(0, 10)
            .map((activity) => ({
                title:
                    activity?.title ||
                    "Atividade registrada",

                description:
                    activity?.description ||
                    "Uma atividade foi registrada no sistema.",

                date:
                    activity?.date ||
                    activity?.createdAt ||
                    null
            }));
    }

    function renderNotificationsModule(container) {
        const notifications =
            getNotifications();

        container.innerHTML = `
            <div class="nexus-module-header">

                <div>

                    <span class="nexus-kicker">
                        NOTIFICATION MODULE
                    </span>

                    <h2>
                        Notificações
                    </h2>

                    <p>
                        Eventos recentes
                        da sua sessão.
                    </p>

                </div>

            </div>

            <div class="nexus-notification-list">

                ${
                    notifications.length
                        ? notifications
                            .map(
                                (notification) => `
                                    <article
                                        class="nexus-notification"
                                    >

                                        <span
                                            class="nexus-notification-dot"
                                        ></span>

                                        <div>

                                            <strong>
                                                ${escapeHTML(
                                                    notification.title
                                                )}
                                            </strong>

                                            <p>
                                                ${escapeHTML(
                                                    notification.description
                                                )}
                                            </p>

                                            <small>
                                                ${formatDateTime(
                                                    notification.date
                                                )}
                                            </small>

                                        </div>

                                    </article>
                                `
                            )
                            .join("")
                        : `
                            <div class="nexus-empty">
                                Nenhuma notificação
                                registrada.
                            </div>
                        `
                }

            </div>
        `;
    }

    function updateNotificationBadge() {
        const badge =
            $("#nexusNotificationBadge");

        if (!badge) {
            return;
        }

        const notifications =
            getNotifications();

        state.notificationCount =
            notifications.length;

        if (!state.notificationCount) {
            hideElement(badge);
            return;
        }

        badge.textContent =
            state.notificationCount > 99
                ? "99+"
                : String(
                    state.notificationCount
                );

        showElement(badge);
    }

    /* =====================================================
       TERMINAL SEGURO
       ===================================================== */

    function renderTerminalModule(container) {
        container.innerHTML = `
            <div class="nexus-module-header">

                <div>

                    <span class="nexus-kicker">
                        SAFE TERMINAL
                    </span>

                    <h2>
                        Terminal NEXUS
                    </h2>

                    <p>
                        Terminal educacional simulado.
                    </p>

                </div>

            </div>

            <div class="nexus-terminal-safe">

                <div class="nexus-terminal-warning">

                    <strong>
                        AMBIENTE SIMULADO
                    </strong>

                    <span>
                        Este terminal não executa comandos
                        no dispositivo, servidor ou sistema
                        operacional.
                    </span>

                </div>

                <div
                    id="nexusTerminalOutput"
                    class="nexus-terminal-output"
                    aria-live="polite"
                ></div>

                <form
                    id="nexusTerminalForm"
                    class="nexus-terminal-form"
                >

                    <span>
                        nexus@cyber:~$
                    </span>

                    <input
                        id="nexusTerminalInput"
                        type="text"
                        autocomplete="off"
                        spellcheck="false"
                        maxlength="80"
                        placeholder="Digite help"
                        aria-label="Comando do terminal"
                    >

                    <button
                        type="submit"
                        class="btn btn-outline"
                    >
                        EXECUTAR
                    </button>

                </form>

                <div class="nexus-terminal-help">

                    Comandos permitidos:

                    <code>help</code>,
                    <code>status</code>,
                    <code>about</code>,
                    <code>whoami</code>,
                    <code>clear</code>.

                </div>

            </div>
        `;

        initTerminal();
    }

    function terminalPrint(command, output) {
        const outputElement =
            $("#nexusTerminalOutput");

        if (!outputElement) {
            return;
        }

        const block =
            document.createElement("div");

        block.className =
            "nexus-terminal-line";

        const commandElement =
            document.createElement("div");

        commandElement.className =
            "terminal-command";

        const commandPrompt =
            document.createElement("span");

        commandPrompt.textContent =
            "nexus@cyber:~$";

        const commandText =
            document.createTextNode(
                ` ${String(command)}`
            );

        commandElement.appendChild(
            commandPrompt
        );

        commandElement.appendChild(
            commandText
        );

        const responseElement =
            document.createElement("div");

        responseElement.className =
            "terminal-response";

        responseElement.textContent =
            String(output);

        block.appendChild(
            commandElement
        );

        block.appendChild(
            responseElement
        );

        outputElement.appendChild(block);

        outputElement.scrollTop =
            outputElement.scrollHeight;
    }

    function clearTerminal() {
        const output =
            $("#nexusTerminalOutput");

        if (output) {
            output.innerHTML = "";
        }

        state.terminalHistory = [];
    }

    function executeSafeCommand(command) {
        const rawCommand =
            String(command ?? "").trim();

        const normalized =
            rawCommand.toLowerCase();

        if (!normalized) {
            return;
        }

        state.terminalHistory.push(
            normalized
        );

        switch (normalized) {

            case "help":

                terminalPrint(
                    rawCommand,
                    "Comandos: help | status | about | whoami | clear"
                );

                break;

            case "status":

                terminalPrint(
                    rawCommand,
                    "NEXUS ONLINE | SESSION AUTHORIZED | TERMINAL SIMULATED"
                );

                break;

            case "about":

                terminalPrint(
                    rawCommand,
                    "CYBER NEXIS — ambiente educacional de segurança cibernética."
                );

                break;

            case "whoami": {

                const user =
                    getUser() || {};

                const username =
                    user.username ||
                    "operador";

                terminalPrint(
                    rawCommand,
                    `${username} | ${getRank()}`
                );

                break;
            }

            case "clear":

                clearTerminal();

                break;

            default:

                terminalPrint(
                    rawCommand,
                    `Comando não disponível: ${rawCommand}. Digite "help".`
                );
        }
    }

    function initTerminal() {
        const form =
            $("#nexusTerminalForm");

        const input =
            $("#nexusTerminalInput");

        if (!form || !input) {
            return;
        }

        terminalPrint(
            "system",
            "Terminal seguro iniciado. Digite help."
        );

        form.addEventListener(
            "submit",
            (event) => {
                event.preventDefault();

                const command =
                    input.value.trim();

                if (!command) {
                    input.focus();
                    return;
                }

                executeSafeCommand(
                    command
                );

                input.value = "";
                input.focus();
            }
        );
    }

    /* =====================================================
       NAVEGAÇÃO DOS MÓDULOS
       ===================================================== */

    function initModuleNavigation() {
        $$("[data-nexus-module]").forEach(
            (button) => {

                if (
                    button.dataset.nexusBound === "true"
                ) {
                    return;
                }

                button.dataset.nexusBound = "true";

                button.addEventListener(
                    "click",
                    () => {

                        const module =
                            button.dataset.nexusModule;

                        if (!module) {
                            return;
                        }

                        renderModule(module);
                    }
                );
            }
        );
    }

    /* =====================================================
       LOGOUT
       ===================================================== */

    function logout() {
        stopClock();

        if (
            window.CyberNexisAuth?.logout
        ) {
            window.CyberNexisAuth.logout();
            return;
        }

        localStorage.removeItem(
            NEXUS_CONFIG.sessionKey
        );

        window.location.href =
            NEXUS_CONFIG.loginUrl;
    }

    function initLogout() {
        const button =
            $("#nexusLogoutButton");

        if (!button) {
            return;
        }

        if (
            button.dataset.nexusBound === "true"
        ) {
            return;
        }

        button.dataset.nexusBound = "true";

        button.addEventListener(
            "click",
            logout
        );
    }

    /* =====================================================
       VOLTAR
       ===================================================== */

    function initBackButton() {
        const button =
            $("#nexusBackButton");

        if (!button) {
            return;
        }

        if (
            button.dataset.nexusBound === "true"
        ) {
            return;
        }

        button.dataset.nexusBound = "true";

        button.addEventListener(
            "click",
            () => {
                window.location.href =
                    NEXUS_CONFIG.profileUrl;
            }
        );
    }

    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    function initializeNexus() {
        if (state.initialized) {
            return;
        }

        state.initialized = true;

        /*
         * Esses controles ficam disponíveis
         * mesmo quando o usuário não possui
         * autorização para o NEXUS.
         */
        initLogout();
        initBackButton();

        startClock();

        const access =
            checkAccess();

        updateRequirements(
            access
        );

        renderAccessGate();

        if (!access.authorized) {
            return;
        }

        updateIdentity();

        updateNotificationBadge();

        initModuleNavigation();

        renderModule(
            "profile"
        );
    }

    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.CyberNexisNexus = {
        config: NEXUS_CONFIG,

        state,

        checkAccess,
        getRank,
        getAccessLevel,

        renderModule,

        updateIdentity,
        updateNotificationBadge,

        executeSafeCommand,
        clearTerminal,

        logout
    };

    /* =====================================================
       DOM READY
       ===================================================== */

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeNexus,
            { once: true }
        );
    } else {
        initializeNexus();
    }

})();