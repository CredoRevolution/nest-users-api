import { ArgumentsHost, Catch, ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { BaseExceptionFilter } from '@nestjs/core';

const UNIQUE_VIOLATION = '23505';

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

    return super.catch(exception, host);
  }
}
