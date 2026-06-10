import { Module } from '@nestjs/common';
import { FinnhubService } from './finnhub.service';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import { YahooFinanceService } from './yahoo-finance.service';

@Module({
  controllers: [StocksController],
  providers: [FinnhubService, YahooFinanceService, StocksService],
  exports: [FinnhubService, YahooFinanceService, StocksService],
})
export class StocksModule {}
