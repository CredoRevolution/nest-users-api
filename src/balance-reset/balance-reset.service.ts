import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  BALANCE_RESET_INTERVAL_MS,
  BALANCE_RESET_JOB,
  BALANCE_RESET_QUEUE,
  BALANCE_RESET_SCHEDULER_ID,
} from './balance-reset.constants';
import { BalanceResetRepository } from './balance-reset.repository';

@Injectable()
export class BalanceResetService implements OnModuleInit {
  constructor(
    @InjectQueue(BALANCE_RESET_QUEUE)
    private readonly balanceResetQueue: Queue,
    private readonly balanceResetRepository: BalanceResetRepository,
  ) {}

  private readonly logger = new Logger(BalanceResetService.name);

  async onModuleInit() {
    await this.balanceResetQueue.upsertJobScheduler(
      BALANCE_RESET_SCHEDULER_ID,
      { every: BALANCE_RESET_INTERVAL_MS },
      {
        name: BALANCE_RESET_JOB,
        data: {},
      },
    );
    this.logger.log(
      `Balance reset scheduler registered, interval ${BALANCE_RESET_INTERVAL_MS / (60 * 1000)} min`,
    );
  }

  async enqueueResetAll() {
    await this.balanceResetQueue.add(BALANCE_RESET_JOB, {});
    this.logger.log('Balance reset job added to queue');
  }

  async resetAll() {
    const result = await this.balanceResetRepository.resetAll();
    this.logger.log(`Balances reset for ${result} users`);
    return result;
  }
}
