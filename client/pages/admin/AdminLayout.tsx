import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  validateAdminSession,
  adminLogout,
} from "@/store/slices/adminAuthSlice";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserCog,
  PanelLeftClose,
  PanelLeftOpen,
  Coffee,
  BookOpen,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/subscriptions", icon: Package, label: "Suscripciones" },
  { to: "/admin/clients", icon: Users, label: "Clientes" },
  { to: "/admin/coffee-catalog", icon: Coffee, label: "Catálogo" },
  { to: "/admin/blog", icon: BookOpen, label: "Blog" },
  { to: "/admin/people", icon: UserCog, label: "Equipo" },
  { to: "/admin/settings", icon: Settings, label: "Configuración" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  support: "Soporte",
};

export default function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, isAuthenticated, sessionToken } = useAppSelector(
    (s) => s.adminAuth,
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [validating, setValidating] = useState(true);
  const [slim, setSlim] = useState<boolean>(() => {
    try {
      return localStorage.getItem("adminSidebarSlim") === "true";
    } catch {
      return false;
    }
  });

  const toggleSlim = () => {
    setSlim((v) => {
      const next = !v;
      try {
        localStorage.setItem("adminSidebarSlim", String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (!sessionToken) {
      navigate("/admin");
      return;
    }
    dispatch(validateAdminSession())
      .unwrap()
      .catch(() => navigate("/admin"))
      .finally(() => setValidating(false));
  }, [dispatch, sessionToken, navigate]);

  useEffect(() => {
    if (!validating && !isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, validating, navigate]);

  const handleLogout = () => {
    dispatch(adminLogout()).then(() => navigate("/admin"));
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-[#07101f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-white/10" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-400 animate-spin" />
          </div>
          <p className="text-white/50 text-sm tracking-wide">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const currentLabel =
    navItems.find((n) => location.pathname.startsWith(n.to))?.label ?? "Panel";

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-[#f0f2f5] flex">
        {/* ── Mobile overlay ── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ════════════════════════════════════════
            SIDEBAR
        ════════════════════════════════════════ */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col text-white",
            "transition-[width,transform] duration-300 ease-in-out",
            "lg:static lg:translate-x-0 lg:z-auto",
            // Layered dark background with subtle blue tint
            "bg-[#07101f]",
            // mobile
            mobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
            // desktop
            slim ? "lg:w-[72px]" : "lg:w-[240px]",
          )}
          style={{
            backgroundImage: slim
              ? "none"
              : "radial-gradient(ellipse at 0% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)",
          }}
        >
          {/* ── Logo header ── */}
          <div
            className={cn(
              "flex items-center flex-shrink-0 h-[64px]",
              "border-b border-white/[0.06]",
              slim ? "justify-center px-0" : "px-5 gap-3",
            )}
          >
            {slim ? (
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10">
                <img
                  src="https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_white.png"
                  alt="Bolsadecafé"
                  className="h-5 w-auto object-contain"
                />
              </div>
            ) : (
              <>
                <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 flex-shrink-0">
                  <img
                    src="https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_white.png"
                    alt="Bolsadecafé"
                    className="h-5 w-auto object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold text-[13px] leading-none tracking-tight">
                    Bolsa de Café
                  </p>
                  <p className="text-blue-400/60 text-[10px] mt-[3px] tracking-[.18em] uppercase font-medium">
                    Admin Panel
                  </p>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="lg:hidden ml-auto p-1 rounded-md text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* ── Navigation ── */}
          <nav
            className={cn(
              "flex-1 py-4 overflow-y-auto overflow-x-hidden",
              slim ? "px-2 space-y-1" : "px-3 space-y-0.5",
            )}
          >
            {!slim && (
              <p className="text-white/20 text-[9px] font-bold uppercase tracking-[.2em] px-3 mb-2 mt-1">
                Menú principal
              </p>
            )}

            {navItems.map(({ to, icon: Icon, label }) =>
              slim ? (
                <Tooltip key={to}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center justify-center w-full h-10 rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-blue-500/20 text-blue-300 shadow-[0_0_0_1px_rgba(99,153,255,0.15)]"
                            : "text-white/40 hover:bg-white/[0.07] hover:text-white/80",
                        )
                      }
                    >
                      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="font-medium bg-[#0d1a30] border-white/10 text-white"
                  >
                    {label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 px-3 py-[9px] rounded-xl text-[13px] font-medium transition-all duration-200 relative",
                      isActive
                        ? [
                            "bg-gradient-to-r from-blue-500/20 to-blue-500/5",
                            "text-white",
                            "shadow-[0_0_0_1px_rgba(99,153,255,0.12),inset_0_1px_0_rgba(255,255,255,0.04)]",
                          ]
                        : "text-white/45 hover:bg-white/[0.06] hover:text-white/90",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active left glow bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                      )}
                      <span
                        className={cn(
                          "flex items-center justify-center w-[30px] h-[30px] rounded-lg flex-shrink-0 transition-all duration-200",
                          isActive
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-white/[0.04] text-white/40 group-hover:bg-white/[0.07] group-hover:text-white/70",
                        )}
                      >
                        <Icon className="w-[15px] h-[15px]" />
                      </span>
                      <span className="flex-1 truncate">{label}</span>
                      {isActive && (
                        <ChevronRight className="w-3 h-3 text-blue-400/50 flex-shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              ),
            )}
          </nav>

          {/* ── Bottom: admin profile + actions ── */}
          <div className="flex-shrink-0 border-t border-white/[0.06]">
            {slim ? (
              <div className="flex flex-col items-center gap-1 py-3 px-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center cursor-default select-none shadow-lg shadow-blue-900/40">
                      <span className="text-white text-[11px] font-bold">
                        {getInitials(admin?.full_name ?? "A")}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-[#0d1a30] border-white/10 text-white"
                  >
                    <p className="font-semibold text-[13px]">
                      {admin?.full_name}
                    </p>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      {admin?.email}
                    </p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center w-full h-9 rounded-xl text-white/30 hover:bg-red-500/15 hover:text-red-400 transition-all duration-200"
                    >
                      <LogOut className="w-[16px] h-[16px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-[#0d1a30] border-white/10 text-white"
                  >
                    Cerrar Sesión
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleSlim}
                      className="flex items-center justify-center w-full h-9 rounded-xl text-white/20 hover:bg-white/[0.07] hover:text-white/60 transition-all duration-200"
                    >
                      <PanelLeftOpen className="w-[16px] h-[16px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-[#0d1a30] border-white/10 text-white"
                  >
                    Expandir panel
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="p-3 space-y-1">
                {/* Admin card */}
                <div className="flex items-center gap-3 px-3 py-[11px] rounded-xl bg-white/[0.04] ring-1 ring-white/[0.07]">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
                      <span className="text-white text-[11px] font-bold">
                        {getInitials(admin?.full_name ?? "A")}
                      </span>
                    </div>
                    {/* Online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-[2px] ring-[#07101f]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-[13px] font-semibold truncate leading-tight">
                      {admin?.full_name ?? "Admin"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center px-1.5 py-px rounded-md bg-blue-500/15 text-blue-300 text-[9px] font-semibold uppercase tracking-wide">
                        {ROLE_LABELS[admin?.role ?? "admin"] ?? "Admin"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                >
                  <LogOut className="w-[15px] h-[15px] flex-shrink-0" />
                  <span>Cerrar Sesión</span>
                </button>

                {/* Collapse */}
                <button
                  onClick={toggleSlim}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-white/20 hover:bg-white/[0.06] hover:text-white/50 transition-all duration-200"
                >
                  <PanelLeftClose className="w-[15px] h-[15px] flex-shrink-0" />
                  <span>Contraer panel</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ════════════════════════════════════════
            MAIN CONTENT
        ════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-30 h-[64px] flex items-center justify-between px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-black/[0.06] shadow-sm">
            {/* Left: mobile menu + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors -ml-1"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-gray-400 text-[13px] hidden sm:inline">
                  Admin
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:inline" />
                <span className="font-semibold text-gray-800 text-[13px]">
                  {currentLabel}
                </span>
              </div>
            </div>

            {/* Right: avatar chip */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-full bg-gray-100 border border-gray-200/80 ring-1 ring-black/[0.04]">
                <span className="text-[13px] font-medium text-gray-700 hidden sm:inline">
                  {admin?.full_name?.split(" ")[0]}
                </span>
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-[10px]">
                      {getInitials(admin?.full_name ?? "A")}
                    </span>
                  </div>
                  <span className="absolute -bottom-px -right-px w-2.5 h-2.5 rounded-full bg-emerald-400 ring-[1.5px] ring-white" />
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
