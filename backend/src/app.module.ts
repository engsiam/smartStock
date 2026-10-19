import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { validate } from './common/env.validation';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { SalesModule } from './modules/sales/sales.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { AiAdvisorModule } from './modules/ai-advisor/ai-advisor.module';
import { BusinessModule } from './modules/business/business.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env', '.env.example'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL_SECONDS', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 300),
        },
      ],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    SalesModule,
    PurchasesModule,
    AiAdvisorModule,
    BusinessModule,
  ],
})
export class AppModule {}
