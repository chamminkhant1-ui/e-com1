import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { GenderType } from './types';
import { Account } from './Account';
import { ParentProfile } from './ParentProfile';
import { Address } from './Address';
import { Photo } from './Photo';
import { EntranceRegistration } from './EntranceRegistration';
import { SemesterRegistration } from './SemesterRegistration';

@Entity({ name: 'student_profiles' })
@Index('idx_student_nrc', ['studentNrc'])
@Index('idx_student_reg_no', ['universityRegNo'])
export class StudentProfile {
  @PrimaryGeneratedColumn({ name: 'student_id' })
  studentId!: number;

  @OneToOne(() => Account, (account) => account.studentProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  account!: Account;

  @Column({ name: 'entrance_id', nullable: true })
  entranceId?: number;

  @ManyToOne(() => EntranceRegistration, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'entrance_id' })
  entrance?: EntranceRegistration;
  // curently it is moany to one because one entrance registration can be claimed by many student profiles before approved one.
  // If one is approved, other profiles will be deleted. so it will be one to one after approval.
  // If one is already approved, other profiles will not be able to claim it. So it will be one to one after approval.

  @Column({
    length: 100,
    name: 'university_reg_no',
    unique: true,
    nullable: true,
  })
  universityRegNo?: string; // it's same in

  @Column({ length: 255, name: 'name_mm' })
  nameMm!: string;

  @Column({ length: 255, name: 'name_en' })
  nameEn!: string;

  @Column({ type: 'enum', enum: ['M', 'F', 'Other'] })
  gender!: GenderType;

  @Column({ type: 'date' })
  dob!: Date;

  @Column({ length: 50, name: 'phone_number' })
  phoneNumber!: string;

  @Column({ length: 100, name: 'student_nrc', unique: true })
  studentNrc!: string;

  @Column({ length: 100, nullable: true })
  ethnicity?: string;

  @Column({ length: 100, nullable: true })
  religion?: string;

  @Column({ length: 100, name: 'high_school_roll_no', nullable: true })
  highSchoolRollNo?: string;

  @Column({ length: 255, name: 'high_school_name', nullable: true })
  highSchoolName?: string;

  @Column({ length: 50, name: 'application_no', nullable: true })
  applicationNo?: string;

  @Column({ name: 'entry_academic_year', length: 15, nullable: true })
  entryAcademicYear?: string;

  @Column({ name: 'admission_serial', type: 'int', nullable: true })
  admissionSerial?: number;

  @OneToOne(() => ParentProfile, (parent) => parent.student, { cascade: true })
  parentProfile!: ParentProfile;

  @OneToMany(() => Address, (address) => address.student, { cascade: true })
  addresses!: Address[];

  @OneToOne(() => Photo, (photo) => photo.student, { cascade: true })
  photo?: Photo;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => SemesterRegistration, (reg) => reg.student)
  registrations?: SemesterRegistration[];
}
