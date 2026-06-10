import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '../features/auth/auth.store'
import type { AuthResponse } from '../features/auth/types'

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,
}

const mockAuthResponse: AuthResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: {
    id: 'user-1',
    email: 'test@example.com',
  },
}

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState(initialState)
  })

  it('setSession persists tokens and updates state', async () => {
    await useAuthStore.getState().setSession(mockAuthResponse)

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'access_token',
      'access-token',
    )
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-token',
    )
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'auth_user',
      JSON.stringify(mockAuthResponse.user),
    )

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockAuthResponse.user)
    expect(state.accessToken).toBe('access-token')
    expect(state.refreshToken).toBe('refresh-token')
  })

  it('clearSession removes persisted tokens and resets state', async () => {
    useAuthStore.setState({
      user: mockAuthResponse.user,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      isHydrated: true,
    })

    await useAuthStore.getState().clearSession()

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token')
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token')
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_user')

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
  })

  it('hydrate restores session from secure store', async () => {
    ;(SecureStore.getItemAsync as jest.Mock)
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token')
      .mockResolvedValueOnce(JSON.stringify(mockAuthResponse.user))

    await useAuthStore.getState().hydrate()

    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('access-token')
    expect(state.refreshToken).toBe('refresh-token')
    expect(state.user).toEqual(mockAuthResponse.user)
    expect(state.isHydrated).toBe(true)
  })

  it('hydrate sets isHydrated when secure store throws', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
      new Error('secure store unavailable'),
    )

    await useAuthStore.getState().hydrate()

    expect(useAuthStore.getState().isHydrated).toBe(true)
  })
})
