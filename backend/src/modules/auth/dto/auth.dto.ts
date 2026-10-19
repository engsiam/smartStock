import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'siam@example.com' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @ApiProperty({ example: 'Siam Ahmed' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @ApiProperty({ example: 'Dhaka Grocery Mart', required: false })
  @IsString()
  @IsOptional()
  businessName?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'owner@smartstock.local' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'jwt-refresh-token-string' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken!: string;
}
