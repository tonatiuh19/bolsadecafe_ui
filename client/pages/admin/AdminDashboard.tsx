import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminDashboard } from "@/store/slices/adminSlice";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingBag,
  UserPlus,
  RefreshCw,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
};

function formatMonth(ym: string) {
  const [, m] = ym.split("-");
  return MONTH_LABELS[m] ?? ym;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(n);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === "revenue"
            ? formatCurrency(p.value)
            : `${p.value} órdenes`}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { metrics, metricsLoading, metricsError } = useAppSelector(
    (s) => s.admin,
  );

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const chartData =
    metrics?.revenueByMonth?.map((r) => ({
      ...r,
      month: formatMonth(r.month),
    })) ?? [];

  if (metricsLoading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive font-medium mb-2">
            Error al cargar métricas
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(fetchAdminDashboard())}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Resumen de métricas del negocio
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchAdminDashboard())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          title="Actualizar"
        >
          <RefreshCw
            className={`w-4 h-4 text-muted-foreground ${metricsLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Suscriptores Totales"
          value={metrics?.totalSubscribers ?? 0}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={Activity}
          label="Suscripciones Activas"
          value={metrics?.activeSubscriptions ?? 0}
          sub="En este momento"
          color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={DollarSign}
          label="Ingresos del Mes"
          value={formatCurrency(metrics?.monthlyRevenue ?? 0)}
          sub={`Total: ${formatCurrency(metrics?.totalRevenue ?? 0)}`}
          color="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
        />
        <StatCard
          icon={Package}
          label="Órdenes en Pipeline"
          value={metrics?.ordersInPipeline ?? 0}
          sub={`${metrics?.ordersThisMonth ?? 0} este mes`}
          color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={ShoppingBag}
          label="Pedidos Este Mes"
          value={metrics?.ordersThisMonth ?? 0}
          color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={UserPlus}
          label="Nuevos Clientes Este Mes"
          value={metrics?.newClientsThisMonth ?? 0}
          color="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue area chart */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-bold text-foreground text-sm">
                Ingresos Mensuales
              </h3>
              <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a3578" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a3578" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1a3578"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  name="revenue"
                  dot={{ fill: "#1a3578", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              Sin datos disponibles
            </div>
          )}
        </div>

        {/* Orders bar chart */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="font-bold text-foreground text-sm">
                Pedidos por Mes
              </h3>
              <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="35%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="orders"
                  fill="#f97316"
                  radius={[6, 6, 0, 0]}
                  name="orders"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              Sin datos disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
