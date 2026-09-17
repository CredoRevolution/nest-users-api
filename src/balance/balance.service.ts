import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { BalanceRepository } from './balance.repository';
import { UsersService } from '../users/users.service';
import { TransferResultDto } from './dto/balance.dto';

@Injectable()
export class BalanceService {
  constructor(
    private readonly balanceRepository: BalanceRepository,
    private readonly usersService: UsersService,
  ) {}

  async getBalance(userId: number): Promise<number> {
    const balance = await this.balanceRepository.findBalance(userId);
    if (balance === null) {
      throw new NotFoundException('User not found');
    }
    return balance;
  }

  async deposit(userId: number, amount: number): Promise<number> {
    const balance = await this.balanceRepository.credit(userId, amount);
    if (balance === null) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.invalidateUserCache(userId);
    return balance;
  }

  async withdraw(userId: number, amount: number): Promise<number> {
    const balance = await this.balanceRepository.debit(userId, amount);
    if (balance === null) {
      throw new ConflictException('Insufficient funds');
    }
    await this.usersService.invalidateUserCache(userId);
    return balance;
  }

  async transfer(
    fromUserId: number,
    toUserId: number,
    amount: number,
  ): Promise<TransferResultDto> {
    if (fromUserId === toUserId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    const balance = await this.runTransfer(fromUserId, toUserId, amount);

    // Кэш чистим после коммита: если бы делали это внутри транзакции,
    // откат вернул бы старые данные, а кэш уже был бы сброшен.
    await this.usersService.invalidateUserCache(fromUserId);
    await this.usersService.invalidateUserCache(toUserId);

    return { balance, toUserId, amount };
  }

  /**
   * Списание и зачисление — одна транзакция: либо оба UPDATE, либо ни одного.
   * Любое исключение отсюда (нет получателя, не хватило денег, да хоть падение
   * кода между запросами) откатывает всё целиком.
   *
   * Порядок операций — по возрастанию id, а не «сначала списали, потом
   * зачислили». UPDATE держит блокировку строки до конца транзакции, и два
   * встречных перевода A→B и B→A, идущие каждый в своём порядке, встали бы
   * в deadlock. Одинаковый порядок блокировок его исключает.
   */
  @Transactional()
  private async runTransfer(
    fromUserId: number,
    toUserId: number,
    amount: number,
  ): Promise<number> {
    if (fromUserId < toUserId) {
      const balance = await this.debitOrFail(fromUserId, amount);
      await this.creditOrFail(toUserId, amount);
      return balance;
    }

    await this.creditOrFail(toUserId, amount);
    return this.debitOrFail(fromUserId, amount);
  }

  /**
   * Тот же перевод, но код падает между списанием и зачислением.
   * Нужен только для проверки отката, наружу открыт вне production.
   */
  @Transactional()
  async crashingTransfer(
    fromUserId: number,
    toUserId: number,
    amount: number,
  ): Promise<never> {
    if (fromUserId === toUserId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    await this.debitOrFail(fromUserId, amount);

    throw new Error(
      'Обрыв посреди транзакции: деньги списаны, но не зачислены',
    );
  }

  private async debitOrFail(userId: number, amount: number): Promise<number> {
    const balance = await this.balanceRepository.debit(userId, amount);
    if (balance === null) {
      throw new ConflictException('Insufficient funds');
    }
    return balance;
  }

  private async creditOrFail(userId: number, amount: number): Promise<number> {
    const balance = await this.balanceRepository.credit(userId, amount);
    if (balance === null) {
      throw new NotFoundException('Recipient not found');
    }
    return balance;
  }
}
