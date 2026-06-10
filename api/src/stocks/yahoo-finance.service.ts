import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { CandleDto } from './dto/stock-candle.dto';

interface YahooChartQuote {
  open: Array<number | null>;
  high: Array<number | null>;
  low: Array<number | null>;
  close: Array<number | null>;
  volume: Array<number | null>;
}

interface YahooChartResponse {
  chart: {
    result: Array<{
      timestamp: number[];
      indicators: {
        quote: YahooChartQuote[];
      };
    }> | null;
    error: { description: string } | null;
  };
}

@Injectable()
export class YahooFinanceService {
  private readonly baseUrl =
    'https://query1.finance.yahoo.com/v8/finance/chart';

  private toYahooInterval(resolution: string): string {
    return resolution === 'D' ? '1d' : '60m';
  }

  async getCandles(
    symbol: string,
    resolution: string,
    from: number,
    to: number,
  ): Promise<CandleDto[]> {
    const interval = this.toYahooInterval(resolution);

    const { data } = await axios.get<YahooChartResponse>(
      `${this.baseUrl}/${symbol}`,
      {
        params: {
          period1: from,
          period2: to,
          interval,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        timeout: 10_000,
      },
    );

    if (data.chart.error) {
      throw new ServiceUnavailableException(
        `Candle data unavailable for ${symbol}`,
      );
    }

    const result = data.chart.result?.[0];
    if (!result?.timestamp?.length) {
      throw new ServiceUnavailableException(
        `Candle data unavailable for ${symbol}`,
      );
    }

    const quote = result.indicators.quote[0];
    const { timestamp, open, high, low, close, volume } = {
      timestamp: result.timestamp,
      open: quote.open,
      high: quote.high,
      low: quote.low,
      close: quote.close,
      volume: quote.volume,
    };

    return timestamp
      .map((ts, index) => ({
        ts,
        open: open[index],
        high: high[index],
        low: low[index],
        close: close[index],
        volume: volume[index],
      }))
      .filter(
        (row) =>
          row.open !== null &&
          row.high !== null &&
          row.low !== null &&
          row.close !== null,
      )
      .map((row) => ({
        open: row.open as number,
        high: row.high as number,
        low: row.low as number,
        close: row.close as number,
        volume: row.volume ?? 0,
        timestamp: row.ts,
      }));
  }
}
