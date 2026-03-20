import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";

// Types
export interface GrindType {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

interface GrindTypesState {
  grindTypes: GrindType[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Initial state
const initialState: GrindTypesState = {
  grindTypes: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunks
export const fetchGrindTypes = createAsyncThunk(
  "grindTypes/fetchGrindTypes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<{ grindTypes: GrindType[] }>(
        "/grind-types",
      );
      return data.grindTypes;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch grind types",
      );
    }
  },
);

// Slice
const grindTypesSlice = createSlice({
  name: "grindTypes",
  initialState,
  reducers: {
    clearGrindTypesError: (state) => {
      state.error = null;
    },
    setGrindTypes: (state, action: { payload: GrindType[] }) => {
      state.grindTypes = action.payload;
      state.loading = false;
      state.lastFetched = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGrindTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGrindTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.grindTypes = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchGrindTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearGrindTypesError, setGrindTypes } = grindTypesSlice.actions;

// Selectors
export const selectGrindTypes = (state: any) => state.grindTypes.grindTypes;
export const selectGrindTypesLoading = (state: any) => state.grindTypes.loading;
export const selectGrindTypesError = (state: any) => state.grindTypes.error;
export const selectGrindTypeByCode = (state: any, code: string) =>
  state.grindTypes.grindTypes.find((type: GrindType) => type.code === code);

export default grindTypesSlice.reducer;
