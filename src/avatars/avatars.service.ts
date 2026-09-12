import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IFileService } from '../providers/files/files.adapter';
import { AvatarsRepository } from './avatars.repository';

@Injectable()
class AvatarsService {
  constructor(
    private readonly fileService: IFileService,
    private readonly avatarsRepository: AvatarsRepository,
  ) {}
  async uploadAvatar(avatar: Express.Multer.File, userId: number) {
    const fileName = randomUUID() + '.' + avatar.mimetype.split('/')[1];
    const payload = {
      file: avatar,
      folder: 'avatars',
      name: fileName,
    };

    await this.fileService.uploadFile(payload);
    return this.avatarsRepository.createUserAvatar(userId, fileName);
  }
}

export default AvatarsService;
