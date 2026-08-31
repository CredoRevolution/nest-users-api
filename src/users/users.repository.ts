import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateUserData } from './types/CreateUserData';
import { FindUsersDto } from './dto/find-users.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAndCount({
    page,
    limit,
    login,
  }: FindUsersDto): Promise<[User[], number]> {
    return this.userRepository.findAndCount({
      where: login ? { login: ILike(`%${this.escapeLike(login)}%`) } : {},
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({
      email,
    });
  }

  findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({
      id,
    });
  }

  findByLogin(login: string): Promise<User | null> {
    return this.userRepository.findOneBy({
      login,
    });
  }

  async createUser(user: CreateUserData) {
    const result = this.userRepository.create(user);
    return this.userRepository.save(result);
  }

  private escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, (char) => '\\' + char);
  }
}
