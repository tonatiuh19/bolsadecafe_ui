import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminClients } from "@/store/slices/adminSlice";
import type { AdminClient } from "@shared/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Package,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "full_name" | "created_at" | "total_orders" | "total_spent";
type SortDir = "asc" | "desc";

export default function AdminClients() {
  const dispatch = useAppDispatch();
  const { clients, clientsLoading, clientsError } = useAppSelector(
    (s) => s.admin,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    dispatch(fetchAdminClients());
  }, [dispatch]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? (
        <ChevronUp className="w-3.5 h-3.5" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5" />
      )
    ) : (
      <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
    );

  const filtered = clients
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || "").includes(q);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && c.is_active) ||
        (statusFilter === "inactive" && !c.is_active);
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let va: number | string = a[sortKey] ?? 0;
      let vb: number | string = b[sortKey] ?? 0;
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc"
        ? (va as number) - (vb as number)
        : (vb as number) - (va as number);
    });

  const totalActive = clients.filter((c) => c.is_active).length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.total_spent, 0);

  const subscriptionBadge = (status?: string) => {
    if (!status || status === "cancelled")
      return (
        <Badge
          variant="outline"
          className="text-xs font-normal text-muted-foreground border-dashed"
        >
          Sin plan
        </Badge>
      );
    const map: Record<string, string> = {
      active:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
      paused:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
      past_due: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    };
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
          map[status] || map.active,
        )}
      >
        {status === "active"
          ? "Activo"
          : status === "paused"
            ? "Pausado"
            : "Vencido"}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {clients.length} clientes registrados
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchAdminClients())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw
            className={cn(
              "w-4 h-4 text-muted-foreground",
              clientsLoading && "animate-spin",
            )}
          />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total clientes",
            value: clients.length,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/30",
          },
          {
            label: "Activos",
            value: totalActive,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-950/30",
          },
          {
            label: "Ingresos totales",
            value: `$${totalRevenue.toLocaleString("es-MX", { maximumFractionDigits: 0 })} MXN`,
            icon: TrendingUp,
            color: "text-primary",
            bg: "bg-primary/5",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-4 flex items-center gap-4"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                s.bg,
              )}
            >
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{s.label}</p>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                statusFilter === f
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "Todos" : f === "active" ? "Activos" : "Inactivos"}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {clientsError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <p className="text-destructive text-sm">{clientsError}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
        {clientsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Users className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">
              No se encontraron clientes
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    <button
                      onClick={() => toggleSort("full_name")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Cliente <SortIcon col="full_name" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">
                    Contacto
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">
                    Suscripción
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    <button
                      onClick={() => toggleSort("total_orders")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Órdenes <SortIcon col="total_orders" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">
                    <button
                      onClick={() => toggleSort("total_spent")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Total gastado <SortIcon col="total_spent" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">
                    <button
                      onClick={() => toggleSort("created_at")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Registro <SortIcon col="created_at" />
                    </button>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {filtered.map((client) => (
                  <ClientRow
                    key={client.id}
                    client={client}
                    subscriptionBadge={subscriptionBadge}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-right">
        Mostrando {filtered.length} de {clients.length} clientes
      </p>
    </div>
  );
}

function ClientRow({
  client,
  subscriptionBadge,
}: {
  client: AdminClient;
  subscriptionBadge: (status?: string) => JSX.Element;
}) {
  const initials = client.full_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const joinDate = new Date(client.created_at).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
      {/* Client */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-medium text-foreground">{client.full_name}</p>
            <p className="text-xs text-muted-foreground md:hidden">
              {client.email}
            </p>
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="py-3 px-4 hidden md:table-cell">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground">
              {client.email}
            </span>
          </div>
          {client.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground">
                {client.phone}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Subscription */}
      <td className="py-3 px-4 hidden lg:table-cell">
        <div className="space-y-1">
          {subscriptionBadge(client.subscription_status)}
          {client.plan_name && (
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground">
                {client.plan_name}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Orders */}
      <td className="py-3 px-4">
        <span className="font-semibold text-foreground">
          {client.total_orders}
        </span>
      </td>

      {/* Spent */}
      <td className="py-3 px-4 hidden sm:table-cell">
        <span className="font-semibold text-foreground">
          $
          {client.total_spent.toLocaleString("es-MX", {
            maximumFractionDigits: 0,
          })}{" "}
          MXN
        </span>
      </td>

      {/* Join date */}
      <td className="py-3 px-4 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">{joinDate}</span>
      </td>

      {/* Status */}
      <td className="py-3 px-4 text-center">
        {client.is_active ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400 mx-auto" />
        )}
      </td>
    </tr>
  );
}
