import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRefresh } from '../../../lib/api/baseQuery';

export const autoOrchestrateApi = createApi({
  reducerPath: 'autoOrchestrateApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['AutoOrchestrate', 'Workflow', 'Data'],
  endpoints: (builder) => ({
    
    autoOrchestrate: builder.mutation({
      query: ({ command  ,  response_mode = 'full'}) => ({
        url: 'https://fatgraph-prod-twu675cviq-uc.a.run.app/autoOrchestrate',       
        method: 'POST',
        body: { command, response_mode: 'json' },
      }),
      invalidatesTags: ['AutoOrchestrate'],
    }),
    autoOrchestrateStream: builder.mutation({
      query: ({ command }) => ({
        url: `https://fatgraph-prod-twu675cviq-uc.a.run.app/autoOrchestrateStreamSSE?command=${encodeURIComponent(command)}`,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
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
    createAgentV1: builder.mutation({
      query: ({ workflowId, agentName, role, isUserEvolved = false, createdBy = 'user' }) => ({
        url: process.env.NEXT_PUBLIC_AGENT_API_URL || 'http://localhost:8080/api/v1/agents',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: { workflowId, agentName, role, isUserEvolved, createdBy },
      }),
      invalidatesTags: ['AutoOrchestrate'],
    }),
    createAgent: builder.mutation({
      query: ({ workflow_id, name, role, execute_now = false }) => ({
        url: 'https://fatgraph-prod-twu675cviq-uc.a.run.app/agent',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: { workflow_id, name, role, execute_now },
      }),
      invalidatesTags: ['AutoOrchestrate'],
    }),
  }),
});

export const {
  useAutoOrchestrateMutation,
  useAutoOrchestrateStreamMutation,
  useSaveWorkflowMutation,
  useInstallDataMutation,
  useGetDataCreatedByQuery,
  useDeleteDataMutation,
  useCreateAgentV1Mutation,
  useCreateAgentMutation,
} = autoOrchestrateApi;