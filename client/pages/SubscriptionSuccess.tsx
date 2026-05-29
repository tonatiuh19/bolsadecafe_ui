import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOMeta from "@/components/SEOMeta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Home,
  Coffee,
  Truck,
  Bell,
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
  Loader2,
  ChevronDown,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetWizardData } from "@/store/slices/subscriptionWizardSlice";
import { fetchBlogPosts, type PublicBlogPost } from "@/store/slices/blogSlice";
import { cn } from "@/lib/utils";

const LOGO_DARK =
  "https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_dark.png";

const steps = [
  {
    icon: Coffee,
    title: "Café en camino",
    description: "Preparamos tu selección artesanal con mucho cariño.",
  },
  {
    icon: Truck,
    title: "Envío en 3–5 días",
    description: "Te avisaremos por correo cuando salga tu paquete.",
  },
  {
    icon: Bell,
    title: "Renovación automática",
    description: "Cobro mensual. Pausa o cancela cuando quieras.",
  },
];

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

function estimateReadTime(content: string): number {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function pickRandomPosts(posts: PublicBlogPost[], count: number) {
  return [...posts].sort(() => Math.random() - 0.5).slice(0, count);
}

function BlogArticleCard({
  post,
  variant = "scroll",
  visible,
  index,
  onClick,
}: {
  post: PublicBlogPost;
  variant?: "scroll" | "featured" | "grid";
  visible: boolean;
  index: number;
  onClick: () => void;
}) {
  const readTime = estimateReadTime(post.content || post.excerpt || "");

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group text-left rounded-2xl overflow-hidden bg-white border border-brand-100 shadow-sm",
        "hover:border-brand-300 hover:shadow-md transition-all duration-300",
        variant === "scroll" &&
          "flex-shrink-0 w-[78vw] max-w-[300px] snap-center snap-always",
        variant === "featured" && "w-full",
        variant === "grid" && "w-full hover:-translate-y-0.5",
      )}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: `opacity 0.5s ease ${400 + index * 100}ms, transform 0.5s ease ${400 + index * 100}ms`,
      }}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-brand-50",
          variant === "featured" ? "aspect-[2/1] sm:aspect-[16/9]" : "aspect-[16/10]",
        )}
      >
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
            <Coffee className="h-10 w-10 text-brand-400" />
          </div>
        )}
        {post.category_name && (
          <Badge className="absolute top-2.5 left-2.5 bg-brand-800 text-white border-0 text-[10px] font-semibold">
            {post.category_name}
          </Badge>
        )}
      </div>
      <div className={cn("p-4", variant === "featured" && "sm:p-5")}>
        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mb-1.5">
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {readTime} min
          </span>
        </div>
        <h3
          className={cn(
            "font-bold text-neutral-900 leading-snug group-hover:text-brand-800 transition-colors",
            variant === "featured" ? "text-base sm:text-lg line-clamp-2" : "text-sm line-clamp-2",
          )}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p
            className={cn(
              "text-neutral-500 mt-1.5 leading-relaxed",
              variant === "featured"
                ? "text-sm line-clamp-2 sm:line-clamp-3"
                : "text-xs line-clamp-2",
            )}
          >
            {stripHtml(post.excerpt)}
          </p>
        )}
        <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-brand-700 group-hover:gap-2 transition-all">
          Leer artículo
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { posts, loading: blogLoading } = useAppSelector((s) => s.blog);
  const [visible, setVisible] = useState(false);
  const hasRun = useRef(false);
  const randomPostsRef = useRef<PublicBlogPost[] | null>(null);
  const blogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Always start at top (wizard / modals may leave scroll mid-page)
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.body.style.overflow = "";
    document.body.style.pointerEvents = "";
    document.body.removeAttribute("data-scroll-locked");
    document.getElementById("root")?.removeAttribute("aria-hidden");

    dispatch(resetWizardData());
    dispatch(fetchBlogPosts({ page: 1, perPage: 12 }));

    const t1 = setTimeout(() => setVisible(true), 80);

    if (hasRun.current) return;
    hasRun.current = true;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.35 },
      colors: ["#1d3c89", "#4a5d8a", "#f59e0b", "#ffffff"],
      zIndex: 9999,
    });

    const t2 = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 50,
        origin: { x: 0, y: 0.45 },
        colors: ["#1d3c89", "#ffffff"],
        zIndex: 9999,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 50,
        origin: { x: 1, y: 0.45 },
        colors: ["#1d3c89", "#ffffff"],
        zIndex: 9999,
      });
    }, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [dispatch]);

  const randomPosts = useMemo(() => {
    if (!posts.length) return [];
    if (randomPostsRef.current) return randomPostsRef.current;
    const picked = pickRandomPosts(posts, 3);
    randomPostsRef.current = picked;
    return picked;
  }, [posts]);

  const [featuredPost, ...morePosts] = randomPosts;

  const scrollToBlog = () => {
    blogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 relative overflow-x-hidden">
      <SEOMeta
        title="¡Suscripción exitosa!"
        description="Tu suscripción a Bolsadecafé está activa. Tu primer envío de café mexicano premium ya está en camino."
        path="/subscription/success"
        noIndex
      />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-brand-600/20 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Top bar */}
      <header className="relative z-20 safe-top border-b border-white/10 bg-brand-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center"
          >
            <img src={LOGO_DARK} alt="Bolsadecafé" className="h-7 w-auto brightness-0 invert opacity-90" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-brand-200 hover:text-white hover:bg-white/10 text-xs sm:text-sm"
          >
            <Home className="h-3.5 w-3.5 mr-1.5" />
            Inicio
          </Button>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-10 lg:py-14 safe-bottom">
        <div
          className={cn(
            "grid lg:grid-cols-5 gap-5 lg:gap-8 items-start transition-all duration-700 ease-out",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          {/* Success card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-brand-100">
              <div className="h-1 bg-gradient-to-r from-brand-600 to-brand-800" />

              <div className="px-5 sm:px-7 pt-6 sm:pt-8 pb-4 flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4">
                  <div className="absolute inset-0 rounded-full bg-brand-400/25 animate-ping scale-110" />
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-lg shadow-brand-900/25">
                    <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                <Badge className="mb-3 bg-brand-50 text-brand-800 border-brand-200 hover:bg-brand-50 text-[9px] uppercase tracking-[0.15em] font-bold">
                  Miembro del club
                </Badge>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 mb-2 tracking-tight leading-tight w-full">
                  ¡Suscripción exitosa!
                </h1>
                <p className="text-neutral-500 text-sm leading-relaxed max-w-xs lg:max-w-none">
                  Bienvenido al club del café mexicano premium.{" "}
                  <span className="text-brand-700 font-semibold block sm:inline mt-0.5 sm:mt-0">
                    Tu primer envío ya está en proceso.
                  </span>
                </p>
              </div>

              <div className="px-5 sm:px-7 pb-4 space-y-2 w-full">
                {steps.map(({ icon: Icon, title, description }, i) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 p-3 rounded-xl border border-brand-100/80 bg-brand-50/50 w-full"
                    style={{
                      transitionDelay: `${150 + i * 80}ms`,
                      opacity: visible ? 1 : 0,
                      transform: visible ? "none" : "translateX(-8px)",
                      transition: "opacity 0.4s ease, transform 0.4s ease",
                    }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 mt-0.5">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-semibold text-neutral-900 text-xs sm:text-sm leading-tight">
                        {title}
                      </p>
                      <p className="text-neutral-500 text-[11px] sm:text-xs leading-snug mt-0.5">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 sm:px-7 pb-5 sm:pb-6 pt-4 space-y-2.5 border-t border-neutral-100 w-full">
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold h-10 sm:h-11 rounded-xl justify-center"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Volver al inicio
                </Button>

                {randomPosts.length > 0 && (
                  <button
                    type="button"
                    onClick={scrollToBlog}
                    className="lg:hidden w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors"
                  >
                    Mientras llega tu café
                    <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
                  </button>
                )}

                <p className="text-neutral-400 text-[10px] sm:text-[11px] text-center pt-0.5">
                  ¿Dudas?{" "}
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

          {/* Blog */}
          <div ref={blogRef} className="lg:col-span-3 scroll-mt-4">
            <div
              className="rounded-2xl border border-brand-700/40 bg-brand-900/80 p-4 sm:p-6 lg:p-7"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
              }}
            >
              <div className="mb-4 sm:mb-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-brand-300" />
                  <span className="text-brand-300 text-[10px] font-bold uppercase tracking-widest">
                    Mientras llega tu café
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white leading-tight">
                  Descubre el ritual del café
                </h2>
                <p className="text-brand-200/70 text-xs sm:text-sm mt-1 max-w-md">
                  Artículos seleccionados para ti — recetas, orígenes y secretos
                  de preparación.
                </p>
              </div>

              {blogLoading && (
                <div className="flex items-center justify-center gap-2 py-12 text-brand-200">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Cargando artículos...</span>
                </div>
              )}

              {!blogLoading && featuredPost && (
                <>
                  {/* Mobile: featured + horizontal more */}
                  <div className="lg:hidden space-y-3">
                    <BlogArticleCard
                      post={featuredPost}
                      variant="featured"
                      index={0}
                      visible={visible}
                      onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                    />
                    {morePosts.length > 0 && (
                      <>
                        <p className="text-brand-300/60 text-[10px] font-semibold uppercase tracking-wider px-1">
                          Más para leer — desliza
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
                          {morePosts.map((post, i) => (
                            <BlogArticleCard
                              key={post.id}
                              post={post}
                              variant="scroll"
                              index={i + 1}
                              visible={visible}
                              onClick={() => navigate(`/blog/${post.slug}`)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Desktop: 3-col grid */}
                  <div className="hidden lg:grid lg:grid-cols-3 gap-4">
                    {randomPosts.map((post, i) => (
                      <BlogArticleCard
                        key={post.id}
                        post={post}
                        variant="grid"
                        index={i}
                        visible={visible}
                        onClick={() => navigate(`/blog/${post.slug}`)}
                      />
                    ))}
                  </div>
                </>
              )}

              {!blogLoading && randomPosts.length === 0 && (
                <div className="rounded-xl border border-brand-700/50 bg-brand-950/40 p-6 text-center">
                  <Coffee className="h-8 w-8 text-brand-400 mx-auto mb-2" />
                  <p className="text-brand-200 text-sm">
                    Pronto tendremos artículos para ti.
                  </p>
                </div>
              )}

              <Button
                onClick={() => navigate("/blog")}
                className="w-full mt-4 sm:mt-5 h-10 sm:h-11 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15 hover:text-white font-semibold text-sm"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Explorar todo el blog
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
