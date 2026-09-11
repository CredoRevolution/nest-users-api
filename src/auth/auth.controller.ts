import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Зарегистрироваться и сразу получить пару токенов' })
  @ApiCreatedResponse({ type: AuthTokensDto })
  @ApiBadRequestResponse({ description: 'Тело запроса не прошло валидацию' })
  @ApiConflictResponse({ description: 'Логин или email уже заняты' })
  register(@Body() dto: CreateUserDto): Promise<AuthTokensDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Войти по логину и паролю' })
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiBadRequestResponse({ description: 'Не передан логин или пароль' })
  @ApiUnauthorizedResponse({ description: 'Неверный логин или пароль' })
  login(@Body() dto: LoginUserDto): Promise<AuthTokensDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обменять refresh-токен на новую пару токенов',
    description:
      'Refresh-токен одноразовый: после обмена старый перестаёт работать. ' +
      'Повторное предъявление уже использованного токена считается кражей: ' +
      'отзываются все refresh-токены пользователя. Уже выданные ' +
      'access-токены работают до своего истечения.',
  })
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiBadRequestResponse({ description: 'refresh_token не передан или не JWT' })
  @ApiUnauthorizedResponse({
    description:
      'Токен просрочен, уже использован, отозван (выход, смена пароля) ' +
      'или пользователь удалён',
  })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensDto> {
    return this.authService.refresh(dto.refresh_token);
  }
}
