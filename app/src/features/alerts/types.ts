export interface StockAlert {
  id: string
  symbol: string
  targetPrice: number
  isTriggered: boolean
  triggeredAt: string | null
  createdAt: string
}

export interface CreateAlertPayload {
  symbol: string
  targetPrice: number
}
