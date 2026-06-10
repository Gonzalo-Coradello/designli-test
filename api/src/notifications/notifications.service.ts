import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async sendPriceAlert(
    fcmToken: string,
    symbol: string,
    price: number,
  ): Promise<void> {
    if (!fcmToken || !this.firebaseService.isEnabled) {
      return;
    }

    const title = `Price Alert: ${symbol}`;
    const body = `${symbol} reached $${price.toFixed(2)} (target met)`;

    await this.firebaseService.send(fcmToken, title, body);
  }
}
