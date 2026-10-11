import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BalanceResetService } from './balance-reset.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('balance-reset')
@UseGuards(JwtAuthGuard)
export class BalanceResetController {
  constructor(private readonly balanceResetService: BalanceResetService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async resetBalance() {
    await this.balanceResetService.enqueueResetAll();
  }
}
