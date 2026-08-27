import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { CreateRefreshTokenData } from './types/CreateRefreshTokenData';

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    const refreshToken = this.refreshTokenRepository.create(data);
    return this.refreshTokenRepository.save(refreshToken);
  }

  findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOneBy({ tokenHash });
  }

  async deleteById(id: number): Promise<void> {
    await this.refreshTokenRepository.delete({ id });
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }
}
