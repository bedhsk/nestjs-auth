import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { ActivateUserDto } from './dto/activate-user.dto';
import { LoginDto } from './dto/login.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(loginDto);
  }

  @Get('/activate-account')
  activateAccount(@Query() activateUserDto: ActivateUserDto) {
    return this.authService.activateUser(activateUserDto);
  }

  @Patch('/request-reset-password')
  requestResetPassword(
    @Body() requestResetPasswordDto: RequestResetPasswordDto,
  ) {
    return this.authService.resetPasswordRequest(requestResetPasswordDto);
  }

  @Patch('/reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
