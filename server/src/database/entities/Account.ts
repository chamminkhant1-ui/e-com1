import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Role } from './types';
import { StudentProfile } from './StudentProfile';
import { SemesterRegistration } from './SemesterRegistration';
import { EntranceRegistration } from './EntranceRegistration';

@Entity({ name: 'accounts' })
@Index('idx_accounts_email', ['email'])
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200, unique: true, nullable: true })
  email!: string;

  @Column({ length: 200, name: 'edu_mail', unique: true, nullable: true })
  eduMail!: string;

  @Column({ type: 'text', name: 'password' })
  password!: string;

  @Column({
    type: 'enum',
    enum: ['student', 'admin', 'super', 'finance', 'owner'],
    default: 'student',
  })
  role!: Role;

  @Column({ name: 'otp_code', type: 'text', nullable: true })
  otpCode?: string | null;

  @Column({ type: 'timestamptz', name: 'otp_expires_at', nullable: true })
  otpExpiresAt?: Date | null;

  @Column({ name: 'is_verified', default: false })
  isVerified!: boolean;

  @Column({ type: 'int', name: 'token_version', default: 0 })
  tokenVersion!: number;

  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @OneToOne(() => StudentProfile, (profile) => profile.account, {
    cascade: true,
    nullable: true,
  })
  studentProfile?: StudentProfile;

  @Column({ name: 'entrance_id', nullable: true })
  entranceId?: number;

  @ManyToOne(() => EntranceRegistration, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'entrance_id' })
  entrance?: EntranceRegistration;

  @OneToMany(() => SemesterRegistration, (reg) => reg.processedBy)
  processedRegistrations?: SemesterRegistration[];
}

export type { Role } from './types';
