import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import { registerFcmToken } from '@/notifications/notification.service'
import { login, register } from '../api/auth.api'
import { useAuthStore } from '../auth.store'
import type { LoginPayload, RegisterPayload } from '../types'

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: async (data) => {
      await setSession(data)
      await registerFcmToken()
      router.replace('/(tabs)')
    },
  })
}

export function useRegisterMutation() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: async (data) => {
      await setSession(data)
      await registerFcmToken()
      router.replace('/(tabs)')
    },
  })
}
