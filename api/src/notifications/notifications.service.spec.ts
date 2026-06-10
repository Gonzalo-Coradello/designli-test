import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let notificationsService: NotificationsService;

  const firebaseServiceMock = {
    isEnabled: true,
    send: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    firebaseServiceMock.isEnabled = true;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: FirebaseService, useValue: firebaseServiceMock },
      ],
    }).compile();

    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  it('sends notification when Firebase is enabled and token is valid', async () => {
    await notificationsService.sendPriceAlert('fcm-token-123', 'AAPL', 155.5);

    expect(firebaseServiceMock.send).toHaveBeenCalledWith(
      'fcm-token-123',
      'Price Alert: AAPL',
      'AAPL reached $155.50 (target met)',
    );
  });

  it('returns early when Firebase is disabled', async () => {
    firebaseServiceMock.isEnabled = false;

    await notificationsService.sendPriceAlert('fcm-token-123', 'AAPL', 155.5);

    expect(firebaseServiceMock.send).not.toHaveBeenCalled();
  });

  it('returns early when FCM token is empty', async () => {
    await notificationsService.sendPriceAlert('', 'AAPL', 155.5);

    expect(firebaseServiceMock.send).not.toHaveBeenCalled();
  });
});
