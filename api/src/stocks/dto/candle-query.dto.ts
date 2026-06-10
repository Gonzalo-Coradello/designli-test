import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CandleQueryDto {
  @ApiPropertyOptional({
    default: '60',
    description: 'Candle resolution in minutes',
  })
  @IsOptional()
  @IsString()
  resolution?: string = '60';

  @ApiPropertyOptional({
    default: 7,
    description: 'Number of days to look back',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days?: number = 7;
}
