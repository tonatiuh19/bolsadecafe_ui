import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Home,
  Loader2,
  Package,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectSessionToken } from "@/store/slices/authSlice";
import {
  selectWizardData,
  resetWizardData,
} from "@/store/slices/subscriptionWizardSlice";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionToken = useAppSelector(selectSessionToken);
  const wizardData = useAppSelector(selectWizardData);

  useEffect(() => {
    const createSubscription = async () => {
      try {
        // Get parameters from URL
        const paymentIntentId = searchParams.get("payment_intent");
        const planId = searchParams.get("plan_id");
        const grindTypeId = searchParams.get("grind_type_id");

        if (!paymentIntentId || !planId) {
          setError("Datos de pago incompletos");
          setIsVerifying(false);
          return;
        }

        if (!sessionToken) {
          setError("Sesión no válida. Por favor inicia sesión.");
          setIsVerifying(false);
          return;
        }

        // Build address object from wizard data
        let addressData = null;
        if (
          wizardData.recipientName &&
          wizardData.streetAddress &&
          wizardData.city &&
          wizardData.stateId &&
          wizardData.postalCode
        ) {
          addressData = {
            full_name: wizardData.recipientName,
            street_address: wizardData.streetAddress,
            street_address_2: wizardData.streetAddress2 || null,
            city: wizardData.city,
            state_id: parseInt(wizardData.stateId),
            postal_code: wizardData.postalCode,
            phone: wizardData.recipientPhone || null,
            country: "MX",
            is_default: 1,
          };
        }

        // Create subscription record
        // Note: address is sent as fallback, but should already be stored
        // in PaymentIntent metadata from the payment intent creation step
        const response = await axios.post(
          "/api/subscriptions",
          {
            paymentIntentId,
            planId,
            grindTypeId: grindTypeId || null,
            address: addressData,
          },
          {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          },
        );

        if (response.data.success) {
          console.log("Subscription created:", response.data.subscription);
          // Clear wizard data after successful subscription
          dispatch(resetWizardData());
          setIsVerifying(false);
        } else {
          setError("No se pudo crear la suscripción");
          setIsVerifying(false);
        }
      } catch (err: any) {
        console.error("Error creating subscription:", err);
        setError(
          err.response?.data?.error || "Error al verificar la suscripción",
        );
        setIsVerifying(false);
      }
    };

    createSubscription();
  }, [searchParams, sessionToken, wizardData, dispatch]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-brand-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-neutral-600 text-lg font-medium">
            Verificando tu suscripción...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-brand-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl border border-red-200 shadow-xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Error al verificar suscripción
            </h1>
            <p className="text-neutral-600 text-lg mb-8 max-w-xl mx-auto">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-medium px-8 py-3 h-auto"
              >
                <Home className="mr-2 h-5 w-5" />
                Volver al Inicio
              </Button>
            </div>
            <p className="text-neutral-500 text-sm mt-8">
              Si necesitas ayuda, contáctanos en{" "}
              <a
                href="mailto:dihola@bolsadecafe.com"
                className="text-brand-600 hover:text-brand-700 font-medium underline"
              >
                dihola@bolsadecafe.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-brand-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl border border-brand-100 shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            ¡Suscripción Exitosa!
          </h1>

          {/* Description */}
          <p className="text-neutral-600 text-lg mb-8 max-w-xl mx-auto">
            Tu pago ha sido procesado correctamente. Recibirás un correo de
            confirmación con los detalles de tu suscripción.
          </p>

          {/* Info Cards */}
          <div className="bg-brand-50/50 border border-brand-200 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
            <div className="flex items-start space-x-4">
              <Package className="h-6 w-6 text-brand-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-neutral-900 mb-2">¿Qué sigue?</h3>
                <ul className="text-neutral-700 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>
                      Recibirás tu primer envío en los próximos 3-5 días hábiles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>
                      Te enviaremos un correo con el número de seguimiento
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-600 mr-2">•</span>
                    <span>
                      Puedes cancelar o modificar tu suscripción en cualquier
                      momento
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-medium px-8 py-3 h-auto"
            >
              <Home className="mr-2 h-5 w-5" />
              Volver al Inicio
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-neutral-500 text-sm mt-8">
            Si tienes alguna pregunta, contáctanos en{" "}
            <a
              href="mailto:dihola@bolsadecafe.com"
              className="text-brand-600 hover:text-brand-700 font-medium underline"
            >
              dihola@bolsadecafe.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
