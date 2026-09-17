import * as AWS from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';

import { S3Lib } from './constants/do-spaces-service-lib.constant';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    S3Service,
    {
      provide: S3Lib,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new AWS.S3({
          endpoint: config.getOrThrow('S3_ENDPOINT'),
          region: 'ru-central1',
          forcePathStyle: true,
          credentials: {
            accessKeyId: config.getOrThrow('MINIO_ACCESS_KEY'),
            secretAccessKey: config.getOrThrow('MINIO_SECRET_KEY'),
          },
        });
      },
    },
  ],
  exports: [S3Service, S3Lib],
})
export class S3Module {}
