import React, { useState } from "react";



export default function Support() {
  const [section, setSection] = useState("tutorials");
  const [email, setEmail] = useState(""); // Estado para el correo del remitente
  const [message, setMessage] = useState(""); // Estado para el mensaje
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success', 'error', 'submitting'
/*
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue

    if (!email || !message) {
      alert("Por favor, completa ambos campos: correo y mensaje.");
      return;
    }

    setSubmissionStatus("submitting");

    // Construye el enlace mailto
    const recipientEmail = "cristhiandf001@gmail.com"; // correo de soporte
    const subject = encodeURIComponent("Soporte para CipherSafe");
    const body = encodeURIComponent(`De: ${email}\n\nMensaje:\n${message}`);

    const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    // Abre el cliente de correo del usuario
    window.location.href = mailtoLink;

    // Aquí puedes resetear el formulario o mostrar un mensaje al usuario
    setSubmissionStatus("success");
    setEmail("");
    setMessage("");

    // Opcional: podrías poner un pequeño retraso antes de resetear
    // setTimeout(() => {
    //   setSubmissionStatus(null);
    // }, 3000);
  };
*/
  const faqs = [
    {
      question: "¿Cómo genero una contraseña segura?",
      answer:
        "Puedes usar nuestro generador de contraseñas integrado, asegurándote de incluir una combinación de letras mayúsculas y minúsculas, números y símbolos.",
    },
    {
      question: "¿Cómo restablezco mi cuenta?",
      answer:
        'Para restablecer tu cuenta, ve a la página de inicio de sesión y haz clic en "Olvidé mi contraseña". Sigue los pasos para verificar tu identidad y establecer una nueva contraseña.',
    },
    //
  ];

  const renderSection = () => {
    switch (section) {
      case "tutorials":
        return (
          <div>
            <h4>Tutoriales</h4>
            <p>Aquí encontrarás guías paso a paso para usar CipherSafe.</p>
            <ul>
              <li>
                <p>Cómo empezar con CipherSafe</p>
                <a href="#tutorial-getting-started">
                  
                </a>
              </li>
              <li>
                <p>Generar y gestionar contraseñas seguras</p>
                <a href="#tutorial-secure-passwords">
                  
                </a>
              </li>
              <li>
                <p>Configuración de autenticación de dos factores</p>
                <a href="#tutorial-two-factor">
                  
                </a>
              </li>
            </ul>

            {/* Agrega más contenido o enlaces aquí */}
          </div>
        );
      case "policies":
        return (
          <div>
            <h4>Políticas</h4>
            <p>
              Consulta nuestras políticas de privacidad y términos de servicio.
            </p>
          </div>
        );
      case "contact":
        return (
          <div>
            <h4>Contactar Soporte</h4>
            <form>
              <div className="mb-3">
                <label className="form-label">Tu correo electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Mensaje</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Describe tu problema o duda..."
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Enviar
              </button>
            </form>
          </div>
        );
      case "faq":
        return (
          <div>
            <h4>Preguntas Frecuentes (FAQ)</h4>
            <div className="accordion" id="faqAccordion">
              {faqs.map((faq, index) => (
                <div className="accordion-item" key={index}>
                  <h2 className="accordion-header" id={`heading${index}`}>
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse" // Requiere Bootstrap JS
                      data-bs-target={`#collapse${index}`}
                      aria-expanded="false"
                      aria-controls={`collapse${index}`}
                    >
                      {faq.question}
                    </button>
                  </h2>
                  <div
                    id={`collapse${index}`}
                    className="accordion-collapse collapse"
                    aria-labelledby={`heading${index}`}
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">{faq.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "report":
        return (
          <div>
            <h4>Reporte de errores</h4>
            <p>
              Si encontraste un bug, por favor repórtalo usando el formulario de
              contacto
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Soporte</h2>
      <p>Esta es la sección de ayuda o soporte técnico.</p>

      <div className="mb-4 d-flex flex-wrap gap-2">
        <button
          className="btn btn-outline-primary"
          onClick={() => setSection("tutorials")}
        >
          Tutoriales
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => setSection("policies")}
        >
          Políticas
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => setSection("contact")}
        >
          Contactar
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => setSection("faq")}
        >
          FAQ
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => setSection("report")}
        >
          Reportar error
        </button>
      </div>

      <div>{renderSection()}</div>
    </div>
  );
}
