import { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, CreditCard, Calendar, ShieldCheck } from "lucide-react";

const STRIPE_STYLE = {
  style: {
    base: {
      fontSize: "15px",
      color: "#111827",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      "::placeholder": { color: "#9ca3af" },
      iconColor: "#1d3c89",
    },
    invalid: { color: "#ef4444", iconColor: "#ef4444" },
  },
};

const fieldClass =
  "flex items-center gap-3 px-4 py-3.5 border-2 border-neutral-200 rounded-xl bg-white focus-within:border-brand-500 transition-colors";

interface StripeCheckoutFormProps {
  clientSecret: string;
  onSuccess: (paymentMethodId: string) => Promise<void>;
  onError: (error: string) => void;
}

export default function StripeCheckoutForm({
  clientSecret,
  onSuccess,
  onError,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) return;

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const { error, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        { payment_method: { card: cardNumber } },
      );

      if (error) {
        setErrorMessage(
          error.message || "Ocurrió un error al guardar la tarjeta",
        );
        onError(error.message || "Error al guardar la tarjeta");
      } else if (setupIntent?.status === "succeeded") {
        // Await so isProcessing stays true during subscription creation
        await onSuccess(setupIntent.payment_method as string);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error inesperado al procesar la tarjeta";
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card number */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
          Número de tarjeta
        </label>
        <div className={fieldClass}>
          <CreditCard className="h-4 w-4 text-brand-500 flex-shrink-0" />
          <div className="flex-1">
            <CardNumberElement options={STRIPE_STYLE} />
          </div>
        </div>
      </div>

      {/* Expiry + CVC */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
            Vencimiento
          </label>
          <div className={fieldClass}>
            <Calendar className="h-4 w-4 text-brand-500 flex-shrink-0" />
            <div className="flex-1">
              <CardExpiryElement options={STRIPE_STYLE} />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
            CVC
          </label>
          <div className={fieldClass}>
            <ShieldCheck className="h-4 w-4 text-brand-500 flex-shrink-0" />
            <div className="flex-1">
              <CardCvcElement options={STRIPE_STYLE} />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-brand-50/50 border border-brand-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lock className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-neutral-900 text-sm mb-1">
              Tarjeta segura
            </h5>
            <p className="text-neutral-600 text-xs leading-relaxed">
              Tu tarjeta se guarda de forma segura en Stripe con encriptación
              SSL. Nunca almacenamos los datos de tu tarjeta en nuestros
              servidores.
            </p>
          </div>
        </div>
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
            Guardando tarjeta...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Guardar tarjeta y suscribirme
          </>
        )}
      </Button>

      <p className="text-neutral-500 text-xs text-center">
        Tu tarjeta se usará para cobrar mensualmente. Puedes cambiarla o
        cancelar en cualquier momento desde tu cuenta.
      </p>
    </form>
  );
}
