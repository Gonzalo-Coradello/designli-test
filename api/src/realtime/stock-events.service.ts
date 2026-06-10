import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export const STOCK_PRICE_UPDATE_EVENT = 'stock.price.update';

export interface StockPriceUpdatePayload {
  symbol: string;
  price: number;
  timestamp: number;
}

@Injectable()
export class StockEventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitPriceUpdate(symbol: string, price: number, timestamp: number): void {
    const payload: StockPriceUpdatePayload = { symbol, price, timestamp };
    this.eventEmitter.emit(STOCK_PRICE_UPDATE_EVENT, payload);
  }

  onPriceUpdate(handler: (payload: StockPriceUpdatePayload) => void): void {
    this.eventEmitter.on(STOCK_PRICE_UPDATE_EVENT, handler);
  }

  offPriceUpdate(handler: (payload: StockPriceUpdatePayload) => void): void {
    this.eventEmitter.off(STOCK_PRICE_UPDATE_EVENT, handler);
  }
}
