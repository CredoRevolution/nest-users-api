import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BalanceResetRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async resetAll(): Promise<number> {
    const result = await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ balance: 0 })
      .where('"deletedAt" IS NULL AND "balance" != 0')
      .execute();
    return result.affected ?? 0;
  }
}
