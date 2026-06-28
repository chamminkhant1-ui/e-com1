import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import type { InstitutionType } from './types';
import { EntranceClaim } from './EntranceClaim';

@Entity({ name: 'entrance_registrations' })
@Index('idx_entrance_exam_roll_no', ['examRollNo'])
@Index('idx_entrance_nrc', ['nrcNumber'])
export class EntranceRegistration {
  @PrimaryGeneratedColumn({ name: 'entrance_id' })
  entranceId!: number;

  @Column({ length: 10, name: 'exam_year' })
  examYear!: string;

  @Column({
    type: 'enum',
    enum: ['computer', 'technology'],
    name: 'institution',
  })
  institution!: InstitutionType;

  @Column({ length: 100, name: 'exam_roll_no', unique: true })
  examRollNo!: string;

  @Column({ length: 255, name: 'applicant_name_mm' })
  applicantNameMm!: string;

  @Column({ length: 255, name: 'father_name_mm' })
  fatherNameMm!: string;

  @Column({ length: 100, name: 'nrc_number', unique: true })
  nrcNumber!: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'subject_group_score',
    nullable: true,
  })
  subjectGroupScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'total_score' })
  totalScore!: number;

  @Column({ length: 50, name: 'application_no' })
  applicationNo!: string;

  @OneToMany(() => EntranceClaim, (claim) => claim.entrance)
  claims?: EntranceClaim[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt?: Date;
}
