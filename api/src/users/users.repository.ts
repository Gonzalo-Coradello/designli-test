import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(data: { email: string; password: string }): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async updateFcmToken(id: string, fcmToken: string): Promise<User | null> {
    const user = await this.findById(id);

    if (!user) {
      return null;
    }

    user.fcmToken = fcmToken;
    return this.repository.save(user);
  }
}
