import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { BaseExceptionFilter } from '@nestjs/core';

const UNIQUE_VIOLATION = '23505';
// Число не влезло в тип колонки, например больше 2147483647 для integer.
// Это страховка: там, где валидация на входе такое число пропустила.
const NUMERIC_VALUE_OUT_OF_RANGE = '22003';
// Нарушен CHECK, например попытка увести balance в минус. Обычно до этого
// не доходит: остаток проверяется в WHERE самого UPDATE. Это страховка.
const CHECK_VIOLATION = '23514';

@Catch(QueryFailedError)
export class QueryFailedFilter extends BaseExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const { code, detail } = exception.driverError as {
      code?: string;
      detail?: string;
    };

    if (code === UNIQUE_VIOLATION) {
      const field = detail?.match(/Key \((.+?)\)=/)?.[1];
      const message = field
        ? `${field} is already taken`
        : 'Resource already exists';
      return super.catch(new ConflictException(message), host);
    }

    if (code === CHECK_VIOLATION) {
      return super.catch(
        new ConflictException('Operation violates a database constraint'),
        host,
      );
    }

    if (code === NUMERIC_VALUE_OUT_OF_RANGE) {
      // Текст ошибки Postgres содержит само значение — клиенту его не отдаём.
      return super.catch(
        new BadRequestException('Numeric value is out of range'),
        host,
      );
    }

    return super.catch(exception, host);
  }
}
