import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/features/auth/auth.store'
import type { PriceUpdateEvent } from '@/features/stocks/types'

const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'http://localhost:3000'

let socket: Socket | null = null
let priceHandler: ((event: PriceUpdateEvent) => void) | null = null

function getSocket(): Socket {
  const { accessToken } = useAuthStore.getState()

  if (!accessToken) {
    throw new Error('No access token available for WebSocket connection')
  }

  if (socket?.connected) {
    return socket
  }

  if (socket) {
    socket.disconnect()
  }

  socket = io(`${WS_URL}/stocks`, {
    auth: { token: accessToken },
    transports: ['websocket'],
    autoConnect: true,
  })

  socket.on('price.update', (event: PriceUpdateEvent) => {
    priceHandler?.(event)
  })

  return socket
}

export function connectSocket(): Socket {
  return getSocket()
}

export function subscribeToSymbols(symbols: string[]): void {
  const client = getSocket()
  client.emit('subscribe', { symbols })
}

export function unsubscribeFromSymbols(symbols: string[]): void {
  if (!socket) {
    return
  }
  socket.emit('unsubscribe', { symbols })
}

export function onPriceUpdate(handler: (event: PriceUpdateEvent) => void): void {
  priceHandler = handler
}

export function disconnectSocket(): void {
  priceHandler = null
  socket?.disconnect()
  socket = null
}
