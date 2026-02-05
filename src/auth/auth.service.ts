import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { EncoderService } from 'src/auth/encoder.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly encoderService: EncoderService,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findOneByEmailWithPassword(email);

    if (await this.encoderService.checkPassword(password, user.password)) {
      return user;
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
