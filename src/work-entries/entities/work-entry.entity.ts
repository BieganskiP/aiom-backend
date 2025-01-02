import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  AfterLoad,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Route } from '../../routes/entities/route.entity';
import { Car, CarOwner } from '../../cars/entities/car.entity';
import { SettingsService } from '../../settings/settings.service';
import { SettingKey } from '../../settings/entities/setting.entity';

@Entity('work_entries')
export class WorkEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  routeId: string;

  @Column({ nullable: true })
  carId: string;

  @Column('int')
  stopsCompleted: number;

  @Column({ type: 'date' })
  workDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Route, { nullable: true })
  @JoinColumn({ name: 'routeId' })
  route: Route;

  @ManyToOne(() => Car, { nullable: true })
  @JoinColumn({ name: 'carId' })
  car: Car;

  // Virtual fields for financial calculations
  totalRevenue: number;
  driverPay: number;
  companyProfit: number;

  // We'll need to inject the settings service
  private static settingsService: SettingsService;

  public static setSettingsService(service: SettingsService) {
    WorkEntry.settingsService = service;
  }

  @AfterLoad()
  async calculateFinancials() {
    if (!WorkEntry.settingsService) {
      throw new Error('Settings service not initialized');
    }

    const companyRatePerStop = await WorkEntry.settingsService.getValue(
      SettingKey.COMPANY_RATE_PER_STOP,
    );
    const companyCarRate = await WorkEntry.settingsService.getValue(
      SettingKey.COMPANY_CAR_RATE,
    );

    // Calculate total revenue based on car ownership
    if (this.car?.owner === CarOwner.OWN_COMPANY) {
      // For company cars, revenue is the company car rate (higher)
      this.totalRevenue = this.stopsCompleted * companyCarRate;
      // Driver gets their personal rate
      this.driverPay = this.stopsCompleted * (this.user?.paidPerStop || 0);
    } else {
      // For parent company cars, revenue is the standard company rate
      this.totalRevenue = this.stopsCompleted * companyRatePerStop;
      // Driver gets their personal rate
      this.driverPay = this.stopsCompleted * (this.user?.paidPerStop || 0);
    }

    // Calculate company profit (revenue - driver pay)
    this.companyProfit = this.totalRevenue - this.driverPay;
  }
}
