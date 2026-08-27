import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { CreateUserData } from '../users/types/CreateUserData';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { JwtPayload } from './types/jwt-payload';
import { RefreshTokensRepository } from './refresh-tokens.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async register(user: CreateUserDto) {
    const userEmail = await this.usersService.findByEmail(user.email);
    const userLogin = await this.usersService.findByLogin(user.login);
    if (userEmail) {
      throw new ConflictException('User with this email already exists');
    } else if (userLogin) {
      throw new ConflictException('User with this login already exists');
    }
    const passwordHash: string = await bcrypt.hash(user.password, 10);
    const userToCreate: CreateUserData = {
      login: user.login,
      email: user.email,
      passwordHash,
      age: user.age,
      about: user.about,
    };
    const createdUser = await this.usersService.createUser(userToCreate);

    return this.issueTokens(createdUser);
  }

  async login(inputData: LoginUserDto) {
    const user = await this.usersService.findByLogin(inputData.login);
    if (!user) {
      await bcrypt.compare(
        inputData.password,
        '$2b$10$8ckc557lO.yx3SZjH8IMoOoZ61mS8D7EjqKRoAoxdg17A.P6NKb4G',
      );
      throw new UnauthorizedException('Invalid login or password');
    }
    const isPasswordValid = await bcrypt.compare(
      inputData.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid login or password');
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.refreshTokensRepository.findByHash(
      this.hashToken(refreshToken),
    );
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.refreshTokensRepository.deleteById(storedToken.id);

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  async issueTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, login: user.login };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, jti: randomUUID() },
      {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES'),
      },
    );

    const { exp } = this.jwtService.decode<{ exp: number }>(refreshToken);
    await this.refreshTokensRepository.create({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(exp * 1000),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
