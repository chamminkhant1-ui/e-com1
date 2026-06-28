import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import type { ClaimStatus } from './types';
import { StudentProfile } from './StudentProfile';
import { EntranceRegistration } from './EntranceRegistration';

@Entity({ name: 'entrance_claims' })
@Index('idx_entrance_claim_entrance', ['entranceId'])
@Index('idx_entrance_claim_student', ['studentId'])
@Unique(['entranceId', 'studentId'])
export class EntranceClaim {
  @PrimaryGeneratedColumn({ name: 'claim_id' })
  claimId!: number;

  @Column({ name: 'entrance_id' })
  entranceId!: number;

  @ManyToOne(() => EntranceRegistration, (entrance) => entrance.claims, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'entrance_id' })
  entrance!: EntranceRegistration;

  @Column({ name: 'student_id' })
  studentId!: number;

  @ManyToOne(() => StudentProfile, (profile) => profile.entranceClaims, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: StudentProfile;

  @Column({
    type: 'enum',
    enum: ['unclaimed', 'pending', 'approved', 'rejected'],
    name: 'claim_status',
    default: 'unclaimed',
  })
  claimStatus!: ClaimStatus;

  @Column({ length: 100, name: 'application_no', nullable: true })
  applicationNo?: string;

  @Column({ name: 'admission_serial', type: 'int', nullable: true })
  admissionSerial?: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt?: Date;
}
