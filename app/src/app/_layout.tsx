import messaging from '@react-native-firebase/messaging'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router'
import { Slot, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Platform } from 'react-native'
import { setupInterceptors } from '@/api/interceptors'
import { ThemedView } from '@/components/themed-view'
import { useAuthStore } from '@/features/auth/auth.store'
import { useTheme } from '@/hooks/use-theme'
import {
  registerFcmToken,
  setupForegroundHandler,
  setupTokenRefreshHandler,
} from '@/notifications/notification.service'
import { useStockSocket } from '@/realtime/hooks/use-stock-socket'
import { AlertModalHost } from '@/shared/components'

const queryClient = new QueryClient()

setupInterceptors()

export default function RootLayout() {
  const theme = useTheme()
  const router = useRouter()
  const segments = useSegments()
  const [isReady, setIsReady] = useState(false)
  const { accessToken, isHydrated, hydrate } = useAuthStore()

  useStockSocket()

  useEffect(() => {
    hydrate().finally(() => setIsReady(true))
  }, [hydrate])

  useEffect(() => {
    if (!accessToken) {
      return
    }

    registerFcmToken()

    const invalidateAlerts = () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    }

    const unsubscribeForeground = setupForegroundHandler(invalidateAlerts)
    const unsubscribeTokenRefresh = setupTokenRefreshHandler()

    const isNative = Platform.OS === 'ios' || Platform.OS === 'android'
    const unsubscribeOpened = isNative
      ? messaging().onNotificationOpenedApp(invalidateAlerts)
      : () => {}

    if (isNative) {
      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            invalidateAlerts()
          }
        })
    }

    return () => {
      unsubscribeForeground()
      unsubscribeTokenRefresh()
      unsubscribeOpened()
    }
  }, [accessToken])

  useEffect(() => {
    if (!isReady || !isHydrated) {
      return
    }

    const inAuthGroup = segments[0] === '(auth)'

    if (!accessToken && !inAuthGroup) {
      router.replace('/(auth)/login')
      return
    }

    if (accessToken && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [accessToken, isHydrated, isReady, router, segments])

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.background)
  }, [theme.background])

  const statusBar = (
    <StatusBar style={theme.isDark ? 'light' : 'dark'} />
  )

  if (!isReady || !isHydrated) {
    return (
      <>
        {statusBar}
        <AlertModalHost />
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.text} />
        </ThemedView>
      </>
    )
  }

  return (
    <>
      {statusBar}
      <AlertModalHost />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={theme.isDark ? DarkTheme : DefaultTheme}>
          <Slot />
        </ThemeProvider>
      </QueryClientProvider>
    </>
  )
}
