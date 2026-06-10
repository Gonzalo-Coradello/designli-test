import { ApiProperty } from '@nestjs/swagger';

export class CandleDto {
  @ApiProperty()
  open: number;

  @ApiProperty()
  high: number;

  @ApiProperty()
  low: number;

  @ApiProperty()
  close: number;

  @ApiProperty()
  volume: number;

  @ApiProperty()
  timestamp: number;
}

export class StockCandleDto {
  @ApiProperty({ example: 'AAPL' })
  symbol: string;

  @ApiProperty({ type: [CandleDto] })
  candles: CandleDto[];
}
