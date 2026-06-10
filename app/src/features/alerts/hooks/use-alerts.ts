import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAlert, deleteAlert, getAlerts } from '../api/alerts.api'
import type { CreateAlertPayload, StockAlert } from '../types'

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts,
  })
}

export function useCreateAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAlertPayload) => createAlert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useDeleteAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAlert(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['alerts'] })
      const previous = queryClient.getQueryData<StockAlert[]>(['alerts'])
      queryClient.setQueryData<StockAlert[]>(['alerts'], (old) =>
        old ? old.filter((alert) => alert.id !== id) : [],
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['alerts'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}
