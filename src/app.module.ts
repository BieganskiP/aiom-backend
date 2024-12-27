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

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DB_NAME', 'db.sqlite'),
        entities: [User, Car, Route, WorkEntry],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    CarsModule,
    RoutesModule,
    EmailModule,
    WorkEntriesModule,
  ],
})
export class AppModule {}
