import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type PeerParticipant = {
  peerId: string;
  role: 'client' | 'model';
  userId: string;
};

@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  /** Últimos Peer IDs por sala (para quien se une tarde) */
  private readonly roomPeers = new Map<string, Map<string, PeerParticipant>>();

  @SubscribeMessage('leaveRoom')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(data.roomId);
    return { ok: true };
  }

  @SubscribeMessage('joinRoom')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    client.join(data.roomId);
    const peers = this.getPeersInRoom(data.roomId, data.userId);
    if (peers.length > 0) {
      client.emit('peersInRoom', { roomId: data.roomId, peers });
    }
    return { event: 'joined', roomId: data.roomId };
  }

  private getPeersInRoom(roomId: string, excludeUserId?: string): PeerParticipant[] {
    const room = this.roomPeers.get(roomId);
    if (!room) return [];
    return [...room.values()].filter((p) => p.userId !== excludeUserId);
  }

  private rememberPeer(roomId: string, participant: PeerParticipant) {
    let room = this.roomPeers.get(roomId);
    if (!room) {
      room = new Map();
      this.roomPeers.set(roomId, room);
    }
    room.set(participant.userId, participant);
  }

  @SubscribeMessage('chatMessage')
  handleChat(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { roomId: string; sender: string; text: string },
  ) {
    client.join(data.roomId);
    client.to(data.roomId).emit('chatMessage', {
      sender: data.sender,
      text: data.text,
      time: new Date().toISOString(),
    });
    return { ok: true };
  }

  @SubscribeMessage('creditTick')
  handleCreditTick(
    @MessageBody()
    data: {
      roomId: string;
      credits: number;
      duration: number;
    },
  ) {
    this.server.to(data.roomId).emit('creditUpdate', data);
    return { ok: true };
  }

  @SubscribeMessage('sessionEnded')
  handleSessionEnd(@MessageBody() data: { roomId: string }) {
    this.roomPeers.delete(data.roomId);
    this.server.to(data.roomId).emit('sessionEnded', data);
    return { ok: true };
  }

  /** Intercambio de Peer IDs para WebRTC (PeerJS) */
  @SubscribeMessage('peerReady')
  handlePeerReady(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      peerId: string;
      role: 'client' | 'model';
      userId: string;
    },
  ) {
    client.join(data.roomId);
    this.rememberPeer(data.roomId, {
      peerId: data.peerId,
      role: data.role,
      userId: data.userId,
    });
    client.to(data.roomId).emit('peerReady', data);
    const peers = this.getPeersInRoom(data.roomId, data.userId);
    if (peers.length > 0) {
      client.emit('peersInRoom', { roomId: data.roomId, peers });
    }
    return { ok: true };
  }
}
