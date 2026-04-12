import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";

// Raw snake_case type from API (public endpoint uses select *)
export interface PublicBlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_id: number;
  author_name?: string;
  author_email?: string;
  category_id?: number;
  category_name?: string;
  status: string;
  published_at?: string;
  views: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

interface BlogState {
  posts: PublicBlogPost[];
  current: PublicBlogPost | null;
  total: number;
  page: number;
  perPage: number;
  loading: boolean;
  postLoading: boolean;
  error: string | null;
}

const initialState: BlogState = {
  posts: [],
  current: null,
  total: 0,
  page: 1,
  perPage: 9,
  loading: false,
  postLoading: false,
  error: null,
};

export const fetchBlogPosts = createAsyncThunk(
  "blog/fetchPosts",
  async (
    params: { page?: number; perPage?: number } | undefined,
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.get("/blog/posts", {
        params: { page: params?.page ?? 1, perPage: params?.perPage ?? 9 },
      });
      return data as {
        posts: PublicBlogPost[];
        total: number;
        page: number;
        perPage: number;
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error al cargar el blog",
      );
    }
  },
);

export const fetchBlogPost = createAsyncThunk(
  "blog/fetchPost",
  async (slug: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/blog/posts/${slug}`);
      return data.post as PublicBlogPost;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Post no encontrado");
    }
  },
);

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearBlogCurrent(state) {
      state.current = null;
    },
    setBlogPostsFromHome(state, action) {
      state.posts = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.perPage = action.payload.perPage;
      })
      .addCase(fetchBlogPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchBlogPost.pending, (state) => {
        state.postLoading = true;
        state.error = null;
        state.current = null;
      })
      .addCase(fetchBlogPost.fulfilled, (state, action) => {
        state.postLoading = false;
        state.current = action.payload;
      })
      .addCase(fetchBlogPost.rejected, (state, action) => {
        state.postLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBlogCurrent, setBlogPostsFromHome } = blogSlice.actions;
export default blogSlice.reducer;
