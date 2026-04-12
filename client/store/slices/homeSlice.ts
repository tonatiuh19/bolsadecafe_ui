import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";
import type { SubscriptionPlan } from "./plansSlice";
import type { GrindType } from "./grindTypesSlice";
import type { MexicoState } from "./statesSlice";
import type { User } from "./authSlice";
import { setPlans } from "./plansSlice";
import { setGrindTypes } from "./grindTypesSlice";
import { setStates } from "./statesSlice";
import { setUserFromHome } from "./authSlice";
import { setBlogPostsFromHome } from "./blogSlice";
import type { RootState } from "../store";

/** Raw API response shape from GET /api/home */
interface HomeApiResponse {
  plans: SubscriptionPlan[];
  grindTypes: GrindType[];
  states: MexicoState[];
  blogPosts: any[];
  user: User | null;
}

// ─── Session ID (persisted in sessionStorage) ────────────────────────────────

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem("bdc_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("bdc_session_id", id);
  }
  return id;
}

// ─── State ───────────────────────────────────────────────────────────────────

interface HomeState {
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

const initialState: HomeState = {
  loading: false,
  error: null,
  loaded: false,
};

// ─── Thunks ──────────────────────────────────────────────────────────────────

/**
 * GET /api/home
 * Replaces separate fetchPlans + validateSession + fetchGrindTypes + fetchStates
 * with a single request. Hydrates each individual slice after success.
 */
export const fetchHome = createAsyncThunk(
  "home/fetchHome",
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const token = state.auth.sessionToken;

    const { data } = await axios.get<HomeApiResponse>("/home", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    // Hydrate individual slices so existing selectors keep working
    dispatch(setPlans(data.plans));
    dispatch(setGrindTypes(data.grindTypes));
    dispatch(setStates(data.states));
    dispatch(setUserFromHome(data.user ?? null));
    if (data.blogPosts?.length) {
      dispatch(setBlogPostsFromHome(data.blogPosts));
    }

    return data;
  },
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHome.fulfilled, (state) => {
        state.loading = false;
        state.loaded = true;
      })
      .addCase(fetchHome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load home data";
      });
  },
});

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectHomeLoading = (state: RootState) => state.home.loading;
export const selectHomeLoaded = (state: RootState) => state.home.loaded;
export const selectHomeError = (state: RootState) => state.home.error;

export default homeSlice.reducer;
