import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { StudentProfile } from './StudentProfile';
import { AcademicYear } from './AcademicYear';
import { Semester } from './Semester';
import { Major } from './Major';
import { Account } from './Account';
import { Payment } from './Payment';

@Entity({ name: 'semester_registrations' })
@Unique(['studentId', 'academicYearId', 'semesterId'])
@Index('idx_sem_reg_composite', [
  'academicYearId',
  'semesterId',
  'majorCode',
])
export class SemesterRegistration {
  @PrimaryGeneratedColumn('uuid', { name: 'registration_id' })
  registrationId!: string;

  @Column({ name: 'student_id' })
  studentId!: number;

  @ManyToOne(() => StudentProfile, (profile) => profile.registrations, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'student_id' })
  student!: StudentProfile;

  @Column({ name: 'academic_year_id' })
  academicYearId!: string;

  @ManyToOne(() => AcademicYear, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear!: AcademicYear;

  @Column({ name: 'semester_id' })
  semesterId!: number;

  @ManyToOne(() => Semester, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'semester_id' })
  semester!: Semester;

  @Column({ name: 'major_code', length: 50 })
  majorCode!: string;

  @ManyToOne(() => Major, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'major_code' })
  major!: Major;

  @Column({ length: 50, name: 'roll_no', nullable: true })
  @Index('idx_sem_reg_roll_no')
  rollNo?: string;

  @Column({ type: 'timestamptz', name: 'roll_no_assigned_at', nullable: true })
  rollNoAssignedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'applied_date' })
  appliedDate!: Date;

  @Column({ name: 'processed_by', nullable: true })
  processedById?: number;

  @ManyToOne(() => Account, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'processed_by' })
  processedBy?: Account;

  @Column({ type: 'timestamptz', name: 'processed_date', nullable: true })
  processedDate?: Date;

  @Column({ type: 'text', nullable: true })
  remarks?: string;


  @OneToOne(() => Payment, (payment) => payment.registration)
  payment?: Payment;
}
