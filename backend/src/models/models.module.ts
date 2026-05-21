import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelProfile } from '../entities/model-profile.entity';
import { User } from '../entities/user.entity';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';

@Module({
  imports: [TypeOrmModule.forFeature([ModelProfile, User])],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
