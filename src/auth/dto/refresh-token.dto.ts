import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'refresh_token is required' })
  @IsString()
  @IsJWT({ message: 'refresh_token must be a valid JWT' })
  refresh_token: string;
}
