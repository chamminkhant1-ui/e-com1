import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { SemesterRegistration } from './SemesterRegistration';
import { Account } from './Account';
import { PaymentHistory } from './PaymentHistory';
import type { PaymentStatus } from './types';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid', { name: 'payment_id' })
  paymentId!: string;

  @Column({ name: 'registration_id' })
  registrationId!: string;

  @OneToOne(() => SemesterRegistration, (reg) => reg.payment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'registration_id' })
  registration!: SemesterRegistration;

  @Column({ name: 'payer_name', length: 255 })
  payerName!: string;

  @Column({ name: 'payment_screenshot', type: 'text', nullable: true })
  paymentScreenshot?: string;

  @Column({ name: 'payment_time', type: 'timestamptz' })
  paymentTime!: Date;

  @Column({ name: 'transaction_code', length: 100, unique: true })
  @Index('idx_payments_tx_code')
  transactionCode!: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status!: PaymentStatus;

  @Column({ name: 'processed_by', nullable: true })
  processedById?: number;

  @ManyToOne(() => Account, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'processed_by' })
  processedBy?: Account;

  @OneToMany(() => PaymentHistory, (history) => history.payment, {
    cascade: true,
  })
  history!: PaymentHistory[];
}
