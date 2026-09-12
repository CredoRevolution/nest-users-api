import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { IFileService } from './providers/files/files.adapter';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFilePayloadDto } from './providers/files/s3/dto/upload-file-payload.dto';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly fileService: IFileService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Проверить, что сервер отвечает' })
  @ApiOkResponse({ type: String, example: 'Hello World!' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('test-upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    const payload: UploadFilePayloadDto = {
      file,
      folder: 'test-folder',
      name: `${file.originalname}-${Date.now()}`,
    };
    console.log(payload);
    await this.fileService.uploadFile(payload);
  }
}
