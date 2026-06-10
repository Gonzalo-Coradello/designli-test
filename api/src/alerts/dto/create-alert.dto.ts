import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateAlertDto {
  @ApiProperty({ example: 'AAPL' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 200.5 })
  @IsNumber()
  @Min(0)
  targetPrice: number;
}
