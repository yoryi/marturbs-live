import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SessionStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
}

@Entity('sessions')
export class CallSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: string;

  @Column()
  modelId: string;

  @Column({ nullable: true })
  roomName?: string;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ type: 'int', default: 0 })
  creditsSpent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  modelEarnings: number;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date;
}
