import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolitics() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h2 className="mb-3">Política de Privacidad</h2>

      <h4 className="mt-4">Introducción</h4>
      <p>
        En <strong>CipherSafe</strong>, valoramos tu privacidad y nos
        comprometemos a proteger tus datos personales. Esta política describe la
        información que recopilamos, cómo la utilizamos y las medidas que
        tomamos para protegerla.
      </p>

      <h4 className="mt-4">Información que recopilamos</h4>
      <ul>
        <li>Nombre y dirección de correo electrónico.</li>
        <li>Información de inicio de sesión y actividad.</li>
        <li>
          Preferencias de usuario relacionadas con el uso de la aplicación.
        </li>
      </ul>

      <h4 className="mt-4">Uso de la información</h4>
      <ul>
        <li>Para crear y administrar tu cuenta.</li>
        <li>Para mejorar la seguridad y funcionalidad de la aplicación.</li>
        <li>
          Para enviarte notificaciones importantes relacionadas con tu cuenta.
        </li>
      </ul>

      <h4 className="mt-4">Protección de la información</h4>
      <ul>
        <li>Tus contraseñas están cifradas con algoritmos seguros.</li>
        <li>Los datos se almacenan en servidores protegidos.</li>
        <li>
          Solo el personal autorizado puede acceder a tus datos cuando es
          estrictamente necesario.
        </li>
      </ul>

      <h4 className="mt-4">Tus derechos</h4>
      <ul>
        <li>
          Puedes solicitar acceso, corrección o eliminación de tus datos
          personales.
        </li>
        <li>
          Puedes cerrar tu cuenta en cualquier momento desde la configuración.
        </li>
      </ul>

      <p className="mt-4">
        Si tienes preguntas, puedes contactarnos en:{" "}
        <a href="mailto:soporte@ciphersafe.com">soporte@ciphersafe.com</a>
      </p>
      <p>
        <em>Última actualización: Julio de 2025</em>
      </p>

      <a href="/support" className="btn btn-secondary mt-3">
        Volver
      </a>
      
    </div>
  );
}
