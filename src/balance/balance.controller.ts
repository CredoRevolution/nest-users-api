import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BalanceService } from './balance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import { BalanceDto, TransferResultDto } from './dto/balance.dto';

@ApiTags('balance')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Нет access-токена, он просрочен или отозван',
})
@ApiBadRequestResponse({ description: 'Тело запроса не прошло валидацию' })
@UseGuards(JwtAuthGuard)
@Controller('profile/my/balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @ApiOperation({ summary: 'Узнать свой баланс' })
  @ApiOkResponse({ type: BalanceDto })
  async getBalance(@CurrentUser('sub') userId: number): Promise<BalanceDto> {
    return { balance: await this.balanceService.getBalance(userId) };
  }

  @Post('deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Пополнить свой баланс' })
  @ApiOkResponse({ type: BalanceDto })
  async deposit(
    @CurrentUser('sub') userId: number,
    @Body() { amount }: DepositDto,
  ): Promise<BalanceDto> {
    return { balance: await this.balanceService.deposit(userId, amount) };
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Списать со своего баланса' })
  @ApiOkResponse({ type: BalanceDto })
  @ApiConflictResponse({ description: 'Не хватает денег на балансе' })
  async withdraw(
    @CurrentUser('sub') userId: number,
    @Body() { amount }: DepositDto,
  ): Promise<BalanceDto> {
    return { balance: await this.balanceService.withdraw(userId, amount) };
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Перевести деньги другому пользователю',
    description:
      'Списание и зачисление идут одной транзакцией: если получателя нет ' +
      'или не хватило денег, не выполняется ни то, ни другое.',
  })
  @ApiOkResponse({ type: TransferResultDto })
  @ApiConflictResponse({ description: 'Не хватает денег на балансе' })
  @ApiNotFoundResponse({ description: 'Получатель не найден или удалён' })
  transfer(
    @CurrentUser('sub') userId: number,
    @Body() { toUserId, amount }: TransferDto,
  ): Promise<TransferResultDto> {
    return this.balanceService.transfer(userId, toUserId, amount);
  }

  /**
   * Перевод, который падает между списанием и зачислением: доказательство,
   * что транзакция откатывается целиком, а не только при ошибках базы.
   * Всегда отвечает 500, в production роута нет вовсе.
   */
  @Post('transfer/crash')
  @ApiExcludeEndpoint()
  async crashingTransfer(
    @CurrentUser('sub') userId: number,
    @Body() { toUserId, amount }: TransferDto,
  ): Promise<never> {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }

    return this.balanceService.crashingTransfer(userId, toUserId, amount);
  }
}
