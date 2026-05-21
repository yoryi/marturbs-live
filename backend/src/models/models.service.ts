import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelProfile } from '../entities/model-profile.entity';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(ModelProfile) private modelRepo: Repository<ModelProfile>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findAll(onlineOnly = false) {
    const where = onlineOnly ? { isOnline: true } : {};
    const models = await this.modelRepo.find({
      where,
      relations: ['user'],
    });
    return models.map((m) => this.formatModel(m));
  }

  async findOne(id: string) {
    const model = await this.modelRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!model) throw new NotFoundException('Modelo no encontrada');
    return this.formatModel(model);
  }

  async findByUserId(userId: string) {
    return this.modelRepo.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async setOnline(userId: string, isOnline: boolean) {
    const profile = await this.findByUserId(userId);
    if (!profile) throw new NotFoundException('Perfil de modelo no encontrado');
    profile.isOnline = isOnline;
    await this.modelRepo.save(profile);
    return profile;
  }

  async updatePrice(userId: string, pricePerMinute: number) {
    const profile = await this.findByUserId(userId);
    if (!profile) throw new NotFoundException('Perfil de modelo no encontrado');
    profile.pricePerMinute = pricePerMinute;
    await this.modelRepo.save(profile);
    return profile;
  }

  async getDashboardStats(userId: string) {
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

  private formatModel(m: ModelProfile) {
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
    if (count > 0) return;
    // Seeded via auth demo user
  }
}
