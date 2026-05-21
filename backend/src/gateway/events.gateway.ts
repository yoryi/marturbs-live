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

type CallRequest = {
  requestId: string;
  modelId: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  roomId: string;
  createdAt: number;
  clientSocketId: string;
};

@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  /** Últimos Peer IDs por sala (para quien se une tarde) */
  private readonly roomPeers = new Map<string, Map<string, PeerParticipant>>();

  private readonly pendingCalls = new Map<string, CallRequest>();

  private modelQueueRoom(modelId: string) {
    return `model-queue-${modelId}`;
  }

  private getPendingForModel(modelId: string): CallRequest[] {
    return [...this.pendingCalls.values()].filter((r) => r.modelId === modelId);
  }

  private notifyClient(
    req: CallRequest,
    event: string,
    payload: Record<string, unknown>,
  ) {
    this.server.to(req.roomId).emit(event, payload);
    this.server.to(req.clientSocketId).emit(event, payload);
  }

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
    for (const [id, req] of this.pendingCalls) {
      if (req.roomId === data.roomId) this.pendingCalls.delete(id);
    }
    this.server.to(data.roomId).emit('sessionEnded', data);
    return { ok: true };
  }

  @SubscribeMessage('joinModelQueue')
  handleJoinModelQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { modelId: string; userId: string },
  ) {
    const room = this.modelQueueRoom(data.modelId);
    client.join(room);
    client.emit('callRequestsSnapshot', {
      requests: this.getPendingForModel(data.modelId),
    });
    return { ok: true };
  }

  @SubscribeMessage('leaveModelQueue')
  handleLeaveModelQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { modelId: string },
  ) {
    client.leave(this.modelQueueRoom(data.modelId));
    return { ok: true };
  }

  @SubscribeMessage('requestCall')
  handleRequestCall(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      modelId: string;
      clientId: string;
      clientName: string;
      clientAvatar?: string;
      roomId: string;
    },
  ) {
    const existing = [...this.pendingCalls.values()].find(
      (r) => r.clientId === data.clientId && r.modelId === data.modelId,
    );
    if (existing) {
      existing.clientSocketId = client.id;
      client.join(existing.roomId);
      client.emit('callQueued', {
        requestId: existing.requestId,
        roomId: existing.roomId,
        position: 1,
      });
      return { ok: true, requestId: existing.requestId };
    }

    const requestId = `req-${data.modelId}-${data.clientId}-${Date.now()}`;
    const request: CallRequest = {
      requestId,
      modelId: data.modelId,
      clientId: data.clientId,
      clientName: data.clientName,
      clientAvatar: data.clientAvatar,
      roomId: data.roomId,
      createdAt: Date.now(),
      clientSocketId: client.id,
    };
    this.pendingCalls.set(requestId, request);
    client.join(data.roomId);
    this.server
      .to(this.modelQueueRoom(data.modelId))
      .emit('callRequestIncoming', request);
    client.emit('callQueued', {
      requestId,
      roomId: data.roomId,
      position: this.getPendingForModel(data.modelId).length,
    });
    return { ok: true, requestId };
  }

  @SubscribeMessage('cancelCallRequest')
  handleCancelCallRequest(
    @MessageBody()
    data: { requestId: string; roomId: string },
  ) {
    const req = this.pendingCalls.get(data.requestId);
    if (req) {
      this.pendingCalls.delete(data.requestId);
      this.server
        .to(this.modelQueueRoom(req.modelId))
        .emit('callRequestCancelled', { requestId: data.requestId });
    }
    if (req) {
      this.notifyClient(req, 'callRejected', {
        requestId: data.requestId,
        reason: 'cancelled',
      });
    } else {
      this.server.to(data.roomId).emit('callRejected', {
        requestId: data.requestId,
        reason: 'cancelled',
      });
    }
    return { ok: true };
  }

  @SubscribeMessage('acceptCallRequest')
  handleAcceptCallRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string },
  ) {
    const req = this.pendingCalls.get(data.requestId);
    if (!req) return { ok: false };

    this.pendingCalls.delete(data.requestId);
    for (const [id, other] of this.pendingCalls) {
      if (other.modelId === req.modelId && other.clientId !== req.clientId) {
        this.notifyClient(other, 'callRejected', {
          requestId: id,
          reason: 'busy',
        });
        this.pendingCalls.delete(id);
      }
    }

    this.notifyClient(req, 'callAccepted', req);
    client.emit('callAccepted', req);
    this.server
      .to(this.modelQueueRoom(req.modelId))
      .emit('callRequestCancelled', { requestId: data.requestId });
    return { ok: true };
  }

  @SubscribeMessage('rejectCallRequest')
  handleRejectCallRequest(@MessageBody() data: { requestId: string }) {
    const req = this.pendingCalls.get(data.requestId);
    if (!req) return { ok: false };

    this.pendingCalls.delete(data.requestId);
    this.notifyClient(req, 'callRejected', {
      requestId: data.requestId,
      reason: 'rejected',
    });
    this.server
      .to(this.modelQueueRoom(req.modelId))
      .emit('callRequestCancelled', { requestId: data.requestId });
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
