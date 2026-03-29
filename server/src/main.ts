import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseInterceptor, HttpExceptionFilter } from './common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // ── Global prefix ──
  app.setGlobalPrefix('api');

  // ── Static files (uploads) ──
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // ── Security ──
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({
    origin: ['http://localhost:7001', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  // ── Global pipes ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Global response wrapper ──
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ── Global error handler ──
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Swagger setup from config ──
  const swaggerCfg = new DocumentBuilder()
    .setTitle(config.get<string>('swagger.title', 'Famora API'))
    .setDescription(
      config.get<string>('swagger.description', 'Famora — Family Aura Finance API'),
    )
    .setVersion(config.get<string>('swagger.version', '1.0'))
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup(
    config.get<string>('swagger.path', 'api/docs'),
    app,
    document,
  );

  // ── Start ──
  const port = config.get<number>('PORT', 4000);
  await app.listen(port);

  logger.log(`Server running on http://localhost:${port}`);
  logger.log(
    `Swagger docs at http://localhost:${port}/${config.get<string>('swagger.path', 'api/docs')}`,
  );
}

bootstrap();
