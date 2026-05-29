import { useMemo } from "react";
import { Check, ChevronUp, Coffee } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

export interface WizardSummaryPlan {
  id: string;
  name: string;
  weight: string;
  price: number;
  gradient: string;
}

export interface WizardSummaryData {
  selectedPlan: WizardSummaryPlan | null;
  grind: string;
  recipientType: "" | "self" | "other";
  recipientName: string;
  fullName: string;
  streetAddress: string;
  streetAddress2: string;
  city: string;
  stateId: string;
  postalCode: string;
}

interface GrindOption {
  value: string;
  label: string;
}

interface StateOption {
  id: number;
  name: string;
}

function getGrindLabel(
  grind: string,
  options: GrindOption[],
): string | null {
  if (!grind) return null;
  return options.find((o) => o.value === grind)?.label ?? grind;
}

function buildHighlights(
  data: WizardSummaryData,
  grindOptions: GrindOption[],
  states: StateOption[],
) {
  const items: string[] = [];
  const grind = getGrindLabel(data.grind, grindOptions);
  if (grind) items.push(grind);
  if (data.recipientType === "self") items.push("Para ti");
  if (data.recipientType === "other" && data.recipientName) {
    items.push(`Para ${data.recipientName.split(" ")[0]}`);
  }
  if (data.city) {
    const stateName = states.find(
      (s) => s.id.toString() === data.stateId,
    )?.name;
    items.push(stateName ? `${data.city}, ${stateName}` : data.city);
  }
  return items;
}

export function SubscriptionSummaryContent({
  data,
  grindOptions,
  states,
  className,
}: {
  data: WizardSummaryData;
  grindOptions: GrindOption[];
  states: StateOption[];
  className?: string;
}) {
  const grindLabel = getGrindLabel(data.grind, grindOptions);

  return (
    <div className={cn("space-y-5", className)}>
      <h4 className="text-xl font-bold text-neutral-900">
        Resumen de tu suscripción
      </h4>

      {data.selectedPlan ? (
        <>
          <div className="bg-gradient-to-br from-brand-50 to-brand-50/50 border border-brand-200 rounded-2xl p-5 transition-all">
            <div
              className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center mb-4 shadow-md",
                data.selectedPlan.gradient,
              )}
            >
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <h5 className="font-bold text-neutral-900 text-lg mb-1">
              {data.selectedPlan.name}
            </h5>
            <p className="text-neutral-600 text-sm font-medium mb-4">
              {data.selectedPlan.weight} por mes
            </p>
            <div className="bg-white px-4 py-3 rounded-xl mb-4">
              <div className="text-3xl font-bold text-brand-800">
                ${data.selectedPlan.price}
              </div>
              <div className="text-neutral-600 text-xs font-medium">
                MXN/mes · envío gratis
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-brand-200 pt-4">
              {grindLabel && (
                <div className="flex justify-between items-center animate-fadeIn">
                  <span className="text-neutral-600 font-medium">Molido:</span>
                  <span className="bg-brand-100 px-2.5 py-1 rounded-full font-bold text-neutral-900">
                    {grindLabel}
                  </span>
                </div>
              )}
              {(data.streetAddress || data.city) && (
                <div className="animate-fadeIn">
                  <span className="text-neutral-600 font-medium block mb-1">
                    Entrega:
                  </span>
                  <p className="text-neutral-700 font-medium text-xs bg-white p-2.5 rounded-lg">
                    {data.fullName && (
                      <span className="block font-semibold">{data.fullName}</span>
                    )}
                    {data.streetAddress}
                    {data.streetAddress2 && `, ${data.streetAddress2}`}
                    {data.city && (
                      <>
                        <br />
                        {data.city}
                        {data.stateId && states.length > 0 && (
                          <>
                            ,{" "}
                            {
                              states.find(
                                (s) => s.id.toString() === data.stateId,
                              )?.name
                            }
                          </>
                        )}
                        {data.postalCode && ` ${data.postalCode}`}
                      </>
                    )}
                  </p>
                </div>
              )}
              {data.recipientName && (
                <div className="flex justify-between items-center animate-fadeIn">
                  <span className="text-neutral-600 font-medium">
                    Destinatario:
                  </span>
                  <span className="font-bold text-neutral-900">
                    {data.recipientName.split(" ")[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-500/10 to-brand-600/5 border border-brand-200/50 rounded-2xl p-4">
            <h6 className="font-bold text-neutral-900 mb-3 flex items-center text-sm">
              <span className="text-base mr-2">✓</span>
              Incluido en tu plan
            </h6>
            <ul className="space-y-2">
              {[
                "Café 100% mexicano",
                "Envío gratis",
                "Sin compromiso",
                "Frescura garantizada",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start text-neutral-700 font-medium text-xs"
                >
                  <Check className="h-3 w-3 mr-2 text-brand-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 text-center">
          <div className="inline-block p-3 bg-neutral-100 rounded-full mb-3">
            <Coffee className="h-8 w-8 text-neutral-400" />
          </div>
          <p className="text-neutral-600 font-medium text-sm">
            Selecciona un plan para comenzar
          </p>
        </div>
      )}
    </div>
  );
}

const STEP_CHIPS = [
  { key: "plan", label: "Plan" },
  { key: "grind", label: "Molido" },
  { key: "recipient", label: "Entrega" },
  { key: "address", label: "Dirección" },
] as const;

export function MobileSubscriptionSummaryDock({
  data,
  grindOptions,
  states,
  wizardStep,
  open,
  onOpenChange,
}: {
  data: WizardSummaryData;
  grindOptions: GrindOption[];
  states: StateOption[];
  wizardStep: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const highlights = useMemo(
    () => buildHighlights(data, grindOptions, states),
    [data, grindOptions, states],
  );

  const completedSteps = useMemo(() => {
    const done = new Set<string>();
    if (data.selectedPlan) done.add("plan");
    if (data.grind) done.add("grind");
    if (data.recipientType) done.add("recipient");
    if (data.streetAddress && data.city && data.stateId && data.postalCode) {
      done.add("address");
    }
    return done;
  }, [data]);

  const progressPct =
    (completedSteps.size / STEP_CHIPS.length) * 100;

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="w-full text-left"
        aria-label="Ver resumen de suscripción"
      >
        <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {/* Progress rail */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-neutral-100">
            <div
              className="h-full bg-brand-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center gap-2.5 px-2.5 py-2 pt-2.5">
            {data.selectedPlan ? (
              <div
                className={cn(
                  "w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                  data.selectedPlan.gradient,
                )}
              >
                <Coffee className="h-4 w-4 text-white" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Coffee className="h-4 w-4 text-neutral-400" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-700">
                Tu bolsa
              </span>
              <p className="font-semibold text-neutral-900 text-xs truncate leading-tight">
                {data.selectedPlan?.name ?? "Elige tu plan"}
              </p>
              {highlights.length > 0 ? (
                <p className="text-[10px] text-neutral-500 truncate">
                  {highlights.join(" · ")}
                </p>
              ) : (
                <p className="text-[10px] text-neutral-400">
                  Paso {wizardStep + 1} · Ver detalles
                </p>
              )}
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
              {data.selectedPlan ? (
                <span className="text-base font-bold text-brand-800 leading-none">
                  ${data.selectedPlan.price}
                </span>
              ) : (
                <span className="text-[10px] text-neutral-400">—</span>
              )}
              <span className="flex items-center gap-0.5 text-[9px] font-medium text-brand-600">
                Resumen
                <ChevronUp className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Mini step chips */}
          <div className="flex gap-1 px-2.5 pb-2 overflow-x-auto scrollbar-hide">
            {STEP_CHIPS.map((chip) => {
              const done = completedSteps.has(chip.key);
              return (
                <span
                  key={chip.key}
                  className={cn(
                    "flex-shrink-0 px-1.5 py-px rounded-full text-[9px] font-semibold",
                    done
                      ? "bg-brand-600 text-white"
                      : "bg-neutral-100 text-neutral-500",
                  )}
                >
                  {done ? "✓ " : ""}
                  {chip.label}
                </span>
              );
            })}
          </div>
        </div>
      </button>

      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="rounded-t-xl max-h-[88dvh] border-neutral-200 bg-white px-0 safe-bottom">
          <VisuallyHidden.Root>
            <DrawerTitle>Resumen de tu suscripción</DrawerTitle>
          </VisuallyHidden.Root>
          <div className="overflow-y-auto px-5 pt-2 pb-8 max-h-[calc(88dvh-2rem)]">
            <SubscriptionSummaryContent
              data={data}
              grindOptions={grindOptions}
              states={states}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
