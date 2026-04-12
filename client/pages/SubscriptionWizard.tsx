import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SEOMeta from "@/components/SEOMeta";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Coffee,
  Truck,
  Heart,
  Check,
  ChevronRight,
  Home,
  Loader2,
  User,
  CreditCard,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectGrindTypes,
  selectGrindTypesLoading,
} from "@/store/slices/grindTypesSlice";
import { selectStates, selectStatesLoading } from "@/store/slices/statesSlice";
import { selectPlans, selectPlansLoading } from "@/store/slices/plansSlice";
import { selectIsAuthenticated, selectUser } from "@/store/slices/authSlice";
import { fetchHome } from "@/store/slices/homeSlice";
import {
  createSetupIntent,
  createSubscription,
  selectClientSecret,
  selectPaymentLoading,
  selectPaymentError,
  clearPaymentState,
} from "@/store/slices/paymentsSlice";
import {
  updateWizardData,
  resetWizardData,
  selectWizardData,
} from "@/store/slices/subscriptionWizardSlice";
import { fetchMySubscription } from "@/store/slices/dashboardSlice";
import AuthModal from "@/components/AuthModal";
import StripeCheckoutForm from "@/components/StripeCheckoutForm";

interface SubscriptionPlan {
  id: string;
  name: string;
  weight: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  popular?: boolean;
  premium?: boolean;
  gradient: string;
  badge?: string;
}

interface WizardData {
  grind: string;
  // Address fields
  fullName: string;
  streetAddress: string;
  streetAddress2: string;
  apartmentNumber: string;
  deliveryInstructions: string;
  city: string;
  stateId: string;
  postalCode: string;
  phone: string;
  // Recipient fields
  recipientType: "self" | "other" | "";
  recipientName: string;
  recipientPhone: string;
  selectedPlan: SubscriptionPlan | null;
}

export default function SubscriptionWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Redux state
  const grindTypes = useAppSelector(selectGrindTypes);
  const grindTypesLoading = useAppSelector(selectGrindTypesLoading);
  const states = useAppSelector(selectStates);
  const statesLoading = useAppSelector(selectStatesLoading);
  const apiPlans = useAppSelector(selectPlans);
  const plansLoading = useAppSelector(selectPlansLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const clientSecret = useAppSelector(selectClientSecret);
  const paymentLoading = useAppSelector(selectPaymentLoading);
  const paymentError = useAppSelector(selectPaymentError);
  const wizardData = useAppSelector(selectWizardData);
  const dashboardSubscriptions = useAppSelector(
    (s) => s.dashboard.subscriptions,
  );
  const dashboardLoading = useAppSelector((s) => s.dashboard.loading);

  const selectedPlanId = location.state?.planId;

  const [wizardStep, setWizardStep] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stripePromise] = useState(() =>
    loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY),
  );

  // Reset wizard data on mount when a plan is pre-selected from home page
  useEffect(() => {
    if (selectedPlanId) {
      dispatch(resetWizardData());
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchHome());
  }, [dispatch]);

  // When API plans load, set the preselected plan if there is one
  useEffect(() => {
    if (selectedPlanId && apiPlans && apiPlans.length > 0) {
      const apiPlan = apiPlans.find((p: any) => p.plan_id === selectedPlanId);
      if (apiPlan) {
        const plan = {
          id: apiPlan.plan_id,
          name: apiPlan.name,
          weight: apiPlan.weight,
          price: parseFloat(apiPlan.price_mxn),
          description: apiPlan.description,
          features: apiPlan.features || [],
          gradient:
            apiPlan.plan_id === "250gr"
              ? "from-brand-600 to-brand-700"
              : apiPlan.plan_id === "500gr"
                ? "from-brand-700 to-brand-800"
                : "from-brand-800 to-brand-900",
        } as SubscriptionPlan;

        dispatch(updateWizardData({ selectedPlan: plan }));
        setWizardStep(1); // Skip to step 1 if plan is preselected
      }
    }
  }, [selectedPlanId, apiPlans]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [wizardStep]);

  // Create SetupIntent when reaching the payment step
  useEffect(() => {
    if (wizardStep === 4 && wizardData.selectedPlan && !clientSecret) {
      dispatch(createSetupIntent());
    }
  }, [wizardStep, wizardData.selectedPlan, clientSecret, dispatch]);

  // When user is authenticated, check if they already have a non-cancelled subscription
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMySubscription());
    }
  }, [isAuthenticated, dispatch]);

  // True once subscriptions are loaded and user already has a non-cancelled one
  const hasActiveSubscription =
    isAuthenticated &&
    !dashboardLoading &&
    dashboardSubscriptions.length > 0 &&
    dashboardSubscriptions.some((s) =>
      ["active", "trialing", "past_due", "incomplete"].includes(s.status),
    );

  // Determine if there's a preselected plan
  const hasPreselectedPlan = !!wizardData.selectedPlan && !!selectedPlanId;
  const initialStep = hasPreselectedPlan ? 1 : 0;

  const nextStep = () => {
    // After recipient selection (step 2), check if user is authenticated
    if (wizardStep === 2 && !isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // After authentication, prefill recipient data if "self" was selected
    if (wizardStep === 2 && wizardData.recipientType === "self" && user) {
      dispatch(
        updateWizardData({
          recipientName: user.full_name,
          recipientPhone: user.phone || "",
        }),
      );
    }

    if (wizardStep < 5) {
      setWizardStep(wizardStep + 1);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // If "self" was selected, prefill recipient data from authenticated user
    if (wizardData.recipientType === "self" && user) {
      dispatch(
        updateWizardData({
          recipientName: user.full_name,
          recipientPhone: user.phone || "",
        }),
      );
    }
    // Continue to next step after authentication
    setWizardStep(wizardStep + 1);
  };

  const prevStep = () => {
    if (wizardStep > (hasPreselectedPlan ? 1 : 0)) {
      setWizardStep(wizardStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Subscription data:", wizardData);
    // Here you would send data to your backend
    navigate("/");
  };

  const totalSteps = 5; // Total steps: 0-Plan, 1-Grind, 2-Recipient, 3-Address, 4-Payment
  const progressPercentage = ((wizardStep + 1) / totalSteps) * 100;

  // Fallback grind options if API data is still loading
  const grindOptions = [
    {
      value: "whole-bean",
      label: "Grano entero",
      description:
        "Para quienes prefieren moler en casa y obtener máximo frescor",
    },
    {
      value: "ground-coarse",
      label: "Molido grueso",
      description: "Perfecto para prensa francesa y cold brew",
    },
    {
      value: "ground-medium",
      label: "Molido medio",
      description: "Ideal para cafetera de goteo y pour over",
    },
    {
      value: "ground-fine",
      label: "Molido fino",
      description: "Especial para máquinas de espresso y moka italiana",
    },
  ];

  // Use API grind types if available, otherwise use fallback
  const displayGrindOptions =
    grindTypes && grindTypes.length > 0
      ? grindTypes.map((type) => ({
          value: type.code,
          label: type.name,
          description: type.description,
        }))
      : grindOptions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-brand-50">
      <SEOMeta
        title="Elige tu Plan de Café"
        description="Personaliza tu suscripción de café mexicano premium. Elige el tamaño, tipo de molido y frecuencia de entrega. Sin compromisos, cancela cuando quieras."
        path="/subscription-wizard"
        noIndex={false}
        keywords={[
          "elegir plan café",
          "suscripción personalizada",
          "molido artesanal",
          "plan mensual café",
        ]}
      />

      {/* ── Active subscription gate ──────────────────────────────────────── */}
      {hasActiveSubscription && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-md w-full bg-white rounded-2xl border border-brand-100 shadow-sm p-8 text-center">
            <div className="inline-block p-4 bg-brand-50 rounded-2xl mb-5">
              <Coffee className="h-12 w-12 text-brand-700" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Ya tienes una suscripción activa
            </h2>
            <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
              Solo puedes tener una suscripción a la vez. Desde tu cuenta puedes
              cambiar el plan, actualizar tu dirección o cancelar cuando
              quieras.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate("/")}
                className="bg-brand-700 hover:bg-brand-800 text-white"
              >
                Ir al inicio
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Normal wizard (hidden while active-subscription gate is open) ── */}
      {!hasActiveSubscription && (
        <>
          {/* Header with Stepper */}
          <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-5">
              <div className="flex items-center justify-between mb-3 sm:mb-5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-600 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                  onClick={() => navigate("/")}
                >
                  <Home className="h-4 w-4 mr-1.5" />
                  <span className="font-medium text-sm">Inicio</span>
                </Button>
                <h1 className="text-sm sm:text-xl font-bold text-neutral-900 text-center">
                  Configura tu Suscripción
                </h1>
                <div className="w-16 sm:w-20" />
              </div>

              {/* Compact Stepper */}
              <div className="flex items-center justify-center max-w-3xl mx-auto">
                {(hasPreselectedPlan
                  ? [
                      { step: 1, label: "Molido" },
                      { step: 2, label: "Entrega" },
                      { step: 3, label: "Destinatario" },
                      { step: 4, label: "Pago" },
                    ]
                  : [
                      { step: 0, label: "Plan" },
                      { step: 1, label: "Molido" },
                      { step: 2, label: "Entrega" },
                      { step: 3, label: "Destinatario" },
                      { step: 4, label: "Pago" },
                    ]
                ).map((item, index, array) => (
                  <div key={item.step} className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                          item.step < wizardStep
                            ? "bg-brand-700 text-white"
                            : item.step === wizardStep
                              ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white ring-2 ring-brand-300 shadow-md"
                              : "bg-neutral-200 text-neutral-500"
                        }`}
                      >
                        {item.step < wizardStep ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div
                        className={`text-sm font-semibold transition-colors hidden sm:block ${
                          item.step <= wizardStep
                            ? "text-neutral-900"
                            : "text-neutral-400"
                        }`}
                      >
                        {item.label}
                      </div>
                    </div>
                    {index < array.length - 1 && (
                      <div
                        className={`h-0.5 w-5 sm:w-14 mx-1.5 sm:mx-3 transition-all duration-300 ${
                          item.step < wizardStep
                            ? "bg-brand-700"
                            : "bg-neutral-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8">
            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
              {/* Left Side - Form (2/3 width on most steps, full width on payment) */}
              <div
                className={wizardStep === 4 ? "lg:col-span-3" : "lg:col-span-2"}
              >
                <div className="bg-white rounded-2xl border border-brand-100 p-4 sm:p-8 shadow-sm">
                  {/* Step 0: Plan Selection */}
                  {wizardStep === 0 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-gradient-to-r from-brand-100 to-brand-50 rounded-2xl mb-4">
                          <Coffee className="h-10 w-10 text-brand-800" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                          Elige tu Plan de Café
                        </h3>
                        <p className="text-neutral-600 text-base max-w-xl mx-auto">
                          Selecciona la cantidad perfecta para tu consumo
                          mensual
                        </p>
                      </div>

                      {plansLoading ? (
                        <div className="flex justify-center items-center py-20">
                          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
                          <span className="ml-3 text-lg text-neutral-600">
                            Cargando planes...
                          </span>
                        </div>
                      ) : !apiPlans || apiPlans.length === 0 ? (
                        <div className="flex flex-col justify-center items-center py-20">
                          <Coffee className="h-16 w-16 text-neutral-300 mb-4" />
                          <p className="text-lg text-neutral-600">
                            No hay planes disponibles en este momento
                          </p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {apiPlans
                            .filter((p: any) => !p.requires_contact)
                            .map((plan: any) => ({
                              id: plan.plan_id,
                              name: plan.name,
                              weight: plan.weight,
                              price: parseFloat(plan.price_mxn),
                              description: plan.description,
                              gradient:
                                plan.plan_id === "250gr"
                                  ? "from-brand-600 to-brand-700"
                                  : plan.plan_id === "500gr"
                                    ? "from-brand-700 to-brand-800"
                                    : "from-brand-800 to-brand-900",
                            }))
                            .map((plan: any) => (
                              <div
                                key={plan.id}
                                onClick={() => {
                                  dispatch(
                                    updateWizardData({
                                      selectedPlan: plan,
                                    }),
                                  );
                                }}
                                className={`group cursor-pointer p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                                  wizardData.selectedPlan?.id === plan.id
                                    ? "border-brand-500 bg-gradient-to-br from-brand-50 to-white shadow-md ring-2 ring-brand-200"
                                    : "border-neutral-200 hover:border-brand-300"
                                }`}
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div
                                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.gradient} flex items-center justify-center shadow-md`}
                                  >
                                    <Coffee className="h-6 w-6 text-white" />
                                  </div>
                                  {wizardData.selectedPlan?.id === plan.id && (
                                    <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center">
                                      <Check className="h-4 w-4 text-white" />
                                    </div>
                                  )}
                                </div>
                                <h4 className="text-xl font-bold text-neutral-900 mb-1">
                                  {plan.name}
                                </h4>
                                <p className="text-neutral-600 text-sm mb-4">
                                  {plan.description}
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-3xl font-bold text-brand-800">
                                    ${plan.price}
                                  </span>
                                  <span className="text-neutral-600 text-sm font-medium">
                                    MXN/mes
                                  </span>
                                </div>
                                <div className="mt-2 text-sm font-semibold text-neutral-700">
                                  {plan.weight} por mes
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {wizardStep === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-gradient-to-r from-brand-100 to-brand-50 rounded-2xl mb-4">
                          <Coffee className="h-10 w-10 text-brand-800" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                          ¿Cómo prefieres tu café?
                        </h3>
                        <p className="text-neutral-600 text-base max-w-xl mx-auto">
                          Selecciona el tipo de molido para tu método de
                          preparación
                        </p>
                      </div>

                      {grindTypesLoading ? (
                        <div className="flex justify-center items-center py-20">
                          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                          <span className="ml-3 text-lg text-neutral-600">
                            Cargando opciones...
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {displayGrindOptions.map((option) => (
                            <div
                              key={option.value}
                              onClick={() =>
                                dispatch(
                                  updateWizardData({
                                    grind: option.value,
                                  }),
                                )
                              }
                              className={`group relative flex items-start space-x-4 p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                                wizardData.grind === option.value
                                  ? "border-brand-500 bg-gradient-to-r from-brand-50 to-white shadow-md ring-2 ring-brand-200"
                                  : "border-neutral-200 hover:border-brand-300"
                              }`}
                            >
                              {/* Selected indicator */}
                              {wizardData.grind === option.value && (
                                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              )}

                              <div className="flex-1 pt-0.5">
                                <h4
                                  className={`text-lg font-bold mb-1.5 transition-colors ${
                                    wizardData.grind === option.value
                                      ? "text-brand-800"
                                      : "text-neutral-900 group-hover:text-brand-700"
                                  }`}
                                >
                                  {option.label}
                                </h4>
                                <p className="text-neutral-600 text-sm leading-relaxed">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-gradient-to-r from-brand-100 to-brand-50 rounded-2xl mb-4">
                          <User className="h-10 w-10 text-brand-800" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                          ¿Quién recibirá el café?
                        </h3>
                        <p className="text-neutral-600 text-base max-w-xl mx-auto">
                          Selecciona si el café es para ti o para otra persona
                        </p>
                      </div>

                      <RadioGroup
                        value={wizardData.recipientType}
                        onValueChange={(value: "self" | "other") =>
                          dispatch(
                            updateWizardData({
                              recipientType: value,
                            }),
                          )
                        }
                        className="space-y-4"
                      >
                        <div
                          className={`relative border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 ${
                            wizardData.recipientType === "self"
                              ? "border-brand-600 bg-brand-50/50 shadow-md"
                              : "border-neutral-200 hover:border-brand-300 hover:bg-neutral-50"
                          }`}
                          onClick={() =>
                            dispatch(
                              updateWizardData({
                                recipientType: "self",
                              }),
                            )
                          }
                        >
                          <div className="flex items-start space-x-4">
                            <RadioGroupItem
                              value="self"
                              id="self"
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor="self"
                                className="text-lg font-bold text-neutral-900 cursor-pointer"
                              >
                                Yo recibiré el café
                              </Label>
                              <p className="text-neutral-600 text-sm mt-1">
                                El café se enviará a tu dirección
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`relative border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 ${
                            wizardData.recipientType === "other"
                              ? "border-brand-600 bg-brand-50/50 shadow-md"
                              : "border-neutral-200 hover:border-brand-300 hover:bg-neutral-50"
                          }`}
                          onClick={() =>
                            dispatch(
                              updateWizardData({
                                recipientType: "other",
                                recipientName: "",
                                recipientPhone: "",
                              }),
                            )
                          }
                        >
                          <div className="flex items-start space-x-4">
                            <RadioGroupItem
                              value="other"
                              id="other"
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor="other"
                                className="text-lg font-bold text-neutral-900 cursor-pointer"
                              >
                                Es un regalo para otra persona
                              </Label>
                              <p className="text-neutral-600 text-sm mt-1">
                                Enviaremos el café a la dirección del
                                destinatario
                              </p>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-gradient-to-r from-brand-100 to-brand-50 rounded-2xl mb-4">
                          <Truck className="h-10 w-10 text-brand-800" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                          {wizardData.recipientType === "self"
                            ? "¿Dónde enviamos tu café?"
                            : "¿Dónde enviamos el café?"}
                        </h3>
                        <p className="text-neutral-600 text-base max-w-xl mx-auto">
                          Entregamos en toda la República Mexicana sin costo
                        </p>
                      </div>

                      <div className="space-y-4">
                        {/* Recipient Name & Phone - Only show if gift for someone else */}
                        {wizardData.recipientType === "other" && (
                          <>
                            <div>
                              <Label
                                htmlFor="recipient-name"
                                className="text-sm font-semibold text-neutral-900 block mb-2"
                              >
                                Nombre completo del destinatario
                              </Label>
                              <Input
                                id="recipient-name"
                                placeholder="Ej: María García López"
                                value={wizardData.recipientName}
                                onChange={(e) =>
                                  dispatch(
                                    updateWizardData({
                                      recipientName: e.target.value,
                                    }),
                                  )
                                }
                                className="text-base p-3 h-11 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-brand-500 focus:ring-2 transition-all"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="recipient-phone"
                                className="text-sm font-semibold text-neutral-900 block mb-2"
                              >
                                Teléfono de contacto
                              </Label>
                              <Input
                                id="recipient-phone"
                                placeholder="Ej: 55 1234 5678"
                                value={wizardData.recipientPhone}
                                onChange={(e) =>
                                  dispatch(
                                    updateWizardData({
                                      recipientPhone: e.target.value,
                                    }),
                                  )
                                }
                                className="text-base p-3 h-11 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-brand-500 focus:ring-2 transition-all"
                              />
                            </div>
                            <div className="bg-brand-50/50 border border-brand-200 rounded-lg p-3 mb-2">
                              <p className="text-neutral-700 text-sm">
                                📍{" "}
                                <span className="font-semibold">
                                  Dirección de entrega del destinatario:
                                </span>
                              </p>
                            </div>
                          </>
                        )}

                        {/* DEV ONLY: Fill test data button */}
                        {import.meta.env.DEV && (
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateWizardData({
                                  streetAddress: "Calle Independencia 47",
                                  streetAddress2: "Col. Centro",
                                  apartmentNumber: "",
                                  city: "Lagos de Moreno",
                                  stateId: "14", // Jalisco
                                  postalCode: "47400",
                                  deliveryInstructions:
                                    "Casa color azul, tocar timbre",
                                }),
                              )
                            }
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-amber-400 bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"
                          >
                            🧪 Rellenar datos de prueba (solo dev)
                          </button>
                        )}

                        {/* Street Address */}
                        <div>
                          <Label
                            htmlFor="streetAddress"
                            className="text-sm font-semibold text-neutral-900 block mb-2"
                          >
                            Calle y número
                          </Label>
                          <Input
                            id="streetAddress"
                            placeholder="Ej: Av. Insurgentes Sur 1234"
                            value={wizardData.streetAddress}
                            onChange={(e) =>
                              dispatch(
                                updateWizardData({
                                  streetAddress: e.target.value,
                                }),
                              )
                            }
                            className="text-base p-3 h-11 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-brand-500 focus:ring-2 transition-all"
                          />
                        </div>

                        {/* Street Address 2 (Optional) */}
                        <div>
                          <Label
                            htmlFor="streetAddress2"
                            className="text-sm font-semibold text-neutral-900 block mb-2"
                          >
                            Colonia, delegación o municipio{" "}
                            <span className="text-neutral-500 font-normal">
                              (opcional)
                            </span>
                          </Label>
                          <Input
                            id="streetAddress2"
                            placeholder="Ej: Col. Del Valle"
                            value={wizardData.streetAddress2}
                            onChange={(e) =>
                              dispatch(
                                updateWizardData({
                                  streetAddress2: e.target.value,
                                }),
                              )
                            }
                            className="text-base p-3 h-11 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-brand-500 focus:ring-2 transition-all"
                          />
                        </div>

                        {/* Apartment / Unit Number (Optional) */}
                        <div>
                          <Label
                            htmlFor="apartmentNumber"
                            className="text-sm font-semibold text-neutral-900 block mb-2"
                          >
                            Departamento / Interior{" "}
                            <span className="text-neutral-500 font-normal">
                              (opcional)
                            </span>
                          </Label>
                          <Input
                            id="apartmentNumber"
                            placeholder="Ej: Depto 4B, Piso 3"
                            value={wizardData.apartmentNumber}
                            onChange={(e) =>
                              dispatch(
                                updateWizardData({
                                  apartmentNumber: e.target.value,
                                }),
                              )
                            }
                            className="text-base p-3 h-11 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-brand-500 focus:ring-2 transition-all"
                          />
                        </div>

                        {/* City and State */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label
                              htmlFor="city"
                              className="text-sm font-semibold text-neutral-900 block mb-2"
                            >
                              Ciudad
                            </Label>
                            <Input
                              id="city"
                              placeholder="Ej: Ciudad de México"
                              value={wizardData.city}
                              onChange={(e) =>
                                dispatch(
                                  updateWizardData({
                                    city: e.target.value,
                                  }),
                                )
                              }
                              className="text-base p-3 h-11 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-brand-500 focus:ring-2 transition-all"
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor="stateId"
                              className="text-sm font-semibold text-neutral-900 block mb-2"
                            >
                              Estado
                            </Label>
                            {statesLoading ? (
                              <div className="flex items-center justify-center h-11 border-2 border-neutral-200 rounded-lg">
                                <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                              </div>
                            ) : (
                              <Select
                                value={wizardData.stateId}
                                onValueChange={(value) =>
                                  dispatch(
                                    updateWizardData({
                                      stateId: value,
                                    }),
                                  )
                                }
                              >
                                <SelectTrigger className="h-11 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-brand-500 focus:ring-2">
                                  <SelectValue placeholder="Selecciona estado" />
                                </SelectTrigger>
                                <SelectContent>
                                  {states && states.length > 0 ? (
                                    states.map((state: any) => (
                                      <SelectItem
                                        key={state.id}
                                        value={state.id.toString()}
                                      >
                                        {state.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="0" disabled>
                                      No hay estados disponibles
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>

                        {/* Postal Code */}
                        <div>
                          <Label
                            htmlFor="postalCode"
                            className="text-sm font-semibold text-neutral-900 block mb-2"
                          >
                            Código Postal
                          </Label>
                          <Input
                            id="postalCode"
                            placeholder="Ej: 03100"
                            value={wizardData.postalCode}
                            onChange={(e) =>
                              dispatch(
                                updateWizardData({
                                  postalCode: e.target.value,
                                }),
                              )
                            }
                            maxLength={5}
                            className="text-base p-3 h-11 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-brand-500 focus:ring-2 transition-all"
                          />
                        </div>

                        {/* Delivery Instructions (Optional) */}
                        <div>
                          <Label
                            htmlFor="deliveryInstructions"
                            className="text-sm font-semibold text-neutral-900 block mb-2"
                          >
                            Instrucciones de entrega{" "}
                            <span className="text-neutral-500 font-normal">
                              (opcional)
                            </span>
                          </Label>
                          <textarea
                            id="deliveryInstructions"
                            placeholder="Ej: Tocar el timbre 2 veces, dejar con el portero..."
                            value={wizardData.deliveryInstructions}
                            onChange={(e) =>
                              dispatch(
                                updateWizardData({
                                  deliveryInstructions: e.target.value,
                                }),
                              )
                            }
                            rows={3}
                            className="w-full text-base p-3 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-brand-500 focus:ring-2 transition-all resize-none"
                          />
                        </div>

                        <p className="text-neutral-600 text-sm mt-2">
                          Solo utilizaremos estos datos para coordinar la
                          entrega
                        </p>
                      </div>
                    </div>
                  )}

                  {wizardStep === 4 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-gradient-to-r from-brand-100 to-brand-50 rounded-2xl mb-4">
                          <CreditCard className="h-10 w-10 text-brand-800" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                          Resumen y Pago
                        </h3>
                        <p className="text-neutral-600 text-base max-w-xl mx-auto">
                          Revisa tu suscripción y completa el pago
                        </p>
                      </div>

                      {/* Summary Cards */}
                      <div className="space-y-4">
                        {/* Plan Summary */}
                        <div className="border-2 border-neutral-200 rounded-xl p-6 bg-white">
                          <h4 className="font-bold text-lg text-neutral-900 mb-4">
                            Tu Suscripción
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Plan:</span>
                              <span className="font-bold text-neutral-900">
                                {wizardData.selectedPlan?.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Molido:</span>
                              <span className="font-bold text-neutral-900">
                                {
                                  displayGrindOptions.find(
                                    (g) => g.value === wizardData.grind,
                                  )?.label
                                }
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-neutral-200 pt-3">
                              <span className="text-lg font-bold text-neutral-900">
                                Total mensual:
                              </span>
                              <span className="text-2xl font-bold text-brand-700">
                                ${wizardData.selectedPlan?.price} MXN
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Summary */}
                        <div className="border-2 border-neutral-200 rounded-xl p-6 bg-white">
                          <h4 className="font-bold text-lg text-neutral-900 mb-4">
                            Dirección de Entrega
                          </h4>
                          <div className="text-neutral-700 space-y-1">
                            <p className="font-bold">
                              {wizardData.recipientName}
                            </p>
                            <p>{wizardData.streetAddress}</p>
                            {wizardData.streetAddress2 && (
                              <p>{wizardData.streetAddress2}</p>
                            )}
                            <p>
                              {wizardData.city},{" "}
                              {
                                states.find(
                                  (s: any) =>
                                    s.id.toString() === wizardData.stateId,
                                )?.name
                              }{" "}
                              {wizardData.postalCode}
                            </p>
                            <p className="pt-2">
                              Tel: {wizardData.recipientPhone}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stripe Payment Form */}
                      <div className="border-2 border-neutral-200 rounded-xl p-6 bg-white">
                        <h4 className="font-bold text-lg text-neutral-900 mb-2 flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-brand-600" />
                          Método de Pago Predeterminado
                        </h4>
                        <p className="text-neutral-600 text-sm mb-6">
                          Agrega tu tarjeta para activar la suscripción. Esta
                          sera tu método de pago predeterminado y se usará
                          automáticamente cada mes. Puedes actualizarla en
                          cualquier momento desde tu cuenta.
                        </p>
                        {paymentError ? (
                          <div className="min-h-[200px] flex items-center justify-center">
                            <div className="text-center max-w-md">
                              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                                <p className="text-red-600 text-sm font-medium mb-2">
                                  Error al cargar el formulario de pago
                                </p>
                                <p className="text-red-500 text-xs">
                                  {paymentError}
                                </p>
                              </div>
                              <Button
                                onClick={() => {
                                  if (wizardData.selectedPlan) {
                                    dispatch(createSetupIntent());
                                  }
                                }}
                                variant="outline"
                                className="text-sm"
                              >
                                Reintentar
                              </Button>
                            </div>
                          </div>
                        ) : !clientSecret ? (
                          <div className="min-h-[200px] flex items-center justify-center">
                            <div className="text-center">
                              <Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto mb-3" />
                              <p className="text-neutral-600 text-sm">
                                Cargando formulario de pago seguro...
                              </p>
                              {paymentLoading && (
                                <p className="text-neutral-400 text-xs mt-2">
                                  Iniciando conexión con Stripe...
                                </p>
                              )}
                            </div>
                          </div>
                        ) : !stripePromise ? (
                          <div className="min-h-[200px] flex items-center justify-center">
                            <div className="text-center max-w-md">
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                <p className="text-yellow-600 text-sm font-medium mb-2">
                                  Configuración de Stripe pendiente
                                </p>
                                <p className="text-yellow-600 text-xs">
                                  La clave pública de Stripe no está configurada
                                  correctamente.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Elements
                            stripe={stripePromise}
                            options={{ clientSecret }}
                          >
                            <StripeCheckoutForm
                              clientSecret={clientSecret}
                              onSuccess={async (paymentMethodId) => {
                                // Build address from wizard data
                                const address =
                                  wizardData.recipientName &&
                                  wizardData.streetAddress &&
                                  wizardData.city &&
                                  wizardData.stateId &&
                                  wizardData.postalCode
                                    ? {
                                        full_name: wizardData.recipientName,
                                        street_address:
                                          wizardData.streetAddress,
                                        street_address_2:
                                          wizardData.streetAddress2 || null,
                                        apartment_number:
                                          wizardData.apartmentNumber || null,
                                        delivery_instructions:
                                          wizardData.deliveryInstructions ||
                                          null,
                                        city: wizardData.city,
                                        state_id: parseInt(wizardData.stateId),
                                        postal_code: wizardData.postalCode,
                                        phone:
                                          wizardData.recipientPhone || null,
                                        country: "MX",
                                        is_default: 1,
                                      }
                                    : null;

                                const result = await dispatch(
                                  createSubscription({
                                    paymentMethodId,
                                    planId: wizardData.selectedPlan?.id || "",
                                    grindTypeId: wizardData.grind || undefined,
                                    address,
                                  }),
                                );

                                if (
                                  createSubscription.fulfilled.match(result)
                                ) {
                                  const payload = result.payload as any;
                                  if (payload?.requiresAction) {
                                    throw new Error(
                                      "Tu banco requiere autenticación adicional (3D Secure). Por favor intenta con otra tarjeta o contacta a tu banco.",
                                    );
                                  }
                                  if (!payload?.success) {
                                    throw new Error(
                                      payload?.error ||
                                        "Error al crear la suscripción",
                                    );
                                  }
                                  navigate(
                                    `/subscription/success?plan_id=${
                                      wizardData.selectedPlan?.id || ""
                                    }${wizardData.grind ? `&grind_type_id=${wizardData.grind}` : ""}`,
                                  );
                                } else {
                                  // Thunk was rejected — surface the API error message
                                  const errPayload = result.payload as any;
                                  throw new Error(
                                    errPayload?.error ||
                                      (result as any).error?.message ||
                                      "Error al crear la suscripción",
                                  );
                                }
                              }}
                              onError={(error) => {
                                console.error(
                                  "Card setup / subscription error:",
                                  error,
                                );
                              }}
                            />
                          </Elements>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Summary (1/3 width) - Hidden on payment step */}
              {wizardStep !== 4 && (
                <div className="lg:col-span-1">
                  <div className="sticky top-20 bg-white rounded-2xl border border-brand-100 p-4 sm:p-6 shadow-sm h-fit">
                    <h4 className="text-lg sm:text-2xl font-bold text-neutral-900 mb-3 sm:mb-5">
                      Resumen de tu suscripción
                    </h4>

                    {wizardData.selectedPlan ? (
                      <>
                        <div className="bg-gradient-to-br from-brand-50 to-brand-50/50 border border-brand-200 rounded-xl p-5 mb-6 transition-all">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${wizardData.selectedPlan.gradient} flex items-center justify-center mb-4 shadow-md`}
                          >
                            <Coffee className="h-6 w-6 text-white" />
                          </div>
                          <h5 className="font-bold text-neutral-900 text-lg mb-1">
                            {wizardData.selectedPlan.name}
                          </h5>
                          <p className="text-neutral-600 text-sm font-medium mb-4">
                            {wizardData.selectedPlan.weight} por mes
                          </p>
                          <div className="bg-white px-4 py-3 rounded-lg mb-4">
                            <div className="text-3xl font-bold text-brand-800">
                              ${wizardData.selectedPlan.price}
                            </div>
                            <div className="text-neutral-600 text-xs font-medium">
                              MXN/mes
                            </div>
                          </div>

                          <div className="space-y-3 text-xs border-t border-brand-200 pt-4">
                            {wizardData.grind && (
                              <div className="flex justify-between items-center animate-fadeIn">
                                <span className="text-neutral-600 font-medium">
                                  Molido:
                                </span>
                                <span className="bg-brand-100 px-2.5 py-1 rounded-full font-bold text-neutral-900">
                                  {wizardData.grind === "whole_bean" &&
                                    "Grano entero"}
                                  {wizardData.grind === "coarse" && "Grueso"}
                                  {wizardData.grind === "medium" && "Medio"}
                                  {wizardData.grind === "fine" && "Fino"}
                                  {wizardData.grind === "extra_fine" &&
                                    "Extra fino"}
                                </span>
                              </div>
                            )}
                            {(wizardData.streetAddress || wizardData.city) && (
                              <div className="animate-fadeIn">
                                <span className="text-neutral-600 font-medium block mb-1">
                                  Entrega:
                                </span>
                                <p className="text-neutral-700 font-medium text-xs bg-white p-2 rounded">
                                  {wizardData.fullName && (
                                    <span className="block font-semibold">
                                      {wizardData.fullName}
                                    </span>
                                  )}
                                  {wizardData.streetAddress}
                                  {wizardData.streetAddress2 &&
                                    `, ${wizardData.streetAddress2}`}
                                  {wizardData.city && (
                                    <>
                                      <br />
                                      {wizardData.city}
                                      {wizardData.stateId &&
                                        states &&
                                        states.length > 0 && (
                                          <>
                                            ,{" "}
                                            {
                                              states.find(
                                                (s: any) =>
                                                  s.id.toString() ===
                                                  wizardData.stateId,
                                              )?.name
                                            }
                                          </>
                                        )}
                                      {wizardData.postalCode &&
                                        ` ${wizardData.postalCode}`}
                                    </>
                                  )}
                                </p>
                              </div>
                            )}
                            {wizardData.recipientName && (
                              <div className="flex justify-between items-center animate-fadeIn">
                                <span className="text-neutral-600 font-medium">
                                  Destinatario:
                                </span>
                                <span className="font-bold text-neutral-900">
                                  {wizardData.recipientName.split(" ")[0]}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-brand-500/10 to-brand-600/5 border border-brand-200/50 rounded-xl p-4 mb-6">
                          <h6 className="font-bold text-neutral-900 mb-3 flex items-center text-sm">
                            <span className="text-base mr-2">✓</span>Incluido en
                            tu plan:
                          </h6>
                          <ul className="space-y-2">
                            <li className="flex items-start text-neutral-700 font-medium text-xs">
                              <Check className="h-3 w-3 mr-2 text-brand-600 flex-shrink-0 mt-0.5" />
                              <span>Café 100% mexicano</span>
                            </li>
                            <li className="flex items-start text-neutral-700 font-medium text-xs">
                              <Check className="h-3 w-3 mr-2 text-brand-600 flex-shrink-0 mt-0.5" />
                              <span>Envío gratis</span>
                            </li>
                            <li className="flex items-start text-neutral-700 font-medium text-xs">
                              <Check className="h-3 w-3 mr-2 text-brand-600 flex-shrink-0 mt-0.5" />
                              <span>Sin compromiso</span>
                            </li>
                            <li className="flex items-start text-neutral-700 font-medium text-xs">
                              <Check className="h-3 w-3 mr-2 text-brand-600 flex-shrink-0 mt-0.5" />
                              <span>Frescura garantizada</span>
                            </li>
                          </ul>
                        </div>
                      </>
                    ) : (
                      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
                        <div className="inline-block p-3 bg-neutral-100 rounded-full mb-3">
                          <Coffee className="h-8 w-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-600 font-medium text-sm">
                          Selecciona un plan para comenzar
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="mt-4 pt-4 sm:mt-8 sm:pt-6 border-t border-neutral-200">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className={`font-medium text-base px-6 py-3 rounded-lg border border-neutral-300 hover:bg-neutral-50 transition-colors ${
                    wizardStep === initialStep ? "invisible" : ""
                  }`}
                >
                  <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
                  Anterior
                </Button>

                {wizardStep < totalSteps - 1 && (
                  <Button
                    onClick={nextStep}
                    disabled={
                      (wizardStep === 0 && !wizardData.selectedPlan) ||
                      (wizardStep === 1 && !wizardData.grind) ||
                      (wizardStep === 2 && !wizardData.recipientType) ||
                      (wizardStep === 3 &&
                        (!wizardData.streetAddress ||
                          !wizardData.city ||
                          !wizardData.stateId ||
                          !wizardData.postalCode ||
                          (wizardData.recipientType === "other" &&
                            (!wizardData.recipientName ||
                              !wizardData.recipientPhone))))
                    }
                    className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-medium text-base px-8 py-3 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </main>

          {/* Auth Modal */}
          <AuthModal
            open={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
          />
        </>
      )}
    </div>
  );
}
