import React from "react";
import { useNavigate } from "react-router-dom";

export default function DataPolitics() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h2 className="mb-3">Política de Uso de Datos</h2>

      <h4 className="mt-4">Responsabilidad en el tratamiento de datos</h4>
      <p>
        En CipherSafe, tratamos tus datos con responsabilidad y transparencia.
        Esta política explica cómo recopilamos, usamos, almacenamos y protegemos
        tu información personal.
      </p>

      <h4 className="mt-4">Finalidad del uso de datos</h4>
      <ul>
        <li>
          Utilizamos los datos exclusivamente para ofrecer y mejorar nuestros
          servicios.
        </li>
        <li>
          Personalizamos la experiencia del usuario según sus preferencias.
        </li>
        <li>
          Analizamos el uso de la plataforma para detectar fallos y mejorar el
          rendimiento.
        </li>
      </ul>

      <h4 className="mt-4">Protección de datos</h4>
      <ul>
        <li>No vendemos ni transferimos tus datos personales a terceros.</li>
        <li>
          Los datos se almacenan en servidores seguros con cifrado de extremo a
          extremo.
        </li>
        <li>
          Aplicamos medidas técnicas y organizativas para proteger la integridad
          de los datos.
        </li>
      </ul>

      <h4 className="mt-4">Derechos del usuario</h4>
      <ul>
        <li>
          Puedes solicitar acceso, corrección o eliminación de tus datos en
          cualquier momento.
        </li>
        <li>
          Nos comprometemos a responder a tus solicitudes dentro de los plazos
          legales establecidos.
        </li>
      </ul>

      <p className="mt-4">
        Si tienes preguntas sobre el uso de tus datos, escríbenos a:{" "}
        <a href="mailto:datos@ciphersafe.com">datos@ciphersafe.com</a>
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
