import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import AvatarsService from './avatars.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('profile/my/avatars')
@UseGuards(JwtAuthGuard)
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadFile(
    @UploadedFile() avatar: Express.Multer.File,
    @CurrentUser('sub') userId: number,
  ) {
    return await this.avatarsService.uploadAvatar(avatar, userId);
  }
}
