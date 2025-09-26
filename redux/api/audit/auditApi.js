import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRefresh } from '../../../lib/api/baseQuery';

export const auditApi = createApi({
  reducerPath: 'auditApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['AuditLog'],
  endpoints: (builder) => ({
    logAudit: builder.mutation({
      query: (auditData) => ({
        url: '/api/v1/audit/log',
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
        url: '/api/v1/audit/logs',
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
        url: `/api/v1/audit/user/${userId}`,
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
        url: `/api/v1/audit/logs/resource/${resource}`,
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
        url: `/api/v1/audit/log/${logId}`,
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
