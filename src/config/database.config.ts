import type { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import { InitSchema1788895499169 } from '../migrations/1788895499169-InitSchema';
import { AddUserTokenVersion1789132788702 } from '../migrations/1789132788702-AddUserTokenVersion';

/**
 * Сущности и миграции перечислены явно, а не глобом: глоб вида `*.{ts,js}`
 * после сборки цепляет ещё и .d.ts, а явный список ломается на этапе компиляции,
 * если файл переименовали или удалили.
 */
export const entities = [User, RefreshToken];
export const migrations = [
  InitSchema1788895499169,
  AddUserTokenVersion1789132788702,
];

export const databaseConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.getOrThrow<string>('DB_HOST'),
  port: Number(config.getOrThrow<string>('DB_PORT')),
  username: config.getOrThrow<string>('DB_USER'),
  password: config.getOrThrow<string>('DB_PASSWORD'),
  database: config.getOrThrow<string>('DB_NAME'),
  entities,
  migrations,
  synchronize: false,
  migrationsRun: false,
  logging: true,
});
