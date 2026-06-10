import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  create(email: string, password: string): Promise<User> {
    return this.usersRepository.create({ email, password });
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<User> {
    const user = await this.usersRepository.updateFcmToken(userId, fcmToken);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
