import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { AvatarsModule } from './avatars/avatars.module';
import { BalanceModule } from './balance/balance.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { BullModule } from '@nestjs/bullmq';
import { BalanceResetModule } from './balance-reset/balance-reset.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
      dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return Promise.resolve(
          addTransactionalDataSource(new DataSource(options)),
        );
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          stores: [
            createKeyv(
              `redis://${config.getOrThrow('REDIS_USERNAME')}:${config.getOrThrow('REDIS_PASSWORD')}@${config.getOrThrow('REDIS_HOST')}:${config.getOrThrow('REDIS_PORT')}`,
              {
                connectionTimeout: 1000,
              },
            ),
          ],
          ttl: 30 * 1000,
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.getOrThrow<string>('REDIS_HOST'),
          port: Number(config.getOrThrow<string>('REDIS_PORT')),
          username: config.getOrThrow<string>('REDIS_USERNAME'),
          password: config.getOrThrow<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    UsersModule,
    AuthModule,
    ProfileModule,
    AvatarsModule,
    BalanceModule,
    BalanceResetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
