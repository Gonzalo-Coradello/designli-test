import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StockEventsService } from '../realtime/stock-events.service';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

interface AuthenticatedRequest {
  user?: { sub: string };
}

describe('AlertsController', () => {
  let app: INestApplication;
  let httpServer: Server;

  const alertsServiceMock = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    delete: jest.fn(),
  };

  const stockEventsServiceMock = {
    emitPriceUpdate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [
        { provide: AlertsService, useValue: alertsServiceMock },
        { provide: StockEventsService, useValue: stockEventsServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
          req.user = { sub: 'user-123' };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /alerts delegates to alertsService.create', async () => {
    const dto = { symbol: 'AAPL', targetPrice: 150 };
    const responseBody = {
      id: 'alert-1',
      symbol: 'AAPL',
      targetPrice: 150,
      isTriggered: false,
      triggeredAt: null,
      createdAt: new Date().toISOString(),
    };

    alertsServiceMock.create.mockResolvedValue(responseBody);

    await request(httpServer)
      .post('/alerts')
      .send(dto)
      .expect(201)
      .expect(responseBody);

    expect(alertsServiceMock.create).toHaveBeenCalledWith('user-123', dto);
  });

  it('GET /alerts delegates to alertsService.findAllByUser', async () => {
    const responseBody = [
      {
        id: 'alert-1',
        symbol: 'AAPL',
        targetPrice: 150,
        isTriggered: false,
        triggeredAt: null,
        createdAt: new Date().toISOString(),
      },
    ];

    alertsServiceMock.findAllByUser.mockResolvedValue(responseBody);

    await request(httpServer).get('/alerts').expect(200).expect(responseBody);

    expect(alertsServiceMock.findAllByUser).toHaveBeenCalledWith('user-123');
  });

  it('DELETE /alerts/:id delegates to alertsService.delete', async () => {
    alertsServiceMock.delete.mockResolvedValue(undefined);

    await request(httpServer).delete('/alerts/alert-1').expect(204);

    expect(alertsServiceMock.delete).toHaveBeenCalledWith(
      'user-123',
      'alert-1',
    );
  });
});
