
/* =========================================================
   CYBER NEXIS — SISTEMA DE TESTES
   Arquivo: js/tests.js

   Segurança:
   - Gabaritos oficiais somente no servidor.
   - Início de tentativa via /api/start-test.
   - Envio oficial via /api/submit-test.
   - Pontuação calculada exclusivamente no servidor.
   - localStorage utilizado apenas como cache visual.
   - NEXUS nunca é liberado por cache local.
   ========================================================= */

"use strict";

(() => {
    if (window.__CYBER_NEXIS_TESTS_INITIALIZED__) return;
    window.__CYBER_NEXIS_TESTS_INITIALIZED__ = true;

    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {
        passingScore: 70,
        endpoints: {
            start: "/api/start-test",
            submit: "/api/submit-test"
        },
        keys: {
            beginner: "cyberNexis_iniciante_passed",
            intermediate: "cyberNexis_intermediario_passed",
            profile: "cyberNexis_profile_completed",
            beginnerResult: "cyberNexis_iniciante_result",
            intermediateResult: "cyberNexis_intermediario_result",
            profileResult: "cyberNexis_profile_result"
        }
    };

    /* =====================================================
       QUESTÕES — N0 INICIANTE

       ATENÇÃO:
       Não adicionar gabaritos neste arquivo.
       A correção oficial pertence ao servidor.
       ===================================================== */

    const beginnerQuestions = [
        {
            question: "Qual é a principal função de um firewall?",
            options: [
                "Aumentar a velocidade da internet",
                "Controlar e filtrar o tráfego de rede",
                "Criar senhas automaticamente",
                "Armazenar arquivos pessoais"
            ],
            explanation: "Um firewall controla o tráfego de rede conforme regras definidas."
        },
        {
            question: "O que o HTTPS ajuda a proteger?",
            options: [
                "Apenas o tamanho das páginas",
                "A comunicação entre cliente e servidor",
                "A velocidade do processador",
                "A memória física do computador"
            ],
            explanation: "HTTPS utiliza TLS para proteger a comunicação entre navegador e servidor."
        },
        {
            question: "Qual é uma boa prática para senhas?",
            options: [
                "Usar a mesma senha em todos os serviços",
                "Usar informações públicas como senha",
                "Utilizar senhas longas e únicas",
                "Compartilhar a senha com colegas"
            ],
            explanation: "Senhas longas e únicas reduzem os riscos associados a vazamentos."
        },
        {
            question: "No Linux, qual comando normalmente lista arquivos de um diretório?",
            options: [
                "ls",
                "scan",
                "open",
                "list-network"
            ],
            explanation: "O comando ls lista arquivos e diretórios."
        },
        {
            question: "Qual mecanismo adiciona uma camada extra além da senha?",
            options: [
                "MFA",
                "HTTP",
                "DNS",
                "HTML"
            ],
            explanation: "MFA é a autenticação multifator, que utiliza mais de um fator de autenticação."
        },
        {
            question: "Qual situação pode indicar uma tentativa de phishing?",
            options: [
                "Uma mensagem com link suspeito solicitando sua senha",
                "Uma atualização oficial do sistema",
                "Uma página local de documentação",
                "Um arquivo criado pelo próprio usuário"
            ],
            explanation: "Phishing utiliza mensagens enganosas para tentar obter informações pessoais."
        },
        {
            question: "O princípio do menor privilégio significa:",
            options: [
                "Dar acesso administrativo para todos",
                "Dar somente os privilégios necessários",
                "Remover todos os controles de acesso",
                "Compartilhar uma única conta"
            ],
            explanation: "Cada usuário deve ter somente os acessos necessários para sua função."
        },
        {
            question: "Antes de realizar um teste de segurança em um sistema, o que deve existir?",
            options: [
                "Apenas conhecimento técnico",
                "Autorização e escopo definidos",
                "Uma conta administrativa obtida sem permissão",
                "Um programa para apagar logs"
            ],
            explanation: "Testes legítimos exigem autorização e limites de atuação claramente definidos."
        }
    ];

    /* =====================================================
       QUESTÕES — N1 INTERMEDIÁRIO
       ===================================================== */

    const intermediateQuestions = [
        {
            question: "SQL Injection está relacionado principalmente a:",
            options: [
                "Falhas na construção insegura de consultas SQL",
                "Problemas físicos no teclado",
                "Falhas no monitor",
                "Configuração do brilho da tela"
            ],
            explanation: "SQL Injection pode ocorrer quando entradas são incorporadas de forma insegura em consultas SQL."
        },
        {
            question: "Qual prática ajuda a reduzir SQL Injection?",
            options: [
                "Usar consultas parametrizadas",
                "Exibir erros detalhados para todos",
                "Concatenar entradas diretamente nas consultas",
                "Desativar autenticação"
            ],
            explanation: "Consultas parametrizadas separam os dados do usuário da estrutura da consulta."
        },
        {
            question: "Por que logs são importantes para a segurança?",
            options: [
                "Substituem todos os controles de segurança",
                "Ajudam na investigação e detecção de eventos",
                "Tornam qualquer sistema invulnerável",
                "Eliminam a necessidade de backups"
            ],
            explanation: "Logs ajudam a detectar eventos e reconstruir acontecimentos durante uma investigação."
        },
        {
            question: "O que significa defesa em profundidade?",
            options: [
                "Usar apenas uma ferramenta de segurança",
                "Utilizar várias camadas complementares de proteção",
                "Remover controles para facilitar a manutenção",
                "Concentrar toda a segurança em uma única senha"
            ],
            explanation: "A defesa em profundidade combina controles diferentes para não depender de uma única barreira."
        },
        {
            question: "Qual medida ajuda contra tentativas automatizadas de login?",
            options: [
                "Rate limiting e controles de tentativas",
                "Remover limites de tentativa",
                "Usar uma senha padrão para todos",
                "Desativar registros de autenticação"
            ],
            explanation: "Limites de tentativas podem reduzir ataques automatizados de força bruta."
        },
        {
            question: "Como senhas devem ser armazenadas em uma aplicação real?",
            options: [
                "Em texto puro",
                "Em arquivos públicos",
                "Com um mecanismo adequado de hashing de senhas",
                "Dentro do HTML"
            ],
            explanation: "Aplicações devem usar hashing apropriado para senhas, com salt e parâmetros seguros."
        },
        {
            question: "Durante um teste autorizado, o escopo serve para:",
            options: [
                "Definir quais sistemas e ações estão autorizados",
                "Permitir qualquer ação no ambiente",
                "Eliminar a necessidade de autorização",
                "Esconder o teste do responsável"
            ],
            explanation: "O escopo estabelece os limites do trabalho autorizado."
        },
        {
            question: "XSS normalmente envolve:",
            options: [
                "Execução de conteúdo não confiável no contexto de uma aplicação",
                "Falha elétrica no servidor",
                "Problemas no cabo de rede",
                "Erro de temperatura do processador"
            ],
            explanation: "Cross-Site Scripting envolve conteúdo não confiável executado no contexto da aplicação."
        },
        {
            question: "Por que atualizações de segurança são importantes?",
            options: [
                "Podem corrigir vulnerabilidades conhecidas",
                "Eliminam todos os riscos automaticamente",
                "Substituem backups",
                "Tornam senhas desnecessárias"
            ],
            explanation: "Atualizações podem corrigir vulnerabilidades e outros problemas de segurança."
        },
        {
            question: "Ao encontrar uma vulnerabilidade em um sistema de terceiros sem autorização, o correto é:",
            options: [
                "Explorar até obter dados",
                "Publicar dados privados",
                "Respeitar limites legais e buscar um canal responsável",
                "Vender as informações"
            ],
            explanation: "A atuação responsável respeita autorização, privacidade e divulgação adequada."
        }
    ];

    /* =====================================================
       QUESTIONÁRIO DE PERFIL TÉCNICO
       ===================================================== */

    const profileQuestions = [
        {
            question: "Em um laboratório autorizado, qual atividade mais combina com você?",
            options: [
                { text: "Investigar evidências e entender a causa", type: "analista" },
                { text: "Testar hipóteses dentro do escopo permitido", type: "executor" },
                { text: "Documentar e comunicar descobertas", type: "colaborador" },
                { text: "Estudar profundamente a tecnologia", type: "especialista" }
            ]
        },
        {
            question: "Qual atividade desperta mais interesse?",
            options: [
                { text: "Análise de logs e eventos", type: "analista" },
                { text: "Laboratórios e desafios técnicos", type: "executor" },
                { text: "Relatórios e trabalho em equipe", type: "colaborador" },
                { text: "Arquitetura e fundamentos avançados", type: "especialista" }
            ]
        },
        {
            question: "Como você prefere aprender?",
            options: [
                { text: "Observando evidências e comparando informações", type: "analista" },
                { text: "Praticando em ambientes controlados", type: "executor" },
                { text: "Trocando conhecimento com outras pessoas", type: "colaborador" },
                { text: "Estudando documentação e conceitos", type: "especialista" }
            ]
        },
        {
            question: "Em um projeto de segurança, qual função combina mais com você?",
            options: [
                { text: "Identificar padrões e anomalias", type: "analista" },
                { text: "Executar testes definidos no escopo", type: "executor" },
                { text: "Coordenar informações e documentação", type: "colaborador" },
                { text: "Aprofundar conhecimentos técnicos", type: "especialista" }
            ]
        },
        {
            question: "Qual resultado mais satisfaria você após um laboratório?",
            options: [
                { text: "Entender exatamente o que aconteceu", type: "analista" },
                { text: "Reproduzir um cenário autorizado", type: "executor" },
                { text: "Explicar o resultado para a equipe", type: "colaborador" },
                { text: "Aprender uma técnica ou conceito novo", type: "especialista" }
            ]
        }
    ];

    const profileDescriptions = {
        analista: {
            title: "ANALISTA",
            description: "Perfil voltado à investigação, interpretação de evidências, identificação de padrões e compreensão de eventos de segurança."
        },
        executor: {
            title: "EXECUTOR",
            description: "Perfil voltado à prática técnica, aos laboratórios controlados e à execução de testes dentro de escopos autorizados."
        },
        colaborador: {
            title: "COLABORADOR",
            description: "Perfil voltado à comunicação, documentação, organização e colaboração em atividades de segurança."
        },
        especialista: {
            title: "ESPECIALISTA",
            description: "Perfil voltado ao aprofundamento técnico, ao estudo de fundamentos e à especialização em áreas específicas."
        }
    };

    /* =====================================================
       ESTADO
       ===================================================== */

    const state = {
        currentLevel: null,
        questionIndex: 0,
        selectedAnswer: null,
        answers: [],
        attemptId: null,
        isStarting: false,
        isSubmitting: false,
        profileAnswers: []
    };

    /* =====================================================
       UTILITÁRIOS
       ===================================================== */

    const $ = (id) => document.getElementById(id);

    function all(selector) {
        return Array.from(document.querySelectorAll(selector));
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setVisible(element, visible) {
        if (!element) return;
        element.hidden = !visible;
        element.classList.toggle("hidden", !visible);
    }

    // O localStorage é apenas um cache visual.
    // Nunca deve autorizar operações protegidas.
    function readBoolean(key) {
        try {
            return localStorage.getItem(key) === "true";
        } catch (error) {
            console.warn("Não foi possível ler o cache visual.", error);
            return false;
        }
    }

    function saveValue(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.warn("Não foi possível salvar o cache visual.", error);
            return false;
        }
    }

    function hasPassed(level) {
        if (level === "iniciante") {
            return readBoolean(CONFIG.keys.beginner);
        }

        if (level === "intermediario") {
            return readBoolean(CONFIG.keys.intermediate);
        }

        return false;
    }

    function hasCompletedProfile() {
        return readBoolean(CONFIG.keys.profile);
    }

    function addActivity(type, title, description) {
        const auth = window.CyberNexisAuth;

        if (auth && typeof auth.addActivity === "function") {
            try {
                auth.addActivity(type, title, description);
            } catch (error) {
                console.warn("Não foi possível registrar a atividade.", error);
            }
        }
    }

    async function getAuthToken() {
        const auth = window.CyberNexisAuth;

        if (!auth || typeof auth.getIdToken !== "function") {
            throw new Error(
                "Não foi possível verificar sua sessão. Entre novamente."
            );
        }

        const token = await auth.getIdToken();

        if (!token || typeof token !== "string") {
            throw new Error(
                "Sessão inválida. Entre novamente para continuar."
            );
        }

        return token;
    }

    async function postAuthenticated(url, body) {
        const token = await getAuthToken();

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        let data;

        try {
            data = await response.json();
        } catch (error) {
            throw new Error(
                "O servidor retornou uma resposta inválida."
            );
        }

        if (!response.ok || !data || data.success !== true) {
            const error = new Error(
                data?.error || "Não foi possível concluir a operação."
            );

            error.code = data?.code || null;
            error.status = response.status;

            throw error;
        }

        return data;
    }

    /* =====================================================
       CARTÕES E DESBLOQUEIOS VISUAIS
       ===================================================== */

    function updateTestCards() {
        const beginnerPassed = hasPassed("iniciante");
        const intermediatePassed = hasPassed("intermediario");
        const profileCompleted = hasCompletedProfile();

        const buttons = all(
            ".test-start-button[data-test], .test-start[data-test]"
        );

        buttons.forEach((button) => {
            const level = button.dataset.test;
            const card = button.closest("[data-level]");

            let unlocked = false;
            let completed = false;

            if (level === "iniciante") {
                unlocked = true;
                completed = beginnerPassed;
            } else if (level === "intermediario") {
                // Cache visual apenas.
                // O servidor ainda valida a progressão.
                unlocked = beginnerPassed;
                completed = intermediatePassed;
            } else if (level === "perfil") {
                // Cache visual apenas.
                completed = profileCompleted;
                unlocked = beginnerPassed && intermediatePassed;
            } else {
                return;
            }

            button.disabled = !unlocked;
            button.classList.toggle("disabled", !unlocked);

            if (completed) {
                button.textContent = "Refazer teste";
            } else if (!unlocked) {
                button.textContent =
                    level === "intermediario"
                        ? "Complete o N0"
                        : "Complete o N1";
            } else {
                button.textContent = "Iniciar teste";
            }

            if (card) {
                card.classList.toggle("locked", !unlocked);
                card.classList.toggle(
                    "available",
                    unlocked && !completed
                );
                card.classList.toggle("completed", completed);

                const status = card.querySelector(
                    ".test-level-status, .test-status"
                );

                if (status) {
                    status.textContent = completed
                        ? "CONCLUÍDO"
                        : unlocked
                            ? "DISPONÍVEL"
                            : "BLOQUEADO";
                }
            }
        });

        updateNexusCard();
    }

    function updateNexusCard() {
        const button = $("nexusCardButton");
        const card = document.querySelector('[data-level="nexus"]');

        if (!button) return;

        const auth = window.CyberNexisAuth;

        // Não existe fallback para localStorage.
        // Sem confirmação oficial, o NEXUS permanece bloqueado.
        const unlocked = Boolean(
            auth &&
            typeof auth.canAccessNexus === "function" &&
            auth.canAccessNexus() === true
        );

        button.setAttribute(
            "aria-disabled",
            String(!unlocked)
        );

        button.classList.toggle("disabled", !unlocked);
        button.disabled = !unlocked;

        button.textContent = unlocked
            ? "Acessar NEXUS"
            : "Acesso em verificação";

        if (card) {
            card.classList.toggle("locked", !unlocked);
            card.classList.toggle("unlocked", unlocked);
        }
    }

    /* =====================================================
       SELEÇÃO E INÍCIO
       ===================================================== */

    function startSelectedTest(level) {
        if (level === "iniciante") {
            startKnowledgeTest("iniciante");
            return;
        }

        if (level === "intermediario") {
            if (!hasPassed("iniciante")) {
                showMessage(
                    "Conclua e seja aprovado no teste Iniciante antes de acessar o Intermediário."
                );
                return;
            }

            startKnowledgeTest("intermediario");
            return;
        }

        if (level === "perfil") {
            if (
                !hasPassed("iniciante") ||
                !hasPassed("intermediario")
            ) {
                showMessage(
                    "Conclua e seja aprovado nos testes Iniciante e Intermediário antes de realizar o perfil."
                );
                return;
            }

            startProfileTest();
        }
    }

    async function startKnowledgeTest(level) {
        if (state.isStarting || state.isSubmitting) return;

        if (
            level !== "iniciante" &&
            level !== "intermediario"
        ) {
            showMessage("Nível de teste inválido.");
            return;
        }

        state.isStarting = true;

        const startButtons = all(
            ".test-start-button[data-test], .test-start[data-test]"
        );

        startButtons.forEach((button) => {
            button.disabled = true;
        });

        try {
            // O servidor cria ou recupera uma tentativa ativa.
            const data = await postAuthenticated(
                CONFIG.endpoints.start,
                { level }
            );

            if (
                typeof data.attemptId !== "string" ||
                !/^[a-zA-Z0-9]{20}$/.test(data.attemptId)
            ) {
                throw new Error(
                    "O servidor não retornou um identificador de tentativa válido."
                );
            }

            state.currentLevel = level;
            state.questionIndex = 0;
            state.selectedAnswer = null;
            state.answers = [];
            state.attemptId = data.attemptId;
            state.isSubmitting = false;

            setVisible($("testSelection"), false);
            setVisible($("testPanel"), true);
            setVisible($("testResult"), false);
            setVisible($("profileTest"), false);
            setVisible($("profileResult"), false);

            const title = $("currentTestLevel");

            if (title) {
                title.textContent =
                    level === "iniciante"
                        ? "N0 INICIANTE"
                        : "N1 INTERMEDIÁRIO";
            }

            renderQuestion();

            $("testPanel")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {
            console.error("Erro ao iniciar tentativa:", error);

            showMessage(
                error.message ||
                "Não foi possível iniciar o teste. Tente novamente."
            );

        } finally {
            state.isStarting = false;

            startButtons.forEach((button) => {
                // A atualização visual recalcula quais botões
                // devem permanecer disponíveis.
                button.disabled = false;
            });

            updateTestCards();
        }
    }

    function currentQuestions() {
        return state.currentLevel === "iniciante"
            ? beginnerQuestions
            : intermediateQuestions;
    }

    /* =====================================================
       RENDERIZAR QUESTÕES
       ===================================================== */

    function renderQuestion() {
        const questions = currentQuestions();
        const question = questions[state.questionIndex];

        if (!question) return;

        state.selectedAnswer = null;

        const counter = $("questionCounter");
        const progress = $("testProgressBar");
        const questionText = $("questionText");
        const options = $("answerOptions");
        const feedback = $("answerFeedback");
        const nextButton = $("nextQuestion");

        if (counter) {
            counter.textContent =
                `${state.questionIndex + 1} / ${questions.length}`;
        }

        if (progress) {
            progress.style.width =
                `${((state.questionIndex + 1) / questions.length) * 100}%`;
        }

        if (questionText) {
            questionText.textContent = question.question;
        }

        if (feedback) {
            feedback.className = "";
            feedback.textContent = "Selecione uma alternativa.";
            feedback.hidden = false;
        }

        if (nextButton) {
            nextButton.disabled = true;
            nextButton.textContent =
                state.questionIndex === questions.length - 1
                    ? "Finalizar teste"
                    : "Próxima questão →";
        }

        if (!options) return;

        options.innerHTML = question.options
            .map((option, index) => `
                <button
                    type="button"
                    class="answer-option"
                    data-answer="${index}"
                    aria-pressed="false"
                >
                    <span class="answer-letter">
                        ${String.fromCharCode(65 + index)}
                    </span>
                    <span class="answer-text">
                        ${escapeHTML(option)}
                    </span>
                </button>
            `)
            .join("");

        all("#answerOptions .answer-option").forEach((button) => {
            button.addEventListener("click", () => {
                chooseAnswer(Number(button.dataset.answer));
            });
        });
    }

    /* =====================================================
       RESPOSTA — SEM CORREÇÃO NO NAVEGADOR
       ===================================================== */

    function chooseAnswer(answerIndex) {
        if (
            state.selectedAnswer !== null ||
            state.isSubmitting
        ) {
            return;
        }

        const question =
            currentQuestions()[state.questionIndex];

        if (!question) return;

        if (
            !Number.isInteger(answerIndex) ||
            answerIndex < 0 ||
            answerIndex >= question.options.length
        ) {
            return;
        }

        state.selectedAnswer = answerIndex;
        state.answers[state.questionIndex] = answerIndex;

        all("#answerOptions .answer-option").forEach((button) => {
            const index = Number(button.dataset.answer);

            button.disabled = true;

            button.setAttribute(
                "aria-pressed",
                String(index === answerIndex)
            );

            button.classList.toggle(
                "selected",
                index === answerIndex
            );
        });

        const feedback = $("answerFeedback");

        if (feedback) {
            feedback.className = "answer-feedback";
            feedback.textContent =
                "Resposta registrada. Continue para a próxima questão.";
            feedback.hidden = false;
        }

        const nextButton = $("nextQuestion");

        if (nextButton) {
            nextButton.disabled = false;
        }
    }

    function nextQuestion() {
        if (
            state.selectedAnswer === null ||
            state.isSubmitting
        ) {
            return;
        }

        if (
            state.questionIndex >=
            currentQuestions().length - 1
        ) {
            finishKnowledgeTest();
            return;
        }

        state.questionIndex++;
        renderQuestion();
    }

    /* =====================================================
       VALIDAÇÃO OFICIAL NO SERVIDOR
       ===================================================== */

    async function finishKnowledgeTest() {
        if (state.isSubmitting) return;

        const questions = currentQuestions();
        const level = state.currentLevel;

        if (!state.attemptId) {
            showMessage(
                "Esta tentativa não possui uma identificação válida. Volte e inicie o teste novamente."
            );
            return;
        }

        if (
            !Array.isArray(state.answers) ||
            state.answers.length !== questions.length ||
            state.answers.some(
                (answer, index) =>
                    !Number.isInteger(answer) ||
                    answer < 0 ||
                    answer >= questions[index].options.length
            )
        ) {
            showMessage(
                "Responda todas as questões antes de finalizar o teste."
            );
            return;
        }

        state.isSubmitting = true;

        const nextButton = $("nextQuestion");
        const feedback = $("answerFeedback");

        if (nextButton) {
            nextButton.disabled = true;
            nextButton.textContent = "VALIDANDO RESULTADO...";
        }

        if (feedback) {
            feedback.className = "answer-feedback";
            feedback.textContent =
                "Enviando respostas para validação oficial...";
            feedback.hidden = false;
        }

        try {
            const data = await postAuthenticated(
                CONFIG.endpoints.submit,
                {
                    level,
                    answers: state.answers.slice(),
                    attemptId: state.attemptId
                }
            );

            const score = Number(data.score);
            const total = Number(data.total);
            const percentage = Number(data.percentage);

            if (
                !Number.isFinite(score) ||
                !Number.isFinite(total) ||
                !Number.isFinite(percentage) ||
                total !== questions.length ||
                typeof data.passed !== "boolean"
            ) {
                throw new Error(
                    "O servidor retornou um resultado incompleto ou inválido."
                );
            }

            const result = {
                level: data.level,
                score,
                total,
                percentage,
                passed: data.passed,
                date: new Date().toISOString(),
                official: true
            };

            const resultKey =
                level === "iniciante"
                    ? CONFIG.keys.beginnerResult
                    : CONFIG.keys.intermediateResult;

            saveValue(resultKey, JSON.stringify(result));

            // Cache visual atualizado somente com a resposta oficial.
            const passKey =
                level === "iniciante"
                    ? CONFIG.keys.beginner
                    : CONFIG.keys.intermediate;

            saveValue(
                passKey,
                result.passed ? "true" : "false"
            );

            addActivity(
                "teste",
                result.passed
                    ? "Teste aprovado"
                    : "Teste finalizado",
                `${level} — ${result.percentage}%${
                    result.passed ? " — aprovado" : " — não aprovado"
                }`
            );

            // A tentativa já foi consumida pelo servidor.
            state.attemptId = null;

            showKnowledgeResult(result);
            updateTestCards();

        } catch (error) {
            console.error(
                "Erro ao validar o teste:",
                error
            );

            let message =
                error.message ||
                "Não foi possível validar o resultado.";

            if (
                error.code === "expired" ||
                error.code === "attempt-expired" ||
                error.code === "attempt-not-active" ||
                error.code === "already-used"
            ) {
                state.attemptId = null;

                message =
                    "Esta tentativa expirou ou não está mais ativa. Volte à seleção e inicie uma nova tentativa.";
            } else if (
                error.status === 401 ||
                message.includes("Sessão inválida") ||
                message.includes("Autenticação necessária")
            ) {
                message =
                    "Sua sessão expirou. Entre novamente antes de continuar.";
            }

            if (feedback) {
                feedback.className = "answer-feedback warning";
                feedback.textContent = message;
                feedback.hidden = false;
            } else {
                window.alert(message);
            }

            if (nextButton) {
                nextButton.disabled = false;
                nextButton.textContent =
                    state.attemptId
                        ? "Tentar validar novamente"
                        : "Voltar aos testes";
            }

        } finally {
            state.isSubmitting = false;
        }
    }

    /* =====================================================
       EXIBIR RESULTADO
       ===================================================== */

    function showKnowledgeResult(result) {
        setVisible($("testPanel"), false);
        setVisible($("testResult"), true);

        if ($("resultIcon")) {
            $("resultIcon").textContent =
                result.passed ? "✓" : "!";
        }

        if ($("resultTitle")) {
            $("resultTitle").textContent =
                result.passed
                    ? "TESTE CONCLUÍDO"
                    : "REQUISITO NÃO ATINGIDO";
        }

        if ($("resultText")) {
            $("resultText").textContent =
                result.passed
                    ? "Parabéns! Você atingiu a pontuação necessária para este nível."
                    : `Você acertou ${result.score} de ${result.total} questões. É necessário atingir pelo menos ${CONFIG.passingScore}% para desbloquear o próximo nível.`;
        }

        if ($("scoreValue")) {
            $("scoreValue").textContent =
                `${result.percentage}%`;
        }

        const actions = $("resultActions");

        if (actions) {
            actions.innerHTML = `
                <button
                    type="button"
                    class="btn btn-outline"
                    id="resultBackButton"
                >
                    Voltar aos testes
                </button>

                <button
                    type="button"
                    class="btn btn-primary"
                    id="resultRetryButton"
                >
                    Refazer teste
                </button>
            `;

            $("resultBackButton")?.addEventListener(
                "click",
                backToSelection
            );

            $("resultRetryButton")?.addEventListener(
                "click",
                () => {
                    startKnowledgeTest(state.currentLevel);
                }
            );
        }

        $("testResult")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    /* =====================================================
       VOLTAR À SELEÇÃO
       ===================================================== */

    function backToSelection() {
        // Não apaga uma tentativa ativa no servidor.
        // Se o participante voltar e iniciar novamente,
        // start-test poderá recuperar a tentativa pendente.
        setVisible($("testSelection"), true);
        setVisible($("testPanel"), false);
        setVisible($("testResult"), false);
        setVisible($("profileTest"), false);
        setVisible($("profileResult"), false);

        updateTestCards();

        $("testSelection")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    /* =====================================================
       QUESTIONÁRIO DE PERFIL

       ATENÇÃO:
       Este questionário ainda é processado localmente.
       A validação oficial do perfil será implementada
       em endpoint próprio antes da liberação do NEXUS.
       ===================================================== */

    function startProfileTest() {
        state.profileAnswers = [];

        setVisible($("testSelection"), false);
        setVisible($("testPanel"), false);
        setVisible($("testResult"), false);
        setVisible($("profileResult"), false);
        setVisible($("profileTest"), true);

        renderProfileQuestions();

        $("profileTest")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function renderProfileQuestions() {
        const container = $("profileQuestions");

        if (!container) return;

        container.innerHTML = profileQuestions
            .map((question, qIndex) => `
                <article class="profile-question">
                    <div class="profile-question-number">
                        ${String(qIndex + 1).padStart(2, "0")}
                    </div>

                    <h3>
                        ${escapeHTML(question.question)}
                    </h3>

                    <div class="profile-options">
                        ${question.options
                            .map((option, oIndex) => `
                                <label class="profile-option">
                                    <input
                                        type="radio"
                                        name="profileQuestion${qIndex}"
                                        value="${escapeHTML(option.type)}"
                                        data-question="${qIndex}"
                                        data-option="${oIndex}"
                                    >
                                    <span>
                                        ${escapeHTML(option.text)}
                                    </span>
                                </label>
                            `)
                            .join("")}
                    </div>
                </article>
            `)
            .join("");

        all("#profileQuestions input[type='radio']").forEach((input) => {
            input.addEventListener("change", () => {
                state.profileAnswers[
                    Number(input.dataset.question)
                ] = input.value;

                updateProfileFinishButton();
            });
        });

        updateProfileFinishButton();
    }

    function updateProfileFinishButton() {
        const button = $("finishProfile");

        if (!button) return;

        const complete =
            state.profileAnswers.length === profileQuestions.length &&
            profileQuestions.every(
                (_, index) => Boolean(state.profileAnswers[index])
            );

        button.disabled = !complete;
    }

    function finishProfileTest() {
        const complete =
            state.profileAnswers.length === profileQuestions.length &&
            profileQuestions.every(
                (_, index) => Boolean(state.profileAnswers[index])
            );

        if (!complete) {
            showMessage(
                "Responda todas as perguntas antes de finalizar o perfil."
            );
            return;
        }

        const counts = {
            analista: 0,
            executor: 0,
            colaborador: 0,
            especialista: 0
        };

        state.profileAnswers.forEach((answer) => {
            if (
                Object.prototype.hasOwnProperty.call(counts, answer)
            ) {
                counts[answer]++;
            }
        });

        const priority = [
            "analista",
            "executor",
            "colaborador",
            "especialista"
        ];

        let selected = priority[0];

        priority.forEach((type) => {
            if (counts[type] > counts[selected]) {
                selected = type;
            }
        });

        const result = {
            profile: selected,
            answers: state.profileAnswers.slice(),
            date: new Date().toISOString(),
            official: false
        };

        // Cache local provisório. Não representa conclusão
        // oficial para fins de autorização do NEXUS.
        saveValue(
            CONFIG.keys.profileResult,
            JSON.stringify(result)
        );

        saveValue(CONFIG.keys.profile, "true");

        addActivity(
            "perfil",
            "Questionário de perfil concluído",
            `Perfil identificado: ${profileDescriptions[selected].title}`
        );

        showProfileResult(result);
        updateTestCards();
    }

    function showProfileResult(result) {
        const description = profileDescriptions[result.profile];

        if (!description) return;

        setVisible($("profileTest"), false);
        setVisible($("profileResult"), true);

        if ($("profileTitle")) {
            $("profileTitle").textContent = description.title;
        }

        if ($("profileDescription")) {
            $("profileDescription").textContent =
                description.description;
        }

        // Não exibe nem libera a área protegida do NEXUS
        // com base apenas no resultado local.
        setVisible($("secretAccess"), false);

        $("profileResult")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    /* =====================================================
       MENSAGENS E EVENTOS
       ===================================================== */

    function showMessage(message) {
        const feedback = $("answerFeedback");

        if (
            feedback &&
            $("testPanel") &&
            !$("testPanel").hidden
        ) {
            feedback.textContent = message;
            feedback.className = "answer-feedback warning";
            feedback.hidden = false;
        } else {
            window.alert(message);
        }
    }

    function initEvents() {
        all(
            ".test-start-button[data-test], .test-start[data-test]"
        ).forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (button.disabled) return;

                startSelectedTest(button.dataset.test);
            });
        });

        $("backToTests")?.addEventListener("click", (event) => {
            event.preventDefault();
            backToSelection();
        });

        $("nextQuestion")?.addEventListener(
            "click",
            nextQuestion
        );

        $("finishProfile")?.addEventListener(
            "click",
            finishProfileTest
        );

        $("nexusCardButton")?.addEventListener(
            "click",
            (event) => {
                const auth = window.CyberNexisAuth;

                const canAccess = Boolean(
                    auth &&
                    typeof auth.canAccessNexus === "function" &&
                    auth.canAccessNexus() === true
                );

                if (!canAccess) {
                    event.preventDefault();

                    showMessage(
                        "O acesso ao NEXUS ainda não foi confirmado pelo servidor. Conclua os requisitos e aguarde a verificação oficial."
                    );
                }
            }
        );
    }

    /* =====================================================
       INICIALIZAÇÃO E API PÚBLICA
       ===================================================== */

    function init() {
        initEvents();
        updateTestCards();

        if ($("currentYear")) {
            $("currentYear").textContent =
                new Date().getFullYear();
        }
    }

    window.CyberNexisTests = {
        config: CONFIG,
        startTest: startSelectedTest,
        startProfileTest,
        hasPassed,
        hasCompletedProfile,
        updateCards: updateTestCards,

        // Retorna cópias das questões sem gabaritos.
        getBeginnerQuestions: () =>
            beginnerQuestions.map((question) => ({
                question: question.question,
                options: question.options.slice(),
                explanation: question.explanation
            })),

        getIntermediateQuestions: () =>
            intermediateQuestions.map((question) => ({
                question: question.question,
                options: question.options.slice(),
                explanation: question.explanation
            })),

        getProfileQuestions: () =>
            profileQuestions.map((question) => ({
                question: question.question,
                options: question.options.map((option) => ({
                    text: option.text,
                    type: option.type
                }))
            })),

        getState: () => ({
            currentLevel: state.currentLevel,
            questionIndex: state.questionIndex,
            selectedAnswer: state.selectedAnswer,
            answers: state.answers.slice(),
            attemptId: state.attemptId,
            isStarting: state.isStarting,
            isSubmitting: state.isSubmitting,
            profileAnswers: state.profileAnswers.slice()
        })
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }
})();
