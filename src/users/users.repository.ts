import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateUserData } from './types/CreateUserData';
import { FindUsersDto } from './dto/find-users.dto';
import { FindActiveUsersResponseDto } from './dto/find-active-users-response.dto';

const FIND_ACTIVE_USERS_SQL = `
    WITH latest_avatars AS (SELECT DISTINCT ON(avatars."userId")avatars."userId", avatars.name, avatars."createdAt"
    FROM avatars
    WHERE avatars."deletedAt" IS NULL
    ORDER BY avatars."userId", avatars."createdAt" DESC)
    SELECT u.id, u.login, COUNT(a.id)::int AS "avatarsCount", la.name AS "latestAvatar"
    FROM users u
    JOIN avatars a ON a."userId" = u.id
    JOIN latest_avatars la ON la."userId" = u.id
    WHERE u."deletedAt" IS NULL AND u.about IS NOT NULL AND u.about != '' AND u.age BETWEEN $1 AND $2 AND a."deletedAt" IS NULL
    GROUP BY u.id, u.login, la.name
    HAVING COUNT(a.id) > 2
  `;

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

  existsByEmail(email: string): Promise<boolean> {
    return this.userRepository.exists({ where: { email }, withDeleted: true });
  }

  existsByLogin(login: string): Promise<boolean> {
    return this.userRepository.exists({ where: { login }, withDeleted: true });
  }

  async createUser(user: CreateUserData) {
    const result = this.userRepository.create(user);
    return this.userRepository.save(result);
  }

  updateUser(user: User, data: Partial<User>): Promise<User> {
    return this.userRepository.save(this.userRepository.merge(user, data));
  }

  async findActiveUsers(
    minAge: number,
    maxAge: number,
  ): Promise<FindActiveUsersResponseDto[]> {
    return await this.userRepository.query(FIND_ACTIVE_USERS_SQL, [
      minAge,
      maxAge,
    ]);
  }

  async softDeleteUser(id: number): Promise<void> {
    await this.userRepository.softDelete({ id });
  }

  private escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, (char) => '\\' + char);
  }
}
