import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { CreateUserData } from './types/CreateUserData';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findByEmail(email: string) :  Promise<User | null>{
    return await this.usersRepository.findByEmail(email);
  }

  async findByLogin(login: string) :  Promise<User | null>{
    return await this.usersRepository.findByLogin(login);
  }

  async createUser(user: CreateUserData) {
    return await this.usersRepository.createUser(user);
  }
}
