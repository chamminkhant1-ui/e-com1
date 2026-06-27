import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { District } from './District';

@Entity({ name: 'townships' })
@Index('idx_townships_search', ['stateId', 'districtId'])
export class Township {
  @PrimaryColumn({ length: 5, name: 'state_id' })
  stateId!: string;

  @PrimaryColumn({ length: 5, name: 'district_id' })
  districtId!: string;

  @PrimaryColumn({ length: 5, name: 'township_id' })
  townshipId!: string;

  @Column({ length: 150, name: 'name_mm' })
  nameMm!: string;

  @Column({ length: 150, name: 'name_en', nullable: true })
  nameEn?: string;

  @ManyToOne(() => District, { onDelete: 'RESTRICT' })
  @JoinColumn([
    { name: 'state_id', referencedColumnName: 'stateId' },
    { name: 'district_id', referencedColumnName: 'districtId' },
  ])
  district!: District;
}
