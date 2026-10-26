import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'login is required' })
  @Length(3, 40, {
    message: 'login must be at least 3 characters long and not more than 40',
  })
  @IsString()
  login: string;

  @IsNotEmpty({ message: 'email is required' })
  @IsEmail({}, { message: 'email is invalid' })
  email: string;

  @IsNotEmpty({ message: 'password is required' })
  @Length(6, 20, {
    message: 'password must be at least 6 characters long and not more than 20',
  })
  @IsString()
  password: string;

  @IsNotEmpty({ message: 'age is required' })
  @IsInt()
  @Min(1, { message: 'age must be greater than 1' })
  @Max(150, { message: 'age must be less than 150' })
  age: number;

  @Length(0, 1000, { message: 'about must be not more than 1000 characters' })
  @IsOptional()
  about?: string;
}
