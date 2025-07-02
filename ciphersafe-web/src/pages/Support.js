import React, { useState } from "react";

export default function Support() {
  const [section, setSection] = useState("tutorials");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("contact");
  const [submissionStatus, setSubmissionStatus] = useState(null);

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
    {
      question: "¿Qué hago si olvidé mi contraseña maestra?",
      answer:
        "Si olvidaste tu contraseña maestra, utiliza la opción de recuperación desde la página de inicio de sesión. Se te pedirá verificar tu identidad mediante el correo electrónico registrado.",
    },
    {
      question: "¿Puedo acceder a mis contraseñas desde otro dispositivo?",
      answer:
        "Sí. Solo necesitas iniciar sesión con tu cuenta en otro dispositivo. Recuerda habilitar la autenticación de dos factores para mayor seguridad.",
    },
    {
      question: "¿Cómo funciona la autenticación de dos factores (2FA)?",
      answer:
        "La autenticación de dos factores añade una capa extra de seguridad. Debes ingresar un código temporal que recibirás en tu correo o aplicación autenticadora al iniciar sesión.",
    },
    {
      question: "¿Qué tan segura está mi información?",
      answer:
        "CipherSafe cifra tus contraseñas usando algoritmos de seguridad avanzados. Solo tú puedes acceder a ellas con tu clave maestra.",
    },
    {
      question: "¿Puedo exportar mis contraseñas?",
      answer:
        "Por ahora, la exportación de contraseñas no está disponible por seguridad. Estamos evaluando formas seguras de implementarla en futuras versiones.",
    },
    {
      question: "¿Qué hago si sospecho que alguien intentó acceder a mi cuenta?",
      answer:
        "Cambia tu contraseña de inmediato y revisa la sección de alertas de seguridad. Si detectas actividad sospechosa, contáctanos por el formulario de soporte.",
    },
    {
      question: "¿Puedo usar CipherSafe sin conexión a internet?",
      answer:
        "No, actualmente necesitas estar conectado a internet para acceder a tus contraseñas, ya que están almacenadas de forma segura en la nube.",
    },
    {
      question: "¿Es necesario registrarse para usar la aplicación?",
      answer:
        "Sí, necesitas crear una cuenta para poder guardar y gestionar tus contraseñas de forma segura.",
    },
  ];

  const tutorials = [
    {
      title: "¿Qué es CipherSafe?",
      videoUrl: "https://www.youtube.com/embed/-tq52xQsKFs",
      description: "Una introducción general a la aplicación y su propósito.",
    },
    {
      title: "¿Cómo empezar con CipherSafe?",
      videoUrl: "https://www.youtube.com/embed/ePHLIkfITdU",
      description:
        "Primeros pasos: registro, inicio de sesión y generación de contraseñas.",
    },
    {
      title: "Gestión de contraseñas seguras",
      videoUrl: "https://www.youtube.com/embed/e7nX_KJRfnE",
      description: "Cómo guardar, visualizar y organizar tus contraseñas.",
    },
    {
      title: "Gestión de contraseñas seguras",
      videoUrl: "https://www.youtube.com/embed/Pyw3_q7KF-I",
      description: "Cómo guardar, visualizar y organizar tus contraseñas.",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !message) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    setSubmissionStatus("submitting");

    const recipientEmail = "juan.morenodx@gmail.com";
    const subject = encodeURIComponent(
      `Formulario de Soporte: ${reason.toUpperCase()}`
    );
    const body = encodeURIComponent(
      `Motivo: ${reason.toUpperCase()}\nDe: ${email}\n\nMensaje:\n${message}`
    );

    const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    setSubmissionStatus("success");
    setEmail("");
    setMessage("");

      // Ocultar mensaje de éxito después de 10 segundos
      setTimeout(() => {
        setSubmissionStatus(null);
      }, 10000);
  };

  const renderUnifiedForm = () => (
    <div>
      <h4>Formulario de Soporte</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Motivo</label>
          <select
            className="form-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="faq">Consulta (FAQ)</option>
            <option value="contact">Contactar soporte</option>
            <option value="report">Reportar error</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Tu correo electrónico</label>
          <input
            type="email"
            className="form-control"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Mensaje</label>
          <textarea
            className="form-control"
            rows="4"
            placeholder="Describe tu consulta o problema..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">
          Enviar
        </button>
        {submissionStatus === "success" && (
          <div className="text-success mt-2">¡Mensaje enviado correctamente!</div>
        )}
      </form>
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case "tutorials":
        return (
          <div>
            <h4>Tutoriales</h4>
            <p>Guías paso a paso para usar CipherSafe:</p>

            <div className="row">
              {tutorials.map((tut, index) => (
                <div className="col-md-6 mb-4" key={index}>
                  <div className="card h-100 shadow-sm">
                    <iframe
                      className="card-img-top"
                      width="100%"
                      height="250"
                      src={tut.videoUrl}
                      title={tut.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    <div className="card-body">
                      <h5 className="card-title">{tut.title}</h5>
                      <p className="card-text">{tut.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "policies":
        return (
          <div>
            <h4>Políticas</h4>
            <p>
              Respetamos tu privacidad. Revisa nuestros{" "}
              <a
                href="/PrivacyPolitics"
                target="_blank"
                rel="noopener noreferrer"
              >
                términos y condiciones
              </a>{" "}
              y{" "}
              <a
                href="/DataPolitics"
                target="_blank"
                rel="noopener noreferrer"
              >
                políticas de uso de datos
              </a>
              .
            </p>
          </div>
        );
      case "faq":
        return (
          <div>
            <h4>Preguntas Frecuentes</h4>
            <ul className="list-group">
              {faqs.map((faq, index) => (
                <li key={index} className="list-group-item">
                  <strong>{faq.question}</strong>
                  <p>{faq.answer}</p>
                </li>
              ))}
            </ul>
          </div>
        );
      case "report":
      case "contact":
        return renderUnifiedForm();
      default:
        return null;
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Soporte</h2>
      <p>¿Necesitas ayuda? Aquí encontrarás recursos y contacto directo.</p>

      <div className="mb-4 d-flex flex-wrap gap-2">
        <button
          className={`btn btn-outline-primary ${
            section === "tutorials" ? "active" : ""
          }`}
          onClick={() => setSection("tutorials")}
        >
          Tutoriales
        </button>
        <button
          className={`btn btn-outline-primary ${
            section === "policies" ? "active" : ""
          }`}
          onClick={() => setSection("policies")}
        >
          Políticas
        </button>
        <button
          className={`btn btn-outline-primary ${
            section === "faq" ? "active" : ""
          }`}
          onClick={() => {
            setSection("faq");
            setReason("faq");
          }}
        >
          FAQ
        </button>
        <button
          className={`btn btn-outline-primary ${
            section === "contact" ? "active" : ""
          }`}
          onClick={() => {
            setSection("contact");
            setReason("contact");
          }}
        >
          Contactar soporte
        </button>
        <button
          className={`btn btn-outline-primary ${
            section === "report" ? "active" : ""
          }`}
          onClick={() => {
            setSection("report");
            setReason("report");
          }}
        >
          Reportar error
        </button>
      </div>

      <div>{renderSection()}</div>
    </div>
  );
}
