"use strict";

/*
============================================================
 CYBER NEXIS
 SCRIPT PRINCIPAL
 js/script.js
============================================================

 Núcleo global do CYBER NEXIS.

 Responsabilidades:
 - Menu mobile
 - Navegação suave
 - Header ao rolar
 - Animações de entrada
 - Vídeos
 - Imagens
 - Links externos
 - Botões de copiar
 - FAQ / details
 - Indicadores de status
 - Proteção visual de formulários
 - Data e ano automático
 - Relógios públicos
 - Preferência de movimento reduzido
 - Acessibilidade
 - Pequenas funções visuais globais

 NÃO controla:
 - Autenticação
 - Senhas
 - Sessões
 - Testes
 - Pontuação
 - Permissões
 - NEXUS

 Essas funções pertencem a:
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

    scrollOffset: 80,

    mobileBreakpoint: 900,

    revealThreshold: 0.12,

    revealRootMargin: "0px 0px -40px 0px"

};


/* =========================================================
   ESTADO GLOBAL
========================================================= */

const CYBER_NEXIS_STATE = {

    initialized: false,

    clockIntervals: [],

    observers: [],

    mediaQuery: null

};


/* =========================================================
   UTILITÁRIOS
========================================================= */


/**
 * Seleciona um elemento com segurança.
 */
function getElement(selector, parent = document) {

    if (!selector || !parent) {
        return null;
    }

    try {

        return parent.querySelector(selector);

    } catch (error) {

        return null;

    }

}


/**
 * Seleciona vários elementos.
 */
function getElements(selector, parent = document) {

    if (!selector || !parent) {
        return [];
    }

    try {

        return Array.from(
            parent.querySelectorAll(selector)
        );

    } catch (error) {

        return [];

    }

}


/**
 * Verifica se um elemento existe.
 */
function elementExists(selector, parent = document) {

    return Boolean(
        getElement(selector, parent)
    );

}


/**
 * Pequena proteção para funções que podem
 * ser executadas mais de uma vez.
 */
function markInitialized(element, key) {

    if (!element) {
        return false;
    }

    const attribute =
        `data-cyber-nexis-${key}`;

    if (element.hasAttribute(attribute)) {
        return false;
    }

    element.setAttribute(attribute, "true");

    return true;

}


/**
 * Remove marcação de inicialização.
 */
function unmarkInitialized(element, key) {

    if (!element) {
        return;
    }

    element.removeAttribute(
        `data-cyber-nexis-${key}`
    );

}


/* =========================================================
   ANO AUTOMÁTICO
========================================================= */

function updateCurrentYear() {

    const yearElements =
        getElements("#currentYear");

    if (!yearElements.length) {
        return;
    }

    const currentYear =
        new Date().getFullYear();

    yearElements.forEach((element) => {

        element.textContent =
            String(currentYear);

    });

}


/* =========================================================
   MENU MOBILE
========================================================= */

function initMobileMenu() {

    const menuToggle =
        getElement("#menuToggle");

    const navigation =
        getElement("#mainNavigation");

    if (!menuToggle || !navigation) {
        return;
    }

    if (!markInitialized(menuToggle, "mobile-menu")) {
        return;
    }


    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );


    function closeMenu() {

        navigation.classList.remove(
            "is-open"
        );

        menuToggle.classList.remove(
            "is-active"
        );

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove(
            "menu-open"
        );

    }


    function openMenu() {

        navigation.classList.add(
            "is-open"
        );

        menuToggle.classList.add(
            "is-active"
        );

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.classList.add(
            "menu-open"
        );

    }


    menuToggle.addEventListener(
        "click",
        (event) => {

            event.preventDefault();
            event.stopPropagation();

            const isOpen =
                navigation.classList.contains(
                    "is-open"
                );

            if (isOpen) {

                closeMenu();

            } else {

                openMenu();

            }

        }
    );


    const navigationLinks =
        getElements(
            "a",
            navigation
        );


    navigationLinks.forEach((link) => {

        if (
            !markInitialized(
                link,
                "mobile-menu-link"
            )
        ) {
            return;
        }

        link.addEventListener(
            "click",
            () => {
                closeMenu();
            }
        );

    });


    document.addEventListener(
        "click",
        (event) => {

            if (
                !navigation.classList.contains(
                    "is-open"
                )
            ) {
                return;
            }

            const clickedInsideNavigation =
                navigation.contains(
                    event.target
                );

            const clickedToggle =
                menuToggle.contains(
                    event.target
                );

            if (
                !clickedInsideNavigation &&
                !clickedToggle
            ) {
                closeMenu();
            }

        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                navigation.classList.contains(
                    "is-open"
                )
            ) {

                closeMenu();

                menuToggle.focus();

            }

        }
    );


    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth >
                CYBER_NEXIS_CONFIG.mobileBreakpoint
            ) {

                closeMenu();

            }

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   NAVEGAÇÃO SUAVE
========================================================= */

function initSmoothScroll() {

    const links =
        getElements(
            'a[href^="#"]'
        );

    if (!links.length) {
        return;
    }


    links.forEach((link) => {

        if (
            !markInitialized(
                link,
                "smooth-scroll"
            )
        ) {
            return;
        }


        link.addEventListener(
            "click",
            (event) => {

                const targetId =
                    link.getAttribute(
                        "href"
                    );


                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                /*
                 * Remove o # para trabalhar
                 * diretamente com o ID.
                 */

                const id =
                    targetId.slice(1);


                if (!id) {
                    return;
                }


                let target = null;


                try {

                    target =
                        document.getElementById(
                            decodeURIComponent(id)
                        );

                } catch (error) {

                    return;

                }


                /*
                 * Se o elemento não existe nesta página,
                 * deixa o comportamento padrão do navegador.
                 */

                if (!target) {
                    return;
                }


                event.preventDefault();


                const header =
                    getElement(".site-header");


                const headerHeight =
                    header
                        ? header.offsetHeight
                        : CYBER_NEXIS_CONFIG.scrollOffset;


                const extraOffset =
                    Math.max(
                        CYBER_NEXIS_CONFIG.scrollOffset,
                        headerHeight
                    );


                const targetPosition =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    extraOffset;


                window.scrollTo({

                    top: Math.max(
                        0,
                        targetPosition
                    ),

                    behavior:
                        document.documentElement
                            .classList.contains(
                                "reduced-motion"
                            )
                            ? "auto"
                            : "smooth"

                });


                /*
                 * Atualiza a URL sem recarregar
                 * a página.
                 */

                try {

                    history.pushState(
                        null,
                        "",
                        `#${id}`
                    );

                } catch (error) {
                    /* Ignora */
                }

            }
        );

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

    if (
        !markInitialized(
            header,
            "scroll-header"
        )
    ) {
        return;
    }


    const updateHeader =
        () => {

            const shouldScroll =
                window.scrollY > 30;


            header.classList.toggle(
                "is-scrolled",
                shouldScroll
            );

        };


    updateHeader();


    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
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
     * Se o usuário prefere menos movimento,
     * mostra tudo imediatamente.
     */

    if (
        document.documentElement
            .classList.contains(
                "reduced-motion"
            )
    ) {

        revealElements.forEach((element) => {

            element.classList.add(
                "is-visible"
            );

        });

        return;

    }


    /*
     * Fallback para navegadores sem
     * IntersectionObserver.
     */

    if (
        !("IntersectionObserver" in window)
    ) {

        revealElements.forEach((element) => {

            element.classList.add(
                "is-visible"
            );

        });

        return;

    }


    const observer =
        new IntersectionObserver(
            (
                entries,
                observerInstance
            ) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        entry.target.classList.add(
                            "is-visible"
                        );


                        observerInstance.unobserve(
                            entry.target
                        );

                    }
                );

            },
            {
                threshold:
                    CYBER_NEXIS_CONFIG
                        .revealThreshold,

                rootMargin:
                    CYBER_NEXIS_CONFIG
                        .revealRootMargin
            }
        );


    revealElements.forEach((element) => {

        observer.observe(
            element
        );

    });


    CYBER_NEXIS_STATE.observers.push(
        observer
    );

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

        if (
            !markInitialized(
                video,
                "video"
            )
        ) {
            return;
        }


        /*
         * Melhor compatibilidade
         * em dispositivos móveis.
         */

        video.setAttribute(
            "playsinline",
            ""
        );


        /*
         * Vídeos com autoplay precisam
         * estar silenciosos.
         */

        if (
            video.hasAttribute("autoplay")
        ) {

            video.muted = true;

            video.setAttribute(
                "muted",
                ""
            );

        }


        /*
         * Se o usuário prefere movimento reduzido,
         * não força reprodução automática.
         */

        if (
            document.documentElement
                .classList.contains(
                    "reduced-motion"
                ) &&
            video.hasAttribute("autoplay")
        ) {

            video.pause();

        }


        /*
         * Tratamento visual de erro.
         */

        video.addEventListener(
            "error",
            () => {

                video.classList.add(
                    "video-error"
                );

            }
        );


        /*
         * Quando o vídeo carrega,
         * remove possível estado de erro.
         */

        video.addEventListener(
            "loadeddata",
            () => {

                video.classList.remove(
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


    if (!images.length) {
        return;
    }


    images.forEach((image) => {

        if (
            !markInitialized(
                image,
                "image"
            )
        ) {
            return;
        }


        image.addEventListener(
            "error",
            () => {

                image.classList.add(
                    "image-error"
                );

                image.setAttribute(
                    "data-image-error",
                    "true"
                );

            }
        );


        image.addEventListener(
            "load",
            () => {

                image.classList.remove(
                    "image-error"
                );

                image.removeAttribute(
                    "data-image-error"
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
        getElements(
            "a[href]"
        );


    if (!links.length) {
        return;
    }


    links.forEach((link) => {

        if (
            !markInitialized(
                link,
                "external-link"
            )
        ) {
            return;
        }


        const href =
            link.getAttribute(
                "href"
            );


        if (!href) {
            return;
        }


        /*
         * Ignora links que não são URLs externas.
         */

        if (
            href.startsWith("#") ||
            href.startsWith("/") ||
            href.startsWith("./") ||
            href.startsWith("../") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            href.startsWith("javascript:") ||
            href.startsWith("data:")
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
             * URL inválida ou especial.
             * Não interfere no link.
             */

        }

    });

}


/* =========================================================
   COPIAR TEXTO
========================================================= */

function copyText(text) {

    const value =
        String(text ?? "");


    if (!value) {

        return Promise.reject(
            new Error(
                "Nenhum texto informado."
            )
        );

    }


    /*
     * Clipboard API moderna.
     */

    if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
            "function"
    ) {

        return navigator.clipboard.writeText(
            value
        );

    }


    /*
     * Fallback para navegadores
     * que não possuem Clipboard API.
     */

    return new Promise(
        (resolve, reject) => {

            const textarea =
                document.createElement(
                    "textarea"
                );


            textarea.value =
                value;

            textarea.setAttribute(
                "readonly",
                ""
            );

            textarea.style.position =
                "fixed";

            textarea.style.top =
                "0";

            textarea.style.left =
                "-9999px";

            textarea.style.opacity =
                "0";


            document.body.appendChild(
                textarea
            );


            textarea.focus();
            textarea.select();


            try {

                const successful =
                    document.execCommand(
                        "copy"
                    );


                document.body.removeChild(
                    textarea
                );


                if (successful) {

                    resolve();

                } else {

                    reject(
                        new Error(
                            "Não foi possível copiar."
                        )
                    );

                }

            } catch (error) {

                document.body.removeChild(
                    textarea
                );

                reject(error);

            }

        }
    );

}


/* =========================================================
   BOTÕES DE COPIAR
========================================================= */

function initCopyButtons() {

    const buttons =
        getElements(
            "[data-copy]"
        );


    if (!buttons.length) {
        return;
    }


    buttons.forEach((button) => {

        if (
            !markInitialized(
                button,
                "copy-button"
            )
        ) {
            return;
        }


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

                    await copyText(
                        value
                    );


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

                    button.classList.add(
                        "copy-error"
                    );


                    window.setTimeout(
                        () => {

                            button.textContent =
                                originalText;

                            button.classList.remove(
                                "copy-error"
                            );

                        },
                        1500
                    );

                }

            }
        );

    });

}


/* =========================================================
   DETAILS / FAQ
========================================================= */

function initDetails() {

    const details =
        getElements("details");


    if (!details.length) {
        return;
    }


    details.forEach((item) => {

        if (
            !markInitialized(
                item,
                "details"
            )
        ) {
            return;
        }


        /*
         * Estado inicial.
         */

        item.classList.toggle(
            "is-open",
            item.open
        );


        item.addEventListener(
            "toggle",
            () => {

                item.classList.toggle(
                    "is-open",
                    item.open
                );

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


    if (!indicators.length) {
        return;
    }


    indicators.forEach((indicator) => {

        const status =
            indicator.getAttribute(
                "data-status-indicator"
            );


        if (!status) {
            return;
        }


        indicator.dataset.status =
            status
                .trim()
                .toLowerCase();

    });

}


/* =========================================================
   PROTEÇÃO VISUAL DE FORMULÁRIOS
========================================================= */

function initFormProtection() {

    const forms =
        getElements("form");


    if (!forms.length) {
        return;
    }


    forms.forEach((form) => {

        if (
            !markInitialized(
                form,
                "form-protection"
            )
        ) {
            return;
        }


        form.addEventListener(
            "submit",
            () => {

                /*
                 * Apenas estado visual.
                 *
                 * NÃO bloqueia o submit.
                 * auth.js / outros módulos continuam
                 * responsáveis pela lógica real.
                 */

                form.classList.add(
                    "is-submitting"
                );

            }
        );


        /*
         * Se o usuário começar a editar
         * novamente, remove o estado visual.
         */

        form.addEventListener(
            "input",
            () => {

                form.classList.remove(
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


    CYBER_NEXIS_STATE.mediaQuery =
        mediaQuery;


    function updateMotionPreference() {

        document.documentElement
            .classList.toggle(
                "reduced-motion",
                mediaQuery.matches
            );


        /*
         * Quando a preferência muda,
         * atualiza animações já existentes.
         */

        if (mediaQuery.matches) {

            getElements(
                ".reveal, .section-reveal, [data-reveal]"
            ).forEach((element) => {

                element.classList.add(
                    "is-visible"
                );

            });

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

    } else if (
        typeof mediaQuery.addListener ===
        "function"
    ) {

        mediaQuery.addListener(
            updateMotionPreference
        );

    }

}


/* =========================================================
   DATA ATUAL
========================================================= */

function initDateElements() {

    const elements =
        getElements(
            "[data-current-date]"
        );


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
        getElements(
            "[data-live-clock]"
        );


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


    const interval =
        window.setInterval(
            updateClock,
            1000
        );


    CYBER_NEXIS_STATE
        .clockIntervals
        .push(interval);

}


/* =========================================================
   ATRIBUTOS DE ACESSIBILIDADE
========================================================= */

function initAccessibility() {

    /*
     * Links que apontam para uma nova aba
     * recebem uma indicação acessível.
     */

    getElements(
        'a[target="_blank"]'
    ).forEach((link) => {

        if (
            !link.hasAttribute(
                "aria-label"
            ) &&
            link.textContent.trim()
        ) {

            link.setAttribute(
                "aria-label",
                `${link.textContent.trim()} — abre em nova aba`
            );

        }

    });


    /*
     * Imagens sem alt recebem alt vazio.
     * Isso evita que leitores de tela tentem
     * interpretar imagens decorativas.
     */

    getElements("img").forEach((image) => {

        if (
            !image.hasAttribute("alt")
        ) {

            image.setAttribute(
                "alt",
                ""
            );

        }

    });

}


/* =========================================================
   BOTÃO VOLTAR AO TOPO
========================================================= */

function initBackToTop() {

    const links =
        getElements(
            'a[href="#top"]'
        );


    if (!links.length) {
        return;
    }


    links.forEach((link) => {

        if (
            !markInitialized(
                link,
                "back-to-top"
            )
        ) {
            return;
        }


        link.addEventListener(
            "click",
            (event) => {

                event.preventDefault();


                window.scrollTo({

                    top: 0,

                    behavior:
                        document.documentElement
                            .classList.contains(
                                "reduced-motion"
                            )
                            ? "auto"
                            : "smooth"

                });


                try {

                    history.pushState(
                        null,
                        "",
                        "#top"
                    );

                } catch (error) {
                    /* Ignora */
                }

            }
        );

    });

}


/* =========================================================
   EVENTOS DE TECLADO
========================================================= */

function initKeyboardAccessibility() {

    document.addEventListener(
        "keydown",
        (event) => {

            /*
             * ESC fecha elementos que tenham
             * a classe visual correspondente.
             */

            if (
                event.key === "Escape"
            ) {

                getElements(
                    ".is-open"
                ).forEach((element) => {

                    if (
                        element.tagName ===
                        "DETAILS"
                    ) {

                        element.open =
                            false;

                    }

                });

            }

        }
    );

}


/* =========================================================
   LIMPEZA DE INTERVALOS
========================================================= */

function destroyCyberNexis() {

    CYBER_NEXIS_STATE
        .clockIntervals
        .forEach((interval) => {

            window.clearInterval(
                interval
            );

        });


    CYBER_NEXIS_STATE
        .clockIntervals = [];


    CYBER_NEXIS_STATE
        .observers
        .forEach((observer) => {

            try {

                observer.disconnect();

            } catch (error) {
                /* Ignora */
            }

        });


    CYBER_NEXIS_STATE
        .observers = [];


    CYBER_NEXIS_STATE.initialized =
        false;

}


/* =========================================================
   CONSOLE
========================================================= */

function initConsoleMessage() {

    if (
        typeof console === "undefined"
    ) {
        return;
    }


    if (
        typeof console.info !==
        "function"
    ) {
        return;
    }


    console.info(
        "%cCYBER NEXIS",
        "font-weight:700;font-size:16px;"
    );


    console.info(
        "Sistema principal carregado."
    );


    console.info(
        "Ambiente educacional de cibersegurança responsável."
    );

}


/* =========================================================
   INICIALIZAÇÃO PRINCIPAL
========================================================= */

function initCyberNexis() {

    /*
     * Evita que chamadas repetidas
     * criem múltiplos eventos.
     */

    if (
        CYBER_NEXIS_STATE.initialized
    ) {
        return;
    }


    CYBER_NEXIS_STATE.initialized =
        true;


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

    initAccessibility();

    initBackToTop();

    initKeyboardAccessibility();

    initConsoleMessage();

}


/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initCyberNexis,
        {
            once: true
        }
    );

} else {

    initCyberNexis();

}


/* =========================================================
   API GLOBAL
========================================================= */

window.CyberNexis = {

    /*
     * Utilitários
     */

    getElement,

    getElements,

    elementExists,

    copyText,


    /*
     * Inicialização
     */

    init:
        initCyberNexis,


    /*
     * Controle

     * Útil caso futuramente o projeto
     * precise reconstruir componentes.
     */

    destroy:
        destroyCyberNexis,


    /*
     * Estado
     */

    state:
        CYBER_NEXIS_STATE,


    /*
     * Configuração
     */

    config:
        CYBER_NEXIS_CONFIG

};
