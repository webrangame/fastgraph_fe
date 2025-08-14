import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRefresh } from '../../../lib/api/baseQuery';

export const autoOrchestrateApi = createApi({
  reducerPath: 'autoOrchestrateApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['AutoOrchestrate'],
  endpoints: (builder) => ({
    autoOrchestrate: builder.mutation({
      query: ({ command }) => ({
        url: '/autoOrchestrate',
        method: 'POST',
        body: { command },
      }),
      invalidatesTags: ['AutoOrchestrate'],
    }),
  }),
});

export const {
  useAutoOrchestrateMutation,
} = autoOrchestrateApi;