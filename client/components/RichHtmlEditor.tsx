import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "@tiptap/extension-table";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Code2,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Link2Off,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Minus,
  Highlighter,
  RemoveFormatting,
  Plus,
  Trash2,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Toolbar button ────────────────────────────────────────────
function ToolBtn({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault(); // keep editor focus
            if (!disabled) onClick();
          }}
          disabled={disabled}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded text-sm transition-colors",
            active
              ? "bg-amber-500/25 text-amber-500"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
            disabled && "opacity-30 cursor-not-allowed",
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {title}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Divider ───────────────────────────────────────────────────
function Sep() {
  return <div className="w-px h-5 bg-border/60 mx-0.5 self-center" />;
}

// ── Color swatches ────────────────────────────────────────────
const COLORS = [
  "#ffffff",
  "#d1d5db",
  "#9ca3af",
  "#6b7280",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

const HIGHLIGHTS = [
  "#fef08a",
  "#bbf7d0",
  "#bfdbfe",
  "#fecaca",
  "#fed7aa",
  "#e9d5ff",
  "#fbcfe8",
  "#a5f3fc",
];

// ── Main component ────────────────────────────────────────────
interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichHtmlEditor({
  value,
  onChange,
  placeholder,
}: Props) {
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceValue, setSourceValue] = useState(value);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Escribe tu contenido aquí...",
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[220px] p-4 focus:outline-none " +
          "prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground " +
          "prose-ul:text-foreground prose-ol:text-foreground prose-blockquote:text-muted-foreground " +
          "prose-code:text-amber-500 prose-pre:bg-accent/50 prose-a:text-amber-600",
      },
    },
  });

  // Sync external value changes (e.g. when block loads)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
    setSourceValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Source-mode sync back to editor
  const exitSourceMode = useCallback(() => {
    setSourceMode(false);
    if (editor) {
      editor.commands.setContent(sourceValue);
      onChange(sourceValue);
    }
  }, [editor, sourceValue, onChange]);

  if (!editor) return null;

  const currentHeading = (() => {
    for (const lvl of [1, 2, 3, 4] as const) {
      if (editor.isActive("heading", { level: lvl })) return String(lvl);
    }
    return "p";
  })();

  const insertLink = () => {
    if (!linkUrl) return;
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkUrl("");
  };

  const insertImage = () => {
    if (!imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
  };

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-accent/20 overflow-x-auto">
          {/* Heading buttons */}
          <ToolBtn
            title="Párrafo"
            active={currentHeading === "p"}
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            <Pilcrow className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Título 1"
            active={currentHeading === "1"}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Título 2"
            active={currentHeading === "2"}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Título 3"
            active={currentHeading === "3"}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Título 4"
            active={currentHeading === "4"}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 4 }).run()
            }
          >
            <Heading4 className="w-3.5 h-3.5" />
          </ToolBtn>

          <Sep />

          {/* Inline formatting */}
          <ToolBtn
            title="Negrita (⌘B)"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Cursiva (⌘I)"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Subrayado"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Tachado"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Código"
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="w-3.5 h-3.5" />
          </ToolBtn>

          <Sep />

          {/* Text color */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-7 h-7 flex items-center justify-center rounded text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors relative"
                  >
                    <span className="text-[11px] font-bold">A</span>
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-[3px] rounded-full"
                      style={{
                        backgroundColor:
                          editor.getAttributes("textStyle").color ?? "#f59e0b",
                      }}
                    />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Color de texto
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-44 p-2">
              <p className="text-[10px] text-muted-foreground mb-2 font-medium">
                Color de texto
              </p>
              <div className="grid grid-cols-6 gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().setColor(c).run();
                    }}
                    className="w-6 h-6 rounded border border-border/40 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().unsetColor().run();
                }}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground w-full text-left"
              >
                Sin color
              </button>
            </PopoverContent>
          </Popover>

          {/* Highlight */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                      "w-7 h-7 flex items-center justify-center rounded text-sm transition-colors",
                      editor.isActive("highlight")
                        ? "bg-amber-500/25 text-amber-500"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                    )}
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Resaltar texto
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-44 p-2">
              <p className="text-[10px] text-muted-foreground mb-2 font-medium">
                Color de resaltado
              </p>
              <div className="grid grid-cols-4 gap-1">
                {HIGHLIGHTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: c })
                        .run();
                    }}
                    className="w-8 h-6 rounded border border-border/40 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().unsetHighlight().run();
                }}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground w-full text-left"
              >
                Sin resaltado
              </button>
            </PopoverContent>
          </Popover>

          <Sep />

          {/* Alignment */}
          <ToolBtn
            title="Izquierda"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Centro"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Derecha"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Justificar"
            active={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </ToolBtn>

          <Sep />

          {/* Lists */}
          <ToolBtn
            title="Lista con viñetas"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Lista numerada"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Cita"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Bloque de código"
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code2 className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Línea horizontal"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="w-3.5 h-3.5" />
          </ToolBtn>

          <Sep />

          {/* Link */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                      "w-7 h-7 flex items-center justify-center rounded text-sm transition-colors",
                      editor.isActive("link")
                        ? "bg-amber-500/25 text-amber-500"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                    )}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Agregar enlace
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-72 p-3">
              <p className="text-xs font-medium mb-2">URL del enlace</p>
              <div className="flex gap-2">
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-sm"
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), insertLink())
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3"
                  onClick={insertLink}
                >
                  OK
                </Button>
              </div>
              {editor.isActive("link") && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().unsetLink().run();
                  }}
                  className="flex items-center gap-1 mt-2 text-xs text-destructive hover:text-destructive/80"
                >
                  <Link2Off className="w-3 h-3" /> Quitar enlace
                </button>
              )}
            </PopoverContent>
          </Popover>

          {/* Image by URL */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-7 h-7 flex items-center justify-center rounded text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Insertar imagen por URL
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-72 p-3">
              <p className="text-xs font-medium mb-2">URL de la imagen</p>
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-sm"
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), insertImage())
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3"
                  onClick={insertImage}
                >
                  OK
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Table */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                      "w-7 h-7 flex items-center justify-center rounded text-sm transition-colors",
                      editor.isActive("table")
                        ? "bg-amber-500/25 text-amber-500"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                    )}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Tabla
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onSelect={() =>
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
              >
                <Plus className="w-3.5 h-3.5 mr-2" /> Insertar tabla (3×3)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => editor.chain().focus().addRowAfter().run()}
              >
                Agregar fila abajo
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => editor.chain().focus().addColumnAfter().run()}
              >
                Agregar columna
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => editor.chain().focus().deleteRow().run()}
              >
                Eliminar fila
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => editor.chain().focus().deleteColumn().run()}
              >
                Eliminar columna
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => editor.chain().focus().deleteTable().run()}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar tabla
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sep />

          {/* Undo / Redo */}
          <ToolBtn
            title="Deshacer (⌘Z)"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Rehacer (⌘⇧Z)"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Limpiar formato"
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </ToolBtn>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Source toggle */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (!sourceMode) {
                setSourceValue(editor.getHTML());
                setSourceMode(true);
              } else {
                exitSourceMode();
              }
            }}
            className={cn(
              "flex items-center gap-1 h-7 px-2.5 rounded text-xs font-mono transition-colors",
              sourceMode
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
            )}
          >
            <Code2 className="w-3 h-3" />
            {sourceMode ? "Vista previa" : "HTML"}
          </button>
        </div>

        {/* ── Editor / Source content ── */}
        {sourceMode ? (
          <textarea
            value={sourceValue}
            onChange={(e) => setSourceValue(e.target.value)}
            onBlur={exitSourceMode}
            className="w-full min-h-[220px] p-4 bg-background text-amber-500 font-mono text-xs resize-y focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </TooltipProvider>
  );
}
