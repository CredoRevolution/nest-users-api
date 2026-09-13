import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// id во всех таблицах — SERIAL, то есть integer в Postgres. Число больше
// этого база не примет и упадёт с "value out of range", наружу уйдёт 500.
// Поэтому отсекаем его ещё на входе, как 400.
const PG_INT_MAX = 2147483647;

// Для роутов вида /:id — подключается как @Param() { id }: IdParamDto
export class IdParamDto {
  @ApiProperty({ description: 'Идентификатор записи' })
  @IsInt({ message: 'id must be an integer' })
  @Min(1, { message: 'id must be at least 1' })
  @Max(PG_INT_MAX, { message: `id must not be greater than ${PG_INT_MAX}` })
  @Type(() => Number)
  id: number;
}
