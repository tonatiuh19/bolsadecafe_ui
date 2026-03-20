import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";
import type { AdminUser, AdminLoginResponse } from "@shared/api";

interface AdminAuthState {
  admin: AdminUser | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  // OTP step
  emailSent: boolean;
  emailForVerification: string | null;
  verificationLoading: boolean;
  verificationError: string | null;
  // Shared loading/error
  loading: boolean;
  error: string | null;
}

const initialState: AdminAuthState = {
  admin: null,
  sessionToken: localStorage.getItem("adminSessionToken"),
  isAuthenticated: false,
  emailSent: false,
  emailForVerification: null,
  verificationLoading: false,
  verificationError: null,
  loading: false,
  error: null,
};

export const sendAdminCode = createAsyncThunk(
  "adminAuth/sendCode",
  async (email: string, { rejectWithValue }) => {
    try {
      await axios.post("/admin/auth/send-code", { email });
      return { email };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Error al enviar el código",
      );
    }
  },
);

export const verifyAdminCode = createAsyncThunk(
  "adminAuth/verifyCode",
  async (
    { email, code }: { email: string; code: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.post<AdminLoginResponse>(
        "/admin/auth/verify-code",
        { email, code },
      );
      localStorage.setItem("adminSessionToken", data.sessionToken);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Código inválido o expirado",
      );
    }
  },
);

export const validateAdminSession = createAsyncThunk(
  "adminAuth/validateSession",
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as { adminAuth: AdminAuthState };
    const token = state.adminAuth.sessionToken;
    if (!token) return rejectWithValue("No session token");

    try {
      const { data } = await axios.get("/admin/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.admin as AdminUser;
    } catch (error: any) {
      localStorage.removeItem("adminSessionToken");
      return rejectWithValue(error.response?.data?.error || "Session invalid");
    }
  },
);

export const adminLogout = createAsyncThunk(
  "adminAuth/logout",
  async (_, { getState }) => {
    const state = getState() as { adminAuth: AdminAuthState };
    const token = state.adminAuth.sessionToken;
    if (token) {
      try {
        await axios.post(
          "/admin/auth/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch {
        // ignore
      }
    }
    localStorage.removeItem("adminSessionToken");
  },
);

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
      state.verificationError = null;
    },
    resetAdminOtp(state) {
      state.emailSent = false;
      state.emailForVerification = null;
      state.verificationError = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // sendAdminCode
      .addCase(sendAdminCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendAdminCode.fulfilled, (state, action) => {
        state.loading = false;
        state.emailSent = true;
        state.emailForVerification = action.payload.email;
      })
      .addCase(sendAdminCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // verifyAdminCode
      .addCase(verifyAdminCode.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(verifyAdminCode.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.admin = action.payload.admin;
        state.sessionToken = action.payload.sessionToken;
        state.isAuthenticated = true;
        state.emailSent = false;
        state.emailForVerification = null;
      })
      .addCase(verifyAdminCode.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload as string;
      })
      // validateSession
      .addCase(validateAdminSession.fulfilled, (state, action) => {
        state.admin = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(validateAdminSession.rejected, (state) => {
        state.admin = null;
        state.sessionToken = null;
        state.isAuthenticated = false;
      })
      // logout
      .addCase(adminLogout.fulfilled, (state) => {
        state.admin = null;
        state.sessionToken = null;
        state.isAuthenticated = false;
        state.emailSent = false;
        state.emailForVerification = null;
      });
  },
});

export const { clearAdminError, resetAdminOtp } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
