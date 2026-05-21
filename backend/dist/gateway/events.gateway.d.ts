import { Server, Socket } from 'socket.io';
export declare class EventsGateway {
    server: Server;
    private readonly roomPeers;
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
    handlePeerReady(client: Socket, data: {
        roomId: string;
        peerId: string;
        role: 'client' | 'model';
        userId: string;
    }): {
        ok: boolean;
    };
}
