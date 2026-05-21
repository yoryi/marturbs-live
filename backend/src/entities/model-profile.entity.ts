import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('model_profiles')
export class ModelProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.modelProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column({ unique: true })
  username: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 10 })
  pricePerMinute: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ nullable: true })
  coverImage?: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];
}
