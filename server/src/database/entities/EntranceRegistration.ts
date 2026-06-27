import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import type { InstitutionType } from './types';

@Entity({ name: 'entrance_registrations' })
@Index('idx_entrance_exam_roll_no', ['examRollNo'])
@Index('idx_entrance_nrc', ['nrcNumber'])
export class EntranceRegistration {
  @PrimaryGeneratedColumn({ name: 'entrance_id' })
  entranceId!: number;

  @Column({ length: 10, name: 'exam_year' })
  examYear!: string; // ၁၀ တန်းစာမေးပွဲနှစ်

  @Column({
    type: 'enum',
    enum: ['computer', 'technology'],
    name: 'institution',
  })
  institution!: InstitutionType;

  @Column({ length: 100, name: 'exam_roll_no', unique: true })
  examRollNo!: string; // ၁၀ တန်းစာမေးပွဲခုံအမှတ်

  @Column({ length: 255, name: 'applicant_name_mm' })
  applicantNameMm!: string; // ကျောင်းသား အမည်

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
  subjectGroupScore?: number; // ၄ ဘာသာအမှတ်စုစုပေါင်း

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'total_score' })
  totalScore!: number; // စုစုပေါင်းအမှတ်

  @Column({ length: 50, name: 'application_no' })
  applicationNo!: string; // လျှောက်လွှာအမှတ်

  @Column({ name: 'is_profile_claimed', default: false })
  isProfileClaimed!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
