
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// =====================================================
// CYBER NEXIS — VALIDAÇÃO SEGURA DOS TESTES
// Endpoint: /api/submit-test
// =====================================================

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!getApps().length) {
    if (!projectId || !clientEmail || !privateKey) {
        throw new Error("Credenciais do Firebase não configuradas.");
    }

    initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey
        })
    });
}

const auth = getAuth();
const db = getFirestore();

// Gabarito mantido exclusivamente no servidor.
// Os índices correspondem às alternativas do tests.js.

const answerKeys = {
    iniciante: [1, 1, 2, 0, 0, 0, 1, 1],
    intermediario: [0, 0, 1, 1, 0, 2, 0, 0, 0, 2]
};

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método não permitido."
        });
    }

    try {
        // 1. Verificar token Firebase
        const authorization = req.headers.authorization || "";

        if (!authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Autenticação necessária."
            });
        }

        const token = authorization.slice(7);
        const decodedToken = await auth.verifyIdToken(token);

        const uid = decodedToken.uid;

        // 2. Validar dados recebidos
        const { level, answers } = req.body || {};

        if (!Object.prototype.hasOwnProperty.call(answerKeys, level)) {
            return res.status(400).json({
                error: "Nível de teste inválido."
            });
        }

        const correctAnswers = answerKeys[level];

        if (
            !Array.isArray(answers) ||
            answers.length !== correctAnswers.length ||
            !answers.every(
                answer =>
                    Number.isInteger(answer) &&
                    answer >= 0 &&
                    answer <= 3
            )
        ) {
            return res.status(400).json({
                error: "Respostas inválidas."
            });
        }

        // 3. Verificar aprovação anterior para o N1
        const userResults = db
            .collection("users")
            .doc(uid)
            .collection("testResults");

        if (level === "intermediario") {
            const beginnerDoc = await userResults
                .doc("iniciante")
                .get();

            if (!beginnerDoc.exists || beginnerDoc.data().passed !== true) {
                return res.status(403).json({
                    error: "É necessário ser aprovado no N0 Iniciante."
                });
            }
        }

        // 4. Calcular pontuação no servidor
        let score = 0;

        correctAnswers.forEach((correct, index) => {
            if (answers[index] === correct) {
                score++;
            }
        });

        const total = correctAnswers.length;
        const percentage = Math.round((score / total) * 100);
        const passed = percentage >= 70;

        // 5. Salvar resultado oficial no Firestore
        const result = {
            uid,
            level,
            score,
            total,
            percentage,
            passed,
            date: FieldValue.serverTimestamp()
        };

        await userResults.doc(level).set(result);

        // 6. Retornar somente o resultado, nunca o gabarito
        return res.status(200).json({
            success: true,
            level,
            score,
            total,
            percentage,
            passed
        });

    } catch (error) {
        console.error("Erro na validação do teste:", error);

        if (
            error.code === "auth/id-token-expired" ||
            error.code === "auth/argument-error" ||
            error.code === "auth/invalid-id-token"
        ) {
            return res.status(401).json({
                error: "Sessão inválida. Entre novamente."
            });
        }

        return res.status(500).json({
            error: "Não foi possível validar o teste."
        });
    }
}
