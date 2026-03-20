import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateAdminSettings,
  clearSettingsState,
} from "@/store/slices/adminSlice";
import { validateAdminSession } from "@/store/slices/adminAuthSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";

const profileSchema = Yup.object({
  full_name: Yup.string().required("Nombre requerido"),
  email: Yup.string().email("Email inválido").required("Email requerido"),
  bio: Yup.string().max(300, "Máximo 300 caracteres"),
});

export default function AdminSettings() {
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((s) => s.adminAuth);
  const { settingsLoading, settingsError, settingsSuccess } = useAppSelector(
    (s) => s.admin,
  );

  // Clear feedback when leaving
  useEffect(() => {
    return () => {
      dispatch(clearSettingsState());
    };
  }, [dispatch]);

  // Refresh admin data after successful save
  useEffect(() => {
    if (settingsSuccess) {
      dispatch(validateAdminSession());
      const timer = setTimeout(() => dispatch(clearSettingsState()), 4000);
      return () => clearTimeout(timer);
    }
  }, [settingsSuccess, dispatch]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      full_name: admin?.full_name ?? "",
      email: admin?.email ?? "",
      bio: admin?.bio ?? "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      dispatch(
        updateAdminSettings({
          full_name: values.full_name,
          email: values.email,
          bio: values.bio || undefined,
        }),
      );
    },
  });

  const initials = (admin?.full_name ?? "A")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona tu perfil y credenciales de acceso
        </p>
      </div>

      {/* Profile summary */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          {initials}
        </div>
        <div>
          <p className="font-bold text-foreground text-lg">
            {admin?.full_name}
          </p>
          <p className="text-sm text-muted-foreground">{admin?.email}</p>
          <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <Shield className="w-3 h-3" />
            {admin?.role === "super_admin"
              ? "Super Admin"
              : admin?.role === "admin"
                ? "Administrador"
                : "Soporte"}
          </span>
        </div>
      </div>

      {/* Feedback banners */}
      {settingsSuccess && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-medium">{settingsSuccess}</p>
        </div>
      )}
      {settingsError && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-medium">{settingsError}</p>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Profile section */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">
              Información de Perfil
            </h2>
          </div>
          <div className="p-5 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Full name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Nombre Completo *
                </Label>
                <Input
                  id="full_name"
                  placeholder="Juan García"
                  {...formik.getFieldProps("full_name")}
                  className={
                    formik.touched.full_name && formik.errors.full_name
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {formik.touched.full_name && formik.errors.full_name && (
                  <p className="text-destructive text-xs">
                    {formik.errors.full_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@bolsadecafe.com"
                    className={`pl-9 ${formik.touched.email && formik.errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    {...formik.getFieldProps("email")}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-destructive text-xs">
                    {formik.errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">
                Biografía
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  opcional
                </span>
              </Label>
              <Textarea
                id="bio"
                rows={3}
                placeholder="Breve descripción sobre ti..."
                className="resize-none"
                {...formik.getFieldProps("bio")}
              />
              <p className="text-xs text-muted-foreground text-right">
                {(formik.values.bio || "").length}/300
              </p>
              {formik.touched.bio && formik.errors.bio && (
                <p className="text-destructive text-xs">{formik.errors.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={settingsLoading || !formik.dirty}
            className="min-w-[140px]"
          >
            {settingsLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Guardar Cambios
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
