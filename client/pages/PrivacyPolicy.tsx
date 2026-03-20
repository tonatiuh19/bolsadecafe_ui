import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Coffee } from "lucide-react";
import SEOMeta from "@/components/SEOMeta";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <SEOMeta
        title="Política de Privacidad"
        description="Política de privacidad y uso de datos de Bolsadecafé."
        path="/privacy"
      />

      {/* Header */}
      <header className="border-b border-neutral-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-neutral-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Volver al inicio
          </Button>
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-brand-700" />
            <span className="font-bold text-neutral-900 text-sm">
              Bolsadecafé
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 mb-3">
            Política de Privacidad
          </h1>
          <p className="text-neutral-500 text-sm">
            Última actualización: 16 de marzo de 2026
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              1. Información que Recopilamos
            </h2>
            <p>
              En Bolsadecafé recopilamos la información necesaria para brindarle
              nuestro servicio de suscripción de café. Esto incluye:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-neutral-600">
              <li>
                Nombre completo y datos de contacto (correo electrónico,
                teléfono)
              </li>
              <li>Dirección de entrega</li>
              <li>Preferencias de producto (tipo de molido)</li>
              <li>
                Información de facturación procesada por Stripe (no almacenamos
                datos de tarjetas)
              </li>
              <li>Historial de pedidos y suscripciones</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              2. Uso de la Información
            </h2>
            <p>Utilizamos su información exclusivamente para:</p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-neutral-600">
              <li>Procesar y entregar su pedido mensual de café</li>
              <li>Gestionar su cuenta y suscripción</li>
              <li>
                Enviar confirmaciones de pedido y notificaciones de entrega
              </li>
              <li>Mejorar nuestros productos y servicios</li>
              <li>Cumplir con obligaciones legales y fiscales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              3. Protección de Datos
            </h2>
            <p>
              Implementamos medidas técnicas y organizativas adecuadas para
              proteger su información personal contra acceso no autorizado,
              alteración, divulgación o destrucción. Sus datos son almacenados
              en servidores seguros y el acceso está restringido al personal
              autorizado.
            </p>
            <p className="mt-3">
              Los pagos son procesados íntegramente por Stripe, un proveedor de
              pagos certificado con los más altos estándares de seguridad (PCI
              DSS). Bolsadecafé no almacena información de tarjetas de crédito o
              débito en sus servidores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              4. Compartir Información
            </h2>
            <p>
              No vendemos, comercializamos ni transferimos su información
              personal a terceros, excepto en los siguientes casos:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-neutral-600">
              <li>Proveedores de logística para realizar las entregas</li>
              <li>Stripe para el procesamiento de pagos</li>
              <li>Autoridades competentes cuando así lo requiera la ley</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              5. Cookies y Tecnologías Similares
            </h2>
            <p>
              Nuestro sitio web puede utilizar cookies técnicas necesarias para
              el correcto funcionamiento de la plataforma. No utilizamos cookies
              de rastreo de terceros para publicidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              6. Sus Derechos
            </h2>
            <p>Usted tiene derecho a:</p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-neutral-600">
              <li>Acceder a sus datos personales almacenados</li>
              <li>Rectificar información incorrecta o incompleta</li>
              <li>Solicitar la cancelación o eliminación de sus datos</li>
              <li>
                Oponerse al tratamiento de sus datos con fines comerciales
              </li>
            </ul>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos, contáctenos en
              hola@bolsadecafe.mx con el asunto "Derechos ARCO".
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              7. Retención de Datos
            </h2>
            <p>
              Conservamos su información personal durante el tiempo que mantenga
              activa su cuenta o suscripción, y por el período posterior
              requerido por las leyes fiscales y contables aplicables en México.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              8. Cambios a esta Política
            </h2>
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Le
              notificaremos sobre cambios significativos enviando un correo
              electrónico a la dirección registrada en su cuenta. Le
              recomendamos revisar esta página regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              9. Contacto
            </h2>
            <p>
              Si tiene preguntas sobre esta Política de Privacidad o sobre el
              tratamiento de sus datos personales, contáctenos:
            </p>
            <div className="mt-3 bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-1">
              <p>
                <strong>Email:</strong> hola@bolsadecafe.mx
              </p>
              <p>
                <strong>Teléfono:</strong> +52 55 1234 5678
              </p>
              <p>
                <strong>Dirección:</strong> Ciudad de México, México
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-6 text-center text-neutral-400 text-xs">
        © 2026 Bolsadecafé. Todos los derechos reservados.
      </footer>
    </div>
  );
}
