/* =========================================================
   CYBER NEXIS
   js/tests.js
   Sistema de testes e perfil de habilidades
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const TEST_CONFIG = {
    passingScore: 70,

    beginnerKey:
        "cyberNexis_iniciante_passed",

    intermediateKey:
        "cyberNexis_intermediario_passed",

    profileKey:
        "cyberNexis_profile_completed",

    beginnerResultKey:
        "cyberNexis_iniciante_result",

    intermediateResultKey:
        "cyberNexis_intermediario_result",

    profileResultKey:
        "cyberNexis_profile_result"
};


/* =========================================================
   QUESTÕES — N0 INICIANTE
   ========================================================= */

const beginnerQuestions = [
    {
        question:
            "Qual é a principal função de um firewall?",

        options: [
            "Aumentar a velocidade da internet",
            "Controlar e filtrar tráfego de rede",
            "Criar senhas automaticamente",
            "Armazenar arquivos pessoais"
        ],

        answer: 1,

        explanation:
            "Um firewall controla o tráfego de rede de acordo com regras definidas."
    },

    {
        question:
            "O que o HTTPS ajuda a proteger?",

        options: [
            "Apenas o tamanho das páginas",
            "A comunicação entre cliente e servidor",
            "A velocidade do processador",
            "A memória física do computador"
        ],

        answer: 1,

        explanation:
            "HTTPS utiliza TLS para proteger a comunicação entre o navegador e o servidor."
    },

    {
        question:
            "Qual destas opções representa uma boa prática para senhas?",

        options: [
            "Usar a mesma senha em todos os serviços",
            "Usar informações públicas como senha",
            "Utilizar senhas longas e únicas",
            "Compartilhar a senha com colegas"
        ],

        answer: 2,

        explanation:
            "Senhas longas e únicas reduzem o impacto de vazamentos e reutilização de credenciais."
    },

    {
        question:
            "No Linux, qual comando normalmente lista arquivos de um diretório?",

        options: [
            "ls",
            "scan",
            "open",
            "list-network"
        ],

        answer: 0,

        explanation:
            "O comando ls é utilizado para listar arquivos e diretórios."
    },

    {
        question:
            "Qual mecanismo adiciona uma camada extra além da senha?",

        options: [
            "MFA",
            "HTTP",
            "DNS",
            "HTML"
        ],

        answer: 0,

        explanation:
            "MFA significa autenticação multifator e utiliza mais de um fator de autenticação."
    },

    {
        question:
            "Qual situação pode indicar uma tentativa de phishing?",

        options: [
            "Uma mensagem solicitando senha por meio de um link suspeito",
            "Uma atualização oficial do sistema",
            "Uma página local de documentação",
            "Um arquivo criado pelo próprio usuário"
        ],

        answer: 0,

        explanation:
            "Phishing frequentemente utiliza mensagens enganosas para induzir a vítima a fornecer informações."
    },

    {
        question:
            "O princípio do menor privilégio significa:",

        options: [
            "Dar acesso administrativo para todos",
            "Dar somente os privilégios necessários",
            "Remover todos os controles de acesso",
            "Compartilhar uma única conta"
        ],

        answer: 1,

        explanation:
            "O menor privilégio limita o acesso ao mínimo necessário para executar determinada função."
    },

    {
        question:
            "Antes de realizar um teste de segurança em um sistema, o que deve existir?",

        options: [
            "Apenas conhecimento técnico",
            "Autorização e escopo definidos",
            "Uma conta administrativa obtida sem permissão",
            "Um programa para apagar logs"
        ],

        answer: 1,

        explanation:
            "Testes legítimos precisam de autorização e de um escopo claramente definido."
    }
];


/* =========================================================
   QUESTÕES — N1 INTERMEDIÁRIO
   ========================================================= */

const intermediateQuestions = [
    {
        question:
            "Em segurança de aplicações, SQL Injection está relacionado principalmente a:",

        options: [
            "Falhas de validação e construção insegura de consultas",
            "Problemas físicos no teclado",
            "Falhas no monitor",
            "Configuração do brilho da tela"
        ],

        answer: 0,

        explanation:
            "SQL Injection pode ocorrer quando entradas controladas pelo usuário são incorporadas de forma insegura em consultas SQL."
    },

    {
        question:
            "Qual prática ajuda a reduzir SQL Injection?",

        options: [
            "Usar consultas parametrizadas",
            "Exibir mensagens detalhadas de erro para todos",
            "Concatenar todas as entradas diretamente",
            "Desativar autenticação"
        ],

        answer: 0,

        explanation:
            "Consultas parametrizadas separam os dados fornecidos pelo usuário da estrutura da consulta."
    },

    {
        question:
            "Por que logs são importantes para segurança?",

        options: [
            "Porque substituem todos os controles de segurança",
            "Porque ajudam na investigação e detecção de eventos",
            "Porque tornam qualquer sistema invulnerável",
            "Porque eliminam a necessidade de backups"
        ],

        answer: 1,

        explanation:
            "Logs podem ajudar a detectar eventos e reconstruir acontecimentos durante uma investigação."
    },

    {
        question:
            "O que significa defesa em profundidade?",

        options: [
            "Usar apenas uma ferramenta de segurança",
            "Utilizar várias camadas complementares de proteção",
            "Remover controles para facilitar manutenção",
            "Concentrar toda segurança em uma única senha"
        ],

        answer: 1,

        explanation:
            "Defesa em profundidade combina diferentes controles para evitar depender de uma única barreira."
    },

    {
        question:
            "Qual medida pode ajudar contra tentativas automatizadas de login?",

        options: [
            "Rate limiting e mecanismos de bloqueio apropriados",
            "Remover limites de tentativa",
            "Usar uma senha padrão para todos",
            "Desativar registros de autenticação"
        ],

        answer: 0,

        explanation:
            "Limitação de tentativas e controles contra automação podem reduzir ataques de força bruta."
    },

    {
        question:
            "Como senhas devem ser armazenadas em uma aplicação real?",

        options: [
            "Em texto puro",
            "Em arquivos públicos",
            "Com um mecanismo adequado de hashing de senha",
            "Dentro do HTML"
        ],

        answer: 2,

        explanation:
            "Aplicações reais devem usar mecanismos apropriados de hashing de senhas, com salt e parâmetros adequados."
    },

    {
        question:
            "Durante um teste autorizado, o escopo serve para:",

        options: [
            "Definir quais sistemas e ações estão autorizados",
            "Permitir qualquer ação no ambiente",
            "Eliminar a necessidade de autorização",
            "Esconder o teste do responsável"
        ],

        answer: 0,

        explanation:
            "O escopo estabelece os limites do trabalho autorizado."
    },

    {
        question:
            "XSS normalmente envolve:",

        options: [
            "Execução de conteúdo controlado por atacante no contexto de uma aplicação",
            "Falha elétrica no servidor",
            "Problemas no cabo de rede",
            "Erro de temperatura do processador"
        ],

        answer: 0,

        explanation:
            "Cross-Site Scripting (XSS) envolve a execução de conteúdo/script não confiável no contexto da aplicação."
    },

    {
        question:
            "Por que atualizações de segurança são importantes?",

        options: [
            "Porque podem corrigir vulnerabilidades conhecidas",
            "Porque eliminam todos os riscos automaticamente",
            "Porque substituem backups",
            "Porque tornam senhas desnecessárias"
        ],

        answer: 0,

        explanation:
            "Atualizações podem corrigir vulnerabilidades conhecidas e outros problemas de segurança."
    },

    {
        question:
            "Ao encontrar uma vulnerabilidade em um sistema de terceiros sem autorização, uma conduta responsável é:",

        options: [
            "Explorar até obter dados",
            "Publicar dados privados",
            "Respeitar limites legais e buscar um canal responsável",
            "Vender as informações"
        ],

        answer: 2,

        explanation:
            "A atuação responsável respeita autorização, privacidade, legislação e processos adequados de divulgação."
    }
];


/* =========================================================
   QUESTÕES — N2 PERFIL
   ========================================================= */

const profileQuestions = [
    {
        question:
            "Quando você encontra um problema de segurança em um laboratório autorizado, qual atividade mais combina com você?",

        options: [
            {
                text: "Investigar evidências e entender a causa",
                type: "analista"
            },
            {
                text: "Testar hipóteses dentro do escopo permitido",
                type: "executor"
            },
            {
                text: "Documentar e comunicar o que foi encontrado",
                type: "colaborador"
            },
            {
                text: "Estudar profundamente a tecnologia envolvida",
                type: "especialista"
            }
        ]
    },

    {
        question:
            "Qual atividade desperta mais interesse?",

        options: [
            {
                text: "Análise de logs e eventos",
                type: "analista"
            },
            {
                text: "Laboratórios e desafios técnicos",
                type: "executor"
            },
            {
                text: "Relatórios e trabalho em equipe",
                type: "colaborador"
            },
            {
                text: "Arquitetura e fundamentos avançados",
                type: "especialista"
            }
        ]
    },

    {
        question:
            "Como você prefere aprender?",

        options: [
            {
                text: "Observando evidências e comparando informações",
                type: "analista"
            },
            {
                text: "Colocando a mão na massa em ambientes controlados",
                type: "executor"
            },
            {
                text: "Trocando conhecimento com outras pessoas",
                type: "colaborador"
            },
            {
                text: "Estudando documentação e conceitos profundamente",
                type: "especialista"
            }
        ]
    },

    {
        question:
            "Em um projeto de segurança, qual função mais combina com seu perfil?",

        options: [
            {
                text: "Identificar padrões e anomalias",
                type: "analista"
            },
            {
                text: "Executar testes definidos no escopo",
                type: "executor"
            },
            {
                text: "Coordenar informações e documentação",
                type: "colaborador"
            },
            {
                text: "Aprofundar conhecimentos técnicos específicos",
                type: "especialista"
            }
        ]
    },

    {
        question:
            "Qual resultado mais satisfaria você depois de um laboratório?",

        options: [
            {
                text: "Entender exatamente o que aconteceu",
                type: "analista"
            },
            {
                text: "Conseguir reproduzir o cenário autorizado",
                type: "executor"
            },
            {
                text: "Conseguir explicar o resultado para a equipe",
                type: "colaborador"
            },
            {
                text: "Aprender uma técnica ou conceito novo",
                type: "especialista"
            }
        ]
    }
];


/* =========================================================
   DESCRIÇÕES DOS PERFIS
   ========================================================= */

const profileDescriptions = {
    analista: {
        title: "ANALISTA",
        description:
            "Perfil voltado para investigação, interpretação de evidências, identificação de padrões e compreensão de eventos de segurança."
    },

    executor: {
        title: "EXECUTOR",
        description:
            "Perfil voltado para prática técnica, laboratórios controlados e execução de testes dentro de escopos autorizados."
    },

    colaborador: {
        title: "COLABORADOR",
        description:
            "Perfil voltado para comunicação, documentação, organização e colaboração em atividades de segurança."
    },

    especialista: {
        title: "ESPECIALISTA",
        description:
            "Perfil voltado para aprofundamento técnico, estudo de fundamentos e especialização em áreas específicas."
    }
};


/* =========================================================
   ESTADO DO TESTE
   ========================================================= */

const testState = {
    currentTest: null,
    currentQuestion: 0,
    currentScore: 0,
    selectedAnswer: null,

    profileAnswers: [],

    lockedMessage: ""
};


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function testGetElement(id) {
    return document.getElementById(id);
}

function testGetElements(selector) {
    return Array.from(
        document.querySelectorAll(selector)
    );
}

function testStorageBoolean(key) {
    return (
        localStorage.getItem(key) === "true"
    );
}

function testHasPassed(level) {
    if (level === "iniciante") {
        return testStorageBoolean(
            TEST_CONFIG.beginnerKey
        );
    }

    if (level === "intermediario") {
        return testStorageBoolean(
            TEST_CONFIG.intermediateKey
        );
    }

    return false;
}

function testHasCompletedProfile() {
    return testStorageBoolean(
        TEST_CONFIG.profileKey
    );
}

function testEscapeHTML(value) {
    if (
        window.CyberNexis &&
        typeof window.CyberNexis.escapeHTML === "function"
    ) {
        return window.CyberNexis.escapeHTML(
            value
        );
    }

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   ATIVIDADES
   ========================================================= */

function testAddActivity(
    type,
    title,
    description
) {
    if (
        window.CyberNexisAuth &&
        typeof window.CyberNexisAuth.addActivity === "function"
    ) {
        window.CyberNexisAuth.addActivity(
            type,
            title,
            description
        );
    }
}


/* =========================================================
   SALVAMENTO DOS RESULTADOS
   ========================================================= */

function saveTestResult(
    level,
    score,
    total,
    passed
) {
    const percentage =
        total > 0
            ? Math.round(
                (score / total) * 100
            )
            : 0;

    const result = {
        level,
        score,
        total,
        percentage,
        passed,
        date:
            new Date().toISOString()
    };

    const key =
        level === "iniciante"
            ? TEST_CONFIG.beginnerResultKey
            : TEST_CONFIG.intermediateResultKey;

    localStorage.setItem(
        key,
        JSON.stringify(result)
    );

    if (passed) {
        const flag =
            level === "iniciante"
                ? TEST_CONFIG.beginnerKey
                : TEST_CONFIG.intermediateKey;

        localStorage.setItem(
            flag,
            "true"
        );
    }

    return result;
}

function saveProfileResult(
    profile,
    answers
) {
    const result = {
        profile,
        answers,
        date:
            new Date().toISOString()
    };

    localStorage.setItem(
        TEST_CONFIG.profileResultKey,
        JSON.stringify(result)
    );

    localStorage.setItem(
        TEST_CONFIG.profileKey,
        "true"
    );

    return result;
}


/* =========================================================
   ESTADO DOS CARDS
   ========================================================= */

function updateTestCards() {
    const beginnerPassed =
        testHasPassed(
            "iniciante"
        );

    const intermediatePassed =
        testHasPassed(
            "intermediario"
        );

    const profileCompleted =
        testHasCompletedProfile();

    testGetElements(
        "[data-test]"
    ).forEach((card) => {
        const level =
            card.dataset.test;

        if (
            level !== "iniciante" &&
            level !== "intermediario" &&
            level !== "perfil"
        ) {
            return;
        }

        const startButton =
            card.querySelector(
                ".test-start"
            );

        let unlocked = false;
        let completed = false;

        if (level === "iniciante") {
            unlocked = true;
            completed = beginnerPassed;
        }

        if (level === "intermediario") {
            unlocked = beginnerPassed;
            completed = intermediatePassed;
        }

        if (level === "perfil") {
            unlocked =
                beginnerPassed &&
                intermediatePassed;

            completed =
                profileCompleted;
        }

        card.classList.toggle(
            "locked",
            !unlocked
        );

        card.classList.toggle(
            "completed",
            completed
        );

        if (startButton) {
            startButton.disabled =
                !unlocked;

            startButton.classList.toggle(
                "disabled",
                !unlocked
            );

            if (completed) {
                startButton.textContent =
                    "REFAZER TESTE";
            } else if (!unlocked) {
                startButton.textContent =
                    "BLOQUEADO";
            } else {
                startButton.textContent =
                    "INICIAR TESTE";
            }
        }

        const status =
            card.querySelector(
                ".test-status"
            );

        if (status) {
            if (completed) {
                status.textContent =
                    "CONCLUÍDO";
            } else if (!unlocked) {
                status.textContent =
                    "BLOQUEADO";
            } else {
                status.textContent =
                    "DISPONÍVEL";
            }
        }
    });

    updateNexusCard();
}


/* =========================================================
   CARD NEXUS
   ========================================================= */

function updateNexusCard() {
    const button =
        testGetElement(
            "nexusCardButton"
        );

    const card =
        document.querySelector(
            "[data-test='nexus']"
        );

    if (!button && !card) {
        return;
    }

    const unlocked =
        Boolean(
            window.CyberNexisAuth &&
            typeof window.CyberNexisAuth.canAccessNexus === "function" &&
            window.CyberNexisAuth.canAccessNexus()
        );

    if (card) {
        card.classList.toggle(
            "locked",
            !unlocked
        );

        card.classList.toggle(
            "unlocked",
            unlocked
        );
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

        button.textContent =
            unlocked
                ? "ACESSAR NEXUS"
                : "REQUISITOS PENDENTES";
    }
}


/* =========================================================
   INICIAR TESTE
   ========================================================= */

function startSelectedTest(level) {
    if (level === "iniciante") {
        startTest(
            "iniciante",
            beginnerQuestions
        );

        return;
    }

    if (level === "intermediario") {
        if (
            !testHasPassed(
                "iniciante"
            )
        ) {
            showTestMessage(
                "Conclua o teste N0 INICIANTE antes de acessar o N1."
            );

            return;
        }

        startTest(
            "intermediario",
            intermediateQuestions
        );

        return;
    }

    if (level === "perfil") {
        if (
            !testHasPassed(
                "iniciante"
            ) ||
            !testHasPassed(
                "intermediario"
            )
        ) {
            showTestMessage(
                "Conclua os testes N0 e N1 antes de realizar o perfil."
            );

            return;
        }

        startProfileTest();

        return;
    }
}


/* =========================================================
   INICIAR TESTE DE CONHECIMENTO
   ========================================================= */

function startTest(
    level,
    questions
) {
    if (
        !Array.isArray(questions) ||
        !questions.length
    ) {
        return;
    }

    testState.currentTest =
        level;

    testState.currentQuestion =
        0;

    testState.currentScore =
        0;

    testState.selectedAnswer =
        null;

    const selection =
        testGetElement(
            "testSelection"
        );

    const panel =
        testGetElement(
            "testPanel"
        );

    const result =
        testGetElement(
            "testResult"
        );

    const profile =
        testGetElement(
            "profileTest"
        );

    const profileResult =
        testGetElement(
            "profileResult"
        );

    if (selection) {
        selection.hidden = true;
    }

    if (result) {
        result.hidden = true;
    }

    if (profile) {
        profile.hidden = true;
    }

    if (profileResult) {
        profileResult.hidden = true;
    }

    if (panel) {
        panel.hidden = false;
    }

    const title =
        testGetElement(
            "currentTestLevel"
        );

    if (title) {
        title.textContent =
            level === "iniciante"
                ? "N0 INICIANTE"
                : "N1 INTERMEDIÁRIO";
    }

    renderQuestion();
}


/* =========================================================
   RENDERIZAÇÃO DA QUESTÃO
   ========================================================= */

function renderQuestion() {
    const questions =
        testState.currentTest === "iniciante"
            ? beginnerQuestions
            : intermediateQuestions;

    const question =
        questions[
            testState.currentQuestion
        ];

    if (!question) {
        return;
    }

    testState.selectedAnswer =
        null;

    const counter =
        testGetElement(
            "questionCounter"
        );

    const progress =
        testGetElement(
            "testProgressBar"
        );

    const text =
        testGetElement(
            "questionText"
        );

    const options =
        testGetElement(
            "answerOptions"
        );

    const feedback =
        testGetElement(
            "answerFeedback"
        );

    const nextButton =
        testGetElement(
            "nextQuestion"
        );

    const total =
        questions.length;

    const current =
        testState.currentQuestion + 1;

    if (counter) {
        counter.textContent =
            `${current} / ${total}`;
    }

    if (progress) {
        progress.style.width =
            `${(current / total) * 100}%`;
    }

    if (text) {
        text.textContent =
            question.question;
    }

    if (feedback) {
        feedback.innerHTML = "";
        feedback.hidden = true;
        feedback.className =
            "answer-feedback";
    }

    if (nextButton) {
        nextButton.disabled = true;
        nextButton.hidden = false;
        nextButton.textContent =
            current === total
                ? "FINALIZAR TESTE"
                : "PRÓXIMA QUESTÃO";
    }

    if (!options) {
        return;
    }

    options.innerHTML =
        question.options
            .map(
                (option, index) => `
                    <button
                        type="button"
                        class="answer-option"
                        data-answer="${index}"
                    >
                        <span class="answer-letter">
                            ${String.fromCharCode(
                                65 + index
                            )}
                        </span>

                        <span class="answer-text">
                            ${testEscapeHTML(option)}
                        </span>
                    </button>
                `
            )
            .join("");

    testGetElements(
        "#answerOptions .answer-option"
    ).forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                const answer =
                    Number(
                        button.dataset.answer
                    );

                selectAnswer(answer);
            }
        );
    });
}


/* =========================================================
   SELECIONAR RESPOSTA
   ========================================================= */

function selectAnswer(answerIndex) {
    if (
        testState.selectedAnswer !== null
    ) {
        return;
    }

    const questions =
        testState.currentTest === "iniciante"
            ? beginnerQuestions
            : intermediateQuestions;

    const question =
        questions[
            testState.currentQuestion
        ];

    if (!question) {
        return;
    }

    testState.selectedAnswer =
        answerIndex;

    const buttons =
        testGetElements(
            "#answerOptions .answer-option"
        );

    buttons.forEach((button) => {
        const index =
            Number(
                button.dataset.answer
            );

        button.classList.toggle(
            "selected",
            index === answerIndex
        );

        button.disabled = true;

        if (index === question.answer) {
            button.classList.add(
                "correct"
            );
        }

        if (
            index === answerIndex &&
            index !== question.answer
        ) {
            button.classList.add(
                "incorrect"
            );
        }
    });

    if (
        answerIndex ===
        question.answer
    ) {
        testState.currentScore++;
    }

    showAnswerFeedback(
        answerIndex === question.answer,
        question.explanation
    );

    const nextButton =
        testGetElement(
            "nextQuestion"
        );

    if (nextButton) {
        nextButton.disabled = false;
    }
}


/* =========================================================
   FEEDBACK
   ========================================================= */

function showAnswerFeedback(
    correct,
    explanation
) {
    const feedback =
        testGetElement(
            "answerFeedback"
        );

    if (!feedback) {
        return;
    }

    feedback.hidden = false;

    feedback.className =
        `answer-feedback ${
            correct
                ? "correct"
                : "incorrect"
        }`;

    feedback.innerHTML = `
        <strong>
            ${
                correct
                    ? "RESPOSTA CORRETA"
                    : "RESPOSTA INCORRETA"
            }
        </strong>

        <p>
            ${testEscapeHTML(
                explanation
            )}
        </p>
    `;
}


/* =========================================================
   PRÓXIMA QUESTÃO
   ========================================================= */

function nextQuestion() {
    if (
        testState.selectedAnswer === null
    ) {
        return;
    }

    const questions =
        testState.currentTest === "iniciante"
            ? beginnerQuestions
            : intermediateQuestions;

    const isLast =
        testState.currentQuestion >=
        questions.length - 1;

    if (isLast) {
        finishTest();
        return;
    }

    testState.currentQuestion++;

    renderQuestion();
}


/* =========================================================
   FINALIZAR TESTE
   ========================================================= */

function finishTest() {
    const questions =
        testState.currentTest === "iniciante"
            ? beginnerQuestions
            : intermediateQuestions;

    const score =
        testState.currentScore;

    const total =
        questions.length;

    const percentage =
        Math.round(
            (score / total) * 100
        );

    const passed =
        percentage >=
        TEST_CONFIG.passingScore;

    const result =
        saveTestResult(
            testState.currentTest,
            score,
            total,
            passed
        );

    testAddActivity(
        "teste",
        passed
            ? "Teste concluído"
            : "Teste finalizado",
        `${
            testState.currentTest === "iniciante"
                ? "N0 INICIANTE"
                : "N1 INTERMEDIÁRIO"
        } — ${percentage}% ${
            passed
                ? "• aprovado"
                : "• não aprovado"
        }.`
    );

    showTestResult(result);

    updateTestCards();

    if (
        window.CyberNexisAuth
    ) {
        window.CyberNexisAuth.updateProgressBars?.();
        window.CyberNexisAuth.updateAchievements?.();
        window.CyberNexisAuth.updateNexusAccess?.();
    }
}


/* =========================================================
   RESULTADO DO TESTE
   ========================================================= */

function showTestResult(result) {
    const panel =
        testGetElement(
            "testPanel"
        );

    const resultSection =
        testGetElement(
            "testResult"
        );

    const icon =
        testGetElement(
            "resultIcon"
        );

    const title =
        testGetElement(
            "resultTitle"
        );

    const text =
        testGetElement(
            "resultText"
        );

    const score =
        testGetElement(
            "scoreValue"
        );

    if (panel) {
        panel.hidden = true;
    }

    if (resultSection) {
        resultSection.hidden = false;
    }

    if (icon) {
        icon.textContent =
            result.passed
                ? "✓"
                : "!";
    }

    if (title) {
        title.textContent =
            result.passed
                ? "TESTE CONCLUÍDO"
                : "REQUISITO NÃO ATINGIDO";
    }

    if (score) {
        score.textContent =
            `${result.percentage}%`;
    }

    if (text) {
        text.textContent =
            result.passed
                ? "Parabéns. O requisito deste nível foi concluído."
                : `Você precisa atingir pelo menos ${TEST_CONFIG.passingScore}% para desbloquear o próximo nível.`;
    }

    const actions =
        testGetElement(
            "resultActions"
        );

    if (actions) {
        actions.innerHTML = `
            <button
                type="button"
                class="btn"
                id="resultBackButton"
            >
                VOLTAR AOS TESTES
            </button>

            <button
                type="button"
                class="btn btn-primary"
                id="resultRetryButton"
            >
                REFAZER
            </button>
        `;

        testGetElement(
            "resultBackButton"
        )?.addEventListener(
            "click",
            backToSelection
        );

        testGetElement(
            "resultRetryButton"
        )?.addEventListener(
            "click",
            () => {
                startSelectedTest(
                    testState.currentTest
                );
            }
        );
    }
}


/* =========================================================
   VOLTAR PARA SELEÇÃO
   ========================================================= */

function backToSelection() {
    const selection =
        testGetElement(
            "testSelection"
        );

    const panel =
        testGetElement(
            "testPanel"
        );

    const result =
        testGetElement(
            "testResult"
        );

    const profile =
        testGetElement(
            "profileTest"
        );

    const profileResult =
        testGetElement(
            "profileResult"
        );

    if (selection) {
        selection.hidden = false;
    }

    if (panel) {
        panel.hidden = true;
    }

    if (result) {
        result.hidden = true;
    }

    if (profile) {
        profile.hidden = true;
    }

    if (profileResult) {
        profileResult.hidden = true;
    }

    updateTestCards();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   PERFIL DE HABILIDADES
   ========================================================= */

function startProfileTest() {
    testState.profileAnswers = [];

    const selection =
        testGetElement(
            "testSelection"
        );

    const profile =
        testGetElement(
            "profileTest"
        );

    const result =
        testGetElement(
            "testResult"
        );

    const profileResult =
        testGetElement(
            "profileResult"
        );

    if (selection) {
        selection.hidden = true;
    }

    if (result) {
        result.hidden = true;
    }

    if (profileResult) {
        profileResult.hidden = true;
    }

    if (profile) {
        profile.hidden = false;
    }

    renderProfileQuestions();
}


/* =========================================================
   RENDERIZAR PERFIL
   ========================================================= */

function renderProfileQuestions() {
    const container =
        testGetElement(
            "profileQuestions"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        profileQuestions
            .map(
                (question, questionIndex) => `
                    <article class="profile-question">
                        <div class="profile-question-number">
                            ${String(
                                questionIndex + 1
                            ).padStart(2, "0")}
                        </div>

                        <h3>
                            ${testEscapeHTML(
                                question.question
                            )}
                        </h3>

                        <div class="profile-options">
                            ${question.options
                                .map(
                                    (option, optionIndex) => `
                                        <label class="profile-option">
                                            <input
                                                type="radio"
                                                name="profileQuestion${questionIndex}"
                                                value="${testEscapeHTML(
                                                    option.type
                                                )}"
                                                data-question="${questionIndex}"
                                                data-option="${optionIndex}"
                                            >

                                            <span>
                                                ${testEscapeHTML(
                                                    option.text
                                                )}
                                            </span>
                                        </label>
                                    `
                                )
                                .join("")}
                        </div>
                    </article>
                `
            )
            .join("");

    testGetElements(
        "#profileQuestions input[type='radio']"
    ).forEach((input) => {
        input.addEventListener(
            "change",
            () => {
                const question =
                    Number(
                        input.dataset.question
                    );

                const type =
                    input.value;

                testState.profileAnswers[
                    question
                ] = type;

                updateProfileFinishButton();
            }
        );
    });

    updateProfileFinishButton();
}


/* =========================================================
   BOTÃO FINALIZAR PERFIL
   ========================================================= */

function updateProfileFinishButton() {
    const button =
        testGetElement(
            "finishProfile"
        );

    if (!button) {
        return;
    }

    const completed =
        testState.profileAnswers.length ===
        profileQuestions.length &&
        testState.profileAnswers.every(
            Boolean
        );

    button.disabled =
        !completed;
}


/* =========================================================
   FINALIZAR PERFIL
   ========================================================= */

function finishProfileTest() {
    const answers =
        testState.profileAnswers;

    if (
        answers.length !==
        profileQuestions.length ||
        !answers.every(Boolean)
    ) {
        return;
    }

    const counts = {
        analista: 0,
        executor: 0,
        colaborador: 0,
        especialista: 0
    };

    answers.forEach((answer) => {
        if (
            Object.prototype.hasOwnProperty.call(
                counts,
                answer
            )
        ) {
            counts[answer]++;
        }
    });

    /*
     * Em caso de empate, a ordem de desempate
     * segue a sequência abaixo.
     */
    const priority = [
        "analista",
        "executor",
        "colaborador",
        "especialista"
    ];

    let selectedProfile =
        priority[0];

    priority.forEach((profile) => {
        if (
            counts[profile] >
            counts[selectedProfile]
        ) {
            selectedProfile =
                profile;
        }
    });

    const result =
        saveProfileResult(
            selectedProfile,
            answers
        );

    testAddActivity(
        "perfil",
        "Perfil de habilidades concluído",
        `Perfil identificado: ${profileDescriptions[selectedProfile].title}.`
    );

    showProfileResult(result);

    updateTestCards();

    if (
        window.CyberNexisAuth
    ) {
        window.CyberNexisAuth.updateProfilePage?.();
        window.CyberNexisAuth.updateProgressBars?.();
        window.CyberNexisAuth.updateAchievements?.();
        window.CyberNexisAuth.updateNexusAccess?.();
    }
}


/* =========================================================
   RESULTADO DO PERFIL
   ========================================================= */

function showProfileResult(result) {
    const profile =
        profileDescriptions[
            result.profile
        ];

    const profileSection =
        testGetElement(
            "profileTest"
        );

    const resultSection =
        testGetElement(
            "profileResult"
        );

    const title =
        testGetElement(
            "profileTitle"
        );

    const description =
        testGetElement(
            "profileDescription"
        );

    const secretAccess =
        testGetElement(
            "secretAccess"
        );

    if (profileSection) {
        profileSection.hidden = true;
    }

    if (resultSection) {
        resultSection.hidden = false;
    }

    if (title) {
        title.textContent =
            profile.title;
    }

    if (description) {
        description.textContent =
            profile.description;
    }

    if (secretAccess) {
        secretAccess.hidden = false;

        secretAccess.innerHTML = `
            <div class="secret-access-content">
                <span class="secret-access-label">
                    NEXUS
                </span>

                <strong>
                    ACESSO DESBLOQUEADO
                </strong>

                <p>
                    Todos os requisitos educacionais foram concluídos.
                </p>

                <a
                    href="nexus.html"
                    class="btn btn-primary"
                >
                    ACESSAR NEXUS
                </a>
            </div>
        `;
    }
}


/* =========================================================
   MENSAGEM DE TESTE
   ========================================================= */

function showTestMessage(message) {
    /*
     * Primeiro tenta usar uma área específica.
     */
    let target =
        testGetElement(
            "testSystemMessage"
        );

    /*
     * Compatibilidade com a estrutura atual.
     */
    if (!target) {
        target =
            testGetElement(
                "answerFeedback"
            );
    }

    if (!target) {
        window.alert(message);
        return;
    }

    target.hidden = false;

    target.className =
        "answer-feedback warning";

    target.textContent =
        message;
}


/* =========================================================
   NEXUS — BOTÃO
   ========================================================= */

function initNexusTestButton() {
    const button =
        testGetElement(
            "nexusCardButton"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        (event) => {
            event.preventDefault();

            const canAccess =
                Boolean(
                    window.CyberNexisAuth &&
                    typeof window.CyberNexisAuth.canAccessNexus === "function" &&
                    window.CyberNexisAuth.canAccessNexus()
                );

            if (!canAccess) {
                showTestMessage(
                    "O NEXUS exige login e a conclusão dos três requisitos educacionais."
                );

                return;
            }

            window.location.href =
                "nexus.html";
        }
    );
}


/* =========================================================
   MENSAGEM DE ACESSO AO PERFIL
   ========================================================= */

function updateProfileAccessMessage() {
    const element =
        testGetElement(
            "profileAccessMessage"
        );

    if (!element) {
        return;
    }

    const beginner =
        testHasPassed(
            "iniciante"
        );

    const intermediate =
        testHasPassed(
            "intermediario"
        );

    if (!beginner) {
        element.textContent =
            "Conclua o N0 INICIANTE para continuar.";

        return;
    }

    if (!intermediate) {
        element.textContent =
            "Conclua o N1 INTERMEDIÁRIO para continuar.";

        return;
    }

    element.textContent =
        "Requisito atendido. Seu perfil está disponível.";
}


/* =========================================================
   EVENTOS DOS CARDS
   ========================================================= */

function initTestCards() {
    testGetElements(
        "[data-test]"
    ).forEach((card) => {
        const level =
            card.dataset.test;

        if (
            level === "nexus"
        ) {
            return;
        }

        const button =
            card.querySelector(
                ".test-start"
            );

        if (button) {
            button.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    startSelectedTest(
                        level
                    );
                }
            );
        }

        /*
         * Permite clicar no próprio card.
         */
        card.addEventListener(
            "click",
            (event) => {
                if (
                    event.target.closest(
                        "a, button, input, label"
                    )
                ) {
                    return;
                }

                startSelectedTest(
                    level
                );
            }
        );
    });
}


/* =========================================================
   BOTÃO VOLTAR
   ========================================================= */

function initBackButton() {
    const button =
        testGetElement(
            "backToTests"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        (event) => {
            event.preventDefault();

            backToSelection();
        }
    );
}


/* =========================================================
   BOTÃO PRÓXIMA QUESTÃO
   ========================================================= */

function initNextButton() {
    const button =
        testGetElement(
            "nextQuestion"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {
            nextQuestion();
        }
    );
}


/* =========================================================
   BOTÃO FINALIZAR PERFIL
   ========================================================= */

function initProfileFinishButton() {
    const button =
        testGetElement(
            "finishProfile"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {
            finishProfileTest();
        }
    );
}


/* =========================================================
   SISTEMA DE TESTES
   ========================================================= */

function initTestSystem() {
    /*
     * Só inicializa os componentes encontrados.
     * Isso permite que tests.js seja carregado em outras
     * páginas sem causar erros.
     */
    initTestCards();
    initBackButton();
    initNextButton();
    initProfileFinishButton();
    initNexusTestButton();

    updateTestCards();
    updateProfileAccessMessage();
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initTestSystem,
        {
            once: true
        }
    );
} else {
    initTestSystem();
}


/* =========================================================
   API PÚBLICA
   ========================================================= */

window.CyberNexisTests = {
    config:
        TEST_CONFIG,

    startTest:
        startSelectedTest,

    startProfileTest,

    getBeginnerQuestions:
        () => beginnerQuestions,

    getIntermediateQuestions:
        () => intermediateQuestions,

    getProfileQuestions:
        () => profileQuestions,

    updateCards:
        updateTestCards,

    hasPassed:
        testHasPassed,

    hasCompletedProfile:
        testHasCompletedProfile,

    getState:
        () => ({
            ...testState
        })
};