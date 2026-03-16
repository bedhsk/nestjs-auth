import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { EncoderService } from 'src/auth/encoder.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly encoderService: EncoderService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    const hashedPassword = await this.encoderService.encodePassword(password);

    const user = this.usersRepository.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    try {
      return await this.usersRepository.save(user);
    } catch (e: unknown) {
      if (e instanceof QueryFailedError) {
        const driverError = e.driverError as {
          code?: string;
          detail?: string;
        };
        if (driverError.code === '23505') {
          throw new ConflictException('Email already exists');
        }
      }
      throw new InternalServerErrorException();
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneByEmailWithPassword(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'isActive'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
