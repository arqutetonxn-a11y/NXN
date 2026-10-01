"use strict";

/*
============================================================
 CYBER NEXIS
 SCRIPT PRINCIPAL
 js/script.js
============================================================

 Funções gerais utilizadas pelas páginas públicas do site.

 IMPORTANTE:
 Este arquivo NÃO controla autenticação, testes ou permissões
 do NEXUS. Essas funções ficam em:
   - js/auth.js
   - js/tests.js
   - js/nexus.js
============================================================
*/


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const CYBER_NEXIS_CONFIG = {
    animationDuration: 350,
    scrollOffset: 80
};


/* =========================================================
   UTILITÁRIOS
========================================================= */

/**
 * Seleciona um elemento com segurança.
 */
function getElement(selector, parent = document) {
    return parent.querySelector(selector);
}


/**
 * Seleciona vários elementos.
 */
function getElements(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}


/**
 * Verifica se um elemento existe.
 */
function elementExists(selector) {
    return Boolean(getElement(selector));
}


/* =========================================================
   ANO AUTOMÁTICO
========================================================= */

function updateCurrentYear() {

    const yearElements = getElements("#currentYear");

    const currentYear = new Date().getFullYear();

    yearElements.forEach((element) => {
        element.textContent = currentYear;
    });
}


/* =========================================================
   MENU MOBILE
========================================================= */

function initMobileMenu() {

    const menuToggle = getElement("#menuToggle");
    const navigation = getElement("#mainNavigation");

    if (!menuToggle || !navigation) {
        return;
    }


    menuToggle.setAttribute("aria-expanded", "false");


    function closeMenu() {

        navigation.classList.remove("is-open");

        menuToggle.classList.remove("is-active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove("menu-open");
    }


    function openMenu() {

        navigation.classList.add("is-open");

        menuToggle.classList.add("is-active");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.classList.add("menu-open");
    }


    menuToggle.addEventListener("click", () => {

        const isOpen =
            navigation.classList.contains("is-open");

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }

    });


    /*
     * Fecha o menu quando um link interno
     * é selecionado.
     */

    const navigationLinks =
        getElements("a", navigation);

    navigationLinks.forEach((link) => {

        link.addEventListener("click", () => {
            closeMenu();
        });

    });


    /*
     * Fecha ao clicar fora.
     */

    document.addEventListener("click", (event) => {

        if (!navigation.classList.contains("is-open")) {
            return;
        }

        const clickedInsideNavigation =
            navigation.contains(event.target);

        const clickedToggle =
            menuToggle.contains(event.target);

        if (!clickedInsideNavigation && !clickedToggle) {
            closeMenu();
        }

    });


    /*
     * Fecha ao pressionar ESC.
     */

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {
            closeMenu();
        }

    });


    /*
     * Recalcula o estado quando a tela aumenta.
     */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 900) {
            closeMenu();
        }

    });

}


/* =========================================================
   NAVEGAÇÃO SUAVE
========================================================= */

function initSmoothScroll() {

    const links = getElements(
        'a[href^="#"]'
    );

    links.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }


            const target =
                getElement(targetId);

            if (!target) {
                return;
            }


            event.preventDefault();


            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                CYBER_NEXIS_CONFIG.scrollOffset;


            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

        });

    });

}


/* =========================================================
   HEADER AO ROLAR
========================================================= */

function initScrollHeader() {

    const header =
        getElement(".site-header");

    if (!header) {
        return;
    }


    const updateHeader =
        () => {

            if (window.scrollY > 30) {

                header.classList.add(
                    "is-scrolled"
                );

            } else {

                header.classList.remove(
                    "is-scrolled"
                );

            }

        };


    updateHeader();

    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );

}


/* =========================================================
   REVEAL DE SEÇÕES
========================================================= */

function initRevealAnimations() {

    const revealElements =
        getElements(
            ".reveal, .section-reveal, [data-reveal]"
        );


    if (!revealElements.length) {
        return;
    }


    /*
     * Se o navegador não possuir IntersectionObserver,
     * mostra tudo imediatamente.
     */

    if (!("IntersectionObserver" in window)) {

        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });

        return;
    }


    const observer =
        new IntersectionObserver(
            (entries, observerInstance) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    entry.target.classList.add(
                        "is-visible"
                    );


                    observerInstance.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );


    revealElements.forEach((element) => {
        observer.observe(element);
    });

}


/* =========================================================
   VÍDEOS
========================================================= */

function initVideos() {

    const videos =
        getElements("video");


    if (!videos.length) {
        return;
    }


    videos.forEach((video) => {

        /*
         * Não deixa o navegador carregar
         * vídeos infinitamente sem necessidade.
         */

        video.setAttribute(
            "playsinline",
            ""
        );


        /*
         * Vídeos decorativos podem ser reproduzidos
         * automaticamente.
         */

        if (
            video.hasAttribute("autoplay") &&
            !video.hasAttribute("muted")
        ) {

            video.muted = true;

        }


        /*
         * Tratamento simples de erro.
         */

        video.addEventListener(
            "error",
            () => {

                video.classList.add(
                    "video-error"
                );

            }
        );

    });

}


/* =========================================================
   IMAGENS
========================================================= */

function initImages() {

    const images =
        getElements("img");


    images.forEach((image) => {

        image.addEventListener(
            "error",
            () => {

                image.classList.add(
                    "image-error"
                );

            }
        );

    });

}


/* =========================================================
   LINKS EXTERNOS
========================================================= */

function initExternalLinks() {

    const links =
        getElements("a[href]");


    links.forEach((link) => {

        const href =
            link.getAttribute("href");


        if (!href) {
            return;
        }


        /*
         * Ignora:
         * - links internos
         * - mailto
         * - tel
         * - javascript
         */

        if (
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            href.startsWith("javascript:")
        ) {
            return;
        }


        try {

            const url =
                new URL(
                    href,
                    window.location.href
                );


            if (
                url.origin !==
                window.location.origin
            ) {

                link.setAttribute(
                    "target",
                    "_blank"
                );

                link.setAttribute(
                    "rel",
                    "noopener noreferrer"
                );

            }

        } catch (error) {

            /*
             * URLs relativas especiais podem
             * simplesmente ser ignoradas.
             */

        }

    });

}


/* =========================================================
   COPIAR TEXTO
========================================================= */

function copyText(text) {

    if (!text) {
        return Promise.reject(
            new Error("Nenhum texto informado.")
        );
    }


    if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
            "function"
    ) {

        return navigator.clipboard.writeText(text);

    }


    /*
     * Fallback para navegadores antigos.
     */

    const textarea =
        document.createElement("textarea");

    textarea.value = text;

    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();


    try {

        document.execCommand("copy");

        document.body.removeChild(textarea);

        return Promise.resolve();

    } catch (error) {

        document.body.removeChild(textarea);

        return Promise.reject(error);

    }

}


/* =========================================================
   BOTÕES DE COPIAR
========================================================= */

function initCopyButtons() {

    const buttons =
        getElements("[data-copy]");


    buttons.forEach((button) => {

        button.addEventListener(
            "click",
            async () => {

                const value =
                    button.getAttribute(
                        "data-copy"
                    );


                if (!value) {
                    return;
                }


                const originalText =
                    button.textContent;


                try {

                    await copyText(value);

                    button.textContent =
                        "COPIADO";

                    button.classList.add(
                        "is-copied"
                    );


                    window.setTimeout(
                        () => {

                            button.textContent =
                                originalText;

                            button.classList.remove(
                                "is-copied"
                            );

                        },
                        1500
                    );

                } catch (error) {

                    button.textContent =
                        "ERRO";

                    window.setTimeout(
                        () => {

                            button.textContent =
                                originalText;

                        },
                        1500
                    );

                }

            }
        );

    });

}


/* =========================================================
   DETALHES / FAQ
========================================================= */

function initDetails() {

    const details =
        getElements("details");


    details.forEach((item) => {

        item.addEventListener(
            "toggle",
            () => {

                /*
                 * Apenas adiciona uma classe para permitir
                 * estilização visual.
                 */

                if (item.open) {

                    item.classList.add(
                        "is-open"
                    );

                } else {

                    item.classList.remove(
                        "is-open"
                    );

                }

            }
        );

    });

}


/* =========================================================
   STATUS VISUAL
========================================================= */

function initStatusIndicators() {

    const indicators =
        getElements(
            "[data-status-indicator]"
        );


    indicators.forEach((indicator) => {

        const status =
            indicator.getAttribute(
                "data-status-indicator"
            );


        if (!status) {
            return;
        }


        indicator.dataset.status =
            status.toLowerCase();

    });

}


/* =========================================================
   PROTEÇÃO DE FORMULÁRIOS
========================================================= */

function initFormProtection() {

    const forms =
        getElements("form");


    forms.forEach((form) => {

        form.addEventListener(
            "submit",
            () => {

                form.classList.add(
                    "is-submitting"
                );

            }
        );

    });

}


/* =========================================================
   REDUÇÃO DE MOVIMENTO
========================================================= */

function initReducedMotion() {

    const mediaQuery =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    function updateMotionPreference() {

        if (mediaQuery.matches) {

            document.documentElement.classList.add(
                "reduced-motion"
            );

        } else {

            document.documentElement.classList.remove(
                "reduced-motion"
            );

        }

    }


    updateMotionPreference();


    if (
        typeof mediaQuery.addEventListener ===
        "function"
    ) {

        mediaQuery.addEventListener(
            "change",
            updateMotionPreference
        );

    }

}


/* =========================================================
   DATA ATUAL
========================================================= */

function initDateElements() {

    const elements =
        getElements("[data-current-date]");


    if (!elements.length) {
        return;
    }


    const date =
        new Date();


    const formattedDate =
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        ).format(date);


    elements.forEach((element) => {

        element.textContent =
            formattedDate;

    });

}


/* =========================================================
   RELÓGIO
========================================================= */

function initClockElements() {

    const clocks =
        getElements("[data-live-clock]");


    if (!clocks.length) {
        return;
    }


    function updateClock() {

        const now =
            new Date();


        const time =
            new Intl.DateTimeFormat(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            ).format(now);


        clocks.forEach((clock) => {

            clock.textContent =
                time;

        });

    }


    updateClock();


    window.setInterval(
        updateClock,
        1000
    );

}


/* =========================================================
   CONSOLE
========================================================= */

function initConsoleMessage() {

    /*
     * Mensagem simples para identificar a aplicação.
     */

    if (
        typeof console !== "undefined" &&
        typeof console.info === "function"
    ) {

        console.info(
            "%cCYBER NEXIS",
            "font-weight: bold; font-size: 16px;"
        );

        console.info(
            "Sistema carregado."
        );

    }

}


/* =========================================================
   INICIALIZAÇÃO PRINCIPAL
========================================================= */

function initCyberNexis() {

    updateCurrentYear();

    initMobileMenu();

    initSmoothScroll();

    initScrollHeader();

    initRevealAnimations();

    initVideos();

    initImages();

    initExternalLinks();

    initCopyButtons();

    initDetails();

    initStatusIndicators();

    initFormProtection();

    initReducedMotion();

    initDateElements();

    initClockElements();

    initConsoleMessage();

}


/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initCyberNexis
    );

} else {

    initCyberNexis();

}


/* =========================================================
   API GLOBAL
========================================================= */

window.CyberNexis = {

    getElement,

    getElements,

    elementExists,

    copyText,

    init: initCyberNexis

};