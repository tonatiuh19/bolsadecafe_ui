import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";
import type { RootState } from "@/store/store";
import type {
  AdminBlogPost,
  AdminBlogCategory,
  AdminBlogPostsResponse,
  AdminBlogPostResponse,
  AdminBlogCategoriesResponse,
  AdminCreateBlogPostRequest,
  AdminUpdateBlogPostRequest,
} from "@shared/api";

interface AdminBlogState {
  posts: AdminBlogPost[];
  current: AdminBlogPost | null;
  categories: AdminBlogCategory[];
  loading: boolean;
  contentLoading: boolean;
  categoriesLoading: boolean;
  error: string | null;
  actionLoading: boolean;
  actionError: string | null;
  actionSuccess: string | null;
}

const initialState: AdminBlogState = {
  posts: [],
  current: null,
  categories: [],
  loading: false,
  contentLoading: false,
  categoriesLoading: false,
  error: null,
  actionLoading: false,
  actionError: null,
  actionSuccess: null,
};

function adminHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const fetchAdminBlogPosts = createAsyncThunk(
  "adminBlog/fetchPosts",
  async (status: string | undefined, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const params = status ? { status } : {};
      const { data } = await axios.get<AdminBlogPostsResponse>(
        "/admin/blog/posts",
        { headers: adminHeaders(sessionToken), params },
      );
      return data.posts;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al cargar los posts",
      );
    }
  },
);

export const fetchAdminBlogPost = createAsyncThunk(
  "adminBlog/fetchPost",
  async (id: number, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.get<AdminBlogPostResponse>(
        `/admin/blog/posts/${id}`,
        { headers: adminHeaders(sessionToken) },
      );
      return data.post;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al cargar el post",
      );
    }
  },
);

export const fetchAdminBlogCategories = createAsyncThunk(
  "adminBlog/fetchCategories",
  async (_, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.get<AdminBlogCategoriesResponse>(
        "/admin/blog/categories",
        { headers: adminHeaders(sessionToken) },
      );
      return data.categories;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al cargar las categorías",
      );
    }
  },
);

export const createAdminBlogPost = createAsyncThunk(
  "adminBlog/create",
  async (
    payload: AdminCreateBlogPostRequest,
    { getState, rejectWithValue },
  ) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.post<AdminBlogPostResponse>(
        "/admin/blog/posts",
        payload,
        { headers: adminHeaders(sessionToken) },
      );
      return data.post;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al crear el post",
      );
    }
  },
);

export const updateAdminBlogPost = createAsyncThunk(
  "adminBlog/update",
  async (
    payload: AdminUpdateBlogPostRequest,
    { getState, rejectWithValue },
  ) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      const { data } = await axios.put<AdminBlogPostResponse>(
        `/admin/blog/posts/${payload.id}`,
        payload,
        { headers: adminHeaders(sessionToken) },
      );
      return data.post;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al actualizar el post",
      );
    }
  },
);

export const deleteAdminBlogPost = createAsyncThunk(
  "adminBlog/delete",
  async (id: number, { getState, rejectWithValue }) => {
    const { sessionToken } = (getState() as RootState).adminAuth;
    try {
      await axios.delete(`/admin/blog/posts/${id}`, {
        headers: adminHeaders(sessionToken),
      });
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al archivar el post",
      );
    }
  },
);

const adminBlogSlice = createSlice({
  name: "adminBlog",
  initialState,
  reducers: {
    clearAdminBlogActionState(state) {
      state.actionError = null;
      state.actionSuccess = null;
    },
    clearAdminBlogCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch posts list
    builder
      .addCase(fetchAdminBlogPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBlogPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchAdminBlogPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single post
    builder
      .addCase(fetchAdminBlogPost.pending, (state) => {
        state.contentLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminBlogPost.fulfilled, (state, action) => {
        state.contentLoading = false;
        state.current = action.payload;
      })
      .addCase(fetchAdminBlogPost.rejected, (state, action) => {
        state.contentLoading = false;
        state.error = action.payload as string;
      });

    // Fetch categories
    builder
      .addCase(fetchAdminBlogCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchAdminBlogCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAdminBlogCategories.rejected, (state) => {
        state.categoriesLoading = false;
      });

    // Create
    builder
      .addCase(createAdminBlogPost.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(createAdminBlogPost.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = `Post "${action.payload.title}" creado exitosamente`;
        state.posts.unshift(action.payload);
        state.current = action.payload;
      })
      .addCase(createAdminBlogPost.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      });

    // Update
    builder
      .addCase(updateAdminBlogPost.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(updateAdminBlogPost.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = "Post actualizado exitosamente";
        state.current = action.payload;
        const idx = state.posts.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.posts[idx] = action.payload;
      })
      .addCase(updateAdminBlogPost.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      });

    // Delete (archive)
    builder
      .addCase(deleteAdminBlogPost.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteAdminBlogPost.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = "Post archivado correctamente";
        const idx = state.posts.findIndex((p) => p.id === action.payload);
        if (idx !== -1) state.posts[idx].status = "archived";
      })
      .addCase(deleteAdminBlogPost.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload as string;
      });
  },
});

export const { clearAdminBlogActionState, clearAdminBlogCurrent } =
  adminBlogSlice.actions;
export default adminBlogSlice.reducer;
