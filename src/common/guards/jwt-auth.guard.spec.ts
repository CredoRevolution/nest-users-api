import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: { verifyAsync: jest.Mock };
  let usersService: { findById: jest.Mock };

  const payload = { sub: 1, login: 'sasha', ver: 3 };
  const user = { id: 1, login: 'sasha', tokenVersion: 3 } as User;

  const contextWith = (request: object) =>
    ({
      switchToHttp: () => ({ getRequest: () => request }),
    }) as ExecutionContext;

  const requestWithToken = (): { headers: object; user?: unknown } => ({
    headers: { authorization: 'Bearer access.jwt' },
  });

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn().mockResolvedValue(payload) };
    usersService = { findById: jest.fn().mockResolvedValue(user) };

    guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
      { getOrThrow: () => 'test-secret' } as unknown as ConfigService,
      usersService as unknown as UsersService,
    );
  });

  it('пускает с валидным токеном и кладёт payload в request.user', async () => {
    const request = requestWithToken();

    await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);
    expect(usersService.findById).toHaveBeenCalledWith(1);
    expect(request.user).toEqual(payload);
  });

  it('не пускает без заголовка Authorization', async () => {
    await expect(
      guard.canActivate(contextWith({ headers: {} })),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('не пускает с просроченным или поддельным токеном', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(
      guard.canActivate(contextWith(requestWithToken())),
    ).rejects.toThrow(UnauthorizedException);
    expect(usersService.findById).not.toHaveBeenCalled();
  });

  it('не пускает удалённого пользователя', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(
      guard.canActivate(contextWith(requestWithToken())),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('не пускает с токеном, выданным до смены пароля', async () => {
    usersService.findById.mockResolvedValue({ ...user, tokenVersion: 4 });

    await expect(
      guard.canActivate(contextWith(requestWithToken())),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('не выдаёт падение базы за 401', async () => {
    const dbError = new Error('connection refused');
    usersService.findById.mockRejectedValue(dbError);

    await expect(
      guard.canActivate(contextWith(requestWithToken())),
    ).rejects.toBe(dbError);
  });
});
