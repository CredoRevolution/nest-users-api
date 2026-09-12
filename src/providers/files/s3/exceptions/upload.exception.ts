import { BadRequestException } from '@nestjs/common';

export class UploadException extends BadRequestException {
  constructor(message?: string) {
    //eslint-disable-next-line
    super(`${message || 'Something went wrong'}`);
  }
}
