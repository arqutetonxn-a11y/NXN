"use strict";

/*
============================================================
 CYBER NEXIS
 SCRIPT PRINCIPAL
 js/script.js
============================================================

 Funções gerais utilizadas pelas páginas públicas do site.

 NÃO controla:
 - autenticação
 - testes
 - permissões do NEXUS

 Esses sistemas ficam em:
 - js/auth.js
 - js/tests.js
 - js/nexus.js

 Esta versão possui proteção contra carregamento duplicado.
============================================================
*/


(function () {

    /* =====================================================
       PROTEÇÃO CONTRA DUPLICAÇÃO DO SCRIPT
    ====================================================== */

    if (window.__CYBER_NEXIS_SCRIPT_LOADED__) {
        return;
    }

    window.__CYBER_NEXIS_SCRIPT_LOADED__ = true;


    /* =====================================================
       CONFIGURAÇÃO
    ====================================================== */

    const CYBER_NEXIS_CONFIG = {

        animationDuration: 350,

        scrollOffset: 80,

        mobileBreakpoint: 900,

        revealThreshold: 0.12,

        revealRootMargin: "0px 0px -40px 0px"

    };


    /*
     * Disponibiliza a configuração no objeto global
     * sem criar uma segunda const global.
     */

    window.CYBER_NEXIS_CONFIG =
        CYBER_NEXIS_CONFIG;


    /* =====================================================
       UTILITÁRIOS
    ====================================================== */

    function getElement(
        selector,
        parent = document
    ) {

        if (!selector || !parent) {
            return null;
        }

        try {

            return parent.querySelector(selector);

        } catch (error) {

            return null;

        }

    }


    function getElements(
        selector,
        parent = document
    ) {

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


    function elementExists(selector) {

        return Boolean(
            getElement(selector)
        );

    }


    /* =====================================================
       ANO AUTOMÁTICO
    ====================================================== */

    function updateCurrentYear() {

        const elements = getElements(
            "#currentYear, [data-current-year]"
        );


        if (!elements.length) {
            return;
        }


        const currentYear =
            new Date().getFullYear();


        elements.forEach((element) => {

            element.textContent =
                currentYear;

        });

    }


    /* =====================================================
       MENU MOBILE
    ====================================================== */

    function initMobileMenu() {

        const menuToggle =
            getElement("#menuToggle");

        const navigation =
            getElement("#mainNavigation");


        if (!menuToggle || !navigation) {
            return;
        }


        /*
         * Evita inicialização duplicada caso
         * algum outro código tente chamar a função.
         */

        if (
            menuToggle.dataset.cyberNexisMenuInitialized ===
            "true"
        ) {

            return;

        }


        menuToggle.dataset.cyberNexisMenuInitialized =
            "true";


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


        /*
         * Fecha o menu ao clicar em um link.
         */

        const navigationLinks =
            getElements(
                "a",
                navigation
            );


        navigationLinks.forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    closeMenu();

                }
            );

        });


        /*
         * Fecha ao clicar fora.
         */

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


        /*
         * Fecha com ESC.
         */

        document.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Escape") {

                    closeMenu();

                }

            }
        );


        /*
         * Fecha ao voltar para desktop.
         */

        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth >
                    CYBER_NEXIS_CONFIG.mobileBreakpoint
                ) {

                    closeMenu();

                }

            }
        );

    }


    /* =====================================================
       NAVEGAÇÃO SUAVE
    ====================================================== */

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
                link.dataset.cyberNexisSmoothInitialized ===
                "true"
            ) {

                return;

            }


            link.dataset.cyberNexisSmoothInitialized =
                "true";


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
                     * Evita tentar interpretar URLs
                     * especiais como seletores.
                     */

                    if (
                        !targetId.startsWith("#")
                    ) {

                        return;

                    }


                    let target = null;


                    try {

                        target =
                            getElement(
                                targetId
                            );

                    } catch (error) {

                        return;

                    }


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    const targetPosition =
                        target.getBoundingClientRect()
                            .top +
                        window.scrollY -
                        CYBER_NEXIS_CONFIG.scrollOffset;


                    window.scrollTo({

                        top: Math.max(
                            0,
                            targetPosition
                        ),

                        behavior:
                            document.documentElement
                                .classList
                                .contains(
                                    "reduced-motion"
                                )
                                ? "auto"
                                : "smooth"

                    });

                }
            );

        });

    }


    /* =====================================================
       HEADER AO ROLAR
    ====================================================== */

    function initScrollHeader() {

        const header =
            getElement(".site-header");


        if (!header) {
            return;
        }


        if (
            header.dataset.cyberNexisScrollInitialized ===
            "true"
        ) {

            return;

        }


        header.dataset.cyberNexisScrollInitialized =
            "true";


        const updateHeader =
            () => {

                if (
                    window.scrollY > 30
                ) {

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
            {
                passive: true
            }
        );

    }


    /* =====================================================
       REVEAL DE SEÇÕES
    ====================================================== */

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
                .classList
                .contains(
                    "reduced-motion"
                )
        ) {

            revealElements.forEach(
                (element) => {

                    element.classList.add(
                        "is-visible"
                    );

                }
            );

            return;

        }


        /*
         * Fallback para navegadores sem
         * IntersectionObserver.
         */

        if (
            !(
                "IntersectionObserver"
                in window
            )
        ) {

            revealElements.forEach(
                (element) => {

                    element.classList.add(
                        "is-visible"
                    );

                }
            );

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


        revealElements.forEach(
            (element) => {

                observer.observe(
                    element
                );

            }
        );

    }


    /* =====================================================
       VÍDEOS
    ====================================================== */

    function initVideos() {

        const videos =
            getElements("video");


        if (!videos.length) {
            return;
        }


        videos.forEach((video) => {

            if (
                video.dataset.cyberNexisVideoInitialized ===
                "true"
            ) {

                return;

            }


            video.dataset.cyberNexisVideoInitialized =
                "true";


            /*
             * Compatibilidade mobile.
             */

            video.setAttribute(
                "playsinline",
                ""
            );


            /*
             * Vídeos com autoplay precisam
             * estar mutados.
             */

            if (
                video.hasAttribute("autoplay") &&
                !video.hasAttribute("muted")
            ) {

                video.muted = true;

            }


            /*
             * Tratamento de erro.
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


    /* =====================================================
       IMAGENS
    ====================================================== */

    function initImages() {

        const images =
            getElements("img");


        if (!images.length) {
            return;
        }


        images.forEach((image) => {

            if (
                image.dataset.cyberNexisImageInitialized ===
                "true"
            ) {

                return;

            }


            image.dataset.cyberNexisImageInitialized =
                "true";


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


    /* =====================================================
       LINKS EXTERNOS
    ====================================================== */

    function initExternalLinks() {

        const links =
            getElements(
                "a[href]"
            );


        links.forEach((link) => {

            const href =
                link.getAttribute(
                    "href"
                );


            if (!href) {
                return;
            }


            /*
             * Links internos e protocolos especiais
             * não recebem target="_blank".
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
                 * URLs especiais são ignoradas.
                 */

            }

        });

    }


    /* =====================================================
       COPIAR TEXTO
    ====================================================== */

    function copyText(text) {

        if (
            typeof text !== "string" ||
            !text
        ) {

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
                text
            );

        }


        /*
         * Fallback.
         */

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            text;


        textarea.setAttribute(
            "readonly",
            ""
        );


        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";

        textarea.style.top =
            "0";

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


            if (!successful) {

                return Promise.reject(
                    new Error(
                        "Não foi possível copiar o texto."
                    )
                );

            }


            return Promise.resolve();

        } catch (error) {

            document.body.removeChild(
                textarea
            );


            return Promise.reject(
                error
            );

        }

    }


    /* =====================================================
       BOTÕES DE COPIAR
    ====================================================== */

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
                button.dataset.cyberNexisCopyInitialized ===
                "true"
            ) {

                return;

            }


            button.dataset.cyberNexisCopyInitialized =
                "true";


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


    /* =====================================================
       DETAILS / FAQ
    ====================================================== */

    function initDetails() {

        const details =
            getElements(
                "details"
            );


        if (!details.length) {
            return;
        }


        details.forEach((item) => {

            if (
                item.dataset.cyberNexisDetailsInitialized ===
                "true"
            ) {

                return;

            }


            item.dataset.cyberNexisDetailsInitialized =
                "true";


            /*
             * Estado inicial.
             */

            if (item.open) {

                item.classList.add(
                    "is-open"
                );

            }


            item.addEventListener(
                "toggle",
                () => {

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


    /* =====================================================
       STATUS VISUAL
    ====================================================== */

    function initStatusIndicators() {

        const indicators =
            getElements(
                "[data-status-indicator]"
            );


        if (!indicators.length) {
            return;
        }


        indicators.forEach(
            (indicator) => {

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

            }
        );

    }


    /* =====================================================
       PROTEÇÃO DE FORMULÁRIOS
    ====================================================== */

    function initFormProtection() {

        const forms =
            getElements("form");


        if (!forms.length) {
            return;
        }


        forms.forEach((form) => {

            if (
                form.dataset.cyberNexisFormInitialized ===
                "true"
            ) {

                return;

            }


            form.dataset.cyberNexisFormInitialized =
                "true";


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


    /* =====================================================
       REDUÇÃO DE MOVIMENTO
    ====================================================== */

    function initReducedMotion() {

        if (
            !window.matchMedia
        ) {

            return;

        }


        const mediaQuery =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );


        function updateMotionPreference() {

            if (
                mediaQuery.matches
            ) {

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

        } else if (
            typeof mediaQuery.addListener ===
            "function"
        ) {

            mediaQuery.addListener(
                updateMotionPreference
            );

        }

    }


    /* =====================================================
       DATA ATUAL
    ====================================================== */

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


        elements.forEach(
            (element) => {

                element.textContent =
                    formattedDate;

            }
        );

    }


    /* =====================================================
       RELÓGIO
    ====================================================== */

    function initClockElements() {

        const clocks =
            getElements(
                "[data-live-clock]"
            );


        if (!clocks.length) {
            return;
        }


        /*
         * Um único intervalo global.
         */

        if (
            window.__CYBER_NEXIS_CLOCK_INTERVAL__
        ) {

            window.clearInterval(
                window.__CYBER_NEXIS_CLOCK_INTERVAL__
            );

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


            clocks.forEach(
                (clock) => {

                    clock.textContent =
                        time;

                }
            );

        }


        updateClock();


        window.__CYBER_NEXIS_CLOCK_INTERVAL__ =
            window.setInterval(
                updateClock,
                1000
            );

    }


    /* =====================================================
       CONTADOR DE CARACTERES
    ====================================================== */

    function initCharacterCounters() {

        const textareas =
            getElements(
                "textarea[maxlength]"
            );


        if (!textareas.length) {
            return;
        }


        textareas.forEach(
            (textarea) => {

                const maxLength =
                    Number(
                        textarea.getAttribute(
                            "maxlength"
                        )
                    );


                if (
                    !Number.isFinite(
                        maxLength
                    )
                ) {

                    return;

                }


                /*
                 * Procura contador específico
                 * do formulário de contato.
                 */

                let counter = null;


                if (
                    textarea.id ===
                    "contactMessage"
                ) {

                    counter =
                        getElement(
                            "#messageCounter"
                        );

                }


                /*
                 * Também suporta:
                 * data-counter-target
                 */

                if (!counter) {

                    const counterSelector =
                        textarea.getAttribute(
                            "data-counter-target"
                        );


                    if (
                        counterSelector
                    ) {

                        counter =
                            getElement(
                                counterSelector
                            );

                    }

                }


                if (!counter) {
                    return;
                }


                function updateCounter() {

                    const length =
                        textarea.value.length;


                    counter.textContent =
                        `${length} / ${maxLength}`;


                    if (
                        length >=
                        maxLength
                    ) {

                        counter.classList.add(
                            "is-limit"
                        );

                    } else {

                        counter.classList.remove(
                            "is-limit"
                        );

                    }

                }


                if (
                    textarea.dataset.cyberNexisCounterInitialized ===
                    "true"
                ) {

                    updateCounter();

                    return;

                }


                textarea.dataset.cyberNexisCounterInitialized =
                    "true";


                textarea.addEventListener(
                    "input",
                    updateCounter
                );


                updateCounter();

            }
        );

    }


    /* =====================================================
       ACESSIBILIDADE
    ====================================================== */

    function initAccessibility() {

        /*
         * Adiciona uma classe quando o usuário
         * utiliza navegação por teclado.
         */

        let usingKeyboard = false;


        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Tab"
                ) {

                    usingKeyboard = true;

                    document.documentElement.classList.add(
                        "keyboard-navigation"
                    );

                }

            }
        );


        document.addEventListener(
            "mousedown",
            () => {

                if (!usingKeyboard) {
                    return;
                }


                usingKeyboard = false;


                document.documentElement.classList.remove(
                    "keyboard-navigation"
                );

            }
        );

    }


    /* =====================================================
       BACK TO TOP
    ====================================================== */

    function initBackToTop() {

        const button =
            getElement(
                "[data-back-to-top], #backToTop"
            );


        if (!button) {
            return;
        }


        if (
            button.dataset.cyberNexisBackTopInitialized ===
            "true"
        ) {

            return;

        }


        button.dataset.cyberNexisBackTopInitialized =
            "true";


        const updateButton =
            () => {

                if (
                    window.scrollY >
                    500
                ) {

                    button.classList.add(
                        "is-visible"
                    );

                    button.removeAttribute(
                        "aria-hidden"
                    );

                } else {

                    button.classList.remove(
                        "is-visible"
                    );

                }

            };


        updateButton();


        window.addEventListener(
            "scroll",
            updateButton,
            {
                passive: true
            }
        );


        button.addEventListener(
            "click",
            () => {

                window.scrollTo({

                    top: 0,

                    behavior:
                        document.documentElement
                            .classList
                            .contains(
                                "reduced-motion"
                            )
                            ? "auto"
                            : "smooth"

                });

            }
        );

    }


    /* =====================================================
       LINKS DE NAVEGAÇÃO / HISTÓRICO
    ====================================================== */

    function initBackNavigation() {

        const buttons =
            getElements(
                "[data-go-back]"
            );


        if (!buttons.length) {
            return;
        }


        buttons.forEach(
            (button) => {

                if (
                    button.dataset.cyberNexisBackInitialized ===
                    "true"
                ) {

                    return;

                }


                button.dataset.cyberNexisBackInitialized =
                    "true";


                button.addEventListener(
                    "click",
                    () => {

                        if (
                            window.history.length >
                            1
                        ) {

                            window.history.back();

                        } else {

                            window.location.href =
                                "index.html";

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       CONFIRMAÇÕES
    ====================================================== */

    function initConfirmActions() {

        const elements =
            getElements(
                "[data-confirm]"
            );


        if (!elements.length) {
            return;
        }


        elements.forEach(
            (element) => {

                if (
                    element.dataset.cyberNexisConfirmInitialized ===
                    "true"
                ) {

                    return;

                }


                element.dataset.cyberNexisConfirmInitialized =
                    "true";


                element.addEventListener(
                    "click",
                    (event) => {

                        const message =
                            element.getAttribute(
                                "data-confirm"
                            );


                        if (!message) {
                            return;
                        }


                        const confirmed =
                            window.confirm(
                                message
                            );


                        if (!confirmed) {

                            event.preventDefault();

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       STATUS GLOBAL
    ====================================================== */

    function initGlobalStatus() {

        const elements =
            getElements(
                "[data-global-status]"
            );


        if (!elements.length) {
            return;
        }


        elements.forEach(
            (element) => {

                element.textContent =
                    "ONLINE";

                element.dataset.status =
                    "online";

            }
        );

    }


    /* =====================================================
       CONSOLE
    ====================================================== */

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
            "font-weight: bold; font-size: 16px;"
        );


        console.info(
            "Sistema carregado."
        );

    }


    /* =====================================================
       INICIALIZAÇÃO PRINCIPAL
    ====================================================== */

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

        initCharacterCounters();

        initAccessibility();

        initBackToTop();

        initBackNavigation();

        initConfirmActions();

        initGlobalStatus();

        initConsoleMessage();

    }


    /* =====================================================
       DOM READY
    ====================================================== */

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


    /* =====================================================
       API GLOBAL
    ====================================================== */

    window.CyberNexis = {

        getElement,

        getElements,

        elementExists,

        copyText,

        init: initCyberNexis

    };


})();
