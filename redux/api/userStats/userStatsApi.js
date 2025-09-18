import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRefresh } from '../../../lib/api/baseQuery';

export const userStatsApi = createApi({
  reducerPath: 'userStatsApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['UserStats'],
  endpoints: (builder) => ({
    getUserStats: builder.query({
      query: (userId) => ({
        url: `/api/v1/data/user-stats/${userId}`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }),
      providesTags: ['UserStats'],
    }),
  }),
});

export const {
  useGetUserStatsQuery,
} = userStatsApi;
