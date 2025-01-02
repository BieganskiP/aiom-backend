import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting, SettingKey } from './entities/setting.entity';

const DEFAULT_SETTINGS = {
  [SettingKey.COMPANY_RATE_PER_STOP]: 3.5,
  [SettingKey.COMPANY_CAR_RATE]: 6.0,
};

@Injectable()
export class SettingsService {
  private settingsCache: Map<string, number> = new Map();

  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {
    this.initializeSettings();
  }

  private async initializeSettings() {
    // Initialize default settings if they don't exist
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const setting = await this.settingsRepository.findOne({
        where: { key: key as SettingKey },
      });
      if (!setting) {
        await this.settingsRepository.save({
          key: key as SettingKey,
          value,
          description: `Default value for ${key}`,
        });
      }
    }
    await this.refreshCache();
  }

  private async refreshCache() {
    const settings = await this.settingsRepository.find();
    this.settingsCache.clear();
    settings.forEach((setting) => {
      this.settingsCache.set(setting.key, Number(setting.value));
    });
  }

  async getValue(key: SettingKey): Promise<number> {
    if (!this.settingsCache.has(key)) {
      await this.refreshCache();
    }
    return this.settingsCache.get(key) || DEFAULT_SETTINGS[key];
  }

  async updateValue(key: SettingKey, value: number): Promise<Setting> {
    const setting = await this.settingsRepository.findOne({
      where: { key },
    });
    if (!setting) {
      throw new NotFoundException(`Setting ${key} not found`);
    }

    // Convert to number with 2 decimal places
    setting.value = Number(Number(value).toFixed(2));

    const updated = await this.settingsRepository.save(setting);
    await this.refreshCache();
    return updated;
  }

  async getAllSettings(): Promise<Setting[]> {
    return this.settingsRepository.find();
  }
}
