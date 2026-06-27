import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import type { InstitutionType } from './types';

@Entity({ name: 'majors' })
export class Major {
  @PrimaryGeneratedColumn({ name: 'major_id' })
  majorId!: number;

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
