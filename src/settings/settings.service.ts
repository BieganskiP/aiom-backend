import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting, SettingKey } from './entities/setting.entity';

const DEFAULT_SETTINGS = {
  [SettingKey.COMPANY_RATE_PER_STOP]: '3.5',
  [SettingKey.COMPANY_CAR_RATE]: '6.0',
  [SettingKey.PARENT_COMPANY_DISPLAY_NAME]: 'Parent Company',
  [SettingKey.OWN_COMPANY_DISPLAY_NAME]: 'Own Company',
};

const NUMERIC_SETTINGS = [
  SettingKey.COMPANY_RATE_PER_STOP,
  SettingKey.COMPANY_CAR_RATE,
];

@Injectable()
export class SettingsService {
  private settingsCache: Map<string, string> = new Map();

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
        const newSetting = this.settingsRepository.create({
          key: key as SettingKey,
          description: `Default value for ${key}`,
        });
        newSetting.value = value;
        await this.settingsRepository.save(newSetting);
      }
    }
    await this.refreshCache();
  }

  private async refreshCache() {
    const settings = await this.settingsRepository.find();
    this.settingsCache.clear();
    settings.forEach((setting) => {
      this.settingsCache.set(setting.key, setting.value);
    });
  }

  async getValue(key: SettingKey): Promise<number | string> {
    if (!this.settingsCache.has(key)) {
      await this.refreshCache();
    }
    const value = this.settingsCache.get(key) || DEFAULT_SETTINGS[key];
    return NUMERIC_SETTINGS.includes(key) ? Number(value) : value;
  }

  async getNumericValue(key: SettingKey): Promise<number> {
    const value = await this.getValue(key);
    return Number(value);
  }

  async updateValue(key: SettingKey, value: string | number): Promise<Setting> {
    const setting = await this.settingsRepository.findOne({
      where: { key },
    });
    if (!setting) {
      throw new NotFoundException(`Setting ${key} not found`);
    }

    setting.value = String(value);
    const updated = await this.settingsRepository.save(setting);
    await this.refreshCache();
    return updated;
  }

  async getAllSettings(): Promise<Setting[]> {
    return this.settingsRepository.find();
  }
}
