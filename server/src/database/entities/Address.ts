import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import type { AddressType } from './types';
import { Township } from './Township';
import { StudentProfile } from './StudentProfile';

@Entity({ name: 'addresses' })
@Unique(['student', 'type'])
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: ['current', 'parent', 'office'],
    default: 'current',
  })
  type!: AddressType;

  @Column({ type: 'text', name: 'street_address' })
  streetAddress!: string;

  @Column({ name: 'state_id', length: 5 })
  stateId!: string;

  @Column({ name: 'district_id', length: 5 })
  districtId!: string;

  @Column({ name: 'township_id', length: 5 })
  townshipId!: string;

  @ManyToOne(() => Township, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn([
    { name: 'state_id', referencedColumnName: 'stateId' },
    { name: 'district_id', referencedColumnName: 'districtId' },
    { name: 'township_id', referencedColumnName: 'townshipId' },
  ])
  township!: Township;

  @ManyToOne(() => StudentProfile, (profile) => profile.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student?: StudentProfile;
}
