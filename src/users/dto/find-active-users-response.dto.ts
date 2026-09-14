import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class FindActiveUsersDto {
  @IsInt({ message: 'minAge must be an integer' })
  @Min(1, { message: 'minAge must be at least 1' })
  @Max(150, { message: 'minAge must not be greater than 150' })
  @Type(() => Number)
  @IsOptional()
  minAge: number = 1;

  @IsInt({ message: 'maxAge must be an integer' })
  @Min(1, { message: 'maxAge must be at least 1' })
  @Max(150, { message: 'maxAge must not be greater than 150' })
  @Type(() => Number)
  @IsOptional()
  maxAge: number = 150;
}
