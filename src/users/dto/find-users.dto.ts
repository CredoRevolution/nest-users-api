import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindUsersDto {
  @ApiPropertyOptional({ description: 'Номер страницы' })
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  @Type(() => Number)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ description: 'Сколько пользователей на странице' })
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(100, { message: 'limit must not be greater than 100' })
  @Type(() => Number)
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Часть логина, без учёта регистра',
  })
  @IsString()
  @MaxLength(40)
  @IsOptional()
  login?: string;
}
