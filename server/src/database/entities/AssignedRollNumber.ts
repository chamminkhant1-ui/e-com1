import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { SemesterRegistration } from './SemesterRegistration';

@Entity({ name: 'assigned_roll_numbers' })
@Unique(['registrationId'])
export class AssignedRollNumber {
  @PrimaryGeneratedColumn({ name: 'roll_number_id' })
  rollNumberId!: number;

  @Column({ name: 'registration_id' })
  registrationId!: string;

  @OneToOne(() => SemesterRegistration, (reg) => reg.assignedRollNumber, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'registration_id' })
  registration!: SemesterRegistration;

  @Column({ length: 50, name: 'roll_no' })
  @Index('idx_roll_no_value')
  rollNo!: string;

  @Column({ length: 255, default: 'normal' })
  remark!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'assigned_at' })
  assignedAt!: Date;
}
