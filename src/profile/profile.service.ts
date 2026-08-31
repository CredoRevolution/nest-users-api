import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  getMyProfile(userId: number): Promise<User> {
    return this.usersService.findByIdOrFail(userId);
  }

  async updateMyProfile(userId: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersService.updateUser(userId, dto);
    if (dto.password) {
      await this.authService.revokeAllSessions(userId);
    }
    return user;
  }

  async deleteMyProfile(userId: number): Promise<void> {
    await this.usersService.softDeleteUser(userId);
    await this.authService.revokeAllSessions(userId);
  }
}
