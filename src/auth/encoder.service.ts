import { Injectable } from '@nestjs/common';
import * as bcript from 'bcrypt';

@Injectable()
export class EncoderService {
  async encodePassword(password: string): Promise<string> {
    return await bcript.hash(password, 10);
  }

  async checkPassword(
    password: string,
    userPassword: string,
  ): Promise<boolean> {
    return await bcript.compare(password, userPassword);
  }
}
