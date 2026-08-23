import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { CreateUserData } from '../users/types/CreateUserData';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly configService: ConfigService, private readonly jwtService: JwtService ) {}
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
    const createdUser =  await this.usersService.createUser(userToCreate);

    return this.generateTokens(createdUser);
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, login: user.login };

    const accessToken = await this.jwtService.signAsync(payload)
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }
}
