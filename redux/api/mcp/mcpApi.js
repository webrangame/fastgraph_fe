import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRefresh } from '../../../lib/api/baseQuery';

export const mcpApi = createApi({
  reducerPath: 'mcpApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['MCPServer', 'MCPConnection'],
  endpoints: (builder) => ({
    
    // Create a new MCP server
    createMCPServer: builder.mutation({
      query: (serverData) => ({
        url: '/api/v1/mcp-settings',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: serverData,
      }),
      invalidatesTags: ['MCPServer'],
    }),

    // Get all MCP servers
    getMCPServers: builder.query({
      query: () => ({
        url: '/api/v1/mcp-settings',
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }),
      providesTags: ['MCPServer'],
    }),

    // Get a specific MCP server by ID
    getMCPServer: builder.query({
      query: (serverId) => ({
        url: `/api/v1/mcp/servers/${serverId}`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }),
      providesTags: (result, error, serverId) => [{ type: 'MCPServer', id: serverId }],
    }),

    // Update an MCP server
    updateMCPServer: builder.mutation({
      query: ({ serverId, ...serverData }) => ({
        url: `/api/v1/mcp/servers/${serverId}`,
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: serverData,
      }),
      invalidatesTags: (result, error, { serverId }) => [
        { type: 'MCPServer', id: serverId },
        'MCPServer'
      ],
    }),

    // Delete an MCP server
    deleteMCPServer: builder.mutation({
      query: (serverId) => ({
        url: `/api/v1/mcp/servers/${serverId}`,
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
        },
      }),
      invalidatesTags: ['MCPServer'],
    }),

    // Test MCP server connection
    testMCPConnection: builder.mutation({
      query: (serverData) => ({
        url: '/api/v1/mcp/servers/test-connection',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: serverData,
      }),
      invalidatesTags: ['MCPConnection'],
    }),

    // Connect to MCP server
    connectMCPServer: builder.mutation({
      query: (serverId) => ({
        url: `/api/v1/mcp/servers/${serverId}/connect`,
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
      }),
      invalidatesTags: ['MCPConnection'],
    }),

    // Disconnect from MCP server
    disconnectMCPServer: builder.mutation({
      query: (serverId) => ({
        url: `/api/v1/mcp/servers/${serverId}/disconnect`,
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
      }),
      invalidatesTags: ['MCPConnection'],
    }),

    // Get MCP server status
    getMCPServerStatus: builder.query({
      query: (serverId) => ({
        url: `/api/v1/mcp/servers/${serverId}/status`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }),
      providesTags: (result, error, serverId) => [{ type: 'MCPConnection', id: serverId }],
    }),

    // Get MCP server capabilities
    getMCPServerCapabilities: builder.query({
      query: (serverId) => ({
        url: `/api/v1/mcp/servers/${serverId}/capabilities`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }),
      providesTags: (result, error, serverId) => [{ type: 'MCPServer', id: serverId }],
    }),

    // Get MCP servers created by a specific user
    getMCPServersByUser: builder.query({
      query: (userId) => ({
        url: `/api/v1/mcp-settings?status=active`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }),
      providesTags: (result, error, userId) => [
        { type: 'MCPServer', id: `user-${userId}` },
        'MCPServer'
      ],
    }),

    // Get MCP servers with status filter
    getMCPServersByStatus: builder.query({
      query: (status = 'active') => ({
        url: `/api/v1/mcp-settings?status=${status}`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }),
      providesTags: (result, error, status) => [
        { type: 'MCPServer', id: `status-${status}` },
        'MCPServer'
      ],
    }),

  }),
});

export const {
  useCreateMCPServerMutation,
  useGetMCPServersQuery,
  useGetMCPServerQuery,
  useUpdateMCPServerMutation,
  useDeleteMCPServerMutation,
  useTestMCPConnectionMutation,
  useConnectMCPServerMutation,
  useDisconnectMCPServerMutation,
  useGetMCPServerStatusQuery,
  useGetMCPServerCapabilitiesQuery,
  useGetMCPServersByUserQuery,
  useGetMCPServersByStatusQuery,
} = mcpApi;
