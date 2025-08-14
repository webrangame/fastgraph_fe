import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQuery, baseQueryWithRefresh } from '../../../lib/api/baseQuery';

export const lessonApi = createApi({
  reducerPath: 'lessonApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['Lesson', 'PresignedUrl'],
  endpoints: (builder) => ({
    getAllLessons: builder.query({
      query: () => '/lessons',
      providesTags: ['Lesson'],
      baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL,
      }),
    }),
    getLesson: builder.query({
      query: (id) => `/lessons/${id}`,
      providesTags: ['Lesson'],
    }),
    createLesson: builder.mutation({
      query: ({ lessonName, lessonSummary, featureImage, videoSource, attachment }) => ({
        url: '/lessons',
        method: 'POST',
        body: { lessonName, lessonSummary, featureImage, videoSource, attachment },
      }),
      invalidatesTags: ['Lesson'],
    }),
    updateLesson: builder.mutation({
      query: ({ id, name, description }) => ({
        url: `/lessons/${id}`,
        method: 'PUT',
        body: { name, description },
      }),
      invalidatesTags: ['Lesson'],
    }),
    deleteLesson: builder.mutation({
      query: (id) => ({
        url: `/lessons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Lesson'],
    }),
    getPresignedUrls: builder.mutation({
      query: ({ image, video, attachment }) => ({
        url: '/lessons/presigned-urls',
        method: 'POST',
        body: { image, video, attachment },
      }),
      invalidatesTags: ['PresignedUrl'],
    }),
    getViewPresignedUrl: builder.query({
      query: (fileKey) => ({
        url: '/lessons/view-pre-sign-url',
        method: 'GET',
        params: { fileKey },
      }),
      providesTags: ['PresignedUrl'],
    }),
  }),
});

export const {
  useGetAllLessonsQuery,
  useGetLessonQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useGetPresignedUrlsMutation,
  useGetViewPresignedUrlQuery,
} = lessonApi;