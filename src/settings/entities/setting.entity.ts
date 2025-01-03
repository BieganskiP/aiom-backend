import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SettingKey {
  COMPANY_RATE_PER_STOP = 'company_rate_per_stop',
  COMPANY_CAR_RATE = 'company_car_rate',
  PARENT_COMPANY_DISPLAY_NAME = 'parent_company_display_name',
  OWN_COMPANY_DISPLAY_NAME = 'own_company_display_name',
}

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    enum: SettingKey,
    unique: true,
  })
  key: SettingKey;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  numericValue: number;

  @Column('text', { nullable: true })
  textValue: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get value(): string {
    return this.textValue || this.numericValue?.toString() || '';
  }

  set value(val: string) {
    const numVal = Number(val);
    if (!isNaN(numVal)) {
      this.numericValue = numVal;
      this.textValue = null;
    } else {
      this.textValue = val;
      this.numericValue = null;
    }
  }
}
