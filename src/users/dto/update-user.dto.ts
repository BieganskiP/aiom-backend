import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsDate, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  carId?: string | null;

  @IsOptional()
  @IsString()
  routeId?: string | null;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  passwordResetToken?: string | null;

  @IsOptional()
  @IsDate()
  passwordResetExpires?: Date | null;

  @IsOptional()
  @IsString()
  invitationToken?: string | null;

  @IsOptional()
  @IsDate()
  invitationExpires?: Date | null;
}
