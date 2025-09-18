import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRefresh } from '../../../lib/api/baseQuery';

export const autoOrchestrateApi = createApi({
  reducerPath: 'autoOrchestrateApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['AutoOrchestrate', 'Workflow', 'Data'],
  endpoints: (builder) => ({
    
    autoOrchestrate: builder.mutation({
      query: ({ command  ,  response_mode = 'full'}) => ({
        url: 'https://fatgraph-main-289021246668.us-central1.run.app/autoOrchestrate',
        method: 'POST',
        body: { command, response_mode: 'json' },
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
    installData: builder.mutation({
      query: ({ dataName, description, dataType, dataContent, numberOfAgents = 0, overwrite = false }) => {
        const requestBody = { 
          dataName, 
          description, 
          dataType, 
          numberOfAgents,
          dataContent, 
          overwrite 
        };
        console.log('installData API call with body:', requestBody);
        return {
          url: '/api/v1/data/install',
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: requestBody,
        };
      },
      invalidatesTags: ['Data'],
    }),
    getDataCreatedBy: builder.query({
      query: (userId) => ({
        url: `/api/v1/data/created-by/${userId}`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }),
      providesTags: ['Data'],
    }),
    deleteData: builder.mutation({
      query: (dataId) => ({
        url: `/api/v1/data/${dataId}`,
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
        },
      }),
      invalidatesTags: ['Data'],
    }),
  }),
});

export const {
  useAutoOrchestrateMutation,
  useSaveWorkflowMutation,
  useInstallDataMutation,
  useGetDataCreatedByQuery,
  useDeleteDataMutation,
} = autoOrchestrateApi;