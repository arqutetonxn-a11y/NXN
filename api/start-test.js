
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import {
    getFirestore,
    FieldValue
} from "firebase-admin/firestore";

// =====================================================
// CYBER NEXIS — VALIDAÇÃO SEGURA DOS TESTES
// Endpoint: /api/submit-test
//
// Responsabilidades:
// - Verificar autenticação Firebase
// - Exigir tentativa iniciada pelo servidor
// - Validar respostas
// - Calcular resultado exclusivamente no servidor
// - Controlar cooldown
// - Registrar histórico oficial
// - Consumir a tentativa ativa
// - Proteger a progressão N0 → N1
// =====================================================


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const CONFIG = {
    passingScore: 70,
    cooldownMinutes: 10,

    get cooldownMilliseconds() {
        return this.cooldownMinutes * 60 * 1000;
    }
};


// =====================================================
// FIREBASE ADMIN
// =====================================================

const projectId = process.env.FIREBASE_PROJECT_ID;

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
);

if (!getApps().length) {
    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Credenciais do Firebase não configuradas."
        );
    }

    initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey
        })
    });
}


// =====================================================
// SERVIÇOS
// =====================================================

const auth = getAuth();
const db = getFirestore();


// =====================================================
// GABARITOS OFICIAIS — SOMENTE NO SERVIDOR
// =====================================================

const answerKeys = {
    iniciante: [
        1, 1, 2, 0, 0, 0, 1, 1
    ],

    intermediario: [
        0, 0, 1, 1, 0, 2, 0, 0, 0, 2
    ]
};


// =====================================================
// UTILITÁRIOS
// =====================================================

function isValidLevel(level) {
    return (
        typeof level === "string" &&
        Object.prototype.hasOwnProperty.call(
            answerKeys,
            level
        )
    );
}


function isValidAttemptId(attemptId) {
    return (
        typeof attemptId === "string" &&
        /^[A-Za-z0-9]{20}$/.test(attemptId)
    );
}


function isValidAnswers(answers, correctAnswers) {
    if (!Array.isArray(answers)) {
        return false;
    }

    if (answers.length !== correctAnswers.length) {
        return false;
    }

    return answers.every(
        (answer) =>
            Number.isInteger(answer) &&
            answer >= 0 &&
            answer <= 3
    );
}


function calculateScore(answers, correctAnswers) {
    let score = 0;

    correctAnswers.forEach((correctAnswer, index) => {
        if (answers[index] === correctAnswer) {
            score++;
        }
    });

    const total = correctAnswers.length;

    const percentage = Math.round(
        (score / total) * 100
    );

    return {
        score,
        total,
        percentage,
        passed: percentage >= CONFIG.passingScore
    };
}


function calculateRemainingCooldown(lastAttemptTimestamp) {
    if (
        !lastAttemptTimestamp ||
        typeof lastAttemptTimestamp.toMillis !== "function"
    ) {
        return {
            active: false,
            remainingMilliseconds: 0,
            remainingSeconds: 0,
            remainingMinutes: 0
        };
    }

    const nextAllowedAttempt =
        lastAttemptTimestamp.toMillis() +
        CONFIG.cooldownMilliseconds;

    const remainingMilliseconds =
        nextAllowedAttempt - Date.now();

    if (remainingMilliseconds <= 0) {
        return {
            active: false,
            remainingMilliseconds: 0,
            remainingSeconds: 0,
            remainingMinutes: 0
        };
    }

    const remainingSeconds = Math.ceil(
        remainingMilliseconds / 1000
    );

    return {
        active: true,
        remainingMilliseconds,
        remainingSeconds,
        remainingMinutes: Math.ceil(
            remainingSeconds / 60
        )
    };
}


function createError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
}


// =====================================================
// HANDLER
// =====================================================

export default async function handler(req, res) {
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
    );

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Método não permitido."
        });
    }

    try {

        // =============================================
        // 1. AUTENTICAÇÃO FIREBASE
        // =============================================

        const authorization =
            req.headers.authorization || "";

        if (!authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                error: "Autenticação necessária."
            });
        }

        const token = authorization.slice(7);

        const decodedToken = await auth.verifyIdToken(
            token,
            true
        );

        const uid = decodedToken.uid;


        // =============================================
        // 2. VALIDAR DADOS RECEBIDOS
        // =============================================

        const {
            level,
            answers,
            attemptId
        } = req.body || {};

        if (!isValidLevel(level)) {
            return res.status(400).json({
                success: false,
                error: "Nível de teste inválido."
            });
        }

        if (!isValidAttemptId(attemptId)) {
            return res.status(400).json({
                success: false,
                error: "Identificador de tentativa inválido."
            });
        }

        const correctAnswers = answerKeys[level];

        if (!isValidAnswers(answers, correctAnswers)) {
            return res.status(400).json({
                success: false,
                error: "Respostas inválidas."
            });
        }


        // =============================================
        // 3. REFERÊNCIAS FIRESTORE
        // =============================================

        const userRef = db.collection("users").doc(uid);

        const resultsRef = userRef.collection("testResults");

        const currentResultRef = resultsRef.doc(level);

        // Tentativa criada pelo start-test.js.
        const testAttemptRef = userRef
            .collection("testAttempts")
            .doc(attemptId);

        // Controle da tentativa ativa por nível.
        const activeRef = userRef
            .collection("activeTestAttempts")
            .doc(level);

        // Histórico oficial desta tentativa.
        const historyRef = currentResultRef
            .collection("attempts")
            .doc();


        // =============================================
        // 4. CALCULAR RESULTADO NO SERVIDOR
        // =============================================

        const result = calculateScore(
            answers,
            correctAnswers
        );


        // =============================================
        // 5. TRANSAÇÃO ATÔMICA
        //
        // Todas as leituras são realizadas antes
        // de qualquer escrita.
        // =============================================

        let transactionResult;

        await db.runTransaction(async (transaction) => {

            // -----------------------------------------
            // 5.1 LER DOCUMENTOS
            // -----------------------------------------

            const activeDoc = await transaction.get(
                activeRef
            );

            const testAttemptDoc = await transaction.get(
                testAttemptRef
            );

            const currentDoc = await transaction.get(
                currentResultRef
            );

            let beginnerDoc = null;

            if (level === "intermediario") {
                const beginnerRef = resultsRef.doc(
                    "iniciante"
                );

                beginnerDoc = await transaction.get(
                    beginnerRef
                );
            }


            // -----------------------------------------
            // 5.2 VALIDAR TENTATIVA ATIVA
            // -----------------------------------------

            if (!activeDoc.exists) {
                throw createError(
                    "attempt-not-active",
                    "Não existe uma tentativa ativa."
                );
            }

            const activeData = activeDoc.data();

            if (
                activeData?.attemptId !== attemptId ||
                activeData?.uid !== uid ||
                activeData?.level !== level
            ) {
                throw createError(
                    "attempt-not-active",
                    "Esta não é a tentativa ativa."
                );
            }


            // -----------------------------------------
            // 5.3 VALIDAR DOCUMENTO DA TENTATIVA
            // -----------------------------------------

            if (!testAttemptDoc.exists) {
                throw createError(
                    "attempt-not-found",
                    "Tentativa não encontrada."
                );
            }

            const attemptData = testAttemptDoc.data();

            if (
                attemptData?.uid !== uid ||
                attemptData?.level !== level
            ) {
                throw createError(
                    "attempt-not-active",
                    "Tentativa não pertence a esta sessão."
                );
            }

            if (attemptData?.status !== "pending") {
                throw createError(
                    "attempt-already-used",
                    "Esta tentativa já foi utilizada."
                );
            }


            // -----------------------------------------
            // 5.4 VALIDAR EXPIRAÇÃO
            // -----------------------------------------

            const expiresAt = attemptData?.expiresAt;

            if (
                !expiresAt ||
                typeof expiresAt.toMillis !== "function" ||
                expiresAt.toMillis() <= Date.now()
            ) {
                throw createError(
                    "attempt-expired",
                    "Esta tentativa expirou. Inicie um novo teste."
                );
            }


            // -----------------------------------------
            // 5.5 PROGRESSÃO N0 → N1
            // -----------------------------------------

            if (level === "intermediario") {

                if (
                    !beginnerDoc?.exists ||
                    beginnerDoc.data()?.passed !== true
                ) {
                    throw createError(
                        "progression-required",
                        "É necessário ser aprovado oficialmente no N0 antes de realizar o N1."
                    );
                }

            }


            // -----------------------------------------
            // 5.6 VERIFICAR COOLDOWN
            // -----------------------------------------

            const currentData = currentDoc.exists
                ? currentDoc.data()
                : null;

            if (currentData?.lastAttemptAt) {

                const cooldown =
                    calculateRemainingCooldown(
                        currentData.lastAttemptAt
                    );

                if (cooldown.active) {
                    const error = createError(
                        "cooldown-active",
                        "Aguarde antes de realizar uma nova tentativa."
                    );

                    error.cooldown = cooldown;

                    throw error;
                }
            }


            // -----------------------------------------
            // 5.7 NÚMERO DA TENTATIVA
            // -----------------------------------------

            const previousAttempts = Number.isInteger(
                currentData?.attemptCount
            )
                ? currentData.attemptCount
                : 0;

            const attemptNumber = previousAttempts + 1;


            // -----------------------------------------
            // 5.8 PRESERVAR APROVAÇÃO E MELHOR NOTA
            // -----------------------------------------

            const wasPreviouslyPassed =
                currentData?.passed === true;

            const officiallyPassed =
                wasPreviouslyPassed || result.passed;

            const previousBestPercentage =
                Number.isFinite(currentData?.bestPercentage)
                    ? currentData.bestPercentage
                    : 0;

            const bestPercentage = Math.max(
                previousBestPercentage,
                result.percentage
            );

            const previousBestScore =
                Number.isFinite(currentData?.bestScore)
                    ? currentData.bestScore
                    : 0;

            const bestScore = Math.max(
                previousBestScore,
                result.score
            );


            // -----------------------------------------
            // 5.9 REGISTRAR HISTÓRICO
            // -----------------------------------------

            transaction.set(historyRef, {
                uid,
                level,
                attemptNumber,

                score: result.score,
                total: result.total,
                percentage: result.percentage,
                passed: result.passed,

                official: true,

                createdAt: FieldValue.serverTimestamp()
            });


            // -----------------------------------------
            // 5.10 ATUALIZAR RESUMO DO NÍVEL
            // -----------------------------------------

            transaction.set(
                currentResultRef,
                {
                    uid,
                    level,

                    passed: officiallyPassed,

                    lastScore: result.score,
                    lastTotal: result.total,
                    lastPercentage: result.percentage,
                    lastPassed: result.passed,

                    bestScore,
                    bestPercentage,

                    // Corrigido: utiliza a variável declarada.
                    attemptCount: attemptNumber,

                    lastAttemptAt:
                        FieldValue.serverTimestamp(),

                    updatedAt:
                        FieldValue.serverTimestamp(),

                    official: true,

                    ...(currentData
                        ? {}
                        : {
                            createdAt:
                                FieldValue.serverTimestamp()
                        })
                },
                { merge: true }
            );


            // -----------------------------------------
            // 5.11 CONSUMIR TENTATIVA
            // -----------------------------------------

            transaction.update(testAttemptRef, {
                status: "submitted",

                submittedAt:
                    FieldValue.serverTimestamp(),

                resultAttemptId: historyRef.id
            });

            // Remove o controle ativo.
            // Uma tentativa já enviada não pode ser reutilizada.
            transaction.delete(activeRef);


            // -----------------------------------------
            // 5.12 RESULTADO DA TRANSAÇÃO
            // -----------------------------------------

            transactionResult = {
                attemptId: historyRef.id,
                attemptNumber,

                score: result.score,
                total: result.total,
                percentage: result.percentage,

                attemptPassed: result.passed,
                passed: officiallyPassed
            };

        });


        // =============================================
        // 6. RESPOSTA AO NAVEGADOR
        // =============================================

        return res.status(200).json({
            success: true,

            level,

            attemptId:
                transactionResult.attemptId,

            attemptNumber:
                transactionResult.attemptNumber,

            score:
                transactionResult.score,

            total:
                transactionResult.total,

            percentage:
                transactionResult.percentage,

            attemptPassed:
                transactionResult.attemptPassed,

            passed:
                transactionResult.passed,

            cooldownMinutes:
                CONFIG.cooldownMinutes
        });


    } catch (error) {

        // =============================================
        // 7. COOLDOWN
        // =============================================

        if (error?.code === "cooldown-active") {

            const cooldown = error.cooldown;

            return res.status(429).json({
                success: false,

                error:
                    `Aguarde ${cooldown.remainingMinutes} minuto(s) antes de realizar uma nova tentativa.`,

                cooldown: {
                    active: true,
                    remainingSeconds:
                        cooldown.remainingSeconds,
                    remainingMinutes:
                        cooldown.remainingMinutes
                }
            });
        }


        // =============================================
        // 8. ERROS DE TENTATIVA
        // =============================================

        const attemptErrors = {
            "attempt-not-active": {
                status: 409,
                message:
                    "Esta tentativa não está ativa. Inicie o teste novamente."
            },

            "attempt-not-found": {
                status: 404,
                message:
                    "Tentativa não encontrada. Inicie o teste novamente."
            },

            "attempt-already-used": {
                status: 409,
                message:
                    "Esta tentativa já foi utilizada."
            },

            "attempt-expired": {
                status: 410,
                message:
                    "Sua tentativa expirou. Inicie um novo teste."
            },

            "progression-required": {
                status: 403,
                message:
                    "É necessário concluir e passar no N0 antes de realizar o N1."
            }
        };

        const knownError = attemptErrors[error?.code];

        if (knownError) {
            return res.status(knownError.status).json({
                success: false,
                error: knownError.message
            });
        }


        // =============================================
        // 9. ERROS DE AUTENTICAÇÃO
        // =============================================

        if (
            error?.code === "auth/id-token-expired" ||
            error?.code === "auth/id-token-revoked" ||
            error?.code === "auth/argument-error" ||
            error?.code === "auth/invalid-id-token"
        ) {
            return res.status(401).json({
                success: false,
                error:
                    "Sessão inválida. Entre novamente."
            });
        }


        // =============================================
        // 10. ERRO INTERNO
        // =============================================

        console.error(
            "Erro na validação do teste:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                "Não foi possível validar o teste."
        });

    }
}
