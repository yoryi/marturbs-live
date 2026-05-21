import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ModelProfile } from './model-profile.entity';

export enum UserRole {
  CLIENT = 'client',
  MODEL = 'model',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Column({ type: 'int', default: 0 })
  credits: number;

  @Column({ nullable: true })
  avatar?: string;

  @OneToOne(() => ModelProfile, (profile) => profile.user)
  modelProfile?: ModelProfile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
