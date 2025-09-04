import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';
import { setCredentials, logout } from '../../redux/slice/authSlice';

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  prepareHeaders: async (headers, { getState }) => {
    const accessToken = getState().auth.accessToken || Cookies.get('access_token');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
});

export const baseQueryWithRefresh = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = Cookies.get('refresh_token');
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
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
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        Cookies.set('access_token', access_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
        });
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
        Cookies.remove('refresh_token');
        Cookies.remove('access_token');
      }
    }
  }

  return result;
};