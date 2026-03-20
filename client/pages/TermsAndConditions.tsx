import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Coffee } from "lucide-react";
import SEOMeta from "@/components/SEOMeta";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <SEOMeta
        title="Términos y Condiciones"
        description="Términos y condiciones del servicio de suscripción de café Bolsadecafé."
        path="/terms"
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
            Términos y Condiciones
          </h1>
          <p className="text-neutral-500 text-sm">
            Última actualización: 16 de marzo de 2026
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al suscribirse y utilizar los servicios de Bolsadecafé, usted
              acepta quedar legalmente obligado por estos Términos y
              Condiciones. Si no está de acuerdo con alguno de estos términos,
              le recomendamos no utilizar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              2. Descripción del Servicio
            </h2>
            <p>
              Bolsadecafé ofrece un servicio de suscripción mensual de café
              mexicano premium, tostado artesanalmente. Nuestros planes incluyen
              la entrega mensual de café de distintos gramajes (250gr, 500gr o
              1kg) directamente al domicilio del suscriptor en la República
              Mexicana.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-neutral-600">
              <li>Café 100% mexicano de especialidad</li>
              <li>Tostado en lotes pequeños antes de cada envío</li>
              <li>Envío gratuito a toda la República Mexicana</li>
              <li>Posibilidad de elegir tipo de molido</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              3. Suscripción y Pagos
            </h2>
            <p>
              La suscripción se cobra mensualmente de manera automática mediante
              el método de pago registrado. El monto a cobrar corresponde al
              plan seleccionado y se indica claramente antes de confirmar la
              suscripción.
            </p>
            <p className="mt-3">
              Los pagos son procesados de forma segura a través de Stripe.
              Bolsadecafé no almacena información de tarjetas de crédito o
              débito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              4. Cancelación y Reembolsos
            </h2>
            <p>
              El suscriptor puede cancelar su suscripción en cualquier momento
              desde su panel de cuenta. La cancelación entrará en vigor al
              finalizar el período de facturación vigente, por lo que no se
              realizarán cargos adicionales.
            </p>
            <p className="mt-3">
              No se realizan reembolsos por períodos ya facturados. En caso de
              problemas con la entrega o calidad del producto, contáctenos a
              hola@bolsadecafe.mx para resolver el inconveniente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              5. Entrega
            </h2>
            <p>
              Los envíos se realizan a toda la República Mexicana sin costo
              adicional. Los tiempos de entrega varían entre 3 y 7 días hábiles
              dependiendo de la ubicación. Bolsadecafé no se responsabiliza por
              retrasos causados por factores externos como desastres naturales,
              huelgas o restricciones gubernamentales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              6. Modificaciones al Servicio
            </h2>
            <p>
              Bolsadecafé se reserva el derecho de modificar, suspender o
              discontinuar cualquier aspecto del servicio en cualquier momento,
              con o sin previo aviso. En caso de cambios sustanciales,
              notificaremos a los suscriptores activos por correo electrónico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              7. Limitación de Responsabilidad
            </h2>
            <p>
              Bolsadecafé no será responsable de daños indirectos, incidentales
              o consecuentes derivados del uso o imposibilidad de uso del
              servicio. La responsabilidad máxima de Bolsadecafé se limita al
              monto pagado por el suscriptor en el mes en que ocurrió el
              incidente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              8. Contacto
            </h2>
            <p>
              Para cualquier duda o aclaración relacionada con estos Términos y
              Condiciones, puede contactarnos en:
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
