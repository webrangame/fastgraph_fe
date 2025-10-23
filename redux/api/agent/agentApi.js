import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRefresh } from '../../../lib/api/baseQuery';
import Cookies from 'js-cookie';

// Use local backend for development, external API for production
const isProduction = process.env.NODE_ENV === 'production';
const agentBaseQuery = fetchBaseQuery({
  baseUrl: isProduction ? 'https://jobaapi.hattonn.com/api/v1' : 'http://localhost:8080/api/v1',
  prepareHeaders: async (headers, { getState }) => {
    const accessToken = getState().auth.accessToken || Cookies.get('access_token');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
});

export const agentApi = createApi({
  reducerPath: 'agentApi',
  baseQuery: agentBaseQuery,
  tagTypes: ['Agent'],
  endpoints: (builder) => ({
    createAgent: builder.mutation({
      query: (agentData) => ({
        url: '/agent/create',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: agentData,
      }),
      invalidatesTags: ['Agent'],
    }),
    getAgents: builder.query({
      query: (params = {}) => ({
        url: '/agents',
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
        params,
      }),
      providesTags: ['Agent'],
    }),
    getAgentById: builder.query({
      query: (agentId) => ({
        url: `/agents/${agentId}`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }),
      providesTags: (result, error, agentId) => [
        { type: 'Agent', id: agentId },
        'Agent'
      ],
    }),
    updateAgent: builder.mutation({
      query: ({ agentId, ...agentData }) => ({
        url: `/agents/${agentId}`,
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: agentData,
      }),
      invalidatesTags: (result, error, { agentId }) => [
        { type: 'Agent', id: agentId },
        'Agent'
      ],
    }),
    deleteAgent: builder.mutation({
      query: (agentId) => ({
        url: `/agents/${agentId}`,
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
        },
      }),
      invalidatesTags: ['Agent'],
    }),
  }),
});

export const {
  useCreateAgentMutation,
  useGetAgentsQuery,
  useGetAgentByIdQuery,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
} = agentApi;
