import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRefresh } from '../../../lib/api/baseQuery';
import Cookies from 'js-cookie';

// Use local backend for development, external API for production
const isProduction = process.env.NODE_ENV === 'production';
const auditBaseQuery = fetchBaseQuery({
  baseUrl: isProduction ? 'https://jobaapi.hattonn.com/api/v1' : 'http://localhost:8080/api/v1',
  prepareHeaders: async (headers, { getState }) => {
    const accessToken = getState().auth.accessToken || Cookies.get('access_token');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
});

export const auditApi = createApi({
  reducerPath: 'auditApi',
  baseQuery: auditBaseQuery,
  tagTypes: ['AuditLog'],
  endpoints: (builder) => ({
    logAudit: builder.mutation({
      query: (auditData) => ({
        url: '/audit/logs',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: auditData,
      }),
      invalidatesTags: ['AuditLog'],
    }),
    getAuditLogs: builder.query({
      query: (params = {}) => ({
        url: '/audit/logs',
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
        params,
      }),
      providesTags: ['AuditLog'],
    }),
    getAuditLogsByUser: builder.query({
      query: (userId) => ({
        url: `/audit/user/${userId}`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }),
      providesTags: (result, error, userId) => [
        { type: 'AuditLog', id: `user-${userId}` },
        'AuditLog'
      ],
    }),
    getAuditLogsByResource: builder.query({
      query: (resource) => ({
        url: `/audit/logs/resource/${resource}`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }),
      providesTags: (result, error, resource) => [
        { type: 'AuditLog', id: `resource-${resource}` },
        'AuditLog'
      ],
    }),
    getAuditLog: builder.query({
      query: (logId) => ({
        url: `/audit/logs/${logId}`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }),
      providesTags: (result, error, logId) => [
        { type: 'AuditLog', id: logId },
        'AuditLog'
      ],
    }),
  }),
});

export const {
  useLogAuditMutation,
  useGetAuditLogsQuery,
  useGetAuditLogsByUserQuery,
  useGetAuditLogsByResourceQuery,
  useGetAuditLogQuery,
} = auditApi;
