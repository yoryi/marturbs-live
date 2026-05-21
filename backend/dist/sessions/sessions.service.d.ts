import { Repository } from 'typeorm';
import { CallSession, SessionStatus } from '../entities/session.entity';
import { CreditsService } from '../credits/credits.service';
import { LivekitService } from '../livekit/livekit.service';
export declare class SessionsService {
    private sessionRepo;
    private creditsService;
    private livekitService;
    constructor(sessionRepo: Repository<CallSession>, creditsService: CreditsService, livekitService: LivekitService);
    startSession(clientId: string, modelId: string): Promise<{
        session: {
            clientId: string;
            modelId: string;
            roomName: string;
            status: SessionStatus.ACTIVE;
        } & CallSession;
        token: {
            demo: boolean;
            roomName: string;
            identity: string;
            message: string;
            token?: undefined;
            url?: undefined;
        } | {
            token: string;
            roomName: string;
            url: any;
            demo?: undefined;
            identity?: undefined;
            message?: undefined;
        };
        roomName: string;
    }>;
    tickSession(sessionId: string, creditsPerMinute: number): Promise<{
        sessionId: string;
        durationSeconds: number;
        creditsSpent: number;
        remainingCredits: number;
    } | null>;
    endSession(sessionId: string): Promise<CallSession | null>;
    getActiveSessions(): Promise<CallSession[]>;
    getAdminStats(): Promise<{
        activeSessions: number;
        sessions: CallSession[];
    }>;
}
