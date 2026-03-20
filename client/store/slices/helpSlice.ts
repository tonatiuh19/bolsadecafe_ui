import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";
import type { SubmitContactRequest, SubmitContactResponse } from "@shared/api";

interface HelpState {
  submitting: boolean;
  submitted: boolean;
  submissionId: number | null;
  error: string | null;
}

const initialState: HelpState = {
  submitting: false,
  submitted: false,
  submissionId: null,
  error: null,
};

export const submitContact = createAsyncThunk(
  "help/submitContact",
  async (payload: SubmitContactRequest, { rejectWithValue }) => {
    try {
      const { data } = await axios.post<SubmitContactResponse>(
        "/help/contact",
        payload,
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al enviar el mensaje",
      );
    }
  },
);

const helpSlice = createSlice({
  name: "help",
  initialState,
  reducers: {
    resetContactForm(state) {
      state.submitting = false;
      state.submitted = false;
      state.submissionId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitContact.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitContact.fulfilled, (state, action) => {
        state.submitting = false;
        state.submitted = true;
        state.submissionId = action.payload.submissionId;
      })
      .addCase(submitContact.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetContactForm } = helpSlice.actions;
export default helpSlice.reducer;
