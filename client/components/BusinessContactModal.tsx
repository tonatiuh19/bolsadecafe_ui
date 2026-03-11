import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Mail, Phone, Users, Coffee, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "@/lib/axios";

interface BusinessContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BusinessInquiryForm {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  monthly_consumption: string;
  employees_count: string;
  current_supplier: string;
  message: string;
}

export default function BusinessContactModal({
  open,
  onOpenChange,
}: BusinessContactModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessInquiryForm>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    monthly_consumption: "",
    employees_count: "",
    current_supplier: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/business-inquiries", formData);

      toast({
        title: "¡Solicitud Enviada!",
        description:
          "Gracias por tu interés. Nos pondremos en contacto contigo pronto.",
      });

      // Reset form and close modal
      setFormData({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        monthly_consumption: "",
        employees_count: "",
        current_supplier: "",
        message: "",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.error ||
          "No se pudo enviar tu solicitud. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof BusinessInquiryForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Building2 className="h-6 w-6 text-brand-600" />
            Suscripción Empresarial
          </DialogTitle>
          <DialogDescription className="text-base">
            Cuéntanos sobre tu negocio y crearemos una solución de café
            personalizada para ti
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-neutral-900">
              Información de la Empresa
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nombre de la Empresa *</Label>
                <Input
                  id="company_name"
                  required
                  placeholder="Mi Empresa S.A."
                  value={formData.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_name">Nombre de Contacto *</Label>
                <Input
                  id="contact_name"
                  required
                  placeholder="Juan Pérez"
                  value={formData.contact_name}
                  onChange={(e) => handleChange("contact_name", e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email Corporativo *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="contacto@miempresa.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Teléfono *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="55 1234 5678"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-neutral-900">
              Detalles del Negocio
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="employees_count"
                  className="flex items-center gap-1"
                >
                  <Users className="h-4 w-4" />
                  Número de Empleados *
                </Label>
                <Select
                  value={formData.employees_count}
                  onValueChange={(value) =>
                    handleChange("employees_count", value)
                  }
                  required
                >
                  <SelectTrigger id="employees_count">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 empleados</SelectItem>
                    <SelectItem value="11-25">11-25 empleados</SelectItem>
                    <SelectItem value="26-50">26-50 empleados</SelectItem>
                    <SelectItem value="51-100">51-100 empleados</SelectItem>
                    <SelectItem value="100+">Más de 100 empleados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="monthly_consumption"
                  className="flex items-center gap-1"
                >
                  <Coffee className="h-4 w-4" />
                  Consumo Mensual Estimado *
                </Label>
                <Select
                  value={formData.monthly_consumption}
                  onValueChange={(value) =>
                    handleChange("monthly_consumption", value)
                  }
                  required
                >
                  <SelectTrigger id="monthly_consumption">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5kg">1-5 kg/mes</SelectItem>
                    <SelectItem value="5-10kg">5-10 kg/mes</SelectItem>
                    <SelectItem value="10-25kg">10-25 kg/mes</SelectItem>
                    <SelectItem value="25-50kg">25-50 kg/mes</SelectItem>
                    <SelectItem value="50kg+">Más de 50 kg/mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_supplier">
                ¿Actualmente tienen proveedor de café?
              </Label>
              <Input
                id="current_supplier"
                placeholder="Nombre del proveedor actual (opcional)"
                value={formData.current_supplier}
                onChange={(e) =>
                  handleChange("current_supplier", e.target.value)
                }
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="message">Cuéntanos más sobre tus necesidades</Label>
            <Textarea
              id="message"
              placeholder="Tipo de negocio, horarios de entrega preferidos, preferencias de café, etc."
              rows={4}
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>Enviar Solicitud</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
