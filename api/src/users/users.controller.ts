import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/fcm-token')
  @ApiOkResponse({ description: 'FCM token updated successfully' })
  async updateFcmToken(
    @CurrentUser() user: { sub: string },
    @Body() dto: UpdateFcmTokenDto,
  ): Promise<{ message: string }> {
    await this.usersService.updateFcmToken(user.sub, dto.fcmToken);
    return { message: 'FCM token updated successfully' };
  }
}
