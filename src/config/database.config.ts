import type { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

export const databaseConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.getOrThrow('DB_HOST'),
  port: Number(config.getOrThrow('DB_PORT')),
  username: config.getOrThrow('DB_USER'),
  password: config.getOrThrow('DB_PASSWORD'),
  database: config.getOrThrow('DB_NAME'),
  entities: [User],
  synchronize: true,
  logging: true,
});