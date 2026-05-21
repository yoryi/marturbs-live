import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallSession } from '../entities/session.entity';
import { CreditsModule } from '../credits/credits.module';
import { LivekitModule } from '../livekit/livekit.module';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CallSession]),
    CreditsModule,
    LivekitModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
