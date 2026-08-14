(() => {
  "use strict";

  const STORAGE_KEY = "cnx_onboarding_completed_v1";

  const slides = [
    {
      title: "Bem-vindo à Cyber-Nexis",
      text: "Aqui você encontrará informações sobre a organização, sua estrutura e seus protocolos.",
      image: "Imagem/CNX06.jpg"
    },
    {
      title: "Painel de Operações",
      text: "Acompanhe o estado da sessão, integridade local e os principais eventos do sistema.",
      image: "Imagem/CNX07.jpg"
    },
    {
      title: "Protocolo Sentinel",
      text: "Responda aos desafios de triagem e avance pelas diferentes camadas da Cyber-Nexis.",
      image: "Imagem/Grupo 01.png"
    },
    {
      title: "Teste de Observação",
      text: "Analise detalhes, identifique padrões e demonstre precisão antes de acessar áreas mais profundas.",
      image: "Imagem/Garoto.jpeg"
    },
    {
      title: "Explore a Rede",
      text: "Conheça a missão, hierarquia, regras, recrutamento e demais setores da Cyber-Nexis.",
      image: "Imagem/CNX09.png"
    }
  ];

  let currentSlide = 0;

  document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      return;
    }

    createOnboarding();
  });

  function createOnboarding() {
    const style = document.createElement("style");

    style.textContent = `
      body.cnx-onboarding-open {
        overflow: hidden;
      }

      .cnx-onboarding {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background:
          radial-gradient(circle at top, rgba(24, 184, 255, 0.08), transparent 36%),
          rgba(0, 0, 0, 0.96);
        backdrop-filter: blur(8px);
      }

      .cnx-onboarding-box {
        position: relative;
        width: min(900px, 100%);
        min-height: 500px;
        padding: 34px;
        border: 2px solid #27c2ff;
        background:
          linear-gradient(135deg, rgba(24, 184, 255, 0.06), transparent 35%),
          #020a10;
        box-shadow:
          0 0 30px rgba(24, 184, 255, 0.20),
          inset 0 0 40px rgba(24, 184, 255, 0.04);
        clip-path: polygon(
          5% 0,
          38% 0,
          42% 5%,
          72% 5%,
          76% 0,
          95% 0,
          100% 8%,
          100% 87%,
          94% 100%,
          68% 100%,
          64% 95%,
          27% 95%,
          23% 100%,
          5% 100%,
          0 92%,
          0 9%
        );
      }

      .cnx-onboarding-box::before,
      .cnx-onboarding-box::after {
        content: "";
        position: absolute;
        pointer-events: none;
      }

      .cnx-onboarding-box::before {
        inset: 12px;
        border: 1px solid rgba(24, 184, 255, 0.18);
        clip-path: inherit;
      }

      .cnx-onboarding-box::after {
        top: 0;
        left: 38%;
        width: 140px;
        height: 7px;
        background:
          repeating-linear-gradient(
            135deg,
            #27c2ff 0 12px,
            transparent 12px 19px
          );
      }

      .cnx-onboarding-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 28px;
      }

      .cnx-onboarding-kicker {
        color: rgba(83, 216, 255, 0.78);
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 2px;
        text-transform: uppercase;
      }

      .cnx-onboarding-counter {
        color: #27c2ff;
        font-family: "Courier New", monospace;
        font-size: 0.85rem;
        font-weight: 900;
        letter-spacing: 2px;
      }

      .cnx-onboarding-content {
        display: grid;
        grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.2fr);
        gap: 34px;
        align-items: center;
      }

      .cnx-onboarding-image-wrap {
        position: relative;
        padding: 10px;
        border: 1px solid rgba(24, 184, 255, 0.45);
        background: rgba(24, 184, 255, 0.04);
        box-shadow:
          0 0 20px rgba(24, 184, 255, 0.12),
          inset 0 0 20px rgba(24, 184, 255, 0.04);
      }

      .cnx-onboarding-image {
        display: block;
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        background: #020202;
      }

      .cnx-onboarding-copy h2 {
        margin: 0 0 16px;
        color: #27c2ff;
        font-size: clamp(1.6rem, 4vw, 2.7rem);
        letter-spacing: 1px;
        text-transform: uppercase;
        text-shadow: 0 0 18px rgba(24, 184, 255, 0.28);
      }

      .cnx-onboarding-copy p {
        margin: 0;
        color: rgba(255, 255, 255, 0.78);
        font-size: clamp(1rem, 2vw, 1.15rem);
        line-height: 1.75;
      }

      .cnx-onboarding-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin: 30px 0 18px;
      }

      .cnx-onboarding-dot {
        width: 9px;
        height: 9px;
        padding: 0;
        border: 1px solid rgba(83, 216, 255, 0.55);
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
      }

      .cnx-onboarding-dot.active {
        background: #27c2ff;
        box-shadow: 0 0 12px rgba(83, 216, 255, 0.68);
      }

      .cnx-onboarding-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .cnx-onboarding-left-actions,
      .cnx-onboarding-right-actions {
        display: flex;
        gap: 10px;
      }

      .cnx-onboarding button {
        min-height: 44px;
        padding: 11px 18px;
        border-radius: 999px;
        border: 1px solid rgba(24, 184, 255, 0.45);
        font: inherit;
        font-weight: 900;
        letter-spacing: 1px;
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease,
          background 0.2s ease;
      }

      .cnx-onboarding button:hover {
        transform: translateY(-2px);
      }

      .cnx-onboarding-secondary {
        color: rgba(255, 255, 255, 0.72);
        background: rgba(255, 255, 255, 0.04);
      }

      .cnx-onboarding-primary {
        color: #001019;
        background: linear-gradient(135deg, #27c2ff, #0877ad);
        box-shadow: 0 0 20px rgba(24, 184, 255, 0.24);
      }

      .cnx-onboarding-primary:hover {
        box-shadow: 0 0 28px rgba(83, 216, 255, 0.55);
      }

      .cnx-onboarding-skip {
        color: rgba(83, 216, 255, 0.78);
        background: transparent;
      }

      .cnx-onboarding-slide {
        animation: cnxOnboardingIn 0.32s ease;
      }

      @keyframes cnxOnboardingIn {
        from {
          opacity: 0;
          transform: translateX(18px);
        }

        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @media (max-width: 700px) {
        .cnx-onboarding {
          padding: 12px;
        }

        .cnx-onboarding-box {
          min-height: auto;
          padding: 28px 20px;
          clip-path: polygon(
            7% 0,
            38% 0,
            43% 3%,
            92% 3%,
            100% 10%,
            100% 91%,
            93% 100%,
            8% 100%,
            0 92%,
            0 9%
          );
        }

        .cnx-onboarding-content {
          grid-template-columns: 1fr;
          gap: 22px;
        }

        .cnx-onboarding-image-wrap {
          width: min(280px, 100%);
          margin-inline: auto;
        }

        .cnx-onboarding-copy {
          text-align: center;
        }

        .cnx-onboarding-actions {
          flex-direction: column-reverse;
          align-items: stretch;
        }

        .cnx-onboarding-left-actions,
        .cnx-onboarding-right-actions {
          width: 100%;
        }

        .cnx-onboarding button {
          width: 100%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .cnx-onboarding-slide {
          animation: none;
        }

        .cnx-onboarding button {
          transition: none;
        }
      }
    `;

    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.className = "cnx-onboarding";
    overlay.id = "cnx-onboarding";

    overlay.innerHTML = `
      <section
        class="cnx-onboarding-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cnx-onboarding-title"
      >
        <div class="cnx-onboarding-header">
          <span class="cnx-onboarding-kicker">
            CYBER-NEXIS // INICIALIZAÇÃO
          </span>

          <span
            id="cnx-onboarding-counter"
            class="cnx-onboarding-counter"
          ></span>
        </div>

        <div
          id="cnx-onboarding-slide"
          class="cnx-onboarding-slide"
        >
          <div class="cnx-onboarding-content">
            <div class="cnx-onboarding-image-wrap">
              <img
                id="cnx-onboarding-image"
                class="cnx-onboarding-image"
                alt=""
              >
            </div>

            <div class="cnx-onboarding-copy">
              <h2 id="cnx-onboarding-title"></h2>
              <p id="cnx-onboarding-text"></p>
            </div>
          </div>
        </div>

        <div
          id="cnx-onboarding-dots"
          class="cnx-onboarding-dots"
          aria-label="Etapas da introdução"
        ></div>

        <div class="cnx-onboarding-actions">
          <div class="cnx-onboarding-left-actions">
            <button
              id="cnx-onboarding-skip"
              class="cnx-onboarding-skip"
              type="button"
            >
              Pular introdução
            </button>
          </div>

          <div class="cnx-onboarding-right-actions">
            <button
              id="cnx-onboarding-back"
              class="cnx-onboarding-secondary"
              type="button"
            >
              Voltar
            </button>

            <button
              id="cnx-onboarding-next"
              class="cnx-onboarding-primary"
              type="button"
            >
              Próximo
            </button>
          </div>
        </div>
      </section>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add("cnx-onboarding-open");

    const dotsContainer =
      document.getElementById("cnx-onboarding-dots");

    slides.forEach((_, index) => {
      const dot = document.createElement("button");

      dot.className = "cnx-onboarding-dot";
      dot.type = "button";
      dot.setAttribute(
        "aria-label",
        `Ir para etapa ${index + 1}`
      );

      dot.addEventListener("click", () => {
        currentSlide = index;
        renderSlide();
      });

      dotsContainer.appendChild(dot);
    });

    document
      .getElementById("cnx-onboarding-next")
      .addEventListener("click", nextSlide);

    document
      .getElementById("cnx-onboarding-back")
      .addEventListener("click", previousSlide);

    document
      .getElementById("cnx-onboarding-skip")
      .addEventListener("click", finishOnboarding);

    document.addEventListener(
      "keydown",
      handleKeyboard
    );

    renderSlide();
  }

  function renderSlide() {
    const slide = slides[currentSlide];

    const slideContainer =
      document.getElementById("cnx-onboarding-slide");

    const image =
      document.getElementById("cnx-onboarding-image");

    const title =
      document.getElementById("cnx-onboarding-title");

    const text =
      document.getElementById("cnx-onboarding-text");

    const counter =
      document.getElementById("cnx-onboarding-counter");

    const backButton =
      document.getElementById("cnx-onboarding-back");

    const nextButton =
      document.getElementById("cnx-onboarding-next");

    slideContainer.classList.remove(
      "cnx-onboarding-slide"
    );

    void slideContainer.offsetWidth;

    slideContainer.classList.add(
      "cnx-onboarding-slide"
    );

    image.src = slide.image;
    image.alt = slide.title;

    title.textContent = slide.title;
    text.textContent = slide.text;

    counter.textContent =
      `${String(currentSlide + 1).padStart(2, "0")} / ` +
      `${String(slides.length).padStart(2, "0")}`;

    backButton.style.visibility =
      currentSlide === 0 ? "hidden" : "visible";

    if (currentSlide === slides.length - 1) {
      nextButton.textContent = "Entrar na Cyber-Nexis";
    } else {
      nextButton.textContent = "Próximo";
    }

    const dots = document.querySelectorAll(
      ".cnx-onboarding-dot"
    );

    dots.forEach((dot, index) => {
      dot.classList.toggle(
        "active",
        index === currentSlide
      );

      dot.setAttribute(
        "aria-current",
        index === currentSlide ? "step" : "false"
      );
    });
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      currentSlide += 1;
      renderSlide();
      return;
    }

    finishOnboarding();
  }

  function previousSlide() {
    if (currentSlide > 0) {
      currentSlide -= 1;
      renderSlide();
    }
  }

  function finishOnboarding() {
    localStorage.setItem(
      STORAGE_KEY,
      "true"
    );

    const overlay =
      document.getElementById("cnx-onboarding");

    if (overlay) {
      overlay.remove();
    }

    document.body.classList.remove(
      "cnx-onboarding-open"
    );

    document.removeEventListener(
      "keydown",
      handleKeyboard
    );
  }

  function handleKeyboard(event) {
    if (event.key === "ArrowRight") {
      nextSlide();
    }

    if (event.key === "ArrowLeft") {
      previousSlide();
    }

    if (event.key === "Escape") {
      finishOnboarding();
    }
  }
})();