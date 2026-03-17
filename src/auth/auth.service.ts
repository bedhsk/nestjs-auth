import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EncoderService } from 'src/auth/encoder.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { v4 } from 'uuid';
import { ActivateUserDto } from './dto/activate-user.dto';
import { LoginDto } from './dto/login.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './jwt-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from 'src/users/entities/user.entity';

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

  async resetPasswordRequest(requestPasswordDto: RequestResetPasswordDto) {
    const { email } = requestPasswordDto;
    const user = await this.usersService.findOneByEmail(email);
    user.resetPasswordToken = v4();
    this.usersService.update(user);
    // Send email (e.g. Dispatch an event so MailerModule can send the email)
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { resetPasswordToken, newPassword } = resetPasswordDto;
    const user =
      await this.usersService.findOneByResetPasswordToken(resetPasswordToken);

    user.password = await this.encoderService.encodePassword(newPassword);
    user.resetPasswordToken = null;
    this.usersService.update(user);
  }

  async changePassword(changePasswordDto: ChangePasswordDto, user: User) {
    const { oldPassword, newPassword } = changePasswordDto;
    if (await this.encoderService.checkPassword(oldPassword, user.password)) {
      user.password = await this.encoderService.encodePassword(newPassword);
      this.usersService.update(user);
    } else {
      throw new BadRequestException('Old password is incorrect');
    }
  }
}
