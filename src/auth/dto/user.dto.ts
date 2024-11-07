import { IsNotEmpty, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../../user/role';

export class AuthUserDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either ADMIN or USER' })
  role?: Role = Role.USER;

  @IsNotEmpty()
  token: string;
}
