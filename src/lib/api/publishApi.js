import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRefresh } from '../../../lib/api/baseQuery';

export const publishApi = createApi({
  reducerPath: 'publishApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['Publish'],
  endpoints: (builder) => ({
    publishWorkflow: builder.mutation({
      query: ({ requestId, workflowId, overriddenResult, overriddenArtifactLinks, workflowPrompt }) => ({
        url: 'https://fatgraph-prod-twu675cviq-uc.a.run.app/publish',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: {
          requestId,
          workflowId,
          overriddenResult,
          overriddenArtifactLinks,
          workflowPrompt
        },
      }),
      invalidatesTags: ['Publish'],
    }),
  }),
});

export const {
  usePublishWorkflowMutation,
} = publishApi;
