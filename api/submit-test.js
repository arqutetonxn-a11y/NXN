import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import {
    getFirestore,
    FieldValue,
    Timestamp
} from "firebase-admin/firestore";

// =====================================================
// CYBER NEXIS — VALIDAÇÃO SEGURA DOS TESTES
// Endpoint: /api/submit-test
//
// Responsabilidades:
// - Verificar autenticação Firebase
// - Validar respostas
// - Calcular resultado exclusivamente no servidor
// - Controlar intervalo entre tentativas
// - Registrar histórico oficial
// - Proteger o desbloqueio progressivo
// =====================================================


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const CONFIG = {
    passingScore: 70,

    // Intervalo obrigatório entre tentativas.
    cooldownMinutes: 10,

    get cooldownMilliseconds() {
        return this.cooldownMinutes * 60 * 1000;
    }
};


// =====================================================
// FIREBASE ADMIN
// =====================================================

const projectId = process.env.FIREBASE_PROJECT_ID;

const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL;

const privateKey =
    process.env.FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
    );


if (!getApps().length) {

    if (
        !projectId ||
        !clientEmail ||
        !privateKey
    ) {
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
// GABARITOS OFICIAIS
//
// IMPORTANTE:
// Estes dados permanecem exclusivamente no servidor.
// Nunca enviar os gabaritos para o navegador.
// =====================================================

const answerKeys = {

    iniciante: [
        1,
        1,
        2,
        0,
        0,
        0,
        1,
        1
    ],

    intermediario: [
        0,
        0,
        1,
        1,
        0,
        2,
        0,
        0,
        0,
        2
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


function isValidAnswers(
    answers,
    correctAnswers
) {

    if (!Array.isArray(answers)) {
        return false;
    }

    if (
        answers.length !==
        correctAnswers.length
    ) {
        return false;
    }

    return answers.every(
        (answer) =>
            Number.isInteger(answer) &&
            answer >= 0 &&
            answer <= 3
    );

}


function calculateScore(
    answers,
    correctAnswers
) {

    let score = 0;

    correctAnswers.forEach(
        (correctAnswer, index) => {

            if (
                answers[index] ===
                correctAnswer
            ) {
                score++;
            }

        }
    );

    const total =
        correctAnswers.length;

    const percentage =
        Math.round(
            (score / total) * 100
        );

    const passed =
        percentage >=
        CONFIG.passingScore;

    return {
        score,
        total,
        percentage,
        passed
    };

}


function calculateRemainingCooldown(
    lastAttemptTimestamp
) {

    if (
        !lastAttemptTimestamp ||
        typeof lastAttemptTimestamp.toMillis !==
            "function"
    ) {
        return {
            active: false,
            remainingMilliseconds: 0,
            remainingSeconds: 0,
            remainingMinutes: 0
        };
    }

    const now = Date.now();

    const lastAttempt =
        lastAttemptTimestamp.toMillis();

    const nextAllowedAttempt =
        lastAttempt +
        CONFIG.cooldownMilliseconds;

    const remainingMilliseconds =
        nextAllowedAttempt - now;

    if (remainingMilliseconds <= 0) {

        return {
            active: false,
            remainingMilliseconds: 0,
            remainingSeconds: 0,
            remainingMinutes: 0
        };

    }

    const remainingSeconds =
        Math.ceil(
            remainingMilliseconds / 1000
        );

    const remainingMinutes =
        Math.ceil(
            remainingSeconds / 60
        );

    return {
        active: true,
        remainingMilliseconds,
        remainingSeconds,
        remainingMinutes
    };

}


// =====================================================
// HANDLER
// =====================================================

export default async function handler(
    req,
    res
) {

    // Nunca permitir cache de resultados.
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
    );


    // =================================================
    // 1. MÉTODO HTTP
    // =================================================

    if (req.method !== "POST") {

        return res.status(405).json({
            success: false,
            error:
                "Método não permitido."
        });

    }


    try {


        // =============================================
        // 2. AUTENTICAÇÃO FIREBASE
        // =============================================

        const authorization =
            req.headers.authorization || "";

        if (
            !authorization.startsWith(
                "Bearer "
            )
        ) {

            return res.status(401).json({
                success: false,
                error:
                    "Autenticação necessária."
            });

        }


        const token =
            authorization.slice(7);

        const decodedToken =
            await auth.verifyIdToken(token);

        const uid =
            decodedToken.uid;


        // =============================================
        // 3. VALIDAR DADOS RECEBIDOS
        // =============================================

        const {
            level,
            answers
        } = req.body || {};


        if (!isValidLevel(level)) {

            return res.status(400).json({
                success: false,
                error:
                    "Nível de teste inválido."
            });

        }


        const correctAnswers =
            answerKeys[level];


        if (
            !isValidAnswers(
                answers,
                correctAnswers
            )
        ) {

            return res.status(400).json({
                success: false,
                error:
                    "Respostas inválidas."
            });

        }


        // =============================================
        // 4. REFERÊNCIAS FIRESTORE
        // =============================================

        const userRef =
            db.collection("users")
                .doc(uid);

        const resultsRef =
            userRef.collection(
                "testResults"
            );

        const currentResultRef =
            resultsRef.doc(level);


        // =============================================
        // 5. VERIFICAR PROGRESSÃO N0 → N1
        //
        // O N1 só pode ser realizado se o N0 estiver
        // oficialmente aprovado.
        // =============================================

        if (
            level === "intermediario"
        ) {

            const beginnerRef =
                resultsRef.doc(
                    "iniciante"
                );

            const beginnerDoc =
                await beginnerRef.get();


            if (
                !beginnerDoc.exists ||
                beginnerDoc.data()?.passed !== true
            ) {

                return res.status(403).json({
                    success: false,
                    error:
                        "É necessário ser aprovado oficialmente no N0 Iniciante antes de realizar o N1."
                });

            }

        }


        // =============================================
        // 6. CALCULAR RESULTADO OFICIAL
        //
        // O cálculo acontece exclusivamente aqui.
        // =============================================

        const result =
            calculateScore(
                answers,
                correctAnswers
            );


        // =============================================
        // 7. TRANSAÇÃO ATÔMICA
        //
        // Evita:
        // - Duplo envio simultâneo
        // - Tentativas paralelas
        // - Burlar o intervalo rapidamente
        // =============================================

        let transactionResult;


        await db.runTransaction(
            async (transaction) => {


                const currentDoc =
                    await transaction.get(
                        currentResultRef
                    );


                const currentData =
                    currentDoc.exists
                        ? currentDoc.data()
                        : null;


                // =====================================
                // 7.1 VERIFICAR COOLDOWN
                // =====================================

                if (
                    currentData?.lastAttemptAt
                ) {

                    const cooldown =
                        calculateRemainingCooldown(
                            currentData.lastAttemptAt
                        );


                    if (cooldown.active) {

                        const error =
                            new Error(
                                "COOLDOWN_ACTIVE"
                            );

                        error.code =
                            "cooldown-active";

                        error.cooldown =
                            cooldown;

                        throw error;

                    }

                }


                // =====================================
                // 7.2 NÚMERO DA TENTATIVA
                // =====================================

                const previousAttempts =
                    Number.isInteger(
                        currentData?.attemptCount
                    )
                        ? currentData.attemptCount
                        : 0;


                const attemptNumber =
                    previousAttempts + 1;


                // =====================================
                // 7.3 DOCUMENTO DA TENTATIVA
                //
                // ID automático gerado pelo Firestore.
                // =====================================

                const attemptRef =
                    currentResultRef
                        .collection("attempts")
                        .doc();


                // =====================================
                // 7.4 REGISTRAR HISTÓRICO
                //
                // Não salvamos o gabarito.
                // O histórico registra o resultado
                // oficial de cada tentativa.
                // =====================================

                transaction.set(
                    attemptRef,
                    {
                        uid,
                        level,

                        attemptNumber,

                        score:
                            result.score,

                        total:
                            result.total,

                        percentage:
                            result.percentage,

                        passed:
                            result.passed,

                        official: true,

                        createdAt:
                            FieldValue.serverTimestamp()
                    }
                );


                // =====================================
                // 7.5 ATUALIZAR ESTADO OFICIAL
                //
                // Uma aprovação anterior nunca é perdida
                // caso o participante refaça o teste e
                // tenha uma nota menor.
                // =====================================

                const wasPreviouslyPassed =
                    currentData?.passed === true;


                const officiallyPassed =
                    wasPreviouslyPassed ||
                    result.passed;


                const previousBestPercentage =
                    Number.isFinite(
                        currentData?.bestPercentage
                    )
                        ? currentData.bestPercentage
                        : 0;


                const bestPercentage =
                    Math.max(
                        previousBestPercentage,
                        result.percentage
                    );


                const previousBestScore =
                    Number.isFinite(
                        currentData?.bestScore
                    )
                        ? currentData.bestScore
                        : 0;


                const bestScore =
                    Math.max(
                        previousBestScore,
                        result.score
                    );


                // =====================================
                // 7.6 DOCUMENTO-RESUMO DO NÍVEL
                // =====================================

                transaction.set(
                    currentResultRef,
                    {
                        uid,

                        level,

                        // Estado oficial permanente.
                        passed:
                            officiallyPassed,

                        // Última tentativa.
                        lastScore:
                            result.score,

                        lastTotal:
                            result.total,

                        lastPercentage:
                            result.percentage,

                        lastPassed:
                            result.passed,

                        // Melhor resultado.
                        bestScore,

                        bestPercentage,

                        // Histórico.
                        attemptCount,

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
                    {
                        merge: true
                    }
                );


                transactionResult = {
                    attemptId:
                        attemptRef.id,

                    attemptNumber,

                    score:
                        result.score,

                    total:
                        result.total,

                    percentage:
                        result.percentage,

                    // Resultado desta tentativa.
                    attemptPassed:
                        result.passed,

                    // Aprovação oficial acumulada.
                    passed:
                        officiallyPassed
                };

            }
        );


        // =============================================
        // 8. RESPOSTA AO NAVEGADOR
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

            // Resultado da tentativa atual.
            attemptPassed:
                transactionResult.attemptPassed,

            // Estado oficial do nível.
            passed:
                transactionResult.passed,

            cooldownMinutes:
                CONFIG.cooldownMinutes

        });


    } catch (error) {


        // =============================================
        // COOLDOWN ATIVO
        // =============================================

        if (
            error?.code ===
            "cooldown-active"
        ) {

            const cooldown =
                error.cooldown;


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


        console.error(
            "Erro na validação do teste:",
            error
        );


        // =============================================
        // ERROS DE AUTENTICAÇÃO
        // =============================================

        if (

            error.code ===
                "auth/id-token-expired" ||

            error.code ===
                "auth/argument-error" ||

            error.code ===
                "auth/invalid-id-token"

        ) {

            return res.status(401).json({

                success: false,

                error:
                    "Sessão inválida. Entre novamente."

            });

        }


        // =============================================
        // ERRO INTERNO
        // =============================================

        return res.status(500).json({

            success: false,

            error:
                "Não foi possível validar o teste."

        });

    }

}
