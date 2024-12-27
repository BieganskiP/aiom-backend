import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Route } from '../../routes/entities/route.entity';
import { Car } from '../../cars/entities/car.entity';

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
}
