import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserData } from './types/CreateUserData';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
  findByEmail(email : string): Promise<User | null>{
    return this.userRepository.findOneBy({
      email
    })
  }
  
  findByLogin(login : string): Promise<User | null>{
    return this.userRepository.findOneBy({
      login
    })
  }

  async createUser(user: CreateUserData) {
    const result =  this.userRepository.create(user)
    return this.userRepository.save(result);
  }
}
