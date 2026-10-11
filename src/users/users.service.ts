import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { CreateUserData } from './types/CreateUserData';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUsersDto } from './dto/paginated-users.dto';
import { FindActiveUsersResponseDto } from './dto/find-active-users-response.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(query: FindUsersDto): Promise<PaginatedUsersDto> {
    const [data, total] = await this.usersRepository.findAndCount(query);

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findByEmail(email);
  }

  async findById(id: number): Promise<User | null> {
    return await this.usersRepository.findById(id);
  }

  async findByIdOrFail(id: number): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByLogin(login: string): Promise<User | null> {
    return await this.usersRepository.findByLogin(login);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return await this.usersRepository.existsByEmail(email);
  }

  async existsByLogin(login: string): Promise<boolean> {
    return await this.usersRepository.existsByLogin(login);
  }

  async createUser(user: CreateUserData) {
    return await this.usersRepository.createUser(user);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findByIdOrFail(id);

    if (dto.email && dto.email !== user.email) {
      if (await this.existsByEmail(dto.email)) {
        throw new ConflictException('User with this email already exists');
      }
    }
    if (dto.login && dto.login !== user.login) {
      if (await this.existsByLogin(dto.login)) {
        throw new ConflictException('User with this login already exists');
      }
    }

    const { password, ...fields } = dto;
    const data: Partial<User> = { ...fields };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
      data.tokenVersion = user.tokenVersion + 1;
    }

    const response = await this.usersRepository.updateUser(user, data);
    await this.invalidateCache(`/users/${user.id}`);
    return response;
  }

  private async invalidateCache(key: string) {
    await this.cacheManager.del(key);
  }

  async invalidateUserCache(id: number): Promise<void> {
    await this.invalidateCache(`/users/${id}`);
  }

  async softDeleteUser(id: number): Promise<void> {
    await this.findByIdOrFail(id);
    await this.usersRepository.softDeleteUser(id);
    await this.invalidateCache(`/users/${id}`);
  }

  async findActiveUsers(
    minAge: number,
    maxAge: number,
  ): Promise<FindActiveUsersResponseDto[]> {
    return await this.usersRepository.findActiveUsers(minAge, maxAge);
  }
}
