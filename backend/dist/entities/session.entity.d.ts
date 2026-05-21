export declare enum SessionStatus {
    ACTIVE = "active",
    ENDED = "ended"
}
export declare class CallSession {
    id: string;
    clientId: string;
    modelId: string;
    roomName?: string;
    status: SessionStatus;
    durationSeconds: number;
    creditsSpent: number;
    modelEarnings: number;
    startedAt: Date;
    endedAt?: Date;
}
