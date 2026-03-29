import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { FamilyService } from '../family/family.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private familyService: FamilyService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check duplicate email
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // Create user
    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    // Auto-create family with this user as admin
    await this.familyService.createFamily({
      name: dto.familyName,
      ownerId: user._id,
      ownerName: user.name,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user._id, user.email);
    await this.userService.updateRefreshToken(user._id, tokens.refreshToken);

    return {
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isTemporaryPassword: false,
        },
        ...tokens,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user._id, user.email);
    await this.userService.updateRefreshToken(user._id, tokens.refreshToken);

    return {
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isTemporaryPassword: user.isTemporaryPassword,
        },
        ...tokens,
      },
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.userService.updatePassword(userId, hashedPassword);

    return {
      message: 'Password changed successfully',
      data: null,
    };
  }

  async getMe(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Get user's families
    const families = await this.familyService.getUserFamilies(userId);

    return {
      message: 'User profile',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: (user as any).phone || null,
        avatar: user.avatar,
        isTemporaryPassword: user.isTemporaryPassword,
        families,
        createdAt: user.createdAt,
      },
    };
  }

  async logout(userId: string) {
    await this.userService.updateRefreshToken(userId, null);
    return { message: 'Logged out', data: null };
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as any, {
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m') as any,
      }),
      this.jwtService.signAsync(payload as any, {
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
