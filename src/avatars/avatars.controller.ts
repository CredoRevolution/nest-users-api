import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import AvatarsService from './avatars.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';

@Controller('profile/my/avatars')
@UseGuards(JwtAuthGuard)
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('avatar', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(png|jpeg)$/,
          overrideMimeType: true,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    avatar: Express.Multer.File,
    @CurrentUser('sub') userId: number,
  ) {
    return await this.avatarsService.uploadAvatar(avatar, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAvatar(
    @Param() { id }: IdParamDto,
    @CurrentUser('sub') userId: number,
  ) {
    await this.avatarsService.deleteAvatar(id, userId);
  }
}
