import * as SecureStore from 'expo-secure-store'
import { create } from 'zustand'
import type { AuthResponse, AuthUser } from './types'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'auth_user'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isHydrated: boolean
  setSession: (data: AuthResponse) => Promise<void>
  clearSession: () => Promise<void>
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,

  setSession: async (data) => {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user)),
    ])

    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    })
  },

  clearSession: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ])

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
    })
  },

  hydrate: async () => {
    try {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ])

      set({
        accessToken,
        refreshToken,
        user: userJson ? (JSON.parse(userJson) as AuthUser) : null,
        isHydrated: true,
      })
    } catch {
      set({ isHydrated: true })
    }
  },
}))
