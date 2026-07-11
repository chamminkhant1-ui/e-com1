import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { StudentProfile } from './StudentProfile';

@Entity({ name: 'parent_profiles' })
export class ParentProfile {
  @PrimaryColumn({ name: 'student_id' })
  studentId!: number;

  @OneToOne(() => StudentProfile, (student) => student.parentProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: StudentProfile;

  @Column({ length: 255, name: 'father_name_mm' })
  fatherNameMm!: string;

  @Column({ length: 255, name: 'father_name_en' })
  fatherNameEn!: string;

  @Column({ length: 100, name: 'father_nrc', nullable: true })
  fatherNrc?: string;

  @Column({ length: 100, name: 'father_ethnicity', nullable: true })
  fatherEthnicity?: string;

  @Column({ length: 100, name: 'father_religion', nullable: true })
  fatherReligion?: string;

  @Column({ length: 150, name: 'father_job', nullable: true })
  fatherJob?: string;

  @Column({ length: 255, name: 'mother_name_mm' })
  motherNameMm!: string;

  @Column({ length: 255, name: 'mother_name_en' })
  motherNameEn!: string;

  @Column({ length: 100, name: 'mother_nrc', nullable: true })
  motherNrc?: string;

  @Column({ length: 100, name: 'mother_ethnicity', nullable: true })
  motherEthnicity?: string;

  @Column({ length: 100, name: 'mother_religion', nullable: true })
  motherReligion?: string;

  @Column({ length: 150, name: 'mother_job', nullable: true })
  motherJob?: string;

  // @Column({ length: 255, name: 'guardian_name_mm', nullable: true })
  // guardianNameMm?: string;

  // @Column({ length: 100, name: 'guardian_nrc', nullable: true })
  // guardianNrc?: string;

  // @Column({ length: 50, name: 'guardian_phone', nullable: true })
  // guardianPhone?: string;

  @Column({ length: 50, name: 'parent_phone', nullable: true })
  parentPhone?: string;
}
