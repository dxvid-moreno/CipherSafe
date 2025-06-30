import React, { useState } from "react";
import { Link } from "react-router-dom";

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
            <ul>
              <li>
                <p>Cómo empezar con CipherSafe</p>
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/watch?v=pDCsTIH6uXw&list=RDpDCsTIH6uXw&start_radio=1"
                  title="Inicio con CipherSafe"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </li>
              <li>
                <p>Gestión de contraseñas seguras</p>
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/watch?v=pDCsTIH6uXw&list=RDpDCsTIH6uXw&start_radio=1"
                  title="Contraseñas seguras"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </li>
            </ul>
          </div>
        );
      case "policies":
        return (
          <div>
            <h4>Políticas</h4>
            <p>
            Respetamos tu privacidad. Revisa nuestros{" "}
            <Link to="/PrivacyPolitics">términos y condiciones</Link> y{" "}
            <Link to="/DataPolitics">políticas de uso de datos</Link>.
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
          className={`btn btn-outline-primary ${section === "tutorials" ? "active" : ""}`}
          onClick={() => setSection("tutorials")}
        >
          Tutoriales
        </button>
        <button
          className={`btn btn-outline-primary ${section === "policies" ? "active" : ""}`}
          onClick={() => setSection("policies")}
        >
          Políticas
        </button>
        <button
          className={`btn btn-outline-primary ${section === "faq" ? "active" : ""}`}
          onClick={() => {
            setSection("faq");
            setReason("faq");
          }}
        >
          FAQ
        </button>
        <button
          className={`btn btn-outline-primary ${section === "contact" ? "active" : ""}`}
          onClick={() => {
            setSection("contact");
            setReason("contact");
          }}
        >
          Contactar soporte
        </button>
        <button
          className={`btn btn-outline-primary ${section === "report" ? "active" : ""}`}
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
