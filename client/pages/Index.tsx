import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SEOMeta from "@/components/SEOMeta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Coffee,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Star,
  Crown,
  User,
  LogIn,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Truck,
  Loader2,
  Building2,
  Settings,
  LogOut,
  Play,
  Menu,
  X,
  Leaf,
  Zap,
  Heart,
  Package,
  ChevronUp,
  BookOpen,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectPlans,
  selectPlansLoading,
  selectPlansError,
} from "@/store/slices/plansSlice";
import {
  selectIsAuthenticated,
  selectUser,
  logout,
} from "@/store/slices/authSlice";
import { fetchHome } from "@/store/slices/homeSlice";
import BusinessContactModal from "@/components/BusinessContactModal";
import UserDashboard from "@/components/UserDashboard";
import AuthModal from "@/components/AuthModal";

/* ─── types ───────────────────────────────────────────── */
interface SubscriptionPlan {
  id: string;
  name: string;
  weight: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  popular?: boolean;
  premium?: boolean;
  icon: React.ElementType;
  gradient: string;
  badge?: string;
}

/* ─── vlog mock data ───────────────────────────────────── */
const articles = [
  {
    id: 1,
    title: "El Arte del Tostado Artesanal",
    excerpt:
      "Descubre cómo el nivel de tostado transforma los aromas y sabores del café, desde los matices frutales del tostado ligero hasta el cuerpo intenso del oscuro.",
    readTime: "5 min",
    date: "4 Mar 2026",
    tag: "Tostado",
    thumb:
      "https://disruptinglabs.com/data/bolsadecafe/assets/images/hero-image.jpg",
  },
  {
    id: 2,
    title: "De la Milpa a Tu Taza: Origen Oaxaca",
    excerpt:
      "Visitamos las fincas de la Sierra Juárez para conocer de cerca a los productores que cultivan el café que llega cada mes a tu puerta.",
    readTime: "7 min",
    date: "25 Feb 2026",
    tag: "Origen",
    thumb:
      "https://disruptinglabs.com/data/bolsadecafe/assets/images/hero-image.jpg",
  },
  {
    id: 3,
    title: "Pour-Over Perfecto en 5 Pasos",
    excerpt:
      "Una guía práctica para preparar un pour-over excepcional en casa: molido, temperatura, vertido y tiempo de extracción, todo explicado paso a paso.",
    readTime: "4 min",
    date: "18 Feb 2026",
    tag: "Tutorial",
    thumb:
      "https://disruptinglabs.com/data/bolsadecafe/assets/images/hero-image.jpg",
  },
  {
    id: 4,
    title: "Café de Temporada: Cosecha 2026",
    excerpt:
      "La cosecha de este año nos trae notas de guayaba y miel en el Chiapas natural. Te contamos qué esperar y cómo aprovecharlo al máximo.",
    readTime: "6 min",
    date: "10 Feb 2026",
    tag: "Temporada",
    thumb:
      "https://disruptinglabs.com/data/bolsadecafe/assets/images/hero-image.jpg",
  },
];

/* ─── FAQ data ─────────────────────────────────────────── */
const faqs = [
  {
    q: "¿Qué es la suscripción de Bolsadecafé?",
    a: "Es un servicio de entrega mensual que trae café mexicano premium, recién tostado, directamente a tu hogar u oficina.",
  },
  {
    q: "¿Qué incluye la suscripción?",
    a: "Según tu plan recibirás entre 250gr y 1kg de café — siempre fresco, siempre delicioso — con envío gratis en toda la República.",
  },
  {
    q: "¿Puedo cambiar mi preferencia de molido o dirección?",
    a: "¡Sí! Puedes actualizar tus preferencias en cualquier momento desde tu perfil.",
  },
  {
    q: "¿Cómo cancelo mi suscripción?",
    a: "Puedes cancelar fácilmente cuando quieras, sin contratos ni cargos ocultos.",
  },
  {
    q: "¿El café siempre llega fresco?",
    a: "Tostamos en lotes pequeños justo antes de cada envío para garantizar la máxima frescura.",
  },
];

/* ─── useReveal hook ───────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          // Cascade to all child .reveal elements so they animate in with their delays
          el.querySelectorAll(".reveal").forEach((child) =>
            child.classList.add("visible"),
          );
          obs.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Counter animation ────────────────────────────────── */
function useCounter(target: number, start: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame: number;
    const step = () => {
      setVal((prev) => {
        const next = prev + Math.ceil((target - prev) / 12);
        if (next >= target) return target;
        frame = requestAnimationFrame(step);
        return next;
      });
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [start, target]);
  return val;
}

/* ─── Stat card ────────────────────────────────────────── */
function StatCard({
  value,
  suffix,
  label,
  started,
}: {
  value: number;
  suffix: string;
  label: string;
  started: boolean;
}) {
  const count = useCounter(value, started);
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-white/60 text-sm mt-1 font-medium">{label}</div>
    </div>
  );
}

/* ─── FAQ accordion item ───────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`transition-colors ${open ? "bg-brand-50/50" : ""}`}>
      <button
        className="w-full flex items-center justify-between text-left px-5 py-4 gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-neutral-900 text-sm sm:text-base">
          {q}
        </span>
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${open ? "bg-brand-600 text-white rotate-180" : "bg-neutral-100 text-neutral-500"}`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-4 px-5" : "max-h-0"}`}
      >
        <p className="text-neutral-500 text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function Index() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [businessModalOpen, setBusinessModalOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const apiPlans = useAppSelector(selectPlans);
  const plansLoading = useAppSelector(selectPlansLoading);
  const plansError = useAppSelector(selectPlansError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  /* reveal refs */
  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useReveal();
  const r5 = useReveal();

  useEffect(() => {
    dispatch(fetchHome());
  }, [dispatch]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* plans ─────────────────────────────────────────────── */
  const getFeaturesByPlanId = (planId: string): string[] => {
    const map: Record<string, string[]> = {
      "250gr": [
        "Café 100% mexicano premium",
        "Para 1–2 personas",
        "Envío gratis",
        "Cancela cuando quieras",
        "Grano entero o molido",
        "Guía de preparación",
      ],
      "500gr": [
        "Café 100% mexicano premium",
        "Para 2–4 personas",
        "Envío gratis",
        "Cancela cuando quieras",
        "Grano entero o molido",
        "Notas de cata exclusivas",
        "Acceso a café de temporada",
      ],
      "1kg": [
        "Café 100% mexicano premium",
        "Para 5+ personas",
        "Envío gratis",
        "Cancela cuando quieras",
        "Grano entero o molido",
        "Mix de variedades",
        "Descuento en compras extra",
        "Acceso prioritario",
      ],
    };
    return (
      map[planId] || [
        "Café 100% mexicano",
        "Envío gratis",
        "Cancela cuando quieras",
      ]
    );
  };

  const hardcodedPlans: SubscriptionPlan[] = [
    {
      id: "250gr",
      name: "Bolsa 250gr",
      weight: "250gr",
      price: 199,
      description: "Café de especialidad, tostado artesanal",
      icon: Coffee,
      gradient: "from-brand-600 to-brand-700",
      badge: "Starter",
      features: getFeaturesByPlanId("250gr"),
    },
    {
      id: "500gr",
      name: "Bolsa 500gr",
      weight: "500gr",
      price: 299,
      description: "Café de especialidad, tostado artesanal",
      icon: Star,
      gradient: "from-brand-700 to-brand-800",
      popular: true,
      features: getFeaturesByPlanId("500gr"),
    },
    {
      id: "1kg",
      name: "Bolsa 1kg",
      weight: "1kg",
      price: 399,
      description: "Café de especialidad, tostado artesanal",
      icon: Crown,
      gradient: "from-brand-800 to-brand-900",
      badge: "Best Value",
      features: getFeaturesByPlanId("1kg"),
    },
  ];

  const displayPlans: SubscriptionPlan[] =
    !apiPlans || apiPlans.length === 0
      ? hardcodedPlans
      : apiPlans
          .filter((p: any) => !p.requires_contact)
          .map((p: any) => {
            const cfg: any = {
              "250gr": {
                icon: Coffee,
                gradient: "from-brand-600 to-brand-700",
                badge: "Starter",
              },
              "500gr": {
                icon: Star,
                gradient: "from-brand-700 to-brand-800",
                popular: true,
              },
              "1kg": {
                icon: Crown,
                gradient: "from-brand-800 to-brand-900",
                badge: "Best Value",
              },
            };
            const c = cfg[p.plan_id] || {
              icon: Coffee,
              gradient: "from-brand-600 to-brand-700",
            };
            return {
              id: p.plan_id,
              name: p.name,
              weight: p.weight,
              price: parseFloat(p.price_mxn),
              description: p.description,
              icon: c.icon,
              gradient: c.gradient,
              badge: c.badge,
              popular: c.popular,
              features: p.features?.length
                ? p.features
                : getFeaturesByPlanId(p.plan_id),
            };
          });

  const businessPlan = apiPlans?.find((p: any) => p.requires_contact);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    window.location.reload();
  };

  /* ═══════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-white">
      <SEOMeta
        path="/"
        keywords={[
          "suscripción mensual café",
          "café artesanal México",
          "tostado artesanal",
          "café de especialidad México",
        ]}
      />
      {/* ── NAVBAR ──────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <button
              onClick={() => scrollTo("inicio")}
              className="flex items-center gap-2.5 group"
            >
              <img
                src={
                  scrolled
                    ? "https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_dark.png"
                    : "https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_white.png"
                }
                alt="Bolsadecafé"
                className="h-8 w-auto transition-all duration-300"
              />
            </button>

            {/* Desktop nav */}
            <nav
              className={`hidden md:flex items-center gap-6 transition-all duration-300 ${scrolled ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              {[
                ["inicio", "Inicio"],
                ["planes", "Planes"],
                ["vlogs", "Blog"],
                ["como-funciona", "Cómo Funciona"],
                ["preguntas", "FAQ"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`text-sm font-medium transition-colors hover:opacity-100 ${scrolled ? "text-neutral-600 hover:text-brand-800" : "text-white/80 hover:text-white"}`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Right buttons — pointer-events always on; opacity fades with scroll */}
            <div
              className={`hidden md:flex items-center gap-2 transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"}`}
            >
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 ${scrolled ? "text-neutral-700 hover:bg-neutral-100" : "text-white hover:bg-white/10"}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-white text-xs font-bold">
                        {user.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">
                        {user.full_name?.split(" ")[0]}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <p className="text-sm font-semibold">{user.full_name}</p>
                      <p className="text-xs text-neutral-500 font-normal">
                        {user.email}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setDashboardOpen(true)}>
                      <Package className="mr-2 h-4 w-4" />
                      Mi Suscripción
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAuthModalOpen(true)}
                    className={`gap-1.5 ${scrolled ? "text-neutral-700 hover:bg-neutral-100" : "text-white hover:bg-white/10"}`}
                  >
                    <LogIn className="h-4 w-4" />
                    Ingresar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => scrollTo("planes")}
                    className="bg-brand-700 hover:bg-brand-800 text-white shadow-md"
                  >
                    Suscribirme
                  </Button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className={`md:hidden p-2 rounded-lg transition-all duration-300 ${scrolled ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X
                  className={`h-5 w-5 ${scrolled ? "text-neutral-800" : "text-white"}`}
                />
              ) : (
                <Menu
                  className={`h-5 w-5 ${scrolled ? "text-neutral-800" : "text-white"}`}
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-80" : "max-h-0"} bg-white border-t border-neutral-100`}
        >
          <div className="px-4 py-3 space-y-1">
            {[
              ["inicio", "Inicio"],
              ["planes", "Planes"],
              ["vlogs", "Blog"],
              ["como-funciona", "Cómo Funciona"],
              ["preguntas", "FAQ"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-brand-50 hover:text-brand-800 transition-colors"
              >
                {label}
              </button>
            ))}
            <div className="pt-2 pb-1 border-t border-neutral-100 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-sm"
                onClick={() => setAuthModalOpen(true)}
              >
                Ingresar
              </Button>
              <Button
                size="sm"
                onClick={() => scrollTo("planes")}
                className="flex-1 text-sm bg-brand-700 text-white"
              >
                Suscribirme
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────── */}
      <section
        id="inicio"
        className="relative min-h-screen flex items-end overflow-hidden"
      >
        {/* Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://disruptinglabs.com/data/bolsadecafe/assets/images/hero-image.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://disruptinglabs.com/data/bolsadecafe/assets/videos/hero-coffee.mp4"
            type="video/mp4"
          />
        </video>

        {/* Layered overlays — dark base + left directional gradient */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

        {/* Content — left-aligned, sits above bottom gradient */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 pb-20 sm:pb-28 pt-32">
          <div className="max-w-2xl">
            {/* Label */}
            <div className="animate-fadeUp flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-brand-400" />
              <span className="text-brand-300 text-xs font-semibold uppercase tracking-[0.2em]">
                Café de especialidad mexicano
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fadeUp-d1 text-5xl sm:text-6xl lg:text-[5.5rem] font-black text-white leading-[1.0] tracking-tight mb-6">
              El café
              <br />
              <span className="italic font-light text-brand-200">
                que mereces,
              </span>
              <br />
              en tu puerta.
            </h1>

            {/* Body */}
            <p className="animate-fadeUp-d2 text-base sm:text-lg text-white/65 max-w-lg mb-10 leading-relaxed">
              Tostado artesanalmente en lotes pequeños, seleccionado por
              expertos y entregado directo del productor a tu hogar.
            </p>

            {/* CTAs */}
            <div className="animate-fadeUp-d2 flex flex-col sm:flex-row items-start gap-3">
              <Button
                size="lg"
                onClick={() => scrollTo("planes")}
                className="w-full sm:w-auto bg-white hover:bg-neutral-100 text-brand-900 px-8 py-6 text-sm font-bold rounded-xl shadow-2xl tracking-wide"
              >
                Ver Planes de Suscripción
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <button
                onClick={() => scrollTo("como-funciona")}
                className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 border border-white/25 hover:border-white/50 text-white/80 hover:text-white px-8 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm"
              >
                Cómo funciona
              </button>
            </div>

            {/* Trust indicators */}
            <div className="animate-fadeUp-d2 flex flex-wrap items-center gap-5 mt-10">
              {[
                { icon: Leaf, label: "100% mexicano" },
                { icon: Truck, label: "Envío gratis" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-white/50 text-xs font-medium"
                >
                  <Icon className="h-3.5 w-3.5 text-brand-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator — bottom right */}
        <div className="absolute bottom-8 right-8 hidden sm:flex flex-col items-center gap-2 text-white/30">
          <span className="text-[10px] tracking-[0.2em] uppercase rotate-90 mb-3">
            scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────── */}
      <div ref={statsRef} className="bg-brand-800 py-10 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <StatCard
            value={1200}
            suffix="+"
            label="Suscriptores felices"
            started={statsVisible}
          />
          <StatCard
            value={8}
            suffix=""
            label="Regiones productoras"
            started={statsVisible}
          />
          <StatCard
            value={3}
            suffix=""
            label="Planes disponibles"
            started={statsVisible}
          />
          <StatCard
            value={100}
            suffix="%"
            label="Café mexicano"
            started={statsVisible}
          />
        </div>
      </div>

      {/* ── WHY US ──────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12 sm:mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-brand-600" />
              <span className="text-brand-600 text-xs font-semibold uppercase tracking-[0.18em]">
                Por qué elegirnos
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 leading-tight">
              Diferente desde
              <br />
              <span className="text-brand-600 font-light italic">
                el primer sorbo.
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Leaf,
                title: "Recién Tostado",
                desc: "Tostamos en lotes pequeños justo antes de cada envío. Nunca recibirás café de semanas atrás.",
              },
              {
                icon: Truck,
                title: "Envío Gratis",
                desc: "Entregamos en toda la República Mexicana sin costo adicional, directo a tu puerta.",
              },
              {
                icon: Heart,
                title: "Apoya lo Local",
                desc: "Trabajamos con productores locales apasionados de Oaxaca, Chiapas, Veracruz y más.",
              },
              {
                icon: Package,
                title: "Sin Compromiso",
                desc: "Sin contratos ni letras pequeñas. Cancela, pausa o modifica cuando quieras.",
              },
              {
                icon: Zap,
                title: "A Tu Medida",
                desc: "Grano entero, molido grueso, medio o fino. Tu café, a tu manera.",
              },
              {
                icon: Star,
                title: "Calidad Premium",
                desc: "Sólo seleccionamos cafés con más de 80 puntos en la escala de calidad de la SCA.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 0.08}s` }}
                className="animate-fadeUp group p-6 rounded-2xl bg-white border border-neutral-100 hover:border-brand-200 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-5 group-hover:bg-brand-100 transition-colors">
                  <Icon className="h-5 w-5 text-brand-700" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2 text-sm">
                  {title}
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ───────────────────────────────────────── */}
      <section
        id="planes"
        className="py-20 sm:py-28 bg-gradient-to-b from-neutral-100 via-brand-50 to-neutral-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Editorial header */}
          <div className="mb-14 sm:mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-brand-600" />
              <span className="text-brand-600 text-xs font-semibold uppercase tracking-[0.18em]">
                Suscripciones
              </span>
              {plansLoading && (
                <Loader2 className="h-3 w-3 animate-spin text-brand-500 ml-1" />
              )}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 leading-tight">
              Elige tu plan.
              <br />
              <span className="text-brand-700 font-light italic">
                Sin compromisos.
              </span>
            </h2>
            <p className="mt-4 text-neutral-500 max-w-md text-sm leading-relaxed">
              Cancela, pausa o modifica cuando quieras. Sin contratos ni letras
              chicas.
            </p>
          </div>

          {/* Cards — always rendered using hardcoded fallback, no loading gate */}
          <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
            {displayPlans.map((plan, i) => {
              const Icon = plan.icon;
              const isPopular = plan.popular;
              return (
                <div
                  key={plan.id}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  className={`animate-fadeUp relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-white
                    ${
                      isPopular
                        ? "shadow-2xl shadow-brand-900/20 ring-2 ring-brand-400"
                        : "shadow-md shadow-neutral-300/70 hover:shadow-xl hover:shadow-brand-200/40"
                    }`}
                >
                  {/* Popular accent line */}
                  {isPopular && (
                    <div className="h-[3px] w-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-400" />
                  )}

                  <div className="flex-1 flex flex-col p-7">
                    {/* Icon + badge row */}
                    <div className="flex items-center justify-between mb-7">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-brand-700" />
                      </div>
                      {(plan.badge || isPopular) && (
                        <span
                          className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                            isPopular
                              ? "bg-brand-600 text-white"
                              : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                          }`}
                        >
                          {isPopular ? "Más Popular" : plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Name + subtitle */}
                    <h3 className="text-lg font-bold mb-1 text-neutral-900">
                      {plan.name}
                    </h3>
                    <p className="text-xs mb-6 text-neutral-400">
                      {plan.weight} de café premium · por mes
                    </p>

                    {/* Price block */}
                    <div className="mb-7 pb-7 border-b border-neutral-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-5xl font-black tracking-tight text-neutral-900">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-neutral-400">
                          MXN/mes
                        </span>
                      </div>
                    </div>

                    {/* Feature list */}
                    <ul className="space-y-2.5 flex-1 mb-8">
                      {plan.features.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-brand-500" />
                          <span className="text-sm text-neutral-600">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      onClick={() =>
                        navigate("/subscription-wizard", {
                          state: { planId: plan.id },
                        })
                      }
                      className={`w-full font-semibold py-5 rounded-xl transition-all duration-300 group ${
                        isPopular
                          ? "bg-brand-700 hover:bg-brand-800 text-white shadow-md shadow-brand-700/30"
                          : "bg-white hover:bg-brand-700 border-2 border-neutral-200 hover:border-brand-700 text-neutral-700 hover:text-white"
                      }`}
                    >
                      Suscribirme Ahora
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Business plan */}
          {businessPlan && (
            <div className="mt-8 rounded-2xl border border-brand-200 bg-white p-7 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-brand-700" />
                </div>
                <div>
                  <h3 className="text-neutral-900 font-bold text-lg">
                    {businessPlan.name}
                  </h3>
                  <p className="text-neutral-500 text-sm mt-0.5">
                    {businessPlan.description}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    {[
                      "Cantidades personalizadas",
                      "Facturación empresarial",
                      "Envío gratis",
                    ].map((f) => (
                      <span
                        key={f}
                        className="flex items-center gap-1.5 text-xs text-neutral-500"
                      >
                        <div className="w-1 h-1 rounded-full bg-brand-500 flex-shrink-0" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setBusinessModalOpen(true)}
                className="flex-shrink-0 bg-brand-700 hover:bg-brand-800 text-white px-7 py-5 rounded-xl font-semibold shadow-md"
              >
                Contactar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── ARTICLES ────────────────────────────────────── */}
      <section id="vlogs" className="py-20 sm:py-28 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12 sm:mb-14 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-brand-600" />
                <span className="text-brand-600 text-xs font-semibold uppercase tracking-[0.18em]">
                  Nuestro Blog
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 leading-tight">
                Artículos
                <br />
                <span className="text-brand-600 font-light italic">
                  & guías.
                </span>
              </h2>
            </div>
            <a
              href="#"
              className="flex items-center gap-2 text-sm text-neutral-400 hover:text-brand-700 transition-colors mb-1"
            >
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {articles.map((a, i) => (
              <article
                key={a.id}
                style={{ animationDelay: `${i * 0.08}s` }}
                className="animate-fadeUp group cursor-pointer flex flex-col rounded-2xl overflow-hidden bg-white border border-neutral-200 hover:border-brand-300 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden aspect-video bg-neutral-100 flex-shrink-0">
                  <img
                    src={a.thumb}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-brand-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {a.tag}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-4">
                  <h4 className="text-neutral-900 font-bold text-sm leading-snug group-hover:text-brand-700 transition-colors line-clamp-2 mb-2">
                    {a.title}
                  </h4>
                  <p className="text-neutral-500 text-xs leading-relaxed line-clamp-3 flex-1">
                    {a.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 text-neutral-400 text-xs">
                    <span>{a.date}</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {a.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="como-funciona" className="py-20 sm:py-28 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-14 sm:mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-brand-500" />
              <span className="text-brand-400 text-xs font-semibold uppercase tracking-[0.18em]">
                El proceso
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              Tan fácil como
              <br />
              <span className="text-brand-300 font-light italic">
                tres pasos.
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 relative">
            {/* connecting line on desktop */}
            <div className="hidden sm:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-brand-800 via-brand-600 to-brand-800" />
            {[
              {
                n: "01",
                icon: Coffee,
                title: "Elige tu molido",
                desc: "Grano entero, molido grueso, medio o fino. Selecciona lo que mejor se adapte a tu método de preparación.",
              },
              {
                n: "02",
                icon: MapPin,
                title: "Tu dirección",
                desc: "Indica dónde entregaremos tu café. Enviamos a toda la República Mexicana sin costo adicional.",
              },
              {
                n: "03",
                icon: Package,
                title: "¡Disfruta!",
                desc: "Recibe tu café recién tostado cada mes. Cancela o modifica en cualquier momento.",
              },
            ].map(({ n, icon: Icon, title, desc }, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 0.12}s` }}
                className="animate-fadeUp flex flex-col"
              >
                <div className="relative mb-6 self-start">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-brand-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center">
                    {n}
                  </span>
                </div>
                <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section id="preguntas" className="py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-brand-600" />
              <span className="text-brand-600 text-xs font-semibold uppercase tracking-[0.18em]">
                FAQ
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 leading-tight">
              Preguntas
              <br />
              <span className="text-brand-600 font-light italic">
                frecuentes.
              </span>
            </h2>
          </div>
          <div className="rounded-2xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://disruptinglabs.com/data/bolsadecafe/assets/images/hero-image.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-900/90 to-brand-950/80" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
            ¿Listo para tu ritual
            <br />
            del café?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Únete a más de 1,200 amantes del café que ya disfrutan Bolsadecafé
            cada mes.
          </p>
          <Button
            size="lg"
            onClick={() => scrollTo("planes")}
            className="bg-white text-brand-900 hover:bg-brand-50 px-10 py-6 text-base font-bold rounded-xl shadow-2xl"
          >
            Comenzar Mi Suscripción
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="bg-neutral-950 text-white pt-16 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img
                  src="https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_white.png"
                  alt="Bolsadecafé"
                  className="h-7 w-auto"
                />
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-5">
                Café mexicano premium, tostado artesanalmente y entregado en tu
                puerta cada mes.
              </p>
              <div className="flex gap-3">
                {[Facebook, Instagram].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-brand-700 flex items-center justify-center transition-colors"
                  >
                    <Icon className="h-4 w-4 text-neutral-400 hover:text-white" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-neutral-400 mb-4">
                Navegación
              </h4>
              <ul className="space-y-2.5">
                {[
                  ["inicio", "Inicio"],
                  ["planes", "Planes"],
                  ["vlogs", "Blog"],
                  ["como-funciona", "Cómo Funciona"],
                  ["preguntas", "FAQ"],
                ].map(([id, label]) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollTo(id)}
                      className="text-neutral-400 hover:text-white text-sm transition-colors"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-neutral-400 mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm text-neutral-400">
                <li>
                  <a
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Términos y Condiciones
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a
                    href="/ayuda"
                    className="hover:text-white transition-colors"
                  >
                    Centro de Ayuda
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-neutral-400 mb-4">
                Contacto
              </h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 flex-shrink-0 text-brand-500" />
                  hola@bolsadecafe.mx
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 flex-shrink-0 text-brand-500" />
                  +52 55 1234 5678
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-brand-500" />
                  Ciudad de México, México
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <p>© 2026 Bolsadecafé. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="hover:text-neutral-400 transition-colors"
              >
                Admin
              </a>
              <button
                onClick={() => scrollTo("inicio")}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                Volver arriba <ChevronUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      <BusinessContactModal
        open={businessModalOpen}
        onOpenChange={setBusinessModalOpen}
      />

      <UserDashboard
        open={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
      />

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
