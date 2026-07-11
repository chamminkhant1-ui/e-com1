import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Payment } from './Payment';
import { Account } from './Account';
import type { PaymentStatus } from './types';

@Entity({ name: 'payment_histories' })
export class PaymentHistory {
  @PrimaryGeneratedColumn('uuid', { name: 'history_id' })
  historyId!: string;

  @Column({ name: 'payment_id' })
  paymentId!: string;

  @ManyToOne(() => Payment, (payment) => payment.history, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment!: Payment;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
  })
  status!: PaymentStatus;

  @Column({ name: 'processed_by', nullable: true })
  processedById?: number;

  @ManyToOne(() => Account, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'processed_by' })
  processedBy?: Account;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'changed_at' })
  changedAt!: Date;
}
