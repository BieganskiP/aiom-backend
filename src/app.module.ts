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
import { RegionsModule } from './regions/regions.module';
import { Region } from './regions/entities/region.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const dbUrl = isDevelopment
          ? configService.get<string>('DATABASE_PUBLIC_URL')
          : configService.get<string>('DATABASE_URL');

        if (!dbUrl) {
          throw new Error(
            'Database URL is not defined in environment variables',
          );
        }

        return {
          type: 'postgres',
          url: dbUrl,
          entities: [User, Car, Route, WorkEntry, File, Region],
          synchronize: true,
          ssl: isDevelopment
            ? false
            : {
                rejectUnauthorized: false,
              },
          retryAttempts: 5,
          retryDelay: 3000,
          keepConnectionAlive: true,
          autoLoadEntities: true,
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
    RegionsModule,
  ],
})
export class AppModule {}
