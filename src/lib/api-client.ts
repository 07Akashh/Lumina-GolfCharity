'use client'

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export function useApiQuery<T>(url: string, options: AxiosRequestConfig = {}) {
  const optionsKey = JSON.stringify(options)
  
  return useQuery<T>({
    queryKey: [url, optionsKey],
    queryFn: async () => {
      const res = await apiClient.get<T>(url, options)
      return res.data
    },
  })
}

export function useApiMutation<TVariables = unknown, TData = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options: AxiosRequestConfig = {}
) {
  
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const res = await apiClient.request<TData>({
        url,
        method,
        data: variables,
        ...options
      })
      return res.data
    },
    onSuccess: () => {
      // Custom global invalidation logic can go here if needed
    }
  })
}

/**
 * @deprecated Use useApiQuery or useApiMutation instead
 */
export function useApi<T>(url: string, options: AxiosRequestConfig = {}) {
  const { data, isLoading: loading, error, refetch } = useApiQuery<T>(url, options)
  return { data, loading, error, mutate: refetch }
}
