import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { router } from 'expo-router'
import { refresh } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/features/auth/auth.store'
import { apiClient } from './axios'

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

function processQueue(token: string | null) {
  refreshQueue.forEach((callback) => callback(token))
  refreshQueue = []
}

export function setupInterceptors() {
  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState()

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  })

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
      }

      if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
        return Promise.reject(error)
      }

      if (originalRequest.url?.includes('/auth/refresh')) {
        await useAuthStore.getState().clearSession()
        router.replace('/(auth)/login')
        return Promise.reject(error)
      }

      const { refreshToken } = useAuthStore.getState()

      if (!refreshToken) {
        await useAuthStore.getState().clearSession()
        router.replace('/(auth)/login')
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) {
              reject(error)
              return
            }

            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const authResponse = await refresh(refreshToken)
        await useAuthStore.getState().setSession(authResponse)
        processQueue(authResponse.accessToken)
        originalRequest.headers.Authorization = `Bearer ${authResponse.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(null)
        await useAuthStore.getState().clearSession()
        router.replace('/(auth)/login')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    },
  )
}
