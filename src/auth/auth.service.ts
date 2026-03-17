import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EncoderService } from 'src/auth/encoder.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { v4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt-payload.interface';
import { ActivateUserDto } from './dto/activate-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly encoderService: EncoderService,
    private jwtService: JwtService,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const { password } = createUserDto;
    const hashedPasword = await this.encoderService.encodePassword(password);
    return await this.usersService.create({
      ...createUserDto,
      password: hashedPasword,
      activationToken: v4(),
    });
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

  async activateUser(activateUserDto: ActivateUserDto) {
    const { id, code } = activateUserDto;
    const user = await this.usersService.findOneInactiveByActivationToken(
      id,
      code,
    );

    if (!user) {
      throw new UnprocessableEntityException('Invalid activation token');
    }

    await this.usersService.activateUser(user);
  }
}
