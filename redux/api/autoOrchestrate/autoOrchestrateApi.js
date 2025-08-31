import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRefresh } from '../../../lib/api/baseQuery';

export const autoOrchestrateApi = createApi({
  reducerPath: 'autoOrchestrateApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['AutoOrchestrate', 'Workflow'],
  endpoints: (builder) => ({
    autoOrchestrate: builder.mutation({
      query: ({ command }) => ({
        url: 'https://fatgraph-main-289021246668.us-central1.run.app/autoOrchestrate',
        method: 'POST',
        body: { command },
      }),
      invalidatesTags: ['AutoOrchestrate'],
    }),
    saveWorkflow: builder.mutation({

      query: ({ workflow, agents }) => ({
        url: '/api/v1/workflow/save',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: { workflow, agents },
      }),
      invalidatesTags: ['Workflow'],
    }),
  }),
});

export const {
  useAutoOrchestrateMutation,
  useSaveWorkflowMutation,
} = autoOrchestrateApi;