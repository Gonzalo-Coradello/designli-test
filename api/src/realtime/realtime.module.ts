import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StocksModule } from '../stocks/stocks.module';
import { FinnhubWsClient } from './finnhub-ws.client';
import { StockEventsService } from './stock-events.service';
import { StockGateway } from './stock.gateway';
import { WsJwtGuard } from './ws-jwt.guard';

@Module({
  imports: [AuthModule, StocksModule],
  providers: [StockEventsService, FinnhubWsClient, StockGateway, WsJwtGuard],
  exports: [StockEventsService],
})
export class RealtimeModule {}
