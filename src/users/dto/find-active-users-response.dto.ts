import { ApiProperty } from '@nestjs/swagger';

export class FindActiveUsersResponseDto {
  @ApiProperty({ example: 42 })
  id: number;

  @ApiProperty({ example: 'sasha' })
  login: string;

  @ApiProperty({
    description: 'Количество неудалённых аватаров',
    example: 3,
  })
  avatarsCount: number;

  @ApiProperty({
    description: 'Имя файла самого свежего неудалённого аватара',
    example: '3f2b8c1e-9a4d-4e7b-b6a1-5c0d2e8f7a90.png',
  })
  latestAvatar: string;
}
