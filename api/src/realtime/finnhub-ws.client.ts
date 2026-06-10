import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';
import { WATCHLIST_SYMBOLS } from '../stocks/constants/watchlist';
import { StockEventsService } from './stock-events.service';

interface FinnhubTradeMessage {
  type: 'trade';
  data: Array<{
    s: string;
    p: number;
    t: number;
    v: number;
  }>;
}

@Injectable()
export class FinnhubWsClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FinnhubWsClient.name);
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly subscriptionCounts = new Map<string, number>();
  private readonly apiKey: string;
  private readonly wsUrl: string;
  private isDestroyed = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly stockEventsService: StockEventsService,
  ) {
    this.apiKey = this.configService.getOrThrow<string>('finnhub.apiKey');
    this.wsUrl = this.configService.getOrThrow<string>('finnhub.wsUrl');
  }

  onModuleInit() {
    this.connect();
    WATCHLIST_SYMBOLS.forEach((symbol) => this.subscribe(symbol));
  }

  onModuleDestroy() {
    this.isDestroyed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.ws?.close();
  }

  subscribe(symbol: string): void {
    const normalized = symbol.toUpperCase();
    const current = this.subscriptionCounts.get(normalized) ?? 0;
    this.subscriptionCounts.set(normalized, current + 1);

    if (current === 0) {
      this.sendSubscription('subscribe', normalized);
    }
  }

  unsubscribe(symbol: string): void {
    const normalized = symbol.toUpperCase();
    const current = this.subscriptionCounts.get(normalized) ?? 0;

    if (current <= 1) {
      this.subscriptionCounts.delete(normalized);
      this.sendSubscription('unsubscribe', normalized);
      return;
    }

    this.subscriptionCounts.set(normalized, current - 1);
  }

  private connect(): void {
    const url = `${this.wsUrl}?token=${this.apiKey}`;
    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      this.logger.log('Connected to Finnhub WebSocket');
      this.reconnectAttempts = 0;
      this.resubscribeAll();
    });

    this.ws.on('message', (raw) => {
      try {
        const message = JSON.parse(
          this.parseMessage(raw),
        ) as FinnhubTradeMessage;

        if (message.type !== 'trade' || !message.data) {
          return;
        }

        for (const trade of message.data) {
          this.stockEventsService.emitPriceUpdate(trade.s, trade.p, trade.t);
        }
      } catch (error) {
        this.logger.warn(`Failed to parse Finnhub message: ${error}`);
      }
    });

    this.ws.on('close', () => {
      this.logger.warn('Finnhub WebSocket closed');
      this.scheduleReconnect();
    });

    this.ws.on('error', (error) => {
      this.logger.error(`Finnhub WebSocket error: ${error.message}`);
      this.ws?.close();
    });
  }

  private parseMessage(raw: WebSocket.RawData): string {
    if (typeof raw === 'string') return raw;
    if (Buffer.isBuffer(raw)) return raw.toString('utf8');
    if (Array.isArray(raw)) return Buffer.concat(raw).toString('utf8');
    return Buffer.from(raw).toString('utf8');
  }

  private scheduleReconnect(): void {
    if (this.isDestroyed) {
      return;
    }

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private resubscribeAll(): void {
    for (const symbol of this.subscriptionCounts.keys()) {
      this.sendSubscription('subscribe', symbol);
    }
  }

  private sendSubscription(
    type: 'subscribe' | 'unsubscribe',
    symbol: string,
  ): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.ws.send(JSON.stringify({ type, symbol }));
  }
}
