import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ example: 'AAPL' })
  @IsString()
  @IsNotEmpty()
  q: string;
}
