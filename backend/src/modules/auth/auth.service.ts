import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { BusinessRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly accessTtl: string;
  private readonly refreshTtl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTtl = this.configService.get<string>('JWT_ACCESS_TTL', '15m');
    this.refreshTtl = this.configService.get<string>('JWT_REFRESH_TTL', '7d');
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email address is already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    // Atomic user & initial business creation
    const businessName = dto.businessName || `${dto.name}'s Shop`;
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          name: dto.name,
          passwordHash,
        },
      });

      const business = await tx.business.create({
        data: {
          name: businessName,
          currency: 'BDT',
          timezone: 'Asia/Dhaka',
        },
      });

      await tx.businessMember.create({
        data: {
          businessId: business.id,
          userId: user.id,
          role: BusinessRole.OWNER,
        },
      });

      return { user, business };
    });

    const tokens = await this.generateTokens(result.user.id, result.user.email, result.user.name);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      business: result.business,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        memberships: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!user) {
      // Constant-time generic error to prevent email enumeration
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.name);

     
    const { passwordHash: _, ...safeUser } = user;

    return {
      user: safeUser,
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    // Token rotation: Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new token pair
    return this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.name,
    );
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash, userId },
        data: { revokedAt: new Date() },
      });
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private async generateTokens(userId: string, email: string, name: string) {
    const payload = { sub: userId, email, name };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessTtl as any,
    });

    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
