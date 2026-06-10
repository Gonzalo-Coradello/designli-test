import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  StockEventsService,
  StockPriceUpdatePayload,
} from './stock-events.service';
import { WsJwtGuard } from './ws-jwt.guard';

interface SymbolPayload {
  symbols: string[];
}

@WebSocketGateway({ namespace: '/stocks', cors: true })
@UseGuards(WsJwtGuard)
export class StockGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(StockGateway.name);

  @WebSocketServer()
  server: Server;

  private readonly priceHandler = (payload: StockPriceUpdatePayload) => {
    this.server.to(payload.symbol).emit('price.update', payload);
  };

  constructor(
    private readonly stockEventsService: StockEventsService,
    private readonly wsJwtGuard: WsJwtGuard,
  ) {}

  afterInit() {
    this.stockEventsService.onPriceUpdate(this.priceHandler);
  }

  async handleConnection(client: Socket) {
    try {
      await this.wsJwtGuard.authenticateClient(client);
      this.logger.log(`Client connected: ${client.id}`);
    } catch {
      this.logger.warn(`Unauthorized WebSocket connection: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SymbolPayload,
  ) {
    const symbols = (payload.symbols ?? []).map((s) => s.toUpperCase());
    for (const symbol of symbols) {
      void client.join(symbol);
    }
    return { event: 'subscribed', data: { symbols } };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SymbolPayload,
  ) {
    const symbols = (payload.symbols ?? []).map((s) => s.toUpperCase());
    for (const symbol of symbols) {
      void client.leave(symbol);
    }
    return { event: 'unsubscribed', data: { symbols } };
  }
}
