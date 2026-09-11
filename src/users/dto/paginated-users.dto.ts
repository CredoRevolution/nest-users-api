import { User } from '../entities/user.entity';

export class PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class PaginatedUsersDto {
  data: User[];
  meta: PaginationMetaDto;
}
