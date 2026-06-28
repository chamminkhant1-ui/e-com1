import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { District } from './District';

@Entity({ name: 'states' })
export class State {
  @PrimaryColumn({ length: 5, name: 'state_id' })
  stateId!: string;

  @Column({ length: 150, name: 'name_mm' })
  nameMm!: string;

  @OneToMany(() => District, (district) => district.state)
  districts?: District[];
}
