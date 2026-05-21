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
exports.PayoutService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
let PayoutService = class PayoutService {
    config;
    transactionRepo;
    constructor(config, transactionRepo) {
        this.config = config;
        this.transactionRepo = transactionRepo;
    }
    getConfig() {
        return {
            platformFeePercent: this.getPlatformFeePercent(),
            processingDaysMin: this.getProcessingDaysMin(),
            processingDaysMax: this.getProcessingDaysMax(),
        };
    }
    async getAvailableBalance(userId) {
        const completedPayouts = await this.transactionRepo.find({
            where: { userId, type: transaction_entity_1.TransactionType.PAYOUT, status: 'completed' },
        });
        const withdrawn = completedPayouts.reduce((sum, t) => sum + Number(t.amount), 0);
        const grossEarned = 892_000;
        return Math.max(0, grossEarned - withdrawn);
    }
    async getWithdrawalPreview(userId, amount) {
        const availableBalance = await this.getAvailableBalance(userId);
        const grossAmount = amount !== undefined ? Math.min(amount, availableBalance) : availableBalance;
        if (grossAmount <= 0) {
            throw new common_1.BadRequestException('No hay saldo disponible para retirar');
        }
        const cfg = this.getConfig();
        const platformFeeAmount = Math.round((grossAmount * cfg.platformFeePercent) / 100);
        const netAmount = grossAmount - platformFeeAmount;
        return {
            ...cfg,
            availableBalance,
            grossAmount,
            platformFeeAmount,
            netAmount,
            currency: 'COP',
        };
    }
    async requestWithdrawal(userId, amount) {
        const preview = await this.getWithdrawalPreview(userId, amount);
        const payout = this.transactionRepo.create({
            userId,
            type: transaction_entity_1.TransactionType.PAYOUT,
            amount: preview.grossAmount,
            credits: 0,
            status: 'pending',
        });
        await this.transactionRepo.save(payout);
        return {
            ...preview,
            withdrawalId: payout.id,
            status: 'pending',
            message: `El desembolso se procesará en ${preview.processingDaysMin} a ${preview.processingDaysMax} días hábiles.`,
        };
    }
    getPlatformFeePercent() {
        const raw = this.config.get('PAYOUT_PLATFORM_FEE_PERCENT', 15);
        const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
        if (!Number.isFinite(n) || n < 0 || n > 100)
            return 15;
        return n;
    }
    getProcessingDaysMin() {
        const n = Number(this.config.get('PAYOUT_PROCESSING_DAYS_MIN', 2));
        return Number.isFinite(n) && n > 0 ? Math.floor(n) : 2;
    }
    getProcessingDaysMax() {
        const min = this.getProcessingDaysMin();
        const n = Number(this.config.get('PAYOUT_PROCESSING_DAYS_MAX', 3));
        const max = Number.isFinite(n) && n > 0 ? Math.floor(n) : 3;
        return max >= min ? max : min;
    }
};
exports.PayoutService = PayoutService;
exports.PayoutService = PayoutService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], PayoutService);
//# sourceMappingURL=payout.service.js.map