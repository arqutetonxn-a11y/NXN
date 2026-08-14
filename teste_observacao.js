/* =====================================================
   CYBER-NEXIS — TESTE DE OBSERVAÇÃO V5 PERSISTENTE
   Arquivo correto: teste_observacao.js

   Este arquivo é SOMENTE do Teste de Observação.
   Não misture com protocolo_sentinel.js.

   Fluxo:
   O progresso é salvo a cada resposta.
   Ao concluir sem erros, o questionário de perfil é liberado
   e o pacote segue para pagina-secreta.html.
   ===================================================== */

(() => {
  const OBS_SCRIPT_FLAG = "__TESTE_OBSERVACAO_CARREGADO__";

  if (window[OBS_SCRIPT_FLAG]) {
    console.warn("Teste de Observação já foi carregado. Execução duplicada bloqueada.");
    return;
  }

  window[OBS_SCRIPT_FLAG] = true;

  document.addEventListener("DOMContentLoaded", () => {
    const jogo = document.getElementById("teste-observacao");

    if (!jogo) {
      console.info("Teste de Observação não encontrado nesta página.");
      return;
    }

    /* =====================================================
       ELEMENTOS PRINCIPAIS DO HTML
    ===================================================== */
    const pergunta = document.getElementById("pergunta-mini-jogo");
    const imagem = document.getElementById("imagem-mini-jogo");
    const opcoes = document.getElementById("opcoes-mini-jogo");
    const feedback = document.getElementById("feedback-mini-jogo");
    const progresso = document.getElementById("progresso-mini-jogo");

    /* =====================================================
       ELEMENTOS EXTRAS DO DESIGN
    ===================================================== */
    const canvas = document.getElementById("obs-matrix");
    const clock = document.getElementById("obs-clock");
    const roundTag = document.getElementById("obs-round-tag");
    const integrity = document.getElementById("obs-integrity");
    const acessoOculto = document.getElementById("acesso-oculto");

    if (!pergunta || !imagem || !opcoes || !feedback || !progresso) {
      console.error("Erro: existem elementos essenciais do Teste de Observação faltando no HTML.");
      return;
    }

    const SECRET_PAGE = "pagina-secreta.html";
    const chars = "01NEXISUMBRAREDOBSERVACAOSENTINELCNX7ROOTN404PORTAL";

    /* =====================================================
       HELPERS
    ===================================================== */
    function svgToData(svg) {
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.trim());
    }

    function escaparSvgTexto(texto = "") {
      return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function normalizar(texto = "") {
      return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s:-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    function embaralhar(lista) {
      const copia = [...lista];

      for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
      }

      return copia;
    }

    function gerarFundoBinario() {
      const linhas = [];

      for (let y = 0; y < 22; y++) {
        let texto = "";

        for (let x = 0; x < 54; x++) {
          texto += Math.random() > 0.5 ? "1 " : "0 ";
        }

        linhas.push(`<text x="48" y="${40 + y * 21}" class="noise">${texto}</text>`);
      }

      return linhas.join("");
    }

    function molduraSvg(conteudo, legenda = "", extra = "") {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
          <rect width="900" height="520" fill="#020000"/>

          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <style>
            .frame {
              fill: none;
              stroke: #ff1535;
              stroke-width: 2;
              stroke-opacity: .45;
              filter: url(#softGlow);
            }

            .corner {
              stroke: #ff1535;
              stroke-width: 3;
              stroke-opacity: .75;
              fill: none;
            }

            .noise {
              font: 15px monospace;
              fill: #690013;
              opacity: .55;
            }

            .dim {
              fill: #ff4b5f;
              opacity: .42;
            }

            .hot {
              fill: #ff1535;
              filter: url(#glow);
            }

            .green {
              fill: #00ff88;
              filter: url(#glow);
            }

            .label {
              font: 18px monospace;
              fill: #ff4b5f;
              letter-spacing: 2px;
            }

            .small {
              font: 14px monospace;
              fill: #ff4b5f;
              opacity: .72;
              letter-spacing: 1px;
            }

            .big {
              font: 66px monospace;
              fill: #ff1535;
              filter: url(#glow);
              letter-spacing: 5px;
            }

            ${extra}
          </style>

          ${gerarFundoBinario()}

          <path class="frame" d="M42 40 H858 V480 H42 Z"/>
          <path class="corner" d="M42 96 V40 H104"/>
          <path class="corner" d="M858 96 V40 H796"/>
          <path class="corner" d="M42 424 V480 H104"/>
          <path class="corner" d="M858 424 V480 H796"/>

          ${conteudo}

          ${
            legenda
              ? `<text x="450" y="474" text-anchor="middle" class="label">${escaparSvgTexto(legenda)}</text>`
              : ""
          }
        </svg>
      `;
    }

    /* =====================================================
       GERADORES DE IMAGENS DAS FASES
    ===================================================== */
    function gerarSvgRuidoPalavra(palavra, legenda, seed = 1) {
      const camadas = Array.from({ length: 18 }, (_, y) => {
        const texto = Array.from({ length: 34 }, (_, x) => {
          return (x + y + seed) % 4 === 0 ? "N" : (x * y + seed) % 3 === 0 ? "1" : "0";
        }).join(" ");

        return `<text x="58" y="${62 + y * 21}" class="noise">${texto}</text>`;
      }).join("");

      const conteudo = `
        ${camadas}
        <rect x="110" y="160" width="680" height="190" fill="#080000" opacity=".38" stroke="#ff1535" stroke-opacity=".25"/>
        <text x="450" y="288" text-anchor="middle" class="big">${escaparSvgTexto(palavra)}</text>
        <text x="450" y="330" text-anchor="middle" class="small">assinatura parcialmente corrompida</text>
      `;

      return svgToData(molduraSvg(conteudo, legenda));
    }

    function gerarSvgNosIsolados() {
      const nodes = [
        [130, 180], [240, 110], [340, 210], [450, 140],
        [560, 230], [690, 170], [210, 330], [380, 370],
        [530, 345], [710, 320]
      ];

      const linhas = [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
        [0, 6], [6, 7], [7, 8], [8, 9], [5, 9],
        [2, 7], [3, 8], [1, 3], [4, 8]
      ].map(([a, b]) => {
        const n1 = nodes[a];
        const n2 = nodes[b];
        return `<line x1="${n1[0]}" y1="${n1[1]}" x2="${n2[0]}" y2="${n2[1]}" class="line"/>`;
      }).join("");

      const pontos = nodes.map(([x, y]) => {
        return `<circle cx="${x}" cy="${y}" r="19" class="node"/><circle cx="${x}" cy="${y}" r="6" class="hot"/>`;
      }).join("");

      const conteudo = `
        <style>
          .line {
            stroke: #ff1535;
            stroke-width: 2;
            stroke-opacity: .55;
          }

          .node {
            fill: #100004;
            stroke: #ff1535;
            stroke-width: 2;
            opacity: .88;
          }

          .isolado {
            fill: #ff1535;
            stroke: #ffffff;
            stroke-width: 2;
            filter: url(#glow);
          }
        </style>

        ${linhas}
        ${pontos}

        <circle cx="790" cy="98" r="18" class="isolado"/>
        <circle cx="790" cy="98" r="32" fill="none" stroke="#ff1535" stroke-opacity=".42"/>
        <text x="92" y="444" class="small">// anomalia: um nó não participa da malha //</text>
      `;

      return svgToData(molduraSvg(conteudo, "malha operacional"));
    }

    function gerarSvgTerminalCodigo() {
      const linhas = [
        "00:13:47 [SYS]  inicializando matriz de observação...",
        "00:13:48 [NET]  uplink com node-17 estabelecido",
        "00:13:49 [SCAN] varredura profunda iniciada",
        "00:13:52 [SCAN] setor 9F-3C: sem anomalias",
        "00:13:56 [DATA] pacote recebido: integridade nominal",
        "00:14:02 [SCAN] assinatura térmica: falso positivo",
        "00:14:08 [ALERT] micro-vazio: falso positivo",
        "00:14:15 [SCAN] deriva espectral dentro da tolerância",
        "00:14:21 [DATA] catálogo atualizado: 1287 entradas",
        "00:14:28 [SCAN] artefato gravitacional: falso positivo",
        "00:14:34 [OPS]  calibração completa. código operacional: CNX-7",
        "00:14:41 [SCAN] pulso EM detectado: falso positivo",
        "00:14:47 [SYS]  diagnóstico: sistemas nominais",
        "00:15:07 [SCAN] eco temporal: falso positivo"
      ];

      const log = linhas.map((linha, i) => {
        const hot = linha.includes("CNX-7");
        return `
          <text x="74" y="${82 + i * 29}" class="${hot ? "terminal hotline" : "terminal"}">
            ${escaparSvgTexto(linha)}
          </text>
        `;
      }).join("");

      const conteudo = `
        <style>
          .terminal {
            font: 22px monospace;
            fill: #ff4b5f;
            opacity: .48;
          }

          .hotline {
            fill: #00ff88;
            opacity: 1;
            filter: url(#glow);
          }
        </style>

        <rect x="58" y="58" width="784" height="402" fill="#050000" opacity=".52" stroke="#ff1535" stroke-opacity=".22"/>
        ${log}
      `;

      return svgToData(molduraSvg(conteudo, "terminal de rastreio"));
    }

    function gerarSvgBinarioUmbra() {
      const rows = [
        "01010010 01000101 01000100 00101101 00110000",
        "01010010 01001111 01001111 01010100 00101101",
        "01010101 01001101 01000010 01010010 01000001",
        "01001110 01000101 01011000 01001001 01010011",
        "01001100 01001111 01000111 00101101 00110011"
      ];

      const textos = rows.map((row) => {
        const hot = row.startsWith("01010101");
        const y = 134 + rows.indexOf(row) * 56;

        return `
          <text x="82" y="${y}" class="${hot ? "binary hotline" : "binary"}">
            ${row}
          </text>
        `;
      }).join("");

      const conteudo = `
        <style>
          .binary {
            font: 28px monospace;
            fill: #ff4b5f;
            opacity: .46;
          }

          .hotline {
            fill: #00ff88;
            opacity: .95;
            filter: url(#glow);
          }
        </style>

        <text x="82" y="88" class="small">decodifique a linha desalinhada</text>
        ${textos}
      `;

      return svgToData(molduraSvg(conteudo, "binário desalinhado"));
    }

    function gerarSvgCoordenada() {
      const pontos = [
        [150, 140, "12:08"], [260, 210, "19:44"], [370, 155, "22:10"],
        [490, 265, "31:09"], [620, 178, "44:18"], [730, 320, "60:02"]
      ];

      const linhas = pontos.map(([x, y, label]) => `
        <circle cx="${x}" cy="${y}" r="15" fill="#100004" stroke="#ff1535" stroke-opacity=".75"/>
        <text x="${x + 24}" y="${y + 6}" class="small">${label}</text>
      `).join("");

      const conteudo = `
        <style>
          .broken {
            font: 34px monospace;
            fill: #00ff88;
            filter: url(#glow);
          }
        </style>

        <path d="M120 390 H780" stroke="#ff1535" stroke-opacity=".18"/>
        <path d="M120 90 V420" stroke="#ff1535" stroke-opacity=".18"/>
        ${linhas}

        <rect x="490" y="352" width="230" height="48" fill="#080000" stroke="#00ff88" stroke-opacity=".5"/>
        <text x="508" y="386" class="broken">X:47 Y:13</text>
        <text x="92" y="448" class="small">// a coordenada real não está ligada aos pontos //</text>
      `;

      return svgToData(molduraSvg(conteudo, "coordenada fantasma"));
    }

    function gerarSvgHashRed9() {
      const rows = [
        "R3D-O  | RED-0 | RFD-9 | R3D-9",
        "RED-6  | REO-9 | RED-8 | R3D-8",
        "RFD-0  | RED-9 | RE0-9 | RED-O",
        "ROOT-0 | R3D-6 | RED-3 | REO-8"
      ];

      const textos = rows.map((row, i) => {
        const y = 150 + i * 62;
        return `<text x="98" y="${y}" class="hash">${escaparSvgTexto(row)}</text>`;
      }).join("");

      const conteudo = `
        <style>
          .hash {
            font: 32px monospace;
            fill: #ff4b5f;
            opacity: .62;
            letter-spacing: 2px;
          }
        </style>

        <text x="98" y="92" class="small">um token usa letra, não número falso</text>
        ${textos}
        <path d="M238 258 H355" stroke="#00ff88" stroke-width="3" stroke-opacity=".75" filter="url(#glow)"/>
      `;

      return svgToData(molduraSvg(conteudo, "tokens contaminados"));
    }

    function gerarSvgEspelhoPortal() {
      const conteudo = `
        <style>
          .mirror {
            font: 74px monospace;
            fill: #ff1535;
            filter: url(#glow);
            letter-spacing: 10px;
          }

          .ghost {
            font: 34px monospace;
            fill: #ff4b5f;
            opacity: .35;
          }
        </style>

        <text x="450" y="210" text-anchor="middle" class="ghost">LATROP</text>
        <text x="450" y="298" text-anchor="middle" class="mirror" transform="scale(-1,1) translate(-900,0)">LATROP</text>
        <text x="450" y="360" text-anchor="middle" class="small">a palavra correta aparece no reflexo</text>
      `;

      return svgToData(molduraSvg(conteudo, "espelho de acesso"));
    }

    function gerarSvgTimeline() {
      const linhas = [
        ["00:11:02", "scan aberto"],
        ["00:11:18", "pacote recebido"],
        ["00:11:31", "rota confirmada"],
        ["00:10:59", "evento fora da sequência"],
        ["00:11:44", "sinal validado"],
        ["00:12:03", "camada estável"]
      ];

      const textos = linhas.map(([hora, msg], i) => {
        const hot = hora === "00:10:59";

        return `
          <text x="130" y="${116 + i * 52}" class="${hot ? "timeline hot" : "timeline"}">
            ${hora}  ::  ${escaparSvgTexto(msg)}
          </text>
        `;
      }).join("");

      const conteudo = `
        <style>
          .timeline {
            font: 30px monospace;
            fill: #ff4b5f;
            opacity: .52;
          }

          .hot {
            fill: #00ff88;
            opacity: 1;
            filter: url(#glow);
          }
        </style>

        <text x="130" y="68" class="small">a anomalia não está no texto. está no tempo.</text>
        ${textos}
      `;

      return svgToData(molduraSvg(conteudo, "linha temporal"));
    }

    function gerarSvgFragmentos() {
      const conteudo = `
        <style>
          .frag {
            font: 34px monospace;
            fill: #ff4b5f;
            opacity: .58;
          }

          .prime {
            font: 42px monospace;
            fill: #00ff88;
            filter: url(#glow);
          }
        </style>

        <text x="120" y="120" class="frag">A1-RED</text>
        <text x="520" y="122" class="frag">B7-NEX</text>
        <text x="290" y="230" class="prime">K9-UMBRA</text>
        <text x="620" y="310" class="frag">N4-VOID</text>
        <text x="150" y="368" class="frag">R0-ROOT</text>

        <path d="M280 238 H500" stroke="#00ff88" stroke-width="2" stroke-opacity=".72"/>
        <text x="110" y="448" class="small">// só um fragmento carrega a assinatura de sombra //</text>
      `;

      return svgToData(molduraSvg(conteudo, "fragmentos de camada"));
    }

    /* =====================================================
       BANCO DE DESAFIOS
    ===================================================== */
    const desafios = [
      {
        codigo: "N0-01",
        pergunta: "No ruído visual, qual palavra aparece como assinatura do sistema?",
        correta: "NEXIS",
        opcoes: ["UMBRA", "NEXIS", "ROOT", "FALHA"],
        svg: gerarSvgRuidoPalavra("NEXIS", "fragmento principal", 1)
      },
      {
        codigo: "N0-02",
        pergunta: "Entre os nós do mapa, qual elemento foge do padrão?",
        correta: "NÓ ISOLADO",
        opcoes: ["NÓ CENTRAL", "LINHA DUPLA", "NÓ ISOLADO", "MALHA FECHADA"],
        svg: gerarSvgNosIsolados()
      },
      {
        codigo: "N0-03",
        pergunta: "Qual código operacional aparece escondido no terminal?",
        correta: "CNX-7",
        opcoes: ["CNX-7", "N4-404", "ROOT-0", "RED-13"],
        svg: gerarSvgTerminalCodigo()
      },
      {
        codigo: "N1-04",
        pergunta: "A linha binária desalinhada forma qual palavra?",
        correta: "UMBRA",
        opcoes: ["NEXIS", "UMBRA", "SENTINEL", "PORTAL"],
        svg: gerarSvgBinarioUmbra()
      },
      {
        codigo: "N1-05",
        pergunta: "Qual coordenada fantasma aparece fora da malha?",
        correta: "X:47 Y:13",
        opcoes: ["X:31 Y:09", "X:60 Y:02", "X:47 Y:13", "X:12 Y:08"],
        svg: gerarSvgCoordenada()
      },
      {
        codigo: "N2-06",
        pergunta: "Entre tokens contaminados, qual é o token legítimo?",
        correta: "RED-9",
        opcoes: ["R3D-9", "RE0-9", "RED-O", "RED-9"],
        svg: gerarSvgHashRed9()
      },
      {
        codigo: "N2-07",
        pergunta: "No reflexo, qual palavra aparece corretamente?",
        correta: "PORTAL",
        opcoes: ["LATROP", "PORTAL", "PROTO", "TROPA"],
        svg: gerarSvgEspelhoPortal()
      },
      {
        codigo: "N3-08",
        pergunta: "Qual horário quebra a sequência temporal?",
        correta: "00:10:59",
        opcoes: ["00:11:18", "00:10:59", "00:11:44", "00:12:03"],
        svg: gerarSvgTimeline()
      },
      {
        codigo: "N3-09",
        pergunta: "Qual fragmento carrega a assinatura de sombra?",
        correta: "K9-UMBRA",
        opcoes: ["A1-RED", "B7-NEX", "K9-UMBRA", "N4-VOID"],
        svg: gerarSvgFragmentos()
      }
    ];

    const STORAGE_KEY = "cnx_observation_v5";
    const LEGACY_STORAGE_KEY = "cybernexis_observacao";
    const FLOW_KEY = "cnx_recruitment_flow_v1";
    const STATE_VERSION = 5;

    let etapa = 0;
    let acertos = 0;
    let erros = 0;
    let bloqueado = false;
    let estado = null;
    let ctx = canvas ? canvas.getContext("2d") : null;
    let colunas = [];
    let fonte = 14;
    let matrixAnimationId = null;
    let relogioId = null;

    function criarId(prefixo = "obs") {
      if (window.crypto?.randomUUID) return `${prefixo}-${crypto.randomUUID()}`;
      const bytes = new Uint32Array(4);
      window.crypto?.getRandomValues?.(bytes);
      return `${prefixo}-${Date.now()}-${Array.from(bytes).join("")}`;
    }

    function estadoInicial() {
      const agora = new Date().toISOString();
      return {
        version: STATE_VERSION,
        submissionId: criarId(),
        status: "em_andamento",
        etapa: 0,
        acertos: 0,
        erros: 0,
        respostas: [],
        iniciadoEm: agora,
        atualizadoEm: agora,
        concluidoEm: null
      };
    }

    function estadoValido(valor) {
      return Boolean(
        valor &&
        valor.version === STATE_VERSION &&
        Number.isInteger(valor.etapa) &&
        valor.etapa >= 0 &&
        valor.etapa <= desafios.length &&
        Array.isArray(valor.respostas)
      );
    }

    function carregarEstado() {
      try {
        const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        if (estadoValido(salvo)) return salvo;
      } catch (erro) {
        console.warn("Falha ao restaurar o Teste de Observação:", erro);
      }

      const legado = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legado === "aprovado") {
        const migrado = estadoInicial();
        migrado.status = "aprovado";
        migrado.etapa = desafios.length;
        migrado.acertos = desafios.length;
        migrado.concluidoEm = new Date().toISOString();
        return migrado;
      }

      return estadoInicial();
    }

    function salvarEstado() {
      estado.etapa = etapa;
      estado.acertos = acertos;
      estado.erros = erros;
      estado.atualizadoEm = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    }

    function lerFluxo() {
      try {
        return JSON.parse(localStorage.getItem(FLOW_KEY) || "{}");
      } catch {
        return {};
      }
    }

    function atualizarFluxoRecrutamento() {
      const fluxo = lerFluxo();
      fluxo.version = 1;
      fluxo.submissionId = fluxo.submissionId || estado.submissionId || criarId("recrutamento");
      fluxo.observacao = {
        status: estado.status,
        acertos: estado.acertos,
        erros: estado.erros,
        total: desafios.length,
        respostas: estado.respostas,
        iniciadoEm: estado.iniciadoEm,
        concluidoEm: estado.concluidoEm,
        atualizadoEm: estado.atualizadoEm
      };
      fluxo.status = estado.status === "aprovado"
        ? (fluxo.perfil?.status === "concluido" ? "pronto_para_analise" : "aguardando_questionario")
        : "observacao_encerrada";
      fluxo.atualizadoEm = new Date().toISOString();
      localStorage.setItem(FLOW_KEY, JSON.stringify(fluxo));
    }

    function emitirAtualizacao() {
      document.dispatchEvent(new CustomEvent("cnx:observation-updated", {
        detail: {
          status: estado.status,
          acertos: estado.acertos,
          erros: estado.erros,
          total: desafios.length
        }
      }));
    }

    /* =====================================================
       FUNDO MATRIX
    ===================================================== */
    function ajustarCanvas() {
      if (!canvas || !ctx) return;

      const rect = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      const largura = Math.max(1, Math.floor(rect.width));
      const altura = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.floor(largura * pixelRatio);
      canvas.height = Math.floor(altura * pixelRatio);
      canvas.style.width = `${largura}px`;
      canvas.style.height = `${altura}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      fonte = window.innerWidth < 800 ? 12 : 14;
      colunas = Array.from(
        { length: Math.ceil(largura / fonte) },
        () => Math.random() * altura
      );
    }

    function animarMatrix() {
      if (!canvas || !ctx) return;

      const largura = canvas.clientWidth;
      const altura = canvas.clientHeight;

      ctx.fillStyle = "rgba(0, 0, 0, 0.09)";
      ctx.fillRect(0, 0, largura, altura);
      ctx.font = `${fonte}px Courier New`;

      colunas.forEach((y, i) => {
        const x = i * fonte;
        const char = chars[Math.floor(Math.random() * chars.length)];
        const brilho = Math.random() > 0.985;

        ctx.fillStyle = brilho
          ? "rgba(255, 120, 135, .95)"
          : "rgba(255, 21, 53, .58)";
        ctx.shadowColor = "#ff1535";
        ctx.shadowBlur = brilho ? 18 : 4;
        ctx.fillText(char, x, y);
        colunas[i] = y > altura + Math.random() * 700 ? 0 : y + fonte;
      });

      ctx.shadowBlur = 0;
      matrixAnimationId = requestAnimationFrame(animarMatrix);
    }

    function atualizarRelogio() {
      if (!clock) return;
      const agora = new Date();
      const h = String(agora.getHours()).padStart(2, "0");
      const m = String(agora.getMinutes()).padStart(2, "0");
      const s = String(agora.getSeconds()).padStart(2, "0");
      clock.textContent = `${h}:${m}:${s}`;
    }

    /* =====================================================
       FLUXO PERSISTENTE DO JOGO
    ===================================================== */
    function mostrarEtapa() {
      bloqueado = false;

      if (estado.status !== "em_andamento" || etapa >= desafios.length) {
        finalizar(false);
        return;
      }

      const atual = desafios[etapa];
      imagem.src = atual.svg;
      imagem.alt = atual.pergunta;
      pergunta.textContent = atual.pergunta;
      feedback.textContent = "Observe antes de escolher. Seu progresso é salvo automaticamente.";
      progresso.textContent = `Etapa ${etapa + 1}/${desafios.length} • Acertos: ${acertos} • Erros: ${erros}`;

      if (roundTag) roundTag.textContent = atual.codigo;
      if (integrity) integrity.textContent = "ANALISANDO";

      opcoes.innerHTML = "";
      embaralhar(atual.opcoes).forEach((opcao) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = `> ${opcao}`;
        btn.addEventListener("click", () => responder(opcao, btn));
        opcoes.appendChild(btn);
      });
    }

    function responder(opcao, botao) {
      if (bloqueado || estado.status !== "em_andamento") return;
      bloqueado = true;

      const atual = desafios[etapa];
      const botoes = opcoes.querySelectorAll("button");
      botoes.forEach((b) => { b.disabled = true; });

      const acertou = normalizar(opcao) === normalizar(atual.correta);
      if (acertou) {
        acertos += 1;
        botao.classList.add("correta");
        feedback.textContent = "✔ Padrão reconhecido. A escolha foi registrada.";
        if (integrity) integrity.textContent = "VALIDADO";
      } else {
        erros += 1;
        botao.classList.add("errada");
        feedback.textContent = `✖ Falso padrão. A resposta correta era: ${atual.correta}.`;
        if (integrity) integrity.textContent = "FALHA";
        destacarRespostaCorreta(atual.correta);
      }

      estado.respostas.push({
        codigo: atual.codigo,
        escolha: String(opcao),
        correta: atual.correta,
        acertou,
        respondidoEm: new Date().toISOString()
      });

      etapa += 1;

      if (etapa >= desafios.length) {
        estado.status = acertos === desafios.length ? "aprovado" : "nao_aprovado";
        estado.concluidoEm = new Date().toISOString();
      }

      salvarEstado();
      atualizarFluxoRecrutamento();
      emitirAtualizacao();

      setTimeout(() => {
        if (estado.status !== "em_andamento") {
          finalizar(false);
          return;
        }
        mostrarEtapa();
      }, 1100);
    }

    function destacarRespostaCorreta(correta) {
      opcoes.querySelectorAll("button").forEach((botao) => {
        const texto = botao.textContent.replace(/^>\s*/, "");
        if (normalizar(texto) === normalizar(correta)) {
          botao.classList.add("correta");
        }
      });
    }

    function criarBotaoContinuar() {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "botao-acesso-restrito";
      btn.textContent = "⌬ CONTINUAR PARA AVALIAÇÃO DE PERFIL";
      btn.addEventListener("click", () => {
        if (window.CNXRecruitment?.openAssessment) {
          window.CNXRecruitment.openAssessment();
          return;
        }
        window.location.href = `${SECRET_PAGE}?recrutamento=1&source=observacao`;
      });
      return btn;
    }

    function finalizar(persistir = true) {
      opcoes.innerHTML = "";
      pergunta.textContent = "Triagem de observação concluída.";
      progresso.textContent = `Resultado final: ${acertos}/${desafios.length} • Erros: ${erros}`;

      if (estado.status === "aprovado") {
        feedback.textContent = "ACESSO À PRÓXIMA ETAPA LIBERADO. Este teste não poderá ser refeito neste navegador.";
        if (integrity) integrity.textContent = "NÚCLEO ABERTO";

        if (acessoOculto) {
          acessoOculto.style.display = "block";
          acessoOculto.innerHTML = "";
          acessoOculto.appendChild(criarBotaoContinuar());
        } else {
          opcoes.appendChild(criarBotaoContinuar());
        }

        window.CNXRecruitment?.unlockAssessment?.();
      } else if (estado.status === "nao_aprovado") {
        feedback.textContent = "TRIAGEM ENCERRADA. O resultado foi preservado e o teste não reiniciará ao atualizar a página.";
        if (integrity) integrity.textContent = "ENCERRADO";
      } else {
        return mostrarEtapa();
      }

      if (persistir) {
        salvarEstado();
        atualizarFluxoRecrutamento();
      }
      emitirAtualizacao();
    }

    function restaurarInterface() {
      estado = carregarEstado();
      etapa = estado.etapa;
      acertos = estado.acertos;
      erros = estado.erros;

      if (estado.status === "em_andamento") {
        mostrarEtapa();
      } else {
        finalizar(false);
      }
    }

    /* =====================================================
       START
    ===================================================== */
    window.addEventListener("resize", ajustarCanvas);

    window.addEventListener("beforeunload", () => {
      if (matrixAnimationId) cancelAnimationFrame(matrixAnimationId);
      if (relogioId) clearInterval(relogioId);
    });

    ajustarCanvas();
    if (canvas && ctx) animarMatrix();

    atualizarRelogio();
    relogioId = setInterval(atualizarRelogio, 1000);

    if (acessoOculto) {
      acessoOculto.style.display = "none";
      acessoOculto.innerHTML = "";
    }

    restaurarInterface();

    console.info("CYBER-NEXIS // TESTE DE OBSERVAÇÃO V5 PERSISTENTE");
  });
})();
