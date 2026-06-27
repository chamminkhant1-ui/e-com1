import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { State } from './State';
import { Township } from './Township';

@Entity({ name: 'districts' })
export class District {
  @PrimaryColumn({ length: 5, name: 'state_id' })
  stateId!: string;

  @PrimaryColumn({ length: 5, name: 'district_id' })
  districtId!: string;

  @Column({ length: 150, name: 'name_mm' })
  nameMm!: string;

  @Column({ length: 150, name: 'name_en', nullable: true })
  nameEn?: string;

  @ManyToOne(() => State, (state) => state.districts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'state_id' })
  state!: State;

  @OneToMany(() => Township, (township) => township.district)
  townships?: Township[];
}
