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
        this.server.to(data.roomId).emit('sessionEnded', data);
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