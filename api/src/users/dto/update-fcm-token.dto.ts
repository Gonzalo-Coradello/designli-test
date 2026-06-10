import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFcmTokenDto {
  @ApiProperty({ example: 'fcm-device-token-here' })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}
