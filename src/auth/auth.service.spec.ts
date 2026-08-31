import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    existsByEmail: jest.Mock;
    existsByLogin: jest.Mock;
    createUser: jest.Mock;
    findByLogin: jest.Mock;
    findById: jest.Mock;
  };
  let tokensRepository: {
    create: jest.Mock;
    findByHash: jest.Mock;
    deleteById: jest.Mock;
    deleteByUserId: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
    decode: jest.Mock;
  };

  const user = { id: 1, login: 'sasha' } as User;
  const newUser = {
    login: 'sasha',
    email: 'sasha@example.com',
    password: 'qwerty123',
    age: 28,
  };

  beforeEach(async () => {
    usersService = {
      existsByEmail: jest.fn().mockResolvedValue(false),
      existsByLogin: jest.fn().mockResolvedValue(false),
      createUser: jest.fn().mockResolvedValue(user),
      findByLogin: jest.fn(),
      findById: jest.fn().mockResolvedValue(user),
    };
    tokensRepository = {
      create: jest.fn(),
      findByHash: jest.fn(),
      deleteById: jest.fn(),
      deleteByUserId: jest.fn(),
    };
    jwtService = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce('access.jwt')
        .mockResolvedValueOnce('refresh.jwt'),
      verifyAsync: jest.fn(),
      decode: jest.fn().mockReturnValue({ exp: 1893456000 }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: RefreshTokensRepository, useValue: tokensRepository },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => 'test-secret' },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('не даёт зарегистрироваться с занятым email', async () => {
    usersService.existsByEmail.mockResolvedValue(true);

    await expect(service.register(newUser)).rejects.toThrow(ConflictException);
    expect(usersService.createUser).not.toHaveBeenCalled();
  });

  it('регистрирует пользователя с хэшем пароля и выдаёт пару токенов', async () => {
    const result = await service.register(newUser);

    const created = usersService.createUser.mock.calls[0][0];
    await expect(
      bcrypt.compare('qwerty123', created.passwordHash),
    ).resolves.toBe(true);
    expect(result).toEqual({
      access_token: 'access.jwt',
      refresh_token: 'refresh.jwt',
    });
  });

  it('сохраняет в базу хэш refresh-токена, а не сам токен', async () => {
    await service.register(newUser);

    const stored = tokensRepository.create.mock.calls[0][0];
    expect(stored.tokenHash).not.toBe('refresh.jwt');
    expect(stored.userId).toBe(1);
  });

  it('не пускает с неверным паролем', async () => {
    usersService.findByLogin.mockResolvedValue({
      ...user,
      passwordHash: await bcrypt.hash('qwerty123', 10),
    });

    await expect(
      service.login({ login: 'sasha', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('не пускает с несуществующим логином', async () => {
    usersService.findByLogin.mockResolvedValue(null);

    await expect(
      service.login({ login: 'nobody', password: 'qwerty123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('при обновлении удаляет старый refresh-токен и выдаёт новую пару', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 1, login: 'sasha' });
    tokensRepository.findByHash.mockResolvedValue({ id: 7 });

    const result = await service.refresh('refresh.jwt');

    expect(tokensRepository.deleteById).toHaveBeenCalledWith(7);
    expect(result.refresh_token).toBe('refresh.jwt');
  });

  it('не принимает refresh-токен, которого нет в базе', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 1, login: 'sasha' });
    tokensRepository.findByHash.mockResolvedValue(null);

    await expect(service.refresh('refresh.jwt')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
