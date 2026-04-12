import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminBlogPosts,
  deleteAdminBlogPost,
  clearAdminBlogActionState,
} from "@/store/slices/adminBlogSlice";
import type { AdminBlogPost } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Plus,
  Pencil,
  Archive,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Search,
  Eye,
  Calendar,
  BookOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

const STATUS_COLORS: Record<string, string> = {
  draft:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800/40",
  published:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/40",
  archived:
    "bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800/40 dark:text-stone-400 dark:border-stone-700/40",
};

type FilterTab = "all" | "draft" | "published" | "archived";

const FILTER_TABS: Array<{ value: FilterTab; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Borradores" },
  { value: "archived", label: "Archivados" },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function AdminBlog() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { posts, loading, error, actionLoading, actionError, actionSuccess } =
    useAppSelector((s) => s.adminBlog);

  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [archiveTarget, setArchiveTarget] = useState<AdminBlogPost | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchAdminBlogPosts(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (actionSuccess) {
      const t = setTimeout(() => dispatch(clearAdminBlogActionState()), 3000);
      return () => clearTimeout(t);
    }
  }, [actionSuccess, dispatch]);

  const handleArchive = async () => {
    if (!archiveTarget) return;
    await dispatch(deleteAdminBlogPost(archiveTarget.id));
    setArchiveTarget(null);
  };

  const filtered = posts.filter((p) => {
    const matchesTab = filter === "all" || p.status === filter;
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.authorName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.categoryName ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const countByStatus = (s: string) =>
    s === "all" ? posts.length : posts.filter((p) => p.status === s).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <BookOpen className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Blog</h1>
            <p className="text-xs text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? "s" : ""} en total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(fetchAdminBlogPosts(undefined))}
            disabled={loading}
            className="h-9"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button
            size="sm"
            className="h-9 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 gap-1.5"
            onClick={() => navigate("/admin/blog/new")}
          >
            <Plus className="w-4 h-4" />
            Nuevo post
          </Button>
        </div>
      </div>

      {/* Toast notifications */}
      {actionSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800/40 dark:text-green-300 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {actionSuccess}
        </div>
      )}
      {(actionError || error) && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {actionError || error}
        </div>
      )}

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                filter === tab.value
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                  filter === tab.value
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {countByStatus(tab.value)}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Posts table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="text-sm">Cargando posts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
            <FileText className="w-8 h-8 opacity-30" />
            <p className="text-sm font-medium">
              {search ? "No hay posts que coincidan" : "No hay posts todavía"}
            </p>
            {!search && (
              <Button
                size="sm"
                variant="outline"
                className="mt-1"
                onClick={() => navigate("/admin/blog/new")}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Crear primer post
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Título
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">
                    Categoría
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                    Estado
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">
                    Publicado
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">
                    Vistas
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post, idx) => (
                  <tr
                    key={post.id}
                    className={cn(
                      "border-b border-border last:border-0 hover:bg-muted/20 transition-colors",
                      idx % 2 === 0 ? "bg-background" : "bg-muted/10",
                    )}
                  >
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <p className="font-medium text-foreground line-clamp-1 max-w-xs">
                          {post.title}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          /{post.slug}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {post.categoryName ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                          STATUS_COLORS[post.status] ?? STATUS_COLORS.archived,
                        )}
                      >
                        {STATUS_LABELS[post.status] ?? post.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishedAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        {post.views.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {post.status === "published" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-amber-600"
                            title="Ver en el blog"
                            onClick={() =>
                              window.open(`/blog/${post.slug}`, "_blank")
                            }
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Editar"
                          onClick={() =>
                            navigate(`/admin/blog/${post.id}/edit`)
                          }
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {post.status !== "archived" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            title="Archivar"
                            disabled={actionLoading}
                            onClick={() => setArchiveTarget(post)}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Archive confirmation */}
      <AlertDialog
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Archivar este post?</AlertDialogTitle>
            <AlertDialogDescription>
              El post <strong>&ldquo;{archiveTarget?.title}&rdquo;</strong> será
              archivado y dejará de aparecer en el blog público. Puedes
              restaurarlo editando su estado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Archivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
