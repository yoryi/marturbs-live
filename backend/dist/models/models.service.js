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
exports.ModelsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const model_profile_entity_1 = require("../entities/model-profile.entity");
const user_entity_1 = require("../entities/user.entity");
let ModelsService = class ModelsService {
    modelRepo;
    userRepo;
    constructor(modelRepo, userRepo) {
        this.modelRepo = modelRepo;
        this.userRepo = userRepo;
    }
    async findAll(onlineOnly = false) {
        const where = onlineOnly ? { isOnline: true } : {};
        const models = await this.modelRepo.find({
            where,
            relations: ['user'],
        });
        return models.map((m) => this.formatModel(m));
    }
    async findOne(id) {
        const model = await this.modelRepo.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!model)
            throw new common_1.NotFoundException('Modelo no encontrada');
        return this.formatModel(model);
    }
    async findByUserId(userId) {
        return this.modelRepo.findOne({
            where: { userId },
            relations: ['user'],
        });
    }
    async setOnline(userId, isOnline) {
        const profile = await this.findByUserId(userId);
        if (!profile)
            throw new common_1.NotFoundException('Perfil de modelo no encontrado');
        profile.isOnline = isOnline;
        await this.modelRepo.save(profile);
        return profile;
    }
    async updatePrice(userId, pricePerMinute) {
        const profile = await this.findByUserId(userId);
        if (!profile)
            throw new common_1.NotFoundException('Perfil de modelo no encontrado');
        profile.pricePerMinute = pricePerMinute;
        await this.modelRepo.save(profile);
        return profile;
    }
    async getDashboardStats(userId) {
        const profile = await this.findByUserId(userId);
        return {
            earningsToday: 1240,
            earningsMonth: 18450,
            sessionsToday: 7,
            hoursLive: 4.2,
            isOnline: profile?.isOnline ?? false,
            pricePerMinute: profile?.pricePerMinute ?? 10,
        };
    }
    formatModel(m) {
        return {
            id: m.id,
            userId: m.userId,
            name: m.user?.name,
            username: m.username,
            avatar: m.user?.avatar,
            cover: m.coverImage,
            isOnline: m.isOnline,
            pricePerMinute: Number(m.pricePerMinute),
            rating: Number(m.rating),
            reviewCount: m.reviewCount,
            tags: m.tags ?? [],
            bio: m.bio,
        };
    }
    async seedIfEmpty() {
        const count = await this.modelRepo.count();
        if (count > 0)
            return;
    }
};
exports.ModelsService = ModelsService;
exports.ModelsService = ModelsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(model_profile_entity_1.ModelProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ModelsService);
//# sourceMappingURL=models.service.js.map