import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('profile')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Нет access-токена, он просрочен или отозван',
})
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('my')
  @ApiOperation({ summary: 'Получить свой профиль' })
  @ApiOkResponse({ type: User })
  getProfile(@CurrentUser('sub') userId: number): Promise<User> {
    return this.profileService.getMyProfile(userId);
  }

  @Patch('my')
  @ApiOperation({
    summary: 'Изменить свой профиль',
    description:
      'Передаются только изменяемые поля. После смены пароля завершаются ' +
      'все сессии, включая текущую: нужно заново войти через /auth/login.',
  })
  @ApiOkResponse({ type: User, description: 'Обновлённый профиль' })
  @ApiBadRequestResponse({ description: 'Тело запроса не прошло валидацию' })
  @ApiConflictResponse({ description: 'Новый логин или email уже заняты' })
  updateProfile(
    @CurrentUser('sub') userId: number,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.profileService.updateMyProfile(userId, dto);
  }

  @Delete('my')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить свой аккаунт',
    description:
      'Аккаунт удаляется мягко, все сессии завершаются. Логин и email ' +
      'остаются занятыми.',
  })
  @ApiNoContentResponse({ description: 'Аккаунт удалён' })
  deleteProfile(@CurrentUser('sub') userId: number): Promise<void> {
    return this.profileService.deleteMyProfile(userId);
  }
}
