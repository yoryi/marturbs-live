"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let EventsGateway = class EventsGateway {
    server;
    roomPeers = new Map();
    pendingCalls = new Map();
    modelQueueRoom(modelId) {
        return `model-queue-${modelId}`;
    }
    getPendingForModel(modelId) {
        return [...this.pendingCalls.values()].filter((r) => r.modelId === modelId);
    }
    notifyClient(req, event, payload) {
        this.server.to(req.roomId).emit(event, payload);
        this.server.to(req.clientSocketId).emit(event, payload);
    }
    handleLeave(client, data) {
        client.leave(data.roomId);
        return { ok: true };
    }
    handleJoin(client, data) {
        client.join(data.roomId);
        const peers = this.getPeersInRoom(data.roomId, data.userId);
        if (peers.length > 0) {
            client.emit('peersInRoom', { roomId: data.roomId, peers });
        }
        return { event: 'joined', roomId: data.roomId };
    }
    getPeersInRoom(roomId, excludeUserId) {
        const room = this.roomPeers.get(roomId);
        if (!room)
            return [];
        return [...room.values()].filter((p) => p.userId !== excludeUserId);
    }
    rememberPeer(roomId, participant) {
        let room = this.roomPeers.get(roomId);
        if (!room) {
            room = new Map();
            this.roomPeers.set(roomId, room);
        }
        room.set(participant.userId, participant);
    }
    handleChat(client, data) {
        client.join(data.roomId);
        client.to(data.roomId).emit('chatMessage', {
            sender: data.sender,
            text: data.text,
            time: new Date().toISOString(),
        });
        return { ok: true };
    }
    handleCreditTick(data) {
        this.server.to(data.roomId).emit('creditUpdate', data);
        return { ok: true };
    }
    handleSessionEnd(data) {
        this.roomPeers.delete(data.roomId);
        for (const [id, req] of this.pendingCalls) {
            if (req.roomId === data.roomId)
                this.pendingCalls.delete(id);
        }
        this.server.to(data.roomId).emit('sessionEnded', data);
        return { ok: true };
    }
    handleJoinModelQueue(client, data) {
        const room = this.modelQueueRoom(data.modelId);
        client.join(room);
        client.emit('callRequestsSnapshot', {
            requests: this.getPendingForModel(data.modelId),
        });
        return { ok: true };
    }
    handleLeaveModelQueue(client, data) {
        client.leave(this.modelQueueRoom(data.modelId));
        return { ok: true };
    }
    handleRequestCall(client, data) {
        const existing = [...this.pendingCalls.values()].find((r) => r.clientId === data.clientId && r.modelId === data.modelId);
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
        const request = {
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
    handleCancelCallRequest(data) {
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
        }
        else {
            this.server.to(data.roomId).emit('callRejected', {
                requestId: data.requestId,
                reason: 'cancelled',
            });
        }
        return { ok: true };
    }
    handleAcceptCallRequest(client, data) {
        const req = this.pendingCalls.get(data.requestId);
        if (!req)
            return { ok: false };
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
    handleRejectCallRequest(data) {
        const req = this.pendingCalls.get(data.requestId);
        if (!req)
            return { ok: false };
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
    handlePeerReady(client, data) {
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
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chatMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('creditTick'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleCreditTick", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sessionEnded'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleSessionEnd", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinModelQueue'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinModelQueue", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveModelQueue'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeaveModelQueue", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('requestCall'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleRequestCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('cancelCallRequest'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleCancelCallRequest", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('acceptCallRequest'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleAcceptCallRequest", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('rejectCallRequest'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleRejectCallRequest", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('peerReady'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handlePeerReady", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
    })
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map