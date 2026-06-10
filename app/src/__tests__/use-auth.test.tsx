import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { router } from 'expo-router'
import type { ReactNode } from 'react'
import { login, register } from '../features/auth/api/auth.api'
import { useAuthStore } from '../features/auth/auth.store'
import {
  useLoginMutation,
  useRegisterMutation,
} from '../features/auth/hooks/use-auth'
import type { AuthResponse } from '../features/auth/types'
import { registerFcmToken } from '../notifications/notification.service'

jest.mock('../features/auth/api/auth.api', () => ({
  login: jest.fn(),
  register: jest.fn(),
}))

jest.mock('../notifications/notification.service', () => ({
  registerFcmToken: jest.fn(),
}))

const mockAuthResponse: AuthResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: {
    id: 'user-1',
    email: 'test@example.com',
  },
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('use-auth hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
    })
  })

  it('useLoginMutation stores session, registers FCM token, and navigates on success', async () => {
    ;(login as jest.Mock).mockResolvedValue(mockAuthResponse)
    ;(registerFcmToken as jest.Mock).mockResolvedValue(undefined)

    const setSessionSpy = jest.spyOn(useAuthStore.getState(), 'setSession')

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      password: 'password123',
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(setSessionSpy).toHaveBeenCalledWith(mockAuthResponse)
    expect(registerFcmToken).toHaveBeenCalled()
    expect(router.replace).toHaveBeenCalledWith('/(tabs)')
  })

  it('useRegisterMutation stores session, registers FCM token, and navigates on success', async () => {
    ;(register as jest.Mock).mockResolvedValue(mockAuthResponse)
    ;(registerFcmToken as jest.Mock).mockResolvedValue(undefined)

    const setSessionSpy = jest.spyOn(useAuthStore.getState(), 'setSession')

    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      password: 'password123',
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(setSessionSpy).toHaveBeenCalledWith(mockAuthResponse)
    expect(registerFcmToken).toHaveBeenCalled()
    expect(router.replace).toHaveBeenCalledWith('/(tabs)')
  })

  it('useLoginMutation sets error state when API rejects', async () => {
    ;(login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'))

    const setSessionSpy = jest.spyOn(useAuthStore.getState(), 'setSession')

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      password: 'wrong-password',
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(setSessionSpy).not.toHaveBeenCalled()
    expect(registerFcmToken).not.toHaveBeenCalled()
    expect(router.replace).not.toHaveBeenCalled()
  })
})
