import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  email_verified: boolean;
  stripe_customer_id?: string;
}

interface AuthState {
  user: User | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  // Email verification flow
  emailSent: boolean;
  emailForVerification: string | null;
  verificationLoading: boolean;
  verificationError: string | null;
  // Registration
  registrationRequired: boolean;
  registrationLoading: boolean;
  registrationError: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  sessionToken: localStorage.getItem("sessionToken"),
  isAuthenticated: false,
  loading: false,
  error: null,
  emailSent: false,
  emailForVerification: null,
  verificationLoading: false,
  verificationError: null,
  registrationRequired: false,
  registrationLoading: false,
  registrationError: null,
};

// Async thunks

/**
 * Send verification code to email
 */
export const sendVerificationCode = createAsyncThunk(
  "auth/sendVerificationCode",
  async (email: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/auth/send-code", { email });
      return { email, ...data };
    } catch (error: any) {
      // Check if user doesn't exist
      if (error.response?.status === 404) {
        return rejectWithValue({ userNotFound: true, email });
      }
      return rejectWithValue(
        error.response?.data?.error || "Failed to send verification code",
      );
    }
  },
);

/**
 * Verify code and login user
 */
export const verifyCode = createAsyncThunk(
  "auth/verifyCode",
  async (
    { email, code }: { email: string; code: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.post("/api/auth/verify-code", {
        email,
        code,
      });

      // Store session token in localStorage
      localStorage.setItem("sessionToken", data.sessionToken);

      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Invalid verification code",
      );
    }
  },
);

/**
 * Register new user and send verification code
 */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    {
      email,
      fullName,
      phone,
    }: { email: string; fullName: string; phone: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.post("/api/auth/register", {
        email,
        full_name: fullName,
        phone,
      });
      return { email, ...data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to register user",
      );
    }
  },
);

/**
 * Validate existing session token
 */
export const validateSession = createAsyncThunk(
  "auth/validateSession",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.sessionToken;

      if (!token) {
        return rejectWithValue("No session token");
      }

      const { data } = await axios.get("/api/auth/validate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data.user;
    } catch (error: any) {
      // Clear invalid token
      localStorage.removeItem("sessionToken");
      return rejectWithValue(error.response?.data?.error || "Session invalid");
    }
  },
);

/**
 * Logout user
 */
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.sessionToken;

    if (token) {
      try {
        await axios.post(
          "/api/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (error) {
        // Ignore logout errors
      }
    }

    localStorage.removeItem("sessionToken");
  },
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.verificationError = null;
      state.registrationError = null;
    },
    resetVerification: (state) => {
      state.emailSent = false;
      state.emailForVerification = null;
      state.verificationError = null;
    },
    resetRegistration: (state) => {
      state.registrationRequired = false;
      state.registrationError = null;
    },
  },
  extraReducers: (builder) => {
    // Send verification code
    builder
      .addCase(sendVerificationCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendVerificationCode.fulfilled, (state, action) => {
        state.loading = false;
        state.emailSent = true;
        state.emailForVerification = action.payload.email;
      })
      .addCase(sendVerificationCode.rejected, (state, action: any) => {
        state.loading = false;
        // Check if user not found
        if (action.payload?.userNotFound) {
          state.registrationRequired = true;
          state.emailForVerification = action.payload.email;
        } else {
          state.error = action.payload as string;
        }
      });

    // Verify code
    builder
      .addCase(verifyCode.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(verifyCode.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.user = action.payload.user;
        state.sessionToken = action.payload.sessionToken;
        state.isAuthenticated = true;
        state.emailSent = false;
        state.emailForVerification = null;
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload as string;
      });

    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.registrationLoading = true;
        state.registrationError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registrationLoading = false;
        state.registrationRequired = false;
        state.emailSent = true;
        state.emailForVerification = action.payload.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registrationLoading = false;
        state.registrationError = action.payload as string;
      });

    // Validate session
    builder
      .addCase(validateSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(validateSession.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.sessionToken = null;
        state.user = null;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.sessionToken = null;
      state.isAuthenticated = false;
      state.emailSent = false;
      state.emailForVerification = null;
    });
  },
});

// Actions
export const { clearAuthError, resetVerification, resetRegistration } =
  authSlice.actions;

// Selectors
export const selectUser = (state: any) => state.auth.user;
export const selectSessionToken = (state: any) => state.auth.sessionToken;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: any) => state.auth.loading;
export const selectAuthError = (state: any) => state.auth.error;
export const selectEmailSent = (state: any) => state.auth.emailSent;
export const selectEmailForVerification = (state: any) =>
  state.auth.emailForVerification;
export const selectVerificationLoading = (state: any) =>
  state.auth.verificationLoading;
export const selectVerificationError = (state: any) =>
  state.auth.verificationError;
export const selectRegistrationRequired = (state: any) =>
  state.auth.registrationRequired;
export const selectRegistrationLoading = (state: any) =>
  state.auth.registrationLoading;
export const selectRegistrationError = (state: any) =>
  state.auth.registrationError;

export default authSlice.reducer;
