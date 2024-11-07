import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import User from './user.entity';
import { ListUsersRequestDto } from './dto/list-users-request.dto';
import { ListUsersResponseDto } from './dto/list-users-response.dto';

export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getAllUsers(query: ListUsersRequestDto): Promise<ListUsersResponseDto> {
    const page = query.page ?? 0;
    const pageCount = query.pageCount ?? 10;
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (query.search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const total = await queryBuilder.getCount();

    const skip = page * pageCount;
    queryBuilder.skip(skip).take(pageCount);

    const users = await queryBuilder.getMany();

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
      })),
      total,
    };
  }
}
