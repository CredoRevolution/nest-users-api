import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FindUsersDto } from './dto/find-users.dto';
import { PaginatedUsersDto } from './dto/paginated-users.dto';
import { User } from './entities/user.entity';
import { IdParamDto } from '../common/dto/id-param.dto';
import { FindActiveUsersDto } from './dto/find-active-users.dto';
import { FindActiveUsersResponseDto } from './dto/find-active-users-response.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Нет access-токена, он просрочен или отозван',
})
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseInterceptors(CacheInterceptor, ClassSerializerInterceptor)
  @ApiOperation({
    summary: 'Список пользователей постранично, с поиском по части логина',
  })
  @ApiOkResponse({ type: PaginatedUsersDto })
  @ApiBadRequestResponse({ description: 'Некорректные page, limit или login' })
  findAll(@Query() query: FindUsersDto): Promise<PaginatedUsersDto> {
    return this.userService.findAll(query);
  }

  @Get('active')
  findAllActive(
    @Query() { minAge, maxAge }: FindActiveUsersDto,
  ): Promise<FindActiveUsersResponseDto[]> {
    return this.userService.findActiveUsers(minAge, maxAge);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor, ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Получить пользователя по id' })
  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse({
    description: 'id не целое число или вне диапазона 1..2147483647',
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден или удалён' })
  findOne(@Param() { id }: IdParamDto): Promise<User> {
    return this.userService.findByIdOrFail(id);
  }
}
