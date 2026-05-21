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
exports.PayoutController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const payout_service_1 = require("./payout.service");
let PayoutController = class PayoutController {
    payoutService;
    constructor(payoutService) {
        this.payoutService = payoutService;
    }
    getConfig() {
        return this.payoutService.getConfig();
    }
    preview(req, amount) {
        const parsed = amount !== undefined ? Number(amount) : undefined;
        return this.payoutService.getWithdrawalPreview(req.user.id, Number.isFinite(parsed) ? parsed : undefined);
    }
    withdraw(req, amount) {
        return this.payoutService.requestWithdrawal(req.user.id, amount);
    }
};
exports.PayoutController = PayoutController;
__decorate([
    (0, common_1.Get)('payout/config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayoutController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)('models/me/withdrawal-preview'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PayoutController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('models/me/withdraw'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], PayoutController.prototype, "withdraw", null);
exports.PayoutController = PayoutController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [payout_service_1.PayoutService])
], PayoutController);
//# sourceMappingURL=payout.controller.js.map