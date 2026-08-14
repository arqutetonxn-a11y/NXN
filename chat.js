/* =====================================================
   ✅ REFERÊNCIAS DO FIREBASE (VINDO DE firebase.js)
=====================================================*/
let db;
let col;
let addDB;
let q;
let ord;
let listen;
let observeAuth;

/* =====================================================
   ✅ VARIÁVEIS GLOBAIS
=====================================================*/
let currentRoom = "publica";
let roomPassword = "";
let secretKey = null;
let userID = null;
let unsubscribe = null;
let listenersConfigured = false;

/* =====================================================
   ✅ ELEMENTOS HTML
=====================================================*/
let messagesEl;
let msgInput;
let codinomeEl;
let avatarSel;
let sendPublicBtn;
let sendSecretBtn;
let attachBtn;
let fileInput;
let themeSelect;
let lastAction;
let convoCountEl;
let peopleCountEl;
let roomTag;
let roomPassEl;
let enterRoomBtn;

/* =====================================================
   ✅ INICIALIZAÇÃO SEGURA
=====================================================*/
document.addEventListener("DOMContentLoaded", initializeSystem);

async function initializeSystem() {
  try {
    await waitForFirebaseBridge();

    db = window.firebaseDB;
    col = window.firebaseCollection;
    addDB = window.firebaseAddDoc;
    q = window.firebaseQuery;
    ord = window.firebaseOrderBy;
    listen = window.firebaseOnSnapshot;
    observeAuth = window.firebaseOnAuthStateChanged;

    mapElements();

    if (!validateRequiredElements()) {
      return;
    }

    observeAuth(window.firebaseAuth, async (user) => {
      if (!user) return;

      userID = user.uid;
      await initChat();
    });
  } catch (error) {
    console.error("Não foi possível iniciar o chat:", error);
    alert("Não foi possível conectar o chat ao Firebase.");
  }
}

async function waitForFirebaseBridge() {
  const startedAt = Date.now();

  while (!window.firebaseReady) {
    if (Date.now() - startedAt > 10000) {
      throw new Error("firebase.js não foi carregado antes de chat.js.");
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }

  await window.firebaseReady;
}

function mapElements() {
  messagesEl = document.getElementById("messages");
  msgInput = document.getElementById("msg-input");
  codinomeEl = document.getElementById("codinome");
  avatarSel = document.getElementById("avatar-select");

  sendPublicBtn = document.getElementById("send-public");
  sendSecretBtn = document.getElementById("send-secret");
  attachBtn = document.getElementById("attach-btn");
  fileInput = document.getElementById("file-input");

  themeSelect = document.getElementById("theme");
  lastAction = document.getElementById("last-action");
  convoCountEl = document.getElementById("convo-count");
  peopleCountEl = document.getElementById("people-count");
  roomTag = document.getElementById("room-tag");

  roomPassEl = document.getElementById("room-pass");
  enterRoomBtn = document.getElementById("enter-room");
}

function validateRequiredElements() {
  const required = {
    messages: messagesEl,
    "msg-input": msgInput,
    codinome: codinomeEl,
    "avatar-select": avatarSel,
    "send-public": sendPublicBtn,
    "send-secret": sendSecretBtn,
    "attach-btn": attachBtn,
    "file-input": fileInput,
    theme: themeSelect,
    "convo-count": convoCountEl,
    "people-count": peopleCountEl,
    "room-tag": roomTag,
    "room-pass": roomPassEl,
    "enter-room": enterRoomBtn
  };

  const missing = Object.entries(required)
    .filter(([, element]) => !element)
    .map(([id]) => `#${id}`);

  if (missing.length) {
    console.error("Elementos ausentes no HTML do chat:", missing.join(", "));
    return false;
  }

  return true;
}

/* =====================================================
   ✅ INICIAR SISTEMA DE CHAT
=====================================================*/
async function initChat() {
  await generateKey("default");
  startRoom("publica");
  setupListeners();
}

/* =====================================================
   ✅ TROCAR ENTRE SALA PÚBLICA E PRIVADA
=====================================================*/
async function changeRoom() {
  const pass = roomPassEl.value.trim();

  try {
    if (pass.length === 0) {
      currentRoom = "publica";
      roomPassword = "";
      roomTag.textContent = "Sala: pública";
      await generateKey("default");
      startRoom("publica");
      return;
    }

    roomPassword = pass;
    currentRoom = "privada-" + encodeURIComponent(pass);
    roomTag.textContent = "Sala privada";

    await generateKey(pass);
    startRoom(currentRoom);
  } catch (error) {
    console.error("Erro ao trocar de sala:", error);
    alert("Não foi possível entrar nesta sala.");
  }
}

/* =====================================================
   ✅ INICIAR OUVIDOR DA SALA
=====================================================*/
function startRoom(roomName) {
  if (unsubscribe) unsubscribe();

  messagesEl.replaceChildren();

  const ref = col(db, "salas", roomName, "mensagens");
  const queryRoom = q(ref, ord("timestamp"));

  unsubscribe = listen(
    queryRoom,
    snap => {
      snap.docChanges().forEach(change => {
        if (change.type === "added") {
          renderMessage(change.doc.data());
        }
      });

      convoCountEl.textContent = "Conversas: " + snap.size;
    },
    error => {
      console.error("Erro ao acompanhar mensagens:", error);
      registerAction("Falha ao carregar mensagens");
    }
  );

  peopleCountEl.textContent = "Pessoas: ~1";
}

/* =====================================================
   ✅ LISTENERS DE BOTÕES
=====================================================*/
function setupListeners() {
  if (listenersConfigured) return;
  listenersConfigured = true;

  sendPublicBtn.addEventListener("click", () => trySend(false));
  sendSecretBtn.addEventListener("click", () => trySend(true));
  enterRoomBtn.addEventListener("click", changeRoom);

  msgInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      trySend(false);
    }
  });

  attachBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", handleImageUpload);

  themeSelect.addEventListener("change", () => {
    document.body.setAttribute("data-theme", themeSelect.value);
  });
}

/* =====================================================
   ✅ ENVIAR MENSAGEM (PÚBLICA OU SECRETA)
=====================================================*/
async function trySend(isSecret) {
  const text = msgInput.value.trim();
  if (!text) return;

  if (!userID || !secretKey) {
    alert("Aguarde a conexão do chat.");
    return;
  }

  const codinome = codinomeEl.value.trim() || "Anônimo";
  const avatar = avatarSel.value;

  try {
    sendPublicBtn.disabled = true;
    sendSecretBtn.disabled = true;

    const encrypted = await encryptText(text);

    await addDB(col(db, "salas", currentRoom, "mensagens"), {
      uid: userID,
      codinome,
      avatar,
      text: encrypted,
      secret: isSecret,
      type: "text",
      timestamp: Date.now()
    });

    msgInput.value = "";
    playUserSound();
    registerAction("Enviou uma mensagem");

    await botAutoResponse(text, isSecret, codinome);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    alert("Não foi possível enviar a mensagem.");
  } finally {
    sendPublicBtn.disabled = false;
    sendSecretBtn.disabled = false;
    msgInput.focus();
  }
}

/* =====================================================
   ✅ ENVIO DE IMAGENS
=====================================================*/
async function handleImageUpload() {
  const file = fileInput.files[0];
  if (!file) return;

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

  if (!allowedTypes.has(file.type)) {
    alert("Use somente imagens JPG, PNG, WebP ou GIF.");
    fileInput.value = "";
    return;
  }

  // O arquivo é salvo dentro de um documento Firestore em Base64.
  // O limite menor evita ultrapassar o tamanho máximo do documento.
  if (file.size > 400 * 1024) {
    alert("Máximo permitido nesta versão do chat: 400 KB.");
    fileInput.value = "";
    return;
  }

  if (!userID || !secretKey) {
    alert("Aguarde a conexão do chat.");
    fileInput.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const base64 = String(reader.result || "");
      const encrypted = await encryptText(base64);
      const codinome = codinomeEl.value.trim() || "Anônimo";
      const avatar = avatarSel.value;

      await addDB(col(db, "salas", currentRoom, "mensagens"), {
        uid: userID,
        codinome,
        avatar,
        text: encrypted,
        secret: true,
        type: "img",
        timestamp: Date.now()
      });

      playUserSound();
      registerAction("Enviou uma imagem");
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      alert("Não foi possível enviar a imagem.");
    } finally {
      fileInput.value = "";
    }
  };

  reader.onerror = () => {
    alert("Não foi possível ler a imagem selecionada.");
    fileInput.value = "";
  };

  reader.readAsDataURL(file);
}

/* =====================================================
   ✅ CRIPTOGRAFIA AES-GCM
=====================================================*/
async function generateKey(pass) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(pass));

  secretKey = await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptText(text) {
  if (!secretKey) {
    throw new Error("Chave de criptografia ainda não foi criada.");
  }

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(text);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    secretKey,
    data
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return bytesToBase64(combined);
}

async function decryptText(encoded) {
  try {
    if (!secretKey) {
      throw new Error("Chave indisponível.");
    }

    const bytes = base64ToBytes(encoded);
    const iv = bytes.slice(0, 12);
    const content = bytes.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      secretKey,
      content
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.warn("Falha ao descriptografar mensagem:", error);
    return "[Falha ao descriptografar]";
  }
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function base64ToBytes(encoded) {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

/* =====================================================
   ✅ RENDERIZAÇÃO DAS MENSAGENS
=====================================================*/
async function renderMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("msg", msg.uid === "BOT" ? "bot" : "user");

  if (msg.secret) div.classList.add("secret");

  const avatarContainer = document.createElement("div");
  avatarContainer.className = "avatar";

  const avatarImage = document.createElement("img");
  avatarImage.src = getAvatar(msg.avatar);
  avatarImage.alt = "";
  avatarContainer.appendChild(avatarImage);

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = String(msg.codinome || "Anônimo");
  bubble.appendChild(meta);

  const text = await decryptText(msg.text);

  if (msg.type === "img" && text.startsWith("data:image/")) {
    const image = document.createElement("img");
    image.src = text;
    image.className = "img-msg";
    image.alt = "Imagem enviada no chat";
    bubble.appendChild(image);
  } else {
    const textElement = document.createElement("div");
    textElement.className = "text";
    textElement.textContent = text;
    bubble.appendChild(textElement);
  }

  div.append(avatarContainer, bubble);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/* =====================================================
   ✅ AVATARES
=====================================================*/
function getAvatar(code) {
  switch (code) {
    case "hacker1": return "https://i.imgur.com/Qf6bH4y.png";
    case "hacker2": return "https://i.imgur.com/ZmZx0sU.png";
    case "hood": return "https://i.imgur.com/n36UodL.png";
    default: return "https://i.imgur.com/8Qf2QYK.png";
  }
}

/* =====================================================
   ✅ BOT AGENTE-X
=====================================================*/
async function botAutoResponse(text, isSecret, codinome) {
  let resp = "Mensagem recebida.";
  const normalizedText = text.toLowerCase();

  if (normalizedText.includes("oi") || normalizedText.includes("ola")) {
    resp = "Saudações, agente.";
  } else if (normalizedText.includes("ajuda")) {
    resp = "Envie o código da missão.";
  } else if (normalizedText.includes("missão")) {
    resp = "Processando sua solicitação...";
  } else if (normalizedText.includes("quem sou eu")) {
    resp = `Você é ${codinome}.`;
  }

  const encrypted = await encryptText(resp);

  await addDB(col(db, "salas", currentRoom, "mensagens"), {
    uid: "BOT",
    codinome: "Agente-X",
    avatar: "hacker2",
    text: encrypted,
    secret: isSecret,
    type: "text",
    timestamp: Date.now()
  });

  playBotSound();
}

/* =====================================================
   ✅ LOG DE AÇÃO
=====================================================*/
function registerAction(action) {
  if (!lastAction) return;

  lastAction.textContent =
    action + " (" + new Date().toLocaleTimeString() + ")";
}

/* =====================================================
   ✅ EXPORTAR CONVERSAS
=====================================================*/
window.exportPublic = () => exportChat(false);
window.exportSecret = () => exportChat(true);

function exportChat(isSecret) {
  if (!messagesEl) return;

  const lines = [];

  messagesEl.querySelectorAll(".msg").forEach(element => {
    if (isSecret && !element.classList.contains("secret")) return;
    lines.push(element.innerText.replace(/\n+/g, " "));
  });

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = isSecret ? "chat_secreto.txt" : "chat_publico.txt";
  anchor.click();

  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/* =====================================================
   ✅ SONS
=====================================================*/
function playUserSound() {
  playSound("snd-user", "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
}

function playBotSound() {
  playSound("snd-bot", "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
}

function playSound(elementId, source) {
  const sound = document.getElementById(elementId);
  if (!sound) return;

  sound.src = source;
  sound.play().catch(() => {
    // Navegadores podem bloquear reprodução automática.
  });
}
