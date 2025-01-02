import { Controller, Get, Patch, Body, UseGuards, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SettingKey } from './entities/setting.entity';
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingDto {
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  value: number;
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
    return this.settingsService.updateValue(key, updateSettingDto.value);
  }
}
