import messaging, {
  type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging'
import { Platform } from 'react-native'
import { updateFcmToken } from '@/features/users/api/users.api'
import { showAppAlert } from '@/shared/alert'

function isNativePlatform(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android'
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNativePlatform()) {
    return false
  }

  const authStatus = await messaging().requestPermission()
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  )
}

export async function getFcmToken(): Promise<string | null> {
  if (!isNativePlatform()) {
    return null
  }

  try {
    return await messaging().getToken()
  } catch {
    return null
  }
}

export async function registerFcmToken(): Promise<void> {
  if (!isNativePlatform()) {
    return
  }

  const granted = await requestNotificationPermission()
  if (!granted) {
    return
  }

  const token = await getFcmToken()
  if (!token) {
    return
  }

  await updateFcmToken(token)
}

export function setupForegroundHandler(onTrigger?: () => void): () => void {
  if (!isNativePlatform()) {
    return () => {}
  }

  const unsubscribe = messaging().onMessage(
    (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      onTrigger?.()

      const title = remoteMessage.notification?.title ?? 'Price Alert'
      const body =
        remoteMessage.notification?.body ?? 'A stock alert was triggered'

      showAppAlert(title, body)
    },
  )

  return unsubscribe
}

export function setupTokenRefreshHandler(): () => void {
  if (!isNativePlatform()) {
    return () => {}
  }

  return messaging().onTokenRefresh(async (token) => {
    await updateFcmToken(token)
  })
}
