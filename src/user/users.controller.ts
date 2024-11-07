import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ListUsersRequestDto } from './dto/list-users-request.dto';
import { ListUsersResponseDto } from './dto/list-users-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  async getAllUsers(
    @Query() query: ListUsersRequestDto,
  ): Promise<ListUsersResponseDto> {
    const result = await this.usersService.getAllUsers(query);
    return result;
  }
}
