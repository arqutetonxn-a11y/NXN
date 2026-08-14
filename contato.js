document.addEventListener("DOMContentLoaded", function () {
  const EMAILJS_CONFIG = {
    publicKey: "COLE_AQUI_SUA_PUBLIC_KEY",
    serviceId: "COLE_AQUI_SEU_SERVICE_ID",
    templateId: "template_cdmbrrc"
  };

  const form = document.getElementById("contact-form");
  const resposta = document.getElementById("resposta");
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!form || !resposta) {
    console.error("Formulário de contato não encontrado no HTML.");
    return;
  }

  const configuracaoPendente = Object.values(EMAILJS_CONFIG)
    .some(valor => valor.startsWith("COLE_AQUI"));

  if (!configuracaoPendente) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const honeypot = document.getElementById("hp-field");
    if (honeypot?.value !== "") {
      return;
    }

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const mensagem = document.getElementById("mensagem").value.trim();

    resposta.replaceChildren();

    if (nome.length < 3) {
      showMessage("alert-erro", "Nome deve ter no mínimo 3 caracteres.");
      return;
    }

    if (!validateEmail(email)) {
      showMessage("alert-erro", "Digite um email válido.");
      return;
    }

    if (mensagem.length < 10) {
      showMessage("alert-erro", "A mensagem deve ter pelo menos 10 caracteres.");
      return;
    }

    if (configuracaoPendente) {
      showMessage(
        "alert-erro",
        "Configure a Public Key e o Service ID do EmailJS no arquivo contato.js."
      );
      return;
    }

    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("loading");
    loadingDiv.textContent = "Enviando mensagem...";
    resposta.appendChild(loadingDiv);

    if (submitButton) {
      submitButton.disabled = true;
    }

    const templateParams = {
      from_name: nome,
      email,
      reply_to: email,
      message: mensagem
    };

    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      resposta.replaceChildren();
      showMessage("alert-sucesso", "Mensagem enviada com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro do EmailJS:", error);
      resposta.replaceChildren();
      showMessage("alert-erro", "Erro ao enviar mensagem. Tente novamente.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });

  function showMessage(type, text) {
    resposta.replaceChildren();

    const div = document.createElement("div");
    div.classList.add("alert", type);
    div.textContent = text;
    resposta.appendChild(div);

    setTimeout(() => div.remove(), 5000);
  }

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
});
