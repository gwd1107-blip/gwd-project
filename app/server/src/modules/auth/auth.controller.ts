/**
 * 文件：server/src/modules/auth/auth.controller.ts
 * 职责：登录 API
 * 对应设计：docs/02-开发计划.md R1
 */
import { Body, Controller, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

class LoginDto {
  @IsString()
  userid!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.userid);
  }
}
