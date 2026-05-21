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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const user_entity_1 = require("../entities/user.entity");
const model_profile_entity_1 = require("../entities/model-profile.entity");
const transaction_entity_1 = require("../entities/transaction.entity");
const sessions_service_1 = require("../sessions/sessions.service");
let AdminController = class AdminController {
    userRepo;
    modelRepo;
    txRepo;
    sessionsService;
    constructor(userRepo, modelRepo, txRepo, sessionsService) {
        this.userRepo = userRepo;
        this.modelRepo = modelRepo;
        this.txRepo = txRepo;
        this.sessionsService = sessionsService;
    }
    async stats() {
        const [users, models, transactions, sessions] = await Promise.all([
            this.userRepo.count(),
            this.modelRepo.count(),
            this.txRepo.count(),
            this.sessionsService.getAdminStats(),
        ]);
        const revenue = await this.txRepo
            .createQueryBuilder('t')
            .select('SUM(t.amount)', 'total')
            .where("t.type = 'purchase'")
            .getRawOne();
        return {
            totalUsers: users,
            totalModels: models,
            activeSessions: sessions.activeSessions,
            totalTransactions: transactions,
            revenueTotal: Number(revenue?.total ?? 0),
            onlineModels: await this.modelRepo.count({ where: { isOnline: true } }),
        };
    }
    users() {
        return this.userRepo.find({
            select: ['id', 'email', 'name', 'role', 'credits', 'createdAt'],
            take: 50,
            order: { createdAt: 'DESC' },
        });
    }
    transactions() {
        return this.txRepo.find({
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "users", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "transactions", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(model_profile_entity_1.ModelProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        sessions_service_1.SessionsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map