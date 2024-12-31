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
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();
