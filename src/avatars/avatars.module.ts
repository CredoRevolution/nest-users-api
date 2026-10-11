import { Module } from '@nestjs/common';
import AvatarsService from './avatars.service';
import { AvatarsController } from './avatars.controller';
import { AvatarsRepository } from './avatars.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from './entities/avatar.entity';
import { FilesModule } from '../providers/files/files.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Avatar]), FilesModule, UsersModule],
  controllers: [AvatarsController],
  providers: [AvatarsService, AvatarsRepository, JwtAuthGuard],
})
export class AvatarsModule {}
