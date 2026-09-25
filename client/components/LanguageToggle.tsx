import { useTranslation } from "react-i18next";
import { setAppLanguage } from "@/i18n";
import { Button } from "@/components/ui/button";

export default function LanguageToggle({
  className = "",
}: {
  className?: string;
}) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("en") ? "en" : "es";

  return (
    <div className={`inline-flex rounded-lg border border-neutral-200 p-0.5 ${className}`}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`h-8 px-2.5 text-xs font-semibold ${
          lang === "es" ? "bg-brand-50 text-brand-800" : "text-neutral-500"
        }`}
        onClick={() => setAppLanguage("es")}
      >
        ES
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`h-8 px-2.5 text-xs font-semibold ${
          lang === "en" ? "bg-brand-50 text-brand-800" : "text-neutral-500"
        }`}
        onClick={() => setAppLanguage("en")}
      >
        EN
      </Button>
    </div>
  );
}
