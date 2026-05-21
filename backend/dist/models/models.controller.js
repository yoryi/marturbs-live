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
exports.ModelsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const models_service_1 = require("./models.service");
let ModelsController = class ModelsController {
    modelsService;
    constructor(modelsService) {
        this.modelsService = modelsService;
    }
    findAll(online) {
        return this.modelsService.findAll(online === 'true');
    }
    dashboard(req) {
        return this.modelsService.getDashboardStats(req.user.id);
    }
    setOnline(req, isOnline) {
        return this.modelsService.setOnline(req.user.id, isOnline);
    }
    setPrice(req, pricePerMinute) {
        return this.modelsService.updatePrice(req.user.id, pricePerMinute);
    }
    findOne(id) {
        return this.modelsService.findOne(id);
    }
};
exports.ModelsController = ModelsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('online')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ModelsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me/dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ModelsController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Patch)('me/online'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('isOnline')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", void 0)
], ModelsController.prototype, "setOnline", null);
__decorate([
    (0, common_1.Patch)('me/price'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('pricePerMinute')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], ModelsController.prototype, "setPrice", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ModelsController.prototype, "findOne", null);
exports.ModelsController = ModelsController = __decorate([
    (0, common_1.Controller)('models'),
    __metadata("design:paramtypes", [models_service_1.ModelsService])
], ModelsController);
//# sourceMappingURL=models.controller.js.map