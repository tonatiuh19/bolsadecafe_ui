import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";
import type { RootState } from "../index";

export interface SavedPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface PaymentState {
  clientSecret: string | null;
  loading: boolean;
  error: string | null;
  paymentMethods: SavedPaymentMethod[];
  paymentMethodsLoading: boolean;
  paymentMethodsError: string | null;
}

const initialState: PaymentState = {
  clientSecret: null,
  loading: false,
  error: null,
  paymentMethods: [],
  paymentMethodsLoading: false,
  paymentMethodsError: null,
};

// ── Create SetupIntent (saves card, no charge) ────────────────────────────
export const createSetupIntent = createAsyncThunk(
  "payments/createSetupIntent",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const sessionToken = state.auth.sessionToken;
    if (!sessionToken) throw new Error("No session token available");

    const { data } = await axios.post(
      "/payment-methods/setup",
      {},
      { headers: { Authorization: `Bearer ${sessionToken}` } },
    );
    return data.clientSecret as string;
  },
);

// ── Legacy: kept for PaymentIntent flow if still needed ──────────────────
export const createPaymentIntent = createAsyncThunk(
  "payments/createPaymentIntent",
  async (
    { planId, address }: { planId: string; address: any },
    { getState },
  ) => {
    const state = getState() as RootState;
    const sessionToken = state.auth.sessionToken;
    if (!sessionToken) throw new Error("No session token available");

    const { data } = await axios.post(
      "/create-payment-intent",
      { planId, address },
      { headers: { Authorization: `Bearer ${sessionToken}` } },
    );
    return data.clientSecret as string;
  },
);

// ── Create Stripe Subscription after card is saved ───────────────────────
export const createSubscription = createAsyncThunk(
  "payments/createSubscription",
  async (
    payload: {
      paymentMethodId: string;
      planId: string;
      grindTypeId?: string;
      address?: any;
    },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    const sessionToken = state.auth.sessionToken;
    if (!sessionToken) throw new Error("No session token available");

    try {
      const { data } = await axios.post("/subscriptions", payload, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return data;
    } catch (error: any) {
      return rejectWithValue({
        error:
          error.response?.data?.error ||
          error.message ||
          "Error al crear la suscripción",
      });
    }
  },
);

// ── Fetch saved payment methods ───────────────────────────────────────────
export const fetchPaymentMethods = createAsyncThunk(
  "payments/fetchPaymentMethods",
  async (stripeSubscriptionId: string | undefined, { getState }) => {
    const state = getState() as RootState;
    const sessionToken = state.auth.sessionToken;
    if (!sessionToken) throw new Error("No session token available");

    const params = stripeSubscriptionId
      ? { subscriptionId: stripeSubscriptionId }
      : undefined;

    const { data } = await axios.get("/payment-methods", {
      headers: { Authorization: `Bearer ${sessionToken}` },
      params,
    });
    return data.paymentMethods as SavedPaymentMethod[];
  },
);

// ── Set default payment method ────────────────────────────────────────────
export const setDefaultPaymentMethod = createAsyncThunk(
  "payments/setDefaultPaymentMethod",
  async (
    {
      paymentMethodId,
      stripeSubscriptionId,
    }: { paymentMethodId: string; stripeSubscriptionId?: string },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    const sessionToken = state.auth.sessionToken;
    if (!sessionToken) throw new Error("No session token available");

    try {
      await axios.post(
        `/payment-methods/${paymentMethodId}/default`,
        stripeSubscriptionId ? { subscriptionId: stripeSubscriptionId } : {},
        { headers: { Authorization: `Bearer ${sessionToken}` } },
      );
      return paymentMethodId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          "Error al establecer tarjeta predeterminada",
      );
    }
  },
);

// ── Remove payment method ─────────────────────────────────────────────────
export const removePaymentMethod = createAsyncThunk(
  "payments/removePaymentMethod",
  async (paymentMethodId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const sessionToken = state.auth.sessionToken;
    if (!sessionToken) throw new Error("No session token available");

    try {
      await axios.delete(`/payment-methods/${paymentMethodId}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return paymentMethodId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Error al eliminar la tarjeta",
      );
    }
  },
);

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearPaymentState: (state) => {
      state.clientSecret = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // SetupIntent
    builder
      .addCase(createSetupIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSetupIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload;
      })
      .addCase(createSetupIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create setup intent";
      });

    // Create Subscription
    builder
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.error ||
          action.error.message ||
          "Failed to create subscription";
      });

    // Legacy PaymentIntent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create payment intent";
      });

    // Fetch payment methods
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.paymentMethodsLoading = true;
        state.paymentMethodsError = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethodsError =
          action.error.message || "Failed to fetch payment methods";
      });

    // Set default
    builder
      .addCase(setDefaultPaymentMethod.pending, (state) => {
        state.paymentMethodsError = null;
      })
      .addCase(setDefaultPaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods = state.paymentMethods.map((pm) => ({
          ...pm,
          isDefault: pm.id === action.payload,
        }));
      })
      .addCase(setDefaultPaymentMethod.rejected, (state, action) => {
        state.paymentMethodsError =
          (action.payload as string) ||
          action.error.message ||
          "Error al establecer tarjeta predeterminada";
      });

    // Remove
    builder
      .addCase(removePaymentMethod.pending, (state) => {
        state.paymentMethodsError = null;
      })
      .addCase(removePaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods = state.paymentMethods.filter(
          (pm) => pm.id !== action.payload,
        );
      })
      .addCase(removePaymentMethod.rejected, (state, action) => {
        state.paymentMethodsError =
          (action.payload as string) ||
          action.error.message ||
          "Error al eliminar la tarjeta";
      });
  },
});

export const { clearPaymentState } = paymentsSlice.actions;

export const selectClientSecret = (state: RootState) =>
  state.payments.clientSecret;
export const selectPaymentLoading = (state: RootState) =>
  state.payments.loading;
export const selectPaymentError = (state: RootState) => state.payments.error;
export const selectPaymentMethods = (state: RootState) =>
  state.payments.paymentMethods;
export const selectPaymentMethodsLoading = (state: RootState) =>
  state.payments.paymentMethodsLoading;
export const selectPaymentMethodsError = (state: RootState) =>
  state.payments.paymentMethodsError;

export default paymentsSlice.reducer;
