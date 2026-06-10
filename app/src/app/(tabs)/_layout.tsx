import { Ionicons } from '@expo/vector-icons'
import { Tabs, useRouter } from 'expo-router'
import { View } from 'react-native'
import { useTheme } from '@/hooks/use-theme'
import { HeaderIconButton } from '@/shared/components'
import { showAppAlert } from '@/shared/alert'
import { Spacing } from '@/shared/theme'
import { useAuthStore } from '@/features/auth/auth.store'
import { useAlerts } from '@/features/alerts/hooks/use-alerts'

export default function TabsLayout() {
  const theme = useTheme()
  const router = useRouter()
  const clearSession = useAuthStore((state) => state.clearSession)
  const { data: alerts } = useAlerts()

  const triggeredCount =
    alerts?.filter((alert) => alert.isTriggered).length ?? 0

  const handleLogout = () => {
    showAppAlert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await clearSession()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  const logoutButton = (
    <HeaderIconButton
      icon="log-out-outline"
      onPress={handleLogout}
      accessibilityLabel="Sign out"
      accessibilityHint="Signs out of your account"
      color={theme.text}
    />
  )

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.background,
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          headerTitle: '',
          tabBarLabel: 'Dashboard',
          headerRight: () => logoutButton,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'trending-up' : 'trending-up-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: '',
          headerTitle: '',
          tabBarLabel: 'Alerts',
          tabBarBadge: triggeredCount > 0 ? triggeredCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.danger,
          },
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: Spacing.two }}>
              <HeaderIconButton
                icon="add-circle-outline"
                onPress={() => router.push('/alerts/create')}
                accessibilityLabel="Create alert"
                accessibilityHint="Opens form to create a new price alert"
                color={theme.text}
              />
              {logoutButton}
            </View>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  )
}
