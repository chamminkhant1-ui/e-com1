import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'academic_years' })
export class AcademicYear {
  @PrimaryColumn({ length: 15, name: 'academic_year_id' })
  academicYearId!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
