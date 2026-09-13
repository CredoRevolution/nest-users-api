import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avatar } from './entities/avatar.entity';

@Injectable()
export class AvatarsRepository {
  constructor(
    @InjectRepository(Avatar)
    private readonly avatarsRepository: Repository<Avatar>,
  ) {}

  createUserAvatar(userId: number, fileName: string) {
    const result = this.avatarsRepository.create({
      userId,
      name: fileName,
    });
    return this.avatarsRepository.save(result);
  }

  countUserAvatars(userId: number) {
    return this.avatarsRepository.count({ where: { userId } });
  }
}
