import { apiClient } from '@/api/axios'

export async function updateFcmToken(fcmToken: string): Promise<void> {
  await apiClient.patch('/users/me/fcm-token', { fcmToken })
}
