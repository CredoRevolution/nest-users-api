import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BalanceRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findBalance(userId: number): Promise<number | null> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { balance: true },
    });

    return user ? user.balance : null;
  }

  /**
   * Зачисление одним UPDATE: новое значение считает база.
   * Читать баланс в JS, складывать и записывать обратно нельзя — между
   * чтением и записью влезет параллельный запрос и затрёт результат.
   * Возвращает новый баланс или null, если пользователя нет.
   */
  credit(userId: number, amount: number): Promise<number | null> {
    return this.addToBalance(userId, amount);
  }

  /**
   * Списание тем же одним UPDATE, но с проверкой остатка прямо в WHERE:
   * строка блокируется на время транзакции, поэтому уйти в минус двумя
   * параллельными списаниями не получится.
   * Возвращает новый баланс или null, если денег не хватило.
   */
  debit(userId: number, amount: number): Promise<number | null> {
    return this.addToBalance(userId, -amount, true);
  }

  private async addToBalance(
    userId: number,
    amount: number,
    checkFunds = false,
  ): Promise<number | null> {
    const query = this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ balance: () => '"balance" + :amount' })
      .where('id = :userId')
      .andWhere('"deletedAt" IS NULL')
      .setParameters({ userId, amount })
      .returning('balance');

    if (checkFunds) {
      query.andWhere('"balance" + :amount >= 0');
    }

    const result = await query.execute();
    const row = (result.raw as { balance: string }[])[0];

    return row ? Number(row.balance) : null;
  }
}
