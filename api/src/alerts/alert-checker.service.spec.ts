import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications/notifications.service';
import {
  StockEventsService,
  StockPriceUpdatePayload,
} from '../realtime/stock-events.service';
import { UsersService } from '../users/users.service';
import { AlertCheckerService } from './alert-checker.service';
import { AlertsRepository } from './alerts.repository';

describe('AlertCheckerService', () => {
  let alertCheckerService: AlertCheckerService;
  let priceUpdateHandler:
    | ((payload: StockPriceUpdatePayload) => void)
    | undefined;

  const alertsRepositoryMock = {
    findUntriggeredBySymbolAndPrice: jest.fn(),
    markTriggered: jest.fn(),
  };

  const usersServiceMock = {
    findById: jest.fn(),
  };

  const notificationsServiceMock = {
    sendPriceAlert: jest.fn(),
  };

  const stockEventsServiceMock = {
    onPriceUpdate: jest.fn(
      (handler: (payload: StockPriceUpdatePayload) => void) => {
        priceUpdateHandler = handler;
      },
    ),
    offPriceUpdate: jest.fn(),
    emitPriceUpdate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    priceUpdateHandler = undefined;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertCheckerService,
        { provide: AlertsRepository, useValue: alertsRepositoryMock },
        { provide: UsersService, useValue: usersServiceMock },
        {
          provide: NotificationsService,
          useValue: notificationsServiceMock,
        },
        { provide: StockEventsService, useValue: stockEventsServiceMock },
      ],
    }).compile();

    alertCheckerService = module.get<AlertCheckerService>(AlertCheckerService);
    alertCheckerService.onModuleInit();
  });

  it('marks alert triggered and sends notification when user has FCM token', async () => {
    const alert = {
      id: 'alert-1',
      userId: 'user-1',
      symbol: 'AAPL',
      targetPrice: 150,
    };

    alertsRepositoryMock.findUntriggeredBySymbolAndPrice.mockResolvedValue([
      alert,
    ]);
    usersServiceMock.findById.mockResolvedValue({
      id: 'user-1',
      fcmToken: 'fcm-token-123',
    });

    priceUpdateHandler?.({
      symbol: 'AAPL',
      price: 155,
      timestamp: Date.now(),
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(
      alertsRepositoryMock.findUntriggeredBySymbolAndPrice,
    ).toHaveBeenCalledWith('AAPL', 155);
    expect(alertsRepositoryMock.markTriggered).toHaveBeenCalledWith('alert-1');
    expect(notificationsServiceMock.sendPriceAlert).toHaveBeenCalledWith(
      'fcm-token-123',
      'AAPL',
      155,
    );
  });

  it('marks alert triggered but skips notification when user has no FCM token', async () => {
    const alert = {
      id: 'alert-1',
      userId: 'user-1',
      symbol: 'AAPL',
      targetPrice: 150,
    };

    alertsRepositoryMock.findUntriggeredBySymbolAndPrice.mockResolvedValue([
      alert,
    ]);
    usersServiceMock.findById.mockResolvedValue({
      id: 'user-1',
      fcmToken: null,
    });

    priceUpdateHandler?.({
      symbol: 'AAPL',
      price: 155,
      timestamp: Date.now(),
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(alertsRepositoryMock.markTriggered).toHaveBeenCalledWith('alert-1');
    expect(notificationsServiceMock.sendPriceAlert).not.toHaveBeenCalled();
  });

  it('does nothing when no untriggered alerts match', async () => {
    alertsRepositoryMock.findUntriggeredBySymbolAndPrice.mockResolvedValue([]);

    priceUpdateHandler?.({
      symbol: 'AAPL',
      price: 155,
      timestamp: Date.now(),
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(alertsRepositoryMock.markTriggered).not.toHaveBeenCalled();
    expect(notificationsServiceMock.sendPriceAlert).not.toHaveBeenCalled();
  });
});
