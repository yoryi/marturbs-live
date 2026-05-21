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
exports.LivekitService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const livekit_server_sdk_1 = require("livekit-server-sdk");
let LivekitService = class LivekitService {
    config;
    constructor(config) {
        this.config = config;
    }
    async createToken(roomName, identity, role) {
        const apiKey = this.config.get('LIVEKIT_API_KEY');
        const apiSecret = this.config.get('LIVEKIT_API_SECRET');
        if (!apiKey || !apiSecret) {
            return {
                demo: true,
                roomName,
                identity,
                message: 'Configure LIVEKIT_API_KEY y LIVEKIT_API_SECRET para tokens reales',
            };
        }
        const token = new livekit_server_sdk_1.AccessToken(apiKey, apiSecret, {
            identity,
            ttl: '2h',
        });
        token.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
        });
        return {
            token: await token.toJwt(),
            roomName,
            url: this.config.get('LIVEKIT_URL'),
        };
    }
};
exports.LivekitService = LivekitService;
exports.LivekitService = LivekitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LivekitService);
//# sourceMappingURL=livekit.service.js.map