import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EncoderService } from 'src/auth/encoder.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly encoderService: EncoderService,
    private jwtService: JwtService,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;
    const user = await this.usersService.findOneByEmailWithPassword(email);
    if (await this.encoderService.checkPassword(password, user.password)) {
      const payload: JwtPayload = { id: user.id, email, active: user.isActive };
      const accessToken = this.jwtService.sign(payload);

      return { accessToken };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
