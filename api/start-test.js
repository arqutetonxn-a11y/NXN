
/* =========================================================
   CYBER NEXIS — INÍCIO SEGURO DOS TESTES
   Arquivo: api/start-test.js
   Endpoint: /api/start-test

   Responsabilidades:
   - Validar autenticação Firebase
   - Verificar acesso ao nível solicitado
   - Controlar intervalo entre tentativas
   - Criar uma tentativa válida por 30 minutos
   - Reutilizar tentativa pendente ainda válida
   - Registrar tentativa no Firestore
   ========================================================= */

import { randomBytes } from "node:crypto";

import {
    initializeApp,
    cert,
    getApps
} from "firebase-admin/app";

import { getAuth } from "firebase-admin/auth";

import {
    getFirestore,
    FieldValue,
    Timestamp
} from "firebase-admin/firestore";

// =====================================================
// CONFIGURAÇÕES
// =====================================================

const CONFIG = {
    cooldownMinutes: 10,
    validityMinutes: 30,
    levels: ["iniciante", "intermediario"]
};

// =====================================================
// FIREBASE ADMIN
// =====================================================

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : null;

if (!projectId || !clientEmail || !privateKey) {
    console.error(
        "CYBER NEXIS: variáveis do Firebase não configuradas."
    );
}

const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey
        })
    });

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function sendError(res, status, message, extra = {}) {
    return res.status(status).json({
        success: false,
        message,
        ...extra
    });
}

function generateAttemptId() {
    // 20 caracteres alfanuméricos.
    return randomBytes(10).toString("hex");
}

function isValidLevel(level) {
    return CONFIG.levels.includes(level);
}

function getBearerToken(req) {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
        return null;
    }

    return header.slice(7).trim();
}

// =====================================================
// ENDPOINT
// =====================================================

export default async function handler(req, res) {

    // -------------------------------------------------
    // Método HTTP
    // -------------------------------------------------

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");

        return sendError(
            res,
            405,
            "Método não permitido."
        );
    }

    try {

        // -------------------------------------------------
        // Verificar configuração Firebase
        // -------------------------------------------------

        if (!projectId || !clientEmail || !privateKey) {
            console.error(
                "Configuração Firebase incompleta."
            );

            return sendError(
                res,
                500,
                "Configuração do servidor incompleta."
            );
        }

        // -------------------------------------------------
        // Autenticação
        // -------------------------------------------------

        const token = getBearerToken(req);

        if (!token) {
            return sendError(
                res,
                401,
                "Autenticação necessária."
            );
        }

        let decodedToken;

        try {
            decodedToken = await auth.verifyIdToken(
                token,
                true
            );
        } catch (error) {
            return sendError(
                res,
                401,
                "Sessão inválida ou expirada. Entre novamente."
            );
        }

        const uid = decodedToken.uid;

        // -------------------------------------------------
        // Validar nível solicitado
        // -------------------------------------------------

        const level = req.body?.level;

        if (!isValidLevel(level)) {
            return sendError(
                res,
                400,
                "Nível de teste inválido."
            );
        }

        // -------------------------------------------------
        // Referências do Firestore
        // -------------------------------------------------

        const userRef = db.collection("users").doc(uid);

        const resultRef = userRef
            .collection("testResults")
            .doc(level);

        const activeRef = userRef
            .collection("activeTestAttempts")
            .doc(level);

        const attemptCollection = userRef
            .collection("testAttempts");

        const beginnerRef = userRef
            .collection("testResults")
            .doc("iniciante");

        // ID preparado antes da transação.
        const newAttemptId = generateAttemptId();

        const newAttemptRef = attemptCollection
            .doc(newAttemptId);

        const now = Date.now();

        const expiresAt = Timestamp.fromMillis(
            now + CONFIG.validityMinutes * 60 * 1000
        );

        // -------------------------------------------------
        // Transação
        // -------------------------------------------------

        const result = await db.runTransaction(
            async (transaction) => {

                // Leituras
                const resultSnap = await transaction.get(
                    resultRef
                );

                const activeSnap = await transaction.get(
                    activeRef
                );

                let beginnerSnap = null;

                if (level === "intermediario") {
                    beginnerSnap = await transaction.get(
                        beginnerRef
                    );
                }

                let activeAttemptSnap = null;
                let activeAttemptRef = null;

                const activeData = activeSnap.exists
                    ? activeSnap.data()
                    : null;

                if (
                    activeData &&
                    typeof activeData.attemptId === "string" &&
                    /^[a-fA-F0-9]{20}$/.test(
                        activeData.attemptId
                    )
                ) {
                    activeAttemptRef = attemptCollection.doc(
                        activeData.attemptId
                    );

                    activeAttemptSnap = await transaction.get(
                        activeAttemptRef
                    );
                }

                // -------------------------------------------------
                // Exigir aprovação no N0 antes do N1
                // -------------------------------------------------

                if (level === "intermediario") {
                    const beginnerPassed =
                        beginnerSnap?.exists &&
                        beginnerSnap.data()?.passed === true;

                    if (!beginnerPassed) {
                        return {
                            error: "N0_REQUIRED"
                        };
                    }
                }

                // -------------------------------------------------
                // Reutilizar tentativa pendente válida
                // -------------------------------------------------

                if (
                    activeData &&
                    activeData.uid === uid &&
                    activeData.level === level &&
                    activeAttemptSnap?.exists
                ) {
                    const attemptData =
                        activeAttemptSnap.data();

                    const validPending =
                        attemptData.uid === uid &&
                        attemptData.level === level &&
                        attemptData.status === "pending" &&
                        attemptData.expiresAt &&
                        typeof attemptData.expiresAt.toMillis === "function" &&
                        attemptData.expiresAt.toMillis() > now;

                    if (validPending) {
                        return {
                            reused: true,
                            attemptId: activeData.attemptId,
                            expiresAt: attemptData.expiresAt
                        };
                    }

                    // Tentativa pendente vencida.
                    if (
                        attemptData.status === "pending"
                    ) {
                        transaction.update(
                            activeAttemptRef,
                            {
                                status: "expired",
                                expiredAt: FieldValue.serverTimestamp()
                            }
                        );
                    }

                    transaction.delete(activeRef);
                } else if (activeSnap.exists) {
                    // Remove referência ativa inconsistente.
                    transaction.delete(activeRef);
                }

                // -------------------------------------------------
                // Verificar intervalo entre tentativas
                // -------------------------------------------------

                if (resultSnap.exists) {
                    const resultData = resultSnap.data();

                    const lastAttemptAt =
                        resultData.lastAttemptAt;

                    if (
                        lastAttemptAt &&
                        typeof lastAttemptAt.toMillis === "function"
                    ) {
                        const cooldownEndsAt =
                            lastAttemptAt.toMillis() +
                            CONFIG.cooldownMinutes * 60 * 1000;

                        if (cooldownEndsAt > now) {
                            const remainingMs =
                                cooldownEndsAt - now;

                            const remainingSeconds =
                                Math.ceil(remainingMs / 1000);

                            return {
                                error: "COOLDOWN",
                                remainingSeconds
                            };
                        }
                    }
                }

                // -------------------------------------------------
                // Criar nova tentativa
                // -------------------------------------------------

                transaction.set(newAttemptRef, {
                    uid,
                    level,
                    status: "pending",
                    createdAt: FieldValue.serverTimestamp(),
                    expiresAt
                });

                // Registrar tentativa ativa do participante.
                transaction.set(activeRef, {
                    uid,
                    level,
                    attemptId: newAttemptId,
                    createdAt: FieldValue.serverTimestamp(),
                    expiresAt
                });

                return {
                    reused: false,
                    attemptId: newAttemptId,
                    expiresAt
                };
            }
        );

        // -------------------------------------------------
        // Tratar bloqueios da transação
        // -------------------------------------------------

        if (result.error === "N0_REQUIRED") {
            return sendError(
                res,
                403,
                "Você precisa concluir e ser aprovado no N0 antes de iniciar o N1."
            );
        }

        if (result.error === "COOLDOWN") {
            return sendError(
                res,
                429,
                "Aguarde antes de iniciar outra tentativa.",
                {
                    remainingSeconds: result.remainingSeconds,
                    cooldownMinutes: CONFIG.cooldownMinutes
                }
            );
        }

        // -------------------------------------------------
        // Resposta de sucesso
        // -------------------------------------------------

        return res.status(result.reused ? 200 : 201).json({
            success: true,
            message: result.reused
                ? "Sua tentativa em andamento foi recuperada."
                : "Teste iniciado com sucesso.",
            attemptId: result.attemptId,
            level,
            expiresAt: result.expiresAt
                .toDate()
                .toISOString(),
            validityMinutes: CONFIG.validityMinutes,
            reused: result.reused
        });

    } catch (error) {

        console.error(
            "Erro em /api/start-test:",
            error
        );

        return sendError(
            res,
            500,
            "Não foi possível iniciar o teste. Tente novamente."
        );
    }
}
