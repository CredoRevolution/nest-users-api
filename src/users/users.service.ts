import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { CreateUserData } from './types/CreateUserData';
import { FindUsersDto } from './dto/find-users.dto';
import { PaginatedUsersDto } from './dto/paginated-users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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

  async createUser(user: CreateUserData) {
    return await this.usersRepository.createUser(user);
  }
}
