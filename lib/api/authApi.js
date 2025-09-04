import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';
import { setCredentials, logout } from '../../redux/slice/authSlice';

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
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
const baseQueryWithRefresh = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

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
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
        Cookies.set('access_token', access_token, {
          httpOnly: false, // Must be false for baseQuery to access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
        });
        result = await baseQuery(args, api, extraOptions);
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
      query: ({ email, password, name }) => ({
        url: '/api/v1/auth/register',
        method: 'POST',
        body: { email, password, name },
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
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          });
          Cookies.set('access_token', accessToken, {
            httpOnly: false, // Must be false for baseQuery to access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
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
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          });
          Cookies.set('access_token', accessToken, {
            httpOnly: false, // Must be false for baseQuery to access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
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
      query: ({ access_token }) => ({
        url: '/api/v1/auth/google/token',
        method: 'POST',
        body: { access_token },
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
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          });
          Cookies.set('access_token', accessToken, {
            httpOnly: false, // Must be false for baseQuery to access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
          });
        } catch (error) {
          console.error('Google login failed:', error);
        }
      },
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
} = authApi;