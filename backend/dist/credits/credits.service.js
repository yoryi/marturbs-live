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
exports.CreditsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const transaction_entity_1 = require("../entities/transaction.entity");
const PACKAGES = [
    { id: '1', credits: 100, price: 9.99, bonus: 0 },
    { id: '2', credits: 300, price: 24.99, bonus: 30 },
    { id: '3', credits: 600, price: 44.99, bonus: 100 },
    { id: '4', credits: 1200, price: 79.99, bonus: 300 },
    { id: '5', credits: 3000, price: 179.99, bonus: 1000 },
];
let CreditsService = class CreditsService {
    userRepo;
    txRepo;
    constructor(userRepo, txRepo) {
        this.userRepo = userRepo;
        this.txRepo = txRepo;
    }
    getPackages() {
        return PACKAGES;
    }
    async getBalance(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        return { credits: user?.credits ?? 0 };
    }
    async purchase(userId, packageId) {
        const pkg = PACKAGES.find((p) => p.id === packageId);
        if (!pkg)
            throw new common_1.BadRequestException('Paquete inválido');
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('Usuario no encontrado');
        const totalCredits = pkg.credits + pkg.bonus;
        user.credits += totalCredits;
        await this.userRepo.save(user);
        await this.txRepo.save({
            userId,
            type: transaction_entity_1.TransactionType.PURCHASE,
            amount: pkg.price,
            credits: totalCredits,
            status: 'completed',
        });
        return { credits: user.credits, added: totalCredits };
    }
    async deduct(userId, amount, sessionId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            return null;
        user.credits = Math.max(0, user.credits - amount);
        await this.userRepo.save(user);
        await this.txRepo.save({
            userId,
            type: transaction_entity_1.TransactionType.CALL,
            amount: 0,
            credits: -amount,
            status: 'completed',
        });
        return { credits: user.credits, sessionId };
    }
    async getTransactions(userId) {
        return this.txRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 20,
        });
    }
};
exports.CreditsService = CreditsService;
exports.CreditsService = CreditsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CreditsService);
//# sourceMappingURL=credits.service.js.map