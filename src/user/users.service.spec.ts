import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import User from './user.entity';
import { ListUsersRequestDto } from './dto/list-users-request.dto';
import { ListUsersResponseDto } from './dto/list-users-response.dto';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return paginated list of users', async () => {
      const query: ListUsersRequestDto = {
        search: 'test',
        page: 0,
        pageCount: 2,
      };

      const mockUsers: User[] = [
        {
          id: '1',
          email: 'test1@example.com',
          name: 'Test User 1',
          role: 'ADMIN',
          referralCode: 'REF1',
          referredBy: '2',
        } as User,
        {
          id: '2',
          email: 'test2@example.com',
          name: 'Test User 2',
          role: 'USER',
          referralCode: 'REF2',
          referredBy: '1',
        } as User,
      ];

      const total = mockUsers.length;

      // Mock the query builder
      const createQueryBuilder: any = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(total),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      };

      jest
        .spyOn(usersRepository, 'createQueryBuilder')
        .mockReturnValue(createQueryBuilder);

      const result: ListUsersResponseDto = await service.getAllUsers(query);

      expect(result).toEqual({
        data: [
          {
            id: '1',
            email: 'test1@example.com',
            name: 'Test User 1',
            role: 'ADMIN',
            referralCode: 'REF1',
            referredBy: '2',
          },
          {
            id: '2',
            email: 'test2@example.com',
            name: 'Test User 2',
            role: 'USER',
            referralCode: 'REF2',
            referredBy: '1',
          },
        ],
        total,
      });

      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
      expect(createQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(createQueryBuilder.take).toHaveBeenCalledWith(2);
      expect(createQueryBuilder.getCount).toHaveBeenCalled();
      expect(createQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should return all users if no search query is provided', async () => {
      const query: ListUsersRequestDto = {
        page: 0,
        pageCount: 10,
      };

      const mockUsers: User[] = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User One',
          role: 'ADMIN',
          referralCode: 'REF1',
          referredBy: null,
        } as User,
      ];

      const total = mockUsers.length;

      const createQueryBuilder: any = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(total),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      };

      jest
        .spyOn(usersRepository, 'createQueryBuilder')
        .mockReturnValue(createQueryBuilder);

      const result: ListUsersResponseDto = await service.getAllUsers(query);

      expect(result).toEqual({
        data: [
          {
            id: '1',
            email: 'user1@example.com',
            name: 'User One',
            role: 'ADMIN',
            referralCode: 'REF1',
            referredBy: null,
          },
        ],
        total,
      });

      expect(createQueryBuilder.andWhere).not.toHaveBeenCalled(); // No search query provided
      expect(createQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(createQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(createQueryBuilder.getCount).toHaveBeenCalled();
      expect(createQueryBuilder.getMany).toHaveBeenCalled();
    });
  });
});
