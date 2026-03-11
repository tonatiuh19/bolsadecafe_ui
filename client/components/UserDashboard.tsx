import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  MapPin,
  User,
  CreditCard,
  XCircle,
  ArrowUpCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Calendar,
  Coffee,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMySubscription,
  updateShippingAddress,
  updateDeliveryContact,
  upgradeSubscriptionPlan,
  cancelSubscription,
  openBillingPortal,
  clearActionState,
} from "@/store/slices/dashboardSlice";
import { fetchStates } from "@/store/slices/statesSlice";
import { fetchPlans } from "@/store/slices/plansSlice";

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserDashboardProps {
  open: boolean;
  onClose: () => void;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  trialing: "En prueba",
  past_due: "Pago vencido",
  paused: "Pausada",
  incomplete: "Incompleta",
  cancelled: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  trialing: "bg-brand-50 text-brand-700 border-brand-200",
  past_due: "bg-amber-50 text-amber-700 border-amber-200",
  paused: "bg-neutral-100 text-neutral-600 border-neutral-200",
  incomplete: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

function fmt(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Row action button */
function ActionRow({
  icon: Icon,
  label,
  description,
  onClick,
  variant = "default",
  loading = false,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: "default" | "danger";
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all group
        ${
          variant === "danger"
            ? "border-red-100 hover:border-red-300 hover:bg-red-50 text-red-600"
            : "border-neutral-100 hover:border-brand-200 hover:bg-brand-50/50 text-neutral-700"
        }
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
          ${variant === "danger" ? "bg-red-50 text-red-500" : "bg-brand-50 text-brand-600"}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 text-left">
        <p
          className={`text-sm font-semibold ${variant === "danger" ? "text-red-600" : "text-neutral-800"}`}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-current transition-colors" />
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type ActiveDialog = "address" | "contact" | "plan" | "cancel" | null;

export default function UserDashboard({ open, onClose }: UserDashboardProps) {
  const dispatch = useAppDispatch();
  const {
    subscription,
    loading,
    error,
    updatingAddress,
    updatingContact,
    upgradingPlan,
    cancelling,
    openingPortal,
    actionError,
    actionSuccess,
  } = useAppSelector((s) => s.dashboard);
  const { states } = useAppSelector((s) => s.states);
  const { plans } = useAppSelector((s) => s.plans);

  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [cancelPhrase, setCancelPhrase] = useState("");
  const [showDanger, setShowDanger] = useState(false);

  // Load data when sheet opens
  useEffect(() => {
    if (open) {
      dispatch(fetchMySubscription());
      dispatch(fetchStates());
      dispatch(fetchPlans());
    }
  }, [open, dispatch]);

  // Close dialog + refresh on success
  useEffect(() => {
    if (actionSuccess) {
      setDialog(null);
      setCancelPhrase("");
      dispatch(fetchMySubscription());
      const t = setTimeout(() => dispatch(clearActionState()), 3500);
      return () => clearTimeout(t);
    }
  }, [actionSuccess, dispatch]);

  // ── Address form ──────────────────────────────────────────────────────────
  const addressForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: subscription?.shippingAddress?.fullName ?? "",
      streetAddress: subscription?.shippingAddress?.streetAddress ?? "",
      streetAddress2: subscription?.shippingAddress?.streetAddress2 ?? "",
      city: subscription?.shippingAddress?.city ?? "",
      stateId: subscription?.shippingAddress?.stateId?.toString() ?? "",
      postalCode: subscription?.shippingAddress?.postalCode ?? "",
      phone: subscription?.shippingAddress?.phone ?? "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Nombre requerido"),
      streetAddress: Yup.string().required("Dirección requerida"),
      city: Yup.string().required("Ciudad requerida"),
      stateId: Yup.string().required("Estado requerido"),
      postalCode: Yup.string()
        .matches(/^\d{5}$/, "Código postal de 5 dígitos")
        .required("Código postal requerido"),
    }),
    onSubmit: (values) => {
      if (!subscription) return;
      dispatch(
        updateShippingAddress({
          subscriptionId: subscription.id,
          fullName: values.fullName,
          streetAddress: values.streetAddress,
          streetAddress2: values.streetAddress2 || undefined,
          city: values.city,
          stateId: Number(values.stateId),
          postalCode: values.postalCode,
          phone: values.phone || undefined,
        }),
      );
    },
  });

  // ── Contact form ──────────────────────────────────────────────────────────
  const contactForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: subscription?.shippingAddress?.fullName ?? "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .min(2, "Mínimo 2 caracteres")
        .required("Nombre requerido"),
    }),
    onSubmit: (values) => {
      if (!subscription) return;
      dispatch(
        updateDeliveryContact({
          subscriptionId: subscription.id,
          fullName: values.fullName,
        }),
      );
    },
  });

  // ── Upgrade form ──────────────────────────────────────────────────────────
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const handleUpgrade = () => {
    if (!subscription || !selectedPlanId) return;
    dispatch(
      upgradeSubscriptionPlan({
        subscriptionId: subscription.id,
        newPlanId: selectedPlanId,
      }),
    );
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    if (!subscription) return;
    dispatch(
      cancelSubscription({
        subscriptionId: subscription.id,
        confirmPhrase: cancelPhrase,
      }),
    );
  };

  // ── Billing portal ────────────────────────────────────────────────────────
  const handleOpenPortal = async () => {
    const result = await dispatch(openBillingPortal());
    if (openBillingPortal.fulfilled.match(result)) {
      window.open(result.payload as string, "_blank");
    }
  };

  const openDialog = (d: ActiveDialog) => {
    dispatch(clearActionState());
    setDialog(d);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
          {/* Header */}
          <div className="bg-gradient-to-br from-neutral-100 via-brand-50 to-white px-6 pt-8 pb-6 border-b border-neutral-100">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold text-neutral-900">
                Mi Cuenta
              </SheetTitle>
              <p className="text-sm text-neutral-500">
                Gestiona tu suscripción y datos
              </p>
            </SheetHeader>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Feedback banners */}
            {actionSuccess && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-700 text-sm">
                  {actionSuccess}
                </AlertDescription>
              </Alert>
            )}
            {(error || actionError) && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-600 text-sm">
                  {error || actionError}
                </AlertDescription>
              </Alert>
            )}

            {/* Subscription card */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                Suscripción Activa
              </p>

              {loading ? (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 bg-neutral-50">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                  <span className="text-sm text-neutral-500">Cargando…</span>
                </div>
              ) : !subscription ? (
                <div className="p-5 rounded-xl border border-neutral-100 bg-neutral-50 text-center">
                  <Coffee className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">
                    No tienes una suscripción activa
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 bg-brand-700 hover:bg-brand-800 text-white"
                    onClick={onClose}
                  >
                    Ver Planes
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-brand-100 bg-white shadow-sm shadow-brand-900/5 overflow-hidden">
                  {/* Plan header */}
                  <div className="bg-gradient-to-r from-brand-700 to-brand-800 px-5 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-brand-200 text-xs font-medium uppercase tracking-widest mb-1">
                          Plan
                        </p>
                        <p className="text-white font-bold text-lg leading-tight">
                          {subscription.planName}
                        </p>
                        <p className="text-brand-200 text-sm mt-0.5">
                          {subscription.grindTypeName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-xl">
                          ${subscription.planPrice.toLocaleString("es-MX")}
                        </p>
                        <p className="text-brand-200 text-xs">MXN / mes</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & dates */}
                  <div className="px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Estado</span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[subscription.status] ?? STATUS_COLORS.active}`}
                      >
                        {STATUS_LABELS[subscription.status] ??
                          subscription.status}
                      </span>
                    </div>

                    {subscription.cancelAtPeriodEnd && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        ⚠️ Cancelación programada — activa hasta{" "}
                        {fmt(subscription.currentPeriodEnd)}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Próxima renovación:{" "}
                        <strong className="text-neutral-700">
                          {fmt(subscription.currentPeriodEnd)}
                        </strong>
                      </span>
                    </div>

                    {subscription.shippingAddress && (
                      <div className="flex items-start gap-2 text-xs text-neutral-500">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span>
                          {subscription.shippingAddress.fullName} ·{" "}
                          {subscription.shippingAddress.streetAddress},{" "}
                          {subscription.shippingAddress.city},{" "}
                          {subscription.shippingAddress.state}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {subscription && !subscription.cancelAtPeriodEnd && (
              <>
                <Separator />

                {/* Actions */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                    Gestionar
                  </p>
                  <div className="space-y-2">
                    <ActionRow
                      icon={ArrowUpCircle}
                      label="Cambiar Plan"
                      description="Actualiza a más o menos café"
                      onClick={() => {
                        setSelectedPlanId(null);
                        openDialog("plan");
                      }}
                    />
                    <ActionRow
                      icon={MapPin}
                      label="Actualizar Dirección"
                      description="Cambia dónde recibir tu café"
                      onClick={() => openDialog("address")}
                    />
                    <ActionRow
                      icon={User}
                      label="Persona de Entrega"
                      description="Quién recibe el paquete"
                      onClick={() => openDialog("contact")}
                    />
                    <ActionRow
                      icon={CreditCard}
                      label="Método de Pago"
                      description="Administra tu tarjeta en Stripe"
                      onClick={handleOpenPortal}
                      loading={openingPortal}
                    />
                  </div>

                  {/* ── Danger zone ─────────────────────────────────────── */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowDanger((v) => !v)}
                      className="flex w-full items-center gap-2 text-xs text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <span className="flex-1 border-t border-dashed border-neutral-200" />
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${showDanger ? "rotate-180" : ""}`}
                      />
                      <span>{showDanger ? "Ocultar" : "Más opciones"}</span>
                      <span className="flex-1 border-t border-dashed border-neutral-200" />
                    </button>

                    {showDanger && (
                      <div className="mt-3 space-y-2">
                        <ActionRow
                          icon={XCircle}
                          label="Cancelar Suscripción"
                          description="Se cancelará al fin del período"
                          onClick={() => {
                            setCancelPhrase("");
                            openDialog("cancel");
                          }}
                          variant="danger"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Dialog: Change Plan ───────────────────────────────────────────── */}
      <Dialog
        open={dialog === "plan"}
        onOpenChange={(v) => !v && setDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-neutral-500">
              Plan actual:{" "}
              <strong className="text-neutral-800">
                {subscription?.planName}
              </strong>
            </p>
            <div className="space-y-2">
              {plans
                .filter(
                  (p) =>
                    p.id !== subscription?.planId &&
                    !p.name.toLowerCase().includes("negocio") &&
                    p.is_active,
                )
                .map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left
                      ${
                        selectedPlanId === plan.id
                          ? "border-brand-500 bg-brand-50 ring-1 ring-brand-400"
                          : "border-neutral-100 hover:border-brand-200 bg-white"
                      }`}
                  >
                    <div>
                      <p className="font-semibold text-sm text-neutral-800">
                        {plan.name}
                      </p>
                      <p className="text-xs text-neutral-500">{plan.weight}</p>
                    </div>
                    <p className="font-bold text-brand-700">
                      ${Number(plan.price).toLocaleString("es-MX")}
                      <span className="text-xs font-normal text-neutral-400">
                        /mes
                      </span>
                    </p>
                  </button>
                ))}
            </div>
            {actionError && (
              <p className="text-red-500 text-xs">{actionError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-brand-700 hover:bg-brand-800 text-white"
              disabled={!selectedPlanId || upgradingPlan}
              onClick={handleUpgrade}
            >
              {upgradingPlan ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando…
                </>
              ) : (
                "Confirmar Cambio"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Update Address ────────────────────────────────────────── */}
      <Dialog
        open={dialog === "address"}
        onOpenChange={(v) => !v && setDialog(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Actualizar Dirección</DialogTitle>
          </DialogHeader>
          <form onSubmit={addressForm.handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Nombre completo</Label>
                <Input
                  {...addressForm.getFieldProps("fullName")}
                  placeholder="Nombre del destinatario"
                />
                {addressForm.touched.fullName &&
                  addressForm.errors.fullName && (
                    <p className="text-xs text-red-500 mt-1">
                      {addressForm.errors.fullName}
                    </p>
                  )}
              </div>
              <div className="col-span-2">
                <Label>Calle y número</Label>
                <Input
                  {...addressForm.getFieldProps("streetAddress")}
                  placeholder="Ej: Av. Insurgentes 123"
                />
                {addressForm.touched.streetAddress &&
                  addressForm.errors.streetAddress && (
                    <p className="text-xs text-red-500 mt-1">
                      {addressForm.errors.streetAddress}
                    </p>
                  )}
              </div>
              <div className="col-span-2">
                <Label>
                  Colonia / Interior{" "}
                  <span className="text-neutral-400">(opcional)</span>
                </Label>
                <Input
                  {...addressForm.getFieldProps("streetAddress2")}
                  placeholder="Colonia, depto, etc."
                />
              </div>
              <div>
                <Label>Ciudad</Label>
                <Input
                  {...addressForm.getFieldProps("city")}
                  placeholder="Ciudad"
                />
                {addressForm.touched.city && addressForm.errors.city && (
                  <p className="text-xs text-red-500 mt-1">
                    {addressForm.errors.city}
                  </p>
                )}
              </div>
              <div>
                <Label>Código Postal</Label>
                <Input
                  {...addressForm.getFieldProps("postalCode")}
                  placeholder="12345"
                  maxLength={5}
                />
                {addressForm.touched.postalCode &&
                  addressForm.errors.postalCode && (
                    <p className="text-xs text-red-500 mt-1">
                      {addressForm.errors.postalCode}
                    </p>
                  )}
              </div>
              <div className="col-span-2">
                <Label>Estado</Label>
                <Select
                  value={addressForm.values.stateId}
                  onValueChange={(v) => addressForm.setFieldValue("stateId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {states.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {addressForm.touched.stateId && addressForm.errors.stateId && (
                  <p className="text-xs text-red-500 mt-1">
                    {addressForm.errors.stateId}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Label>
                  Teléfono <span className="text-neutral-400">(opcional)</span>
                </Label>
                <Input
                  {...addressForm.getFieldProps("phone")}
                  placeholder="+52 555 000 0000"
                />
              </div>
            </div>
            {actionError && (
              <p className="text-red-500 text-xs">{actionError}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialog(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-brand-700 hover:bg-brand-800 text-white"
                disabled={updatingAddress}
              >
                {updatingAddress ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando…
                  </>
                ) : (
                  "Guardar Dirección"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Delivery Contact ──────────────────────────────────────── */}
      <Dialog
        open={dialog === "contact"}
        onOpenChange={(v) => !v && setDialog(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Persona de Entrega</DialogTitle>
          </DialogHeader>
          <form onSubmit={contactForm.handleSubmit} className="space-y-4 py-2">
            <p className="text-sm text-neutral-500">
              Nombre de quien recibirá el paquete.
            </p>
            <div>
              <Label>Nombre completo</Label>
              <Input
                {...contactForm.getFieldProps("fullName")}
                placeholder="Ej: María García"
              />
              {contactForm.touched.fullName && contactForm.errors.fullName && (
                <p className="text-xs text-red-500 mt-1">
                  {contactForm.errors.fullName}
                </p>
              )}
            </div>
            {actionError && (
              <p className="text-red-500 text-xs">{actionError}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialog(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-brand-700 hover:bg-brand-800 text-white"
                disabled={updatingContact}
              >
                {updatingContact ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando…
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Cancel ────────────────────────────────────────────────── */}
      <Dialog
        open={dialog === "cancel"}
        onOpenChange={(v) => !v && setDialog(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Cancelar Suscripción
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 text-sm">
                Tu suscripción seguirá activa hasta el{" "}
                <strong>{fmt(subscription?.currentPeriodEnd)}</strong>. Después
                no se realizarán más cargos.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-neutral-600">
              Para confirmar, escribe exactamente:
            </p>
            <code className="block text-sm font-mono bg-neutral-100 text-red-600 px-3 py-2 rounded-lg">
              CANCELAR MI SUSCRIPCIÓN
            </code>
            <Input
              value={cancelPhrase}
              onChange={(e) => setCancelPhrase(e.target.value)}
              placeholder="Escribe la frase aquí"
              className="font-mono"
            />
            {actionError && (
              <p className="text-red-500 text-xs">{actionError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Volver
            </Button>
            <Button
              variant="destructive"
              disabled={
                cancelPhrase !== "CANCELAR MI SUSCRIPCIÓN" || cancelling
              }
              onClick={handleCancel}
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando…
                </>
              ) : (
                "Confirmar Cancelación"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
