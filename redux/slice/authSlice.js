import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../lib/api/authApi'; // Import the authApi

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user || null;
      state.refreshToken = action.payload.refreshToken || null;
      state.error = null;
      state.status = 'succeeded';
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login mutation
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user || null;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      })
      // Register mutation
      .addMatcher(authApi.endpoints.register.matchPending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user || null;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.register.matchRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Registration failed';
      })
      // Refresh token mutation
      .addMatcher(authApi.endpoints.refreshToken.matchPending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(authApi.endpoints.refreshToken.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.refreshToken.matchRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Token refresh failed';
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
      })
      // Get user profile query
      .addMatcher(authApi.endpoints.getUserProfile.matchPending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(authApi.endpoints.getUserProfile.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.getUserProfile.matchRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch user data';
      })
      // Logout mutation
      .addMatcher(authApi.endpoints.logout.matchPending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.status = 'succeeded';
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.logout.matchRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Logout failed';
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;