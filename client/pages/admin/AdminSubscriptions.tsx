import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminOrders,
  moveOrderToShipping,
  moveOrderToDelivered,
  clearActionState,
  updateOrderStatusLocally,
} from "@/store/slices/adminSlice";
import type { AdminOrder } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Package,
  Truck,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Clock,
  User,
  X,
  GripVertical,
  AlertCircle,
  FileText,
  Hash,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// ─── Pipeline column config ───────────────────────────────────────────────────

type OrderStatus = "processing" | "shipped" | "delivered";

const COLUMNS: {
  id: OrderStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  badgeColor: string;
  borderColor: string;
  headerBg: string;
}[] = [
  {
    id: "processing",
    label: "Orden Creada",
    icon: Package,
    color: "text-blue-600 dark:text-blue-400",
    badgeColor:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    headerBg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    id: "shipped",
    label: "Listo para Envío",
    icon: Truck,
    color: "text-amber-600 dark:text-amber-400",
    badgeColor:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
    headerBg: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    id: "delivered",
    label: "Recibido",
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    badgeColor:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800",
    headerBg: "bg-green-50 dark:bg-green-950/40",
  },
];

// ─── Shipping form schema ─────────────────────────────────────────────────────

const shippingSchema = Yup.object({
  trackingNumber: Yup.string().required("Número de rastreo requerido"),
  shipmentProvider: Yup.string().required("Paquetería requerida"),
  estimatedDelivery: Yup.string().required("Fecha estimada requerida"),
});

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onDragStart,
  isDragging,
}: {
  order: AdminOrder;
  onDragStart: (e: React.DragEvent, orderId: number) => void;
  isDragging: boolean;
}) {
  const date = new Date(order.createdAt).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, order.id)}
      className={cn(
        "group bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 p-4 cursor-grab active:cursor-grabbing transition-all duration-200 select-none",
        isDragging
          ? "opacity-40 scale-95 shadow-2xl rotate-1"
          : "hover:shadow-md hover:border-primary/40",
      )}
    >
      <div className="flex items-start gap-2.5">
        <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0 group-hover:text-muted-foreground transition-colors" />
        <div className="flex-1 min-w-0">
          {/* Order number & amount */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-primary font-mono">
              {order.orderNumber}
            </span>
            <span className="text-sm font-bold text-foreground">
              ${order.totalAmount.toFixed(0)} MXN
            </span>
          </div>

          {/* User */}
          <div className="flex items-center gap-1.5 mb-2">
            <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">
              {order.userFullName}
            </span>
          </div>

          {/* Plan */}
          {order.planName && (
            <div className="flex items-center gap-1.5 mb-2">
              <Package className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {order.planName}
                {order.planWeight ? ` · ${order.planWeight}` : ""}
              </span>
            </div>
          )}

          {/* Address */}
          {order.addressCity && (
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {order.addressCity}
                {order.addressState ? `, ${order.addressState}` : ""}
              </span>
            </div>
          )}

          {/* Tracking (if shipped) */}
          {order.trackingNumber && (
            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3 h-3 text-amber-600" />
                <span className="text-xs font-mono font-medium text-amber-700 dark:text-amber-400">
                  {order.trackingNumber}
                </span>
              </div>
              {order.shipmentProvider && (
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                  {order.shipmentProvider}
                </p>
              )}
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <Clock className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground/70">{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminSubscriptions() {
  const dispatch = useAppDispatch();
  const {
    orders,
    ordersLoading,
    ordersError,
    actionLoading,
    actionError,
    actionSuccess,
  } = useAppSelector((s) => s.admin);

  // Drag state
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<OrderStatus | null>(null);

  // Modal state
  const [shippingDialogOrder, setShippingDialogOrder] =
    useState<AdminOrder | null>(null);
  const [deliveredDialogOrder, setDeliveredDialogOrder] =
    useState<AdminOrder | null>(null);
  const [pendingDrop, setPendingDrop] = useState<{
    orderId: number;
    targetStatus: OrderStatus;
  } | null>(null);

  // Toast success/error (inline)
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  useEffect(() => {
    if (actionSuccess) {
      setToast({ type: "success", msg: actionSuccess });
      dispatch(clearActionState());
      setTimeout(() => setToast(null), 4000);
    }
    if (actionError) {
      setToast({ type: "error", msg: actionError });
      dispatch(clearActionState());
      setTimeout(() => setToast(null), 5000);
    }
  }, [actionSuccess, actionError, dispatch]);

  // Group orders by status
  const grouped: Record<OrderStatus, AdminOrder[]> = {
    processing: orders.filter((o) => o.status === "processing"),
    shipped: orders.filter((o) => o.status === "shipped"),
    delivered: orders.filter((o) => o.status === "delivered"),
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, orderId: number) => {
    setDraggingId(orderId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("orderId", String(orderId));
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: OrderStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: OrderStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const orderId = parseInt(e.dataTransfer.getData("orderId"));
    if (!orderId || isNaN(orderId)) return;

    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === targetStatus) return;

    // Only allow forward progression: processing → shipped → delivered
    const statusIndex: Record<OrderStatus, number> = {
      processing: 0,
      shipped: 1,
      delivered: 2,
    };
    if (statusIndex[targetStatus] <= statusIndex[order.status as OrderStatus])
      return;

    // Show modal for the transition
    setPendingDrop({ orderId, targetStatus });
    if (targetStatus === "shipped") {
      setShippingDialogOrder(order);
    } else if (targetStatus === "delivered") {
      setDeliveredDialogOrder(order);
    }
  };

  // ── Shipping form ──────────────────────────────────────────────────────────

  const shippingFormik = useFormik({
    initialValues: {
      trackingNumber: "",
      shipmentProvider: "",
      estimatedDelivery: "",
    },
    validationSchema: shippingSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (!shippingDialogOrder) return;
      dispatch(
        updateOrderStatusLocally({
          orderId: shippingDialogOrder.id,
          status: "shipped",
        }),
      );
      await dispatch(
        moveOrderToShipping({
          orderId: shippingDialogOrder.id,
          trackingNumber: values.trackingNumber,
          shipmentProvider: values.shipmentProvider,
          estimatedDelivery: values.estimatedDelivery,
        }),
      );
      resetForm();
      setShippingDialogOrder(null);
      setPendingDrop(null);
    },
  });

  // ── Delivery form ──────────────────────────────────────────────────────────

  const deliveryFormik = useFormik({
    initialValues: { blogPostTitle: "", blogPostContent: "" },
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (!deliveredDialogOrder) return;
      dispatch(
        updateOrderStatusLocally({
          orderId: deliveredDialogOrder.id,
          status: "delivered",
        }),
      );
      await dispatch(
        moveOrderToDelivered({
          orderId: deliveredDialogOrder.id,
          blogPostTitle: values.blogPostTitle || undefined,
          blogPostContent: values.blogPostContent || undefined,
        }),
      );
      resetForm();
      setDeliveredDialogOrder(null);
      setPendingDrop(null);
    },
  });

  const handleCancelDialog = () => {
    setShippingDialogOrder(null);
    setDeliveredDialogOrder(null);
    setPendingDrop(null);
    shippingFormik.resetForm();
    deliveryFormik.resetForm();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suscripciones</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pipeline de órdenes — arrastra para cambiar estado
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchAdminOrders())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          title="Actualizar"
        >
          <RefreshCw
            className={`w-4 h-4 text-muted-foreground ${ordersLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Error */}
      {ordersError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <p className="text-destructive text-sm">{ordersError}</p>
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

      {/* Pipeline board */}
      <div
        className="grid lg:grid-cols-3 gap-4 min-h-[600px]"
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((col) => {
          const colOrders = grouped[col.id];
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={cn(
                "flex flex-col rounded-2xl border-2 transition-all duration-200 min-h-[500px]",
                isOver
                  ? `${col.borderColor} shadow-lg scale-[1.01]`
                  : "border-gray-200 dark:border-neutral-800",
                isOver && col.id === "shipped"
                  ? "bg-amber-50/50 dark:bg-amber-950/10"
                  : "",
                isOver && col.id === "delivered"
                  ? "bg-green-50/50 dark:bg-green-950/10"
                  : "",
                isOver && col.id === "processing"
                  ? "bg-blue-50/50 dark:bg-blue-950/10"
                  : "bg-white dark:bg-neutral-900/50",
              )}
            >
              {/* Column header */}
              <div
                className={cn(
                  "px-4 py-3.5 rounded-t-xl border-b border-gray-100 dark:border-neutral-800",
                  col.headerBg,
                )}
              >
                <div className="flex items-center gap-2.5">
                  <col.icon className={cn("w-5 h-5", col.color)} />
                  <span className="font-bold text-foreground text-sm">
                    {col.label}
                  </span>
                  <span
                    className={cn(
                      "ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full",
                      col.badgeColor,
                    )}
                  >
                    {colOrders.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {ordersLoading && colOrders.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : colOrders.length === 0 ? (
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed transition-all",
                      isOver
                        ? col.borderColor
                        : "border-gray-200 dark:border-neutral-700",
                    )}
                  >
                    <col.icon
                      className={cn("w-8 h-8 mb-2 opacity-30", col.color)}
                    />
                    <p className="text-xs text-muted-foreground opacity-70">
                      {isOver ? "Soltar aquí" : "Sin órdenes"}
                    </p>
                  </div>
                ) : (
                  colOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onDragStart={handleDragStart}
                      isDragging={draggingId === order.id}
                    />
                  ))
                )}

                {/* Drop zone indicator */}
                {isOver && colOrders.length > 0 && (
                  <div
                    className={cn(
                      "h-14 rounded-xl border-2 border-dashed flex items-center justify-center transition-all",
                      col.borderColor,
                    )}
                  >
                    <p className={cn("text-xs font-medium", col.color)}>
                      Soltar aquí
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Shipping Dialog ── */}
      <Dialog
        open={!!shippingDialogOrder}
        onOpenChange={(open) => !open && handleCancelDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-500" />
              Confirmar Envío
            </DialogTitle>
          </DialogHeader>
          {shippingDialogOrder && (
            <div className="space-y-1 mb-2 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg text-sm">
              <p className="font-bold text-primary font-mono">
                {shippingDialogOrder.orderNumber}
              </p>
              <p className="text-foreground">
                {shippingDialogOrder.userFullName}
              </p>
              {shippingDialogOrder.planName && (
                <p className="text-muted-foreground">
                  {shippingDialogOrder.planName}
                </p>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-4">
            Se notificará al cliente por email con los datos de envío.
          </p>
          <form onSubmit={shippingFormik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Hash className="w-3.5 h-3.5" /> Número de Rastreo *
              </Label>
              <Input
                placeholder="1Z999AA10123456784"
                {...shippingFormik.getFieldProps("trackingNumber")}
              />
              {shippingFormik.touched.trackingNumber &&
                shippingFormik.errors.trackingNumber && (
                  <p className="text-destructive text-xs">
                    {shippingFormik.errors.trackingNumber}
                  </p>
                )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Truck className="w-3.5 h-3.5" /> Paquetería *
              </Label>
              <Input
                placeholder="FedEx, DHL, Estafeta, J&T..."
                {...shippingFormik.getFieldProps("shipmentProvider")}
              />
              {shippingFormik.touched.shipmentProvider &&
                shippingFormik.errors.shipmentProvider && (
                  <p className="text-destructive text-xs">
                    {shippingFormik.errors.shipmentProvider}
                  </p>
                )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Calendar className="w-3.5 h-3.5" /> Fecha Estimada de Entrega *
              </Label>
              <Input
                type="date"
                {...shippingFormik.getFieldProps("estimatedDelivery")}
              />
              {shippingFormik.touched.estimatedDelivery &&
                shippingFormik.errors.estimatedDelivery && (
                  <p className="text-destructive text-xs">
                    {shippingFormik.errors.estimatedDelivery}
                  </p>
                )}
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelDialog}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={actionLoading}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {actionLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Confirmar Envío
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delivery Dialog ── */}
      <Dialog
        open={!!deliveredDialogOrder}
        onOpenChange={(open) => !open && handleCancelDialog()}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Confirmar Recepción
            </DialogTitle>
          </DialogHeader>
          {deliveredDialogOrder && (
            <div className="space-y-1 mb-2 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg text-sm">
              <p className="font-bold text-primary font-mono">
                {deliveredDialogOrder.orderNumber}
              </p>
              <p className="text-foreground">
                {deliveredDialogOrder.userFullName}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-1">
            Se notificará al cliente que su pedido fue entregado. Puedes añadir
            un artículo de blog opcional que será publicado y enlazado en el
            email.
          </p>
          <form onSubmit={deliveryFormik.handleSubmit} className="space-y-4">
            {/* Optional blog post */}
            <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-neutral-700 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Artículo de Blog
                </span>
                <Badge variant="outline" className="text-xs ml-auto">
                  Opcional
                </Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Título del Artículo
                </Label>
                <Input
                  placeholder="Ej: Conoce el origen de tu café este mes..."
                  {...deliveryFormik.getFieldProps("blogPostTitle")}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Contenido
                </Label>
                <Textarea
                  rows={4}
                  placeholder="Escribe el contenido del artículo aquí..."
                  {...deliveryFormik.getFieldProps("blogPostContent")}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelDialog}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={actionLoading}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {actionLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirmando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar Recepción
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
