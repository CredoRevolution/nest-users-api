import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const { method, originalUrl } = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const start = Date.now();

    // Статус не угадываем по ошибке, а ждём, пока ответ уйдёт клиенту:
    // к 'finish' фильтры исключений уже выставили настоящий код.
    res.once('finish', () => {
      const { statusCode } = res;
      const line = `${method} ${originalUrl} ${statusCode} ${Date.now() - start}ms`;
      if (statusCode >= 500) {
        this.logger.error(line);
      } else if (statusCode >= 400) {
        this.logger.warn(line);
      } else {
        this.logger.log(line);
      }
    });

    return next.handle();
  }
}
