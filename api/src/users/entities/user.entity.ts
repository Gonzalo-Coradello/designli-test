import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'fcm_token', nullable: true, type: 'varchar', length: 512 })
  fcmToken: string | null;
}
