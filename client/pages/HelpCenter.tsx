import { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { submitContact, resetContactForm } from "@/store/slices/helpSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SEOMeta from "@/components/SEOMeta";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  MessageCircle,
  Package,
  CreditCard,
  Truck,
  UserCircle,
  Coffee,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Star,
  Clock,
  Mail,
} from "lucide-react";
import type { ContactTopic } from "@shared/api";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

interface Faq {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  faqs: Faq[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "suscripcion",
    label: "Suscripciones",
    icon: Coffee,
    color: "text-brand-600 bg-brand-50 border-brand-100",
    faqs: [
      {
        q: "¿Qué es la suscripción de Bolsadecafé?",
        a: "Es un servicio de entrega mensual que trae café mexicano premium, recién tostado en lotes pequeños, directo a tu hogar u oficina. Sin contratos de largo plazo ni cargos ocultos.",
      },
      {
        q: "¿Qué planes de suscripción están disponibles?",
        a: "Ofrecemos planes desde 250g hasta 1kg de café mensual. Cada plan incluye envío gratis en toda la República Mexicana y puedes elegir tu tipo de molido.",
      },
      {
        q: "¿Puedo cambiar mi plan en cualquier momento?",
        a: "Sí. Desde tu panel de cuenta puedes cambiar a un plan mayor o menor. El cambio aplica a partir del siguiente ciclo de facturación.",
      },
      {
        q: "¿Con qué frecuencia llega mi café?",
        a: "Tu suscripción se renueva mensualmente y el envío se despacha dentro de los primeros días de cada ciclo, garantizando que recibas café fresco tostado ese mes.",
      },
      {
        q: "¿Puedo pausar mi suscripción?",
        a: "Actualmente puedes cancelar en cualquier momento, sin penalización. La función de pausa está en desarrollo y estará disponible pronto.",
      },
      {
        q: "¿Cómo cancelo mi suscripción?",
        a: "Accede a tu cuenta, abre el panel de suscripción y selecciona «Cancelar Suscripción». La suscripción seguirá activa hasta el fin del período ya pagado.",
      },
    ],
  },
  {
    id: "producto",
    label: "Café y Producto",
    icon: Package,
    color: "text-amber-700 bg-amber-50 border-amber-100",
    faqs: [
      {
        q: "¿De dónde es el café que envían?",
        a: "Trabajamos con productores de las principales regiones cafetaleras de México: Chiapas, Veracruz, Oaxaca y Guerrero. Todos nuestros cafés tienen trazabilidad directa al productor.",
      },
      {
        q: "¿El café siempre llega fresco?",
        a: "Tostamos en lotes pequeños justo antes de cada ciclo de envío para garantizar la máxima frescura. Cada bolsa indica la fecha de tueste.",
      },
      {
        q: "¿Qué tipos de molido están disponibles?",
        a: "Ofrecemos: Grano entero, Molido grueso (prensa francesa), Molido medio (filtrado / goteo), Molido fino (espresso) y Molido muy fino (moka). Puedes elegir al suscribirte o cambiarlo desde tu cuenta.",
      },
      {
        q: "¿Los granos son orgánicos o de comercio justo?",
        a: "La mayoría de nuestros socios cafetaleros son productores orgánicos. Publicamos en cada temporada los perfiles de los lotes disponibles. Escríbenos para más detalles sobre certificaciones específicas.",
      },
      {
        q: "¿Puedo recibir un café diferente cada mes?",
        a: "Actualmente el perfil de café puede variar ligeramente según la temporada de cosecha. Estamos desarrollando la opción de selección mensual por suscriptores.",
      },
    ],
  },
  {
    id: "envios",
    label: "Envíos y Entregas",
    icon: Truck,
    color: "text-emerald-700 bg-emerald-50 border-emerald-100",
    faqs: [
      {
        q: "¿Cuánto cuesta el envío?",
        a: "El envío es completamente gratis en toda la República Mexicana para todos los planes de suscripción.",
      },
      {
        q: "¿Cuánto tarda en llegar mi pedido?",
        a: "Los envíos se despachan dentro de los primeros 3 días hábiles del ciclo. El tiempo de entrega varía entre 2 y 5 días hábiles según tu estado.",
      },
      {
        q: "¿Puedo cambiar mi dirección de entrega?",
        a: "Sí. Accede a tu cuenta y actualiza tu dirección de envío en cualquier momento. Los cambios aplican al próximo envío siempre que se realicen antes del inicio del ciclo.",
      },
      {
        q: "¿Qué pasa si no estoy en casa cuando llega el paquete?",
        a: "Puedes agregar instrucciones de entrega en tu perfil (ej. «Dejar con el portero»). El paquete también puede dejarse en un punto de recolección de la paquetería si así lo indica el mensajero.",
      },
      {
        q: "¿Realizan envíos a toda la República Mexicana?",
        a: "Sí, enviamos a todos los estados de México sin costo adicional.",
      },
      {
        q: "¿Puedo rastrear mi paquete?",
        a: "Te notificaremos por email con el número de guía una vez que tu paquete sea despachado. Podrás rastrear directamente en el sitio de la paquetería.",
      },
    ],
  },
  {
    id: "pagos",
    label: "Pagos y Facturación",
    icon: CreditCard,
    color: "text-violet-700 bg-violet-50 border-violet-100",
    faqs: [
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos todas las tarjetas de crédito y débito principales: Visa, Mastercard y American Express. Los pagos son procesados de forma segura por Stripe.",
      },
      {
        q: "¿Cuándo se realiza el cargo?",
        a: "El cargo se realiza en la fecha de inicio de cada ciclo mensual. El primer cargo es inmediato al suscribirte.",
      },
      {
        q: "¿Mis datos bancarios están seguros?",
        a: "Sí. No almacenamos datos de tu tarjeta en nuestros servidores. Todos los pagos son procesados por Stripe, que cumple con el estándar PCI DSS nivel 1.",
      },
      {
        q: "¿Puedo actualizar mi método de pago?",
        a: "Sí. Desde tu panel de cuenta puedes administrar tu método de pago a través del portal seguro de Stripe.",
      },
      {
        q: "¿Emiten facturas (CFDI)?",
        a: "Actualmente estamos implementando la facturación electrónica. Si necesitas una factura de forma urgente, contáctanos por correo y te apoyamos manualmente.",
      },
      {
        q: "¿Qué pasa si mi pago falla?",
        a: "Si un cargo falla, te notificaremos por email. Tendrás un período de gracia para actualizar tu método de pago antes de que la suscripción sea suspendida.",
      },
    ],
  },
  {
    id: "cuenta",
    label: "Mi Cuenta",
    icon: UserCircle,
    color: "text-sky-700 bg-sky-50 border-sky-100",
    faqs: [
      {
        q: "¿Cómo creo una cuenta?",
        a: "Haz clic en «Ingresar» en el menú de inicio. Ingresa tu correo electrónico y te enviaremos un código de acceso de un solo uso. No necesitas contraseña.",
      },
      {
        q: "¿Por qué no recibo el código de acceso?",
        a: "Revisa tu carpeta de spam o correo no deseado. Si sigue sin llegar, puede haber un retraso de hasta 2 minutos. También verifica que hayas escrito tu correo correctamente.",
      },
      {
        q: "¿Puedo tener varias suscripciones activas?",
        a: "Sí. Puedes tener múltiples suscripciones activas bajo la misma cuenta, por ejemplo, una para el hogar y otra para la oficina.",
      },
      {
        q: "¿Cómo actualizo mi nombre o teléfono?",
        a: "Actualmente el nombre y teléfono de contacto se actualizan a nivel de cada suscripción (persona de entrega). Una gestión de perfil global estará disponible próximamente.",
      },
      {
        q: "¿Cómo cierro sesión?",
        a: "Abre el panel de cuenta desde el menú superior y encontrarás la opción de cerrar sesión al final del panel.",
      },
    ],
  },
];

// ─── Topic config for contact form ───────────────────────────────────────────

const TOPIC_OPTIONS: {
  value: ContactTopic;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    value: "suscripcion",
    label: "Suscripción",
    icon: Coffee,
    description: "Cambios, pausas o cancelaciones",
  },
  {
    value: "pagos",
    label: "Pagos y Facturación",
    icon: CreditCard,
    description: "Cobros, tarjetas o facturas",
  },
  {
    value: "envios",
    label: "Envíos y Entregas",
    icon: Truck,
    description: "Rastreo, retrasos o cambio de dirección",
  },
  {
    value: "cuenta",
    label: "Mi Cuenta",
    icon: UserCircle,
    description: "Acceso, perfil o seguridad",
  },
  {
    value: "producto",
    label: "Café y Producto",
    icon: Package,
    description: "Calidad, molido o variedades",
  },
  {
    value: "otro",
    label: "Otro tema",
    icon: HelpCircle,
    description: "Cualquier otra consulta",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FaqItem({ q, a }: Faq) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        open ? "border-brand-200 shadow-sm" : "border-neutral-100"
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left flex items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors"
      >
        <span className="text-sm font-semibold text-neutral-800">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-brand-500 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Wizard step indicator ────────────────────────────────────────────────────

function StepDot({
  step,
  current,
  label,
}: {
  step: number;
  current: number;
  label: string;
}) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
          done
            ? "bg-brand-600 border-brand-600 text-white"
            : active
              ? "bg-white border-brand-600 text-brand-600"
              : "bg-white border-neutral-200 text-neutral-400"
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <span
        className={`text-xs hidden sm:block ${active ? "text-brand-700 font-semibold" : "text-neutral-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

function StepConnector({ done }: { done: boolean }) {
  return (
    <div
      className={`flex-1 h-0.5 mt-4 transition-all ${done ? "bg-brand-600" : "bg-neutral-200"}`}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HelpCenter() {
  const dispatch = useAppDispatch();
  const { submitting, submitted, error } = useAppSelector((s) => s.help);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("suscripcion");
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<ContactTopic | null>(null);

  const contactRef = useRef<HTMLDivElement>(null);

  // Reset form when coming back
  useEffect(() => {
    return () => {
      dispatch(resetContactForm());
    };
  }, [dispatch]);

  // Filtered FAQs for search
  const searchResults =
    searchQuery.trim().length >= 2
      ? FAQ_CATEGORIES.flatMap((cat) =>
          cat.faqs
            .filter(
              (f) =>
                f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.a.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((f) => ({ ...f, category: cat.label })),
        )
      : [];

  const activeCategoryData = FAQ_CATEGORIES.find(
    (c) => c.id === activeCategory,
  );

  // ── Contact wizard form (steps 2–3) ──────────────────────────────────────
  const contactForm = useFormik({
    initialValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "Mínimo 2 caracteres")
        .required("Tu nombre es requerido"),
      email: Yup.string()
        .email("Correo inválido")
        .required("Tu correo es requerido"),
      subject: Yup.string()
        .min(5, "Escribe un asunto más descriptivo")
        .max(200, "Máximo 200 caracteres")
        .required("El asunto es requerido"),
      message: Yup.string()
        .min(20, "Por favor escribe al menos 20 caracteres")
        .max(2000, "Máximo 2000 caracteres")
        .required("El mensaje es requerido"),
    }),
    onSubmit: (values) => {
      if (!selectedTopic) return;
      dispatch(
        submitContact({
          name: values.name,
          email: values.email,
          topic: selectedTopic,
          subject: values.subject,
          message: values.message,
        }),
      );
    },
  });

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const startWizard = (topic?: ContactTopic) => {
    if (topic) {
      setSelectedTopic(topic);
      setWizardStep(2);
    } else {
      setWizardStep(1);
      setSelectedTopic(null);
    }
    scrollToContact();
  };

  const handleTopicSelect = (topic: ContactTopic) => {
    setSelectedTopic(topic);
    setWizardStep(2);
  };

  const handleRestart = () => {
    setWizardStep(1);
    setSelectedTopic(null);
    contactForm.resetForm();
    dispatch(resetContactForm());
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <SEOMeta
        title="Centro de Ayuda — Bolsadecafé"
        description="Encuentra respuestas a tus preguntas sobre suscripciones, envíos, pagos y más. Contáctanos si necesitas ayuda personalizada."
      />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 shadow-sm shadow-neutral-900/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-brand-700 hover:text-brand-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Volver al inicio</span>
          </Link>
          <img
            src="https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_dark.png"
            alt="Bolsadecafé"
            className="h-7"
          />
          <div className="w-24" />
        </div>
      </header>

      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white px-4 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/15 text-xs uppercase tracking-widest">
              Centro de Ayuda
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
              ¿En qué podemos <span className="text-amber-300">ayudarte?</span>
            </h1>
            <p className="text-brand-200 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Encuentra respuestas rápidas o escríbenos directamente.
              Respondemos en menos de 24 horas hábiles.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca entre las preguntas frecuentes…"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-neutral-800 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-lg shadow-brand-900/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-8 mt-10 text-sm text-brand-200">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Respuesta en &lt;24h
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                Soporte en español
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                Equipo local
              </span>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 space-y-16">
          {/* ── Search results ──────────────────────────────────────────── */}
          {searchQuery.trim().length >= 2 && (
            <section>
              <h2 className="text-lg font-bold text-neutral-800 mb-4">
                {searchResults.length > 0
                  ? `${searchResults.length} resultado${searchResults.length !== 1 ? "s" : ""} para "${searchQuery}"`
                  : `Sin resultados para "${searchQuery}"`}
              </h2>
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((f, i) => (
                    <div key={i}>
                      <p className="text-xs text-brand-600 font-semibold mb-1 pl-1">
                        {f.category}
                      </p>
                      <FaqItem q={f.q} a={f.a} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-neutral-100 bg-neutral-50 text-center">
                  <HelpCircle className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm mb-4">
                    No encontramos respuesta a "{searchQuery}". ¿Quieres
                    contactarnos directamente?
                  </p>
                  <Button
                    onClick={() => startWizard()}
                    className="bg-brand-700 hover:bg-brand-800 text-white"
                  >
                    Enviar mensaje
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* ── FAQ section ─────────────────────────────────────────────── */}
          {!searchQuery.trim() && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-neutral-900">
                    Preguntas Frecuentes
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    Selecciona un tema para ver las respuestas
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startWizard()}
                  className="hidden sm:flex items-center gap-2 border-brand-200 text-brand-700 hover:bg-brand-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contactar soporte
                </Button>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                {FAQ_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all whitespace-nowrap
                        ${isActive ? `${cat.color} border-current shadow-sm` : "border-neutral-100 text-neutral-500 hover:border-neutral-200 bg-white"}`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* FAQs for active category */}
              {activeCategoryData && (
                <div className="space-y-2">
                  {activeCategoryData.faqs.map((f, i) => (
                    <FaqItem key={i} {...f} />
                  ))}
                  <div className="pt-4 text-center">
                    <p className="text-sm text-neutral-500 mb-3">
                      ¿No encontraste lo que buscabas?
                    </p>
                    <Button
                      onClick={() =>
                        startWizard(activeCategoryData.id as ContactTopic)
                      }
                      variant="outline"
                      className="border-brand-200 text-brand-700 hover:bg-brand-50"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Preguntar sobre {activeCategoryData.label}
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── Contact wizard ───────────────────────────────────────────── */}
          <section ref={contactRef} className="scroll-mt-20">
            <div className="rounded-3xl border border-neutral-100 bg-white shadow-sm shadow-neutral-900/5 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 px-6 sm:px-10 py-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-black text-xl">
                      Contáctanos
                    </h2>
                    <p className="text-brand-200 text-sm">
                      Te respondemos en menos de 24 horas hábiles
                    </p>
                  </div>
                </div>

                {/* Step indicator */}
                {!submitted && (
                  <div className="flex items-center gap-2 mt-6">
                    <StepDot step={1} current={wizardStep} label="Tema" />
                    <StepConnector done={wizardStep > 1} />
                    <StepDot step={2} current={wizardStep} label="Detalles" />
                    <StepConnector done={wizardStep > 2} />
                    <StepDot
                      step={3}
                      current={submitted ? 3 : wizardStep}
                      label="Enviado"
                    />
                  </div>
                )}
              </div>

              <div className="px-6 sm:px-10 py-8">
                {/* ── Step 1: Topic selector ──────────────────────────── */}
                {wizardStep === 1 && (
                  <div>
                    <h3 className="text-lg font-bold text-neutral-800 mb-2">
                      ¿Sobre qué tema es tu consulta?
                    </h3>
                    <p className="text-sm text-neutral-500 mb-6">
                      Selecciona el tema para que podamos ayudarte mejor.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TOPIC_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleTopicSelect(opt.value)}
                            className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-left group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
                              <Icon className="h-5 w-5 text-brand-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-neutral-800">
                                {opt.label}
                              </p>
                              <p className="text-xs text-neutral-400 truncate">
                                {opt.description}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Step 2: Contact form ────────────────────────────── */}
                {wizardStep === 2 && !submitted && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <button
                        onClick={() => setWizardStep(1)}
                        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand-700 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" /> Cambiar tema
                      </button>
                      {selectedTopic && (
                        <>
                          <span className="text-neutral-300">•</span>
                          <Badge
                            variant="outline"
                            className="border-brand-200 text-brand-700 bg-brand-50"
                          >
                            {
                              TOPIC_OPTIONS.find(
                                (t) => t.value === selectedTopic,
                              )?.label
                            }
                          </Badge>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-neutral-800 mb-6">
                      Cuéntanos más sobre tu consulta
                    </h3>

                    <form
                      onSubmit={contactForm.handleSubmit}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Tu nombre</Label>
                          <Input
                            {...contactForm.getFieldProps("name")}
                            placeholder="Ej: Sofía Ramírez"
                            className="mt-1"
                          />
                          {contactForm.touched.name &&
                            contactForm.errors.name && (
                              <p className="text-xs text-red-500 mt-1">
                                {contactForm.errors.name}
                              </p>
                            )}
                        </div>
                        <div>
                          <Label>Tu correo electrónico</Label>
                          <Input
                            {...contactForm.getFieldProps("email")}
                            type="email"
                            placeholder="sofia@ejemplo.com"
                            className="mt-1"
                          />
                          {contactForm.touched.email &&
                            contactForm.errors.email && (
                              <p className="text-xs text-red-500 mt-1">
                                {contactForm.errors.email}
                              </p>
                            )}
                        </div>
                      </div>

                      <div>
                        <Label>Asunto</Label>
                        <Input
                          {...contactForm.getFieldProps("subject")}
                          placeholder="Resume tu consulta en una línea"
                          className="mt-1"
                        />
                        {contactForm.touched.subject &&
                          contactForm.errors.subject && (
                            <p className="text-xs text-red-500 mt-1">
                              {contactForm.errors.subject}
                            </p>
                          )}
                      </div>

                      <div>
                        <Label>
                          Mensaje{" "}
                          <span className="text-neutral-400 font-normal text-xs">
                            ({contactForm.values.message.length}/2000)
                          </span>
                        </Label>
                        <textarea
                          {...contactForm.getFieldProps("message")}
                          rows={6}
                          placeholder="Describe tu consulta con el mayor detalle posible. Entre más información nos des, más rápido podremos ayudarte."
                          className="mt-1 w-full text-sm p-3 border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                        {contactForm.touched.message &&
                          contactForm.errors.message && (
                            <p className="text-xs text-red-500 mt-1">
                              {contactForm.errors.message}
                            </p>
                          )}
                      </div>

                      {error && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-600 text-sm">
                            {error}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-neutral-400">
                          Respondemos en menos de 24h hábiles
                        </p>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="bg-brand-700 hover:bg-brand-800 text-white px-6"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enviando…
                            </>
                          ) : (
                            <>
                              Enviar mensaje
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ── Step 3: Success ─────────────────────────────────── */}
                {submitted && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-black text-neutral-900 mb-2">
                      ¡Mensaje enviado!
                    </h3>
                    <p className="text-neutral-500 text-sm max-w-sm mx-auto mb-8">
                      Recibimos tu consulta. Te responderemos a tu correo en
                      menos de 24 horas hábiles.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        onClick={handleRestart}
                        className="border-neutral-200 text-neutral-600"
                      >
                        Enviar otra consulta
                      </Button>
                      <Link to="/">
                        <Button className="bg-brand-700 hover:bg-brand-800 text-white">
                          Volver al inicio
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Popular topics quick links ───────────────────────────────── */}
          {!searchQuery.trim() && (
            <section className="pb-8">
              <h2 className="text-xl font-black text-neutral-900 mb-6 text-center">
                Explora por categoría
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {FAQ_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${cat.color}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold">{cat.label}</p>
                        <p className="text-xs opacity-70 mt-0.5">
                          {cat.faqs.length} preguntas
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-neutral-950 text-white py-8 px-4 text-center">
        <p className="text-neutral-500 text-sm">
          © 2026 Bolsadecafé.{" "}
          <Link to="/terms" className="hover:text-white transition-colors">
            Términos
          </Link>{" "}
          ·{" "}
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacidad
          </Link>
        </p>
      </footer>
    </>
  );
}
