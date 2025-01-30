import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ComplaintStatus } from '../enums/complaint-status.enum';

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int4')
  complaint_number: number;

  @Column('varchar', { length: 255 })
  client: string;

  @Column('text')
  description: string;

  @Column('varchar', { length: 255 })
  problem_type: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  compensation_value: number;

  @Column('varchar', { length: 255 })
  courier: string;

  @Column('text')
  address: string;

  @Column('date')
  delivery_date: Date;

  @Column('text', { nullable: true })
  comments: string;

  @Column({ nullable: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.EMPTY,
  })
  status: ComplaintStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;
}
