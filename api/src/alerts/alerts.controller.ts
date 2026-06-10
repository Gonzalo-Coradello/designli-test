import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StockEventsService } from '../realtime/stock-events.service';
import { AlertResponseDto } from './dto/alert-response.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
import { SimulatePriceDto } from './dto/simulate-price.dto';
import { AlertsService } from './alerts.service';

@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly stockEventsService: StockEventsService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: AlertResponseDto })
  create(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateAlertDto,
  ): Promise<AlertResponseDto> {
    return this.alertsService.create(user.sub, dto);
  }

  @Get()
  @ApiOkResponse({ type: [AlertResponseDto] })
  findAll(@CurrentUser() user: { sub: string }): Promise<AlertResponseDto[]> {
    return this.alertsService.findAllByUser(user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Alert deleted successfully' })
  async delete(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
  ): Promise<void> {
    await this.alertsService.delete(user.sub, id);
  }

  @Post('dev/simulate-price')
  @ApiOkResponse({ description: 'Price update simulated (dev only)' })
  simulatePrice(@Body() dto: SimulatePriceDto): { message: string } {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Not available in production');
    }

    this.stockEventsService.emitPriceUpdate(
      dto.symbol.toUpperCase(),
      dto.price,
      Date.now(),
    );

    return { message: 'Price update emitted' };
  }
}
