import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { NotificationsService } from './notifications.service';

@Module({
  providers: [FirebaseService, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
