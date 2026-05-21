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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const session_entity_1 = require("../entities/session.entity");
const credits_service_1 = require("../credits/credits.service");
const livekit_service_1 = require("../livekit/livekit.service");
let SessionsService = class SessionsService {
    sessionRepo;
    creditsService;
    livekitService;
    constructor(sessionRepo, creditsService, livekitService) {
        this.sessionRepo = sessionRepo;
        this.creditsService = creditsService;
        this.livekitService = livekitService;
    }
    async startSession(clientId, modelId) {
        const roomName = `marturbs-${clientId.slice(0, 8)}-${Date.now()}`;
        const session = await this.sessionRepo.save({
            clientId,
            modelId,
            roomName,
            status: session_entity_1.SessionStatus.ACTIVE,
        });
        const token = await this.livekitService.createToken(roomName, clientId, 'client');
        return { session, token, roomName };
    }
    async tickSession(sessionId, creditsPerMinute) {
        const session = await this.sessionRepo.findOne({
            where: { id: sessionId },
        });
        if (!session || session.status !== session_entity_1.SessionStatus.ACTIVE)
            return null;
        const costPerSecond = creditsPerMinute / 60;
        const cost = Math.ceil(costPerSecond);
        session.durationSeconds += 1;
        session.creditsSpent += cost;
        session.modelEarnings = session.creditsSpent * 0.7;
        await this.sessionRepo.save(session);
        const balance = await this.creditsService.deduct(session.clientId, cost, sessionId);
        return {
            sessionId,
            durationSeconds: session.durationSeconds,
            creditsSpent: session.creditsSpent,
            remainingCredits: balance?.credits ?? 0,
        };
    }
    async endSession(sessionId) {
        const session = await this.sessionRepo.findOne({
            where: { id: sessionId },
        });
        if (!session)
            return null;
        session.status = session_entity_1.SessionStatus.ENDED;
        session.endedAt = new Date();
        await this.sessionRepo.save(session);
        return session;
    }
    async getActiveSessions() {
        return this.sessionRepo.find({
            where: { status: session_entity_1.SessionStatus.ACTIVE },
        });
    }
    async getAdminStats() {
        const active = await this.getActiveSessions();
        return {
            activeSessions: active.length,
            sessions: active,
        };
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.CallSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        credits_service_1.CreditsService,
        livekit_service_1.LivekitService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map