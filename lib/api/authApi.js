import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';
import { setCredentials, logout } from '../../redux/slice/authSlice';

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://jobaapi.hattonn.com' 
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'),
  prepareHeaders: async (headers, { getState, endpoint }) => {
    // Skip Authorization header for public endpoints
    const publicEndpoints = ['getCoursesByStatus' , 'getCategories']; // Add endpoint names as needed
    if (!publicEndpoints.includes(endpoint)) {
      const accessToken = getState().auth.accessToken || Cookies.get('access_token');
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
    }
    return headers;
  },
});

// Special base query for external APIs
export const externalBaseQuery = fetchBaseQuery({
  baseUrl: 'https://jobaapi.hattonn.com',
  prepareHeaders: async (headers, { getState, endpoint }) => {
    // Add any required headers for external API
    headers.set('accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    
    // Add authorization if needed
    const accessToken = getState().auth.accessToken || Cookies.get('access_token');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
});

// Special base query for frontend-only APIs
export const frontendBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://dev.niyogen.com' 
    : 'http://localhost:8080',
  prepareHeaders: async (headers, { getState, endpoint }) => {
    headers.set('accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});
const baseQueryWithRefresh = async (args, api, extraOptions) => {
  // Use local backend for all endpoints when running locally
  // Only use external API in production
  const isProduction = process.env.NODE_ENV === 'production';
  const isExternalEndpoint = isProduction && args.url && (
    args.url.includes('/api/v1/payment/plans') || 
    args.url.includes('/api/v1/payment/plans/') && args.url.includes('/cancel')
  );
  const isFrontendEndpoint = args.url && (
    args.url.includes('/api/v1/auth/verify-email-frontend')
  );
  
  let query;
  if (isFrontendEndpoint) {
    query = frontendBaseQuery;
  } else if (isExternalEndpoint) {
    query = externalBaseQuery;
  } else {
    query = baseQuery;
  }
  
  let result = await query(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Don't try to refresh tokens for login/register endpoints
    const isAuthEndpoint = args.url && (
      args.url.includes('/auth/login') || 
      args.url.includes('/auth/register') ||
      args.url.includes('/auth/refresh')
    );
    
    if (isAuthEndpoint) {
      console.log('🔵 Auth endpoint 401 error, not attempting refresh');
      return result;
    }
    
    const refreshToken = Cookies.get('refresh_token');
    if (refreshToken) {
      console.log('🔄 Token expired, attempting refresh...');
      const refreshResult = await baseQuery(
        {
          url: '/api/v1/auth/refresh',
          method: 'POST',
          body: { refresh_token: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { access_token, refresh_token } = refreshResult.data;
        console.log('✅ Token refreshed successfully');
        api.dispatch(setCredentials({ accessToken: access_token }));
        Cookies.set('refresh_token', refresh_token, {
          httpOnly: false, // Must be false for baseQuery to access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });
        Cookies.set('access_token', access_token, {
          httpOnly: false, // Must be false for baseQuery to access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });
        result = await query(args, api, extraOptions);
      } else {
        console.log('❌ Token refresh failed, redirecting to login...');
        api.dispatch(logout());
        Cookies.remove('refresh_token');
        Cookies.remove('access_token');
        
        // Redirect to login page if we're in the browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } else {
      console.log('❌ No refresh token available, redirecting to login...');
      api.dispatch(logout());
      Cookies.remove('refresh_token');
      Cookies.remove('access_token');
      
      // Redirect to login page if we're in the browser
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['User', 'Token'],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: ({ email, password, fullName }) => ({
        url: '/api/v1/auth/register',
        method: 'POST',
        body: { email, password, fullName },
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken, refreshToken, user } = data;
          dispatch(setCredentials({ accessToken, refreshToken, user }));
          Cookies.set('refresh_token', refreshToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          });
          Cookies.set('access_token', accessToken, {
            httpOnly: false, // Must be false for baseQuery to access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          });
        } catch (error) {
          console.error('Registration failed:', error);
        }
      },
    }),
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: '/api/v1/auth/login',
        method: 'POST',
        body: { email, password },
      }),
      invalidatesTags: ['User', 'Token'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken, refreshToken, user } = data;
          dispatch(setCredentials({ accessToken, refreshToken, user }));
          Cookies.set('refresh_token', refreshToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          });
          Cookies.set('access_token', accessToken, {
            httpOnly: false, // Must be false for baseQuery to access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          });
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/api/v1/auth/refresh',
        method: 'POST',
        body: { refresh_token: refreshToken },
      }),
      invalidatesTags: ['Token'],
    }),
    getUserProfile: builder.query({
      query: () => '/api/v1/auth/profile',
      providesTags: ['User'],
    }),
    logout: builder.mutation({
      query: (refreshToken) => ({
        url: '/api/v1/auth/logout',
        method: 'POST',
        body: { refresh_token: refreshToken },
      }),
      async onQueryStarted(_, { dispatch }) {
        dispatch(logout());
        Cookies.remove('refresh_token');
        Cookies.remove('access_token'); // Clear access_token
      },
    }),
    googleLogin: builder.mutation({
      query: (tokenData) => ({
        url: '/api/v1/auth/google/token',
        method: 'POST',
        body: tokenData,
      }),
      invalidatesTags: ['User', 'Token'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken, refreshToken, user } = data;
          dispatch(setCredentials({ accessToken, refreshToken, user }));
          Cookies.set('refresh_token', refreshToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          });
          Cookies.set('access_token', accessToken, {
            httpOnly: false, // Must be false for baseQuery to access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          });
        } catch (error) {
          console.error('Google login failed:', error);
        }
      },
    }),
    // This is sample endpoint for forgot password
    forgotPassword: builder.mutation({
      query: ({ email }) => ({
        url: '/api/v1/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: '/api/v1/auth/reset-password',
        method: 'POST',
        body: { token, password },
      }),
    }),
    savePaymentPlan: builder.mutation({
      query: (paymentData) => ({
        url: '/api/v1/payment/plans',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['User'],
    }),
    cancelPaymentPlan: builder.mutation({
      query: (planId) => ({
        url: `/api/v1/payment/plans/${planId}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
    getUserSubscription: builder.query({
      query: (userId) => ({
        url: `/api/v1/payment/plans/user/${userId}/active`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: '/api/v1/auth/verify-email-frontend',
        method: 'POST',
        body: { token },
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useGetUserProfileQuery,
  useLogoutMutation,
  useGoogleLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSavePaymentPlanMutation,
  useCancelPaymentPlanMutation,
  useGetUserSubscriptionQuery,
  useVerifyEmailMutation,
} = authApi;