import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import {
  StockEventsService,
  StockPriceUpdatePayload,
} from '../realtime/stock-events.service';
import { UsersService } from '../users/users.service';
import { AlertsRepository } from './alerts.repository';

@Injectable()
export class AlertCheckerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AlertCheckerService.name);

  private readonly handler = async (payload: StockPriceUpdatePayload) => {
    try {
      const alerts =
        await this.alertsRepository.findUntriggeredBySymbolAndPrice(
          payload.symbol,
          payload.price,
        );

      for (const alert of alerts) {
        await this.alertsRepository.markTriggered(alert.id);

        const user = await this.usersService.findById(alert.userId);

        if (user?.fcmToken) {
          await this.notificationsService.sendPriceAlert(
            user.fcmToken,
            payload.symbol,
            payload.price,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Alert check failed for ${payload.symbol}: ${error}`);
    }
  };

  private readonly syncHandler = (payload: StockPriceUpdatePayload): void => {
    void this.handler(payload);
  };

  constructor(
    private readonly stockEventsService: StockEventsService,
    private readonly alertsRepository: AlertsRepository,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit(): void {
    this.stockEventsService.onPriceUpdate(this.syncHandler);
  }

  onModuleDestroy(): void {
    this.stockEventsService.offPriceUpdate(this.syncHandler);
  }
}
