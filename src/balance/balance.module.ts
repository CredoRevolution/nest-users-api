import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { BalanceRepository } from './balance.repository';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule],
  controllers: [BalanceController],
  providers: [BalanceService, BalanceRepository, JwtAuthGuard],
})
export class BalanceModule {}
