import { ServiceUnavailableException } from '@nestjs/common';

export class RemoveException extends ServiceUnavailableException {
  constructor() {
    super('File storage is unavailable');
  }
}
