import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRefresh } from '../../../lib/api/baseQuery';

export const evolveAgentApi = createApi({
  reducerPath: 'evolveAgentApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['EvolveAgent'],
  endpoints: (builder) => ({
    evolveAgent: builder.mutation({
      query: ({ workflowId, agentName, feedbacks, evolutionMode = 'fast_auto_evolution' }) => ({
        url: '/evolveAgent',
        method: 'POST',
        body: { workflowId, agentName, feedbacks, evolutionMode },
      }),
      invalidatesTags: ['EvolveAgent'],
    }),
  }),
});

export const {
  useEvolveAgentMutation,
} = evolveAgentApi;
