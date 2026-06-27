import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'semesters' })
export class Semester {
  @PrimaryGeneratedColumn({ name: 'semester_id' })
  semesterId!: number;

  @Column({ length: 50, name: 'semester_name', unique: true })
  semesterName!: string;

  @Column({ type: 'int', name: 'numerical_level' })
  numericalLevel!: number;
}
