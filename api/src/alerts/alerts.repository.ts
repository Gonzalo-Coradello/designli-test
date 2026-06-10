import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockAlert } from './entities/stock-alert.entity';

@Injectable()
export class AlertsRepository {
  constructor(
    @InjectRepository(StockAlert)
    private readonly repository: Repository<StockAlert>,
  ) {}

  async create(data: {
    userId: string;
    symbol: string;
    targetPrice: number;
  }): Promise<StockAlert> {
    const alert = this.repository.create({
      userId: data.userId,
      symbol: data.symbol.toUpperCase(),
      targetPrice: data.targetPrice,
    });
    return this.repository.save(alert);
  }

  findAllByUserId(userId: string): Promise<StockAlert[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findByIdAndUserId(id: string, userId: string): Promise<StockAlert | null> {
    return this.repository.findOne({ where: { id, userId } });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  findUntriggeredBySymbolAndPrice(
    symbol: string,
    price: number,
  ): Promise<StockAlert[]> {
    return this.repository
      .createQueryBuilder('alert')
      .where('alert.symbol = :symbol', { symbol: symbol.toUpperCase() })
      .andWhere('alert.target_price <= :price', { price })
      .andWhere('alert.is_triggered = false')
      .getMany();
  }

  async markTriggered(id: string): Promise<void> {
    await this.repository.update(id, {
      isTriggered: true,
      triggeredAt: new Date(),
    });
  }
}
