import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';
import { QueryFailedFilter } from './query-failed.filter';

describe('QueryFailedFilter', () => {
  let filter: QueryFailedFilter;
  let httpAdapter: { reply: jest.Mock; isHeadersSent: jest.Mock };

  const response = {};
  const host = { getArgByIndex: () => response } as unknown as ArgumentsHost;

  const queryFailed = (driverError: object) =>
    new QueryFailedError('INSERT ...', [], driverError as Error);

  beforeEach(() => {
    httpAdapter = {
      reply: jest.fn(),
      isHeadersSent: jest.fn().mockReturnValue(false),
    };
    filter = new QueryFailedFilter(
      httpAdapter as unknown as AbstractHttpAdapter,
    );
  });

  it('превращает нарушение UNIQUE в 409 с именем поля', () => {
    filter.catch(
      queryFailed({
        code: '23505',
        detail: 'Key (email)=(sasha@example.com) already exists.',
      }),
      host,
    );

    expect(httpAdapter.reply).toHaveBeenCalledWith(
      response,
      {
        statusCode: HttpStatus.CONFLICT,
        message: 'email is already taken',
        error: 'Conflict',
      },
      HttpStatus.CONFLICT,
    );
  });

  it('не отдаёт клиенту значение, из-за которого случился конфликт', () => {
    filter.catch(
      queryFailed({
        code: '23505',
        detail: 'Key (email)=(sasha@example.com) already exists.',
      }),
      host,
    );

    const body = JSON.stringify(httpAdapter.reply.mock.calls[0][1]);
    expect(body).not.toContain('sasha@example.com');
  });

  it('остальные ошибки базы оставляет 500', () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    filter.catch(queryFailed({ code: '42P01' }), host);

    expect(httpAdapter.reply).toHaveBeenCalledWith(
      response,
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });
});
