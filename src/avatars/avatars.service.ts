import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IFileService } from '../providers/files/files.adapter';
import { AvatarsRepository } from './avatars.repository';

const MAX_ACTIVE_AVATARS = 5;

@Injectable()
class AvatarsService {
  private readonly logger = new Logger(AvatarsService.name);

  constructor(
    private readonly fileService: IFileService,
    private readonly avatarsRepository: AvatarsRepository,
  ) {}

  async uploadAvatar(avatar: Express.Multer.File, userId: number) {
    const currentUserAvatarsCount =
      await this.avatarsRepository.countUserAvatars(userId);
    if (MAX_ACTIVE_AVATARS <= currentUserAvatarsCount) {
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

    const { path } = await this.fileService.uploadFile(payload);
    try {
      const saved = await this.avatarsRepository.createUserAvatar(
        userId,
        fileName,
      );
      this.logger.log(
        `Avatar ${saved.id} uploaded for user ${userId}: ${path}, ${avatar.size} bytes`,
      );
      return saved;
    } catch (err) {
      // Файл уже в бакете, а записи о нём нет — сирота, которую придётся чистить руками.
      this.logger.error(
        `Avatar for user ${userId} uploaded to ${path}, but not saved to DB`,
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }
  }

  async deleteAvatar(avatarId: number, userId: number) {
    const avatar = await this.avatarsRepository.findOneById(avatarId);
    if (!avatar) {
      throw new NotFoundException('Avatar not found');
    }
    if (avatar.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this avatar');
    }
    const result = await this.avatarsRepository.softDeleteAvatar(avatarId);
    this.logger.log(`Avatar ${avatarId} of user ${userId} deleted`);
    return result;
  }
}

export default AvatarsService;
