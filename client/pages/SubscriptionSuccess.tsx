import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Home,
  Coffee,
  Truck,
  Bell,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAppDispatch } from "@/store/hooks";
import { resetWizardData } from "@/store/slices/subscriptionWizardSlice";

const steps = [
  {
    icon: Coffee,
    title: "Café en camino",
    description: "Estamos preparando tu selección artesanal con mucho cariño.",
    color: "bg-brand-100 text-brand-700",
    border: "border-brand-200",
  },
  {
    icon: Truck,
    title: "Envío en 3–5 días",
    description:
      "Recibirás un correo con tu número de seguimiento cuando salga tu paquete.",
    color: "bg-brand-200 text-brand-800",
    border: "border-brand-300",
  },
  {
    icon: Bell,
    title: "Renueva automático",
    description:
      "Tu suscripción se cobra cada mes. Puedes pausarla o cancelarla cuando quieras.",
    color: "bg-brand-50 text-brand-600",
    border: "border-brand-100",
  },
];

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    dispatch(resetWizardData());

    // Trigger entrance animation
    const t1 = setTimeout(() => setVisible(true), 80);

    // Guard: only run confetti once (StrictMode double-mount safe)
    if (hasRun.current) return;
    hasRun.current = true;

    // First burst — centred cannon
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: ["#1d3c89", "#3b5fc0", "#f59e0b", "#10b981", "#ffffff"],
      zIndex: 9999,
    });

    // Side cannons after a short delay
    const t2 = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#1d3c89", "#f59e0b", "#ffffff"],
        zIndex: 9999,
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#1d3c89", "#f59e0b", "#ffffff"],
        zIndex: 9999,
      });
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      {/* Decorative blurred circles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div
        className={`relative max-w-lg w-full transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Glowing border wrapper */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-brand-400/40 via-transparent to-amber-400/30 pointer-events-none" />

        <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-amber-400 to-emerald-400" />

          <div className="px-6 pt-10 pb-8 sm:px-10 text-center">
            {/* Animated checkmark */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="h-12 w-12 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Coffee cups */}
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "scale(1)" : "scale(0.5)",
                    transition: `opacity 0.4s ease ${300 + i * 120}ms, transform 0.4s ease ${300 + i * 120}ms`,
                  }}
                >
                  <Coffee className="h-4 w-4 text-brand-600" />
                </div>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-3 tracking-tight">
              ¡Suscripción Exitosa!
            </h1>
            <p className="text-neutral-500 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
              Bienvenido al club del café mexicano premium.{" "}
              <span className="text-brand-700 font-semibold">
                Tu primer envío ya está en proceso.
              </span>
            </p>
          </div>

          {/* Steps */}
          <div className="px-6 sm:px-10 pb-6 space-y-3">
            {steps.map(
              ({ icon: Icon, title, description, color, border }, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 p-4 rounded-2xl border ${border} bg-white transition-all duration-500`}
                  style={{
                    transitionDelay: `${200 + i * 100}ms`,
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-16px)",
                  }}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-neutral-900 text-sm">
                      {title}
                    </p>
                    <p className="text-neutral-500 text-xs leading-relaxed mt-0.5">
                      {description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Divider */}
          <div className="mx-6 sm:mx-10 border-t border-neutral-100 mb-6" />

          {/* CTA */}
          <div className="px-6 sm:px-10 pb-8 flex flex-col gap-3">
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-base h-12 rounded-xl shadow-md hover:shadow-lg transition-all group"
            >
              <Home className="mr-2 h-5 w-5" />
              Volver al Inicio
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-neutral-400 text-xs text-center">
              ¿Dudas? Escríbenos a{" "}
              <a
                href="mailto:dihola@bolsadecafe.com"
                className="text-brand-600 hover:text-brand-700 font-semibold underline underline-offset-2"
              >
                dihola@bolsadecafe.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
