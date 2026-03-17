import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  async create(
    name: string,
    email: string,
    password: string,
    activationToken: string,
  ): Promise<void> {
    const user = this.usersRepository.create({
      name,
      email,
      password,
      activationToken,
    });

    try {
      await this.usersRepository.save(user);
    } catch (e) {
      if (e.code === '23505') {
        throw new ConflictException('This email is already registered');
      }
      throw new InternalServerErrorException();
    }
  }

  async update(user: User) {
    await this.usersRepository.save(user);
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async findOneByEmailOrNull(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findOneByEmailWithPassword(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'isActive'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async findOneInactiveByActivationToken(id: string, code: string) {
    return await this.usersRepository.findOne({
      where: { id, activationToken: code, isActive: false },
    });
  }

  async activateUser(user: User) {
    user.isActive = true;
    await this.usersRepository.save(user);
  }

  async findOneByResetPasswordToken(resetPasswordToken: string) {
    const user = await this.usersRepository.findOne({
      where: { resetPasswordToken },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
