particlesJS("particles-js", {
  particles: {
    number: {
      value: 92,
      density: {
        enable: true,
        value_area: 900
      }
    },

    color: {
      value: ["#19b9ff", "#55d8ff", "#0d82c2"]
    },

    shape: {
      type: "circle"
    },

    opacity: {
      value: 0.42,
      random: true
    },

    size: {
      value: 2.4,
      random: true
    },

    line_linked: {
      enable: true,
      distance: 155,
      color: "#138bc5",
      opacity: 0.28,
      width: 1
    },

    move: {
      enable: true,
      speed: 1.15,
      direction: "none",
      random: true,
      straight: false,
      out_mode: "out",
      bounce: false
    }
  },

  interactivity: {
    detect_on: "canvas",

    events: {
      onhover: {
        enable: true,
        mode: "grab"
      },

      onclick: {
        enable: false
      },

      resize: true
    },

    modes: {
      grab: {
        distance: 155,
        line_linked: {
          opacity: 0.48
        }
      }
    }
  },

  retina_detect: true
});
