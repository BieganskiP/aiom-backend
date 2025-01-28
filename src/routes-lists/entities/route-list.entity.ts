import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('routes_lists')
export class RouteList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int4')
  number_of_stops: number;

  @Column('int4')
  number_of_packages: number;

  @Column('varchar')
  route: string;

  @Column('timestamp')
  date: Date;
}
