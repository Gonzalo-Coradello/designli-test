import { ApiProperty } from '@nestjs/swagger';
import { StockAlert } from '../entities/stock-alert.entity';

export class AlertResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  targetPrice: number;

  @ApiProperty()
  isTriggered: boolean;

  @ApiProperty({ nullable: true })
  triggeredAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(alert: StockAlert): AlertResponseDto {
    return {
      id: alert.id,
      symbol: alert.symbol,
      targetPrice: alert.targetPrice,
      isTriggered: alert.isTriggered,
      triggeredAt: alert.triggeredAt,
      createdAt: alert.createdAt,
    };
  }
}
