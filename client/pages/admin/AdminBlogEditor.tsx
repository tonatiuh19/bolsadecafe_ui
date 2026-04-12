import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminBlogPost,
  fetchAdminBlogCategories,
  createAdminBlogPost,
  updateAdminBlogPost,
  clearAdminBlogActionState,
  clearAdminBlogCurrent,
} from "@/store/slices/adminBlogSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  BookOpen,
  Tag,
  Globe,
  FileText,
  Image as ImageIcon,
  Calendar,
  CheckCircle2,
  Upload,
  X,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Code2,
  Youtube,
  Twitter,
  Instagram,
  Quote,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImageToCDN } from "@/lib/cdn-upload";
import RichHtmlEditor from "@/components/RichHtmlEditor";

// ─── Slug generator ────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 200);
}

// ─── Block system ──────────────────────────────────────────────────────────────

type BlockType =
  | "html"
  | "image"
  | "youtube"
  | "twitter"
  | "instagram"
  | "quote"
  | "divider";

interface Block {
  id: string;
  type: BlockType;
  data: Record<string, string>;
}

const BLOCK_TYPES: Array<{
  type: BlockType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}> = [
  { type: "html", icon: Code2, label: "HTML" },
  { type: "image", icon: ImageIcon, label: "Imagen" },
  { type: "youtube", icon: Youtube, label: "YouTube" },
  { type: "twitter", icon: Twitter, label: "Twitter / X" },
  { type: "instagram", icon: Instagram, label: "Instagram" },
  { type: "quote", icon: Quote, label: "Cita" },
  { type: "divider", icon: Minus, label: "Divisor" },
];

function defaultData(type: BlockType): Record<string, string> {
  switch (type) {
    case "html":
      return { html: "" };
    case "image":
      return { url: "", alt: "", caption: "", credit: "" };
    case "youtube":
      return { video_id: "", caption: "" };
    case "twitter":
      return { tweet_url: "" };
    case "instagram":
      return { post_url: "" };
    case "quote":
      return { text: "", attribution: "" };
    default:
      return {};
  }
}

function serializeBlocks(blocks: Block[]): string {
  return blocks
    .map((b) => {
      const d = b.data;
      switch (b.type) {
        case "html":
          return d.html ?? "";
        case "image": {
          if (!d.url) return "";
          const cap = d.caption
            ? `<figcaption style="text-align:center;font-size:0.85em;color:#78716c;margin-top:0.5rem">${d.caption}${d.credit ? ` — <em>${d.credit}</em>` : ""}</figcaption>`
            : "";
          return `<figure style="margin:1.5rem 0"><img src="${d.url}" alt="${d.alt ?? ""}" style="width:100%;border-radius:8px;display:block" />${cap}</figure>`;
        }
        case "youtube": {
          if (!d.video_id) return "";
          const ycap = d.caption
            ? `<p style="text-align:center;font-size:0.85em;color:#78716c;margin-top:0.5rem">${d.caption}</p>`
            : "";
          return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:1.5rem 0"><iframe src="https://www.youtube.com/embed/${d.video_id}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen loading="lazy"></iframe></div>${ycap}`;
        }
        case "twitter":
          if (!d.tweet_url) return "";
          return `<blockquote class="twitter-tweet"><a href="${d.tweet_url}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
        case "instagram":
          if (!d.post_url) return "";
          return `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${d.post_url}" style="width:100%;margin:1.5rem auto"></blockquote><script async defer src="//www.instagram.com/embed.js"></script>`;
        case "quote": {
          if (!d.text) return "";
          const attr = d.attribution
            ? `<cite style="font-size:0.85em;color:#78716c;display:block;margin-top:0.5rem">— ${d.attribution}</cite>`
            : "";
          return `<blockquote style="border-left:4px solid #d97706;padding:1rem 1.5rem;margin:1.5rem 0;background:#fffbeb;border-radius:0 8px 8px 0"><p style="font-size:1.05em;font-style:italic;margin:0">${d.text}</p>${attr}</blockquote>`;
        }
        case "divider":
          return `<hr style="margin:2rem 0;border:none;border-top:2px solid #e5e7eb" />`;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n");
}

// On load, wrap existing HTML content in a single html block
function htmlToBlocks(html: string): Block[] {
  if (!html) return [];
  return [{ id: crypto.randomUUID(), type: "html", data: { html } }];
}

// ─── Image uploader for blocks ─────────────────────────────────────────────────

function ImageBlockUploader({
  value,
  onChange,
  uploadId,
}: {
  value: string;
  onChange: (url: string) => void;
  uploadId: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setErr(null);
    setUploading(true);
    try {
      const url = await uploadImageToCDN(file, uploadId);
      onChange(url);
    } catch (ex: any) {
      setErr(ex.message ?? "Error al subir");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={value} alt="" className="w-full object-cover max-h-48" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && ref.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border hover:border-amber-400 transition-colors cursor-pointer py-6 bg-muted/30"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Haz clic para subir
              </span>
            </>
          )}
        </div>
      )}
      {value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          disabled={uploading}
          onClick={() => ref.current?.click()}
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          Cambiar
        </Button>
      )}
      {err && <p className="text-xs text-destructive">{err}</p>}
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handle}
      />
    </div>
  );
}

// ─── Block editor ─────────────────────────────────────────────────────────────

function BlockEditor({
  block,
  onChange,
  postUploadId,
  index,
}: {
  block: Block;
  onChange: (data: Record<string, string>) => void;
  postUploadId: string;
  index: number;
}) {
  const d = block.data;

  const field = (
    key: string,
    label: string,
    multiline = false,
    placeholder = "",
  ) => (
    <div className="space-y-1" key={key}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {multiline ? (
        <Textarea
          value={d[key] ?? ""}
          onChange={(e) => onChange({ ...d, [key]: e.target.value })}
          placeholder={placeholder}
          className="text-xs font-mono min-h-[80px] resize-y bg-accent/30"
          rows={4}
        />
      ) : (
        <Input
          value={d[key] ?? ""}
          onChange={(e) => onChange({ ...d, [key]: e.target.value })}
          placeholder={placeholder}
          className="h-8 text-xs bg-accent/30"
        />
      )}
    </div>
  );

  switch (block.type) {
    case "html":
      return (
        <RichHtmlEditor
          value={d.html ?? ""}
          onChange={(html) => onChange({ ...d, html })}
          placeholder="Escribe el contenido del bloque aquí..."
        />
      );

    case "image":
      return (
        <div className="space-y-3">
          <ImageBlockUploader
            value={d.url ?? ""}
            onChange={(url) => onChange({ ...d, url })}
            uploadId={`${postUploadId}_blk_${index}`}
          />
          <div className="grid grid-cols-2 gap-2">
            {field("alt", "Alt text", false, "Descripción de la imagen")}
            {field(
              "caption",
              "Pie de foto",
              false,
              "Texto visible bajo la imagen",
            )}
          </div>
          {field("credit", "Crédito / fuente", false, "Fotógrafo o fuente")}
        </div>
      );

    case "youtube":
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              ID del video *
            </Label>
            <Input
              value={d.video_id ?? ""}
              onChange={(e) => onChange({ ...d, video_id: e.target.value })}
              placeholder="dQw4w9WgXcQ"
              className="h-8 text-xs bg-accent/30 font-mono"
            />
            <p className="text-[10px] text-muted-foreground">
              youtube.com/watch?v=<strong>ESTE_ID</strong>
            </p>
          </div>
          {d.video_id && (
            <div className="aspect-video rounded-lg overflow-hidden border border-border">
              <iframe
                src={`https://www.youtube.com/embed/${d.video_id}`}
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
          {field("caption", "Pie del video", false, "Descripción opcional")}
        </div>
      );

    case "twitter":
      return (
        <div className="space-y-2">
          {field(
            "tweet_url",
            "URL del tweet / post de X *",
            false,
            "https://twitter.com/user/status/123...",
          )}
          <p className="text-[10px] text-muted-foreground">
            El embed se cargará dinámicamente en el blog.
          </p>
        </div>
      );

    case "instagram":
      return (
        <div className="space-y-2">
          {field(
            "post_url",
            "URL de la publicación *",
            false,
            "https://www.instagram.com/p/ABC123/",
          )}
          <p className="text-[10px] text-muted-foreground">
            El embed de Instagram se cargará dinámicamente.
          </p>
        </div>
      );

    case "quote":
      return (
        <div className="space-y-2">
          {field("text", "Texto de la cita *", true, "La cita aquí...")}
          {field("attribution", "Atribución", false, "— Nombre, Cargo")}
          {d.text && (
            <blockquote className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50 dark:bg-amber-950/20 rounded-r-lg text-sm italic text-foreground">
              <p>{d.text}</p>
              {d.attribution && (
                <cite className="text-xs text-muted-foreground not-italic block mt-1">
                  — {d.attribution}
                </cite>
              )}
            </blockquote>
          )}
        </div>
      );

    case "divider":
      return (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">
            Divisor horizontal
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
      );

    default:
      return null;
  }
}

// ─── Form interface ────────────────────────────────────────────────────────────

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  categoryId: string;
  status: "draft" | "published" | "archived";
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
}

const EMPTY_FORM: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  featuredImage: "",
  categoryId: "",
  status: "draft",
  publishedAt: "",
  metaTitle: "",
  metaDescription: "",
};

// ─── Main component ────────────────────────────────────────────────────────────

export default function AdminBlogEditor() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    current,
    contentLoading,
    categories,
    actionLoading,
    actionError,
    actionSuccess,
  } = useAppSelector((s) => s.adminBlog);

  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [slugEdited, setSlugEdited] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const tempIdRef = useRef(`blog-temp-${Date.now()}`);
  const postUploadId = isEditing && id ? `blog-${id}` : tempIdRef.current;

  // ── Featured image upload ───────────────────────────────────────────────
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImageError(null);
    setImageUploading(true);
    try {
      const url = await uploadImageToCDN(file, postUploadId);
      setForm((f) => ({ ...f, featuredImage: url }));
    } catch (err: any) {
      setImageError(err.message ?? "Error al subir la imagen");
    } finally {
      setImageUploading(false);
    }
  };

  // ── Load ────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchAdminBlogCategories());
    if (isEditing && id) {
      dispatch(fetchAdminBlogPost(parseInt(id)));
    }
    return () => {
      dispatch(clearAdminBlogCurrent());
      dispatch(clearAdminBlogActionState());
    };
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (isEditing && current) {
      setForm({
        title: current.title,
        slug: current.slug,
        excerpt: current.excerpt ?? "",
        featuredImage: current.featuredImage ?? "",
        categoryId: current.categoryId ? String(current.categoryId) : "",
        status: current.status,
        publishedAt: current.publishedAt
          ? new Date(current.publishedAt).toISOString().slice(0, 16)
          : "",
        metaTitle: current.metaTitle ?? "",
        metaDescription: current.metaDescription ?? "",
      });
      setSlugEdited(true);
      setBlocks(htmlToBlocks(current.content));
    }
  }, [isEditing, current]);

  useEffect(() => {
    if (actionSuccess) {
      setSaved(true);
      const t = setTimeout(() => {
        setSaved(false);
        dispatch(clearAdminBlogActionState());
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [actionSuccess, dispatch]);

  // ── Auto-slug ───────────────────────────────────────────────────────────
  const handleTitleChange = useCallback(
    (title: string) => {
      setForm((f) => ({
        ...f,
        title,
        slug: slugEdited ? f.slug : toSlug(title),
      }));
    },
    [slugEdited],
  );

  // ── Block helpers ───────────────────────────────────────────────────────
  const addBlock = (type: BlockType) => {
    setBlocks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, data: defaultData(type) },
    ]);
  };

  const removeBlock = (idx: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveBlock = (idx: number, dir: "up" | "down") => {
    setBlocks((prev) => {
      const next = [...prev];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const updateBlock = (idx: number, data: Record<string, string>) => {
    setBlocks((prev) => prev.map((b, i) => (i === idx ? { ...b, data } : b)));
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      return;
    }
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    setDragIdx(null);
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAdminBlogActionState());

    const content = serializeBlocks(blocks);
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || undefined,
      content,
      featuredImage: form.featuredImage || undefined,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      status: form.status,
      publishedAt: form.publishedAt || null,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
    };

    if (isEditing && id) {
      await dispatch(updateAdminBlogPost({ ...payload, id: parseInt(id) }));
    } else {
      const result = await dispatch(createAdminBlogPost(payload));
      if (createAdminBlogPost.fulfilled.match(result)) {
        navigate(`/admin/blog/${result.payload.id}/edit`, { replace: true });
      }
    }
  };

  const isValid = form.title.trim().length > 0 && form.slug.trim().length > 0;
  const previewHtml = serializeBlocks(blocks);

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-border" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Cargando post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/blog")}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Blog
        </Button>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <h1 className="text-lg font-bold text-foreground">
            {isEditing ? "Editar post" : "Nuevo post"}
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Guardado
            </div>
          )}
          <Button
            type="submit"
            form="blog-editor-form"
            disabled={actionLoading || !isValid}
            className="h-9 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 gap-2"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {actionLoading ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>

      {actionError && (
        <Alert
          variant="destructive"
          className="border-destructive/50 bg-destructive/10"
        >
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <form id="blog-editor-form" onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* ── Main column ── */}
          <div className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Título *
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="El título de tu post"
                className="h-11 text-base font-medium"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium">
                Slug *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setForm((f) => ({ ...f, slug: toSlug(e.target.value) }));
                  }}
                  placeholder="url-del-post"
                  className="h-9 font-mono text-sm"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 flex-shrink-0"
                  title="Regenerar desde el título"
                  onClick={() => {
                    setSlugEdited(false);
                    setForm((f) => ({ ...f, slug: toSlug(f.title) }));
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                /blog/{form.slug || "…"}
              </p>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-sm font-medium">
                Resumen
              </Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, excerpt: e.target.value }))
                }
                placeholder="Breve descripción del post (aparece en listados y SEO)"
                className="text-sm resize-none"
                rows={3}
              />
            </div>

            {/* Featured image */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                Imagen principal
              </Label>
              {form.featuredImage ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={form.featuredImage}
                    alt="Preview"
                    className="w-full object-cover max-h-48"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, featuredImage: "" }))
                    }
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() =>
                    !imageUploading && imageInputRef.current?.click()
                  }
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border hover:border-amber-400 transition-colors cursor-pointer py-8 bg-muted/30 hover:bg-amber-50/30"
                >
                  {imageUploading ? (
                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Haz clic para subir una imagen
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        JPG, PNG, WebP
                      </span>
                    </>
                  )}
                </div>
              )}
              {form.featuredImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  disabled={imageUploading}
                  onClick={() => imageInputRef.current?.click()}
                >
                  {imageUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  Cambiar imagen
                </Button>
              )}
              {imageError && (
                <p className="text-xs text-destructive">{imageError}</p>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageFile}
              />
            </div>

            {/* ── Content blocks ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Contenido
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {blocks.length} bloque{blocks.length !== 1 ? "s" : ""}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 gap-1.5 text-xs text-muted-foreground"
                    onClick={() => setPreviewMode((p) => !p)}
                  >
                    {previewMode ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Editar
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Vista previa
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Add block toolbar */}
              <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-accent/20 border border-dashed border-border">
                <span className="text-xs text-muted-foreground self-center mr-1 font-medium">
                  + Agregar:
                </span>
                {BLOCK_TYPES.map(({ type, icon: Icon, label }) => (
                  <Button
                    key={type}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock(type)}
                    className="h-7 px-2.5 text-xs gap-1.5"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </Button>
                ))}
              </div>

              {/* Preview mode */}
              {previewMode ? (
                <div
                  className="prose prose-sm max-w-none p-4 rounded-lg border border-border bg-muted/20 min-h-[200px] text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_p]:text-sm [&_li]:text-sm [&_a]:text-amber-600 [&_strong]:font-semibold [&_blockquote]:not-italic [&_iframe]:rounded-lg [&_iframe]:w-full"
                  dangerouslySetInnerHTML={{
                    __html:
                      previewHtml ||
                      "<p class='text-muted-foreground italic text-sm'>Sin bloques todavía…</p>",
                  }}
                />
              ) : (
                /* Block list */
                <div className="space-y-3">
                  {blocks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed border-border text-muted-foreground gap-3">
                      <FileText className="w-8 h-8 opacity-20" />
                      <p className="text-sm text-center max-w-xs">
                        Aún no hay bloques. Usa los botones de arriba para
                        agregar HTML, imágenes, videos y más.
                      </p>
                    </div>
                  )}
                  {blocks.map((block, idx) => {
                    const cfg = BLOCK_TYPES.find((t) => t.type === block.type);
                    const Icon = cfg?.icon ?? Code2;
                    return (
                      <div
                        key={block.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverIdx(idx);
                        }}
                        onDrop={(e) => handleDrop(e, idx)}
                        onDragLeave={() => setDragOverIdx(null)}
                        className={cn(
                          "rounded-lg border bg-card/60 overflow-hidden transition-all",
                          dragIdx === idx
                            ? "opacity-40"
                            : dragOverIdx === idx
                              ? "border-amber-500 border-2"
                              : "border-border",
                        )}
                      >
                        {/* Block header */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-accent/30 border-b border-border">
                          <div
                            draggable
                            onDragStart={(e) => {
                              setDragIdx(idx);
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => {
                              setDragIdx(null);
                              setDragOverIdx(null);
                            }}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                          </div>
                          <Icon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span className="text-xs font-medium text-foreground flex-1">
                            {cfg?.label ?? block.type}{" "}
                            <span className="text-muted-foreground">
                              #{idx + 1}
                            </span>
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6"
                              onClick={() => moveBlock(idx, "up")}
                              disabled={idx === 0}
                            >
                              <ChevronUp className="w-3 h-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6"
                              onClick={() => moveBlock(idx, "down")}
                              disabled={idx === blocks.length - 1}
                            >
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 text-destructive hover:text-destructive"
                              onClick={() => removeBlock(idx)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {/* Block content */}
                        <div className="p-3">
                          <BlockEditor
                            block={block}
                            onChange={(data) => updateBlock(idx, data)}
                            postUploadId={postUploadId}
                            index={idx}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            {/* Publication */}
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                Publicación
              </h3>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: "draft" | "published" | "archived") =>
                    setForm((f) => ({
                      ...f,
                      status: v,
                      publishedAt:
                        v === "draft" || v === "archived" ? "" : f.publishedAt,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.status === "published" && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Fecha de publicación
                  </Label>
                  <Input
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, publishedAt: e.target.value }))
                    }
                    className="h-9 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Vacío = publicar inmediatamente
                  </p>
                </div>
              )}
              {form.status === "draft" && (
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-md px-2.5 py-1.5">
                  El post no será visible en el blog público
                </p>
              )}
            </div>

            {/* Category */}
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                Categoría
              </h3>
              <Select
                value={form.categoryId || "__none__"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    categoryId: v === "__none__" ? "" : v,
                  }))
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin categoría</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SEO */}
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">SEO</h3>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Meta title
                </Label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, metaTitle: e.target.value }))
                  }
                  placeholder={form.title || "Título para buscadores"}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Meta description
                </Label>
                <Textarea
                  value={form.metaDescription}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, metaDescription: e.target.value }))
                  }
                  placeholder={
                    form.excerpt || "Descripción para buscadores (max 160)"
                  }
                  className="text-xs resize-none"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {form.metaDescription.length}/160
                </p>
              </div>
            </div>

            {/* Post info (edit mode only) */}
            {isEditing && current && (
              <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Info
                </h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    Autor:{" "}
                    <span className="text-foreground">
                      {current.authorName}
                    </span>
                  </p>
                  <p>
                    Vistas:{" "}
                    <span className="text-foreground">
                      {current.views.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Creado:{" "}
                    <span className="text-foreground">
                      {new Date(current.createdAt).toLocaleDateString("es-MX")}
                    </span>
                  </p>
                  <p>
                    Modificado:{" "}
                    <span className="text-foreground">
                      {new Date(current.updatedAt).toLocaleDateString("es-MX")}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
