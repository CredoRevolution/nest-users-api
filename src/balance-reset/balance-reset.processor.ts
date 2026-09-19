import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('balance-reset')
export class BalanceResetProcessor extends WorkerHost {
  private readonly logger = new Logger(BalanceResetProcessor.name);
  async process(job: Job): Promise<void> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    await Promise.resolve(job);
  }
}
