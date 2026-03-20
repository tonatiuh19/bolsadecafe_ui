import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminPeople,
  createAdminPerson,
  updateAdminPerson,
  deactivateAdminPerson,
  clearPeopleActionState,
} from "@/store/slices/adminSlice";
import type { AdminPerson } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCog,
  Plus,
  Pencil,
  UserX,
  RefreshCw,
  ShieldCheck,
  Users,
  UserCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "super_admin" | "admin" | "support";

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  support: "Soporte",
};

const ROLE_COLORS: Record<Role, string> = {
  super_admin:
    "bg-[#152a63]/15 text-[#152a63] border border-[#152a63]/30 dark:bg-[#1d3c89]/20 dark:text-blue-200",
  admin: "bg-blue-100 text-blue-700 border border-blue-200",
  support: "bg-slate-100 text-slate-600 border border-slate-200",
};

const personSchema = Yup.object({
  full_name: Yup.string()
    .min(2, "Mínimo 2 caracteres")
    .required("Nombre requerido"),
  email: Yup.string().email("Email inválido").required("Email requerido"),
  username: Yup.string()
    .min(3, "Mínimo 3 caracteres")
    .matches(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guión bajo")
    .required("Usuario requerido"),
  role: Yup.string()
    .oneOf(["super_admin", "admin", "support"])
    .required("Rol requerido"),
  bio: Yup.string().optional(),
  is_active: Yup.boolean(),
});

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminPeople() {
  const dispatch = useAppDispatch();
  const {
    people,
    peopleLoading,
    peopleError,
    peopleActionLoading,
    peopleActionError,
    peopleActionSuccess,
  } = useAppSelector((s) => s.admin);
  const { admin: currentAdmin } = useAppSelector((s) => s.adminAuth);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminPerson | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminPerson | null>(
    null,
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAdminPeople());
  }, [dispatch]);

  // Close dialog on success
  useEffect(() => {
    if (peopleActionSuccess) {
      setDialogOpen(false);
      setDeactivateTarget(null);
      setTimeout(() => dispatch(clearPeopleActionState()), 3000);
    }
  }, [peopleActionSuccess, dispatch]);

  const formik = useFormik({
    initialValues: {
      full_name: "",
      email: "",
      username: "",
      role: "admin" as Role,
      bio: "",
      is_active: true,
    },
    validationSchema: personSchema,
    onSubmit: (values) => {
      if (editTarget) {
        dispatch(
          updateAdminPerson({
            id: editTarget.id,
            full_name: values.full_name,
            email: values.email,
            username: values.username,
            role: values.role,
            is_active: values.is_active,
            bio: values.bio || undefined,
          }),
        );
      } else {
        dispatch(
          createAdminPerson({
            full_name: values.full_name,
            email: values.email,
            username: values.username,
            role: values.role,
            bio: values.bio || undefined,
          }),
        );
      }
    },
  });

  const openCreate = () => {
    setEditTarget(null);
    formik.resetForm();
    dispatch(clearPeopleActionState());
    setDialogOpen(true);
  };

  const openEdit = (person: AdminPerson) => {
    setEditTarget(person);
    formik.resetForm({
      values: {
        full_name: person.full_name,
        email: person.email,
        username: person.username,
        role: person.role,
        bio: person.bio ?? "",
        is_active: person.is_active,
      },
    });
    dispatch(clearPeopleActionState());
    setDialogOpen(true);
  };

  const filtered = people.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q)
    );
  });

  const totalCount = people.length;
  const activeCount = people.filter((p) => p.is_active).length;
  const superAdminCount = people.filter((p) => p.role === "super_admin").length;

  const isSuperAdmin = currentAdmin?.role === "super_admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#152a63]/10">
            <UserCog className="w-6 h-6 text-[#152a63]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Equipo Admin</h1>
            <p className="text-sm text-slate-500">
              Gestiona los miembros del equipo
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(fetchAdminPeople())}
            disabled={peopleLoading}
            className="gap-1.5"
          >
            <RefreshCw
              className={cn("w-4 h-4", peopleLoading && "animate-spin")}
            />
            Actualizar
          </Button>
          {isSuperAdmin && (
            <Button
              size="sm"
              onClick={openCreate}
              className="gap-1.5 bg-[#152a63] hover:bg-[#1d3c89]"
            >
              <Plus className="w-4 h-4" />
              Nuevo Miembro
            </Button>
          )}
        </div>
      </div>

      {/* Success / Error banners */}
      {peopleActionSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <UserCheck className="w-4 h-4 shrink-0" />
          {peopleActionSuccess}
        </div>
      )}
      {peopleError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {peopleError}
        </div>
      )}
      {!isSuperAdmin && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Solo los Super Admins pueden gestionar el equipo.
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total",
            value: totalCount,
            icon: Users,
            color: "text-[#152a63]",
            bg: "bg-[#152a63]/8",
          },
          {
            label: "Activos",
            value: activeCount,
            icon: UserCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Super Admins",
            value: superAdminCount,
            icon: ShieldCheck,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm"
          >
            <div className={cn("p-2.5 rounded-lg", bg)}>
              <Icon className={cn("w-5 h-5", color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <Input
            placeholder="Buscar por nombre, email o usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200"
          />
        </div>
        <p className="text-sm text-slate-500 ml-auto">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        {peopleLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando equipo...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
            <UserCog className="w-8 h-8" />
            <p className="text-sm">No se encontraron miembros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Miembro
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Usuario
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Rol
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Último acceso
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Agregado
                  </th>
                  {isSuperAdmin && (
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((person) => {
                  const isMe = person.id === currentAdmin?.id;
                  return (
                    <tr
                      key={person.id}
                      className={cn(
                        "transition-colors hover:bg-slate-50/60",
                        !person.is_active && "opacity-50",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#152a63]/10 flex items-center justify-center text-xs font-bold text-[#152a63] shrink-0">
                            {getInitials(person.full_name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 leading-tight">
                              {person.full_name}
                              {isMe && (
                                <span className="ml-1.5 text-[10px] font-semibold text-[#152a63] bg-[#152a63]/10 px-1.5 py-0.5 rounded-full">
                                  tú
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">
                              {person.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                        @{person.username}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                            ROLE_COLORS[person.role],
                          )}
                        >
                          {ROLE_LABELS[person.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium",
                            person.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-500 border-slate-200",
                          )}
                        >
                          {person.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {formatDate(person.last_login)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {formatDate(person.created_at)}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(person)}
                              className="h-7 w-7 p-0 text-slate-500 hover:text-[#152a63] hover:bg-[#152a63]/8"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            {!isMe && person.is_active && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeactivateTarget(person)}
                                className="h-7 w-7 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-[#152a63]" />
              {editTarget ? "Editar Miembro" : "Nuevo Miembro"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={formik.handleSubmit} className="space-y-4 pt-1">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                {...formik.getFieldProps("full_name")}
                placeholder="Ana García"
              />
              {formik.touched.full_name && formik.errors.full_name && (
                <p className="text-xs text-red-500">
                  {formik.errors.full_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...formik.getFieldProps("email")}
                placeholder="ana@bolsadecafe.mx"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-500">{formik.errors.email}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                {...formik.getFieldProps("username")}
                placeholder="ana_garcia"
                className="font-mono"
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-xs text-red-500">{formik.errors.username}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={formik.values.role}
                onValueChange={(v) => formik.setFieldValue("role", v)}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Soporte</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="bio">
                Bio{" "}
                <span className="text-slate-400 font-normal text-xs">
                  (opcional)
                </span>
              </Label>
              <Input
                id="bio"
                {...formik.getFieldProps("bio")}
                placeholder="Encargada de soporte a clientes"
              />
            </div>

            {/* is_active (edit only) */}
            {editTarget && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Cuenta activa
                  </p>
                  <p className="text-xs text-slate-400">
                    Los miembros inactivos no pueden iniciar sesión
                  </p>
                </div>
                <Switch
                  checked={formik.values.is_active}
                  onCheckedChange={(v) => formik.setFieldValue("is_active", v)}
                />
              </div>
            )}

            {peopleActionError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {peopleActionError}
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={peopleActionLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={peopleActionLoading}
                className="bg-[#152a63] hover:bg-[#1d3c89] gap-2"
              >
                {peopleActionLoading && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editTarget ? "Guardar cambios" : "Crear miembro"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar miembro?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deactivateTarget?.full_name}</strong> no podrá iniciar
              sesión una vez desactivado. Esta acción se puede revertir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={peopleActionLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={peopleActionLoading}
              className="bg-red-600 hover:bg-red-700 gap-2"
              onClick={() => {
                if (deactivateTarget) {
                  dispatch(deactivateAdminPerson(deactivateTarget.id));
                }
              }}
            >
              {peopleActionLoading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
