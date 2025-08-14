// /redux/slice/blogSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiCall } from '../../lib/api';

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (_, { dispatch, getState }) => {
    return apiCall(
      `${process.env.NEXT_PUBLIC_API_URL}/courses`,
      { method: 'GET' },
      dispatch,
      getState,
      true // Public call
    );
  }
);

const blogSlice = createSlice({
  name: 'blogs',
  initialState: {
    blogs: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default blogSlice.reducer;