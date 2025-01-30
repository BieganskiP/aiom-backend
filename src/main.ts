import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Get the environment
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Configure CORS
  app.enableCors({
    origin: isDevelopment
      ? [process.env.FRONTEND_URL || 'http://localhost:3000', '*']
      : [
          process.env.FRONTEND_URL || 'https://your-frontend-domain.com',
          process.env.MOBILE_APP_URL || '*',
          /\.railway\.app$/, // Allow all railway.app subdomains
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api/v1');

  // Use PORT from environment variables (Railway sets this automatically)
  const preferredPort = parseInt(process.env.PORT || '3001', 10);
  const maxRetries = 5;
  let currentPort = preferredPort;
  let started = false;

  for (let attempt = 0; attempt < maxRetries && !started; attempt++) {
    try {
      await app.listen(currentPort);
      started = true;
      console.log(`Application is running on port ${currentPort}`);
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.log(
          `Port ${currentPort} is in use, trying ${currentPort + 1}...`,
        );
        currentPort++;
      } else {
        throw error;
      }
    }
  }

  if (!started) {
    throw new Error(`Could not start server after ${maxRetries} attempts`);
  }
}
bootstrap();
