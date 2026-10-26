import { Module } from '@nestjs/common';
import { BalanceResetService } from './balance-reset.service';
import { BalanceResetController } from './balance-reset.controller';
import { BullModule } from '@nestjs/bullmq';
import { BalanceResetProcessor } from './balance-reset.processor';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { BALANCE_RESET_QUEUE } from './balance-reset.constants';
import { BalanceResetRepository } from './balance-reset.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: BALANCE_RESET_QUEUE,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
  controllers: [BalanceResetController],
  providers: [
    BalanceResetService,
    BalanceResetProcessor,
    BalanceResetRepository,
    JwtAuthGuard,
  ],
})
export class BalanceResetModule {}
