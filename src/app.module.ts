import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Car } from './cars/entities/car.entity';
import { Route } from './routes/entities/route.entity';
import { WorkEntry } from './work-entries/entities/work-entry.entity';
import { CarsModule } from './cars/cars.module';
import { RoutesModule } from './routes/routes.module';
import { EmailModule } from './email/email.module';
import { WorkEntriesModule } from './work-entries/work-entries.module';
import { FilesModule } from './files/files.module';
import { File } from './files/entities/file.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = process.env.NODE_ENV !== 'production';
        return {
          type: 'postgres',
          url: isDevelopment
            ? configService.get<string>('DATABASE_URL')
            : configService.get<string>('DATABASE_PUBLIC_URL'),
          entities: [User, Car, Route, WorkEntry, File],
          synchronize: true,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    CarsModule,
    RoutesModule,
    EmailModule,
    WorkEntriesModule,
    FilesModule,
  ],
})
export class AppModule {}
