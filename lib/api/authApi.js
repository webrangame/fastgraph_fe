import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';
import { setCredentials, logout } from '../../redux/slice/authSlice';

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
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
    const refreshToken = Cookies.get('refresh_token');
    if (refreshToken) {
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
        api.dispatch(setCredentials({ accessToken: access_token }));
        Cookies.set('refresh_token', refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
        // Set access_token cookie (if not set by backend)
        Cookies.set('access_token', access_token, {
          httpOnly: false, // Must be false for baseQuery to access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
        });
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
        Cookies.remove('refresh_token');
        Cookies.remove('access_token'); // Clear access_token on refresh failure
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