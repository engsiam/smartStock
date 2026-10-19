import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  DATABASE_URL?: string;

  @IsString()
  @IsOptional()
  DIRECT_URL?: string;

  @IsString()
  @IsOptional()
  DATABASE_URL_TEST?: string;

  @IsString()
  @IsOptional()
  SUPABASE_URL?: string;

  @IsString()
  @IsOptional()
  SUPABASE_ANON_KEY?: string;

  @IsString()
  @IsOptional()
  SUPABASE_SERVICE_ROLE_KEY?: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = 'http://localhost:5173';

  @IsString()
  @MinLength(32, { message: 'JWT_SECRET must be at least 32 characters long' })
  @IsOptional()
  JWT_SECRET: string = 'development-default-secret-min-32-chars-long!';

  @IsString()
  @IsOptional()
  JWT_ACCESS_TTL: string = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_TTL: string = '7d';

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL_SECONDS: number = 60;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT: number = 300;

  @IsString()
  @IsOptional()
  GEMINI_API_KEY?: string;

  @IsString()
  @IsOptional()
  GEMINI_MODEL: string = 'gemini-2.5-flash';

  @IsNumber()
  @IsOptional()
  GEMINI_TIMEOUT_MS: number = 10000;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}
