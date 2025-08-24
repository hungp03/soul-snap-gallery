import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const frontendUrl = configService.get<string>('FRONTEND_URL');
  // Enable CORS
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  const port = configService.get<number>('PORT', 8000);
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();