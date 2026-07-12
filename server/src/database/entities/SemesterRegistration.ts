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
import type { RegistrationStatus } from './types';
import { StudentProfile } from './StudentProfile';
import { AcademicYear } from './AcademicYear';
import { Semester } from './Semester';
import { Major } from './Major';
import { Account } from './Account';
import { AssignedRollNumber } from './AssignedRollNumber';
import { Payment } from './Payment';

@Entity({ name: 'semester_registrations' })
@Unique(['studentId', 'academicYearId', 'semesterId'])
@Index('idx_sem_reg_composite', [
  'academicYearId',
  'semesterId',
  'majorCode',
  'status',
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

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'deferred'],
    default: 'pending',
  })
  status!: RegistrationStatus;

  @Column({ length: 100, name: 'source_exam_roll_no', nullable: true })
  sourceExamRollNo?: string;

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

  @OneToOne(() => AssignedRollNumber, (roll) => roll.registration)
  assignedRollNumber?: AssignedRollNumber;

  @OneToOne(() => Payment, (payment) => payment.registration)
  payment?: Payment;
}
