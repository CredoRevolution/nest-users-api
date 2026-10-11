import { IsNumber, IsPositive, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Верхняя граница одной операции. Колонка — numeric(12, 2), то есть
// до 9 999 999 999.99, так что за один раз переполнить её нельзя.
export const MAX_OPERATION_AMOUNT = 1_000_000;

export class DepositDto {
  @ApiProperty({ type: Number, example: 99.99, description: 'Сумма, в USD' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'amount must have at most 2 decimal places' },
  )
  @IsPositive({ message: 'amount must be greater than 0' })
  @Max(MAX_OPERATION_AMOUNT, {
    message: `amount must not be greater than ${MAX_OPERATION_AMOUNT}`,
  })
  amount: number;
}
