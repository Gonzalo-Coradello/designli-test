import { ApiProperty } from '@nestjs/swagger';

export class StockSearchResultDto {
  @ApiProperty({ example: 'AAPL' })
  symbol: string;

  @ApiProperty({ example: 'Apple Inc' })
  description: string;
}

export class StockSearchResponseDto {
  @ApiProperty({ type: [StockSearchResultDto] })
  results: StockSearchResultDto[];
}
