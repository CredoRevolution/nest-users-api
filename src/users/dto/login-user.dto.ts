import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty({ message: 'login is required' })
  @IsString()
  login: string;

  @IsNotEmpty({ message: 'password is required' })
  @IsString()
  password: string;
}
