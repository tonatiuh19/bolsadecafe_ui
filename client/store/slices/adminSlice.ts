import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/lib/axios";
import type { RootState } from "@/store/store";
import type {
  AdminDashboardMetrics,
  AdminOrder,
  AdminClient,
  AdminUser,
  MoveOrderToShippingRequest,
  MoveOrderToDeliveredRequest,
  AdminUpdateSettingsRequest,
  AdminPerson,
  CreateAdminPersonRequest,
  UpdateAdminPersonRequest,
  AdminSubscription,
  AdminUpdateSubscriptionRequest,
} from "@shared/api";

interface AdminState {
  // Dashboard
  metrics: AdminDashboardMetrics | null;
  metricsLoading: boolean;
  metricsError: string | null;
  // Orders pipeline
  orders: AdminOrder[];
  ordersLoading: boolean;
  ordersError: string | null;
  // Clients
  clients: AdminClient[];
  clientsLoading: boolean;
  clientsError: string | null;
  // Settings
  settingsLoading: boolean;
  settingsError: string | null;
  settingsSuccess: string | null;
  // People management
  people: AdminPerson[];
  peopleLoading: boolean;
  peopleError: string | null;
  peopleActionLoading: boolean;
  peopleActionError: string | null;
  peopleActionSuccess: string | null;
  // Subscriptions management
  subscriptions: AdminSubscription[];
  subscriptionsLoading: boolean;
  subscriptionsError: string | null;
  subscriptionActionLoading: boolean;
  subscriptionActionError: string | null;
  subscriptionActionSuccess: string | null;
  // Action state (moving orders, etc.)
  actionLoading: boolean;
  actionError: string | null;
  actionSuccess: string | null;
}

const initialState: AdminState = {
  metrics: null,
  metricsLoading: false,
  metricsError: null,
  orders: [],
  ordersLoading: false,
  ordersError: null,
  clients: [],
  clientsLoading: false,
  clientsError: null,
  settingsLoading: false,
  settingsError: null,
  settingsSuccess: null,
  people: [],
  peopleLoading: false,
  peopleError: null,
  peopleActionLoading: false,
  peopleActionError: null,
  peopleActionSuccess: null,
  subscriptions: [],
  subscriptionsLoading: false,
  subscriptionsError: null,
  subscriptionActionLoading: false,
  subscriptionActionError: null,
  subscriptionActionSuccess: null,
  actionLoading: false,
  actionError: null,
  actionSuccess: null,
};

function adminHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const fetchAdminDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.get("/admin/dashboard", {
        headers: adminHeaders(sessionToken),
      });
      return data as AdminDashboardMetrics;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al cargar métricas",
      );
    }
  },
);

export const fetchAdminOrders = createAsyncThunk(
  "admin/fetchOrders",
  async (_, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.get("/admin/orders", {
        headers: adminHeaders(sessionToken),
      });
      return data.orders as AdminOrder[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al cargar órdenes",
      );
    }
  },
);

export const moveOrderToShipping = createAsyncThunk(
  "admin/moveOrderToShipping",
  async (
    payload: MoveOrderToShippingRequest,
    { getState, rejectWithValue },
  ) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.put(
        `/admin/orders/${payload.orderId}/ship`,
        payload,
        { headers: adminHeaders(sessionToken) },
      );
      return data.order as AdminOrder;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al actualizar orden",
      );
    }
  },
);

export const moveOrderToDelivered = createAsyncThunk(
  "admin/moveOrderToDelivered",
  async (
    payload: MoveOrderToDeliveredRequest,
    { getState, rejectWithValue },
  ) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.put(
        `/admin/orders/${payload.orderId}/deliver`,
        payload,
        { headers: adminHeaders(sessionToken) },
      );
      return data.order as AdminOrder;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al actualizar orden",
      );
    }
  },
);

export const fetchAdminClients = createAsyncThunk(
  "admin/fetchClients",
  async (_, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.get("/admin/clients", {
        headers: adminHeaders(sessionToken),
      });
      return data.clients as AdminClient[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al cargar clientes",
      );
    }
  },
);

export const updateAdminSettings = createAsyncThunk(
  "admin/updateSettings",
  async (
    payload: AdminUpdateSettingsRequest,
    { getState, rejectWithValue },
  ) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.put("/admin/settings", payload, {
        headers: adminHeaders(sessionToken),
      });
      return data.admin as AdminUser;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al guardar configuración",
      );
    }
  },
);

export const fetchAdminPeople = createAsyncThunk(
  "admin/fetchPeople",
  async (_, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.get("/admin/people", {
        headers: adminHeaders(sessionToken),
      });
      return data.people as AdminPerson[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al obtener el equipo",
      );
    }
  },
);

export const createAdminPerson = createAsyncThunk(
  "admin/createPerson",
  async (payload: CreateAdminPersonRequest, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.post("/admin/people", payload, {
        headers: adminHeaders(sessionToken),
      });
      return data.person as AdminPerson;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al crear el miembro",
      );
    }
  },
);

export const updateAdminPerson = createAsyncThunk(
  "admin/updatePerson",
  async (payload: UpdateAdminPersonRequest, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.put(`/admin/people/${payload.id}`, payload, {
        headers: adminHeaders(sessionToken),
      });
      return data.person as AdminPerson;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al actualizar el miembro",
      );
    }
  },
);

export const deactivateAdminPerson = createAsyncThunk(
  "admin/deactivatePerson",
  async (id: number, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      await axios.delete(`/admin/people/${id}`, {
        headers: adminHeaders(sessionToken),
      });
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al desactivar el miembro",
      );
    }
  },
);

export const fetchAdminSubscriptions = createAsyncThunk(
  "admin/fetchSubscriptions",
  async (_, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.get("/admin/subscriptions", {
        headers: adminHeaders(sessionToken),
      });
      return data.subscriptions as AdminSubscription[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al cargar suscripciones",
      );
    }
  },
);

export const adminUpdateSubscription = createAsyncThunk(
  "admin/updateSubscription",
  async (
    { id, payload }: { id: number; payload: AdminUpdateSubscriptionRequest },
    { getState, rejectWithValue },
  ) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.put(`/admin/subscriptions/${id}`, payload, {
        headers: adminHeaders(sessionToken),
      });
      return data.message as string;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al actualizar suscripción",
      );
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearActionState(state) {
      state.actionError = null;
      state.actionSuccess = null;
    },
    clearSettingsState(state) {
      state.settingsError = null;
      state.settingsSuccess = null;
    },
    clearPeopleActionState(state) {
      state.peopleActionError = null;
      state.peopleActionSuccess = null;
    },
    clearSubscriptionActionState(state) {
      state.subscriptionActionError = null;
      state.subscriptionActionSuccess = null;
    },
    // Optimistic update for drag & drop
    updateOrderStatusLocally(
      state,
      action: PayloadAction<{ orderId: number; status: AdminOrder["status"] }>,
    ) {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) order.status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.metricsLoading = true;
        state.metricsError = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.metricsLoading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.metricsLoading = false;
        state.metricsError = action.payload as string;
      });

    // Orders
    builder
      .addCase(fetchAdminOrders.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.ordersError = action.payload as string;
      });

    // Move to shipping
    builder
      .addCase(moveOrderToShipping.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(moveOrderToShipping.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = "Orden movida a Enviado";
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })
      .addCase(moveOrderToShipping.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      });

    // Move to delivered
    builder
      .addCase(moveOrderToDelivered.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(moveOrderToDelivered.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = "Orden marcada como Recibida";
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })
      .addCase(moveOrderToDelivered.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      });

    // Clients
    builder
      .addCase(fetchAdminClients.pending, (state) => {
        state.clientsLoading = true;
        state.clientsError = null;
      })
      .addCase(fetchAdminClients.fulfilled, (state, action) => {
        state.clientsLoading = false;
        state.clients = action.payload;
      })
      .addCase(fetchAdminClients.rejected, (state, action) => {
        state.clientsLoading = false;
        state.clientsError = action.payload as string;
      });

    // Settings
    builder
      .addCase(updateAdminSettings.pending, (state) => {
        state.settingsLoading = true;
        state.settingsError = null;
        state.settingsSuccess = null;
      })
      .addCase(updateAdminSettings.fulfilled, (state) => {
        state.settingsLoading = false;
        state.settingsSuccess = "Configuración guardada correctamente";
      })
      .addCase(updateAdminSettings.rejected, (state, action) => {
        state.settingsLoading = false;
        state.settingsError = action.payload as string;
      });

    // People
    builder
      .addCase(fetchAdminPeople.pending, (state) => {
        state.peopleLoading = true;
        state.peopleError = null;
      })
      .addCase(fetchAdminPeople.fulfilled, (state, action) => {
        state.peopleLoading = false;
        state.people = action.payload;
      })
      .addCase(fetchAdminPeople.rejected, (state, action) => {
        state.peopleLoading = false;
        state.peopleError = action.payload as string;
      });

    builder
      .addCase(createAdminPerson.pending, (state) => {
        state.peopleActionLoading = true;
        state.peopleActionError = null;
        state.peopleActionSuccess = null;
      })
      .addCase(createAdminPerson.fulfilled, (state, action) => {
        state.peopleActionLoading = false;
        state.peopleActionSuccess = "Miembro creado correctamente";
        state.people.push(action.payload);
      })
      .addCase(createAdminPerson.rejected, (state, action) => {
        state.peopleActionLoading = false;
        state.peopleActionError = action.payload as string;
      });

    builder
      .addCase(updateAdminPerson.pending, (state) => {
        state.peopleActionLoading = true;
        state.peopleActionError = null;
        state.peopleActionSuccess = null;
      })
      .addCase(updateAdminPerson.fulfilled, (state, action) => {
        state.peopleActionLoading = false;
        state.peopleActionSuccess = "Miembro actualizado correctamente";
        const idx = state.people.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.people[idx] = action.payload;
      })
      .addCase(updateAdminPerson.rejected, (state, action) => {
        state.peopleActionLoading = false;
        state.peopleActionError = action.payload as string;
      });

    builder
      .addCase(deactivateAdminPerson.pending, (state) => {
        state.peopleActionLoading = true;
        state.peopleActionError = null;
        state.peopleActionSuccess = null;
      })
      .addCase(deactivateAdminPerson.fulfilled, (state, action) => {
        state.peopleActionLoading = false;
        state.peopleActionSuccess = "Miembro desactivado correctamente";
        const idx = state.people.findIndex((p) => p.id === action.payload);
        if (idx !== -1) state.people[idx].is_active = false;
      })
      .addCase(deactivateAdminPerson.rejected, (state, action) => {
        state.peopleActionLoading = false;
        state.peopleActionError = action.payload as string;
      });

    // fetchAdminSubscriptions
    builder
      .addCase(fetchAdminSubscriptions.pending, (state) => {
        state.subscriptionsLoading = true;
        state.subscriptionsError = null;
      })
      .addCase(fetchAdminSubscriptions.fulfilled, (state, action) => {
        state.subscriptionsLoading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchAdminSubscriptions.rejected, (state, action) => {
        state.subscriptionsLoading = false;
        state.subscriptionsError = action.payload as string;
      });

    // adminUpdateSubscription
    builder
      .addCase(adminUpdateSubscription.pending, (state) => {
        state.subscriptionActionLoading = true;
        state.subscriptionActionError = null;
        state.subscriptionActionSuccess = null;
      })
      .addCase(adminUpdateSubscription.fulfilled, (state, action) => {
        state.subscriptionActionLoading = false;
        state.subscriptionActionSuccess = action.payload;
      })
      .addCase(adminUpdateSubscription.rejected, (state, action) => {
        state.subscriptionActionLoading = false;
        state.subscriptionActionError = action.payload as string;
      });
  },
});

export const {
  clearActionState,
  clearSettingsState,
  clearPeopleActionState,
  clearSubscriptionActionState,
  updateOrderStatusLocally,
} = adminSlice.actions;
export default adminSlice.reducer;
