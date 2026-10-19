import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyHelmet from '@fastify/helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const adapter = new FastifyAdapter({
    logger: process.env.NODE_ENV !== 'production',
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  // Security Headers via Fastify Helmet
  await app.register(fastifyHelmet as any, {
    contentSecurityPolicy: false,
  });

  // Global API Prefix with /health and /api/health preserved
  app.setGlobalPrefix('api', {
    exclude: ['health', 'api/health'],
  });

  // CORS configuration
  const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SmartStock API')
    .setDescription(
      'AI-Powered Inventory Management System for Small Businesses in Bangladesh (Phase A Foundation)',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('Health', 'Health and uptime diagnostics')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');

  // eslint-disable-next-line no-console
  console.log(`SmartStock API ready at http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`Health endpoint: http://localhost:${port}/health`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs at: http://localhost:${port}/api/docs`);
}

bootstrap();
