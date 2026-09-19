import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BalanceResetService {
  constructor(
    @InjectQueue('balance-reset')
    private readonly balanceResetQueue: Queue,
  ) {}

  private readonly logger = new Logger(BalanceResetService.name);
  async enqueueResetAll() {
    await this.balanceResetQueue.add('reset-all', {});
    this.logger.log('Balance reset job added to queue');
  }
}
