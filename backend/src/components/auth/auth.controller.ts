import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import {
  GetNonceDto,
  LoginDto,
  LoginResponseDto,
  NonceResponseDto,
  CheckRoleResponseDto
} from './auth.dto';
import { AuthService } from './auth.service';
@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('nonce')
  @ApiBody({
    type: GetNonceDto
  })
  async nonce(@Body() getNonceDto: GetNonceDto): Promise<NonceResponseDto> {
    const nonce = await this.authService.getNonce(getNonceDto);

    return {
      nonce
    };
  }

  @Post('login')
  @ApiBody({
    type: LoginDto
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const token = await this.authService.login(loginDto);

    return {
      token
    };
  }

  @Get('check-admin-role/:address')
  async checkAdmin(@Param('address') address: string): Promise<CheckRoleResponseDto> {
    const role = await this.authService.checkAdminRole(address);
    return { role };
  }
}
