import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CandleQueryDto } from './dto/candle-query.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { StockCandleDto } from './dto/stock-candle.dto';
import { StockQuoteDto } from './dto/stock-quote.dto';
import { StockSearchResponseDto } from './dto/stock-search-result.dto';
import { StocksService } from './stocks.service';

@ApiTags('stocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get('search')
  @ApiOkResponse({ type: StockSearchResponseDto })
  async search(
    @Query() query: SearchQueryDto,
  ): Promise<StockSearchResponseDto> {
    const results = await this.stocksService.searchSymbols(query.q);
    return { results };
  }

  @Get(':symbol/quote')
  @ApiOkResponse({ type: StockQuoteDto })
  getQuote(@Param('symbol') symbol: string): Promise<StockQuoteDto> {
    return this.stocksService.getQuote(symbol.toUpperCase());
  }

  @Get(':symbol/candles')
  @ApiOkResponse({ type: StockCandleDto })
  getCandles(
    @Param('symbol') symbol: string,
    @Query() query: CandleQueryDto,
  ): Promise<StockCandleDto> {
    return this.stocksService.getCandles(symbol.toUpperCase(), query);
  }
}
