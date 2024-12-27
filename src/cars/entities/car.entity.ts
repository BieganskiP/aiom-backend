import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CarStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  IN_REPAIR = 'in_repair',
  OUT_OF_SERVICE = 'out_of_service',
}

export enum CarOwner {
  PARENT_COMPANY = 'parent_company',
  OWN_COMPANY = 'own_company',
}

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  licensePlate: string;

  @Column({
    type: 'varchar',
    enum: CarStatus,
    default: CarStatus.AVAILABLE,
  })
  status: CarStatus;

  @Column({
    type: 'varchar',
    enum: CarOwner,
    default: CarOwner.OWN_COMPANY,
  })
  owner: CarOwner;

  @Column({ type: 'date', nullable: true })
  checkupDate: Date;

  @Column({ type: 'date', nullable: true })
  oilChangeDate: Date;

  @Column({ type: 'date', nullable: true })
  tiresChangeDate: Date;

  @Column({ type: 'date', nullable: true })
  brakesChangeDate: Date;

  @Column({ nullable: true })
  assignedUserId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ default: true })
  active: boolean;

  @OneToOne(() => User, (user) => user.car, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updatedByUser: User;
}
