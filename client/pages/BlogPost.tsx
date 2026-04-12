import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SEOMeta from "@/components/SEOMeta";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBlogPost, clearBlogCurrent } from "@/store/slices/blogSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Coffee,
  Calendar,
  Clock,
  Eye,
  RefreshCw,
  AlertCircle,
  BookOpen,
} from "lucide-react";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function estimateReadTime(content: string): number {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { current, postLoading, error } = useAppSelector((s) => s.blog);

  useEffect(() => {
    if (slug) dispatch(fetchBlogPost(slug));
    return () => {
      dispatch(clearBlogCurrent());
    };
  }, [dispatch, slug]);

  const post = current;

  return (
    <>
      <SEOMeta
        title={post?.meta_title ?? post?.title ?? "Blog - Bolsa de Café"}
        description={
          post?.meta_description ??
          post?.excerpt ??
          "Artículo del blog de Bolsa de Café"
        }
      />

      <div className="min-h-screen bg-white dark:bg-[#07101f]">
        {/* ── Nav ─────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#07101f]/90 backdrop-blur-md border-b border-stone-200 dark:border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-stone-800 dark:text-white hover:opacity-80 transition-opacity"
            >
              <Coffee className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-sm">Bolsa de Café</span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="text-stone-600 dark:text-white/70 hover:text-stone-900 dark:hover:text-white gap-1.5 text-sm"
              onClick={() => navigate("/blog")}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Blog
            </Button>
          </div>
        </nav>

        {/* ── Loading ──────────────────────────────────────────────── */}
        {postLoading && (
          <div className="flex flex-col items-center gap-4 py-32 text-stone-400 dark:text-white/30">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-sm">Cargando artículo...</p>
          </div>
        )}

        {/* ── Error / Not found ─────────────────────────────────── */}
        {!postLoading && (error || !post) && (
          <div className="flex flex-col items-center gap-4 py-32">
            <AlertCircle className="w-10 h-10 text-stone-300 dark:text-white/20" />
            <h2 className="text-lg font-semibold text-stone-700 dark:text-white/60">
              Artículo no encontrado
            </h2>
            <p className="text-sm text-stone-400 dark:text-white/30">
              {error ?? "Este artículo no existe o ha sido archivado."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => navigate("/blog")}
            >
              Ver todos los artículos
            </Button>
          </div>
        )}

        {/* ── Article ──────────────────────────────────────────────── */}
        {!postLoading && post && (
          <>
            {/* Hero image */}
            {post.featured_image && (
              <div className="w-full max-h-[440px] overflow-hidden bg-stone-100 dark:bg-stone-900">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
              {/* Category + meta */}
              <div className="flex items-center gap-3 flex-wrap mb-5">
                {post.category_name && (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700/40 text-xs">
                    {post.category_name}
                  </Badge>
                )}
                {post.published_at && (
                  <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-white/30">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.published_at)}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-white/30">
                  <Clock className="w-3 h-3" />
                  {estimateReadTime(post.content)} min de lectura
                </span>
                {post.views > 0 && (
                  <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-white/30">
                    <Eye className="w-3 h-3" />
                    {post.views.toLocaleString()} vistas
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-white mb-5 leading-tight tracking-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-base sm:text-lg text-stone-500 dark:text-white/50 mb-8 leading-relaxed border-l-4 border-amber-400 pl-4 italic">
                  {post.excerpt}
                </p>
              )}

              {/* Author */}
              {post.author_name && (
                <div className="flex items-center gap-3 mb-8 pb-8 border-b border-stone-100 dark:border-white/10">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {post.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800 dark:text-white">
                      {post.author_name}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-white/30">
                      Bolsa de Café
                    </p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div
                className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-8 prose-h3:text-lg prose-h3:mt-6 prose-p:text-stone-700 dark:prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-[0.95rem] prose-li:text-stone-700 dark:prose-li:text-white/70 prose-li:text-[0.95rem] prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-stone-900 dark:prose-strong:text-white prose-img:rounded-xl prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Footer CTA */}
              <div className="mt-14 py-8 border-t border-stone-100 dark:border-white/10">
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200 dark:border-amber-800/30 p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto">
                    <Coffee className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-stone-900 dark:text-white text-lg">
                    ¿Te gustó este artículo?
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-white/60 max-w-xs mx-auto">
                    Suscríbete y recibe los mejores granos de México
                    directamente en tu puerta cada mes.
                  </p>
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 h-10 px-6"
                    onClick={() => navigate("/subscription-wizard")}
                  >
                    Suscribirme ahora
                  </Button>
                </div>
              </div>

              {/* Back to blog */}
              <div className="mt-8 flex items-center justify-center">
                <Button
                  variant="ghost"
                  className="gap-2 text-stone-500 dark:text-white/40 hover:text-stone-800 dark:hover:text-white"
                  onClick={() => navigate("/blog")}
                >
                  <BookOpen className="w-4 h-4" />
                  Ver más artículos
                </Button>
              </div>
            </article>
          </>
        )}

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer className="border-t border-stone-200 dark:border-white/10 py-8 text-center">
          <p className="text-xs text-stone-400 dark:text-white/30">
            © {new Date().getFullYear()} Bolsa de Café · Hecho con amor ☕
          </p>
        </footer>
      </div>
    </>
  );
}
