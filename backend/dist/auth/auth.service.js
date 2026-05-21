"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const model_profile_entity_1 = require("../entities/model-profile.entity");
let AuthService = class AuthService {
    usersRepo;
    modelRepo;
    jwtService;
    constructor(usersRepo, modelRepo, jwtService) {
        this.usersRepo = usersRepo;
        this.modelRepo = modelRepo;
        this.jwtService = jwtService;
    }
    async onModuleInit() {
        await this.seedDemoUsers();
    }
    async seedDemoUsers() {
        const demos = [
            {
                email: 'demo@marturbs.live',
                password: 'demo1234',
                name: 'Alex Premium',
                role: user_entity_1.UserRole.CLIENT,
                credits: 450,
            },
            {
                email: 'model@marturbs.live',
                password: 'demo1234',
                name: 'Valentina Noir',
                role: user_entity_1.UserRole.MODEL,
                credits: 0,
                username: 'valentina_noir',
            },
            {
                email: 'admin@marturbs.live',
                password: 'admin1234',
                name: 'Admin',
                role: user_entity_1.UserRole.ADMIN,
                credits: 0,
            },
        ];
        for (const d of demos) {
            const exists = await this.usersRepo.findOne({ where: { email: d.email } });
            if (!exists) {
                const user = await this.createUser(d);
                if (d.role === user_entity_1.UserRole.MODEL && 'username' in d) {
                    await this.modelRepo.save({
                        user,
                        userId: user.id,
                        username: d.username,
                        isOnline: true,
                        pricePerMinute: 12,
                        rating: 4.9,
                        reviewCount: 284,
                        bio: 'Experiencia exclusiva.',
                        tags: ['VIP', 'Español'],
                    });
                }
            }
        }
    }
    async register(dto) {
        const existing = await this.usersRepo.findOne({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing)
            throw new common_1.ConflictException('Email ya registrado');
        const user = await this.createUser({
            email: dto.email.toLowerCase(),
            password: dto.password,
            name: dto.name,
            role: dto.role,
            credits: dto.role === user_entity_1.UserRole.CLIENT ? 50 : 0,
        });
        if (dto.role === user_entity_1.UserRole.MODEL) {
            await this.modelRepo.save({
                user,
                userId: user.id,
                username: dto.username || dto.name.toLowerCase().replace(/\s/g, '_'),
                isOnline: false,
                pricePerMinute: 10,
                rating: 5,
                reviewCount: 0,
            });
        }
        return this.buildAuthResponse(user);
    }
    async login(dto) {
        const user = await this.usersRepo.findOne({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        return this.buildAuthResponse(user);
    }
    async createUser(data) {
        const hash = await bcrypt.hash(data.password, 10);
        return this.usersRepo.save({
            email: data.email,
            password: hash,
            name: data.name,
            role: data.role,
            credits: data.credits ?? 0,
        });
    }
    buildAuthResponse(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                credits: user.credits,
                avatar: user.avatar,
            },
        };
    }
    async validateUser(userId) {
        return this.usersRepo.findOne({ where: { id: userId } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(model_profile_entity_1.ModelProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map