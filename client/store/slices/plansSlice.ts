import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";

// Types
export interface SubscriptionPlan {
  id: number;
  plan_id: string;
  name: string;
  description: string;
  price: number;
  price_mxn: string;
  weight: string;
  is_active: boolean;
  requires_contact?: boolean;
  stripe_price_id?: string;
  stripe_price_id_test?: string;
  stripe_price_id_prod?: string;
  features?: string[];
  created_at?: string;
  updated_at?: string;
}

interface PlansState {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Initial state
const initialState: PlansState = {
  plans: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunks
export const fetchPlans = createAsyncThunk(
  "plans/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<{ plans: SubscriptionPlan[] }>("/plans");
      return data.plans;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch plans",
      );
    }
  },
);

// Slice
const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    clearPlansError: (state) => {
      state.error = null;
    },
    setPlans: (state, action: { payload: SubscriptionPlan[] }) => {
      state.plans = action.payload;
      state.loading = false;
      state.lastFetched = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearPlansError, setPlans } = plansSlice.actions;

// Selectors
export const selectPlans = (state: any) => state.plans.plans;
export const selectPlansLoading = (state: any) => state.plans.loading;
export const selectPlansError = (state: any) => state.plans.error;
export const selectPlanById = (state: any, planId: number) =>
  state.plans.plans.find((plan: SubscriptionPlan) => plan.id === planId);

export default plansSlice.reducer;
