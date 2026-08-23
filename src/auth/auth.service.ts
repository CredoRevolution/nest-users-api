import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { CreateUserData } from '../users/types/CreateUserData';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  async register(user: CreateUserDto) {
    const userEmail = await this.usersService.findByEmail(user.email);
    const userLogin = await this.usersService.findByLogin(user.login);
    if (userEmail) {
      throw new ConflictException('User with this email already exists');
    } else if (userLogin) {
      throw new ConflictException('User with this login already exists');
    }
    const passwordHash : string = await bcrypt.hash(user.password, 10)
    const userToCreate: CreateUserData = {
      login: user.login,
      email: user.email,
      passwordHash,
      age: user.age,
      about: user.about,
    }
    return await this.usersService.createUser(userToCreate);
  }
}
