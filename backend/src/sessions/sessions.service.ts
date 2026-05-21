import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallSession, SessionStatus } from '../entities/session.entity';
import { CreditsService } from '../credits/credits.service';
import { LivekitService } from '../livekit/livekit.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(CallSession) private sessionRepo: Repository<CallSession>,
    private creditsService: CreditsService,
    private livekitService: LivekitService,
  ) {}

  async startSession(clientId: string, modelId: string) {
    const roomName = `marturbs-${clientId.slice(0, 8)}-${Date.now()}`;
    const session = await this.sessionRepo.save({
      clientId,
      modelId,
      roomName,
      status: SessionStatus.ACTIVE,
    });

    const token = await this.livekitService.createToken(
      roomName,
      clientId,
      'client',
    );

    return { session, token, roomName };
  }

  async tickSession(sessionId: string, creditsPerMinute: number) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session || session.status !== SessionStatus.ACTIVE) return null;

    const costPerSecond = creditsPerMinute / 60;
    const cost = Math.ceil(costPerSecond);

    session.durationSeconds += 1;
    session.creditsSpent += cost;
    session.modelEarnings = session.creditsSpent * 0.7;

    await this.sessionRepo.save(session);
    const balance = await this.creditsService.deduct(
      session.clientId,
      cost,
      sessionId,
    );

    return {
      sessionId,
      durationSeconds: session.durationSeconds,
      creditsSpent: session.creditsSpent,
      remainingCredits: balance?.credits ?? 0,
    };
  }

  async endSession(sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) return null;

    session.status = SessionStatus.ENDED;
    session.endedAt = new Date();
    await this.sessionRepo.save(session);
    return session;
  }

  async getActiveSessions() {
    return this.sessionRepo.find({
      where: { status: SessionStatus.ACTIVE },
    });
  }

  async getAdminStats() {
    const active = await this.getActiveSessions();
    return {
      activeSessions: active.length,
      sessions: active,
    };
  }
}
