import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CandleDto } from './dto/stock-candle.dto';
import { StockQuoteDto } from './dto/stock-quote.dto';
import { StockSearchResultDto } from './dto/stock-search-result.dto';

interface FinnhubQuoteResponse {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

interface FinnhubCandleResponse {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  v: number[];
  t: number[];
  s: string;
}

interface FinnhubSearchResponse {
  result: Array<{
    symbol: string;
    description: string;
  }>;
}

@Injectable()
export class FinnhubService {
  private readonly baseUrl = 'https://finnhub.io/api/v1';
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('finnhub.apiKey');
  }

  async getQuote(symbol: string): Promise<StockQuoteDto> {
    try {
      const { data } = await axios.get<FinnhubQuoteResponse>(
        `${this.baseUrl}/quote`,
        {
          params: { symbol, token: this.apiKey },
        },
      );

      return {
        symbol,
        price: data.c,
        change: data.d,
        percentChange: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
        timestamp: data.t,
      };
    } catch {
      throw new ServiceUnavailableException(
        `Quote data unavailable for ${symbol}`,
      );
    }
  }

  async getCandles(
    symbol: string,
    resolution: string,
    from: number,
    to: number,
  ): Promise<CandleDto[]> {
    const { data } = await axios.get<FinnhubCandleResponse>(
      `${this.baseUrl}/stock/candle`,
      {
        params: { symbol, resolution, from, to, token: this.apiKey },
      },
    );

    if (data.s !== 'ok') {
      throw new ServiceUnavailableException(
        `Candle data unavailable for ${symbol}`,
      );
    }

    return data.t.map((timestamp, index) => ({
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
      volume: data.v[index],
      timestamp,
    }));
  }

  async searchSymbols(query: string): Promise<StockSearchResultDto[]> {
    const { data } = await axios.get<FinnhubSearchResponse>(
      `${this.baseUrl}/search`,
      {
        params: { q: query, token: this.apiKey },
      },
    );

    return data.result.map((item) => ({
      symbol: item.symbol,
      description: item.description,
    }));
  }
}
