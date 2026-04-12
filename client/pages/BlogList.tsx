import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEOMeta from "@/components/SEOMeta";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBlogPosts } from "@/store/slices/blogSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ArrowRight,
  Coffee,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function BlogList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { posts, loading, error } = useAppSelector((s) => s.blog);

  useEffect(() => {
    dispatch(fetchBlogPosts({ page: 1, perPage: 20 }));
  }, [dispatch]);

  const [featuredPost, ...restPosts] = posts;

  return (
    <>
      <SEOMeta
        title="Blog - Bolsa de Café"
        description="Artículos sobre preparación de café, orígenes, recetas y cultura cafetera mexicana."
      />

      <div className="min-h-screen bg-white dark:bg-[#07101f]">
        {/* ── Nav ────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#07101f]/90 backdrop-blur-md border-b border-stone-200 dark:border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Inicio
            </Button>
          </div>
        </nav>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 dark:from-amber-950/20 dark:via-stone-950 dark:to-[#07101f]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_70%)]" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/40 mb-6">
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 tracking-wide uppercase">
                Blog
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 dark:text-white mb-4 tracking-tight">
              Todo sobre el café
            </h1>
            <p className="text-base sm:text-lg text-stone-600 dark:text-white/60 max-w-xl mx-auto">
              Recetas, orígenes, guías de preparación y cultura cafetera
              mexicana escrita con pasión.
            </p>
          </div>
        </section>

        {/* ── Content ────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center gap-4 py-20 text-stone-400 dark:text-white/30">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-sm">Cargando artículos...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-20">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-stone-500 dark:text-white/50">
                {error}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  dispatch(fetchBlogPosts({ page: 1, perPage: 20 }))
                }
              >
                Reintentar
              </Button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && posts.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 text-stone-400 dark:text-white/30">
              <BookOpen className="w-10 h-10" />
              <p className="text-sm">Próximamente nuevos artículos</p>
            </div>
          )}

          {/* Featured post */}
          {!loading && featuredPost && (
            <div
              className="group cursor-pointer mb-10 rounded-2xl overflow-hidden border border-stone-200 dark:border-white/10 hover:border-amber-400/50 dark:hover:border-amber-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 bg-white dark:bg-white/5"
              onClick={() => navigate(`/blog/${featuredPost.slug}`)}
            >
              <div className="grid md:grid-cols-2">
                {featuredPost.featured_image ? (
                  <div className="aspect-video md:aspect-auto bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <img
                      src={featuredPost.featured_image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-video md:aspect-auto bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-900/20 flex items-center justify-center">
                    <Coffee className="w-16 h-16 text-amber-400/50" />
                  </div>
                )}
                <div className="p-6 sm:p-8 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {featuredPost.category_name && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700/40 text-xs">
                        {featuredPost.category_name}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="text-xs text-stone-500 dark:text-white/40"
                    >
                      Destacado
                    </Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-3">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-sm text-stone-600 dark:text-white/60 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-white/40 flex-wrap">
                    {featuredPost.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(featuredPost.published_at)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {estimateReadTime(featuredPost.content)} min de lectura
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 group-hover:gap-2.5 transition-all">
                    Leer artículo
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts grid */}
          {!loading && restPosts.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-stone-200 dark:border-white/10 hover:border-amber-400/50 dark:hover:border-amber-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 bg-white dark:bg-white/5 flex flex-col"
                >
                  {post.featured_image ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/10 flex items-center justify-center">
                      <Coffee className="w-8 h-8 text-amber-300 dark:text-amber-700" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    {post.category_name && (
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                        {post.category_name}
                      </span>
                    )}
                    <h3 className="font-bold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 text-base leading-snug">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs text-stone-500 dark:text-white/50 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-stone-400 dark:text-white/30 pt-2 border-t border-stone-100 dark:border-white/10">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {estimateReadTime(post.content)} min
                      </span>
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.published_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="border-t border-stone-200 dark:border-white/10 py-8 text-center">
          <p className="text-xs text-stone-400 dark:text-white/30">
            © {new Date().getFullYear()} Bolsa de Café · Hecho con amor ☕
          </p>
        </footer>
      </div>
    </>
  );
}
