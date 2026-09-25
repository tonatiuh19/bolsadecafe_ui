import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";
import type { ShippingCountry } from "@shared/pricing";

export interface RegionState {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/** @deprecated Use RegionState */
export type MexicoState = RegionState;

interface StatesState {
  states: RegionState[];
  country: ShippingCountry;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: StatesState = {
  states: [],
  country: "MX",
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchStates = createAsyncThunk(
  "states/fetchStates",
  async (country: ShippingCountry | undefined, { rejectWithValue }) => {
    const resolved = country || "MX";
    try {
      const { data } = await axios.get<{
        country: ShippingCountry;
        states: RegionState[];
      }>("/states", { params: { country: resolved } });
      return { country: data.country || resolved, states: data.states };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch states",
      );
    }
  },
);

const statesSlice = createSlice({
  name: "states",
  initialState,
  reducers: {
    clearStatesError: (state) => {
      state.error = null;
    },
    setStates: (state, action: { payload: RegionState[] }) => {
      state.states = action.payload;
      state.loading = false;
      state.lastFetched = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload.states;
        state.country = action.payload.country;
        state.lastFetched = Date.now();
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearStatesError, setStates } = statesSlice.actions;

export const selectStates = (state: any) => state.states.states;
export const selectStatesLoading = (state: any) => state.states.loading;
export const selectStatesError = (state: any) => state.states.error;
export const selectStatesCountry = (state: any) => state.states.country;
export const selectStateByCode = (state: any, code: string) =>
  state.states.states.find((s: RegionState) => s.code === code);

export default statesSlice.reducer;
