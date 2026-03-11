import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, CreditCard } from "lucide-react";

interface StripeCheckoutFormProps {
  amount: number;
  planId: string;
  grindTypeId?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripeCheckoutForm({
  amount,
  planId,
  grindTypeId,
  onSuccess,
  onError,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription/success?plan_id=${planId}${grindTypeId ? `&grind_type_id=${grindTypeId}` : ""}`,
        },
      });

      if (error) {
        setErrorMessage(
          error.message || "Ocurrió un error al procesar el pago",
        );
        onError(error.message || "Error al procesar el pago");
      } else {
        onSuccess();
      }
    } catch (err) {
      const message = "Error inesperado al procesar el pago";
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Payment Element */}
      <div className="min-h-[200px]">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card"],
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fadeIn">
          <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-brand-50/50 border border-brand-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lock className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-neutral-900 text-sm mb-1">
              Pago 100% seguro
            </h5>
            <p className="text-neutral-600 text-xs leading-relaxed">
              Tu información está protegida con encriptación SSL. No almacenamos
              datos de tu tarjeta. Procesado por Stripe.
            </p>
          </div>
        </div>
      </div>

      {/* Amount Summary */}
      <div className="border-t border-neutral-200 pt-4">
        <div className="flex justify-between items-center mb-6">
          <span className="text-neutral-600 font-medium">
            Total a pagar hoy:
          </span>
          <span className="text-2xl font-bold text-brand-700">
            ${amount} MXN
          </span>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-base h-12 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Procesando pago...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Suscribirme por ${amount} MXN/mes
            </>
          )}
        </Button>
      </div>

      {/* Subscription Notice */}
      <p className="text-neutral-500 text-xs text-center">
        Al confirmar, aceptas que se te cobrará ${amount} MXN cada mes hasta que
        canceles tu suscripción.
      </p>
    </form>
  );
}
