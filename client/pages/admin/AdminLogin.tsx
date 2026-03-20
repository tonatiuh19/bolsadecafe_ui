import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  sendAdminCode,
  verifyAdminCode,
  validateAdminSession,
  clearAdminError,
  resetAdminOtp,
} from "@/store/slices/adminAuthSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  ArrowRight,
  Coffee,
  ShieldCheck,
  TrendingUp,
  Package,
  Users,
  ChevronLeft,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    label: "Métricas en tiempo real",
    desc: "Ingresos, suscripciones activas y más",
  },
  {
    icon: Package,
    label: "Pipeline de órdenes",
    desc: "Gestiona envíos con drag & drop",
  },
  {
    icon: Users,
    label: "Gestión de clientes",
    desc: "Visualiza y administra tu base de clientes",
  },
];

/* ── OTP digit-box input ─────────────────────────────────────── */
function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete: () => void;
  disabled?: boolean;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const focus = (i: number) => inputsRef.current[i]?.focus();

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        onChange(value.slice(0, i) + value.slice(i + 1));
      } else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i));
        focus(i - 1);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) {
      focus(i - 1);
    } else if (e.key === "ArrowRight" && i < 5) {
      focus(i + 1);
    } else if (e.key === "Enter" && value.length === 6) {
      onComplete();
    }
  };

  const handleChange = (i: number, raw: string) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    if (!char) return;
    const arr = [...digits];
    arr[i] = char;
    const next = arr.join("").slice(0, 6);
    onChange(next);
    if (i < 5) focus(i + 1);
    if (next.length === 6) onComplete();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted) {
      onChange(pasted);
      focus(Math.min(pasted.length, 5));
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          autoFocus={i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200 disabled:opacity-50
            ${
              d
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground"
            } focus:border-primary focus:ring-2 focus:ring-primary/20`}
        />
      ))}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function AdminLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    sessionToken,
    emailSent,
    emailForVerification,
    loading,
    error,
    verificationLoading,
    verificationError,
  } = useAppSelector((s) => s.adminAuth);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [validating, setValidating] = useState(!!sessionToken);

  // On mount: if a token exists in localStorage, validate it and redirect
  useEffect(() => {
    if (!sessionToken) return;
    dispatch(validateAdminSession())
      .unwrap()
      .then(() => navigate("/admin/dashboard"))
      .catch(() => setValidating(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also redirect if isAuthenticated flips true (after OTP verify)
  useEffect(() => {
    if (isAuthenticated) navigate("/admin/dashboard");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearAdminError());
    };
  }, [dispatch]);

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Email requerido");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Email inválido");
      return;
    }
    setEmailError("");
    dispatch(sendAdminCode(email.trim().toLowerCase()));
  };

  const handleVerify = () => {
    if (otpCode.length !== 6) return;
    dispatch(verifyAdminCode({ email: emailForVerification!, code: otpCode }));
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0d1b3e] via-[#152a63] to-[#1d3c89] flex-col items-center justify-center p-12 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />

        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_white.png"
              alt="Bolsadecafé"
              className="h-12 w-auto"
            />
          </div>

          {/* Coffee icon badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8 shadow-lg">
            <Coffee className="w-10 h-10 text-white/90" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Panel de
            <br />
            Administración
          </h1>
          <p className="text-blue-200 text-lg mb-12 leading-relaxed">
            Gestiona suscripciones, envíos y clientes de Bolsa de Café desde un
            solo lugar.
          </p>

          {/* Features list */}
          <div className="space-y-4 text-left">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-white/10">
                  <Icon className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-blue-300 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <span className="text-white/30 text-xs">v1.0 · Admin Panel</span>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50 dark:bg-neutral-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img
              src="https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_color.png"
              alt="Bolsadecafé"
              className="h-10 w-auto"
            />
          </div>

          {!emailSent ? (
            /* ── Step 1: Email ── */
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Acceso Restringido
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  Iniciar Sesión
                </h2>
                <p className="text-muted-foreground mt-2">
                  Ingresa tu correo de administrador y te enviaremos un código
                  de acceso.
                </p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Correo de Administrador
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@bolsadecafe.com"
                      className="pl-10 h-11"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                    />
                  </div>
                  {emailError && (
                    <p className="text-destructive text-xs">{emailError}</p>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-destructive text-sm font-medium">
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 font-semibold text-sm bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando código...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Enviar código de acceso
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* ── Step 2: OTP Code ── */
            <>
              <div className="mb-8">
                <button
                  onClick={() => {
                    dispatch(resetAdminOtp());
                    setOtpCode("");
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Cambiar correo
                </button>

                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
                  <Mail className="w-7 h-7 text-primary" />
                </div>

                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Revisa tu correo
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Enviamos un código de 6 dígitos a{" "}
                  <span className="font-semibold text-foreground">
                    {emailForVerification}
                  </span>
                  .
                  <br />
                  Expira en 15 minutos.
                </p>
              </div>

              <div className="space-y-6">
                <OtpInput
                  value={otpCode}
                  onChange={setOtpCode}
                  onComplete={handleVerify}
                  disabled={verificationLoading}
                />

                {verificationError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                    <p className="text-destructive text-sm font-medium">
                      {verificationError}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  className="w-full h-11 font-semibold text-sm bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md"
                  disabled={otpCode.length !== 6 || verificationLoading}
                >
                  {verificationLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verificando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Acceder al Panel
                    </span>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  ¿No recibiste el código?{" "}
                  <button
                    onClick={() =>
                      dispatch(sendAdminCode(emailForVerification!))
                    }
                    className="text-primary hover:underline font-medium disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Reenviar"}
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Back link */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Volver al sitio
            </a>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © 2026 Bolsa de Café · Acceso solo para administradores
          </p>
        </div>
      </div>
    </div>
  );
}
