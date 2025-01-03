import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SettingKey } from './entities/setting.entity';
import { IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

const NUMERIC_SETTINGS = [
  SettingKey.COMPANY_RATE_PER_STOP,
  SettingKey.COMPANY_CAR_RATE,
];

export class UpdateSettingDto {
  @IsNotEmpty()
  value: string | number;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Patch(':key')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  updateSetting(
    @Param('key') key: SettingKey,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    // Validate numeric settings
    if (NUMERIC_SETTINGS.includes(key)) {
      const numValue = Number(updateSettingDto.value);
      if (isNaN(numValue) || numValue < 0) {
        throw new BadRequestException(
          `Setting ${key} requires a positive numeric value`,
        );
      }
    }

    return this.settingsService.updateValue(key, updateSettingDto.value);
  }
}
