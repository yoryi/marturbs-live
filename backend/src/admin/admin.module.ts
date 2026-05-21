import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ModelProfile } from '../entities/model-profile.entity';
import { Transaction } from '../entities/transaction.entity';
import { SessionsModule } from '../sessions/sessions.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ModelProfile, Transaction]),
    SessionsModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
