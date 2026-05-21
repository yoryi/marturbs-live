import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TransactionType {
  PURCHASE = 'purchase',
  CALL = 'call',
  PAYOUT = 'payout',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'int', default: 0 })
  credits: number;

  @Column({ default: 'completed' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
