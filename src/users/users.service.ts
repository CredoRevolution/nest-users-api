import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  findOne(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }
  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
