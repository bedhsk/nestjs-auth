import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { EncoderService } from './encoder.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, EncoderService],
  // exports: [AuthService],
})
export class AuthModule {}
