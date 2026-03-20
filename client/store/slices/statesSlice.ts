import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";

// Types
export interface MexicoState {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface StatesState {
  states: MexicoState[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Initial state
const initialState: StatesState = {
  states: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunks
export const fetchStates = createAsyncThunk(
  "states/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<{ states: MexicoState[] }>("/states");
      return data.states;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch states",
      );
    }
  },
);

// Slice
const statesSlice = createSlice({
  name: "states",
  initialState,
  reducers: {
    clearStatesError: (state) => {
      state.error = null;
    },
    setStates: (state, action: { payload: MexicoState[] }) => {
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
        state.states = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearStatesError, setStates } = statesSlice.actions;

// Selectors
export const selectStates = (state: any) => state.states.states;
export const selectStatesLoading = (state: any) => state.states.loading;
export const selectStatesError = (state: any) => state.states.error;
export const selectStateByCode = (state: any, code: string) =>
  state.states.states.find((s: MexicoState) => s.code === code);

export default statesSlice.reducer;
