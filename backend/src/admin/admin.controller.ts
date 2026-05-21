import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { ModelProfile } from '../entities/model-profile.entity';
import { Transaction } from '../entities/transaction.entity';
import { SessionsService } from '../sessions/sessions.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(ModelProfile) private modelRepo: Repository<ModelProfile>,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    private sessionsService: SessionsService,
  ) {}

  @Get('stats')
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

  @Get('users')
  users() {
    return this.userRepo.find({
      select: ['id', 'email', 'name', 'role', 'credits', 'createdAt'],
      take: 50,
      order: { createdAt: 'DESC' },
    });
  }

  @Get('transactions')
  transactions() {
    return this.txRepo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
