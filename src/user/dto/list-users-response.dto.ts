import { Role } from '../role';

class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  referralCode: string;
  referredBy?: string;
}

export class ListUsersResponseDto {
  data: UserResponseDto[];
  total: number;
}
