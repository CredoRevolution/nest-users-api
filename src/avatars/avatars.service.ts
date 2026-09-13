import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IFileService } from '../providers/files/files.adapter';
import { AvatarsRepository } from './avatars.repository';

@Injectable()
class AvatarsService {
  constructor(
    private readonly fileService: IFileService,
    private readonly avatarsRepository: AvatarsRepository,
  ) {}

  private MAX_ACTIVE_AVATARS = 5;

  async uploadAvatar(avatar: Express.Multer.File, userId: number) {
    const currentUserAvatarsCount =
      await this.avatarsRepository.countUserAvatars(userId);
    if (this.MAX_ACTIVE_AVATARS <= currentUserAvatarsCount) {
      throw new ConflictException(
        'Max avatars count reached. Delete one of your avatars to upload a new one',
      );
    }
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
