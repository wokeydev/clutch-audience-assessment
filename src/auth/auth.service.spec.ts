import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import User from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '../user/role';

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should successfully register a user and return a token', async () => {
      const signUpDto: SignUpDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: Role.USER,
        referralCode: 'ABC123',
      };

      const hashedPassword = 'hashed-password';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      jest
        .spyOn(authService as any, 'generateReferralCode')
        .mockReturnValue('REFCODE');

      const referredByUser = { id: '2', referralCode: 'ABC123' } as User;
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(referredByUser);
      jest.spyOn(usersRepository, 'create').mockReturnValue({
        id: '1',
        ...signUpDto,
        password: hashedPassword,
        referralCode: 'REFCODE',
        referredBy: referredByUser.id,
      } as User);

      // Mock usersRepository.save to return a user with an id
      jest.spyOn(usersRepository, 'save').mockResolvedValue({
        id: '1',
        ...signUpDto,
        password: hashedPassword,
        referralCode: 'REFCODE',
        referredBy: referredByUser.id,
      } as User);

      const result = await authService.signUp(signUpDto);

      expect(result).toEqual({ token: 'test-token' });
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 10);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: '1' });
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { referralCode: signUpDto.referralCode },
      });
      expect(usersRepository.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should log in a user and return an auth response with token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: '1',
        email: loginDto.email,
        name: 'Test User',
        password: 'hashed-password',
        role: 'USER',
      } as User;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        token: 'test-token',
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({ id: mockUser.id });
    });

    it('should throw UnauthorizedException if email is incorrect', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      const loginDto: LoginDto = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser: User = {
        id: '1',
        email: loginDto.email,
        name: 'Test User',
        password: 'hashed-password',
        role: 'USER',
      } as User;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });
  });
});
