import { ApiProperty } from '@nestjs/swagger';

export class BalanceDto {
  @ApiProperty({ type: Number, example: 99.99, description: 'Баланс, в USD' })
  balance: number;
}

export class TransferResultDto {
  @ApiProperty({ type: Number, example: 0.01, description: 'Баланс, в USD' })
  balance: number;

  @ApiProperty({ description: 'Кому перевели', example: 42 })
  toUserId: number;

  @ApiProperty({ type: Number, example: 99.99, description: 'Сумма, в USD' })
  amount: number;
}
