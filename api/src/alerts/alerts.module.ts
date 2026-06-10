import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { UsersModule } from '../users/users.module';
import { AlertCheckerService } from './alert-checker.service';
import { AlertsController } from './alerts.controller';
import { AlertsRepository } from './alerts.repository';
import { AlertsService } from './alerts.service';
import { StockAlert } from './entities/stock-alert.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockAlert]),
    NotificationsModule,
    RealtimeModule,
    UsersModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsRepository, AlertsService, AlertCheckerService],
  exports: [AlertsRepository],
})
export class AlertsModule {}
