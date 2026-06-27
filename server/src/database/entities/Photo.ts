import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { StudentProfile } from './StudentProfile';

@Entity({ name: 'photos' })
@Index('idx_photos_student_id', ['studentId'])
export class Photo {
  @PrimaryColumn({ name: 'student_id' })
  studentId!: number;

  @OneToOne(() => StudentProfile, (profile) => profile.photo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: StudentProfile;

  @Column({ name: 'one_inch_photo', length: 255, nullable: true })
  oneInchPhoto?: string;

  @Column({ name: 'passport_photo', length: 255, nullable: true })
  passportPhoto?: string;

  @Column({
    name: 'house_registration_photo_front',
    length: 255,
    nullable: true,
  })
  houseRegistrationPhotoFront?: string;

  @Column({ name: 'matriculation_mark_photo', length: 255, nullable: true })
  matriculationMarkPhoto?: string;

  @Column({ name: 'matriculation_certificate', length: 255, nullable: true })
  matriculationCertificate?: string;

  @Column({ name: 'police_approved_letter', length: 255, nullable: true })
  policeApprovedLetter?: string;

  @Column({ name: 'quarter_approved_letter', length: 255, nullable: true })
  quarterApprovedLetter?: string;

  @Column({ name: 'student_nrc_photo_front', length: 255, nullable: true })
  studentNrcPhotoFront?: string;

  @Column({ name: 'student_nrc_photo_back', length: 255, nullable: true })
  studentNrcPhotoBack?: string;

  @Column({ name: 'covid_photo', length: 255, nullable: true })
  covidPhoto?: string;

  @Column({ name: 'fath_nrc_photo_front', length: 255, nullable: true })
  fathNrcPhotoFront?: string;

  @Column({ name: 'fath_nrc_photo_back', length: 255, nullable: true })
  fathNrcPhotoBack?: string;

  @Column({ name: 'moth_nrc_photo_front', length: 255, nullable: true })
  mothNrcPhotoFront?: string;

  @Column({ name: 'moth_nrc_photo_back', length: 255, nullable: true })
  mothNrcPhotoBack?: string;

  @Column({ name: 'payment_screenshot', length: 255, nullable: true })
  paymentScreenshot?: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
