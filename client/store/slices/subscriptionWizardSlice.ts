import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface SubscriptionPlan {
  id: string;
  name: string;
  weight: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  premium?: boolean;
  icon: any;
  gradient: string;
  badge?: string;
}

interface WizardData {
  grind: string;
  fullName: string;
  streetAddress: string;
  streetAddress2: string;
  apartmentNumber: string;
  deliveryInstructions: string;
  city: string;
  stateId: string;
  postalCode: string;
  phone: string;
  recipientType: "self" | "other" | "";
  recipientName: string;
  recipientPhone: string;
  selectedPlan: SubscriptionPlan | null;
}

interface SubscriptionWizardState {
  wizardData: WizardData;
}

const initialState: SubscriptionWizardState = {
  wizardData: {
    grind: "",
    fullName: "",
    streetAddress: "",
    streetAddress2: "",
    apartmentNumber: "",
    deliveryInstructions: "",
    city: "",
    stateId: "",
    postalCode: "",
    phone: "",
    recipientType: "",
    recipientName: "",
    recipientPhone: "",
    selectedPlan: null,
  },
};

export const subscriptionWizardSlice = createSlice({
  name: "subscriptionWizard",
  initialState,
  reducers: {
    updateWizardData: (state, action: PayloadAction<Partial<WizardData>>) => {
      state.wizardData = { ...state.wizardData, ...action.payload };
    },
    resetWizardData: (state) => {
      state.wizardData = initialState.wizardData;
    },
    setWizardData: (state, action: PayloadAction<WizardData>) => {
      state.wizardData = action.payload;
    },
  },
});

export const { updateWizardData, resetWizardData, setWizardData } =
  subscriptionWizardSlice.actions;

// Selectors
export const selectWizardData = (state: RootState) =>
  state.subscriptionWizard.wizardData;

export default subscriptionWizardSlice.reducer;
