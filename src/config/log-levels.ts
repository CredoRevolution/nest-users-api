import type { LogLevel } from '@nestjs/common';

const PRODUCTION_LOG_LEVELS: LogLevel[] = ['fatal', 'error', 'warn', 'log'];
const DEVELOPMENT_LOG_LEVELS: LogLevel[] = [
  ...PRODUCTION_LOG_LEVELS,
  'debug',
  'verbose',
];

export function getLogLevels(nodeEnv: string | undefined): LogLevel[] {
  return nodeEnv === 'production'
    ? PRODUCTION_LOG_LEVELS
    : DEVELOPMENT_LOG_LEVELS;
}
