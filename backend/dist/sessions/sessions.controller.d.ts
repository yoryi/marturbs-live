import { SessionsService } from './sessions.service';
export declare class SessionsController {
    private sessionsService;
    constructor(sessionsService: SessionsService);
    start(req: {
        user: {
            id: string;
        };
    }, modelId: string): Promise<{
        session: {
            clientId: string;
            modelId: string;
            roomName: string;
            status: import("../entities/session.entity").SessionStatus.ACTIVE;
        } & import("../entities/session.entity").CallSession;
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
    tick(id: string, pricePerMinute: number): Promise<{
        sessionId: string;
        durationSeconds: number;
        creditsSpent: number;
        remainingCredits: number;
    } | null>;
    end(id: string): Promise<import("../entities/session.entity").CallSession | null>;
    active(): Promise<import("../entities/session.entity").CallSession[]>;
}
