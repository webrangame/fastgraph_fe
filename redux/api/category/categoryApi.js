import { createApi , fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQuery, baseQueryWithRefresh } from '../../../lib/api/baseQuery';

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
      baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL,
      }),
    }),
    getCategory: builder.query({
      query: (id) => `/categories/${id}`,
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: ({ name, description }) => ({
        url: '/categories',
        method: 'POST',
        body: { name, description },
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, name, description }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: { name, description },
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;