import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Car } from '../../cars/entities/car.entity';
import { Route } from '../../routes/entities/route.entity';
import { WorkEntry } from '../../work-entries/entities/work-entry.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  OWNER = 'owner',
}

@Entity('users')
export class User {
  constructor() {
    this.active = true;
    this.role = UserRole.USER;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  postCode: string;

  @Column()
  street: string;

  @Column()
  houseNumber: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  carId: string;

  @Column({ nullable: true })
  routeId: string;

  @OneToOne(() => Car, (car) => car.assignedUser, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'carId' })
  car: Car;

  @OneToOne(() => Route, (route) => route.assignedUser, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'routeId' })
  route: Route;

  @OneToMany(() => WorkEntry, (workEntry) => workEntry.user, {
    onDelete: 'CASCADE',
  })
  workEntries: WorkEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ type: 'varchar', default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  invitationToken: string;

  @Column({ nullable: true })
  invitationExpires: Date;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidPerStop: number;
}
