(() => {
  "use strict";

  const SCRIPT_FLAG = "__CNX_SENTINEL_V2__";
  if (window[SCRIPT_FLAG]) return;
  window[SCRIPT_FLAG] = true;

  const STORAGE_KEY = "cnx_sentinel_v2";
  const FLOW_KEY = "cnx_recruitment_flow_v1";
  const VERSION = 2;
  const REQUIRED_ROUNDS = 3;
  const COOLDOWN_AFTER = 3;
  const COOLDOWN_MS = 60_000;
  const MAX_WRONG = 5;
  const MAX_TOTAL = 8;

  const challenges = [
    {
      id: "ethics-authorization",
      prompt: "Qual princípio exige permissão explícita antes de testar um sistema?",
      answers: ["autorizacao", "autorização", "permissao", "permissão"],
      layer: "Ética"
    },
    {
      id: "logic-sequence",
      prompt: "Complete a sequência: 2, 3, 5, 8, 13, __",
      answers: ["21"],
      layer: "Lógica"
    },
    {
      id: "security-integrity",
      prompt: "Qual propriedade de segurança permite detectar alterações não autorizadas em dados?",
      answers: ["integridade"],
      layer: "Segurança"
    },
    {
      id: "collaboration-document",
      prompt: "Em uma equipe técnica, qual ação reduz ambiguidade e permite auditoria futura?",
      answers: ["documentar", "documentacao", "documentação", "registrar"],
      layer: "Colaboração"
    },
    {
      id: "incident-first",
      prompt: "Ao detectar um incidente, qual atitude vem antes de improvisar mudanças destrutivas?",
      answers: ["conter e registrar", "conter", "registrar evidencias", "registrar evidências"],
      layer: "Resposta"
    },
    {
      id: "privacy-minimum",
      prompt: "Como se chama o princípio de coletar apenas os dados realmente necessários?",
      answers: ["minimizacao de dados", "minimização de dados", "minimizacao", "minimização"],
      layer: "Privacidade"
    }
  ];

  const normalize = (value = "") => String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const nowIso = () => new Date().toISOString();

  function randomIndex(max) {
    if (max <= 1) return 0;
    const array = new Uint32Array(1);
    if (window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(array);
      return array[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function createId() {
    if (window.crypto?.randomUUID) return `sentinel-${crypto.randomUUID()}`;
    return `sentinel-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function shuffledIds() {
    const pool = challenges.map((item) => item.id);
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = randomIndex(i + 1);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, REQUIRED_ROUNDS);
  }

  function initialState() {
    const created = nowIso();
    return {
      version: VERSION,
      challengeId: createId(),
      order: shuffledIds(),
      round: 0,
      totalAttempts: 0,
      wrongAttempts: 0,
      status: "em_andamento",
      answers: [],
      createdAt: created,
      updatedAt: created,
      completedAt: null,
      cooldownUntil: null,
      digest: null
    };
  }

  function validState(state) {
    return Boolean(
      state &&
      state.version === VERSION &&
      Array.isArray(state.order) &&
      state.order.length === REQUIRED_ROUNDS &&
      Number.isInteger(state.round) &&
      state.round >= 0 &&
      state.round <= REQUIRED_ROUNDS &&
      Array.isArray(state.answers)
    );
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (validState(parsed)) return parsed;
    } catch (error) {
      console.warn("Sentinel: estado inválido descartado.", error);
    }
    return initialState();
  }

  function saveState(state) {
    state.updatedAt = nowIso();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadFlow() {
    try {
      return JSON.parse(localStorage.getItem(FLOW_KEY) || "{}");
    } catch {
      return {};
    }
  }

  async function digestPayload(payload) {
    if (!window.crypto?.subtle) return null;
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  async function syncFlow(state) {
    const publicResult = {
      challengeId: state.challengeId,
      status: state.status,
      round: state.round,
      totalRounds: REQUIRED_ROUNDS,
      totalAttempts: state.totalAttempts,
      wrongAttempts: state.wrongAttempts,
      answers: state.answers.map(({ challenge, layer, correct, answeredAt }) => ({
        challenge,
        layer,
        correct,
        answeredAt
      })),
      createdAt: state.createdAt,
      completedAt: state.completedAt,
      updatedAt: state.updatedAt
    };

    publicResult.digest = await digestPayload(publicResult);
    state.digest = publicResult.digest;
    saveState(state);

    const flow = loadFlow();
    flow.version = 1;
    flow.submissionId = flow.submissionId || state.challengeId;
    flow.sentinel = publicResult;
    if (state.status === "aprovado" && flow.perfil?.status === "concluido") {
      flow.status = "pronto_para_analise";
    }
    flow.atualizadoEm = nowIso();
    localStorage.setItem(FLOW_KEY, JSON.stringify(flow));

    document.dispatchEvent(new CustomEvent("cnx:sentinel-updated", {
      detail: {
        status: state.status,
        round: state.round,
        totalRounds: REQUIRED_ROUNDS,
        attempts: state.totalAttempts
      }
    }));
  }

  function findChallenge(id) {
    return challenges.find((challenge) => challenge.id === id);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const section = document.getElementById("protocolo-sentinel");
    if (!section) return;

    const form = document.getElementById("sentinel-form");
    const input = document.getElementById("sentinel-answer");
    const button = document.getElementById("sentinel-button");
    const question = document.getElementById("sentinel-question");
    const status = document.getElementById("sentinel-status");
    const attempts = document.getElementById("sentinel-attempts");
    const layer = document.getElementById("sentinel-layer");
    const windowBox = document.getElementById("sentinel-window");
    const clock = document.getElementById("sentinel-clock");
    const overlay = document.getElementById("sentinel-overlay");
    const resultTitle = document.getElementById("sentinel-result-title");
    const resultMessage = document.getElementById("sentinel-result-message");

    if (!form || !input || !button || !question || !status) return;

    input.maxLength = 80;
    input.autocomplete = "off";
    input.setAttribute("aria-describedby", "sentinel-status");

    let state = loadState();
    let timer = null;

    const setStatus = (message, tone = "") => {
      status.className = `sentinel-status${tone ? ` ${tone}` : ""}`;
      status.innerHTML = `<span>Status:</span> ${message}`;
    };

    const showOverlay = (title, message, duration = 800) => {
      if (!overlay || !resultTitle || !resultMessage) return;
      resultTitle.textContent = title;
      resultMessage.textContent = message;
      overlay.classList.add("is-visible");
      window.setTimeout(() => overlay.classList.remove("is-visible"), duration);
    };

    const updateClock = () => {
      if (!clock) return;
      clock.textContent = new Date().toLocaleTimeString("pt-BR", { hour12: false });
    };

    const remainingCooldown = () => {
      const until = state.cooldownUntil ? Date.parse(state.cooldownUntil) : 0;
      return Math.max(0, until - Date.now());
    };

    const render = () => {
      updateClock();
      if (attempts) attempts.textContent = String(state.totalAttempts);
      if (windowBox) windowBox.textContent = state.challengeId.slice(-8).toUpperCase();

      if (state.status === "aprovado") {
        question.textContent = "Protocolo concluído.";
        if (layer) layer.textContent = "Validada";
        input.disabled = true;
        button.disabled = true;
        button.textContent = "VALIDADO ✓";
        setStatus("assinatura registrada e encaminhada para análise.", "is-ok");
        return;
      }

      if (state.status === "negado") {
        question.textContent = "Protocolo encerrado.";
        if (layer) layer.textContent = "Bloqueada";
        input.disabled = true;
        button.disabled = true;
        button.textContent = "ACESSO ENCERRADO";
        setStatus("limite de tentativas atingido. O estado foi preservado.", "is-error");
        return;
      }

      const cooldown = remainingCooldown();
      if (cooldown > 0) {
        const seconds = Math.ceil(cooldown / 1000);
        input.disabled = true;
        button.disabled = true;
        button.textContent = `AGUARDE ${seconds}s`;
        setStatus(`resfriamento de segurança ativo por ${seconds} segundo(s).`, "is-warn");
        return;
      }

      if (state.cooldownUntil) {
        state.cooldownUntil = null;
        saveState(state);
      }

      const current = findChallenge(state.order[state.round]);
      if (!current) {
        state.status = "negado";
        saveState(state);
        render();
        return;
      }

      question.textContent = current.prompt;
      if (layer) layer.textContent = `${current.layer} ${state.round + 1}/${REQUIRED_ROUNDS}`;
      input.disabled = false;
      button.disabled = false;
      button.textContent = "VERIFICAR RESPOSTA";
      setStatus("desafio de sessão ativo. Respostas vazias não são registradas.");
    };

    const tick = () => {
      updateClock();
      if (remainingCooldown() > 0) render();
      else if (state.cooldownUntil) render();
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (state.status !== "em_andamento" || remainingCooldown() > 0) {
        render();
        return;
      }

      const value = normalize(input.value);
      if (!value) {
        setStatus("digite uma resposta válida.", "is-warn");
        return;
      }

      const current = findChallenge(state.order[state.round]);
      if (!current) return;

      input.disabled = true;
      button.disabled = true;
      state.totalAttempts += 1;

      const correct = current.answers.some((answer) => normalize(answer) === value);
      state.answers.push({
        challenge: current.id,
        layer: current.layer,
        correct,
        answeredAt: nowIso()
      });

      if (correct) {
        state.round += 1;
        showOverlay("ASSINATURA ACEITA", "A camada atual foi validada.");

        if (state.round >= REQUIRED_ROUNDS) {
          state.status = "aprovado";
          state.completedAt = nowIso();
          await syncFlow(state);
          render();
          window.CNXRecruitment?.refreshSystemData?.();
          return;
        }

        saveState(state);
        await syncFlow(state);
        input.value = "";
        render();
        return;
      }

      state.wrongAttempts += 1;
      showOverlay("ASSINATURA RECUSADA", "A resposta não corresponde ao desafio atual.");

      if (state.wrongAttempts >= MAX_WRONG || state.totalAttempts >= MAX_TOTAL) {
        state.status = "negado";
        state.completedAt = nowIso();
      } else if (state.wrongAttempts === COOLDOWN_AFTER) {
        state.cooldownUntil = new Date(Date.now() + COOLDOWN_MS).toISOString();
      }

      saveState(state);
      await syncFlow(state);
      input.value = "";
      render();
    });

    timer = window.setInterval(tick, 1000);
    window.addEventListener("beforeunload", () => clearInterval(timer));
    render();
    syncFlow(state).catch((error) => console.warn("Falha ao sincronizar Sentinel:", error));
  });
})();
