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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallSession = exports.SessionStatus = void 0;
const typeorm_1 = require("typeorm");
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["ACTIVE"] = "active";
    SessionStatus["ENDED"] = "ended";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
let CallSession = class CallSession {
    id;
    clientId;
    modelId;
    roomName;
    status;
    durationSeconds;
    creditsSpent;
    modelEarnings;
    startedAt;
    endedAt;
};
exports.CallSession = CallSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CallSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CallSession.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CallSession.prototype, "modelId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CallSession.prototype, "roomName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE }),
    __metadata("design:type", String)
], CallSession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CallSession.prototype, "durationSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CallSession.prototype, "creditsSpent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CallSession.prototype, "modelEarnings", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CallSession.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CallSession.prototype, "endedAt", void 0);
exports.CallSession = CallSession = __decorate([
    (0, typeorm_1.Entity)('sessions')
], CallSession);
//# sourceMappingURL=session.entity.js.map