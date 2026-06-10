import { apiClient, refreshClient } from '@/api/axios'
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types'

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
  console.log('login', data)
  return data
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const { data } = await refreshClient.post<AuthResponse>('/auth/refresh', {
    refreshToken,
  })
  console.log('refresh', data)
  return data
}
