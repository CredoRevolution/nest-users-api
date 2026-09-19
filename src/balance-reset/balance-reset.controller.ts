import { Controller, Get } from '@nestjs/common';
import { BalanceResetService } from './balance-reset.service';

@Controller('balance-reset')
export class BalanceResetController {
  constructor(private readonly balanceResetService: BalanceResetService) {}

  @Get()
  async resetBalance() {
    await this.balanceResetService.enqueueResetAll();
  }
}
