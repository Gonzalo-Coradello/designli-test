import { apiClient } from '@/api/axios'
import type { CreateAlertPayload, StockAlert } from '../types'

export async function getAlerts(): Promise<StockAlert[]> {
  const { data } = await apiClient.get<StockAlert[]>('/alerts')
  return data
}

export async function createAlert(
  payload: CreateAlertPayload,
): Promise<StockAlert> {
  const { data } = await apiClient.post<StockAlert>('/alerts', payload)
  return data
}

export async function deleteAlert(id: string): Promise<void> {
  await apiClient.delete(`/alerts/${id}`)
}
