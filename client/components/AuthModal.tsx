import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  User,
  Coffee,
  Phone,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  sendVerificationCode,
  verifyCode,
  registerUser,
  resetVerification,
  resetRegistration,
  selectEmailSent,
  selectEmailForVerification,
  selectVerificationLoading,
  selectVerificationError,
  selectRegistrationRequired,
  selectRegistrationLoading,
  selectRegistrationError,
  selectAuthLoading,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/* ── OTP digit-box input ─────────────────────────────────────── */
function OtpInput({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete: () => void;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const focus = (i: number) => inputsRef.current[i]?.focus();

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = value.slice(0, i) + value.slice(i + 1);
        onChange(next);
      } else if (i > 0) {
        const next = value.slice(0, i - 1) + value.slice(i);
        onChange(next);
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
    const arr = digits.map((d) => d);
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
          autoFocus={i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200
            ${
              d
                ? "border-brand-600 bg-brand-50 text-brand-800 shadow-sm"
                : "border-neutral-200 bg-neutral-50 text-neutral-900"
            }
            focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:bg-white`}
        />
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function AuthModal({
  open,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const dispatch = useAppDispatch();

  const emailSent = useAppSelector(selectEmailSent);
  const emailForVerification = useAppSelector(selectEmailForVerification);
  const verificationLoading = useAppSelector(selectVerificationLoading);
  const verificationError = useAppSelector(selectVerificationError);
  const registrationRequired = useAppSelector(selectRegistrationRequired);
  const registrationLoading = useAppSelector(selectRegistrationLoading);
  const registrationError = useAppSelector(selectRegistrationError);
  const authLoading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<"MX" | "US">("MX");

  if (isAuthenticated && open) onSuccess();

  const handleSendCode = async () => {
    if (!email) return;
    await dispatch(sendVerificationCode(email));
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6 || !emailForVerification) return;
    const result = await dispatch(
      verifyCode({ email: emailForVerification, code: verificationCode }),
    );
    if (!result.meta.requestStatus) onSuccess();
  };

  const handleRegister = async () => {
    if (!email || !fullName || !phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const phoneWithCode =
      phoneCountry === "US" ? `+1${cleanPhone}` : `+52${cleanPhone}`;
    await dispatch(registerUser({ email, fullName, phone: phoneWithCode }));
  };

  const handleClose = () => {
    dispatch(resetVerification());
    dispatch(resetRegistration());
    setEmail("");
    setVerificationCode("");
    setFullName("");
    setPhone("");
    setPhoneCountry("MX");
    onClose();
  };

  /* ── derived step ── */
  const step = registrationRequired
    ? "register"
    : emailSent
      ? "verify"
      : "email";

  const stepMeta = {
    email: {
      icon: <Coffee className="h-7 w-7 text-white" />,
      title: "Bienvenido de vuelta",
      subtitle: "Ingresa tu correo para continuar",
      step: 1,
    },
    verify: {
      icon: <ShieldCheck className="h-7 w-7 text-white" />,
      title: "Revisa tu correo",
      subtitle: `Enviamos un código a ${emailForVerification}`,
      step: 2,
    },
    register: {
      icon: <Sparkles className="h-7 w-7 text-white" />,
      title: "Crea tu cuenta",
      subtitle: "Solo tardará un momento",
      step: 3,
    },
  }[step];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl gap-0">
        {/* ── Top accent band ── */}
        <div className="relative bg-gradient-to-br from-neutral-100 via-brand-50 to-white px-8 pt-8 pb-10 overflow-hidden border-b border-neutral-100">
          {/* subtle brand circle */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-brand-100/40" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-brand-50/60" />

          {/* step dots */}
          <div className="flex gap-2 justify-center mb-6 relative z-10">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`rounded-full transition-all duration-300 ${
                  s === stepMeta.step
                    ? "w-6 h-2 bg-brand-600"
                    : s < stepMeta.step
                      ? "w-2 h-2 bg-brand-400"
                      : "w-2 h-2 bg-neutral-300"
                }`}
              />
            ))}
          </div>

          {/* icon */}
          <div className="flex justify-center mb-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-700 flex items-center justify-center shadow-lg shadow-brand-700/30">
              {stepMeta.icon}
            </div>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 text-center leading-tight relative z-10">
            {stepMeta.title}
          </h2>
          <p className="text-neutral-500 text-sm text-center mt-1.5 leading-relaxed relative z-10">
            {stepMeta.subtitle}
          </p>
        </div>

        {/* ── Form card ── */}
        <div className="bg-white px-6 pt-6 pb-6 space-y-5">
          {/* ── STEP: email ── */}
          {step === "email" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="auth-email"
                  className="text-sm font-semibold text-neutral-700"
                >
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400" />
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                    className="pl-10 h-12 border-2 border-neutral-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-sm"
                    autoFocus
                  />
                </div>
              </div>

              <Button
                onClick={handleSendCode}
                disabled={authLoading || !email.trim()}
                className="w-full h-12 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-800 hover:to-brand-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <span>Enviar Código</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-neutral-400 text-center leading-relaxed">
                Te enviaremos un código de 6 dígitos para verificar tu
                identidad.
              </p>
            </div>
          )}

          {/* ── STEP: verify ── */}
          {step === "verify" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700 font-medium">
                  Código enviado — revisa tu bandeja
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-700 text-center block">
                  Ingresa el código de 6 dígitos
                </Label>
                <OtpInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  onComplete={handleVerifyCode}
                />
                <p className="text-xs text-neutral-400 text-center mt-1">
                  Expira en 15 minutos
                </p>
              </div>

              {verificationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center">
                  {verificationError}
                </div>
              )}

              <Button
                onClick={handleVerifyCode}
                disabled={verificationLoading || verificationCode.length !== 6}
                className="w-full h-12 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-800 hover:to-brand-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {verificationLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <span>Verificar e Ingresar</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <button
                onClick={() => {
                  dispatch(resetVerification());
                  setVerificationCode("");
                }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-neutral-500 hover:text-brand-700 transition-colors py-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Usar otro correo
              </button>
            </div>
          )}

          {/* ── STEP: register ── */}
          {step === "register" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="reg-email"
                  className="text-sm font-semibold text-neutral-700"
                >
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="reg-email"
                    type="email"
                    value={email}
                    disabled
                    className="pl-10 h-11 border-2 border-neutral-100 bg-neutral-50 rounded-xl text-sm text-neutral-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="reg-name"
                  className="text-sm font-semibold text-neutral-700"
                >
                  Nombre Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 z-10" />
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12 border-2 border-neutral-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-sm"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Teléfono
                </Label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  onCountryChange={(c) => setPhoneCountry(c as "MX" | "US")}
                  defaultCountry="MX"
                />
              </div>

              {registrationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center">
                  {registrationError}
                </div>
              )}

              <Button
                onClick={handleRegister}
                disabled={
                  registrationLoading ||
                  !fullName.trim() ||
                  !phone ||
                  phone.replace(/\D/g, "").length !== 10
                }
                className="w-full h-12 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-800 hover:to-brand-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {registrationLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>Crear Cuenta y Continuar</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
