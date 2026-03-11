import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";
import type { RootState } from "../index";

interface PaymentState {
  clientSecret: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  clientSecret: null,
  loading: false,
  error: null,
};

// Async thunk to create payment intent
export const createPaymentIntent = createAsyncThunk(
  "payments/createPaymentIntent",
  async (
    { planId, address }: { planId: string; address: any },
    { getState },
  ) => {
    const state = getState() as RootState;
    const sessionToken = state.auth.sessionToken;

    if (!sessionToken) {
      throw new Error("No session token available");
    }

    const { data } = await axios.post(
      "/create-payment-intent",
      { planId, address },
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      },
    );
    return data.clientSecret;
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
  },
});

export const { clearPaymentState } = paymentsSlice.actions;

// Selectors
export const selectClientSecret = (state: RootState) =>
  state.payments.clientSecret;
export const selectPaymentLoading = (state: RootState) =>
  state.payments.loading;
export const selectPaymentError = (state: RootState) => state.payments.error;

export default paymentsSlice.reducer;
