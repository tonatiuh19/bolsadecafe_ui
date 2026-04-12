import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/lib/axios";
import type { RootState } from "@/store/store";
import type {
  CoffeeCatalog,
  CoffeeCatalogListResponse,
  CoffeeCatalogResponse,
  CreateCoffeeCatalogRequest,
  UpdateCoffeeCatalogRequest,
} from "@shared/api";

interface CoffeeCatalogState {
  items: CoffeeCatalog[];
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
  actionError: string | null;
  actionSuccess: string | null;
}

const initialState: CoffeeCatalogState = {
  items: [],
  loading: false,
  error: null,
  actionLoading: false,
  actionError: null,
  actionSuccess: null,
};

function adminHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const fetchCoffeeCatalog = createAsyncThunk(
  "coffeeCatalog/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.get<CoffeeCatalogListResponse>(
        "/admin/coffee-catalog",
        { headers: adminHeaders(sessionToken) },
      );
      return data.coffees;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al cargar catálogo de café",
      );
    }
  },
);

export const createCoffee = createAsyncThunk(
  "coffeeCatalog/create",
  async (
    payload: CreateCoffeeCatalogRequest,
    { getState, rejectWithValue },
  ) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.post<CoffeeCatalogResponse>(
        "/admin/coffee-catalog",
        payload,
        { headers: adminHeaders(sessionToken) },
      );
      return data.coffee;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al crear el café",
      );
    }
  },
);

export const updateCoffee = createAsyncThunk(
  "coffeeCatalog/update",
  async (
    payload: UpdateCoffeeCatalogRequest,
    { getState, rejectWithValue },
  ) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.put<CoffeeCatalogResponse>(
        `/admin/coffee-catalog/${payload.id}`,
        payload,
        { headers: adminHeaders(sessionToken) },
      );
      return data.coffee;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al actualizar el café",
      );
    }
  },
);

export const deleteCoffee = createAsyncThunk(
  "coffeeCatalog/delete",
  async (id: number, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      await axios.delete(`/admin/coffee-catalog/${id}`, {
        headers: adminHeaders(sessionToken),
      });
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al desactivar el café",
      );
    }
  },
);

const coffeeCatalogSlice = createSlice({
  name: "coffeeCatalog",
  initialState,
  reducers: {
    clearCoffeeActionState(state) {
      state.actionError = null;
      state.actionSuccess = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchCoffeeCatalog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoffeeCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCoffeeCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createCoffee.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(createCoffee.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = `Café "${action.payload.name}" creado exitosamente`;
        state.items.unshift(action.payload);
      })
      .addCase(createCoffee.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      });

    // Update
    builder
      .addCase(updateCoffee.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(updateCoffee.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = `Café "${action.payload.name}" actualizado`;
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateCoffee.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      });

    // Delete
    builder
      .addCase(deleteCoffee.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(deleteCoffee.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = "Café desactivado correctamente";
        const idx = state.items.findIndex((c) => c.id === action.payload);
        if (idx !== -1) state.items[idx].isActive = false;
      })
      .addCase(deleteCoffee.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      });
  },
});

export const { clearCoffeeActionState } = coffeeCatalogSlice.actions;
export default coffeeCatalogSlice.reducer;
