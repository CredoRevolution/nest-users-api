import { ServiceUnavailableException } from '@nestjs/common';

export class UploadException extends ServiceUnavailableException {
  constructor() {
    super('File storage is unavailable');
  }
}
