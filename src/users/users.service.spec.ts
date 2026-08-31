import { Test } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    findAndCount: jest.Mock;
    findById: jest.Mock;
    existsByEmail: jest.Mock;
    existsByLogin: jest.Mock;
    updateUser: jest.Mock;
    softDeleteUser: jest.Mock;
  };

  const user = { id: 1, login: 'sasha', email: 'sasha@example.com' } as User;

  beforeEach(async () => {
    repository = {
      findAndCount: jest.fn(),
      findById: jest.fn().mockResolvedValue(user),
      existsByEmail: jest.fn().mockResolvedValue(false),
      existsByLogin: jest.fn().mockResolvedValue(false),
      updateUser: jest.fn().mockResolvedValue(user),
      softDeleteUser: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('возвращает страницу пользователей вместе с мета-информацией', async () => {
    repository.findAndCount.mockResolvedValue([[user], 42]);

    const result = await service.findAll({ page: 2, limit: 10 });

    expect(result.data).toEqual([user]);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 42,
      totalPages: 5,
    });
  });

  it('бросает 404, если пользователя нет', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findByIdOrFail(1)).rejects.toThrow(NotFoundException);
  });

  it('бросает 409, если новый логин уже занят', async () => {
    repository.existsByLogin.mockResolvedValue(true);

    await expect(service.updateUser(1, { login: 'violetta' })).rejects.toThrow(
      ConflictException,
    );
    expect(repository.updateUser).not.toHaveBeenCalled();
  });

  it('не проверяет занятость логина, если он не меняется', async () => {
    await service.updateUser(1, { login: 'sasha' });

    expect(repository.existsByLogin).not.toHaveBeenCalled();
  });

  it('сохраняет хэш пароля вместо самого пароля', async () => {
    await service.updateUser(1, { password: 'newpassword' });

    const data = repository.updateUser.mock.calls[0][1];
    expect(data.password).toBeUndefined();
    await expect(
      bcrypt.compare('newpassword', data.passwordHash),
    ).resolves.toBe(true);
  });

  it('мягко удаляет существующего пользователя', async () => {
    await service.softDeleteUser(1);

    expect(repository.softDeleteUser).toHaveBeenCalledWith(1);
  });
});
