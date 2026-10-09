import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { BALANCE_RESET_QUEUE } from './balance-reset.constants';
import { BalanceResetService } from './balance-reset.service';

@Processor(BALANCE_RESET_QUEUE)
export class BalanceResetProcessor extends WorkerHost {
  constructor(private readonly balanceResetService: BalanceResetService) {
    super();
  }
  private readonly logger = new Logger(BalanceResetProcessor.name);
  async process(job: Job): Promise<number> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    return await this.balanceResetService.resetAll();
  }
}
