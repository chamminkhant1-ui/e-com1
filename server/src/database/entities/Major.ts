import { Entity, PrimaryColumn, Column } from 'typeorm';
import type { InstitutionType } from './types';

@Entity({ name: 'majors' })
export class Major {
  @PrimaryColumn({ name: 'major_code', length: 50 })
  majorCode!: string;

  @Column({ length: 255, name: 'major_name_mm', unique: true })
  majorNameMm!: string;

  @Column({ length: 255, name: 'major_name_en', nullable: true })
  majorNameEn?: string;

  @Column({
    type: 'enum',
    enum: ['computer', 'technology'],
    name: 'institution',
  })
  institution!: InstitutionType;
}
