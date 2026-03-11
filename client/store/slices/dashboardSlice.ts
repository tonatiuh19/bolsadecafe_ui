import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "@/store/store";
import type {
  UserSubscriptionDetail,
  UpdateAddressRequest,
  UpdateDeliveryContactRequest,
  UpgradePlanRequest,
  CancelSubscriptionRequest,
} from "@shared/api";

// ─── State ────────────────────────────────────────────────────────────────────

interface DashboardState {
  subscription: UserSubscriptionDetail | null;
  loading: boolean;
  error: string | null;
  // per-action loading/error
  updatingAddress: boolean;
  updatingContact: boolean;
  upgradingPlan: boolean;
  cancelling: boolean;
  openingPortal: boolean;
  actionError: string | null;
  actionSuccess: string | null;
}

const initialState: DashboardState = {
  subscription: null,
  loading: false,
  error: null,
  updatingAddress: false,
  updatingContact: false,
  upgradingPlan: false,
  cancelling: false,
  openingPortal: false,
  actionError: null,
  actionSuccess: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchMySubscription = createAsyncThunk(
  "dashboard/fetchMySubscription",
  async (_, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).auth;
    try {
      const { data } = await axios.get("/api/user/subscription", {
        headers: authHeaders(sessionToken),
      });
      return data.subscription as UserSubscriptionDetail | null;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al cargar la suscripción",
      );
    }
  },
);

export const updateShippingAddress = createAsyncThunk(
  "dashboard/updateShippingAddress",
  async (payload: UpdateAddressRequest, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).auth;
    try {
      const { data } = await axios.put(
        "/api/user/subscription/address",
        payload,
        { headers: authHeaders(sessionToken) },
      );
      return data.message as string;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al actualizar dirección",
      );
    }
  },
);

export const updateDeliveryContact = createAsyncThunk(
  "dashboard/updateDeliveryContact",
  async (
    payload: UpdateDeliveryContactRequest,
    { getState, rejectWithValue },
  ) => {
    const { sessionToken } = (getState() as RootState).auth;
    try {
      const { data } = await axios.put(
        "/api/user/subscription/contact",
        payload,
        { headers: authHeaders(sessionToken) },
      );
      return data.message as string;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al actualizar contacto",
      );
    }
  },
);

export const upgradeSubscriptionPlan = createAsyncThunk(
  "dashboard/upgradeSubscriptionPlan",
  async (payload: UpgradePlanRequest, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).auth;
    try {
      const { data } = await axios.put("/api/user/subscription/plan", payload, {
        headers: authHeaders(sessionToken),
      });
      return data.message as string;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al cambiar plan",
      );
    }
  },
);

export const cancelSubscription = createAsyncThunk(
  "dashboard/cancelSubscription",
  async (payload: CancelSubscriptionRequest, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).auth;
    try {
      const { data } = await axios.post(
        "/api/user/subscription/cancel",
        payload,
        { headers: authHeaders(sessionToken) },
      );
      return data as {
        message: string;
        cancelAtPeriodEnd: boolean;
        currentPeriodEnd?: string;
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al cancelar suscripción",
      );
    }
  },
);

export const openBillingPortal = createAsyncThunk(
  "dashboard/openBillingPortal",
  async (_, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).auth;
    try {
      const { data } = await axios.post(
        "/api/user/billing-portal",
        {},
        { headers: authHeaders(sessionToken) },
      );
      return data.url as string;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al abrir portal de pagos",
      );
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearActionState(state) {
      state.actionError = null;
      state.actionSuccess = null;
    },
  },
  extraReducers: (builder) => {
    // fetchMySubscription
    builder
      .addCase(fetchMySubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(fetchMySubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateShippingAddress
    builder
      .addCase(updateShippingAddress.pending, (state) => {
        state.updatingAddress = true;
        state.actionError = null;
      })
      .addCase(updateShippingAddress.fulfilled, (state, action) => {
        state.updatingAddress = false;
        state.actionSuccess = action.payload;
      })
      .addCase(updateShippingAddress.rejected, (state, action) => {
        state.updatingAddress = false;
        state.actionError = action.payload as string;
      });

    // updateDeliveryContact
    builder
      .addCase(updateDeliveryContact.pending, (state) => {
        state.updatingContact = true;
        state.actionError = null;
      })
      .addCase(updateDeliveryContact.fulfilled, (state, action) => {
        state.updatingContact = false;
        state.actionSuccess = action.payload;
      })
      .addCase(updateDeliveryContact.rejected, (state, action) => {
        state.updatingContact = false;
        state.actionError = action.payload as string;
      });

    // upgradeSubscriptionPlan
    builder
      .addCase(upgradeSubscriptionPlan.pending, (state) => {
        state.upgradingPlan = true;
        state.actionError = null;
      })
      .addCase(upgradeSubscriptionPlan.fulfilled, (state, action) => {
        state.upgradingPlan = false;
        state.actionSuccess = action.payload;
      })
      .addCase(upgradeSubscriptionPlan.rejected, (state, action) => {
        state.upgradingPlan = false;
        state.actionError = action.payload as string;
      });

    // cancelSubscription
    builder
      .addCase(cancelSubscription.pending, (state) => {
        state.cancelling = true;
        state.actionError = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.cancelling = false;
        state.actionSuccess = action.payload.message;
        if (state.subscription) {
          state.subscription.cancelAtPeriodEnd =
            action.payload.cancelAtPeriodEnd;
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.cancelling = false;
        state.actionError = action.payload as string;
      });

    // openBillingPortal — redirect is handled in component
    builder
      .addCase(openBillingPortal.pending, (state) => {
        state.openingPortal = true;
        state.actionError = null;
      })
      .addCase(openBillingPortal.fulfilled, (state) => {
        state.openingPortal = false;
      })
      .addCase(openBillingPortal.rejected, (state, action) => {
        state.openingPortal = false;
        state.actionError = action.payload as string;
      });
  },
});

export const { clearActionState } = dashboardSlice.actions;
export default dashboardSlice.reducer;
