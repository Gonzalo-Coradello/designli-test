import { Redirect } from 'expo-router'
import { useAuthStore } from '@/features/auth/auth.store'

export default function Index() {
  const accessToken = useAuthStore((state) => state.accessToken)

  if (accessToken) {
    return <Redirect href="/(tabs)" />
  }

  return <Redirect href="/(auth)/login" />
}
