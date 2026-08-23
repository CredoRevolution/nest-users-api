import type { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

export const databaseConfig = (
  ConfigService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: ConfigService.getOrThrow('DB_HOST'),
  port: Number(ConfigService.getOrThrow('DB_PORT')),
  username: ConfigService.getOrThrow('POSTGRES_USER'),
  password: ConfigService.getOrThrow('POSTGRES_PASSWORD'),
  database: ConfigService.getOrThrow('POSTGRES_DB'),
  entities: [User],
  synchronize: true,
  logging: true,
});