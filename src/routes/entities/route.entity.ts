import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WorkEntry } from '../../work-entries/entities/work-entry.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  assignedUserId: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ default: true })
  active: boolean;

  @OneToOne(() => User, (user) => user.route, { nullable: true })
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updatedByUser: User;

  @OneToMany(() => WorkEntry, (workEntry) => workEntry.route)
  workEntries: WorkEntry[];
}
