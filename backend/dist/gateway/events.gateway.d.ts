import { Server, Socket } from 'socket.io';
export declare class EventsGateway {
    server: Server;
    private readonly roomPeers;
    private readonly pendingCalls;
    private modelQueueRoom;
    private getPendingForModel;
    private notifyClient;
    handleLeave(client: Socket, data: {
        roomId: string;
    }): {
        ok: boolean;
    };
    handleJoin(client: Socket, data: {
        roomId: string;
        userId: string;
    }): {
        event: string;
        roomId: string;
    };
    private getPeersInRoom;
    private rememberPeer;
    handleChat(client: Socket, data: {
        roomId: string;
        sender: string;
        text: string;
    }): {
        ok: boolean;
    };
    handleCreditTick(data: {
        roomId: string;
        credits: number;
        duration: number;
    }): {
        ok: boolean;
    };
    handleSessionEnd(data: {
        roomId: string;
    }): {
        ok: boolean;
    };
    handleJoinModelQueue(client: Socket, data: {
        modelId: string;
        userId: string;
    }): {
        ok: boolean;
    };
    handleLeaveModelQueue(client: Socket, data: {
        modelId: string;
    }): {
        ok: boolean;
    };
    handleRequestCall(client: Socket, data: {
        modelId: string;
        clientId: string;
        clientName: string;
        clientAvatar?: string;
        roomId: string;
    }): {
        ok: boolean;
        requestId: string;
    };
    handleCancelCallRequest(data: {
        requestId: string;
        roomId: string;
    }): {
        ok: boolean;
    };
    handleAcceptCallRequest(client: Socket, data: {
        requestId: string;
    }): {
        ok: boolean;
    };
    handleRejectCallRequest(data: {
        requestId: string;
    }): {
        ok: boolean;
    };
    handlePeerReady(client: Socket, data: {
        roomId: string;
        peerId: string;
        role: 'client' | 'model';
        userId: string;
    }): {
        ok: boolean;
    };
}
