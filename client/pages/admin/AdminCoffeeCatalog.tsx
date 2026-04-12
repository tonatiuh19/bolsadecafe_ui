import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCoffeeCatalog,
  createCoffee,
  updateCoffee,
  deleteCoffee,
  clearCoffeeActionState,
} from "@/store/slices/coffeeCatalogSlice";
import type { CoffeeCatalog, RoastLevel } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Coffee,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Mountain,
  FlaskConical,
  Leaf,
  MapPin,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROAST_LEVEL_LABELS: Record<RoastLevel, string> = {
  light: "Claro",
  medium_light: "Medio-Claro",
  medium: "Medio",
  medium_dark: "Medio-Oscuro",
  dark: "Oscuro",
};

const ROAST_LEVEL_COLORS: Record<RoastLevel, string> = {
  light: "bg-amber-100 text-amber-700 border-amber-200",
  medium_light: "bg-amber-200 text-amber-800 border-amber-300",
  medium: "bg-orange-200 text-orange-800 border-orange-300",
  medium_dark: "bg-orange-400 text-white border-orange-500",
  dark: "bg-stone-700 text-white border-stone-800",
};

const coffeeSchema = Yup.object({
  name: Yup.string().required("Nombre requerido"),
  provider: Yup.string().required("Proveedor requerido"),
  origin: Yup.string(),
  coffeeType: Yup.string(),
  variety: Yup.string(),
  process: Yup.string(),
  roastLevel: Yup.string(),
  altitudeMin: Yup.number().typeError("Debe ser un número").nullable(),
  altitudeMax: Yup.number().typeError("Debe ser un número").nullable(),
  tastingNotes: Yup.string(),
  description: Yup.string(),
  imageUrl: Yup.string().url("URL inválida").nullable(),
});

type CoffeeFormValues = {
  name: string;
  provider: string;
  origin: string;
  coffeeType: string;
  variety: string;
  process: string;
  roastLevel: RoastLevel;
  altitudeMin: string;
  altitudeMax: string;
  tastingNotes: string;
  description: string;
  imageUrl: string;
};

const emptyForm: CoffeeFormValues = {
  name: "",
  provider: "",
  origin: "",
  coffeeType: "",
  variety: "",
  process: "",
  roastLevel: "medium",
  altitudeMin: "",
  altitudeMax: "",
  tastingNotes: "",
  description: "",
  imageUrl: "",
};

// ─── Coffee card ──────────────────────────────────────────────────────────────

function CoffeeCard({
  coffee,
  onEdit,
  onDelete,
}: {
  coffee: CoffeeCatalog;
  onEdit: (c: CoffeeCatalog) => void;
  onDelete: (c: CoffeeCatalog) => void;
}) {
  const roastColor = coffee.roastLevel
    ? ROAST_LEVEL_COLORS[coffee.roastLevel]
    : ROAST_LEVEL_COLORS["medium"];

  const altitudeLabel =
    coffee.altitudeMin && coffee.altitudeMax
      ? `${coffee.altitudeMin}–${coffee.altitudeMax} msnm`
      : coffee.altitudeMin
        ? `${coffee.altitudeMin}+ msnm`
        : coffee.altitudeMax
          ? `hasta ${coffee.altitudeMax} msnm`
          : null;

  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-700 p-5 transition-all duration-200 hover:shadow-lg hover:border-primary/30",
        !coffee.isActive && "opacity-50",
      )}
    >
      {/* Inactive badge */}
      {!coffee.isActive && (
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Inactivo
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Coffee className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-base leading-tight truncate">
            {coffee.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {coffee.provider}
          </p>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {coffee.roastLevel && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full border",
              roastColor,
            )}
          >
            {ROAST_LEVEL_LABELS[coffee.roastLevel]}
          </span>
        )}
        {coffee.coffeeType && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
            {coffee.coffeeType}
          </span>
        )}
        {coffee.process && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
            {coffee.process}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-4 text-xs text-muted-foreground">
        {coffee.origin && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{coffee.origin}</span>
          </div>
        )}
        {altitudeLabel && (
          <div className="flex items-center gap-1.5">
            <Mountain className="w-3 h-3 flex-shrink-0" />
            <span>{altitudeLabel}</span>
          </div>
        )}
        {coffee.variety && (
          <div className="flex items-center gap-1.5">
            <Leaf className="w-3 h-3 flex-shrink-0" />
            <span>Variedad: {coffee.variety}</span>
          </div>
        )}
        {coffee.tastingNotes && (
          <div className="flex items-center gap-1.5">
            <Star className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{coffee.tastingNotes}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {coffee.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
          {coffee.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs"
          onClick={() => onEdit(coffee)}
        >
          <Pencil className="w-3 h-3 mr-1" /> Editar
        </Button>
        {coffee.isActive && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => onDelete(coffee)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Coffee form dialog ───────────────────────────────────────────────────────

function CoffeeFormDialog({
  open,
  onOpenChange,
  editingCoffee,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingCoffee: CoffeeCatalog | null;
}) {
  const dispatch = useAppDispatch();
  const { actionLoading } = useAppSelector((s) => s.coffeeCatalog);
  const isEdit = !!editingCoffee;

  const formik = useFormik<CoffeeFormValues>({
    initialValues: editingCoffee
      ? {
          name: editingCoffee.name,
          provider: editingCoffee.provider,
          origin: editingCoffee.origin ?? "",
          coffeeType: editingCoffee.coffeeType ?? "",
          variety: editingCoffee.variety ?? "",
          process: editingCoffee.process ?? "",
          roastLevel: editingCoffee.roastLevel ?? "medium",
          altitudeMin: editingCoffee.altitudeMin
            ? String(editingCoffee.altitudeMin)
            : "",
          altitudeMax: editingCoffee.altitudeMax
            ? String(editingCoffee.altitudeMax)
            : "",
          tastingNotes: editingCoffee.tastingNotes ?? "",
          description: editingCoffee.description ?? "",
          imageUrl: editingCoffee.imageUrl ?? "",
        }
      : emptyForm,
    validationSchema: coffeeSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        name: values.name,
        provider: values.provider,
        origin: values.origin || undefined,
        coffeeType: values.coffeeType || undefined,
        variety: values.variety || undefined,
        process: values.process || undefined,
        roastLevel: values.roastLevel || undefined,
        altitudeMin: values.altitudeMin
          ? Number(values.altitudeMin)
          : undefined,
        altitudeMax: values.altitudeMax
          ? Number(values.altitudeMax)
          : undefined,
        tastingNotes: values.tastingNotes || undefined,
        description: values.description || undefined,
        imageUrl: values.imageUrl || undefined,
      };

      if (isEdit && editingCoffee) {
        await dispatch(updateCoffee({ ...payload, id: editingCoffee.id }));
      } else {
        await dispatch(createCoffee(payload));
      }

      resetForm();
      onOpenChange(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) formik.resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-primary" />
            {isEdit ? "Editar Café" : "Nuevo Café"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Row 1: name + provider */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Nombre del Café <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Ej: Café Alarcón Bourbon"
                {...formik.getFieldProps("name")}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-destructive text-xs">{formik.errors.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Proveedor / Productor{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Ej: Finca El Paraíso"
                {...formik.getFieldProps("provider")}
              />
              {formik.touched.provider && formik.errors.provider && (
                <p className="text-destructive text-xs">
                  {formik.errors.provider}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: origin + coffeeType */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Origen / Región
              </Label>
              <Input
                placeholder="Ej: Chiapas, Oaxaca, Veracruz"
                {...formik.getFieldProps("origin")}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5" /> Tipo de Café
              </Label>
              <Input
                placeholder="Ej: Arábica, Robusta"
                {...formik.getFieldProps("coffeeType")}
              />
            </div>
          </div>

          {/* Row 3: variety + process */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5" /> Variedad
              </Label>
              <Input
                placeholder="Ej: Bourbon, Typica, Caturra, Geisha"
                {...formik.getFieldProps("variety")}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1">
                <FlaskConical className="w-3.5 h-3.5" /> Proceso
              </Label>
              <Input
                placeholder="Ej: Natural, Lavado, Honey, Anaeróbico"
                {...formik.getFieldProps("process")}
              />
            </div>
          </div>

          {/* Row 4: roastLevel + altitude */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Nivel de Tueste</Label>
              <Select
                value={formik.values.roastLevel}
                onValueChange={(v) => formik.setFieldValue("roastLevel", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROAST_LEVEL_LABELS) as RoastLevel[]).map(
                    (k) => (
                      <SelectItem key={k} value={k}>
                        {ROAST_LEVEL_LABELS[k]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5" /> Altura Mín (msnm)
              </Label>
              <Input
                type="number"
                placeholder="1200"
                {...formik.getFieldProps("altitudeMin")}
              />
              {formik.touched.altitudeMin && formik.errors.altitudeMin && (
                <p className="text-destructive text-xs">
                  {formik.errors.altitudeMin}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5" /> Altura Máx (msnm)
              </Label>
              <Input
                type="number"
                placeholder="2000"
                {...formik.getFieldProps("altitudeMax")}
              />
              {formik.touched.altitudeMax && formik.errors.altitudeMax && (
                <p className="text-destructive text-xs">
                  {formik.errors.altitudeMax}
                </p>
              )}
            </div>
          </div>

          {/* tastingNotes */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Star className="w-3.5 h-3.5" /> Notas de Cata
            </Label>
            <Input
              placeholder="Ej: chocolate amargo, caramelo, frutas cítricas"
              {...formik.getFieldProps("tastingNotes")}
            />
          </div>

          {/* description */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Descripción</Label>
            <Textarea
              rows={3}
              placeholder="Descripción del café, historia del productor, características especiales..."
              {...formik.getFieldProps("description")}
            />
          </div>

          {/* imageUrl */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">URL de Imagen</Label>
            <Input
              placeholder="https://..."
              {...formik.getFieldProps("imageUrl")}
            />
            {formik.touched.imageUrl && formik.errors.imageUrl && (
              <p className="text-destructive text-xs">
                {formik.errors.imageUrl}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                formik.resetForm();
                onOpenChange(false);
              }}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={actionLoading}>
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : isEdit ? (
                "Guardar cambios"
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Crear Café
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminCoffeeCatalog() {
  const dispatch = useAppDispatch();
  const { items, loading, error, actionSuccess, actionError } = useAppSelector(
    (s) => s.coffeeCatalog,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<CoffeeCatalog | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<CoffeeCatalog | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    dispatch(fetchCoffeeCatalog());
  }, [dispatch]);

  useEffect(() => {
    if (actionSuccess) {
      setToast({ type: "success", msg: actionSuccess });
      dispatch(clearCoffeeActionState());
      setTimeout(() => setToast(null), 4000);
    }
    if (actionError) {
      setToast({ type: "error", msg: actionError });
      dispatch(clearCoffeeActionState());
      setTimeout(() => setToast(null), 5000);
    }
  }, [actionSuccess, actionError, dispatch]);

  const handleEdit = (coffee: CoffeeCatalog) => {
    setEditingCoffee(coffee);
    setFormOpen(true);
  };

  const handleNewCoffee = () => {
    setEditingCoffee(null);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteCoffee(deleteTarget.id));
    setDeleteTarget(null);
  };

  const visibleItems = showInactive ? items : items.filter((c) => c.isActive);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Catálogo de Café
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Administra los cafés disponibles para los envíos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(fetchCoffeeCatalog())}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            title="Actualizar"
          >
            <RefreshCw
              className={`w-4 h-4 text-muted-foreground ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInactive((v) => !v)}
            className="text-xs"
          >
            {showInactive ? "Ocultar inactivos" : "Ver inactivos"}
          </Button>
          <Button onClick={handleNewCoffee} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo Café
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">
            {items.filter((c) => c.isActive).length}
          </strong>{" "}
          activos
        </span>
        {items.filter((c) => !c.isActive).length > 0 && (
          <span>
            <strong className="text-foreground">
              {items.filter((c) => !c.isActive).length}
            </strong>{" "}
            inactivos
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 animate-in slide-in-from-right-5",
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid */}
      {loading && items.length === 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-gray-100 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Coffee className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Sin cafés en el catálogo
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            Crea tu primer café para poder seleccionarlo en los envíos.
          </p>
          <Button onClick={handleNewCoffee}>
            <Plus className="w-4 h-4 mr-2" /> Crear primer café
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleItems.map((coffee) => (
            <CoffeeCard
              key={coffee.id}
              coffee={coffee}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <CoffeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingCoffee={editingCoffee}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar este café?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> será desactivado y no
              aparecerá en las opciones de envío. Puedes reactivarlo más tarde
              editándolo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
