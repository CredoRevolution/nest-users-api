import { Module } from '@nestjs/common';
import { BalanceResetService } from './balance-reset.service';
import { BalanceResetController } from './balance-reset.controller';
import { BullModule } from '@nestjs/bullmq';
import { BalanceResetProcessor } from './balance-reset.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'balance-reset',
    }),
  ],
  controllers: [BalanceResetController],
  providers: [BalanceResetService, BalanceResetProcessor],
})
export class BalanceResetModule {}
