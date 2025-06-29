import React from "react";

export default function PrivacyPolitics() {
  return (
    <div className="container mt-5">
      <h2>Política de Privacidad</h2>
      <p>
        En CipherSafe, respetamos tu privacidad y nos comprometemos a proteger tus datos
        personales. Esta política describe qué información recopilamos, cómo la usamos
        y cómo la protegemos.
      </p>
      <ul>
        <li>Solo recopilamos la información necesaria para brindarte nuestros servicios.</li>
        <li>No compartimos tu información con terceros sin tu consentimiento.</li>
        <li>Tus contraseñas se almacenan de forma cifrada.</li>
        <li>Puedes solicitar la eliminación de tus datos en cualquier momento.</li>
      </ul>
      <p>
        Si tienes dudas, puedes contactarnos en: <strong>soporte@ciphersafe.com</strong>
      </p>
    </div>
  );
}
