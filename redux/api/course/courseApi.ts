import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithRefresh } from "../../../lib/api/baseQuery";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["Course", "PresignedUrl"],
  endpoints: (builder) => ({
    getAllCourses: builder.query({
      query: () => "/courses",
      providesTags: ["Course"],
    }),
    getCourse: builder.query({
      query: (id) => `/courses/${id}`,
      providesTags: ["Course"],
    }),
    getCoursesByStatus: builder.query({
      query: ({ statuses, page = 1, pageSize = 10 }) => ({
        url: "/courses/by-status",
        method: "GET",
        params: {
          statuses: Array.isArray(statuses) ? statuses.join(",") : statuses,
          page,
          pageSize,
        },
      }),
      providesTags: ["Course"],
    }),
    createCourse: builder.mutation({
      query: ({
        title,
        categoryId,
        description,
        thumbnail,
        introVideo,
        instructorId,
        coursePriceType,
        regularPrice,
        discountedPrice,
        maxStudents,
        difficultyLevel,
        publicCourse,
        enableQA,
        certificateTemplate,
        slug,
      }) => ({
        url: "/courses",
        method: "POST",
        body: {
          title,
          categoryId,
          description,
          thumbnail,
          introVideo,
          instructorId,
          coursePriceType,
          regularPrice,
          discountedPrice,
          maxStudents,
          difficultyLevel,
          publicCourse,
          enableQA,
          certificateTemplate,
          slug,
        },
      }),
      invalidatesTags: ["Course"],
    }),
    updateCourse: builder.mutation({
      query: ({
        id,
        title,
        categoryId,
        description,
        thumbnail,
        introVideo,
        instructorId,
        coursePriceType,
        regularPrice,
        discountedPrice,
        maxStudents,
        difficultyLevel,
        publicCourse,
        enableQA,
        certificateTemplate,
        slug,
      }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        body: {
          title,
          categoryId,
          description,
          thumbnail,
          introVideo,
          instructorId,
          coursePriceType,
          regularPrice,
          discountedPrice,
          maxStudents,
          difficultyLevel,
          publicCourse,
          enableQA,
          certificateTemplate,
          slug,
        },
      }),
      invalidatesTags: ["Course"],
    }),
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),
    getPresignedUrls: builder.mutation({
      query: ({ thumbnail, introVideo }) => ({
        url: "/courses/presigned-urls",
        method: "POST",
        body: {
          thumbnail: thumbnail ? { type: thumbnail } : null,
          introVideo: introVideo ? { type: introVideo } : null,
        },
      }),
      invalidatesTags: ["PresignedUrl"],
    }),
    getViewPresignedUrl: builder.query({
      query: (fileKey) => ({
        url: "/courses/view-presigned-url",
        method: "GET",
        params: { fileKey },
      }),
      providesTags: ["PresignedUrl"],
    }),
    addLessonToCourse: builder.mutation({
      query: ({ courseId, lessonId }) => ({
        url: `/courses/${courseId}/lessons`,
        method: "POST",
        body: { lessonId },
      }),
      invalidatesTags: ["Course"],
    }),
    removeLessonFromCourse: builder.mutation({
      query: ({ courseId, lessonId }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),
  }),
});

export const {
  useGetAllCoursesQuery,
  useGetCourseQuery,
  useGetCoursesByStatusQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetPresignedUrlsMutation,
  useGetViewPresignedUrlQuery,
  useAddLessonToCourseMutation,
  useRemoveLessonFromCourseMutation,
} = courseApi;
