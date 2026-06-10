import { ApiProperty } from '@nestjs/swagger';

export class StockQuoteDto {
  @ApiProperty({ example: 'AAPL' })
  symbol: string;

  @ApiProperty({ example: 178.5 })
  price: number;

  @ApiProperty({ example: 1.25 })
  change: number;

  @ApiProperty({ example: 0.71 })
  percentChange: number;

  @ApiProperty({ example: 180.0 })
  high: number;

  @ApiProperty({ example: 176.5 })
  low: number;

  @ApiProperty({ example: 177.0 })
  open: number;

  @ApiProperty({ example: 177.25 })
  previousClose: number;

  @ApiProperty({ example: 1717843200 })
  timestamp: number;
}
