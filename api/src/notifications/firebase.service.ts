import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private enabled = false;

  constructor(private readonly configService: ConfigService) {}

  get isEnabled(): boolean {
    return this.enabled;
  }

  onModuleInit(): void {
    const projectId = this.configService.get<string>('firebase.projectId');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');
    const privateKey = this.configService.get<string>('firebase.privateKey');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase credentials not configured — push notifications disabled',
      );
      return;
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      this.enabled = true;
      this.logger.log('Firebase Admin SDK initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize Firebase: ${error}`);
    }
  }

  async send(token: string, title: string, body: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      await admin.messaging().send({
        token,
        notification: { title, body },
      });
    } catch (error) {
      this.logger.warn(`FCM send failed for token: ${error}`);
    }
  }
}
