(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const FLOW_KEY = "cnx_recruitment_flow_v1";
  const OBS_KEY = "cnx_observation_v5";
  const SENTINEL_KEY = "cnx_sentinel_v2";
  const PROFILE_KEY = "cnx_profile_assessment_v1";
  const SESSION_KEY = "cnx_browser_session_v1";

  const questions = [
    { id: "ethics-1", category: "Ética", text: "Eu interromperia uma tarefa se percebesse que ela ultrapassa o escopo autorizado." },
    { id: "ethics-2", category: "Ética", text: "Eu registraria um erro próprio mesmo que ninguém tivesse percebido." },
    { id: "ethics-3", category: "Ética", text: "Eu recusaria usar dados privados obtidos sem consentimento." },
    { id: "ethics-4", category: "Ética", text: "Eu priorizo responsabilidade acima de prestígio ou aparência de poder." },

    { id: "collab-1", category: "Colaboração", text: "Consigo explicar uma decisão técnica sem diminuir quem sabe menos." },
    { id: "collab-2", category: "Colaboração", text: "Peço ajuda cedo quando um bloqueio pode prejudicar a equipe." },
    { id: "collab-3", category: "Colaboração", text: "Aceito revisão crítica do meu trabalho sem transformar a conversa em disputa pessoal." },
    { id: "collab-4", category: "Colaboração", text: "Compartilho contexto suficiente para que outra pessoa consiga continuar minha tarefa." },

    { id: "discipline-1", category: "Disciplina", text: "Costumo concluir tarefas pequenas antes de acumular novas promessas." },
    { id: "discipline-2", category: "Disciplina", text: "Documento etapas importantes mesmo quando estou com pressa." },
    { id: "discipline-3", category: "Disciplina", text: "Consigo seguir um procedimento repetitivo quando ele protege a qualidade." },
    { id: "discipline-4", category: "Disciplina", text: "Reviso o resultado antes de declarar uma tarefa concluída." },

    { id: "learning-1", category: "Aprendizado", text: "Quando não sei algo, consigo admitir isso e procurar uma fonte confiável." },
    { id: "learning-2", category: "Aprendizado", text: "Prefiro compreender fundamentos antes de copiar soluções prontas." },
    { id: "learning-3", category: "Aprendizado", text: "Transformo erros em anotações ou ajustes de processo." },
    { id: "learning-4", category: "Aprendizado", text: "Consigo manter uma rotina de estudo mesmo sem recompensa imediata." },

    { id: "decision-1", category: "Decisão", text: "Antes de agir, considero impacto, reversibilidade e evidências disponíveis." },
    { id: "decision-2", category: "Decisão", text: "Sob pressão, separo fatos confirmados de hipóteses." },
    { id: "decision-3", category: "Decisão", text: "Evito decisões irreversíveis quando ainda faltam informações importantes." },
    { id: "decision-4", category: "Decisão", text: "Consigo mudar de posição quando novas evidências contradizem minha ideia inicial." }
  ];

  const nowIso = () => new Date().toISOString();

  function safeParse(key, fallback = null) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
    } catch {
      return fallback;
    }
  }

  function createSession() {
    const existing = safeParse(SESSION_KEY);
    if (existing?.id) return existing;

    const id = window.crypto?.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const session = { id, startedAt: nowIso() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  const session = createSession();
  const sessionStarted = Date.parse(session.startedAt) || Date.now();
  let eventCount = 0;
  let terminalTimer = null;

  function storageAvailable() {
    try {
      const key = "__cnx_storage_test__";
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function localRecordCount() {
    let count = 0;
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith("cnx_") || key?.startsWith("cybernexis_")) count += 1;
    }
    return count;
  }

  function getState() {
    return {
      observation: safeParse(OBS_KEY, {}),
      sentinel: safeParse(SENTINEL_KEY, {}),
      profile: safeParse(PROFILE_KEY, {}),
      flow: safeParse(FLOW_KEY, {})
    };
  }

  function formatDuration(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const hours = String(Math.floor(total / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const seconds = String(total % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  function addFeed(code, text) {
    const feed = $("#ops-live-feed");
    if (!feed) return;

    const now = new Date();
    const row = document.createElement("div");
    row.className = "ops-feed-row";
    row.innerHTML = `
      <span class="ops-feed-time">${now.toLocaleTimeString("pt-BR", { hour12: false })}</span>
      <span class="ops-feed-code">${code}</span>
      <span class="ops-feed-text"></span>
    `;
    row.querySelector(".ops-feed-text").textContent = text;
    feed.prepend(row);

    while (feed.children.length > 7) feed.lastElementChild.remove();

    eventCount += 1;
    const counter = $("#ops-feed-count");
    if (counter) counter.textContent = `${String(eventCount).padStart(2, "0")} EVENTOS`;
  }

  function securitySnapshot() {
    const state = getState();
    const checks = [
      { ok: storageAvailable(), label: "armazenamento local disponível" },
      { ok: window.isSecureContext || location.hostname === "localhost", label: "contexto seguro HTTPS/localhost" },
      { ok: state.observation?.status !== "em_andamento" || Number.isInteger(state.observation?.etapa), label: "estado da observação consistente" },
      { ok: state.sentinel?.status !== "negado", label: "Sentinel sem bloqueio definitivo" }
    ];

    const passed = checks.filter((item) => item.ok).length;
    const integrity = Math.round((passed / checks.length) * 100);

    let risk = "BAIXO";
    if (!checks[0].ok || (!window.isSecureContext && location.protocol !== "file:")) risk = "MÉDIO";
    if (state.sentinel?.status === "negado") risk = "ALTO";

    return { checks, integrity, risk };
  }

  function updateStats() {
    const snapshot = securitySnapshot();
    const active = $("#ops-active-nodes");
    const integrity = $("#ops-integrity-score");
    const records = $("#ops-packets");
    const risk = $("#ops-risk-level");
    const sync = $("#ops-last-sync");

    if (active) active.textContent = navigator.onLine ? "1" : "0";
    if (integrity) integrity.textContent = `${snapshot.integrity}%`;
    if (records) records.textContent = localRecordCount().toLocaleString("pt-BR");
    if (risk) risk.textContent = snapshot.risk;
    if (sync) sync.textContent = `sessão ${formatDuration(Date.now() - sessionStarted)}`;
  }

  function terminalLines() {
    const state = getState();
    const snapshot = securitySnapshot();

    return [
      ["> cnx-status --local --verified", ""],
      [`[${navigator.onLine ? "OK" : "AVISO"}] conexão do navegador: ${navigator.onLine ? "online" : "offline"}`, navigator.onLine ? "ok" : "warn"],
      [`[${storageAvailable() ? "OK" : "FALHA"}] armazenamento: ${storageAvailable() ? "disponível" : "indisponível"}`, storageAvailable() ? "ok" : "warn"],
      [`[INFO] contexto: ${window.isSecureContext ? "HTTPS seguro" : location.protocol}`, "dim"],
      [`[INFO] sessão local: ${session.id.slice(0, 12)}`, "dim"],
      [`[INFO] observação: ${state.observation?.status || "não iniciada"}`, ""],
      [`[INFO] Sentinel: ${state.sentinel?.status || "não iniciado"}`, ""],
      [`[INFO] perfil: ${state.profile?.status || "bloqueado"}`, ""],
      [`[${snapshot.risk === "BAIXO" ? "OK" : "AVISO"}] risco atual: ${snapshot.risk}`, snapshot.risk === "BAIXO" ? "ok" : "warn"]
    ];
  }

  function startTerminal() {
    const output = $("#ops-terminal-output");
    if (!output) return;

    window.clearTimeout(terminalTimer);
    output.innerHTML = "";

    const lines = terminalLines();
    let lineIndex = 0;
    let charIndex = 0;
    let paragraph = null;

    const type = () => {
      if (lineIndex >= lines.length) return;

      const [text, className] = lines[lineIndex];
      if (charIndex === 0) {
        paragraph = document.createElement("p");
        if (className) paragraph.className = className;
        output.appendChild(paragraph);
      }

      paragraph.textContent += text.charAt(charIndex);
      charIndex += 1;
      output.scrollTop = output.scrollHeight;

      if (charIndex < text.length) {
        terminalTimer = window.setTimeout(type, 12);
      } else {
        lineIndex += 1;
        charIndex = 0;
        terminalTimer = window.setTimeout(type, 90);
      }
    };

    type();
  }

  function missionData() {
    const state = getState();
    return [
      {
        id: "observation",
        tag: "ETAPA 01",
        title: "Teste de Observação",
        text: "Complete as nove rodadas sem erro para liberar o questionário.",
        done: state.observation?.status === "aprovado",
        action: () => $("#teste-observacao")?.scrollIntoView({ behavior: "smooth", block: "start" })
      },
      {
        id: "sentinel",
        tag: "ETAPA 02",
        title: "Protocolo Sentinel",
        text: "Conclua os três desafios de ética, lógica e segurança.",
        done: state.sentinel?.status === "aprovado",
        action: () => $("#protocolo-sentinel")?.scrollIntoView({ behavior: "smooth", block: "start" })
      },
      {
        id: "profile",
        tag: "ETAPA 03",
        title: "Perfil Comportamental",
        text: "Questionário não clínico com 20 afirmações sobre trabalho e responsabilidade.",
        done: state.profile?.status === "concluido",
        locked: state.observation?.status !== "aprovado",
        action: () => openAssessment()
      }
    ];
  }

  function renderMissions() {
    const list = $("#ops-mission-list");
    if (!list) return;

    const missions = missionData();
    list.innerHTML = "";

    missions.forEach((mission) => {
      const card = document.createElement("article");
      card.className = `ops-mission${mission.done ? " is-complete" : ""}${mission.locked ? " is-locked" : ""}`;
      card.innerHTML = `
        <div class="ops-mission-top">
          <span class="ops-mission-tag">${mission.tag}</span>
          <span class="ops-mission-xp">${mission.done ? "CONCLUÍDA" : mission.locked ? "BLOQUEADA" : "PENDENTE"}</span>
        </div>
        <h3>${mission.title}</h3>
        <p>${mission.text}</p>
        <button type="button" data-mission="${mission.id}" ${mission.done || mission.locked ? "disabled" : ""}>
          ${mission.done ? "CONCLUÍDA ✓" : mission.locked ? "AGUARDANDO ETAPA 01" : "ABRIR ETAPA"}
        </button>
      `;
      list.appendChild(card);
    });

    const count = missions.filter((mission) => mission.done).length;
    const completed = $("#ops-mission-completed");
    const progress = $("#ops-progress-bar");
    const message = $("#ops-mission-message");

    if (completed) completed.textContent = `${count}/${missions.length}`;
    if (progress) progress.style.width = `${(count / missions.length) * 100}%`;
    if (message) {
      message.textContent = count === missions.length
        ? "Triagem concluída. O pacote está pronto para revisão humana."
        : "O progresso é salvo automaticamente neste navegador.";
    }
  }

  function ensureAssessmentPanel() {
    let panel = $("#cnx-profile-assessment");
    if (panel) return panel;

    panel = document.createElement("article");
    panel.id = "cnx-profile-assessment";
    panel.className = "ops-panel cnx-assessment";
    panel.hidden = true;
    panel.innerHTML = `
      <header class="ops-panel-header">
        <div><span>◇</span> QUESTIONÁRIO DE PERFIL COMPORTAMENTAL</div>
        <span id="cnx-profile-progress">0/20</span>
      </header>
      <div class="cnx-assessment-body">
        <p class="cnx-assessment-note">
          Instrumento não clínico. Não diagnostica saúde mental e não toma decisões automáticas.
          As respostas servem apenas como material para revisão humana.
        </p>
        <div id="cnx-profile-content"></div>
      </div>
    `;

    $("#central-operacoes")?.appendChild(panel);
    return panel;
  }

  function initialProfileState() {
    return {
      version: 1,
      status: "em_andamento",
      current: 0,
      answers: {},
      startedAt: nowIso(),
      updatedAt: nowIso(),
      completedAt: null,
      scores: null
    };
  }

  function loadProfile() {
    const saved = safeParse(PROFILE_KEY);
    if (
      saved &&
      saved.version === 1 &&
      saved.answers &&
      Number.isInteger(saved.current)
    ) return saved;
    return initialProfileState();
  }

  function saveProfile(profile) {
    profile.updatedAt = nowIso();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  function scoreProfile(profile) {
    const groups = {};
    questions.forEach((question) => {
      const value = Number(profile.answers[question.id]);
      if (!Number.isFinite(value)) return;
      groups[question.category] ||= [];
      groups[question.category].push(value);
    });

    const scores = {};
    Object.entries(groups).forEach(([category, values]) => {
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      scores[category] = Math.round(((average - 1) / 4) * 100);
    });
    return scores;
  }

  function syncProfileToFlow(profile) {
    const flow = safeParse(FLOW_KEY, {}) || {};
    flow.version = 1;
    flow.submissionId = flow.submissionId || session.id;
    flow.perfil = {
      status: profile.status,
      respostas: questions.map((question) => ({
        id: question.id,
        categoria: question.category,
        afirmacao: question.text,
        valor: Number(profile.answers[question.id] || 0)
      })),
      pontuacoes: profile.scores,
      iniciadoEm: profile.startedAt,
      concluidoEm: profile.completedAt,
      atualizadoEm: profile.updatedAt,
      aviso: "Questionário não clínico; interpretação exclusivamente humana."
    };
    flow.status = profile.status === "concluido"
      ? "pronto_para_analise"
      : "aguardando_questionario";
    flow.atualizadoEm = nowIso();
    localStorage.setItem(FLOW_KEY, JSON.stringify(flow));
  }

  function renderProfileQuestion() {
    const panel = ensureAssessmentPanel();
    const content = $("#cnx-profile-content");
    const progress = $("#cnx-profile-progress");
    if (!content || !progress) return;

    const profile = loadProfile();

    if (profile.status === "concluido") {
      const scoreCards = Object.entries(profile.scores || {})
        .map(([category, score]) => `
          <div class="cnx-score-card">
            <span>${category}</span>
            <strong>${score}%</strong>
          </div>
        `)
        .join("");

      progress.textContent = "20/20";
      content.innerHTML = `
        <div class="cnx-assessment-result">
          <h3>Questionário concluído</h3>
          <p>As respostas foram anexadas ao pacote de recrutamento para revisão humana.</p>
          <div class="cnx-score-grid">${scoreCards}</div>
          <button id="cnx-open-review" type="button">ABRIR PÁGINA DE ANÁLISE</button>
        </div>
      `;
      $("#cnx-open-review")?.addEventListener("click", () => {
        window.location.href = "pagina-secreta.html?recrutamento=1&source=perfil";
      });
      return;
    }

    const index = Math.min(profile.current, questions.length - 1);
    const question = questions[index];
    const selected = Number(profile.answers[question.id] || 0);

    progress.textContent = `${index + 1}/${questions.length}`;
    content.innerHTML = `
      <div class="cnx-question-card">
        <span class="cnx-question-category">${question.category}</span>
        <h3>${question.text}</h3>
        <p>Escolha de 1 a 5: discordo totalmente → concordo totalmente.</p>
        <div class="cnx-likert" role="group" aria-label="Escala de resposta">
          ${[1, 2, 3, 4, 5].map((value) => `
            <button type="button" data-value="${value}" class="${selected === value ? "is-selected" : ""}">
              <strong>${value}</strong>
              <span>${value === 1 ? "Discordo" : value === 5 ? "Concordo" : "Intermediário"}</span>
            </button>
          `).join("")}
        </div>
        <div class="cnx-assessment-actions">
          <button id="cnx-profile-prev" type="button" ${index === 0 ? "disabled" : ""}>VOLTAR</button>
          <button id="cnx-profile-next" type="button" ${selected ? "" : "disabled"}>
            ${index === questions.length - 1 ? "CONCLUIR E ENVIAR" : "PRÓXIMA"}
          </button>
        </div>
      </div>
    `;

    content.querySelectorAll("[data-value]").forEach((button) => {
      button.addEventListener("click", () => {
        profile.answers[question.id] = Number(button.dataset.value);
        saveProfile(profile);
        renderProfileQuestion();
      });
    });

    $("#cnx-profile-prev")?.addEventListener("click", () => {
      profile.current = Math.max(0, index - 1);
      saveProfile(profile);
      renderProfileQuestion();
    });

    $("#cnx-profile-next")?.addEventListener("click", () => {
      if (!profile.answers[question.id]) return;

      if (index < questions.length - 1) {
        profile.current = index + 1;
        saveProfile(profile);
        renderProfileQuestion();
        return;
      }

      const allAnswered = questions.every((item) => Number(profile.answers[item.id]) >= 1);
      if (!allAnswered) return;

      profile.status = "concluido";
      profile.current = questions.length;
      profile.completedAt = nowIso();
      profile.scores = scoreProfile(profile);
      saveProfile(profile);
      syncProfileToFlow(profile);

      addFeed("PF-20", "Questionário de perfil concluído e anexado à triagem.");
      renderProfileQuestion();
      renderMissions();
      updateStats();
      startTerminal();

      window.setTimeout(() => {
        window.location.href = "pagina-secreta.html?recrutamento=1&source=perfil";
      }, 900);
    });
  }

  function unlockAssessment() {
    const state = getState();
    if (state.observation?.status !== "aprovado") return false;

    const panel = ensureAssessmentPanel();
    panel.hidden = false;
    renderProfileQuestion();
    renderMissions();
    return true;
  }

  function openAssessment() {
    if (!unlockAssessment()) {
      addFeed("PF-00", "Questionário bloqueado: Teste de Observação ainda não aprovado.");
      $("#teste-observacao")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    $("#cnx-profile-assessment")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function refreshSystemData(reason = "Atualização de estado registrada.") {
    updateStats();
    renderMissions();
    startTerminal();

    const state = getState();
    if (state.observation?.status === "aprovado") unlockAssessment();
    addFeed("EV-01", reason);
  }

  function bindEvents() {
    $("#ops-mission-list")?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-mission]");
      if (!button) return;
      const mission = missionData().find((item) => item.id === button.dataset.mission);
      mission?.action();
    });

    $("#ops-terminal-restart")?.addEventListener("click", startTerminal);

    window.addEventListener("online", () => refreshSystemData("Conexão do navegador restaurada."));
    window.addEventListener("offline", () => refreshSystemData("Navegador ficou offline."));

    document.addEventListener("cnx:observation-updated", () => {
      refreshSystemData("Resultado do Teste de Observação atualizado.");
    });

    document.addEventListener("cnx:sentinel-updated", () => {
      refreshSystemData("Estado do Protocolo Sentinel atualizado.");
    });
  }

  function init() {
    ensureAssessmentPanel();
    updateStats();
    renderMissions();
    startTerminal();
    bindEvents();

    const date = $("#ops-mission-date");
    if (date) {
      date.textContent = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date()).toUpperCase();
    }

    addFeed("SYS", "Painel conectado aos estados reais deste navegador.");
    addFeed("NET", navigator.onLine ? "Conexão online detectada." : "Sessão offline detectada.");
    addFeed("SEC", window.isSecureContext ? "Contexto HTTPS confirmado." : `Contexto atual: ${location.protocol}`);
    addFeed("OBS", `Observação: ${getState().observation?.status || "não iniciada"}.`);
    addFeed("SNT", `Sentinel: ${getState().sentinel?.status || "não iniciado"}.`);

    if (getState().observation?.status === "aprovado") unlockAssessment();

    window.setInterval(updateStats, 1000);
  }

  window.CNXRecruitment = {
    unlockAssessment,
    openAssessment,
    refreshSystemData
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
