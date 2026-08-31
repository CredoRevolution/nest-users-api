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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('my')
  getProfile(@CurrentUser('sub') userId: number): Promise<User> {
    return this.profileService.getMyProfile(userId);
  }

  @Patch('my')
  updateProfile(
    @CurrentUser('sub') userId: number,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.profileService.updateMyProfile(userId, dto);
  }

  @Delete('my')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProfile(@CurrentUser('sub') userId: number): Promise<void> {
    return this.profileService.deleteMyProfile(userId);
  }
}
