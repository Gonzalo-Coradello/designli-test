import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';
import { AlertResponseDto } from './dto/alert-response.dto';
import { AlertsRepository } from './alerts.repository';

@Injectable()
export class AlertsService {
  constructor(private readonly alertsRepository: AlertsRepository) {}

  async create(userId: string, dto: CreateAlertDto): Promise<AlertResponseDto> {
    const alert = await this.alertsRepository.create({
      userId,
      symbol: dto.symbol,
      targetPrice: dto.targetPrice,
    });
    return AlertResponseDto.fromEntity(alert);
  }

  async findAllByUser(userId: string): Promise<AlertResponseDto[]> {
    const alerts = await this.alertsRepository.findAllByUserId(userId);
    return alerts.map((alert) => AlertResponseDto.fromEntity(alert));
  }

  async delete(userId: string, alertId: string): Promise<void> {
    const alert = await this.alertsRepository.findByIdAndUserId(
      alertId,
      userId,
    );

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    await this.alertsRepository.delete(alertId);
  }
}
