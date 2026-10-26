import { IsInt, IsNumber, IsPositive, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MAX_OPERATION_AMOUNT } from './deposit.dto';

// id в таблице users — SERIAL, то есть integer в Postgres.
const PG_INT_MAX = 2147483647;

export class TransferDto {
  @ApiProperty({ description: 'Кому переводим', example: 42 })
  @IsInt({ message: 'toUserId must be an integer' })
  @Min(1, { message: 'toUserId must be at least 1' })
  @Max(PG_INT_MAX, {
    message: `toUserId must not be greater than ${PG_INT_MAX}`,
  })
  toUserId: number;

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
