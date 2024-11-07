import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles.guard';
import { ListUsersRequestDto } from './dto/list-users-request.dto';
import { ListUsersResponseDto } from './dto/list-users-response.dto';
import { Role } from './role';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getAllUsers: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return a list of users with pagination', async () => {
      const query: ListUsersRequestDto = {
        search: 'test',
        page: 1,
        pageCount: 10,
      };

      const response: ListUsersResponseDto = {
        data: [
          {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: Role.ADMIN,
            referralCode: 'ABC123',
            referredBy: '2',
          },
        ],
        total: 1,
      };

      jest.spyOn(usersService, 'getAllUsers').mockResolvedValue(response);

      const result = await usersController.getAllUsers(query);
      expect(result).toEqual(response);
      expect(usersService.getAllUsers).toHaveBeenCalledWith(query);
    });
  });
});
