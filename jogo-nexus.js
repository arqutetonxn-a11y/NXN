(() => {
  const content = document.getElementById("nexus-content");
  const stageEl = document.getElementById("nexus-stage");
  const statusEl = document.getElementById("nexus-status");
  const scoreEl = document.getElementById("nexus-score");
  const startBtn = document.getElementById("nexus-start");

  if (!content || !stageEl || !statusEl || !scoreEl || !startBtn) {
    return;
  }

  const SECRET_PAGE = "pagina-secreta.html";

  let score = 0;
  let locked = false;

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  function setStage(numero) {
    stageEl.textContent = `${numero} / 3`;
  }

  function setStatus(texto) {
    statusEl.textContent = texto;
  }

  function addScore(pontos) {
    score += pontos;
    scoreEl.textContent = `${score} pts`;
  }

  function mostrarErro(texto) {
    const mensagem = document.getElementById("nexus-message");

    if (!mensagem) {
      return;
    }

    mensagem.textContent = texto;
    mensagem.classList.add("is-error");
  }

  /* ==========================================================
     FASE 1
     MEMÓRIA
  ========================================================== */

  async function faseMemoria() {
    setStage(1);
    setStatus("FASE 1 // MEMÓRIA");

    const simbolos = ["A", "N", "X", "7"];

    const sequencia = Array.from(
      { length: 4 },
      () => Math.floor(Math.random() * simbolos.length)
    );

    content.innerHTML = `
      <div class="nexus-stage-card">

        <div class="nexus-symbol">
          01
        </div>

        <h3>
          Memória de Sequência
        </h3>

        <p>
          Observe a sequência e depois repita exatamente.
        </p>

        <div class="nexus-sequence">

          ${simbolos
            .map(
              (simbolo, indice) => `
                <button
                  class="nexus-key"
                  data-key="${indice}"
                  type="button"
                >
                  ${simbolo}
                </button>
              `
            )
            .join("")}

        </div>

        <div
          id="nexus-message"
          class="nexus-message"
        >
          Preparando sequência...
        </div>

      </div>
    `;

    const teclas = [
      ...content.querySelectorAll(".nexus-key")
    ];

    teclas.forEach((tecla) => {
      tecla.disabled = true;
    });

    await sleep(700);

    for (const indice of sequencia) {
      teclas[indice].classList.add("is-lit");

      await sleep(450);

      teclas[indice].classList.remove("is-lit");

      await sleep(180);
    }

    const mensagem = document.getElementById("nexus-message");

    mensagem.textContent = "Sua vez.";

    teclas.forEach((tecla) => {
      tecla.disabled = false;
    });

    const tentativa = [];

    teclas.forEach((tecla, indice) => {
      tecla.addEventListener("click", () => {
        if (locked) {
          return;
        }

        tentativa.push(indice);

        const posicao =
          tentativa.length - 1;

        if (
          tentativa[posicao] !==
          sequencia[posicao]
        ) {
          locked = true;

          mostrarErro(
            "Sequência incorreta. Reiniciando..."
          );

          setTimeout(() => {
            locked = false;
            faseMemoria();
          }, 900);

          return;
        }

        if (
          tentativa.length ===
          sequencia.length
        ) {
          locked = true;

          addScore(100);

          mensagem.textContent =
            "Sequência validada.";

          setTimeout(() => {
            locked = false;
            faseLogica();
          }, 700);
        }
      });
    });
  }

  /* ==========================================================
     FASE 2
     LÓGICA
  ========================================================== */

  function faseLogica() {
    setStage(2);
    setStatus("FASE 2 // LÓGICA");

    content.innerHTML = `
      <div class="nexus-stage-card">

        <div class="nexus-symbol">
          02
        </div>

        <h3>
          Nó Lógico
        </h3>

        <p>
          Complete a sequência:
        </p>

        <p>
          <strong>
            2, 6, 12, 20, 30, ?
          </strong>
        </p>

        <div class="nexus-options">

          <button
            type="button"
            data-answer="36"
          >
            36
          </button>

          <button
            type="button"
            data-answer="40"
          >
            40
          </button>

          <button
            type="button"
            data-answer="42"
          >
            42
          </button>

          <button
            type="button"
            data-answer="44"
          >
            44
          </button>

        </div>

        <div
          id="nexus-message"
          class="nexus-message"
        ></div>

      </div>
    `;

    const botoes =
      content.querySelectorAll(
        "[data-answer]"
      );

    botoes.forEach((botao) => {
      botao.addEventListener("click", () => {
        if (
          botao.dataset.answer ===
          "42"
        ) {
          addScore(150);

          document.getElementById(
            "nexus-message"
          ).textContent =
            "Padrão reconhecido.";

          setTimeout(() => {
            faseDecodificacao();
          }, 700);

          return;
        }

        mostrarErro(
          "Resposta incorreta."
        );
      });
    });
  }

  /* ==========================================================
     FASE 3
     DECODIFICAÇÃO
  ========================================================== */

  function faseDecodificacao() {
    setStage(3);

    setStatus(
      "FASE 3 // DECODIFICAÇÃO"
    );

    content.innerHTML = `
      <div class="nexus-stage-card">

        <div class="nexus-symbol">
          03
        </div>

        <h3>
          Decodificação Final
        </h3>

        <p>
          Decodifique o texto hexadecimal ASCII:
        </p>

        <p>
          <strong>
            4E 45 58 55 53
          </strong>
        </p>

        <div class="nexus-input-row">

          <input
            id="nexus-decode"
            type="text"
            autocomplete="off"
            spellcheck="false"
            placeholder="Digite a palavra"
          >

          <button
            id="nexus-submit"
            class="btn"
            type="button"
          >
            VALIDAR
          </button>

        </div>

        <div
          id="nexus-message"
          class="nexus-message"
        ></div>

      </div>
    `;

    const input =
      document.getElementById(
        "nexus-decode"
      );

    const botao =
      document.getElementById(
        "nexus-submit"
      );

    function validarResposta() {
      const resposta =
        String(
          input.value || ""
        )
          .trim()
          .toUpperCase();

      if (
        resposta ===
        "NEXUS"
      ) {
        addScore(250);

        vencerJogo();

        return;
      }

      mostrarErro(
        "Código inválido."
      );
    }

    botao.addEventListener(
      "click",
      validarResposta
    );

    input.addEventListener(
      "keydown",
      (evento) => {
        if (
          evento.key ===
          "Enter"
        ) {
          validarResposta();
        }
      }
    );

    input.focus();
  }

  /* ==========================================================
     VITÓRIA
  ========================================================== */

  function vencerJogo() {
    setStatus(
      "ACESSO CONCEDIDO"
    );

    stageEl.textContent =
      "3 / 3";

    content.innerHTML = `
      <div class="nexus-win-card">

        <div class="nexus-symbol">
          ✓
        </div>

        <h3>
          PROTOCOLO CONCLUÍDO
        </h3>

        <p>
          Todas as fases foram superadas.
        </p>

        <p class="nexus-message">
          Redirecionamento em 3 segundos.
        </p>

        <button
          id="nexus-enter-now"
          class="btn"
          type="button"
        >
          ENTRAR AGORA
        </button>

      </div>
    `;

    sessionStorage.setItem(
      "cnx_nexus_gate_passed",
      "1"
    );

    sessionStorage.setItem(
      "cnx_nexus_gate_score",
      String(score)
    );

    function entrarPaginaSecreta() {
      window.location.href =
        SECRET_PAGE;
    }

    document
      .getElementById(
        "nexus-enter-now"
      )
      .addEventListener(
        "click",
        entrarPaginaSecreta
      );

    setTimeout(
      entrarPaginaSecreta,
      3000
    );
  }

  /* ==========================================================
     INICIAR
  ========================================================== */

  startBtn.addEventListener(
    "click",
    faseMemoria
  );
})();
