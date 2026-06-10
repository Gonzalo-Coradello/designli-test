import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('stock_alerts')
export class StockAlert extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 20 })
  symbol: string;

  @Column({
    name: 'target_price',
    type: 'decimal',
    precision: 12,
    scale: 4,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  targetPrice: number;

  @Column({ name: 'is_triggered', default: false })
  isTriggered: boolean;

  @Column({ name: 'triggered_at', type: 'timestamp', nullable: true })
  triggeredAt: Date | null;
}
